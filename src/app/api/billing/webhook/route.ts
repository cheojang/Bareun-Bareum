import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { eventType, data } = body;

  if (eventType === "PAYMENT_STATUS_CHANGED") {
    const { orderId, status } = data;

    if (status === "CANCELED" || status === "ABORTED") {
      // Find subscription by orderId convention (userId prefix)
      const userId = orderId.split("_")[0];
      if (userId) {
        await prisma.subscription.updateMany({
          where: { userId },
          data: { status: "cancelled", plan: "free" },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
