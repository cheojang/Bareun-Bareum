"use client";

import { useState, useCallback } from "react";
import { ConfettiEffect } from "@/components/child/ConfettiEffect";
import { MascotCharacter } from "@/components/child/MascotCharacter";
import { BubbleButton } from "@/components/ui/BubbleButton";
import Link from "next/link";

// ─── 타입 ──────────────────────────────────────────────────────────────────────

interface ErrorWord {
  word: string;
  errorPattern: string;
}

interface Props {
  childId: string;
  childName: string;
  mascotLevel: number;
  errorWords: ErrorWord[];       // 오답노트 단어 (핑크 배지)
  recommendedWords: string[];    // AI 추천 단어 (라벤더 배지)
}

interface PracticeWord {
  word: string;
  type: "error" | "recommended";
  errorPattern?: string;
}

// 단어 1개당 최대 반복 횟수
const MAX_ATTEMPTS = 5;

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function PracticeClient({
  childId,
  childName,
  mascotLevel,
  errorWords,
  recommendedWords,
}: Props) {
  // 전체 연습 단어 목록 조합: 오답 단어 → AI 추천 단어
  const allWords: PracticeWord[] = [
    ...errorWords.map((e) => ({
      word: e.word,
      type: "error" as const,
      errorPattern: e.errorPattern,
    })),
    ...recommendedWords.map((w) => ({
      word: w,
      type: "recommended" as const,
    })),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  // attempts[wordIndex] = 시도 횟수 (성공 횟수)
  const [attempts, setAttempts] = useState<number[]>(
    new Array(allWords.length).fill(0)
  );
  const [savedWords, setSavedWords] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const currentWord = allWords[currentIndex];
  const currentAttempts = attempts[currentIndex] ?? 0;
  const isWordComplete = currentAttempts >= MAX_ATTEMPTS;
  const isSaved = savedWords.has(currentIndex);

  // ── 정답 처리 ─────────────────────────────────────────────────────────────────
  const handleCorrect = useCallback(() => {
    if (currentAttempts >= MAX_ATTEMPTS) return;

    const newAttempts = [...attempts];
    newAttempts[currentIndex] = currentAttempts + 1;
    setAttempts(newAttempts);
    setTotalScore((s) => s + 1);

    // 5회 달성 시 confetti
    if (currentAttempts + 1 >= MAX_ATTEMPTS) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
    }
  }, [attempts, currentIndex, currentAttempts]);

  // ── 저장하기 ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (saving || isSaved || !currentWord) return;
    setSaving(true);
    try {
      await fetch("/api/saved-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          word: currentWord.word,
          targetPhoneme: currentWord.errorPattern ?? "연습",
          difficulty: currentWord.type === "error" ? "hard" : "medium",
        }),
      });
      setSavedWords((prev) => new Set(prev).add(currentIndex));
    } catch {
      // 저장 실패 무시 (UI 피드백 없이)
    } finally {
      setSaving(false);
    }
  }, [saving, isSaved, currentWord, childId, currentIndex]);

  // ── 다음 단어 ─────────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= allWords.length) {
      setAllDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, allWords.length]);

  // ── 빈 화면 ──────────────────────────────────────────────────────────────────
  if (allWords.length === 0) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{
          background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)",
        }}
      >
        <div className="text-7xl mb-5 animate-float">📝</div>
        <h2 className="text-2xl font-black text-[#3D3530] mb-2">연습 단어가 없어요</h2>
        <p className="text-[#8B7E74] mb-6 leading-relaxed">
          오답노트에서 발음을 먼저 입력하면<br />
          AI가 연습 단어를 만들어드려요!
        </p>
        <Link href="/dashboard/answer-note">
          <BubbleButton variant="peach" size="lg">
            오답노트 작성하기 →
          </BubbleButton>
        </Link>
      </div>
    );
  }

  // ── 전체 완료 화면 ───────────────────────────────────────────────────────────
  if (allDone) {
    const saved = savedWords.size;
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{
          background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)",
        }}
      >
        <ConfettiEffect trigger />
        <div className="text-8xl mb-4 animate-bounce-in">🎉</div>
        <h2 className="text-3xl font-black text-[#3D3530] mb-2">
          {childName} 최고야!
        </h2>
        <p className="text-lg text-[#8B7E74] mb-2">
          {allWords.length}개 단어 모두 연습했어요
        </p>
        <div className="flex gap-3 mb-8">
          <span className="px-4 py-2 bg-[#FFB38A]/20 rounded-full text-sm font-bold text-[#FFB38A]">
            ⭐ {totalScore}번 성공
          </span>
          {saved > 0 && (
            <span className="px-4 py-2 bg-[#7EDFD0]/20 rounded-full text-sm font-bold text-[#0D9488]">
              💾 {saved}개 저장됨
            </span>
          )}
        </div>
        <Link href="/dashboard">
          <BubbleButton variant="peach" size="xl">
            홈으로 가기 🏠
          </BubbleButton>
        </Link>
      </div>
    );
  }

  // ── 연습 화면 ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)",
      }}
    >
      <ConfettiEffect trigger={confetti} />

      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <Link href="/dashboard">
          <button className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-xl shadow-sm">
            ←
          </button>
        </Link>
        <MascotCharacter level={mascotLevel} size="sm" />
        <div className="bg-white/80 rounded-full px-4 py-2 font-black text-[#FFB38A]">
          ⭐ {totalScore}
        </div>
      </div>

      {/* 진행 도트 (단어 단위) */}
      <div className="flex justify-center gap-1.5 py-3">
        {allWords.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 20 : 8,
              height: 8,
              backgroundColor:
                i < currentIndex
                  ? "#7EDFD0"
                  : i === currentIndex
                  ? "#FFB38A"
                  : "rgba(255,255,255,0.6)",
            }}
          />
        ))}
      </div>

      {/* 단어 진행 텍스트 */}
      <p className="text-center text-xs text-[#8B7E74] font-semibold mb-2">
        {currentIndex + 1} / {allWords.length}
      </p>

      {/* 메인 단어 카드 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">

        {/* 단어 타입 배지 */}
        <div className="flex items-center gap-2">
          {currentWord.type === "error" ? (
            <span className="px-3 py-1 bg-[#FEE2E2] text-[#EF4444] text-xs font-bold rounded-full">
              📝 오답노트 단어
            </span>
          ) : (
            <span className="px-3 py-1 bg-[#EDE9FE] text-[#7C3AED] text-xs font-bold rounded-full">
              ✨ AI 추천 단어
            </span>
          )}
          {currentWord.errorPattern && (
            <span className="px-3 py-1 bg-[#F0FAF8] text-[#0D9488] text-xs font-semibold rounded-full">
              {currentWord.errorPattern}
            </span>
          )}
        </div>

        {/* 단어 카드 */}
        <div
          className="w-full bg-white/90 rounded-[32px] px-8 py-10 text-center shadow-lg"
          style={{ border: "2px solid rgba(255,255,255,0.9)" }}
        >
          <p className="text-7xl font-black text-[#3D3530] tracking-wider mb-3">
            {currentWord.word}
          </p>
          {currentWord.type === "error" && (
            <p className="text-sm text-[#8B7E74]">
              이 단어를 또박또박 말해보세요!
            </p>
          )}
          {currentWord.type === "recommended" && (
            <p className="text-sm text-[#8B7E74]">
              비슷한 소리가 들어있어요
            </p>
          )}
        </div>

        {/* 시도 도트 5개 */}
        <AttemptDots attempts={currentAttempts} max={MAX_ATTEMPTS} />

        {/* 5회 완료 배너 */}
        {isWordComplete && (
          <div className="w-full bg-[#F0FAF8] border-2 border-[#7EDFD0] rounded-2xl px-5 py-3 text-center animate-bounce-in">
            <p className="font-black text-[#0D9488]">🎉 잘했어요! 5번 완성!</p>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-8 space-y-3">

        {/* 완료 시: 저장하기 + 다음 단어 */}
        {isWordComplete ? (
          <>
            {!isSaved ? (
              <BubbleButton
                variant="mint"
                size="xl"
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? "저장 중..." : "💾 기록에 저장하기"}
              </BubbleButton>
            ) : (
              <div className="w-full text-center py-4 bg-[#F0FAF8] rounded-2xl">
                <p className="font-bold text-[#0D9488]">✅ 저장됐어요!</p>
              </div>
            )}
            <BubbleButton
              variant="peach"
              size="lg"
              onClick={handleNext}
              className="w-full"
            >
              {currentIndex + 1 >= allWords.length
                ? "완료 🎊"
                : "다음 단어 →"}
            </BubbleButton>
          </>
        ) : (
          /* 진행 중: 맞아요 + 다음 */
          <>
            <BubbleButton
              variant="peach"
              size="xl"
              onClick={handleCorrect}
              className="w-full"
            >
              맞아요! 🌟
            </BubbleButton>
            <BubbleButton
              variant="white"
              size="md"
              onClick={handleNext}
              className="w-full"
            >
              다음으로 건너뛰기
            </BubbleButton>
          </>
        )}
      </div>
    </div>
  );
}

// ─── 시도 도트 컴포넌트 ────────────────────────────────────────────────────────

function AttemptDots({ attempts, max }: { attempts: number; max: number }) {
  return (
    <div className="flex gap-3">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < attempts;
        const isLast = i === attempts - 1;
        return (
          <div
            key={i}
            className="transition-all duration-300"
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: filled ? "#7EDFD0" : "#F0E8E0",
              transform: isLast ? "scale(1.2)" : "scale(1)",
              boxShadow: filled
                ? "0 0 0 3px rgba(126,223,208,0.3)"
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}
