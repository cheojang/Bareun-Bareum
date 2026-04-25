import { auth } from "@/lib/auth";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { TossPaymentButton } from "@/components/billing/TossPaymentButton";

export default async function SubscribePage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

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

      {/* Plan cards */}
      <div className="space-y-4 mb-8">
        {/* Free */}
        <BubbleCard color="peach">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-black text-[#3D3530] text-lg">무료 플랜</p>
              <p className="text-[#8B7E74] text-sm">기본 기능 이용</p>
            </div>
            <PastelBadge color="yellow">현재 이용 중</PastelBadge>
          </div>
          <ul className="space-y-1 text-sm text-[#8B7E74]">
            <li>✅ 기본 단어 연습 (20개)</li>
            <li>✅ AI 조음 분석 (월 10회)</li>
            <li>✅ 종합 진단 보고서</li>
            <li>❌ AI 분석 무제한</li>
            <li>❌ 프리미엄 단어장</li>
          </ul>
        </BubbleCard>

        {/* Premium */}
        <BubbleCard
          className="border-2 border-[#FFB38A]"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-black text-[#3D3530] text-lg">프리미엄 플랜</p>
              <p className="text-3xl font-black text-[#FFB38A]">월 5,000원</p>
            </div>
            <PastelBadge color="peach">⭐ 추천</PastelBadge>
          </div>
          <ul className="space-y-1 text-sm text-[#3D3530] mb-4">
            <li>✅ AI 분석 무제한</li>
            <li>✅ 프리미엄 단어장 무제한</li>
            <li>✅ 성장 리포트 상세 분석</li>
            <li>✅ 연습 스케줄 알림</li>
            <li>✅ 첫 달 무료 체험</li>
          </ul>
          <TossPaymentButton
            userId={userId}
            amount={5000}
            orderName="바른발음 프리미엄 구독"
          />
        </BubbleCard>
      </div>

      <p className="text-xs text-[#C4B5A8] text-center leading-relaxed">
        구독은 언제든지 취소할 수 있으며, 취소 후에도 기간 만료까지 이용 가능합니다.
      </p>
    </main>
  );
}
