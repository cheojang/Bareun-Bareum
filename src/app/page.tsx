import Link from "next/link";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { SoriMascot, SoriLogo } from "@/components/ui/SoriMascot";

export default function LandingPage() {
  return (
    <main
      className="min-h-dvh flex flex-col"
      style={{ background: "linear-gradient(160deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <SoriLogo size={38} />
          <div>
            <span className="text-xl font-black text-[#3D3530] leading-none block">소리</span>
            <span className="text-[10px] text-[#C4B5A8] font-semibold tracking-wide">발음 홈케어</span>
          </div>
        </div>
        <Link href="/login">
          <BubbleButton variant="white" size="sm">로그인</BubbleButton>
        </Link>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        {/* Animated mascot */}
        <div className="animate-float mb-6 drop-shadow-lg">
          <SoriMascot size={150} variant="full" animated />
        </div>

        <h1 className="text-4xl font-black text-[#3D3530] leading-tight mb-4">
          발음 연습,<br />
          <span style={{ color: "#FFB38A" }}>놀이처럼</span> 즐겁게!
        </h1>
        <p className="text-lg text-[#8B7E74] mb-8 max-w-xs leading-relaxed">
          집에서 부모님과 함께하는<br />
          아동 조음 교정 홈케어 서비스
        </p>
        <Link href="/login">
          <BubbleButton size="lg" variant="peach" className="shadow-lg">
            무료로 시작하기 🎉
          </BubbleButton>
        </Link>
        <p className="text-sm text-[#C4B5A8] mt-4">카카오 · 구글로 3초 가입</p>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="px-6 pb-12 grid gap-4 max-w-lg mx-auto w-full">
        <FeatureCard
          emoji="👂"
          title="부모가 직접 입력"
          desc="아이 발음을 부모님이 귀로 듣고 직접 입력해요. 기계보다 정확해요!"
        />
        <FeatureCard
          emoji="🧠"
          title="AI 조음 분석"
          desc="한국어 음운 분석으로 정확한 오류를 찾고 쉬운 교정 가이드를 드려요."
        />
        <FeatureCard
          emoji="🎮"
          title="게임처럼 재미있게"
          desc="별가루 효과와 캐릭터 성장으로 아이가 스스로 연습하고 싶어해요!"
        />
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 max-w-lg mx-auto w-full">
        <BubbleCard color="peach" className="text-center">
          <p className="text-2xl font-black text-[#3D3530] mb-2">월 9,900원</p>
          <p className="text-[#8B7E74] text-sm">프리미엄 단어장 무제한 이용 · 첫 달 무료</p>
          <Link href="/login" className="mt-4 block">
            <BubbleButton variant="peach" className="w-full mt-4">시작하기</BubbleButton>
          </Link>
        </BubbleCard>
      </section>

      {/* 푸터 */}
      <footer className="text-center py-8 px-5 border-t border-[#F0E8E0]">
        <p className="text-xs text-[#C4B5A8] mb-3">
          바른발음은 학습 보조 도구이며 의료기기가 아닙니다.<br />
          발음 문제가 우려되면 전문 언어재활사와 상담하세요.
        </p>
        <div className="flex justify-center gap-4 text-xs text-[#8B7E74]">
          <Link href="/terms" className="hover:underline">이용약관</Link>
          <Link href="/privacy" className="hover:underline">개인정보 처리방침</Link>
        </div>
        <p className="text-xs text-[#C4B5A8] mt-3">© 2026 바른발음</p>
      </footer>
    </main>
  );
}

function FeatureCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <BubbleCard className="flex items-start gap-4">
      <span className="text-3xl flex-shrink-0">{emoji}</span>
      <div>
        <h3 className="font-bold text-[#3D3530] mb-1">{title}</h3>
        <p className="text-sm text-[#8B7E74] leading-relaxed">{desc}</p>
      </div>
    </BubbleCard>
  );
}
