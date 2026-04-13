"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  stage1Words: ErrorWord[];
  stage2Words: string[];
  errorPattern?: string;
}

type Stage = 1 | 2 | 3;
type DotResult = "good" | "bad" | null;
type MasteryLevel = "mastered" | "medium" | "hard";

interface PracticeItem {
  text: string;
  kind: "word" | "sentence";
  badge?: string;
}

const MAX_DOTS = 5;

// ─── 단계 메타 ─────────────────────────────────────────────────────────────────

const STAGE_META: Record<Stage, { label: string; desc: string; color: string; bg: string }> = {
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

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function PracticeClient({
  childId,
  childName,
  mascotLevel,
  stage1Words,
  stage2Words,
  errorPattern,
}: Props) {
  const [stage, setStage] = useState<Stage>(1);
  const [showStageIntro, setShowStageIntro] = useState(false);
  const [nextStage, setNextStage] = useState<Stage | null>(null);

  const [items, setItems] = useState<PracticeItem[]>(
    stage1Words.map((e) => ({ text: e.word, kind: "word", badge: e.errorPattern }))
  );
  const [stage3Loading, setStage3Loading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  // 2D 배열: dotSlots[itemIdx][dotIdx] = 'good' | 'bad' | null
  const [dotSlots, setDotSlots] = useState<DotResult[][]>(
    () => Array.from({ length: stage1Words.length }, () => Array(MAX_DOTS).fill(null))
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

  // ── 단계 전환 ─────────────────────────────────────────────────────────────────
  const transitionToStage = useCallback(async (target: Stage) => {
    setNextStage(target);
    setShowStageIntro(true);

    if (target === 2) {
      const s2Items: PracticeItem[] = stage2Words.map((w) => ({ text: w, kind: "word" }));
      setItems(s2Items);
      setDotSlots(Array.from({ length: s2Items.length }, () => Array(MAX_DOTS).fill(null)));
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
  }, [stage1Words, stage2Words, errorPattern]);

  useEffect(() => {
    if (showStageIntro) {
      const timer = setTimeout(() => setShowStageIntro(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [showStageIntro]);

  // ── 도트 채우기 ───────────────────────────────────────────────────────────────
  const fillDot = useCallback((result: "good" | "bad") => {
    if (isSlotsFull) return;

    setDotSlots((prev) => {
      const next = prev.map((row) => [...row]);
      const slots = next[currentIndex];
      const emptyIdx = slots.findIndex((s) => s === null);
      if (emptyIdx === -1) return prev;
      slots[emptyIdx] = result;

      // 5개 모두 채워졌을 때 confetti + 자동 저장
      const filled = slots.filter((s) => s !== null).length;
      if (filled === MAX_DOTS) {
        if (result === "good" && slots.every((s) => s === "good")) {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 2000);
        }
      }

      return next;
    });
  }, [currentIndex, isSlotsFull]);

  // ── 자동 저장 (5개 채워졌을 때) ───────────────────────────────────────────────
  useEffect(() => {
    if (!isSlotsFull || !currentItem) return;
    if (autoSavedItems.has(currentItem.text)) return;
    if (saving) return;

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
        goodCount: currentSlots.filter((s) => s === "good").length,
      }),
    })
      .then(() => {
        setAutoSavedItems((prev) => new Map(prev).set(currentItem.text, mastery));
      })
      .catch(() => {/* 저장 실패 무시 */})
      .finally(() => setSaving(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSlotsFull]);

  // ── 다음 아이템 ───────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    if (stage === 1 && stage2Words.length > 0) {
      transitionToStage(2);
    } else if (stage === 1 || stage === 2) {
      transitionToStage(3);
    } else {
      setAllDone(true);
    }
  }, [currentIndex, items.length, stage, stage2Words.length, transitionToStage]);

  // ── 빈 상태 ──────────────────────────────────────────────────────────────────
  if (stage1Words.length === 0) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
      >
        <div className="text-7xl mb-5 animate-float">📝</div>
        <h2 className="text-2xl font-black text-[#3D3530] mb-2">연습 단어가 없어요</h2>
        <p className="text-[#8B7E74] mb-6 leading-relaxed">
          오답노트에서 발음을 먼저 입력하면<br />
          AI가 단계별 연습을 만들어드려요!
        </p>
        <Link href="/dashboard/answer-note">
          <BubbleButton variant="peach" size="lg">오답노트 작성하기 →</BubbleButton>
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
        <p className="text-[#8B7E74] mb-6">3단계 훈련을 모두 완료했어요!</p>
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
              💪 {needsWorkCount}개 추가 연습 필요
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
    const meta = STAGE_META[nextStage];
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
      >
        <div className="text-6xl mb-5 animate-bounce-in">
          {nextStage === 2 ? "🔤" : "💬"}
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
  const meta = STAGE_META[stage];
  const isLastItem = currentIndex + 1 >= items.length;
  const hasNextStage = (stage === 1 && stage2Words.length > 0) || stage === 1 || stage === 2;
  const masteryInfo = currentMastery ? getMasteryLabel(currentMastery) : null;
  const savedMastery = autoSavedItems.get(currentItem?.text ?? "");
  const goodCount = currentSlots.filter((s) => s === "good").length;

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
          ⭐ {totalGood}
        </div>
      </div>

      {/* 단계 표시 바 */}
      <div className="px-5 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
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
      </div>

      {/* 3단계 스텝 표시 */}
      <div className="flex justify-center gap-2 mb-2">
        {([1, 2, 3] as Stage[]).map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all"
              style={{
                backgroundColor: s === stage ? meta.color : s < stage ? "#7EDFD0" : "#F0E8E0",
                color: s <= stage ? "white" : "#C4B5A8",
              }}
            >
              {s < stage ? "✓" : s}
            </div>
            {s < 3 && (
              <div
                className="w-6 h-0.5 rounded"
                style={{ backgroundColor: s < stage ? "#7EDFD0" : "#F0E8E0" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">

        {/* 연습 카드 + 식물 성장 */}
        <div className="w-full flex items-end gap-3">
          <div
            className="flex-1 bg-white/90 rounded-[32px] shadow-lg text-center"
            style={{
              border: `2px solid ${meta.color}22`,
              padding: currentItem?.kind === "sentence" ? "2rem 1.5rem" : "2.5rem 1.5rem",
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
            <p
              className="font-black text-[#3D3530] tracking-wide leading-snug"
              style={{ fontSize: currentItem?.kind === "sentence" ? "1.75rem" : "4rem" }}
            >
              {currentItem?.text}
            </p>
            <p className="text-sm text-[#8B7E74] mt-3">
              {currentItem?.kind === "sentence"
                ? "문장을 천천히 읽어봐요"
                : "소리내어 읽으면 부모님이 판단해주세요"}
            </p>
          </div>

          {/* 식물 성장 애니메이션 */}
          <PlantGrowth goodCount={goodCount} />
        </div>

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
            {savedMastery && (
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

      {/* 하단 버튼 */}
      <div className="px-6 pb-8 space-y-3">
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
          {isLastItem
            ? hasNextStage && stage < 3
              ? `다음 단계로 → (${STAGE_META[(stage + 1) as Stage]?.label})`
              : "완료 🎊"
            : "다음 →"}
        </BubbleButton>
      </div>
    </div>
  );
}

// ─── 식물 성장 애니메이션 ──────────────────────────────────────────────────────

const PLANT_STAGES = [
  { emoji: "🫘", label: "씨앗 심기", fontSize: 28, bg: "#F5F0EB" },
  { emoji: "🌱", label: "새싹",      fontSize: 36, bg: "#F0FAF8" },
  { emoji: "🌿", label: "자라는 중", fontSize: 44, bg: "#DCFCE7" },
  { emoji: "🌲", label: "나무",      fontSize: 52, bg: "#BBF7D0" },
  { emoji: "🌳", label: "큰 나무",   fontSize: 60, bg: "#86EFAC" },
  { emoji: "🍑", label: "열매!",     fontSize: 68, bg: "#FDE68A" },
];

function PlantGrowth({ goodCount }: { goodCount: number }) {
  const stageIdx = Math.min(goodCount, PLANT_STAGES.length - 1);
  const stage = PLANT_STAGES[stageIdx];
  const isFruit = stageIdx === PLANT_STAGES.length - 1;
  const prevRef = useRef(goodCount);
  const didGrow = goodCount > prevRef.current;
  useEffect(() => { prevRef.current = goodCount; }, [goodCount]);

  return (
    <div
      className="flex flex-col items-center justify-end gap-1 flex-shrink-0"
      style={{ width: 72, paddingBottom: 4 }}
    >
      {/* 파티클 (성장 순간) */}
      <AnimatePresence>
        {didGrow && (
          <motion.div
            key={`spark-${goodCount}`}
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute text-lg pointer-events-none"
            style={{ marginBottom: stage.fontSize + 4 }}
          >
            ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* 이모지 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stageIdx}
          initial={{ scale: 0.4, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.4, y: -10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          style={{ fontSize: stage.fontSize, lineHeight: 1, display: "block" }}
        >
          {stage.emoji}
        </motion.div>
      </AnimatePresence>

      {/* 라벨 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`lbl-${stageIdx}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.15, duration: 0.25 }}
          className="text-center"
        >
          <span
            className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: stage.bg,
              color: isFruit ? "#92400E" : "#065F46",
            }}
          >
            {stage.label}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* 토양 (항상 표시) */}
      <div
        className="w-12 h-2 rounded-full mt-1"
        style={{ backgroundColor: "#D4B896", opacity: 0.5 }}
      />
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
              backgroundColor: isGood
                ? "#7EDFD0"
                : isBad
                ? "#F9A8D4"
                : "#F0E8E0",
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
