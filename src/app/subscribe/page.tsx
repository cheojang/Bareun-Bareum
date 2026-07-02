import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { TossPaymentButton } from "@/components/billing/TossPaymentButton";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { PREMIUM_MONTHLY_PRICE, PREMIUM_MONTHLY_PRICE_LABEL } from "@/lib/billing";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ failed?: string }>;
}

export default async function SubscribePage({ searchParams }: Props) {
  const { failed } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id ?? "";
  const isGuest = userId.startsWith("guest:");

  let subscription = null;
  let user = null;

  if (userId && !isGuest) {
    [subscription, user] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId },
        select: { status: true, plan: true, currentPeriodEnd: true },
      }),
      prisma.user
        .findUnique({ where: { id: userId }, select: { trialEndsAt: true } })
        .catch(() => null),
    ]);
  }

  // 단건(1개월) 결제 — active여도 만료일이 지나면 프리미엄이 아니므로 재결제를 열어준다.
  // (만료일 없는 active는 개발/수동 부여 계정 → 활성 유지)
  const isPremiumActive =
    subscription?.plan === "premium" &&
    subscription?.status === "active" &&
    (!subscription?.currentPeriodEnd ||
      new Date(subscription.currentPeriodEnd).getTime() > Date.now());
  const isCancelledButActive =
    subscription?.plan === "premium" &&
    subscription?.status === "cancelled" &&
    !!subscription?.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd).getTime() > Date.now();
  const trialActive =
    !isPremiumActive &&
    !isCancelledButActive &&
    !!user?.trialEndsAt &&
    new Date(user.trialEndsAt).getTime() > Date.now();
  const trialDaysLeft = trialActive
    ? Math.max(1, Math.ceil((new Date(user!.trialEndsAt!).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  return (
    <main
      className="min-h-dvh flex flex-col px-6 py-12 max-w-lg mx-auto"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">✨</div>
        <h2 className="text-3xl font-black text-[#3D3530]">프리미엄으로 업그레이드</h2>
        <p className="text-[#8B7E74] mt-2">아이의 발음 교정을 더 효과적으로!</p>
      </div>

      {/* 결제 실패 안내 */}
      {failed === "1" && (
        <div
          className="rounded-2xl px-4 py-3 text-sm text-center mb-4"
          style={{ backgroundColor: "#FFF0F0", border: "1.5px solid #FFBBBB", color: "#D05050" }}
        >
          결제가 취소되었거나 실패했어요. 다시 시도해주세요.
        </div>
      )}

      {/* 이미 프리미엄 활성 */}
      {isPremiumActive && (
        <BubbleCard color="mint" className="mb-4 text-center">
          <p className="text-2xl mb-2">✨</p>
          <p className="font-bold text-[#3D3530] mb-1">이미 프리미엄이에요!</p>
          {subscription?.currentPeriodEnd && (
            <p className="text-sm text-[#0D9488]">
              이용 기간 · {new Date(subscription.currentPeriodEnd).toLocaleDateString("ko-KR")}까지
            </p>
          )}
          <Link href="/dashboard/settings" className="mt-4 block">
            <BubbleButton variant="mint" className="w-full">설정에서 구독 관리하기 →</BubbleButton>
          </Link>
        </BubbleCard>
      )}

      {/* 취소됐지만 기간 내 */}
      {isCancelledButActive && (
        <div
          className="rounded-2xl px-4 py-3 text-sm text-center mb-4"
          style={{ backgroundColor: "#FFF5EE", border: "1.5px solid #FFD4B8" }}
        >
          <p className="font-bold text-[#3D3530] mb-0.5">구독이 취소되었어요</p>
          <p className="text-[#8B7E74]">
            {new Date(subscription!.currentPeriodEnd!).toLocaleDateString("ko-KR")}까지 프리미엄 이용 가능해요
          </p>
        </div>
      )}

      {/* 체험 중 안내 */}
      {trialActive && !isPremiumActive && (
        <div
          className="rounded-2xl px-4 py-3 text-sm text-center mb-4"
          style={{ backgroundColor: "#F0FAF8", border: "1.5px solid #A8D8CF" }}
        >
          <p className="font-semibold text-[#0D9488]">
            🎁 체험 {trialDaysLeft}일 남음 — 지금 등록하면 체험 기간 이후에도 계속 이용해요!
          </p>
        </div>
      )}

      {/* Plan cards */}
      <div className="space-y-4 mb-8">
        {/* Free */}
        <BubbleCard color="peach">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-black text-[#3D3530] text-lg">무료 플랜</p>
              <p className="text-[#8B7E74] text-sm">기본 기능 이용</p>
            </div>
            {!isPremiumActive && !isCancelledButActive && (
              <PastelBadge color="yellow">현재 이용 중</PastelBadge>
            )}
          </div>
          <ul className="space-y-1 text-sm text-[#8B7E74]">
            <li>✅ AI 조음 분석 (월 10회)</li>
            <li>✅ 단계별 반복 연습</li>
            <li>✅ 종합 진단 보고서</li>
            <li>❌ AI 분석 무제한</li>
          </ul>
        </BubbleCard>

        {/* Premium */}
        <BubbleCard className="border-2 border-[#FFB38A]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-black text-[#3D3530] text-lg">프리미엄 플랜</p>
              <p className="text-3xl font-black text-[#FFB38A]">월 {PREMIUM_MONTHLY_PRICE_LABEL}</p>
              <p className="text-xs text-[#C4B5A8] mt-0.5">1개월 이용권 · 자동결제 아님</p>
            </div>
            <PastelBadge color="peach">⭐ 추천</PastelBadge>
          </div>
          <ul className="space-y-1 text-sm text-[#3D3530] mb-4">
            <li>✅ AI 조음 분석 무제한</li>
            <li>✅ 단계별 반복 연습</li>
            <li>✅ 종합 진단 보고서</li>
          </ul>

          {isPremiumActive ? (
            <Link href="/dashboard/settings">
              <BubbleButton variant="mint" size="lg" className="w-full">
                ✨ 프리미엄 이용 중
              </BubbleButton>
            </Link>
          ) : (
            <TossPaymentButton
              userId={userId}
              amount={PREMIUM_MONTHLY_PRICE}
              orderName="바른발음 프리미엄 1개월 이용권"
            />
          )}
        </BubbleCard>
      </div>

      {/* 환불·청약철회 고지 (전자상거래법) */}
      <div className="rounded-2xl px-5 py-4 mb-4" style={{ backgroundColor: "#FAFAF8", border: "1px solid #F0E8E0" }}>
        <p className="text-xs font-bold text-[#8B7E74] mb-2">환불 및 청약철회 안내</p>
        <ul className="text-[11px] text-[#A89B8E] leading-relaxed space-y-1">
          <li>· 결제일로부터 7일 이내, 프리미엄 기능(AI 무제한 분석)을 사용하지 않은 경우 전액 환불됩니다.</li>
          <li>· 프리미엄 기능을 사용한 경우, 이용일수에 해당하는 금액을 제외하고 환불됩니다.</li>
          <li>· 이용권은 1개월 단위 결제이며 자동으로 갱신·재결제되지 않습니다.</li>
          <li>· 환불 문의: 설정 → 문의하기 또는 이메일로 접수해 주세요.</li>
        </ul>
      </div>

      <p className="text-xs text-[#C4B5A8] text-center leading-relaxed">
        이용권은 결제 즉시 시작되며, 만료일까지 모든 프리미엄 기능을 이용할 수 있습니다.
      </p>
    </main>
  );
}
