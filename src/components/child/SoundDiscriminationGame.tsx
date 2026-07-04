"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WordImage } from "@/components/ui/WordImage";
import { SoriMascot } from "@/components/ui/SoriMascot";
import { ConfettiEffect } from "@/components/child/ConfettiEffect";
import { useTTS } from "@/lib/useTTS";

/**
 * SoundDiscriminationGame — 산출 전 "청지각 변별" 훈련 (§4-3).
 *
 * 그림(목표 단어)을 보여주고, 정발음과 아이의 오발음을 무작위 순서로 들려준 뒤
 * "그림에 맞는 소리"를 고르게 한다. 말하기 전에 두 소리의 차이를 귀로 구별하는
 * 능력을 길러 준다(조음치료의 청지각 변별 단계). 아이는 말하지 않고 듣고 고르기만 함.
 * - 정답: 초록 + 컨페티 → 다음/완료
 * - 오답: 흔들림 + 정답 소리 다시 → 재시도
 */

export interface DiscrimPair {
  word: string;        // 정발음(목표 단어)
  childPron: string;   // 오발음(아이가 실제로 말한 것)
  imageSlug?: string;
}

interface Props {
  pairs: DiscrimPair[];
  onDone: () => void;
  rounds?: number;
}

interface Round {
  pair: DiscrimPair;
  /** 왼쪽 버튼이 정답인지 (무작위) */
  correctLeft: boolean;
}

export function SoundDiscriminationGame({ pairs, onDone, rounds = 2 }: Props) {
  const roundList = useMemo<Round[]>(() => {
    // 정발음≠오발음 이고 그림이 있는 쌍만 사용
    const valid = pairs.filter((p) => p.childPron && p.childPron !== p.word);
    const picked: Round[] = [];
    for (let i = 0; i < Math.min(rounds, valid.length || 1); i++) {
      const pair = valid[i % Math.max(valid.length, 1)];
      if (!pair) break;
      // 결정적 셔플(빌드/렌더 안정) — 인덱스 기반으로 좌우 배치
      picked.push({ pair, correctLeft: (i % 2 === 0) });
    }
    return picked;
  }, [pairs, rounds]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<"left" | "right" | null>(null);
  const [confetti, setConfetti] = useState(false);
  const { play, stop } = useTTS();

  const round = roundList[roundIdx];

  // 유효한 변별쌍이 없으면 게임을 건너뜀.
  // ⚠️ 렌더 도중 onDone()(부모 setState)을 호출하면 React가 "Cannot update a component
  //    while rendering a different component" 오류를 던져 앱 전체가 크래시함 → effect에서 1회만 호출.
  const skippedRef = useRef(false);
  useEffect(() => {
    if (roundList.length === 0 && !skippedRef.current) {
      skippedRef.current = true;
      onDone();
    }
  }, [roundList.length, onDone]);

  // 라운드 진입 시 두 소리를 차례로 들려줌 (정답 → 오답 순서 무관, 위치만 무작위)
  useEffect(() => {
    if (!round) return;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 350));
      if (cancelled) return;
      try {
        await play(round.pair.word);
        await new Promise((r) => setTimeout(r, 500));
        if (cancelled) return;
        await play(round.pair.childPron);
      } catch { /* TTS 실패 무시 */ }
    };
    run();
    return () => { cancelled = true; stop(); };
  }, [roundIdx, round, play, stop]);

  if (!round) return null; // 스킵은 위 effect에서 처리 (렌더 중 setState 금지)

  function pick(side: "left" | "right") {
    if (solved || !round) return;
    const isCorrect = (side === "left") === round.correctLeft;
    if (isCorrect) {
      setSolved(true);
      setConfetti(true);
      play(round.pair.word).catch(() => {});
      setTimeout(() => {
        setConfetti(false);
        if (roundIdx + 1 < roundList.length) {
          setRoundIdx((i) => i + 1);
          setSolved(false);
          setWrong(null);
        } else {
          onDone();
        }
      }, 1200);
    } else {
      setWrong(side);
      play(round.pair.word).catch(() => {});
      setTimeout(() => setWrong((w) => (w === side ? null : w)), 600);
    }
  }

  const leftIsCorrect = round.correctLeft;

  const SoundButton = ({ side }: { side: "left" | "right" }) => {
    const isCorrectSide = (side === "left") === leftIsCorrect;
    const revealed = solved && isCorrectSide;
    const isWrong = wrong === side;
    // 버튼을 누르면 그 자리의 소리를 재생 (선택 전 미리듣기) — 정답 판정은 pick에서
    const soundWord = isCorrectSide ? round.pair.word : round.pair.childPron;
    return (
      <button
        type="button"
        onClick={() => pick(side)}
        onDoubleClick={() => play(soundWord).catch(() => {})}
        className={`relative flex-1 bg-white/95 rounded-3xl px-4 py-6 flex flex-col items-center gap-2 shadow-md transition-all active:scale-95 ${isWrong ? "buddy-wobble" : ""}`}
        style={{
          border: `3px solid ${revealed ? "#7EDFD0" : isWrong ? "#F9A8D4" : "#F0E8E0"}`,
          opacity: solved && !isCorrectSide ? 0.4 : 1,
        }}
      >
        <span className="text-4xl">🔊</span>
        <span className="text-sm font-black text-[#8B7E74]">
          {side === "left" ? "소리 1" : "소리 2"}
        </span>
        {revealed && (
          <>
            <span className="mt-0.5 font-black text-[#0D9488] text-base animate-bounce-in">{round.pair.word}</span>
            <span className="absolute -top-2 -right-2 text-2xl animate-bounce-in">⭐</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
    >
      <ConfettiEffect trigger={confetti} />

      {/* 라운드 점 */}
      <div className="flex gap-2 mb-4">
        {roundList.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === roundIdx ? 20 : 10,
              height: 10,
              backgroundColor:
                i < roundIdx || (i === roundIdx && solved) ? "#7EDFD0" : i === roundIdx ? "#FFB38A" : "rgba(255,255,255,0.6)",
            }}
          />
        ))}
      </div>

      <div className="animate-float mb-1">
        <SoriMascot size={80} variant="full" animated />
      </div>
      <h2 className="text-xl font-black text-[#3D3530] mb-1">어떤 소리가 맞을까요? 🎧</h2>
      <p className="text-sm text-[#8B7E74] mb-4">그림에 <b className="text-[#FFB38A]">맞는 소리</b>를 골라요</p>

      {/* 목표 그림 */}
      <div className="mb-5">
        {round.pair.imageSlug ? (
          <WordImage word={round.pair.word} imageSlug={round.pair.imageSlug} size="xl" />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-white/70 flex items-center justify-center text-4xl">🖼️</div>
        )}
      </div>

      {/* 두 소리 버튼 */}
      <div className="flex gap-4 w-full max-w-sm">
        <SoundButton side="left" />
        <SoundButton side="right" />
      </div>

      {/* 다시 듣기 (두 소리 차례로) */}
      <button
        type="button"
        onClick={async () => {
          try { await play(round.pair.word); await new Promise((r) => setTimeout(r, 500)); await play(round.pair.childPron); } catch { /* noop */ }
        }}
        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white shadow-sm border border-[#7EDFD0] text-[#0D9488] font-black transition-all active:scale-95"
      >
        <span className="text-lg">🔊</span> 두 소리 다시 듣기
      </button>

      <button type="button" onClick={onDone} className="mt-5 text-xs text-[#8B7E74] underline underline-offset-2">
        건너뛰기 →
      </button>
    </div>
  );
}
