"use client";

import { useEffect, useState } from "react";
import { SoriMascot } from "@/components/ui/SoriMascot";

/**
 * ReviewBuddy — 복습 화면에 함께하는 소리새 친구.
 *
 * 매 평가마다 콩콩 뛰거나 갸우뚱하며 말풍선으로 아이를 응원합니다.
 * - cheer: 잘 됐어요 → "우와!" 등 칭찬 + 콩콩 점프
 * - celebrate: 5개 모두 완료 → 크게 환호
 * - oops: 아직 어려워요 → 다정하게 "괜찮아!" + 갸우뚱
 *
 * 부모가 누르는 평가 버튼이 트리거(reactionId 증가)가 됩니다.
 */

export type BuddyReaction = "cheer" | "celebrate" | "oops" | null;

const CHEERS = ["우와!", "잘한다!", "최고야!", "멋져!", "대단해!", "신난다!", "좋았어!"];
const OOPS = ["괜찮아!", "다시 해보자!", "할 수 있어!", "천천히 해도 돼!"];

interface Props {
  reactionType: BuddyReaction;
  /** 평가할 때마다 1씩 증가 — 같은 reaction이어도 재실행시키는 키 */
  reactionId: number;
}

export function ReviewBuddy({ reactionType, reactionId }: Props) {
  const [bubble, setBubble] = useState<string | null>(null);
  const [anim, setAnim] = useState<string>("");

  useEffect(() => {
    if (reactionId === 0 || !reactionType) return;

    let phrase: string;
    if (reactionType === "celebrate") phrase = "다 했어! 🎉";
    else if (reactionType === "cheer") phrase = CHEERS[Math.floor(Math.random() * CHEERS.length)];
    else phrase = OOPS[Math.floor(Math.random() * OOPS.length)];

    setBubble(phrase);
    setAnim(reactionType === "oops" ? "buddy-wobble" : "buddy-hop");

    const tAnim = setTimeout(() => setAnim(""), 650);
    const tBubble = setTimeout(() => setBubble(null), 1500);
    return () => {
      clearTimeout(tAnim);
      clearTimeout(tBubble);
    };
  }, [reactionId, reactionType]);

  return (
    <div className="relative flex flex-col items-center" style={{ width: 96 }}>
      {/* 말풍선 */}
      {bubble && (
        <div className="absolute -top-9 px-3 py-1.5 rounded-2xl bg-white shadow-md border border-[#F0E8E0] text-sm font-black text-[#3D3530] whitespace-nowrap animate-bounce-in z-10">
          {bubble}
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-2.5 h-2.5 bg-white border-r border-b border-[#F0E8E0] rotate-45" />
        </div>
      )}

      {/* 소리새 — 반응에 따라 점프/갸우뚱 */}
      <div className={anim} style={{ transformOrigin: "bottom center" }}>
        <SoriMascot size={68} variant="full" animated />
      </div>
    </div>
  );
}
