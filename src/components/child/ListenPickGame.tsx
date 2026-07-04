"use client";

import { useEffect, useState } from "react";
import { WordImage } from "@/components/ui/WordImage";
import { SoriMascot } from "@/components/ui/SoriMascot";
import { ConfettiEffect } from "@/components/child/ConfettiEffect";
import { useTTS } from "@/lib/useTTS";
import { buildRounds, type PickCard } from "@/lib/mini-game";

export type { PickCard };

/**
 * ListenPickGame — 단계 사이 "소리 듣고 그림 맞추기" 미니게임 (뇌 휴식 + 청각 변별 훈련).
 *
 * 소리새가 단어를 말해주면(TTS) 아이가 그림 카드 중 맞는 것을 탭합니다.
 * - 단어 글자는 숨기고 그림만 보여줌 → 진짜 "듣고 고르기"
 * - 정답: 초록 하이라이트 + 컨페티 → 다음 라운드 / 완료
 * - 오답: 빨강 흔들림 + 정답 단어 다시 들려줌(재시도)
 * 짧게(기본 2라운드) 끝내고 onDone으로 다음 단계로 넘깁니다.
 */

interface Props {
  /** 그림 있는 단어 후보 (2개 이상이어야 의미 있음) */
  pool: PickCard[];
  onDone: () => void;
  rounds?: number;
}

export function ListenPickGame({ pool, onDone, rounds = 2 }: Props) {
  const cardsPerRound = pool.length >= 3 ? 3 : 2;
  const [roundList] = useState(() => buildRounds(pool, rounds, cardsPerRound));
  const [roundIdx, setRoundIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongWord, setWrongWord] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const { play, stop } = useTTS();

  const round = roundList[roundIdx];

  // 라운드 진입 시 정답 단어 음성 재생
  useEffect(() => {
    if (!round) return;
    const t = setTimeout(() => play(round.target.word).catch(() => {}), 400);
    return () => {
      clearTimeout(t);
      stop();
    };
  }, [roundIdx, round, play, stop]);

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
      }, 1100);
    } else {
      setWrongWord(card.word);
      play(round.target.word).catch(() => {});
      setTimeout(() => setWrongWord((w) => (w === card.word ? null : w)), 600);
    }
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6 text-center py-8 -mb-28 md:-mb-10 pb-28 md:pb-10"
      style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
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
              backgroundColor: i < roundIdx || (i === roundIdx && solved) ? "#7EDFD0" : i === roundIdx ? "#FFB38A" : "rgba(255,255,255,0.6)",
            }}
          />
        ))}
      </div>

      {/* 소리새 + 안내 */}
      <div className="animate-float mb-1">
        <SoriMascot size={84} variant="full" animated />
      </div>
      <h2 className="text-xl font-black text-[#3D3530] mb-1">잠깐! 소리 듣고 맞춰봐요 🎧</h2>
      <p className="text-sm text-[#8B7E74] mb-4">어떤 그림일까요?</p>

      {/* 다시 듣기 */}
      <button
        type="button"
        onClick={() => play(round.target.word).catch(() => {})}
        className="flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full bg-white shadow-sm border border-[#7EDFD0] text-[#0D9488] font-black transition-all active:scale-95"
      >
        <span className="text-lg">🔊</span> 다시 듣기
      </button>

      {/* 그림 카드 — 글자는 숨김(정답 맞히면 공개) */}
      <div className={`grid gap-4 ${cardsPerRound === 3 ? "grid-cols-3" : "grid-cols-2"} w-full max-w-md`}>
        {round.options.map((card) => {
          const isTarget = card.word === round.target.word;
          const isCorrect = solved && isTarget;
          const isWrong = wrongWord === card.word;
          return (
            <button
              key={card.word}
              type="button"
              onClick={() => handlePick(card)}
              className={`relative bg-white/90 rounded-3xl p-3 flex flex-col items-center justify-center shadow-md transition-all active:scale-95 ${isWrong ? "buddy-wobble" : ""}`}
              style={{
                border: `3px solid ${isCorrect ? "#7EDFD0" : isWrong ? "#F9A8D4" : "#F0E8E0"}`,
                opacity: solved && !isTarget ? 0.45 : 1,
              }}
            >
              <WordImage word={card.word} imageSlug={card.imageSlug} size="xl" />
              {/* 정답 맞히면 단어 공개 */}
              {isCorrect && (
                <span className="mt-1 font-black text-[#0D9488] text-lg animate-bounce-in">{card.word}</span>
              )}
              {isCorrect && (
                <span className="absolute -top-2 -right-2 text-2xl animate-bounce-in">⭐</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 건너뛰기 — 아이가 흥미 없을 때 부모가 바로 넘기기 */}
      <button
        type="button"
        onClick={onDone}
        className="mt-7 text-xs text-[#8B7E74] underline underline-offset-2"
      >
        건너뛰기 →
      </button>
    </div>
  );
}
