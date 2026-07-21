import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueBillingKey, chargeSubscription } from "@/lib/toss-payments";
import { PREMIUM_MONTHLY_PRICE } from "@/lib/billing";
import Link from "next/link";
import { BubbleButton } from "@/components/ui/BubbleButton";

interface Props {
  searchParams: Promise<{ customerKey?: string; authKey?: string }>;
}

async function SuccessContent({ searchParams }: Props) {
  const { customerKey, authKey } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let errorMsg: string | null = null;

  if (customerKey && authKey) {
    try {
      // customerKey는 TossPaymentButton에서 `cus_${userId}`로 발급 — 본인 것인지 검증
      if (customerKey !== `cus_${session.user.id}`) {
        errorMsg = "카드 등록 정보가 올바르지 않아요";
      } else {
        // 1) 카드 등록 인증(authKey) → 정기결제용 빌링키 발급
        const { billingKey } = await issueBillingKey(customerKey, authKey);

        // 2) 등록 즉시 첫 달 결제 (정기결제는 "카드 등록 = 지금 바로 1회차 결제")
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        const orderId = `${session.user.id}_billing_${Date.now()}`;

        const payment = await chargeSubscription(
          billingKey,
          customerKey,
          PREMIUM_MONTHLY_PRICE,
          orderId,
          "바른발음 프리미엄 정기결제",
        );

        if (payment.totalAmount !== PREMIUM_MONTHLY_PRICE) {
          errorMsg = "결제 금액 검증에 실패했어요";
        } else {
          await prisma.subscription.upsert({
            where: { userId: session.user.id },
            create: {
              userId: session.user.id,
              plan: "premium",
              status: "active",
              tossCustomerKey: customerKey,
              tossBillingKey: billingKey,
              currentPeriodEnd: periodEnd,
              billingFailCount: 0,
            },
            update: {
              plan: "premium",
              status: "active",
              tossCustomerKey: customerKey,
              tossBillingKey: billingKey,
              currentPeriodEnd: periodEnd,
              billingFailCount: 0,
            },
          });
        }
      }
    } catch (e) {
      console.error("[subscribe/success] billing confirm error:", e);
      errorMsg = "결제 처리 중 오류가 발생했어요. 고객센터에 문의해주세요.";
    }
  } else {
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
        바른발음 프리미엄을 시작했어요. 매달 자동으로 결제되며, 설정에서 언제든 해지할 수 있어요.
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
