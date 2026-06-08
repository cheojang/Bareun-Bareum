import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// dev 로그인: ALLOW_DEV_LOGIN=1 이면 활성 (로컬 및 스테이징 테스트용)
const IS_DEV_LOGIN_ENABLED = process.env.ALLOW_DEV_LOGIN === "1";

const devProvider = IS_DEV_LOGIN_ENABLED
  ? [
        Credentials({
          id: "dev",
          name: "개발자 로그인",
          credentials: { email: { label: "Email", type: "text" } },
          async authorize(credentials) {
            // 런타임 재검증 (런타임에 env가 바뀌었거나 빌드 타임 평가 우회 방지)
            if (process.env.ALLOW_DEV_LOGIN !== "1") {
              return null;
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

            // DB에 없으면 자동 생성
            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
              user = await prisma.user.create({ data: { email, name, role: userRole } });
            }

            // therapist 계정이면 Therapist 프로필 자동 생성
            if (therapistRole && user) {
              const existing = await prisma.therapist.findUnique({ where: { userId: user.id } });
              if (!existing) {
                // 개발용 센터 자동 생성
                let devCenter = await prisma.center.findFirst({ where: { name: "[개발용] 테스트 센터" } });
                if (!devCenter) {
                  devCenter = await prisma.center.create({
                    data: { name: "[개발용] 테스트 센터", inviteCode: "DEVTEST" },
                  });
                }
                await prisma.therapist.create({
                  data: {
                    userId: user.id,
                    centerId: devCenter.id,
                    name,
                    role: therapistRole,
                  },
                });
                await prisma.user.update({ where: { id: user.id }, data: { role: userRole } });
              }
            }

            return { id: user.id, email: user.email, name: user.name };
          },
        }),
      ]
  : [];

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
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, user, token }) {
      const userId = user?.id ?? (token?.id as string);
      if (session.user && userId) {
        session.user.id = userId;
        if (userId?.startsWith("guest:")) {
          session.user.isGuest = true;
          session.user.role = "parent";
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          });
          session.user.role = dbUser?.role ?? "parent";
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
});
