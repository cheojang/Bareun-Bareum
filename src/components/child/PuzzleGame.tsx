"use client";

import { useState } from "react";
import { SoriMascot } from "@/components/ui/SoriMascot";
import { ConfettiEffect } from "@/components/child/ConfettiEffect";
import { shuffle, type PickCard } from "@/lib/mini-game";

/**
 * PuzzleGame — 단계 사이 "그림 조각 맞추기" 미니게임 (성취감 보상).
 *
 * 단어 그림을 2x2(4조각)로 나눠 섞고, 두 조각을 탭해서 자리를 바꿔 완성.
 * - 조각1 탭 → 선택, 조각2 탭 → 서로 위치 교환
 * - 모두 제자리면 완성: 전체 그림 + 단어 + 컨페티 → onDone
 */

interface Props {
  pool: PickCard[];
  onDone: () => void;
}

// 2x2 조각 위치 → background-position (조각 인덱스 0:좌상 1:우상 2:좌하 3:우하)
const POS = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"];

function scrambled(): number[] {
  // 정답([0,1,2,3])이 아닌 배치가 나올 때까지 섞기
  let t = shuffle([0, 1, 2, 3]);
  while (t.every((v, i) => v === i)) t = shuffle([0, 1, 2, 3]);
  return t;
}

export function PuzzleGame({ pool, onDone }: Props) {
  // 라운드 1회 — 그림 1개 사용 (랜덤)
  const [card] = useState(() => pool[Math.floor(Math.random() * pool.length)]);
  const [tiles, setTiles] = useState<number[]>(() => scrambled());
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const src = `/images/words/${card.imageSlug}.webp`;
  const BOARD = 240;
  const TILE = BOARD / 2;

  function handleTap(slot: number) {
    if (solved) return;
    if (selected === null) {
      setSelected(slot);
      return;
    }
    if (selected === slot) {
      setSelected(null);
      return;
    }
    // 두 조각 위치 교환
    const next = [...tiles];
    [next[selected], next[slot]] = [next[slot], next[selected]];
    setSelected(null);
    setTiles(next);

    if (next.every((v, i) => v === i)) {
      setSolved(true);
      setConfetti(true);
      setTimeout(() => {
        setConfetti(false);
        onDone();
      }, 1500);
    }
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6 text-center py-8 -mb-28 md:-mb-10 pb-28 md:pb-10"
      style={{ background: "linear-gradient(135deg, #F0FAF8 0%, #FFF5EE 50%, #EDE9FE 100%)" }}
    >
      <ConfettiEffect trigger={confetti} />

      <div className="animate-float mb-1">
        <SoriMascot size={72} variant="full" animated />
      </div>
      <h2 className="text-xl font-black text-[#3D3530] mb-1">그림 조각을 맞춰봐요 🧩</h2>
      <p className="text-sm text-[#8B7E74] mb-5">두 조각을 톡톡 눌러 바꿔요</p>

      {/* 퍼즐 보드 */}
      <div
        className={`relative rounded-3xl overflow-hidden shadow-lg ${solved ? "wordimg-pop" : ""}`}
        style={{ width: BOARD, height: BOARD, backgroundColor: "#fff" }}
      >
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full" style={{ gap: solved ? 0 : 3 }}>
          {tiles.map((piece, slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => handleTap(slot)}
              disabled={solved}
              className="transition-all active:scale-95"
              style={{
                width: TILE,
                height: TILE,
                backgroundImage: `url(${src})`,
                backgroundSize: "200% 200%",
                backgroundPosition: POS[piece],
                outline: selected === slot ? "3px solid #FFB38A" : "none",
                outlineOffset: -3,
                borderRadius: solved ? 0 : 8,
              }}
              aria-label={`조각 ${slot + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 완성 시 단어 공개 */}
      <div className="h-8 mt-3">
        {solved && <span className="font-black text-[#0D9488] text-xl animate-bounce-in">{card.word} 완성! 🎉</span>}
      </div>

      <button type="button" onClick={onDone} className="mt-4 text-xs text-[#8B7E74] underline underline-offset-2">
        건너뛰기 →
      </button>
    </div>
  );
}
