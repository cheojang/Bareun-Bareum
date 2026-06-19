import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confirmPayment } from "@/lib/toss-payments";

// 서버에서만 신뢰하는 플랜 가격 — 클라이언트가 보낸 amount는 검증용으로만 사용
const PREMIUM_MONTHLY_PRICE = 5000;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentKey, orderId, amount } = await req.json();

  if (!paymentKey || !orderId || typeof amount !== "number") {
    return NextResponse.json({ error: "Missing payment data" }, { status: 400 });
  }

  // orderId는 `${userId}_${timestamp}` 형식 — 결제 주문이 인증된 본인 소유인지 검증.
  // (타인의 미승인 paymentKey/orderId를 가로채 본인 계정에 프리미엄을 붙이는 것 차단)
  if (typeof orderId !== "string" || !orderId.startsWith(`${session.user.id}_`)) {
    return NextResponse.json({ error: "Invalid order" }, { status: 403 });
  }

  // 클라이언트가 보낸 amount가 서버 가격과 일치하는지 검증 (변조 방지)
  if (amount !== PREMIUM_MONTHLY_PRICE) {
    return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
  }

  // Toss에 서버 신뢰값으로만 결제 승인 요청
  const payment = await confirmPayment({
    paymentKey,
    orderId,
    amount: PREMIUM_MONTHLY_PRICE,
  });

  // Toss 응답의 실제 결제 금액 재검증 (이중 방어)
  if (payment.totalAmount !== PREMIUM_MONTHLY_PRICE) {
    console.error("[billing/confirm] amount mismatch", {
      userId: session.user.id,
      orderId,
      expected: PREMIUM_MONTHLY_PRICE,
      got: payment.totalAmount,
    });
    return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
  }

  // Upsert subscription
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      plan: "premium",
      status: "active",
      currentPeriodEnd: periodEnd,
    },
    update: {
      plan: "premium",
      status: "active",
      currentPeriodEnd: periodEnd,
    },
  });

  return NextResponse.json({ success: true, payment });
}
