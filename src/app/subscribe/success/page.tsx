import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confirmPayment } from "@/lib/toss-payments";
import Link from "next/link";
import { BubbleButton } from "@/components/ui/BubbleButton";

const PREMIUM_MONTHLY_PRICE = 5000;

interface Props {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}

async function SuccessContent({ searchParams }: Props) {
  const { paymentKey, orderId, amount } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let errorMsg: string | null = null;

  if (paymentKey && orderId && amount) {
    try {
      if (!orderId.startsWith(`${session.user.id}_`)) {
        errorMsg = "결제 정보가 올바르지 않아요";
      } else {
        const amountNum = parseInt(amount);
        if (amountNum !== PREMIUM_MONTHLY_PRICE) {
          errorMsg = "결제 금액이 올바르지 않아요";
        } else {
          const payment = await confirmPayment({
            paymentKey,
            orderId,
            amount: PREMIUM_MONTHLY_PRICE,
          });

          if (payment.totalAmount !== PREMIUM_MONTHLY_PRICE) {
            errorMsg = "결제 금액 검증에 실패했어요";
          } else {
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
          }
        }
      }
    } catch (e) {
      console.error("[subscribe/success] confirm error:", e);
      errorMsg = "결제 처리 중 오류가 발생했어요. 고객센터에 문의해주세요.";
    }
  } else if (!paymentKey) {
    // 파라미터 없이 직접 접근
    redirect("/subscribe");
  }

  if (errorMsg) {
    return (
      <main
        className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: "var(--color-bg-primary)" }}
      >
        <div className="text-8xl mb-6">😢</div>
        <h2 className="text-3xl font-black text-[#3D3530] mb-3">결제 실패</h2>
        <p className="text-[#8B7E74] mb-8 max-w-xs leading-relaxed">{errorMsg}</p>
        <Link href="/subscribe">
          <BubbleButton variant="peach" size="lg">다시 시도하기</BubbleButton>
        </Link>
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="text-8xl mb-6 animate-bounce-in">🎉</div>
      <h2 className="text-3xl font-black text-[#3D3530] mb-3">구독 완료!</h2>
      <p className="text-[#8B7E74] mb-8 max-w-xs leading-relaxed">
        바른발음 프리미엄을 시작했어요. 아이와 함께 신나게 연습해보세요!
      </p>
      <Link href="/dashboard">
        <BubbleButton variant="peach" size="lg">연습 시작하기 🚀</BubbleButton>
      </Link>
    </main>
  );
}

export default function SuccessPage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center text-[#8B7E74]">
          결제 처리 중...
        </div>
      }
    >
      <SuccessContent {...props} />
    </Suspense>
  );
}
