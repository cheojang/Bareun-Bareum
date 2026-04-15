"use client";

import { useState, useMemo } from "react";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { SoriMascot } from "@/components/ui/SoriMascot";
import { WordImage } from "@/components/ui/WordImage";
import { getWordByText } from "@/lib/word-database";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PairData {
  id: string;
  word1: string;
  word2: string;
  label: string;
  targetPhoneme: string;
  contrastPhoneme: string;
}

interface Trial {
  target: string;
  chosen: string;
  correct: boolean;
}

type Phase = "reveal" | "respond" | "feedback" | "pair-done" | "all-done";

interface Props {
  pairs: PairData[];
  childName: string;
}

const TRIALS_PER_WORD = 3; // word1×3 + word2×3 = 6회/쌍

// ─── Shuffle helper ───────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MinimalPairsPracticeClient({ pairs, childName }: Props) {
  const [pairIndex, setPairIndex] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [phase, setPhase] = useState<Phase>("reveal");
  const [showTarget, setShowTarget] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalTrials, setTotalTrials] = useState(0);

  const currentPair = pairs[pairIndex];

  // 현재 쌍의 랜덤 시도 순서 (pairIndex 바뀔 때마다 새로 생성)
  const trialSequence = useMemo<string[]>(() => {
    if (!currentPair) return [];
    return shuffle([
      ...Array(TRIALS_PER_WORD).fill(currentPair.word1),
      ...Array(TRIALS_PER_WORD).fill(currentPair.word2),
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairIndex]);

  const totalTrialCount = trialSequence.length;
  const currentTarget = trialSequence[trialIndex] ?? "";
  const isLastTrial = trialIndex >= totalTrialCount - 1;

  const pairCorrect = trials.filter((t) => t.correct).length;

  // ── 단어 확인 후 → 아이 반응 단계 ─────────────────────────────────────────
  function handleReveal() {
    setShowTarget(false);
    setPhase("respond");
  }

  // ── 아이가 카드 선택 ───────────────────────────────────────────────────────
  function handleChoice(chosen: string) {
    const correct = chosen === currentTarget;
    const newTrial: Trial = { target: currentTarget, chosen, correct };

    setTrials((prev) => [...prev, newTrial]);
    if (correct) setTotalCorrect((n) => n + 1);
    setTotalTrials((n) => n + 1);
    setPhase("feedback");

    setTimeout(() => {
      if (isLastTrial) {
        setPhase("pair-done");
      } else {
        setTrialIndex((i) => i + 1);
        setShowTarget(false);
        setPhase("reveal");
      }
    }, 1600);
  }

  // ── 다음 대립쌍 ───────────────────────────────────────────────────────────
  function nextPair() {
    if (pairIndex + 1 >= pairs.length) {
      setPhase("all-done");
    } else {
      setPairIndex((i) => i + 1);
      setTrialIndex(0);
      setTrials([]);
      setShowTarget(false);
      setPhase("reveal");
    }
  }

  // ── 완료 화면 ─────────────────────────────────────────────────────────────
  if (phase === "all-done") {
    const pct = Math.round((totalCorrect / Math.max(totalTrials, 1)) * 100);
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 animate-bounce-in">
          <SoriMascot size={130} variant="full" animated />
        </div>
        <h2 className="text-3xl font-black text-[#3D3530] mb-2">변별 훈련 완료! 🎉</h2>
        <p className="text-[#8B7E74] mb-2">
          {totalTrials}번 중 {totalCorrect}번 정확하게 구별했어요!
        </p>
        <div className="text-4xl font-black text-[#FFB38A] mb-8">{pct}점</div>
        <BubbleButton
          variant="peach"
          size="lg"
          onClick={() => (window.location.href = "/dashboard")}
          className="w-full max-w-xs"
        >
          홈으로 돌아가기
        </BubbleButton>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 max-w-lg mx-auto space-y-4 pb-8">

      {/* ── 전체 진행바 ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#8B7E74]">발음 변별 훈련</span>
          <span className="text-sm font-semibold text-[#3D3530]">
            {pairIndex + 1} / {pairs.length} 쌍
          </span>
        </div>
        <div className="w-full h-3 bg-[#F0E8E0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7EDFD0] rounded-full transition-all duration-500"
            style={{ width: `${(pairIndex / pairs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── 현재 쌍 정보 + 시도 도트 ────────────────────────────────── */}
      {phase !== "pair-done" && currentPair && (
        <BubbleCard color="mint" padding="sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[#3D3530]">
              {currentPair.word1} ↔ {currentPair.word2}
            </span>
            <span className="text-xs bg-white/70 rounded-full px-2 py-0.5 text-[#8B7E74]">
              {currentPair.label}
            </span>
          </div>
          <div className="flex gap-1.5">
            {trialSequence.map((_, i) => {
              const t = trials[i];
              return (
                <div
                  key={i}
                  className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${
                    t == null
                      ? i === trialIndex ? "bg-[#C4F0E8]" : "bg-[#F0E8E0]"
                      : t.correct
                      ? "bg-[#7EDFD0]"
                      : "bg-[#FFB38A]"
                  }`}
                />
              );
            })}
          </div>
          <p className="text-xs text-[#8B7E74] mt-1.5">
            {trialIndex + 1}/{totalTrialCount}번째 시도
          </p>
        </BubbleCard>
      )}

      {/* ── REVEAL: 부모님이 말할 단어 확인 ─────────────────────────── */}
      {phase === "reveal" && (
        <div className="space-y-4">
          <BubbleCard className="text-center">
            <p className="text-xs font-semibold text-[#8B7E74] mb-1">👁 부모님만 확인하세요</p>
            <p className="text-sm text-[#3D3530] mb-4">
              아래 카드를 탭해서 말할 단어를 확인하고, 아이에게 소리내어 말해주세요
            </p>

            {!showTarget ? (
              <button
                onClick={() => setShowTarget(true)}
                className="w-full py-8 bg-[#F0FAF8] rounded-3xl border-2 border-dashed border-[#7EDFD0] flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <span className="text-3xl">🔍</span>
                <span className="font-bold text-[#7EDFD0] text-sm">탭하여 말할 단어 확인</span>
              </button>
            ) : (
              <div className="w-full py-6 bg-[#F0FAF8] rounded-3xl border-2 border-[#7EDFD0] text-center">
                <p className="text-xs text-[#8B7E74] mb-1">이 단어를 소리내어 말해주세요</p>
                <p className="text-5xl font-black text-[#3D3530] mb-1">{currentTarget}</p>
                <p className="text-sm text-[#7EDFD0] font-semibold">"{currentTarget}"</p>
              </div>
            )}
          </BubbleCard>

          {showTarget && (
            <BubbleButton variant="mint" size="lg" onClick={handleReveal} className="w-full">
              말했어요 → 아이 반응 보기
            </BubbleButton>
          )}
        </div>
      )}

      {/* ── RESPOND: 두 카드 보여주기 ───────────────────────────────── */}
      {phase === "respond" && currentPair && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-black text-[#3D3530]">어떤 단어야?</p>
            <p className="text-xs text-[#8B7E74] mt-1">아이가 가리키는 카드를 탭해주세요</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[currentPair.word1, currentPair.word2].map((word) => (
              <button
                key={word}
                onClick={() => handleChoice(word)}
                className="flex flex-col items-center p-6 rounded-[28px] bg-white shadow-md active:scale-95 transition-transform"
                style={{ border: "3px solid #F0E8E0" }}
              >
                <WordImage
                  word={word}
                  imageSlug={getWordByText(word)?.imageSlug}
                  size="lg"
                  className="mb-3"
                />
                <p className="text-3xl font-black text-[#3D3530]">{word}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── FEEDBACK: 즉시 결과 ──────────────────────────────────────── */}
      {phase === "feedback" && trials[trialIndex] && (
        <BubbleCard
          color={trials[trialIndex].correct ? "mint" : "peach"}
          className="text-center py-8 animate-bounce-in"
        >
          <div className="text-6xl mb-3">
            {trials[trialIndex].correct ? "🌟" : "💪"}
          </div>
          <p className="text-2xl font-black text-[#3D3530] mb-1">
            {trials[trialIndex].correct ? "맞아요!" : "아쉬워요!"}
          </p>
          {!trials[trialIndex].correct && (
            <p className="text-sm text-[#8B7E74]">
              말한 단어: <strong className="text-[#3D3530]">{trials[trialIndex].target}</strong>
              {" "}→ 아이가 고른 것:{" "}
              <strong className="text-[#FFB38A]">{trials[trialIndex].chosen}</strong>
            </p>
          )}
        </BubbleCard>
      )}

      {/* ── PAIR-DONE: 쌍 결과 ──────────────────────────────────────── */}
      {phase === "pair-done" && currentPair && (
        <BubbleCard
          color={pairCorrect >= totalTrialCount * 0.7 ? "mint" : "white"}
          className="text-center py-6 animate-bounce-in"
        >
          <div className="text-5xl mb-3">
            {pairCorrect >= totalTrialCount * 0.7 ? "🎉" : "💪"}
          </div>
          <p className="text-xl font-black text-[#3D3530] mb-1">
            {currentPair.word1} ↔ {currentPair.word2}
          </p>
          <p className="text-xs text-[#8B7E74] mb-3">{currentPair.label}</p>

          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-black text-[#FFB38A]">{pairCorrect}</p>
              <p className="text-xs text-[#8B7E74]">정확</p>
            </div>
            <div className="text-[#F0E8E0] text-2xl font-light">/</div>
            <div className="text-center">
              <p className="text-3xl font-black text-[#3D3530]">{totalTrialCount}</p>
              <p className="text-xs text-[#8B7E74]">전체</p>
            </div>
          </div>

          {pairCorrect < totalTrialCount * 0.5 && (
            <div className="mb-4 px-4 py-3 bg-[#FFF5EE] rounded-2xl text-sm text-[#8B7E74] text-left">
              💡 이 소리 구별이 아직 어려워요. 오답 노트에 기록해두고 반복 연습해보세요.
            </div>
          )}
          {pairCorrect >= totalTrialCount * 0.8 && (
            <div className="mb-4 px-4 py-3 bg-[#F0FAF8] rounded-2xl text-sm text-[#3D3530] text-left">
              🚀 이 소리 구별을 잘 해요! 다음 단계로 넘어가도 좋아요.
            </div>
          )}

          <BubbleButton variant="mint" size="lg" onClick={nextPair} className="w-full">
            {pairIndex + 1 >= pairs.length ? "훈련 완료! 🎉" : "다음 대립쌍 →"}
          </BubbleButton>
        </BubbleCard>
      )}
    </div>
  );
}
