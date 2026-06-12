"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

import { ConfettiEffect } from "@/components/child/ConfettiEffect";
import { MascotCharacter } from "@/components/child/MascotCharacter";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { WordImage } from "@/components/ui/WordImage";
import { useTTS } from "@/lib/useTTS";

// 복습 시퀀스 아이템: 분석단어(평가·SM-2) 또는 유사단어(그림·연습)
export type ReviewSeqItem = {
  kind: "analysis" | "similar";
  key: string;
  word: string;
  phoneme: string;
  // analysis 전용
  scheduleId?: string;
  childPronunciation?: string;
  reviewCount?: number;
  // similar 전용
  imageSlug?: string;
  sourceWord?: string;
};

interface Props {
  childId: string;
  childName: string;
  childImage?: string | null;
  mascotLevel: number;
  sequence: ReviewSeqItem[];
}

const MAX_DOTS = 5;
type DotResult = "good" | "bad" | null;
type MasteryLevel = "mastered" | "medium" | "hard";

function getMastery(slots: DotResult[]): MasteryLevel {
  const goodCount = slots.filter((s) => s === "good").length;
  if (goodCount === MAX_DOTS) return "mastered";
  if (goodCount >= 3) return "medium";
  return "hard";
}

function getMasteryLabel(level: MasteryLevel) {
  if (level === "mastered") return { emoji: "🌟", text: "완벽해요! 잘 훈련된 단어예요", color: "#0D9488", bg: "#F0FAF8", border: "#7EDFD0" };
  if (level === "medium")   return { emoji: "👍", text: "잘 하고 있어요! 조금 더 연습해봐요", color: "#7C3AED", bg: "#EDE9FE", border: "#A78BFA" };
  return { emoji: "💪", text: "더 연습이 필요한 단어예요", color: "#EC4899", bg: "#FDF2F8", border: "#F9A8D4" };
}

function toQuality(goodCount: number): number {
  if (goodCount >= 5) return 5;
  if (goodCount >= 4) return 4;
  if (goodCount >= 3) return 3;
  if (goodCount >= 2) return 1;
  return 0;
}

function CarTrack({ progress, childImage }: { progress: number; childImage?: string | null }) {
  const pct = Math.max(0, Math.min(1, progress));
  const leftPct = 5 + pct * 88;

  return (
    <div className="relative w-full h-12 select-none">
      <div className="absolute inset-x-5 bottom-2 h-3 bg-[#F0E8E0] rounded-full overflow-hidden shadow-inner">
        <div className="absolute inset-0 flex items-center justify-around px-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-3 h-0.5 bg-white/50 rounded-full" />
          ))}
        </div>
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct * 100}%`,
            background: "linear-gradient(90deg, #B8EDE3, #7EDFD0)",
          }}
        />
      </div>
      <div className="absolute bottom-1.5 left-1 text-sm">🚦</div>
      <div className="absolute bottom-1.5 right-1 text-sm">🏁</div>
      <div
        className="absolute transition-all duration-700 ease-out"
        style={{
          left: `${leftPct}%`,
          bottom: "10px",
          transform: "translateX(-50%)",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
        }}
      >
        {childImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={childImage}
            alt="아이"
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid #7EDFD0" }}
          />
        ) : (
          <span style={{ fontSize: 24, display: "inline-block", transform: "scaleX(-1)" }}>
            🚗
          </span>
        )}
      </div>
    </div>
  );
}

function ResultDots({ slots }: { slots: DotResult[] }) {
  return (
    <div className="flex items-center gap-2">
      {slots.map((result, i) => {
        const isGood = result === "good";
        const isBad = result === "bad";
        const isEmpty = result === null;
        const isLatest = !isEmpty && slots.findLastIndex((s) => s !== null) === i;

        return (
          <div
            key={i}
            className="transition-all duration-300"
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              backgroundColor: isGood ? "#7EDFD0" : isBad ? "#F9A8D4" : "#F0E8E0",
              transform: isLatest ? "scale(1.3)" : "scale(1)",
              boxShadow: isGood
                ? "0 0 0 3px rgba(126,223,208,0.3)"
                : isBad
                ? "0 0 0 3px rgba(249,168,212,0.3)"
                : "none",
              border: isEmpty ? "2px solid #E8DDD5" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

export function ReviewClient({ childId, childName, childImage, mascotLevel, sequence }: Props) {
  const [items] = useState(sequence);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dotSlots, setDotSlots] = useState<DotResult[][]>(
    () => Array.from({ length: Math.max(items.length, 1) }, () => Array(MAX_DOTS).fill(null))
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [confetti, setConfetti] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const currentItem = items[currentIndex];
  const currentSlots = dotSlots[currentIndex] ?? Array(MAX_DOTS).fill(null);

  // ── 단어 자동 재생 + 다시 듣기 ─────────────────────────────────────────────
  const { play: playWord, stop: stopWord } = useTTS();
  const lastPlayedRef = useRef<string>("");

  useEffect(() => {
    const text = currentItem?.word;
    if (!text) return;
    if (lastPlayedRef.current === text) return;
    lastPlayedRef.current = text;
    const t = setTimeout(() => { playWord(text).catch(() => {}); }, 250);
    return () => { clearTimeout(t); stopWord(); };
  }, [currentItem?.word, playWord, stopWord]);

  const handleReplay = useCallback(() => {
    const text = currentItem?.word;
    if (text) playWord(text).catch(() => {});
  }, [currentItem?.word, playWord]);
  const filledCount = currentSlots.filter((s) => s !== null).length;
  const isSlotsFull = filledCount >= MAX_DOTS;
  const totalGood = dotSlots.flat().filter((s) => s === "good").length;
  const isLastItem = currentIndex + 1 >= items.length;

  const totalDots = items.length * MAX_DOTS;
  const filledDots = currentIndex * MAX_DOTS + filledCount;
  const carProgress = totalDots > 0 ? filledDots / totalDots : 0;

  const fillDot = useCallback((result: "good" | "bad") => {
    if (isSlotsFull) return;
    setDotSlots((prev) => {
      const next = prev.map((row) => [...row]);
      const slots = next[currentIndex];
      const emptyIdx = slots.findIndex((s) => s === null);
      if (emptyIdx === -1) return prev;
      slots[emptyIdx] = result;

      const filled = slots.filter((s) => s !== null).length;
      if (filled === MAX_DOTS && result === "good" && slots.every((s) => s === "good")) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 1200);
      }
      return next;
    });
  }, [currentIndex, isSlotsFull]);

  // 5개 채워졌을 때 SM-2 업데이트 (분석단어만, 한 번만)
  if (isSlotsFull && currentItem?.kind === "analysis" && currentItem.scheduleId && !savedIds.has(currentItem.scheduleId)) {
    const goodCount = currentSlots.filter((s) => s === "good").length;
    const quality = toQuality(goodCount);
    const sid = currentItem.scheduleId;
    setSavedIds((prev) => new Set(prev).add(sid));
    fetch("/api/review", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId: sid, quality }),
    }).catch(() => {});
  }

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setAllDone(true);
    }
  }, [currentIndex, items.length]);

  // ── 빈 상태 ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{ background: "linear-gradient(135deg, #F0FAF8 0%, #EDE9FE 100%)" }}
      >
        <div className="text-7xl mb-5 animate-float">🎉</div>
        <h2 className="text-2xl font-black text-[#3D3530] mb-2">오늘 복습할 단어가 없어요!</h2>
        <p className="text-[#8B7E74] mb-6 leading-relaxed">
          분석단어 훈련 후 평가를 매기면<br />
          망각 곡선에 맞춰 복습 일정이 잡혀요.
        </p>
        <Link href="/dashboard/practice">
          <BubbleButton variant="peach" size="lg">분석단어 훈련하기 →</BubbleButton>
        </Link>
      </div>
    );
  }

  // ── 완료 화면 ────────────────────────────────────────────────────────────
  if (allDone) {
    const masteredCount = savedIds.size;
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{ background: "linear-gradient(135deg, #F0FAF8 0%, #EDE9FE 100%)" }}
      >
        <ConfettiEffect trigger />
        <div className="text-8xl mb-4 animate-bounce-in">🎊</div>
        <h2 className="text-3xl font-black text-[#3D3530] mb-2">{childName} 잘했어요!</h2>
        <p className="text-[#8B7E74] mb-6">오늘의 복습 {masteredCount}개를 완료했어요</p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <span className="px-4 py-2 bg-[#7EDFD0]/20 rounded-full text-sm font-bold text-[#0D9488]">
            ⭐ {totalGood}번 성공
          </span>
        </div>
        <Link href="/dashboard">
          <BubbleButton variant="mint" size="xl">홈으로 가기 🏠</BubbleButton>
        </Link>
      </div>
    );
  }

  const masteryInfo = isSlotsFull ? getMasteryLabel(getMastery(currentSlots)) : null;

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "linear-gradient(135deg, #F0FAF8 0%, #EDE9FE 100%)" }}
    >
      <ConfettiEffect trigger={confetti} />

      {/* 진행 표시 바 */}
      <div className="max-w-lg mx-auto w-full px-5 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F0FAF8] text-[#0D9488]">
            🔁 오늘의 복습
          </span>
          <span className="text-xs text-[#8B7E74] font-semibold">
            {currentIndex + 1} / {items.length}
          </span>
        </div>
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentIndex + 1) / items.length) * 100}%`,
              backgroundColor: "#7EDFD0",
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="max-w-lg mx-auto w-full flex flex-col items-center gap-3 px-6">

          {/* 단어 카드 */}
          <div
            className="w-full bg-white/90 rounded-[32px] shadow-lg text-center relative"
            style={{ border: "2px solid #7EDFD022", padding: "2rem 1.5rem" }}
          >
            {/* ← 이전 */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="이전"
              className="group absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
            >
              <span className="w-10 h-10 rounded-full bg-white border-2 border-[#F0E8E0] flex items-center justify-center text-xl font-bold text-[#8B7E74] group-enabled:group-hover:bg-[#F0FAF8] group-enabled:group-hover:border-[#7EDFD0] group-enabled:group-hover:text-[#0D9488] transition-colors shadow-sm">
                ←
              </span>
              <span className="text-[10px] text-[#8B7E74] font-semibold">이전</span>
            </button>

            {/* → 다음 */}
            <button
              onClick={handleNext}
              aria-label="다음"
              className="group absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all active:scale-90"
            >
              <span className="w-10 h-10 rounded-full bg-white border-2 border-[#F0E8E0] flex items-center justify-center text-xl font-bold text-[#8B7E74] group-hover:bg-[#F0FAF8] group-hover:border-[#7EDFD0] group-hover:text-[#0D9488] transition-colors shadow-sm">
                →
              </span>
              <span className="text-[10px] text-[#8B7E74] font-semibold">다음</span>
            </button>

            {/* 음소 배지 (+ 유사단어면 출처) — 항상 한 줄, 높이 고정 */}
            <div className="flex items-center justify-center gap-1.5 mb-3 h-6">
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: "#F0FAF8", color: "#0D9488" }}
              >
                {currentItem.phoneme}
              </span>
              {currentItem.kind === "similar" && currentItem.sourceWord && (
                <span className="text-[11px] text-[#8B7E74]">
                  🔗 <b className="text-[#FFB38A]">{currentItem.sourceWord}</b>의 유사패턴 단어
                </span>
              )}
            </div>

            {/* 콘텐츠 슬롯 — 분석(비교)·유사(이미지+단어) 높이를 통일해 버튼이 안 튐 */}
            <div className="flex flex-col items-center justify-center gap-2" style={{ minHeight: 188 }}>
              {currentItem.kind === "similar" ? (
                (() => {
                  const w = currentItem.word;
                  const size = w.length <= 2 ? "3.5rem" : w.length === 3 ? "2.75rem" : "2.25rem";
                  return (
                    <>
                      <WordImage word={w} imageSlug={currentItem.imageSlug} size="lg" />
                      <p className="font-black text-[#3D3530] whitespace-nowrap leading-none" style={{ fontSize: size }}>
                        {w}
                      </p>
                    </>
                  );
                })()
              ) : (
                (() => {
                  const text = currentItem.word;
                  const childPron = currentItem.childPronunciation ?? "";
                  const maxLen = Math.max(text.length, childPron.length);
                  const left  = maxLen <= 2 ? "2.75rem" : maxLen === 3 ? "2.25rem" : maxLen === 4 ? "1.875rem" : "1.5rem";
                  const right = maxLen <= 2 ? "3.5rem"  : maxLen === 3 ? "2.75rem" : maxLen === 4 ? "2.25rem" : "1.875rem";
                  return (
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center min-w-0">
                        <p className="text-[10px] text-[#8B7E74] mb-0.5">아이 발음</p>
                        <p className="font-bold text-[#FCA5A5] whitespace-nowrap" style={{ fontSize: left }}>
                          {childPron}
                        </p>
                      </div>
                      <span className="text-2xl text-[#C4B5A8] flex-shrink-0">→</span>
                      <div className="text-center min-w-0">
                        <p className="text-[10px] text-[#8B7E74] mb-0.5">옳은 표현</p>
                        <p className="font-black text-[#3D3530] whitespace-nowrap" style={{ fontSize: right }}>
                          {text}
                        </p>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* 🔊 단어 다시 듣기 — 글자 못 읽는 아이도 소리로 확인 가능 (공통) */}
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleReplay}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0FAF8] hover:bg-[#D8EFEA] border border-[#7EDFD0] text-[#0D9488] font-bold text-sm transition-all active:scale-95"
                aria-label="단어 다시 듣기"
              >
                <span className="text-base">🔊</span>
                다시 듣기
              </button>
            </div>

            {/* 안내 문구 — 항상 한 줄, 높이 고정 */}
            <p className="text-xs text-[#C4B5A8] mt-3 leading-relaxed h-4">
              {currentItem.kind === "analysis"
                ? `💡 ${currentItem.reviewCount}회째 복습이에요`
                : "🔗 비슷한 소리 단어로 연습해요"}
            </p>
          </div>

          <CarTrack progress={carProgress} childImage={childImage} />

          <ResultDots slots={currentSlots} />

          {masteryInfo && (
            <div
              className="w-full rounded-2xl px-5 py-3 text-center animate-bounce-in"
              style={{ backgroundColor: masteryInfo.bg, border: `2px solid ${masteryInfo.border}` }}
            >
              <p className="font-black" style={{ color: masteryInfo.color }}>
                {masteryInfo.emoji} {masteryInfo.text}
              </p>
            </div>
          )}

          {!isSlotsFull && (
            <div className="text-center space-y-1">
              <p className="text-xs text-[#C4B5A8]">소리내어 읽으면 부모님이 판단해주세요</p>
              <p className="text-xs text-[#C4B5A8]">
                아이 발음을 듣고 버튼을 눌러주세요 ({filledCount}/{MAX_DOTS})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="max-w-lg mx-auto w-full px-6 pb-8 pt-5 space-y-3">
        {!isSlotsFull && (
          <div className="flex gap-3">
            <button
              onClick={() => fillDot("bad")}
              className="flex-1 py-4 rounded-2xl font-black text-base transition-all active:scale-95"
              style={{ backgroundColor: "#FDF2F8", border: "2px solid #F9A8D4", color: "#EC4899" }}
            >
              아직 어려워요 🔄
            </button>
            <button
              onClick={() => fillDot("good")}
              className="flex-1 py-4 rounded-2xl font-black text-base transition-all active:scale-95"
              style={{ backgroundColor: "#F0FAF8", border: "2px solid #7EDFD0", color: "#0D9488" }}
            >
              잘 됐어요 ✓
            </button>
          </div>
        )}

        <BubbleButton
          variant="white"
          size="md"
          onClick={handleNext}
          className="w-full"
        >
          {isLastItem ? "복습 완료 🎊" : "다음 →"}
        </BubbleButton>
      </div>
    </div>
  );
}
