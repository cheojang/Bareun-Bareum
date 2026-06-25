import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  if (session.user.isGuest) {
    return NextResponse.json({ error: "회원만 이용할 수 있어요" }, { status: 403 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { status: true, plan: true, currentPeriodEnd: true },
  });

  if (!sub || sub.plan !== "premium" || sub.status !== "active") {
    return NextResponse.json({ error: "취소할 수 있는 구독이 없어요" }, { status: 400 });
  }

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: { status: "cancelled" },
  });

  return NextResponse.json({
    success: true,
    currentPeriodEnd: sub.currentPeriodEnd,
  });
}
