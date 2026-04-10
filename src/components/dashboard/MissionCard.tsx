"use client";

import { useState } from "react";

interface MissionCardProps {
  phoneme: string;
  missionText: string;
  targetCount: number;
}

export function MissionCard({ phoneme, missionText, targetCount }: MissionCardProps) {
  const [done, setDone] = useState(false);

  return (
    <div
      className={`rounded-[28px] p-4 transition-all ${
        done
          ? "bg-[#F0FAF8] border-2 border-[#7EDFD0]"
          : "bg-[#FFF5EE] border-2 border-[#FFD4B8]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{done ? "🎖️" : "🎯"}</div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-[#8B7E74] mb-0.5">오늘의 미션</p>
          <p className="font-black text-[#3D3530] text-sm">
            {done ? "미션 완료! 🎉" : missionText}
          </p>
          {!done && (
            <p className="text-xs text-[#8B7E74] mt-0.5">
              목표: <strong className="text-[#FFB38A]">'{phoneme}' 소리 {targetCount}번 성공</strong>
            </p>
          )}
        </div>
        {!done && (
          <button
            onClick={() => setDone(true)}
            className="bg-[#FFB38A] text-white rounded-full px-3 py-1.5 text-xs font-bold active:scale-95 transition-all"
          >
            완료!
          </button>
        )}
      </div>
    </div>
  );
}
