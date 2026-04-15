"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface LocalResult {
  errorRecordId: string;
  errorCategory: string;
  errorPattern: string;
  localAnalysis: {
    detectedPattern: string;
    confidence: number;
    requiresGemini: boolean;
    parentHint?: string;
    description?: string;
  };
}

interface GeminiResult {
  rootCause: string;
  trainingSteps: string[];
  recommendedWords: string[];
  parentMessage?: string;
}

interface Props {
  childId: string;
  childName: string;
}

// ─── 카테고리 색상 매핑 ────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { bg: string; text: string }> = {
  대치:     { bg: "bg-[#FFF5EE]", text: "text-[#FFB38A]" },
  동화:     { bg: "bg-[#F5F3FF]", text: "text-[#C4B5FD]" },
  탈락:     { bg: "bg-[#FFF8DC]", text: "text-[#D97706]" },
  첨가:     { bg: "bg-[#F0FAF8]", text: "text-[#7EDFD0]" },
  미판정:   { bg: "bg-[#F5F5F5]", text: "text-[#8B7E74]" },
  개별습관: { bg: "bg-[#F0FDF4]", text: "text-[#4ADE80]" },
};
const DEFAULT_STYLE = { bg: "bg-[#F5F5F5]", text: "text-[#8B7E74]" };

// ─── 입력값 검증 ───────────────────────────────────────────────────────────────

/**
 * 한글 단어 유효성 검사
 * @returns null(유효) or 에러 메시지 문자열
 */
function validateKoreanWord(text: string): string | null {
  const trimmed = text.trim();

  // 1. 빈 입력 / 공백만
  if (!trimmed) return "단어를 입력해주세요.";

  // 2. 숫자 포함
  if (/[0-9]/.test(text)) {
    return "숫자는 입력할 수 없어요. '사과', '기차'처럼 한글 단어를 입력해주세요.";
  }

  // 3. 영어 포함
  if (/[a-zA-Z]/.test(text)) {
    return "영어는 입력할 수 없어요. 한글로 입력해주세요.";
  }

  // 4. 한글·공백 외 문자 (특수문자, 한자, 일본어 등)
  // 허용: 완성형 한글(가-힣), 자음(ㄱ-ㅎ), 모음(ㅏ-ㅣ), 공백
  if (/[^\uAC00-\uD7A3\u3131-\u3163\s]/.test(text)) {
    return "특수문자나 외국어는 입력할 수 없어요. 한글 단어만 입력해주세요.";
  }

  // 5. 자음·모음 단독 사용 (예: ㄱ차, ㄴ, ㅏ나)
  // 완전한 한글 음절(가-힣) 없이 낱자만 있거나, 낱자가 혼용된 경우
  if (/[\u3131-\u3163]/.test(trimmed)) {
    return "완전하지 않은 한글이에요. 예) 'ㄱ차' → '기차'로 입력해주세요.";
  }

  return null; // 유효
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function AnswerNoteClient({ childId, childName }: Props) {
  const router = useRouter();
  const [targetWord, setTargetWord] = useState("");
  const [childPronunciation, setChildPronunciation] = useState("");

  // 로컬 분석 상태
  const [localLoading, setLocalLoading] = useState(false);
  const [localResult, setLocalResult] = useState<LocalResult | null>(null);

  // Gemini 분석 상태
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiResult, setGeminiResult] = useState<GeminiResult | null>(null);
  const [geminiError, setGeminiError] = useState("");

  const [error, setError] = useState("");
  const [targetWordError, setTargetWordError] = useState("");
  const [pronunciationError, setPronunciationError] = useState("");

  async function handleAnalyze() {
    // 각 필드 독립 검증
    const targetErr = validateKoreanWord(targetWord);
    const pronunciationErr = validateKoreanWord(childPronunciation);

    setTargetWordError(targetErr ?? "");
    setPronunciationError(pronunciationErr ?? "");
    setError("");

    if (targetErr || pronunciationErr) return;

    if (targetWord.trim() === childPronunciation.trim()) {
      setError("목표 단어와 아이 발음이 같아요. 오류가 있는 발음을 입력해주세요!");
      return;
    }
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

    setError("");
    setLocalLoading(true);
    setLocalResult(null);
    setGeminiResult(null);
    setGeminiError("");

    try {
      // ── 1단계: 로컬 분석 (즉시 반환) ────────────────────────────────────────
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
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "분석 중 오류가 발생했습니다");
      }

      const local: LocalResult = await res.json();
      setLocalResult(local);
      setLocalLoading(false);

      // ── 2단계: Gemini 처방전 (별도 로딩) ────────────────────────────────────
      setGeminiLoading(true);
      const geminiRes = await fetch("/api/gemini-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorRecordId: local.errorRecordId }),
      });

      if (!geminiRes.ok) {
        const err = await geminiRes.json().catch(() => null);
        setGeminiError(err?.error || "AI 처방전을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      } else {
        const gemini: GeminiResult = await geminiRes.json();
        setGeminiResult(gemini);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.");
      setLocalLoading(false);
    } finally {
      setGeminiLoading(false);
    }
  }

  function handleReset() {
    setTargetWord("");
    setChildPronunciation("");
    setLocalResult(null);
    setGeminiResult(null);
    setGeminiError("");
    setError("");
    setTargetWordError("");
    setPronunciationError("");
  }

  const categoryStyle = CATEGORY_STYLE[localResult?.errorCategory ?? "미판정"] || DEFAULT_STYLE;

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
          <div>
            <label className="block text-sm font-bold text-[#3D3530] mb-2">🎯 목표 단어</label>
            <input
              type="text"
              value={targetWord}
              onChange={(e) => { setTargetWord(e.target.value); setTargetWordError(""); }}
              placeholder="예) 사과"
              disabled={localLoading}
              className={`w-full px-4 py-3 rounded-2xl border-2 ${targetWordError ? "border-[#FCA5A5]" : "border-[#F0E8E0]"} text-[#3D3530] text-lg font-semibold placeholder:text-[#C4B5A8] focus:outline-none focus:border-[#FFB38A] transition-colors disabled:opacity-50`}
            />
            {targetWordError && (
              <p className="text-xs text-[#EF4444] mt-1.5 ml-1 flex items-start gap-1">
                <span className="flex-shrink-0">⚠️</span>
                <span>{targetWordError}</span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#3D3530] mb-2">🎤 {childName}의 발음</label>
            <input
              type="text"
              value={childPronunciation}
              onChange={(e) => { setChildPronunciation(e.target.value); setPronunciationError(""); }}
              placeholder="예) 따과"
              disabled={localLoading}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              className={`w-full px-4 py-3 rounded-2xl border-2 ${pronunciationError ? "border-[#FCA5A5]" : "border-[#F0E8E0]"} text-[#3D3530] text-lg font-semibold placeholder:text-[#C4B5A8] focus:outline-none focus:border-[#FFB38A] transition-colors disabled:opacity-50`}
            />
            {pronunciationError && (
              <p className="text-xs text-[#EF4444] mt-1.5 ml-1 flex items-start gap-1">
                <span className="flex-shrink-0">⚠️</span>
                <span>{pronunciationError}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl px-4 py-3">
              <p className="text-sm text-[#EF4444] font-bold text-center">🚨 {error}</p>
            </div>
          )}

          <BubbleButton
            variant="peach"
            size="lg"
            onClick={handleAnalyze}
            disabled={localLoading || !targetWord.trim() || !childPronunciation.trim()}
            className="w-full"
          >
            {localLoading ? "🔍 분석 중..." : "🔍 AI 분석하기"}
          </BubbleButton>
        </div>
      </BubbleCard>

      {/* 1단계 로딩 */}
      {localLoading && (
        <BubbleCard color="peach" className="text-center py-6">
          <div className="text-3xl animate-bounce mb-2">🔍</div>
          <p className="font-bold text-[#3D3530]">발음 오류 분석 중...</p>
          <p className="text-xs text-[#8B7E74] mt-1">금방 끝나요!</p>
        </BubbleCard>
      )}

      {/* ── 로컬 분석 결과 (즉시 표시) ── */}
      {localResult && !localLoading && (
        <div className="space-y-4">

          {/* 오류 유형 카드 */}
          <BubbleCard className={`${categoryStyle.bg} border-2 border-[#F0E8E0]`}>
            <div className="flex items-center gap-3 mb-3">
              <div>
                <p className="text-xs font-semibold text-[#8B7E74]">오류 유형</p>
                <p className="text-xl font-black text-[#3D3530]">{localResult.errorPattern}</p>
              </div>
              <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full bg-white/70 ${categoryStyle.text}`}>
                {localResult.errorCategory}
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
                <p className="text-sm font-bold text-[#3D3530]">{localResult.localAnalysis.confidence}%</p>
              </div>
            </div>

            {/* 로컬 힌트 노출 섹션 삭제 (AI 분석으로 대체됨) */}
          </BubbleCard>

          {/* ── Gemini 처방전 (별도 로딩) ── */}
          {geminiLoading && (
            <BubbleCard color="lavender" className="py-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl animate-spin">🤖</div>
                <div>
                  <p className="font-bold text-[#3D3530] text-sm">AI 선생님이 처방전을 작성 중이에요</p>
                  <p className="text-xs text-[#8B7E74]">4단계 훈련법 + 추천 단어 생성 중...</p>
                </div>
              </div>
              {/* 스켈레톤 UI */}
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="w-7 h-7 rounded-full bg-[#E0D9F5] animate-pulse flex-shrink-0" />
                    <div className="flex-1 h-4 bg-[#E0D9F5] rounded-full animate-pulse" style={{ width: `${70 + i * 5}%` }} />
                  </div>
                ))}
              </div>
            </BubbleCard>
          )}

          {/* Gemini 에러 */}
          {geminiError && !geminiLoading && (
            <BubbleCard color="peach">
              <p className="text-sm text-[#EF4444]">⚠️ {geminiError}</p>
            </BubbleCard>
          )}

          {/* Gemini 결과 */}
          {geminiResult && !geminiLoading && (
            <>
              {/* 원인 카드 */}
              <BubbleCard color="lavender">
                <p className="text-sm font-bold text-[#3D3530] mb-2">💡 왜 이런 발음이 나올까요?</p>
                {/* 로컬 고정 텍스트 삭제됨 - AI 실시간 원인 분석만 노출 */}
                <p className="text-sm text-[#5B4E9B] leading-relaxed">{geminiResult.rootCause}</p>
              </BubbleCard>

              {/* 4단계 훈련법 */}
              <BubbleCard>
                <p className="text-sm font-bold text-[#3D3530] mb-3">📚 선생님의 처방전</p>
                <div className="space-y-4">
                  {geminiResult.trainingSteps.map((step, i) => {
                    const STEP_LABELS = [
                      { label: "조음 감각", color: "bg-[#FFB38A]", textColor: "text-[#FFB38A]" },
                      { label: "소리 느끼기", color: "bg-[#C4B5FD]", textColor: "text-[#C4B5FD]" },
                      { label: "연결하기", color: "bg-[#7EDFD0]", textColor: "text-[#7EDFD0]" },
                      { label: "일상 적용", color: "bg-[#FDE68A]", textColor: "text-[#D97706]" },
                    ];
                    const meta = STEP_LABELS[i] ?? STEP_LABELS[0];
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <span className={`w-7 h-7 rounded-full ${meta.color} text-white text-xs font-black flex items-center justify-center`}>
                            {i + 1}
                          </span>
                          {i < 3 && <div className="w-0.5 h-4 bg-[#F0E8E0]" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <span className={`text-xs font-bold ${meta.textColor} mb-1 block`}>{meta.label}</span>
                          <p className="text-sm text-[#3D3530] leading-relaxed whitespace-pre-line">{step}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </BubbleCard>

              {/* 추천 단어 */}
              {geminiResult.recommendedWords.length > 0 && (
                <BubbleCard color="mint">
                  <p className="text-sm font-bold text-[#3D3530] mb-1">🌟 유사 패턴 연습 단어</p>
                  <p className="text-xs text-[#8B7E74] mb-3">이 발음도 비슷하게 틀릴 수 있어요 — 함께 연습해보세요!</p>
                  <div className="flex flex-wrap gap-2">
                    {geminiResult.recommendedWords.map((word, i) => (
                      <span key={i} className="px-4 py-2 bg-white/70 rounded-full text-sm font-bold text-[#3D3530] border border-[#7EDFD0]/40">
                        {word}
                      </span>
                    ))}
                  </div>
                </BubbleCard>
              )}

            </>
          )}

          {/* 버튼 */}
          <BubbleButton variant="peach" size="lg" onClick={() => router.push("/dashboard/practice")} className="w-full">
            🎮 아이와 연습 시작하기 →
          </BubbleButton>
          <BubbleButton variant="white" size="md" onClick={handleReset} className="w-full">
            ↩️ 다른 단어 분석하기
          </BubbleButton>
        </div>
      )}
    </div>
  );
}
