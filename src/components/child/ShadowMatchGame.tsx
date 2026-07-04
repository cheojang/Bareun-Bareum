"use client";

import { useState } from "react";
import { WordImage } from "@/components/ui/WordImage";
import { SoriMascot } from "@/components/ui/SoriMascot";
import { ConfettiEffect } from "@/components/child/ConfettiEffect";
import { buildRounds, type PickCard } from "@/lib/mini-game";

/**
 * ShadowMatchGame — 단계 사이 "그림자 맞추기" 미니게임 (말 안 하는 순수 시각 놀이 = 뇌 휴식).
 *
 * 위에 검은 실루엣(그림자) 하나를 보여주고, 아래 그림 카드 중 같은 모양을 탭.
 * - 정답: 그림자가 컬러로 변신 + 컨페티 + 단어 공개 → 다음 라운드 / 완료
 * - 오답: 빨강 흔들림(재시도)
 */

interface Props {
  pool: PickCard[];
  onDone: () => void;
  rounds?: number;
}

export function ShadowMatchGame({ pool, onDone, rounds = 2 }: Props) {
  const cardsPerRound = pool.length >= 3 ? 3 : 2;
  const [roundList] = useState(() => buildRounds(pool, rounds, cardsPerRound));
  const [roundIdx, setRoundIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongWord, setWrongWord] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  const round = roundList[roundIdx];
  if (!round) return null;

  function handlePick(card: PickCard) {
    if (solved) return;
    if (card.word === round.target.word) {
      setSolved(true);
      setConfetti(true);
      setTimeout(() => {
        setConfetti(false);
        if (roundIdx + 1 < roundList.length) {
          setRoundIdx((i) => i + 1);
          setSolved(false);
          setWrongWord(null);
        } else {
          onDone();
        }
      }, 1200);
    } else {
      setWrongWord(card.word);
      setTimeout(() => setWrongWord((w) => (w === card.word ? null : w)), 600);
    }
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6 text-center py-8 -mb-28 md:-mb-10 pb-28 md:pb-10"
      style={{ background: "linear-gradient(135deg, #EDE9FE 0%, #F0FAF8 50%, #FFF5EE 100%)" }}
    >
      <ConfettiEffect trigger={confetti} />

      {/* 라운드 진행 점 */}
      <div className="flex gap-2 mb-4">
        {roundList.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === roundIdx ? 20 : 10,
              height: 10,
              backgroundColor:
                i < roundIdx || (i === roundIdx && solved) ? "#7EDFD0" : i === roundIdx ? "#C4B5FD" : "rgba(255,255,255,0.6)",
            }}
          />
        ))}
      </div>

      <div className="animate-float mb-1">
        <SoriMascot size={72} variant="full" animated />
      </div>
      <h2 className="text-xl font-black text-[#3D3530] mb-1">그림자는 누구일까요? 🌗</h2>
      <p className="text-sm text-[#8B7E74] mb-4">같은 모양을 찾아봐요</p>

      {/* 정답 실루엣(그림자) — 맞히면 컬러로 변신 */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-inner">
        {solved ? (
          <div className="wordimg-pop flex flex-col items-center">
            <WordImage word={round.target.word} imageSlug={round.target.imageSlug} size="xl" />
            <span className="mt-1 font-black text-[#0D9488] text-lg animate-bounce-in">{round.target.word}</span>
          </div>
        ) : (
          <WordImage word={round.target.word} imageSlug={round.target.imageSlug} size="xl" silhouette />
        )}
      </div>

      {/* 보기 카드 */}
      <div className={`grid gap-4 ${cardsPerRound === 3 ? "grid-cols-3" : "grid-cols-2"} w-full max-w-md`}>
        {round.options.map((card) => {
          const isTarget = card.word === round.target.word;
          const isWrong = wrongWord === card.word;
          return (
            <button
              key={card.word}
              type="button"
              onClick={() => handlePick(card)}
              disabled={solved}
              className={`relative bg-white/90 rounded-3xl p-3 flex items-center justify-center shadow-md transition-all active:scale-95 ${isWrong ? "buddy-wobble" : ""}`}
              style={{
                border: `3px solid ${solved && isTarget ? "#7EDFD0" : isWrong ? "#F9A8D4" : "#F0E8E0"}`,
                opacity: solved && !isTarget ? 0.4 : 1,
              }}
            >
              <WordImage word={card.word} imageSlug={card.imageSlug} size="lg" />
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onDone} className="mt-7 text-xs text-[#8B7E74] underline underline-offset-2">
        건너뛰기 →
      </button>
    </div>
  );
}
