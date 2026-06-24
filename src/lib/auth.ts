import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// dev 로그인 provider — 항상 등록하되 authorize 내부에서 런타임 게이트.
// (조건부로 배열에서 빼면 ALLOW_DEV_LOGIN이 런타임에 1이어도 빌드 시점 평가/캐싱 때문에
//  provider 자체가 누락돼 NextAuth가 "Configuration" 에러를 던지는 문제가 있었음)
// 버튼 노출은 NEXT_PUBLIC_ALLOW_DEV_LOGIN으로 별도 게이트되므로 프로덕션 노출 위험 없음.
const devProvider = [
        Credentials({
          id: "dev",
          name: "개발자 로그인",
          credentials: { email: { label: "Email", type: "text" } },
          async authorize(credentials) {
            // 런타임 게이트: ALLOW_DEV_LOGIN=1 일 때만 동작
            if (process.env.ALLOW_DEV_LOGIN !== "1") {
              throw new Error("개발 로그인이 비활성화되어 있어요 (ALLOW_DEV_LOGIN).");
            }
            const email = (credentials?.email as string) ?? "dev@test.com";

            // 역할 결정: User.role = "parent" | "therapist"
            //           admin@test.com은 therapist + Therapist.role=owner 로 처리
            let userRole: "parent" | "therapist" = "parent";
            let therapistRole: "owner" | "staff" | null = null;
            let name = "개발자(부모)";
            let skipPremium = false;
            if (email === "free@test.com") {
              name = "개발자(무료)"; skipPremium = true;
            }
            if (email === "center@test.com") {
              userRole = "therapist"; therapistRole = "owner"; name = "개발자(센터장)";
            }
            // 하위 호환 — 기존 dev 이메일도 유지
            if (email === "therapist@test.com") {
              userRole = "therapist"; therapistRole = "staff"; name = "개발자(상담사)";
            }
            if (email === "admin@test.com") {
              userRole = "therapist"; therapistRole = "owner"; name = "개발자(상담소장)";
            }

            // ── 핵심 경로: 유저 조회/생성 (실패 시에만 로그인 차단) ──────────────────
            let user;
            try {
              user = await prisma.user.findUnique({ where: { email } });
              if (!user) {
                user = await prisma.user.create({ data: { email, name, role: userRole } });
              }
            } catch (e) {
              // 진짜 DB 오류(콜드스타트 등) — null 반환 시 CredentialsSignin으로 로그인 페이지 복귀
              console.error("[dev-auth] 유저 조회/생성 실패:", e instanceof Error ? e.message : e);
              return null;
            }

            // ── 부가 작업(best-effort): 실패해도 로그인은 진행 ─────────────────────────
            // (therapist 프로필 / 프리미엄 / 약관 동의 자동 기록 — 어느 하나 실패해도
            //  로그인 자체를 막지 않도록 별도 try/catch로 격리)
            try {
              if (therapistRole) {
                const existing = await prisma.therapist.findUnique({ where: { userId: user.id } });
                if (!existing) {
                  let devCenter = await prisma.center.findFirst({ where: { name: "[개발용] 테스트 센터" } });
                  if (!devCenter) {
                    devCenter = await prisma.center.create({
                      data: { name: "[개발용] 테스트 센터", inviteCode: "DEVTEST" },
                    });
                  }
                  await prisma.therapist.create({
                    data: { userId: user.id, centerId: devCenter.id, name, role: therapistRole },
                  });
                  await prisma.user.update({ where: { id: user.id }, data: { role: userRole } });
                }
              }

              const now = new Date();
              const subscriptionOps = skipPremium ? [] : [
                prisma.subscription.upsert({
                  where: { userId: user.id },
                  create: { userId: user.id, plan: "premium", status: "active" },
                  update: { plan: "premium", status: "active" },
                }),
              ];
              await Promise.allSettled([
                ...subscriptionOps,
                prisma.userConsent.upsert({
                  where: { userId: user.id },
                  create: { userId: user.id, termsAgreedAt: now, privacyAgreedAt: now },
                  update: {},
                }),
              ]);
            } catch (e) {
              console.warn("[dev-auth] 부가 설정 실패(로그인은 계속):", e instanceof Error ? e.message : e);
            }

            return { id: user.id, email: user.email, name: user.name };
          },
        }),
      ];

// ── 비회원 (게스트) 로그인 ──────────────────────────────────────────────────────
const guestProvider = Credentials({
  id: "guest",
  name: "비회원",
  credentials: {},
  async authorize() {
    // 세션마다 고유 UUID — 고정 "guest" ID 공유 시 데이터 섞임 방지
    const { randomUUID } = await import("crypto");
    return { id: `guest:${randomUUID()}`, email: "guest@temp", name: "비회원" };
  },
});

// ── 이메일/비밀번호 로그인 ──────────────────────────────────────────────────────
const credentialsProvider = Credentials({
  id: "credentials",
  name: "이메일 로그인",
  credentials: {
    email: { label: "이메일", type: "email" },
    password: { label: "비밀번호", type: "password" },
  },
  async authorize(credentials) {
    const email = (credentials?.email as string)?.trim().toLowerCase();
    const password = credentials?.password as string;
    if (!email || !password) return null;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    return { id: user.id, email: user.email, name: user.name };
  },
});

// 표준 PrismaAdapter를 쓰되, 과거 실패한 OAuth 로그인이 남긴 "잘못된 Account 행"
// 때문에 OAuthAccountNotLinked가 발생하던 문제를 어댑터 레벨에서 자동 치유한다.
// (getUserByAccount/getUserByEmail은 표준 동작 유지 — 그래야 이미 연결된 사용자가
//  매번 신규가입(isNewUser) 취급되지 않고 바로 로그인된다.)
// 이메일 매칭 자동연결은 각 provider의 allowDangerousEmailAccountLinking으로 처리.
const baseAdapter = PrismaAdapter(prisma);
const accountLinkingAdapter = {
  ...baseAdapter,
  // ⭐ 로그인 페이지에서 구글/카카오 클릭은 "기존 세션에 계정 연결"이 아니라
  //   "그 OAuth 신원으로 로그인"이어야 한다. JWT 모드에서 adapter.getUser는 오직
  //   sign-in 시 기존 sessionToken의 유저를 채우는 데만 쓰이므로, null로 만들면
  //   handle-login이 OAuth 로그인을 항상 "비로그인 상태의 새 로그인"으로 처리해
  //   'The account is already associated with another user' 충돌이 사라진다.
  //   (개발용 로그인 등으로 남아 있던 세션 쿠키가 있어도 안전하게 OAuth 로그인 가능)
  getUser: async (_id: string) => null,
  // 같은 이메일 유저가 이미 있으면 재사용(중복 생성 방지). id는 DB가 생성하도록 제거.
  createUser: async ({ id: _id, ...data }: { id?: string; email: string; name?: string | null; image?: string | null; emailVerified?: Date | null }) => {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return existing;
    return prisma.user.create({ data });
  },
  // create 대신 upsert → 기존에 다른 userId로 박혀 있던 Account 행을 올바르게 덮어써
  // PK 충돌(=OAuthAccountNotLinked의 원인)를 자동 해소한다.
  linkAccount: async (account: {
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    [key: string]: unknown;
  }) => {
    const { provider, providerAccountId, userId, ...rest } = account;
    await prisma.account.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: account as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { userId, ...rest } as any,
    });
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: accountLinkingAdapter,
  // 로그인 유지: JWT 세션을 90일간 보존(기본 30일에서 연장). updateAge로 활동 시
  // 만료를 슬라이딩 갱신 → 자주 쓰면 사실상 로그아웃 안 됨.
  session: {
    strategy: "jwt",
    maxAge: 90 * 24 * 60 * 60, // 90일
    updateAge: 24 * 60 * 60, // 하루 1회 만료 갱신
  },
  providers: [
    ...devProvider,
    guestProvider,
    credentialsProvider,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) token.id = user.id;
      const userId = token.id as string | undefined;
      // role을 JWT에 캐시 — 매 요청마다 DB 조회하던 것을 로그인 시 1회로 줄임
      // (role 변경 시 session.update() 호출 또는 재로그인으로 갱신)
      if (userId && (token.role === undefined || trigger === "update")) {
        if (userId.startsWith("guest:")) {
          token.role = "parent";
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "parent";
        }
      }
      return token;
    },
    async session({ session, user, token }) {
      const userId = user?.id ?? (token?.id as string);
      if (session.user && userId) {
        session.user.id = userId;
        session.user.isGuest = userId.startsWith("guest:");
        session.user.role = (token?.role as string) ?? "parent";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    error: "/login",
  },
  events: {
    // OAuth(구글/카카오) 신규 가입자에게도 7일 프리미엄 체험 부여 (이메일 가입은 signup API에서 처리)
    async createUser({ user }) {
      if (!user.id) return;
      try {
        const { computeTrialEndsAt } = await import("@/lib/usage-limit");
        await prisma.user.update({
          where: { id: user.id },
          data: { trialEndsAt: computeTrialEndsAt() },
        });
      } catch (e) {
        console.warn("[auth] 체험 부여 실패:", e instanceof Error ? e.message : e);
      }
    },
  },
});
