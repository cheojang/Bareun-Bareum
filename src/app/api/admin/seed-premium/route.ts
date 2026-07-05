import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { recordConsent } from "@/lib/consent";

export const dynamic = "force-dynamic";

/**
 * ⚠️ 일회용 유료회원 테스트 계정 강제 등록 (정상 가입·결제 우회).
 *
 * admin4@admin.com 을 프리미엄으로 생성: Subscription(plan=premium, status=active,
 * currentPeriodEnd=null) → subHasActivePremium()이 무기한 프리미엄으로 판정하는
 * 기존 수동 부여 경로 사용. CRON_SECRET 보호, 멱등. 사용 후 파일 삭제.
 */

const PASSWORD = "admin123!@#";
const EMAIL = "admin4@admin.com";

async function seed(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hash = await bcrypt.hash(PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    create: { email: EMAIL, name: "관리자4", password: hash, role: "parent", trialEndsAt: null },
    update: { password: hash, trialEndsAt: null },
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, plan: "premium", status: "active", currentPeriodEnd: null },
    update: { plan: "premium", status: "active", currentPeriodEnd: null },
  });

  try { await recordConsent(user.id); } catch { /* 무시 */ }

  return NextResponse.json({
    ok: true,
    tier: "premium",
    account: { email: EMAIL, id: user.id, password: PASSWORD },
    note: "무기한 프리미엄(수동 부여). 사용 후 이 엔드포인트 삭제.",
  });
}

export async function GET(req: NextRequest) {
  return seed(req);
}
export async function POST(req: NextRequest) {
  return seed(req);
}
