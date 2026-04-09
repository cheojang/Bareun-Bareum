import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TossPayments sends webhook events for subscription status changes
export async function POST(req: NextRequest) {
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
