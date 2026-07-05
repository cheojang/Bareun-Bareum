import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { recordConsent } from "@/lib/consent";

export const dynamic = "force-dynamic";

/**
 * ⚠️ 일회용 관리자 계정 강제 등록 엔드포인트 (정상 가입 우회).
 *
 * 정상 회원가입(/signup)은 이메일 인증코드를 요구하므로 admin@admin.com 같은
 * 가짜 도메인으로는 계정을 만들 수 없다. 이 엔드포인트는 DB에 직접(upsert)
 * bcrypt 해시 비밀번호로 계정을 심어 이메일 로그인으로 바로 접속 가능하게 한다.
 *
 * 보안:
 * - CRON_SECRET 로 보호 (?secret=... 일치해야 실행). 환경변수 없으면 거부.
 * - 무료회원 등급으로 생성(trialEndsAt=null → getAccessInfo가 "free" 반환).
 * - 멱등(upsert): 여러 번 호출해도 안전, 비밀번호/등급 재설정.
 *
 * 사용 후: 이 파일을 삭제하는 것을 권장(일회성).
 *
 * 호출 예: https://sori-care.com/api/admin/seed-accounts?secret=<CRON_SECRET>
 */

const PASSWORD = "admin123!@#";
const ACCOUNTS = [
  { email: "admin2@admin.com", name: "관리자2" },
  { email: "admin3@admin.com", name: "관리자3" },
];

async function seed(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hash = await bcrypt.hash(PASSWORD, 12);
  const results: { email: string; id: string }[] = [];

  for (const acc of ACCOUNTS) {
    const email = acc.email.toLowerCase();
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: acc.name,
        password: hash,
        role: "parent",
        trialEndsAt: null, // 무료회원 (체험 미부여)
      },
      update: {
        password: hash,
        trialEndsAt: null, // 재실행 시 무료회원 유지 + 비밀번호 리셋
      },
    });
    // 약관 동의 기록 → 첫 로그인 시 /consent 로 튕기지 않게 (실패해도 무시)
    try {
      await recordConsent(user.id);
    } catch {
      /* consent 테이블 이슈 무시 */
    }
    results.push({ email, id: user.id });
  }

  return NextResponse.json({
    ok: true,
    tier: "free",
    password: PASSWORD,
    accounts: results,
    note: "admin2/admin3 은 관리자 권한(admin-auth) 포함. 사용 후 이 엔드포인트 삭제 권장.",
  });
}

// 모바일 브라우저에서 URL만으로 실행 가능하도록 GET 허용 (일회용·보호됨)
export async function GET(req: NextRequest) {
  return seed(req);
}
export async function POST(req: NextRequest) {
  return seed(req);
}
