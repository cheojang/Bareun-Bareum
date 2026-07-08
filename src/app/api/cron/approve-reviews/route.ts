import { NextRequest, NextResponse } from "next/server";
import { approveDueAll } from "@/lib/review-approval";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/approve-reviews — 후기 인증 자동 승인 크론 (매일).
 * 제출 후 2일이 지난 심사중(pending) 후기를 자동 승인하고 체험 기간을 연장한다.
 * (사용자가 페이지에 접근하면 GET /api/review-bonus 에서도 lazy로 동일 처리가 일어나며,
 *  이 크론은 페이지에 들어오지 않는 사용자를 위한 보장 장치)
 */
export async function GET(req: NextRequest) {
  // Vercel Cron은 CRON_SECRET 환경변수가 있으면 Bearer 토큰으로 보내줌
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await approveDueAll();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[cron/approve-reviews]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "실패" },
      { status: 500 },
    );
  }
}
