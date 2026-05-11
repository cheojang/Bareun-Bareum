"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { fetchJson } from "@/lib/client-fetch";

import type { Mission } from "@/types/missions";

interface Props {
  childId: string;
}

const META: Record<Mission["type"], { icon: string; label: string; color: string; textColor: string; href: string }> = {
  review: {
    icon: "🔁",
    label: "오늘의 복습",
    color: "bg-[#FFE5CC]",
    textColor: "text-[#D97706]",
    href: "/dashboard/bookmarks",
  },
  weakness: {
    icon: "🎯",
    label: "약점 훈련",
    color: "bg-[#FEE2E2]",
    textColor: "text-[#DC2626]",
    href: "/dashboard/practice",
  },
  challenge: {
    icon: "✨",
    label: "새 도전",
    color: "bg-[#E0F2FE]",
    textColor: "text-[#0284C7]",
    href: "/dashboard/practice",
  },
};

export function DailyMissionsCard({ childId }: Props) {
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchJson<{ missions?: Mission[]; totalReviewPending?: number }>(
      `/api/daily-missions?childId=${encodeURIComponent(childId)}`,
    )
      .then((d) => {
        if (cancelled) return;
        setMissions(d?.missions ?? []);
        setTotalPending(d?.totalReviewPending ?? 0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [childId]);

  return (
    <BubbleCard className="border-2 border-[#FFD9B8]">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-base font-black text-[#3D3530]">🎒 오늘의 미션</p>
          <p className="text-[11px] text-[#8B7E74] mt-0.5">
            5~7분이면 끝나요. 하나씩 눌러 시작해보세요!
          </p>
        </div>
        {totalPending > 3 && (
          <span className="text-[10px] font-bold text-[#D97706] bg-[#FFF5EE] rounded-full px-2 py-0.5">
            복습 대기 {totalPending}개
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-[#F5EDE5] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && missions && missions.length === 0 && (
        <div className="bg-[#F0FAF8] border border-[#B5EAD7] rounded-2xl px-4 py-5 text-center">
          <p className="text-2xl mb-1">🌱</p>
          <p className="text-sm font-bold text-[#3D3530]">오늘은 부담 없이 쉬어요</p>
          <p className="text-[11px] text-[#8B7E74] mt-1">
            새 오답을 입력하거나 추천 단어를 저장하면 미션이 채워져요.
          </p>
        </div>
      )}

      {!loading && missions && missions.length > 0 && (
        <div className="space-y-2">
          {missions.map((m, i) => {
            const meta = META[m.type];
            const word =
              m.type === "review" || m.type === "challenge" ? m.targetWord : `${m.phoneme} 훈련`;
            return (
              <Link
                key={i}
                href={meta.href}
                className={`flex items-center gap-3 ${meta.color} rounded-2xl px-4 py-3 hover:opacity-90 transition`}
              >
                <span className="text-xl flex-shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-black ${meta.textColor}`}>{meta.label}</span>
                    <span className="text-sm font-black text-[#3D3530] truncate">{word}</span>
                  </div>
                  <p className="text-[11px] text-[#5C5047] truncate">{m.hint}</p>
                </div>
                <span className="text-[#8B7E74] text-sm flex-shrink-0">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </BubbleCard>
  );
}
