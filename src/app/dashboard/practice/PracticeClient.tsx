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
  errorWords: ErrorWord[];
  recommendedWords: string[];
}

interface PracticeWord {
  word: string;
  type: "error" | "recommended";
  errorPattern?: string;
}

const MAX_DOTS = 5; // 성공 도트 최대 개수 (시각적 표시용)

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function PracticeClient({
  childId,
  childName,
  mascotLevel,
  errorWords,
  recommendedWords,
}: Props) {
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
  // successes[i] = i번째 단어의 성공 횟수
  const [successes, setSuccesses] = useState<number[]>(new Array(allWords.length).fill(0));
  const [savedWords, setSavedWords] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const currentWord = allWords[currentIndex];
  const currentSuccess = successes[currentIndex] ?? 0;
  const isSaved = savedWords.has(currentIndex);

  // 총 성공 횟수
  const totalSuccess = successes.reduce((a, b) => a + b, 0);

  // ── 성공 처리 (부모가 아이 발음 OK 판단) ──────────────────────────────────────
  const handleSuccess = useCallback(() => {
    const next = currentSuccess + 1;
    const newSuccesses = [...successes];
    newSuccesses[currentIndex] = next;
    setSuccesses(newSuccesses);

    // 5번 채워질 때 confetti
    if (next === MAX_DOTS) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
    }
  }, [successes, currentIndex, currentSuccess]);

  // ── 복습 저장 (언제든, 이유는 "아직 잘 안 됨" 또는 "다시 보고 싶음") ──────────
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
      // 저장 실패 — 다음에 다시 시도 가능
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
        style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
      >
        <div className="text-7xl mb-5 animate-float">📝</div>
        <h2 className="text-2xl font-black text-[#3D3530] mb-2">연습 단어가 없어요</h2>
        <p className="text-[#8B7E74] mb-6 leading-relaxed">
          오답노트에서 발음을 먼저 입력하면<br />
          AI가 연습 단어를 만들어드려요!
        </p>
        <Link href="/dashboard/answer-note">
          <BubbleButton variant="peach" size="lg">오답노트 작성하기 →</BubbleButton>
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
        style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
      >
        <ConfettiEffect trigger />
        <div className="text-8xl mb-4 animate-bounce-in">🎉</div>
        <h2 className="text-3xl font-black text-[#3D3530] mb-2">{childName} 최고야!</h2>
        <p className="text-[#8B7E74] mb-4">{allWords.length}개 단어 모두 연습했어요</p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <span className="px-4 py-2 bg-[#FFB38A]/20 rounded-full text-sm font-bold text-[#FFB38A]">
            ⭐ {totalSuccess}번 성공
          </span>
          {saved > 0 && (
            <span className="px-4 py-2 bg-[#7EDFD0]/20 rounded-full text-sm font-bold text-[#0D9488]">
              📌 {saved}개 복습 저장
            </span>
          )}
        </div>
        <Link href="/dashboard">
          <BubbleButton variant="peach" size="xl">홈으로 가기 🏠</BubbleButton>
        </Link>
      </div>
    );
  }

  // ── 연습 화면 ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
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
          ⭐ {totalSuccess}
        </div>
      </div>

      {/* 단어 진행 도트 */}
      <div className="flex justify-center gap-1.5 py-3">
        {allWords.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 20 : 8,
              height: 8,
              backgroundColor:
                i < currentIndex ? "#7EDFD0"
                : i === currentIndex ? "#FFB38A"
                : "rgba(255,255,255,0.6)",
            }}
          />
        ))}
      </div>
      <p className="text-center text-xs text-[#8B7E74] font-semibold mb-2">
        {currentIndex + 1} / {allWords.length}
      </p>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">

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

        {/* 단어 카드 + 복습 저장 버튼 */}
        <div className="w-full relative">
          <div
            className="w-full bg-white/90 rounded-[32px] px-8 py-10 text-center shadow-lg"
            style={{ border: "2px solid rgba(255,255,255,0.9)" }}
          >
            <p className="text-7xl font-black text-[#3D3530] tracking-wider mb-3">
              {currentWord.word}
            </p>
            <p className="text-sm text-[#8B7E74]">
              아이가 소리내어 읽으면 부모님이 판단해주세요
            </p>
          </div>

          {/* 복습 저장 버튼 — 카드 우상단 */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all"
            style={{
              backgroundColor: isSaved ? "#FDE68A" : "rgba(255,255,255,0.85)",
              border: isSaved ? "2px solid #F59E0B" : "2px solid #F0E8E0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            title={isSaved ? "복습 목록에 저장됨" : "나중에 복습할 단어로 저장"}
          >
            <span className="text-xl">{isSaved ? "📌" : "☆"}</span>
          </button>
        </div>

        {/* 저장 안내 텍스트 */}
        {!isSaved && (
          <p className="text-xs text-[#C4B5A8] text-center">
            ☆ 아직 잘 안 되면 눌러서 나중에 복습해요
          </p>
        )}
        {isSaved && (
          <p className="text-xs text-[#D97706] font-semibold text-center animate-bounce-in">
            📌 복습 목록에 저장됐어요!
          </p>
        )}

        {/* 성공 도트 */}
        <SuccessDots count={currentSuccess} max={MAX_DOTS} />

        {/* 5회 달성 축하 */}
        {currentSuccess >= MAX_DOTS && (
          <div className="w-full bg-[#F0FAF8] border-2 border-[#7EDFD0] rounded-2xl px-5 py-3 text-center animate-bounce-in">
            <p className="font-black text-[#0D9488]">🎉 5번 성공! 정말 잘했어요!</p>
          </div>
        )}
      </div>

      {/* 하단 버튼 — 항상 동일하게 표시 */}
      <div className="px-6 pb-8 space-y-3">

        {/* 부모용 판단 버튼: 잘 됐어요 */}
        <BubbleButton
          variant="peach"
          size="xl"
          onClick={handleSuccess}
          className="w-full"
        >
          잘 됐어요! ✓
        </BubbleButton>

        {/* 다음 단어 — 언제든 넘어갈 수 있음 */}
        <BubbleButton
          variant="white"
          size="md"
          onClick={handleNext}
          className="w-full"
        >
          {currentIndex + 1 >= allWords.length ? "완료 🎊" : "다음 단어 →"}
        </BubbleButton>
      </div>
    </div>
  );
}

// ─── 성공 도트 ────────────────────────────────────────────────────────────────

function SuccessDots({ count, max }: { count: number; max: number }) {
  // 5개 넘어가면 도트는 5개 고정, 숫자로 추가 표시
  const displayCount = Math.min(count, max);
  const overflow = count > max ? count - max : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-2">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < displayCount;
          const isNew = i === displayCount - 1 && count <= max;
          return (
            <div
              key={i}
              className="transition-all duration-300"
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: filled ? "#7EDFD0" : "#F0E8E0",
                transform: isNew ? "scale(1.25)" : "scale(1)",
                boxShadow: filled ? "0 0 0 3px rgba(126,223,208,0.25)" : "none",
              }}
            />
          );
        })}
      </div>
      {overflow > 0 && (
        <span className="text-sm font-black text-[#7EDFD0]">+{overflow}</span>
      )}
    </div>
  );
}
