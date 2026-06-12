"use client";

import { useState } from "react";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

/**
 * 약관·개인정보 동의 페이지.
 * 첫 로그인(가입) 후 동의 기록이 없는 회원에게 1회만 표시됩니다.
 * 동의 일시는 DB(UserConsent)에 저장되어 법적 입증 자료가 됩니다.
 */
export default function ConsentPage() {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canSubmit = terms && privacy;

  async function handleSubmit() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/consent", { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "오류가 발생했어요. 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(160deg, #FFF5EE 0%, #F0FAF8 60%, #EDE9FE 100%)" }}
    >
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📋</div>
        <h1 className="text-2xl font-black text-[#3D3530]">약관에 동의해주세요</h1>
        <p className="text-[#8B7E74] mt-2 text-sm">
          서비스 이용을 위해 한 번만 동의하면 돼요
        </p>
      </div>

      <BubbleCard className="w-full max-w-sm">
        <div className="bg-[#FFF5EE] border-l-4 border-[#FFB38A] rounded-r-lg px-4 py-3 mb-5">
          <p className="text-xs font-bold text-[#3D3530] mb-1">⚠️ 중요 안내</p>
          <p className="text-xs text-[#8B7E74] leading-relaxed">
            바른발음은 가정 학습 보조 도구이며, 의료 서비스가 아닙니다.
            발음에 우려가 있으면 반드시 언어재활사와 상담하세요.
          </p>
        </div>

        {/* 전체 동의 */}
        <label className="flex items-center gap-3 cursor-pointer bg-[#FFF5EE] hover:bg-[#FFE8D6] px-4 py-3 rounded-xl mb-3 transition-colors">
          <input
            type="checkbox"
            checked={canSubmit}
            onChange={(e) => { setTerms(e.target.checked); setPrivacy(e.target.checked); }}
            className="w-5 h-5 accent-[#FFB38A] flex-shrink-0"
          />
          <span className="text-sm font-bold text-[#3D3530]">아래 약관에 모두 동의합니다</span>
        </label>

        {/* 이용약관 */}
        <label className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl mb-2 hover:bg-[#FAFAF8] transition-colors">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="w-5 h-5 accent-[#FFB38A] flex-shrink-0"
          />
          <span className="text-sm text-[#3D3530] flex-1">이용약관 동의 <span className="text-[#FFB38A]">*</span></span>
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-xs text-[#FFB38A] hover:underline flex-shrink-0">보기</a>
        </label>

        {/* 개인정보 */}
        <label className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl mb-5 hover:bg-[#FAFAF8] transition-colors">
          <input
            type="checkbox"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
            className="w-5 h-5 accent-[#FFB38A] flex-shrink-0"
          />
          <span className="text-sm text-[#3D3530] flex-1">개인정보 처리방침 동의 <span className="text-[#FFB38A]">*</span></span>
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-[#FFB38A] hover:underline flex-shrink-0">보기</a>
        </label>

        {error && (
          <p className="text-xs text-[#EF4444] font-semibold text-center mb-3">{error}</p>
        )}

        <BubbleButton
          variant="peach"
          size="lg"
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
          className="w-full"
        >
          {loading ? "저장 중..." : "동의하고 시작하기"}
        </BubbleButton>

        {!canSubmit && (
          <p className="text-xs text-center text-[#C4B5A8] mt-3">필수 약관에 동의하면 시작할 수 있어요</p>
        )}
      </BubbleCard>
    </main>
  );
}
