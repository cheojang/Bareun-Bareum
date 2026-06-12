import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ⚠️ 임시 진단용 — 개발 로그인 authorize의 실제 DB 경로를 재현해 진짜 에러를 노출. 확인 후 삭제.
export async function GET() {
  const env = {
    ALLOW_DEV_LOGIN_equals_1: process.env.ALLOW_DEV_LOGIN === "1",
    NEXT_PUBLIC_ALLOW_DEV_LOGIN_equals_1: process.env.NEXT_PUBLIC_ALLOW_DEV_LOGIN === "1",
    AUTH_SECRET_present: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
  };

  try {
    const email = "dev@test.com";
    let user = await prisma.user.findUnique({ where: { email } });
    const existed = !!user;
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: "개발자(부모)", role: "parent" },
      });
    }
    return NextResponse.json({ env, db: { ok: true, existed, userId: user.id } });
  } catch (e) {
    return NextResponse.json({
      env,
      db: {
        ok: false,
        name: e instanceof Error ? e.name : typeof e,
        message: e instanceof Error ? e.message : String(e),
      },
    });
  }
}
