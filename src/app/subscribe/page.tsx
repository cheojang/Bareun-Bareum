import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { TossPaymentButton } from "@/components/billing/TossPaymentButton";
import { BubbleButton } from "@/components/ui/BubbleButton";
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

  const isPremiumActive =
    subscription?.plan === "premium" && subscription?.status === "active";
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
              다음 결제일 · {new Date(subscription.currentPeriodEnd).toLocaleDateString("ko-KR")}
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
              <p className="text-3xl font-black text-[#FFB38A]">월 5,000원</p>
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
              amount={5000}
              orderName="바른발음 프리미엄 구독"
            />
          )}
        </BubbleCard>
      </div>

      <p className="text-xs text-[#C4B5A8] text-center leading-relaxed">
        구독은 언제든지 취소할 수 있으며, 취소 후에도 기간 만료까지 이용 가능합니다.
      </p>
    </main>
  );
}
