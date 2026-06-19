import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

/** 길이 노출 없이 상수시간으로 두 문자열 비교 (타이밍 사이드채널 방어) */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// TossPayments sends webhook events for subscription status changes
export async function POST(req: NextRequest) {
  // TossPayments 웹훅 서명 검증 (Basic Auth: base64(secretKey:))
  const authHeader = req.headers.get("Authorization");
  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    console.error("TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const expectedAuth = "Basic " + Buffer.from(`${secretKey}:`).toString("base64");
  if (!authHeader || !safeEqual(authHeader, expectedAuth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { eventType, data } = body;

  if (eventType === "PAYMENT_STATUS_CHANGED") {
    const { orderId, status } = data;

    if (status === "CANCELED" || status === "ABORTED") {
      const parts = typeof orderId === "string" ? orderId.split("_") : [];
      const userId = parts.length >= 2 ? parts[0] : null;
      if (!userId) {
        console.warn("[Webhook] orderId 형식 불일치:", orderId);
        return NextResponse.json({ received: true });
      }
      const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!userExists) {
        console.warn("[Webhook] orderId에서 추출한 userId가 존재하지 않음:", userId);
        return NextResponse.json({ received: true });
      }
      await prisma.subscription.updateMany({
        where: { userId },
        data: { status: "cancelled", plan: "free" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
