import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confirmPayment } from "@/lib/toss-payments";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentKey, orderId, amount } = await req.json();

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ error: "Missing payment data" }, { status: 400 });
  }

  // Confirm with TossPayments
  const payment = await confirmPayment({ paymentKey, orderId, amount });

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
