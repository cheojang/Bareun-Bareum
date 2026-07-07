import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ⚠️ 일회용: admin3@admin.com 을 유료회원으로 전환 (결제 우회, 수동 부여).
 *
 * Subscription(plan=premium, status=active, currentPeriodEnd=null) →
 * subHasActivePremium()이 무기한 프리미엄으로 판정하는 기존 경로 사용.
 * CRON_SECRET 보호·멱등. 실행·검증 후 이 파일 삭제.
 */

const EMAIL = "admin3@admin.com";

async function run(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: EMAIL }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: `${EMAIL} 계정이 없습니다` }, { status: 404 });
  }

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, plan: "premium", status: "active", currentPeriodEnd: null },
    update: { plan: "premium", status: "active", currentPeriodEnd: null },
  });

  return NextResponse.json({
    ok: true,
    email: EMAIL,
    tier: "premium",
    note: "무기한 프리미엄(수동 부여). 이 엔드포인트는 확인 후 삭제.",
  });
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}
