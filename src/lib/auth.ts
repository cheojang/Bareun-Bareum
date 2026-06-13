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
              await Promise.allSettled([
                prisma.subscription.upsert({
                  where: { userId: user.id },
                  create: { userId: user.id, plan: "premium", status: "active" },
                  update: { plan: "premium", status: "active" },
                }),
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...devProvider,
    guestProvider,
    credentialsProvider,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
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
