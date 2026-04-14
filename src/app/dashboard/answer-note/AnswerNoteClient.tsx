"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  errorRecordId: string;
  errorCategory: string;
  errorPattern: string;
  localAnalysis: {
    detectedPattern: string;
    confidence: number;
    requiresGemini: boolean;
    note?: string;
    parentHint?: string;   // "바람이 숨어버렸어요!" 등
    description?: string;  // 음운학적 설명 (부모 이해 수준)
  };
  geminiFeedback: {
    rootCause: string;
    trainingSteps: string[];
    recommendedWords: string[];
    parentMessage?: string; // 부모님께 응원 메시지
  } | null;
}

interface Props {
  childId: string;
  childName: string;
}

// ─── 카테고리 색상 매핑 ────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { bg: string; text: string }> = {
  대치: { bg: "bg-[#FFF5EE]", text: "text-[#FFB38A]" },
  동화: { bg: "bg-[#F5F3FF]", text: "text-[#C4B5FD]" },
  탈락: { bg: "bg-[#FFF8DC]", text: "text-[#D97706]" },
  첨가: { bg: "bg-[#F0FAF8]", text: "text-[#7EDFD0]" },
  미판정: { bg: "bg-[#F5F5F5]", text: "text-[#8B7E74]" },
  개별습관: { bg: "bg-[#F0FDF4]", text: "text-[#4ADE80]" },
};

// ✨ Pro Fix 3: 예상치 못한 카테고리 방어용 기본값
const DEFAULT_CATEGORY_STYLE = { bg: "bg-[#F5F5F5]", text: "text-[#8B7E74]" };

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function AnswerNoteClient({ childId, childName }: Props) {
  const router = useRouter();
  const [targetWord, setTargetWord] = useState("");
  const [childPronunciation, setChildPronunciation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!targetWord.trim() || !childPronunciation.trim()) {
      setError("목표 단어와 아이 발음을 모두 입력해주세요!");
      return;
    }
    if (targetWord.trim() === childPronunciation.trim()) {
      setError("목표 단어와 아이 발음이 같아요. 오류가 있는 발음을 입력해주세요!");
      return;
    }

    // ✨ Pro Fix 1: 모바일 키보드 내리기 및 포커스 해제 (UX 향상)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/error-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          targetWord: targetWord.trim(),
          childPronunciation: childPronunciation.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "분석 중 오류가 발생했습니다");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      // ✨ Pro Fix 2: 명시적인 에러 핸들링
      setError(err instanceof Error ? err.message : "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setTargetWord("");
    setChildPronunciation("");
    setResult(null);
    setError("");
  }

  // ✨ Pro Fix 3: 안전한 카테고리 스타일 매핑 방어 로직
  const categoryStyle = CATEGORY_STYLE[result?.errorCategory ?? "미판정"] || DEFAULT_CATEGORY_STYLE;

  return (
    <div className="px-5 pt-6 pb-8 max-w-lg mx-auto space-y-5">

      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-black text-[#3D3530]">📝 오답 노트</h1>
        <p className="text-sm text-[#8B7E74] mt-1">
          {childName}의 발음을 입력하면 AI가 원인을 분석해드려요
        </p>
      </div>

      {/* 입력 폼 */}
      <BubbleCard>
        <div className="space-y-4">

          {/* 목표 단어 */}
          <div>
            <label className="block text-sm font-bold text-[#3D3530] mb-2">
              🎯 목표 단어
            </label>
            <input
              type="text"
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value)}
              placeholder="예) 사과"
              disabled={loading}
              className="
                w-full px-4 py-3 rounded-2xl border-2 border-[#F0E8E0]
                text-[#3D3530] text-lg font-semibold placeholder:text-[#C4B5A8]
                focus:outline-none focus:border-[#FFB38A] transition-colors
                disabled:opacity-50
              "
            />
          </div>

          {/* 아이 발음 */}
          <div>
            <label className="block text-sm font-bold text-[#3D3530] mb-2">
              🎤 {childName}의 발음
            </label>
            <input
              type="text"
              value={childPronunciation}
              onChange={(e) => setChildPronunciation(e.target.value)}
              placeholder="예) 따과"
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              className="
                w-full px-4 py-3 rounded-2xl border-2 border-[#F0E8E0]
                text-[#3D3530] text-lg font-semibold placeholder:text-[#C4B5A8]
                focus:outline-none focus:border-[#FFB38A] transition-colors
                disabled:opacity-50
              "
            />
          </div>

          {/* ✨ Pro Fix 2: 에러를 단순 텍스트가 아닌 눈에 띄는 박스로 처리 */}
          {error && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl px-4 py-3">
              <p className="text-sm text-[#EF4444] font-bold text-center">🚨 {error}</p>
            </div>
          )}

          {/* 분석 버튼 */}
          <BubbleButton
            variant="peach"
            size="lg"
            onClick={handleAnalyze}
            disabled={loading || !targetWord.trim() || !childPronunciation.trim()}
            className="w-full"
          >
            {loading ? "🔍 분석 중..." : "🔍 AI 분석하기"}
          </BubbleButton>
        </div>
      </BubbleCard>

      {/* 로딩 */}
      {loading && (
        <BubbleCard color="peach" className="text-center py-8 space-y-3">
          <div className="flex justify-center gap-2">
            <div className="text-4xl animate-bounce" style={{ animationDelay: "0s" }}>
              🤖
            </div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: "0.2s" }}>
              🔍
            </div>
          </div>
          <div>
            <p className="font-bold text-[#3D3530] text-lg">또비가 분석 중이에요</p>
            <p className="text-sm text-[#8B7E74] mt-1">
              {childName}의 발음을 자세히 살펴보고 있어요 ✨
            </p>
          </div>
          <div className="mt-3 h-1 bg-gradient-to-r from-[#FFB38A] via-[#FFE4CC] to-[#FFB38A] rounded-full overflow-hidden">
            <div className="h-full bg-[#FFB38A] animate-pulse"></div>
          </div>
        </BubbleCard>
      )}

      {/* 분석 결과 */}
      {result && !loading && (
        <div className="space-y-4">

          {/* ── 오류 유형 카드 ── */}
          <BubbleCard className={`${categoryStyle.bg} border-2 border-[#F0E8E0]`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0"></div>
              <div>
                <p className="text-xs font-semibold text-[#8B7E74]">오류 유형</p>
                <p className="text-xl font-black text-[#3D3530]">
                  {result.errorPattern}
                </p>
              </div>
              <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full bg-white/70 ${categoryStyle.text}`}>
                {result.errorCategory}
              </span>
            </div>

            {/* 목표 단어 → 아이 발음 비교 */}
            <div className="flex items-center gap-3 bg-white/50 rounded-2xl px-4 py-3 mb-3">
              <div className="text-center">
                <p className="text-xs text-[#8B7E74]">목표</p>
                <p className="text-xl font-black text-[#3D3530]">{targetWord}</p>
              </div>
              <span className="text-2xl flex-1 text-center">→</span>
              <div className="text-center">
                <p className="text-xs text-[#8B7E74]">{childName} 발음</p>
                <p className="text-xl font-black text-[#FCA5A5]">{childPronunciation}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-[#8B7E74]">신뢰도</p>
                <p className="text-sm font-bold text-[#3D3530]">
                  {result.localAnalysis.confidence}%
                </p>
              </div>
            </div>

            {/* parentHint — 부모 친화적 한 줄 설명 */}
            {result.localAnalysis.parentHint && (
              <div className="bg-white/60 rounded-xl px-4 py-2.5">
                <p className="text-sm font-semibold text-[#3D3530]">
                  💬 {result.localAnalysis.parentHint}
                </p>
              </div>
            )}

            {result.localAnalysis.requiresGemini && (
              <p className="text-xs text-[#C4B5FD] mt-2 font-semibold">
                🌀 동화 오류 — AI 상세 분석 포함
              </p>
            )}
          </BubbleCard>

          {/* ── Gemini 피드백 ── */}
          {result.geminiFeedback ? (
            <>
              {/* 원인 카드 */}
              <BubbleCard color="lavender">
                <p className="text-sm font-bold text-[#3D3530] mb-2">💡 왜 이런 발음이 나올까요?</p>
                {result.localAnalysis.description && (
                  <p className="text-xs text-[#8B7E74] mb-2 leading-relaxed">
                    {result.localAnalysis.description}
                  </p>
                )}
                <p className="text-sm text-[#5B4E9B] leading-relaxed">
                  {result.geminiFeedback.rootCause}
                </p>
              </BubbleCard>

              {/* 4단계 훈련법 */}
              <BubbleCard>
                <p className="text-sm font-bold text-[#3D3530] mb-3">📚 선생님의 처방전</p>
                <div className="space-y-4">
                  {result.geminiFeedback.trainingSteps.map((step, i) => {
                    const STEP_LABELS = [
                      { label: "조음 감각", color: "bg-[#FFB38A]", textColor: "text-[#FFB38A]" },
                      { label: "소리 느끼기", color: "bg-[#C4B5FD]", textColor: "text-[#C4B5FD]" },
                      { label: "연결하기", color: "bg-[#7EDFD0]", textColor: "text-[#7EDFD0]" },
                      { label: "일상 적용", color: "bg-[#FDE68A]", textColor: "text-[#D97706]" },
                    ];
                    const meta = STEP_LABELS[i] ?? STEP_LABELS[0];
                    return (
                      <div key={`training-step-${i}`} className="flex gap-3">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <span className={`w-7 h-7 rounded-full ${meta.color} text-white text-xs font-black flex items-center justify-center`}>
                            {i + 1}
                          </span>
                          {i < 3 && <div className="w-0.5 h-4 bg-[#F0E8E0]" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <span className={`text-xs font-bold ${meta.textColor} mb-1 block`}>
                            {meta.label}
                          </span>
                          <p className="text-sm text-[#3D3530] leading-relaxed whitespace-pre-line">
                            {step}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </BubbleCard>

              {/* 추천 단어 */}
              {result.geminiFeedback.recommendedWords.length > 0 && (
                <BubbleCard color="mint">
                  <p className="text-sm font-bold text-[#3D3530] mb-1">🌟 유사 패턴 연습 단어</p>
                  <p className="text-xs text-[#8B7E74] mb-3">
                    이 발음도 비슷하게 틀릴 수 있어요 — 함께 연습해보세요!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.geminiFeedback.recommendedWords.map((word, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-white/70 rounded-full text-sm font-bold text-[#3D3530] border border-[#7EDFD0]/40"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </BubbleCard>
              )}

              {/* 부모님께 응원 메시지 */}
              {result.geminiFeedback.parentMessage && (
                <BubbleCard color="yellow">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">🤗</span>
                    <div>
                      <p className="text-xs font-bold text-[#D97706] mb-1">부모님께</p>
                      <p className="text-sm text-[#3D3530] leading-relaxed">
                        {result.geminiFeedback.parentMessage}
                      </p>
                    </div>
                  </div>
                </BubbleCard>
              )}
            </>
          ) : (
            /* 로컬 분석만 있을 때 기본 안내 */
            <BubbleCard color="lavender">
              <p className="text-sm font-bold text-[#3D3530] mb-2">💡 분석 결과</p>
              {result.localAnalysis.description && (
                <p className="text-sm text-[#5B4E9B] leading-relaxed mb-2">
                  {result.localAnalysis.description}
                </p>
              )}
              <p className="text-sm text-[#5B4E9B] leading-relaxed">
                {result.errorCategory === "대치"
                  ? "거울 앞에서 입 모양을 보며 천천히 연습해보세요."
                  : result.errorCategory === "탈락"
                  ? "천천히 한 음절씩 또박또박 발음하는 연습을 해보세요."
                  : "발음 오류가 감지되었어요. Gemini API 키를 설정하면 더 자세한 분석을 받을 수 있어요."}
              </p>
            </BubbleCard>
          )}

          {/* 아이연습 시작 버튼 */}
          <BubbleButton
            variant="peach"
            size="lg"
            onClick={() => router.push("/dashboard/practice")}
            className="w-full"
          >
            🎮 아이와 연습 시작하기 →
          </BubbleButton>

          {/* 다시 입력 버튼 */}
          <BubbleButton
            variant="white"
            size="md"
            onClick={handleReset}
            className="w-full"
          >
            ↩️ 다른 단어 분석하기
          </BubbleButton>
        </div>
      )}
    </div>
  );
}
