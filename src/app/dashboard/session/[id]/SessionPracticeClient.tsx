"use client";

import { useState, useRef, useEffect } from "react";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { AnalysisResult } from "@/types/analysis";
import { PhonemeError } from "@/types/phonetics";
import { getWordByText } from "@/lib/word-database";
import { SoriMascot } from "@/components/ui/SoriMascot";

// ─── Types ───────────────────────────────────────────────────────────────────
interface WordRecord {
  id: string;
  targetWord: string;
  heardWord: string;
  isCorrect: boolean;
  errorPhonemes: unknown;
}

interface Props {
  sessionId: string;
  childId: string;
  childName: string;
  initialWords: string[];
  wordRecords: WordRecord[];
}

type DotState = "empty" | "incorrect" | "correct";

const MAX_ATTEMPTS = 5;

// ─── Syllable Split Helper ────────────────────────────────────────────────────
function splitSyllables(word: string): string {
  return [...word].join(" · ");
}

// ─── Attempt Dots ─────────────────────────────────────────────────────────────
function AttemptDots({
  dots,
  allCorrect,
}: {
  dots: DotState[];
  allCorrect: boolean;
}) {
  const [animKeys, setAnimKeys] = useState<number[]>([0, 0, 0, 0, 0]);
  const prevLen = useRef(0);

  useEffect(() => {
    const filled = dots.filter((d) => d !== "empty").length;
    if (filled > prevLen.current) {
      const idx = filled - 1;
      setAnimKeys((k) => {
        const next = [...k];
        next[idx] = next[idx] + 1;
        return next;
      });
      prevLen.current = filled;
    }
  }, [dots]);

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
        const state = dots[i] ?? "empty";
        const isLatest =
          state !== "empty" &&
          i === dots.filter((d) => d !== "empty").length - 1;

        let bgColor = "#F0E8E0";
        let innerContent = null;
        let animClass = "";

        if (state === "correct") {
          bgColor = "#7EDFD0";
          innerContent = <span className="text-white text-lg leading-none">⭐</span>;
          animClass = isLatest ? "dot-correct" : "";
        } else if (state === "incorrect") {
          bgColor = "#FFB38A";
          innerContent = <span className="text-white text-base leading-none">💪</span>;
          animClass = isLatest ? "dot-burst" : "";
        }

        return (
          <div
            key={`${i}-${animKeys[i]}`}
            className={`
              relative flex items-center justify-center
              rounded-full transition-colors duration-300
              ${allCorrect ? "dot-all-clear" : animClass}
              ${state !== "empty" ? "dot-pop" : ""}
            `}
            style={{
              width: 52,
              height: 52,
              backgroundColor: bgColor,
              boxShadow:
                state !== "empty"
                  ? "0 4px 14px rgba(0,0,0,0.12)"
                  : "inset 0 2px 6px rgba(0,0,0,0.06)",
              animationDelay: allCorrect ? `${i * 60}ms` : "0ms",
            }}
          >
            {innerContent}

            {state === "empty" && (
              <span className="text-[#C4B5A8] text-sm font-bold">{i + 1}</span>
            )}

            {i < MAX_ATTEMPTS - 1 && (
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 h-0.5 transition-all duration-500"
                style={{
                  width: 12,
                  backgroundColor:
                    dots[i] !== "empty" && dots[i + 1] !== "empty"
                      ? "#FFB38A"
                      : "#F0E8E0",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Difficulty Recommendation ─────────────────────────────────────────────────
function DifficultyTip({ dots }: { dots: DotState[] }) {
  const correctCount = dots.filter((d) => d === "correct").length;
  const ratio = correctCount / MAX_ATTEMPTS;

  if (ratio <= 0.2) {
    return (
      <div className="mt-3 px-4 py-2 bg-[#FFF5EE] rounded-2xl text-sm text-[#8B7E74] text-center">
        💡 조금 더 쉬운 단어로 연습해볼까요? 다음 세션에서 쉬운 단어를 선택해보세요
      </div>
    );
  }
  if (ratio >= 0.8) {
    return (
      <div className="mt-3 px-4 py-2 bg-[#F0FAF8] rounded-2xl text-sm text-[#3D3530] text-center">
        🚀 아주 잘했어요! 다음에는 더 어려운 단어에 도전해봐요
      </div>
    );
  }
  return null;
}

// ─── Word Completion Banner ───────────────────────────────────────────────────
function WordCompleteBanner({
  word,
  hasCorrect,
  dots,
  onNext,
}: {
  word: string;
  hasCorrect: boolean;
  dots: DotState[];
  onNext: () => void;
}) {
  const correctCount = dots.filter((d) => d === "correct").length;
  return (
    <div className="animate-bounce-in text-center py-4 space-y-4">
      <div className="text-6xl">{hasCorrect ? "🌟" : "💪"}</div>
      <div>
        <p className="text-2xl font-black text-[#3D3530]">
          {hasCorrect ? `"${word}" 5번 완료!` : `"${word}" 5번 도전!`}
        </p>
        <p className="text-sm text-[#8B7E74] mt-1">
          5번 중 {correctCount}번 성공 ·{" "}
          {hasCorrect ? "정말 잘했어요 🎉" : "다음에 또 연습해봐요"}
        </p>
      </div>
      <DifficultyTip dots={dots} />
      <BubbleButton variant="peach" size="lg" onClick={onNext} className="w-full">
        다음 단어 →
      </BubbleButton>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SessionPracticeClient({
  sessionId,
  childId,
  childName,
  initialWords,
}: Props) {
  const [wordQueue] = useState<string[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heardWord, setHeardWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // ── Sound effect animation ──────────────────────────────────────────────
  const [showSoundEffect, setShowSoundEffect] = useState(true);

  // ── Per-word attempt dots ────────────────────────────────────────────────
  const [dots, setDots] = useState<DotState[]>([]);
  const attemptCountRef = useRef(0);
  const hasCorrectRef = useRef(false);

  const currentWord = wordQueue[currentIndex];
  const wordInfo = currentWord ? getWordByText(currentWord) : null;

  const filledCount = dots.filter((d) => d !== "empty").length;
  const allFilled = filledCount >= MAX_ATTEMPTS;
  const hasCorrectDot = dots.includes("correct");

  // Reset dots whenever we move to a new word
  useEffect(() => {
    setDots([]);
    attemptCountRef.current = 0;
    hasCorrectRef.current = false;
    setHeardWord("");
    setResult(null);
    setIsBookmarked(false);
    setShowSoundEffect(true);
  }, [currentIndex]);

  // Hide sound effect after 3 seconds
  useEffect(() => {
    if (!wordInfo?.soundEffect) return;
    setShowSoundEffect(true);
    const t = setTimeout(() => setShowSoundEffect(false), 3000);
    return () => clearTimeout(t);
  }, [currentIndex, wordInfo?.soundEffect]);

  async function analyze() {
    if (!heardWord.trim() || allFilled) return;
    setLoading(true);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetWord: currentWord,
          heardWord: heardWord.trim(),
          childId,
          sessionId,
        }),
      });

      if (res.ok) {
        const data: AnalysisResult = await res.json();
        setResult(data);

        const newState: DotState = data.isCorrect ? "correct" : "incorrect";
        setDots((prev) => [...prev, newState]);
        attemptCountRef.current += 1;

        if (data.isCorrect) {
          setCorrectCount((c) => c + 1);
          hasCorrectRef.current = true;
        }
      }
    } finally {
      setLoading(false);
      setHeardWord("");
    }
  }

  async function toggleBookmark() {
    if (!result) return;
    const newVal = !isBookmarked;
    setIsBookmarked(newVal);
    await fetch("/api/bookmarks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordRecordId: result.wordRecordId, isBookmarked: newVal }),
    });
  }

  function nextWord() {
    if (currentIndex + 1 >= wordQueue.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // ── Done screen ───────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 animate-bounce-in">
          <SoriMascot size={130} variant="full" animated />
        </div>
        <h2 className="text-3xl font-black text-[#3D3530] mb-2">연습 완료! 🎉</h2>
        <p className="text-[#8B7E74] mb-2">
          {wordQueue.length}개 중 {correctCount}개 정확하게 발음했어요!
        </p>
        <div className="text-4xl font-black text-[#FFB38A] mb-8">
          {Math.round((correctCount / wordQueue.length) * 100)}점
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <BubbleButton
            variant="peach"
            size="lg"
            onClick={() => (window.location.href = "/dashboard/child")}
          >
            🎮 아이 모드로!
          </BubbleButton>
          <BubbleButton
            variant="white"
            onClick={() => (window.location.href = "/dashboard")}
          >
            홈으로 돌아가기
          </BubbleButton>
        </div>
      </div>
    );
  }

  // ── Practice screen ───────────────────────────────────────────────────────
  return (
    <div className="px-5 pt-6 max-w-lg mx-auto space-y-4 pb-8">

      {/* ── Session progress bar ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#8B7E74]">{childName} 연습 중</span>
          <span className="text-sm font-semibold text-[#3D3530]">
            {currentIndex + 1} / {wordQueue.length}
          </span>
        </div>
        <div className="w-full h-3 bg-[#F0E8E0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFB38A] rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / wordQueue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Target word card + attempt dots ─────────────────────────── */}
      <BubbleCard color="peach" className="text-center">
        <p className="text-sm text-[#8B7E74] mb-2">아이에게 이 단어를 말하게 해보세요</p>

        {/* Image placeholder — will be replaced with actual image */}
        {wordInfo && <div className="h-20 mb-2 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"></div>}

        {/* Main word */}
        <div className="text-5xl font-black text-[#3D3530] mb-1">{currentWord}</div>

        {/* ── Syllable split hint ─────────────────────────────────── */}
        <div className="text-lg text-[#8B7E74] font-semibold tracking-widest mb-2">
          {splitSyllables(currentWord)}
        </div>

        {/* ── Sound effect (의성어/의태어) ──────────────────────── */}
        {wordInfo?.soundEffect && showSoundEffect && (
          <div className="text-xl font-black text-[#FFB38A] animate-bounce-in mb-3 animate-float">
            {wordInfo.soundEffect}
          </div>
        )}
        {wordInfo?.soundEffect && !showSoundEffect && (
          <button
            onClick={() => setShowSoundEffect(true)}
            className="text-xs text-[#C4B5A8] mb-3 underline"
          >
            소리 힌트 보기 🔊
          </button>
        )}

        {/* Sample sentence */}
        {wordInfo && (
          <p className="text-sm text-[#8B7E74] bg-white/60 rounded-2xl px-4 py-2 inline-block mb-4">
            {wordInfo.sampleSentence}
          </p>
        )}

        {/* ── 5 attempt dots ─────────────────────────────────────── */}
        <div className="bg-white/50 rounded-[20px] py-3 px-2">
          <p className="text-xs text-[#8B7E74] mb-2 font-semibold">
            {filledCount === 0
              ? "5번 연습해봐요!"
              : allFilled
              ? hasCorrectDot ? "완벽해요! 🌟" : "잘 했어요! 💪"
              : `${filledCount}번째 도전 중...`}
          </p>
          <AttemptDots dots={dots} allCorrect={allFilled && hasCorrectDot} />
          <p className="text-xs text-[#C4B5A8] mt-2">
            {filledCount}/{MAX_ATTEMPTS} 완료
          </p>
        </div>
      </BubbleCard>

      {/* ── Syllable practice guide ──────────────────────────────────── */}
      {filledCount === 0 && currentWord.length > 1 && (
        <BubbleCard color="mint" padding="sm">
          <p className="text-xs font-semibold text-[#3D3530] mb-2">🎯 단계별 연습 팁</p>
          <div className="flex items-center gap-2 flex-wrap">
            {[...currentWord].map((syllable, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="bg-white rounded-full px-3 py-1 font-black text-[#3D3530] text-lg shadow-sm">
                  {syllable}
                </span>
                {i < currentWord.length - 1 && (
                  <span className="text-[#7EDFD0] font-bold">→</span>
                )}
              </span>
            ))}
            <span className="text-[#7EDFD0] font-bold">→</span>
            <span className="bg-[#7EDFD0] text-white rounded-full px-3 py-1 font-black text-lg shadow-sm">
              {currentWord}
            </span>
          </div>
          <p className="text-xs text-[#8B7E74] mt-2">
            음절 하나씩 → 이어서 전체 단어!
          </p>
        </BubbleCard>
      )}

      {/* ── Word completed (all 5 filled) → show banner ─────────────── */}
      {allFilled ? (
        <BubbleCard color={hasCorrectDot ? "mint" : "white"}>
          <WordCompleteBanner
            word={currentWord}
            hasCorrect={hasCorrectDot}
            dots={dots}
            onNext={nextWord}
          />
        </BubbleCard>
      ) : (
        /* ── Parent input ───────────────────────────────────────────── */
        <BubbleCard>
          <p className="text-sm font-semibold text-[#3D3530] mb-1">
            👂 아이가 어떻게 발음했나요?
          </p>
          <p className="text-xs text-[#8B7E74] mb-3">
            귀로 들은 대로 한글로 입력해주세요 ({filledCount}/{MAX_ATTEMPTS}번 시도)
          </p>
          <input
            type="text"
            value={heardWord}
            onChange={(e) => setHeardWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder={`예: ${currentWord}`}
            className="w-full rounded-[16px] border-2 border-[#F0E8E0] bg-[#FDFAF5] px-4 py-3 text-[#3D3530] text-lg font-semibold placeholder-[#C4B5A8] focus:border-[#FFB38A] focus:outline-none mb-3"
          />
          <BubbleButton
            onClick={analyze}
            disabled={loading || !heardWord.trim()}
            variant="mint"
            size="md"
            className="w-full"
          >
            {loading ? <LoadingSpinner size="sm" /> : `분석하기 🔍 (${MAX_ATTEMPTS - filledCount}회 남음)`}
          </BubbleButton>
        </BubbleCard>
      )}

      {/* ── Latest analysis result (below input) ────────────────────── */}
      {result && !allFilled && (
        <div className="space-y-3 animate-bounce-in">
          {/* Correct / Wrong */}
          <BubbleCard color={result.isCorrect ? "mint" : "peach"} className="text-center">
            <div className="text-3xl mb-1">{result.isCorrect ? "🌟" : "💪"}</div>
            <h3 className="text-lg font-black text-[#3D3530] mb-1">
              {result.isCorrect ? "정확해요!" : "한 번 더!"}
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm text-[#8B7E74]">
              <span>목표: <strong className="text-[#3D3530]">{result.targetWord}</strong></span>
              <span>→</span>
              <span>들은 것: <strong className="text-[#3D3530]">{result.heardWord}</strong></span>
            </div>
          </BubbleCard>

          {/* Errors */}
          {result.errors.length > 0 && (
            <BubbleCard>
              <p className="font-semibold text-[#3D3530] mb-3">발음 오류 분석</p>
              <div className="space-y-2">
                {result.errors.map((err: PhonemeError, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#FFF5EE] rounded-2xl">
                    <div className="flex gap-1">
                      <PastelBadge color="pink">{err.targetPhoneme}</PastelBadge>
                      <span className="text-[#8B7E74]">→</span>
                      <PastelBadge color="lavender">{err.heardPhoneme}</PastelBadge>
                    </div>
                    <div className="flex-1 text-xs text-[#8B7E74]">
                      {err.articulationPlace} · {err.articulationManner}
                    </div>
                  </div>
                ))}
              </div>
            </BubbleCard>
          )}

          {/* AI Guidance */}
          <BubbleCard color="lavender">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-semibold text-[#3D3530] mb-1 text-sm">AI 선생님 가이드</p>
                <p className="text-sm text-[#3D3530] leading-relaxed">{result.guidanceText}</p>
              </div>
            </div>
          </BubbleCard>

          {/* Articulation guides */}
          {result.articulationGuides.length > 0 && (
            <BubbleCard>
              <p className="font-semibold text-[#3D3530] mb-3">💋 입 모양 가이드</p>
              <div className="space-y-2">
                {result.articulationGuides.map((guide, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#F0FAF8] rounded-2xl">
                    <PastelBadge color="mint" className="flex-shrink-0">{guide.phoneme}</PastelBadge>
                    <p className="text-sm text-[#3D3530]">{guide.tipText}</p>
                  </div>
                ))}
              </div>
            </BubbleCard>
          )}

          {/* Bookmark + skip */}
          <div className="flex gap-3">
            <BubbleButton variant="white" onClick={toggleBookmark} className="flex-1">
              {isBookmarked ? "⭐ 저장됨" : "☆ 보관함"}
            </BubbleButton>
            <BubbleButton variant="ghost" onClick={nextWord} className="flex-1 text-[#8B7E74]">
              이 단어 건너뛰기 →
            </BubbleButton>
          </div>
        </div>
      )}

      {/* ── Also show analysis when all filled ──────────────────────── */}
      {result && allFilled && (
        <div className="space-y-3">
          {result.errors.length > 0 && (
            <BubbleCard>
              <p className="font-semibold text-[#3D3530] mb-3">마지막 발음 분석</p>
              <div className="space-y-2">
                {result.errors.map((err: PhonemeError, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#FFF5EE] rounded-2xl">
                    <div className="flex gap-1">
                      <PastelBadge color="pink">{err.targetPhoneme}</PastelBadge>
                      <span className="text-[#8B7E74]">→</span>
                      <PastelBadge color="lavender">{err.heardPhoneme}</PastelBadge>
                    </div>
                    <div className="flex-1 text-xs text-[#8B7E74]">
                      {err.articulationPlace} · {err.articulationManner}
                    </div>
                  </div>
                ))}
              </div>
            </BubbleCard>
          )}
          <BubbleCard color="lavender">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-semibold text-[#3D3530] mb-1 text-sm">AI 선생님 가이드</p>
                <p className="text-sm text-[#3D3530] leading-relaxed">{result.guidanceText}</p>
              </div>
            </div>
          </BubbleCard>
          <div className="flex gap-3">
            <BubbleButton variant="white" onClick={toggleBookmark} className="flex-1">
              {isBookmarked ? "⭐ 저장됨" : "☆ 보관함"}
            </BubbleButton>
          </div>
        </div>
      )}
    </div>
  );
}
