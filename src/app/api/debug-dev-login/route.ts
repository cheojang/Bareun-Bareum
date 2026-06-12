import { NextResponse } from "next/server";

// ⚠️ 임시 진단용 — 개발 로그인 환경변수 상태 확인 후 삭제 예정.
// 민감 값은 노출하지 않음 (ALLOW_DEV_LOGIN 값은 "1"이라 비밀이 아님).
export async function GET() {
  const allow = process.env.ALLOW_DEV_LOGIN;
  const pub = process.env.NEXT_PUBLIC_ALLOW_DEV_LOGIN;
  return NextResponse.json({
    ALLOW_DEV_LOGIN_equals_1: allow === "1",
    ALLOW_DEV_LOGIN_raw: allow === undefined ? null : JSON.stringify(allow), // 따옴표/공백 감지용
    NEXT_PUBLIC_ALLOW_DEV_LOGIN_equals_1: pub === "1",
    AUTH_SECRET_present: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
  });
}
