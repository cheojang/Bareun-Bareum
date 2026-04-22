"use client";

import { useState, useCallback, useEffect } from "react";

import { ConfettiEffect } from "@/components/child/ConfettiEffect";
import { MascotCharacter } from "@/components/child/MascotCharacter";
import { BubbleButton } from "@/components/ui/BubbleButton";
import Link from "next/link";

// ─── 타입 ──────────────────────────────────────────────────────────────────────

interface ErrorWord {
  word: string;
  errorPattern: string;
}

interface ReviewWord {
  id: string;
  targetWord: string;
  childPronunciation: string;
  phoneme: string;
  reviewCount: number;
}

interface Props {
  childId: string;
  childName: string;
  mascotLevel: number;
  reviewItems: ReviewWord[];
  stage1Words: ErrorWord[];
  stage2Words: string[];
  errorPattern?: string;
}

type Stage = "review" | 1 | 2 | 3;
type DotResult = "good" | "bad" | null;
type MasteryLevel = "mastered" | "medium" | "hard";

interface PracticeItem {
  text: string;
  kind: "word" | "sentence";
  badge?: string;
  scheduleId?: string;       // 복습 아이템만
  childPron?: string;        // 복습 아이템에서 아이 발음 표시용
}

const MAX_DOTS = 5;

// ─── 단계 메타 ─────────────────────────────────────────────────────────────────

const STAGE_META: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  review: {
    label: "오늘의 복습",
    desc: "지난번에 어려웠던 단어를 다시 연습해요",
    color: "#7C6FCD",
    bg: "#F5F3FF",
  },
  1: {
    label: "1단계 · 오답 단어",
    desc: "틀렸던 단어부터 다시 연습해요",
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  2: {
    label: "2단계 · 유사 패턴 단어",
    desc: "같은 소리가 들어간 단어들이에요",
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
  3: {
    label: "3단계 · 문장으로 확장",
    desc: "연습한 단어가 들어간 짧은 문장이에요",
    color: "#0D9488",
    bg: "#F0FAF8",
  },
};

// ─── 숙달 레벨 판정 ────────────────────────────────────────────────────────────

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

// quality 0~5 계산 (goodCount/5 기반)
function toQuality(goodCount: number): number {
  if (goodCount >= 5) return 5;
  if (goodCount >= 4) return 4;
  if (goodCount >= 3) return 3;
  if (goodCount >= 2) return 1;
  return 0;
}

// ─── 자동차 트랙 컴포넌트 ──────────────────────────────────────────────────────

function CarTrack({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress));
  const leftPct = 6 + pct * 82; // 6%~88% 범위

  return (
    <div className="relative w-full h-11 select-none">
      {/* 도로 */}
      <div className="absolute inset-x-5 bottom-2 h-3 bg-[#F0E8E0] rounded-full overflow-hidden shadow-inner">
        {/* 차선 (점선) */}
        <div className="absolute inset-0 flex items-center justify-around px-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-3 h-0.5 bg-white/50 rounded-full" />
          ))}
        </div>
        {/* 진행 채우기 */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct * 100}%`,
            background: "linear-gradient(90deg, #FFD9B8, #FFB38A)",
          }}
        />
      </div>
      {/* 출발 */}
      <div className="absolute bottom-1.5 left-1 text-sm">🏁</div>
      {/* 목표 */}
      <div className="absolute bottom-1.5 right-1 text-sm">⭐</div>
      {/* 자동차 */}
      <div
        className="absolute bottom-3 text-2xl transition-all duration-700 ease-out"
        style={{
          left: `${leftPct}%`,
          transform: "translateX(-50%)",
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))",
        }}
      >
        🚗
      </div>
    </div>
  );
}

// ─── 결과 도트 컴포넌트 ────────────────────────────────────────────────────────

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

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function PracticeClient({
  childId,
  childName,
  mascotLevel,
  reviewItems,
  stage1Words,
  stage2Words,
  errorPattern,
}: Props) {
  // 복습 아이템이 있으면 복습 단계부터 시작
  const startStage: Stage = reviewItems.length > 0 ? "review" : 1;

  const [stage, setStage] = useState<Stage>(startStage);
  const [showStageIntro, setShowStageIntro] = useState(false);
  const [nextStage, setNextStage] = useState<Stage | null>(null);

  const makeItems = (s: Stage): PracticeItem[] => {
    if (s === "review") {
      return reviewItems.map((r) => ({
        text: r.targetWord,
        kind: "word" as const,
        badge: r.phoneme,
        scheduleId: r.id,
        childPron: r.childPronunciation,
      }));
    }
    if (s === 1) return stage1Words.map((e) => ({ text: e.word, kind: "word" as const, badge: e.errorPattern }));
    if (s === 2) return stage2Words.map((w) => ({ text: w, kind: "word" as const }));
    return [];
  };

  const [items, setItems] = useState<PracticeItem[]>(() => makeItems(startStage));
  const [stage3Loading, setStage3Loading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dotSlots, setDotSlots] = useState<DotResult[][]>(
    () => Array.from({ length: Math.max(makeItems(startStage).length, 1) }, () => Array(MAX_DOTS).fill(null))
  );

  const [autoSavedItems, setAutoSavedItems] = useState<Map<string, MasteryLevel>>(new Map());
  const [saving, setSaving] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const totalGood = dotSlots.flat().filter((s) => s === "good").length;
  const currentSlots = dotSlots[currentIndex] ?? Array(MAX_DOTS).fill(null);
  const filledCount = currentSlots.filter((s) => s !== null).length;
  const isSlotsFull = filledCount >= MAX_DOTS;
  const currentMastery = isSlotsFull ? getMastery(currentSlots) : null;
  const currentItem = items[currentIndex];

  // 자동차 진행률: 현재 단계 내 진행 상황
  const carProgress = items.length > 0
    ? (currentIndex + (isSlotsFull ? 1 : 0)) / items.length
    : 0;

  // ── 단계 전환 ─────────────────────────────────────────────────────────────────
  const transitionToStage = useCallback(
    async (target: Stage) => {
      setNextStage(target);
      setShowStageIntro(true);

      if (target === "review") {
        const rItems = makeItems("review");
        setItems(rItems);
        setDotSlots(Array.from({ length: rItems.length }, () => Array(MAX_DOTS).fill(null)));
      } else if (target === 1) {
        const s1 = makeItems(1);
        setItems(s1);
        setDotSlots(Array.from({ length: s1.length }, () => Array(MAX_DOTS).fill(null)));
      } else if (target === 2) {
        const s2 = makeItems(2);
        setItems(s2);
        setDotSlots(Array.from({ length: s2.length }, () => Array(MAX_DOTS).fill(null)));
      } else if (target === 3) {
        setStage3Loading(true);
        const allWords = [...stage1Words.map((e) => e.word), ...stage2Words];
        try {
          const res = await fetch("/api/practice-sentences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ words: allWords, errorPattern }),
          });
          const data = await res.json();
          const s3Items: PracticeItem[] = (data.sentences as string[]).map((s) => ({
            text: s,
            kind: "sentence",
          }));
          setItems(s3Items);
          setDotSlots(Array.from({ length: s3Items.length }, () => Array(MAX_DOTS).fill(null)));
        } catch {
          const fallback: PracticeItem[] = allWords.slice(0, 5).map((w) => ({
            text: `${w}을 말해봐요!`,
            kind: "sentence",
          }));
          setItems(fallback);
          setDotSlots(Array.from({ length: fallback.length }, () => Array(MAX_DOTS).fill(null)));
        } finally {
          setStage3Loading(false);
        }
      }

      setCurrentIndex(0);
      setStage(target);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage1Words, stage2Words, errorPattern, reviewItems]
  );

  useEffect(() => {
    if (showStageIntro) {
      const timer = setTimeout(() => setShowStageIntro(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [showStageIntro]);

  // ── 도트 채우기 ───────────────────────────────────────────────────────────────
  const fillDot = useCallback(
    (result: "good" | "bad") => {
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
          setTimeout(() => setConfetti(false), 2000);
        }
        return next;
      });
    },
    [currentIndex, isSlotsFull]
  );

  // ── 5개 채워졌을 때 처리 ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSlotsFull || !currentItem) return;

    const goodCount = currentSlots.filter((s) => s === "good").length;

    if (currentItem.scheduleId) {
      // 복습 아이템: SM-2 업데이트
      const quality = toQuality(goodCount);
      fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: currentItem.scheduleId, quality }),
      }).catch(() => {});
      return;
    }

    // 문장 단계 — 저장하지 않음
    if (currentItem.kind === "sentence") return;

    // 이미 저장됐거나 저장 중이면 스킵
    if (autoSavedItems.has(currentItem.text) || saving) return;

    const mastery = getMastery(currentSlots);
    setSaving(true);
    fetch("/api/saved-words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        word: currentItem.text,
        targetPhoneme: currentItem.badge ?? errorPattern ?? "연습",
        difficulty: mastery === "mastered" ? "easy" : mastery === "medium" ? "medium" : "hard",
        masteryLevel: mastery,
        goodCount,
      }),
    })
      .then(() => {
        setAutoSavedItems((prev) => new Map(prev).set(currentItem.text, mastery));
      })
      .catch(() => {})
      .finally(() => setSaving(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSlotsFull]);

  // ── 다음 아이템 ───────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    // 현재 단계/페이즈 완료
    if (stage === "review") {
      if (stage1Words.length > 0) {
        transitionToStage(1);
      } else {
        setAllDone(true);
      }
      return;
    }
    if (stage === 1 && stage2Words.length > 0) {
      transitionToStage(2);
    } else if (stage === 1 || stage === 2) {
      transitionToStage(3);
    } else {
      setAllDone(true);
    }
  }, [currentIndex, items.length, stage, stage1Words.length, stage2Words.length, transitionToStage]);

  // ── 빈 상태 ──────────────────────────────────────────────────────────────────
  if (stage1Words.length === 0 && reviewItems.length === 0) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
      >
        <div className="text-7xl mb-5 animate-float">📝</div>
        <h2 className="text-2xl font-black text-[#3D3530] mb-2">연습 단어가 없어요</h2>
        <p className="text-[#8B7E74] mb-6 leading-relaxed">
          발음 분석에서 발음을 먼저 입력하면<br />
          AI가 단계별 연습을 만들어드려요!
        </p>
        <Link href="/dashboard/answer-note">
          <BubbleButton variant="peach" size="lg">발음 분석 작성하기 →</BubbleButton>
        </Link>
      </div>
    );
  }

  // ── 전체 완료 화면 ────────────────────────────────────────────────────────────
  if (allDone) {
    const masteredCount = [...autoSavedItems.values()].filter((v) => v === "mastered").length;
    const needsWorkCount = [...autoSavedItems.values()].filter((v) => v === "hard").length;
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
      >
        <ConfettiEffect trigger />
        <div className="text-8xl mb-4 animate-bounce-in">🎉</div>
        <h2 className="text-3xl font-black text-[#3D3530] mb-2">{childName} 최고야!</h2>
        <p className="text-[#8B7E74] mb-6">오늘 연습을 모두 완료했어요!</p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <span className="px-4 py-2 bg-[#7EDFD0]/20 rounded-full text-sm font-bold text-[#0D9488]">
            ⭐ {totalGood}번 성공
          </span>
          {masteredCount > 0 && (
            <span className="px-4 py-2 bg-[#F0FAF8] rounded-full text-sm font-bold text-[#0D9488]">
              🌟 {masteredCount}개 완벽 마스터
            </span>
          )}
          {needsWorkCount > 0 && (
            <span className="px-4 py-2 bg-[#FDF2F8] rounded-full text-sm font-bold text-[#EC4899]">
              💪 {needsWorkCount}개 내일 다시 연습해요
            </span>
          )}
        </div>
        <Link href="/dashboard">
          <BubbleButton variant="peach" size="xl">홈으로 가기 🏠</BubbleButton>
        </Link>
      </div>
    );
  }

  // ── 단계 전환 인트로 ──────────────────────────────────────────────────────────
  if (showStageIntro && nextStage) {
    const meta = STAGE_META[nextStage as string];
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
      >
        <div className="text-6xl mb-5 animate-bounce-in">
          {nextStage === "review" ? "🔔" : nextStage === 2 ? "🔤" : nextStage === 3 ? "💬" : "📝"}
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
        <h2 className="text-2xl font-black text-[#3D3530] mb-2">{meta.desc}</h2>
        {nextStage === 3 && stage3Loading && (
          <p className="text-sm text-[#8B7E74] mt-2 animate-pulse">
            AI가 문장을 만들고 있어요...
          </p>
        )}
      </div>
    );
  }

  // ── 연습 화면 ─────────────────────────────────────────────────────────────────
  const meta = STAGE_META[stage as string];
  const isLastItem = currentIndex + 1 >= items.length;
  const masteryInfo = currentMastery ? getMasteryLabel(currentMastery) : null;
  const savedMastery = autoSavedItems.get(currentItem?.text ?? "");
  const goodCount = currentSlots.filter((s) => s === "good").length;

  // 다음 버튼 레이블
  const getNextLabel = () => {
    if (!isLastItem) return "다음 →";
    if (stage === "review") {
      return stage1Words.length > 0 ? `오늘 연습 시작 → (${STAGE_META[1].label})` : "완료 🎊";
    }
    if (stage === 1 && stage2Words.length > 0) return `다음 단계 → (${STAGE_META[2].label})`;
    if (stage === 1 || stage === 2) return `다음 단계 → (${STAGE_META[3].label})`;
    return "완료 🎊";
  };

  // 단계 인디케이터 (복습 포함)
  const stageSteps = (
    [
      { key: "review" as Stage, show: reviewItems.length > 0 },
      { key: 1 as Stage, show: stage1Words.length > 0 },
      { key: 2 as Stage, show: stage2Words.length > 0 },
      { key: 3 as Stage, show: true },
    ] as { key: Stage; show: boolean }[]
  ).filter((s) => s.show);

  const stageIdx = stageSteps.findIndex((s) => s.key === stage);

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
    >
      <ConfettiEffect trigger={confetti} />

      {/* 헤더 */}
      <div className="max-w-lg mx-auto w-full flex items-center justify-between px-5 pt-6 pb-2">
        <Link href="/dashboard">
          <button className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-xl shadow-sm">
            ←
          </button>
        </Link>
        <MascotCharacter level={mascotLevel} size="sm" />
        <div className="bg-white/80 rounded-full px-4 py-2 font-black text-[#FFB38A]">
          ⭐ {totalGood}
        </div>
      </div>

      {/* 단계 표시 바 */}
      <div className="max-w-lg mx-auto w-full px-5 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {meta.label}
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
              backgroundColor: meta.color,
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="max-w-lg mx-auto w-full flex justify-center gap-2 mb-1">
        {stageSteps.map((s, i) => {
          const sMeta = STAGE_META[s.key as string];
          const isPast = i < stageIdx;
          const isCurrent = i === stageIdx;
          return (
            <div key={String(s.key)} className="flex items-center gap-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all"
                style={{
                  backgroundColor: isCurrent ? sMeta.color : isPast ? "#7EDFD0" : "#F0E8E0",
                  color: isCurrent || isPast ? "white" : "#C4B5A8",
                }}
              >
                {isPast ? "✓" : i + 1}
              </div>
              {i < stageSteps.length - 1 && (
                <div
                  className="w-6 h-0.5 rounded"
                  style={{ backgroundColor: isPast ? "#7EDFD0" : "#F0E8E0" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="max-w-lg mx-auto w-full flex flex-col items-center gap-3 px-6">

          {/* 연습 카드 */}
          <div
            className="w-full bg-white/90 rounded-[32px] shadow-lg text-center"
            style={{
              border: `2px solid ${meta.color}22`,
              padding: currentItem?.kind === "sentence" ? "2rem 1.5rem" : "2rem 1.5rem",
            }}
          >
            {currentItem?.badge && (
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: meta.bg, color: meta.color }}
              >
                {currentItem.badge}
              </span>
            )}

            {/* 복습 아이템: 목표 단어 → 아이 발음 함께 표시 */}
            {currentItem?.scheduleId && currentItem.childPron ? (
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="text-center">
                  <p className="text-[10px] text-[#8B7E74] mb-0.5">목표</p>
                  <p className="text-4xl font-black text-[#3D3530]">{currentItem.text}</p>
                </div>
                <span className="text-2xl text-[#C4B5A8]">→</span>
                <div className="text-center">
                  <p className="text-[10px] text-[#8B7E74] mb-0.5">아이 발음</p>
                  <p className="text-3xl font-bold text-[#FCA5A5]">{currentItem.childPron}</p>
                </div>
              </div>
            ) : (
              <p
                className="font-black text-[#3D3530] tracking-wide leading-snug"
                style={{ fontSize: currentItem?.kind === "sentence" ? "1.75rem" : "4rem" }}
              >
                {currentItem?.text}
              </p>
            )}

            <p className="text-sm text-[#8B7E74] mt-2">
              {currentItem?.kind === "sentence"
                ? "문장을 천천히 읽어봐요"
                : "소리내어 읽으면 부모님이 판단해주세요"}
            </p>
          </div>

          {/* 🚗 자동차 트랙 */}
          <CarTrack progress={carProgress} />

          {/* 도트 (5개) */}
          <ResultDots slots={currentSlots} />

          {/* 5개 채워졌을 때 마스터리 카드 */}
          {masteryInfo && (
            <div
              className="w-full rounded-2xl px-5 py-3 text-center animate-bounce-in"
              style={{
                backgroundColor: masteryInfo.bg,
                border: `2px solid ${masteryInfo.border}`,
              }}
            >
              <p className="font-black" style={{ color: masteryInfo.color }}>
                {masteryInfo.emoji} {masteryInfo.text}
              </p>
              {!currentItem?.scheduleId && savedMastery && (
                <p className="text-xs mt-1 opacity-70" style={{ color: masteryInfo.color }}>
                  {savedMastery === "mastered"
                    ? "복습 주기가 길게 설정됐어요 🗓"
                    : "복습 목록에 추가됐어요 📌"}
                </p>
              )}
            </div>
          )}

          {/* 도트 안내 */}
          {!isSlotsFull && (
            <p className="text-xs text-[#C4B5A8] text-center">
              아이 발음을 듣고 버튼을 눌러주세요 ({filledCount}/{MAX_DOTS})
            </p>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="max-w-lg mx-auto w-full px-6 pb-8 space-y-3">
        {/* 평가 버튼 2개 */}
        {!isSlotsFull && (
          <div className="flex gap-3">
            <button
              onClick={() => fillDot("bad")}
              className="flex-1 py-4 rounded-2xl font-black text-base transition-all active:scale-95"
              style={{
                backgroundColor: "#FDF2F8",
                border: "2px solid #F9A8D4",
                color: "#EC4899",
              }}
            >
              아직 어려워요 🔄
            </button>
            <button
              onClick={() => fillDot("good")}
              className="flex-1 py-4 rounded-2xl font-black text-base transition-all active:scale-95"
              style={{
                backgroundColor: "#F0FAF8",
                border: "2px solid #7EDFD0",
                color: "#0D9488",
              }}
            >
              잘 됐어요 ✓
            </button>
          </div>
        )}

        {/* 다음 버튼 */}
        <BubbleButton
          variant="white"
          size="md"
          onClick={handleNext}
          className="w-full"
        >
          {getNextLabel()}
        </BubbleButton>
      </div>
    </div>
  );
}
