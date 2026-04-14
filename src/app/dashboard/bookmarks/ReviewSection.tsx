"use client";

import { useState } from "react";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { PastelBadge } from "@/components/ui/PastelBadge";

interface ReviewItem {
  id: string;
  targetWord: string;
  childPronunciation: string;
  phoneme: string;
  errorPattern: string;
  reviewCount: number;
  interval: number;
  nextReviewAt: string;
}

interface ReviewSectionProps {
  initialItems: ReviewItem[];
  childName: string;
}

export function ReviewSection({ initialItems, childName }: ReviewSectionProps) {
  const [items, setItems] = useState<ReviewItem[]>(initialItems);
  const [done, setDone] = useState<Record<string, { quality: number; message: string }>>({});
  const [loading, setLoading] = useState<string | null>(null);

  async function handleReview(id: string, quality: number) {
    setLoading(id);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: id, quality }),
      });
      const data = await res.json();

      setDone((prev) => ({ ...prev, [id]: { quality, message: data.message } }));

      if (data.isLearned) {
        // 졸업 단어는 목록에서 제거
        setTimeout(() => {
          setItems((prev) => prev.filter((item) => item.id !== id));
        }, 1500);
      }
    } catch {
      // 실패해도 UI는 정상 유지
    } finally {
      setLoading(null);
    }
  }

  const remaining = items.filter((item) => !done[item.id] || !done[item.id]);
  const doneCount = Object.keys(done).length;
  const allDone = doneCount > 0 && doneCount >= items.length;

  if (items.length === 0) return null;

  return (
    <section>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="font-bold text-[#3D3530]">🔔 오늘 복습할 단어</p>
          {doneCount < items.length && (
            <span className="text-xs font-bold px-2 py-0.5 bg-[#FEE2E2] text-[#EF4444] rounded-full">
              {items.length - doneCount}개 남음
            </span>
          )}
        </div>
        <p className="text-xs text-[#8B7E74]">망각 곡선 복습</p>
      </div>

      {/* 전체 완료 상태 */}
      {allDone ? (
        <BubbleCard color="mint" className="text-center py-6">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-bold text-[#3D3530]">오늘 복습 완료!</p>
          <p className="text-sm text-[#8B7E74] mt-1">
            {childName}이(가) 열심히 했어요
          </p>
        </BubbleCard>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const result = done[item.id];
            const isLoading = loading === item.id;

            return (
              <BubbleCard key={item.id} padding="sm">
                {result ? (
                  /* 평가 완료 상태 */
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{result.quality >= 3 ? "✅" : "💪"}</span>
                    <div className="flex-1">
                      <p className="font-bold text-[#3D3530]">{item.targetWord}</p>
                      <p className="text-xs text-[#8B7E74] mt-0.5 leading-relaxed">
                        {result.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 평가 전 상태 */
                  <div className="space-y-3">
                    {/* 단어 정보 */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-black text-[#3D3530]">
                            {item.targetWord}
                          </span>
                          <span className="text-[#C4B5A8]">→</span>
                          <span className="text-xl font-bold text-[#FCA5A5]">
                            {item.childPronunciation}
                          </span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          <PastelBadge color="lavender">{item.phoneme}</PastelBadge>
                          <PastelBadge color="pink">{item.errorPattern}</PastelBadge>
                          <PastelBadge color="yellow">
                            {item.reviewCount === 0
                              ? "첫 복습"
                              : `${item.reviewCount}회차`}
                          </PastelBadge>
                        </div>
                      </div>
                    </div>

                    {/* 평가 버튼 */}
                    <div className="flex gap-2">
                      <BubbleButton
                        variant="mint"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleReview(item.id, 5)}
                        className="flex-1 text-sm"
                      >
                        {isLoading ? "..." : "✅ 잘 했어요"}
                      </BubbleButton>
                      <BubbleButton
                        variant="white"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleReview(item.id, 1)}
                        className="flex-1 text-sm"
                      >
                        {isLoading ? "..." : "💪 아직 어려워요"}
                      </BubbleButton>
                    </div>
                  </div>
                )}
              </BubbleCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
