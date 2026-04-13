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

interface Props {
  childId: string;
  childName: string;
  mascotLevel: number;
  stage1Words: ErrorWord[];    // 1단계: 오답 단어
  stage2Words: string[];       // 2단계: 유사 패턴 단어 (AI 추천)
  errorPattern?: string;       // 주요 오류 패턴 (문장 생성에 활용)
}

type Stage = 1 | 2 | 3;

interface PracticeItem {
  text: string;          // 단어 또는 문장
  kind: "word" | "sentence";
  badge?: string;        // 오류 패턴 레이블
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

  // 단계별 아이템 목록
  const [items, setItems] = useState<PracticeItem[]>(
    stage1Words.map((e) => ({ text: e.word, kind: "word", badge: e.errorPattern }))
  );
  const [stage3Loading, setStage3Loading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [successes, setSuccesses] = useState<number[]>(new Array(items.length).fill(0));
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [allDone, setAllDone] = useState(false);

  // 전체 성공 횟수
  const totalSuccess = successes.reduce((a, b) => a + b, 0);
  const currentItem = items[currentIndex];
  const currentSuccess = successes[currentIndex] ?? 0;
  const isSaved = savedItems.has(currentItem?.text ?? "");

  // ── 단계 전환 ─────────────────────────────────────────────────────────────────
  const transitionToStage = useCallback(async (target: Stage) => {
    setNextStage(target);
    setShowStageIntro(true);

    if (target === 2) {
      const s2Items: PracticeItem[] = stage2Words.map((w) => ({
        text: w,
        kind: "word",
      }));
      setItems(s2Items);
      setSuccesses(new Array(s2Items.length).fill(0));
    } else if (target === 3) {
      setStage3Loading(true);
      // 1+2단계 단어를 모아 문장 생성 API 호출
      const allWords = [
        ...stage1Words.map((e) => e.word),
        ...stage2Words,
      ];
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
        setSuccesses(new Array(s3Items.length).fill(0));
      } catch {
        // 폴백: 단어 그대로 문장처럼
        const fallback: PracticeItem[] = allWords.slice(0, 5).map((w) => ({
          text: `${w}을 말해봐요!`,
          kind: "sentence",
        }));
        setItems(fallback);
        setSuccesses(new Array(fallback.length).fill(0));
      } finally {
        setStage3Loading(false);
      }
    }

    setCurrentIndex(0);
    setStage(target);
  }, [stage1Words, stage2Words, errorPattern]);

  // 단계 인트로 자동 닫기
  useEffect(() => {
    if (showStageIntro) {
      const timer = setTimeout(() => setShowStageIntro(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [showStageIntro]);

  // ── 성공 처리 ─────────────────────────────────────────────────────────────────
  const handleSuccess = useCallback(() => {
    const next = currentSuccess + 1;
    const updated = [...successes];
    updated[currentIndex] = next;
    setSuccesses(updated);

    if (next === MAX_DOTS) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
    }
  }, [successes, currentIndex, currentSuccess]);

  // ── 복습 저장 ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (saving || isSaved || !currentItem) return;
    setSaving(true);
    try {
      await fetch("/api/saved-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          word: currentItem.text,
          targetPhoneme: currentItem.badge ?? errorPattern ?? "연습",
          difficulty: currentItem.kind === "sentence" ? "hard" : stage === 1 ? "hard" : "medium",
        }),
      });
      setSavedItems((prev) => new Set(prev).add(currentItem.text));
    } catch {
      // 저장 실패 무시
    } finally {
      setSaving(false);
    }
  }, [saving, isSaved, currentItem, childId, errorPattern, stage]);

  // ── 다음 아이템 ───────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    // 현재 단계 마지막 아이템 → 다음 단계로
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
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
      >
        <ConfettiEffect trigger />
        <div className="text-8xl mb-4 animate-bounce-in">🎉</div>
        <h2 className="text-3xl font-black text-[#3D3530] mb-2">{childName} 최고야!</h2>
        <p className="text-[#8B7E74] mb-2">3단계 훈련을 모두 완료했어요!</p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <span className="px-4 py-2 bg-[#FFB38A]/20 rounded-full text-sm font-bold text-[#FFB38A]">
            ⭐ {totalSuccess}번 성공
          </span>
          {savedItems.size > 0 && (
            <span className="px-4 py-2 bg-[#7EDFD0]/20 rounded-full text-sm font-bold text-[#0D9488]">
              📌 {savedItems.size}개 복습 저장
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

      {/* 단계 표시 바 */}
      <div className="px-5 py-3">
        <div className="max-w-lg mx-auto">
          {/* 단계 레이블 */}
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
          {/* 진행 바 */}
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
          <div
            key={s}
            className="flex items-center gap-1"
          >
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">

        {/* 연습 카드 + 복습 저장 버튼 */}
        <div className="w-full relative">
          <div
            className="w-full bg-white/90 rounded-[32px] shadow-lg text-center"
            style={{
              border: `2px solid ${meta.color}22`,
              padding: currentItem?.kind === "sentence" ? "2rem 2rem" : "2.5rem 2rem",
            }}
          >
            {/* 배지 (오류 패턴) */}
            {currentItem?.badge && (
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: meta.bg, color: meta.color }}
              >
                {currentItem.badge}
              </span>
            )}

            {/* 단어 or 문장 */}
            <p
              className="font-black text-[#3D3530] tracking-wide leading-snug"
              style={{ fontSize: currentItem?.kind === "sentence" ? "1.875rem" : "4.5rem" }}
            >
              {currentItem?.text}
            </p>

            {/* 안내 텍스트 */}
            <p className="text-sm text-[#8B7E74] mt-3">
              {currentItem?.kind === "sentence"
                ? "문장을 천천히 읽어봐요"
                : "소리내어 읽으면 부모님이 판단해주세요"}
            </p>
          </div>

          {/* 복습 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all"
            style={{
              backgroundColor: isSaved ? "#FDE68A" : "rgba(255,255,255,0.85)",
              border: isSaved ? "2px solid #F59E0B" : "2px solid #F0E8E0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            title="나중에 복습할 단어로 저장"
          >
            <span className="text-xl">{isSaved ? "📌" : "☆"}</span>
          </button>
        </div>

        {/* 저장 안내 */}
        {!isSaved ? (
          <p className="text-xs text-[#C4B5A8] text-center">
            ☆ 아직 잘 안 되면 눌러서 나중에 복습해요
          </p>
        ) : (
          <p className="text-xs text-[#D97706] font-semibold text-center animate-bounce-in">
            📌 복습 목록에 저장됐어요!
          </p>
        )}

        {/* 성공 도트 */}
        <SuccessDots count={currentSuccess} max={MAX_DOTS} />

        {/* 5회 달성 */}
        {currentSuccess >= MAX_DOTS && (
          <div className="w-full bg-[#F0FAF8] border-2 border-[#7EDFD0] rounded-2xl px-5 py-3 text-center animate-bounce-in">
            <p className="font-black text-[#0D9488]">🎉 5번 성공! 정말 잘했어요!</p>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-8 space-y-3">
        <BubbleButton variant="peach" size="xl" onClick={handleSuccess} className="w-full">
          잘 됐어요! ✓
        </BubbleButton>

        <BubbleButton variant="white" size="md" onClick={handleNext} className="w-full">
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

// ─── 성공 도트 ────────────────────────────────────────────────────────────────

function SuccessDots({ count, max }: { count: number; max: number }) {
  const display = Math.min(count, max);
  const overflow = count > max ? count - max : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-2">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < display;
          const isNew = i === display - 1 && count <= max;
          return (
            <div
              key={i}
              className="transition-all duration-300"
              style={{
                width: 18, height: 18, borderRadius: "50%",
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
