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
  trainingStep1?: string | null;
  trainingStep2?: string | null;
  trainingStep3?: string | null;
  trainingStep4?: string | null;
}

interface ReviewSectionProps {
  initialItems: ReviewItem[];
  childName: string;
}

const STEP_LABELS = ["1단계", "2단계", "3단계", "4단계"];
const STEP_COLORS = [
  "text-[#7C6FCD]",
  "text-[#0284C7]",
  "text-[#059669]",
  "text-[#D97706]",
];

function truncate(text: string, max = 40) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// 일반화 프로브(졸업 시험) 진행 상태 — scheduleId별
interface ProbeState {
  words: string[];
  phoneme: string;
  results: (boolean | null)[]; // 각 새 단어를 아이가 잘했는지
}

export function ReviewSection({ initialItems, childName }: ReviewSectionProps) {
  const [items, setItems] = useState<ReviewItem[]>(initialItems);
  const [done, setDone] = useState<Record<string, { quality: number; message: string }>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [probes, setProbes] = useState<Record<string, ProbeState>>({});

  async function handleReview(id: string, quality: number) {
    setLoading(id);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: id, quality }),
      });
      const data = await res.json();

      // 🎓 5회 성공 → 졸업 시험(일반화 프로브)으로 전환: 새 단어로도 되는지 확인
      if (data.needsProbe && Array.isArray(data.probeWords) && data.probeWords.length > 0) {
        setProbes((prev) => ({
          ...prev,
          [id]: { words: data.probeWords, phoneme: data.phoneme ?? "", results: data.probeWords.map(() => null) },
        }));
        return;
      }

      setDone((prev) => ({ ...prev, [id]: { quality, message: data.message } }));
      if (data.isLearned) {
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

  function markProbeWord(id: string, idx: number, ok: boolean) {
    setProbes((prev) => {
      const p = prev[id];
      if (!p) return prev;
      const results = [...p.results];
      results[idx] = ok;
      return { ...prev, [id]: { ...p, results } };
    });
  }

  async function submitProbe(id: string) {
    const p = probes[id];
    if (!p || p.results.some((r) => r === null)) return;
    const good = p.results.filter((r) => r === true).length;
    const pass = good * 2 >= p.words.length; // 과반 성공 = 통과
    setLoading(id);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: id, probe: pass ? "pass" : "fail" }),
      });
      const data = await res.json();
      setProbes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setDone((prev) => ({ ...prev, [id]: { quality: pass ? 5 : 1, message: data.message } }));
      if (data.graduated) {
        setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== id)), 1500);
      }
    } catch {
      // 실패해도 UI 유지
    } finally {
      setLoading(null);
    }
  }

  const doneCount = Object.keys(done).length;
  const allDone = doneCount > 0 && doneCount >= items.length;

  if (items.length === 0) return null;

  return (
    <section>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-[#3D3530]">🔔 오늘 복습할 단어</p>
          {doneCount < items.length && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#FEE2E2] text-[#EF4444] rounded-full">
              {items.length - doneCount}개 남음
            </span>
          )}
        </div>
        <p className="text-[10px] text-[#8B7E74]">망각 곡선 복습</p>
      </div>

      {/* 전체 완료 상태 */}
      {allDone ? (
        <BubbleCard color="mint" className="text-center py-4">
          <div className="text-3xl mb-1">🎉</div>
          <p className="text-sm font-bold text-[#3D3530]">오늘 복습 완료!</p>
          <p className="text-xs text-[#8B7E74] mt-0.5">{childName}이(가) 열심히 했어요</p>
        </BubbleCard>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const result = done[item.id];
            const isLoading = loading === item.id;
            const steps = [item.trainingStep1, item.trainingStep2, item.trainingStep3, item.trainingStep4];
            const hasSteps = steps.some(Boolean);

            const probe = probes[item.id];

            return (
              <BubbleCard key={item.id} padding="sm">
                {result ? (
                  /* 평가 완료 */
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{result.quality >= 3 ? "✅" : "💪"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#3D3530]">{item.targetWord}</p>
                      <p className="text-[11px] text-[#8B7E74] mt-0.5 leading-relaxed">
                        {result.message}
                      </p>
                    </div>
                  </div>
                ) : probe ? (
                  /* 🎓 졸업 시험 (일반화 프로브) — 처음 보는 같은-소리 단어로 전이 확인 */
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🎓</span>
                      <p className="text-sm font-black text-[#3D3530]">졸업 시험</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#EDE9FE] text-[#7C3AED] rounded-full">
                        {probe.phoneme} 소리
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8B7E74] leading-relaxed">
                      &lsquo;{item.targetWord}&rsquo;를 잘하게 됐어요! 이번엔 <b>처음 보는 단어</b>도 잘 말하는지 확인해요.
                      아이에게 아래 단어를 하나씩 말하게 해주세요.
                    </p>
                    <div className="space-y-1.5">
                      {probe.words.map((w, wi) => (
                        <div key={w} className="flex items-center gap-2 bg-[#FAF8F5] rounded-xl px-3 py-2">
                          <span className="text-base font-black text-[#3D3530] flex-1">{w}</span>
                          <button
                            onClick={() => markProbeWord(item.id, wi, true)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border-2 transition ${
                              probe.results[wi] === true
                                ? "bg-[#7EDFD0] border-[#5EC9B8] text-white"
                                : "bg-white border-[#E8DDD5] text-[#8B7E74]"
                            }`}
                          >
                            잘함
                          </button>
                          <button
                            onClick={() => markProbeWord(item.id, wi, false)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border-2 transition ${
                              probe.results[wi] === false
                                ? "bg-[#F9A8D4] border-[#F472B6] text-white"
                                : "bg-white border-[#E8DDD5] text-[#8B7E74]"
                            }`}
                          >
                            어려움
                          </button>
                        </div>
                      ))}
                    </div>
                    <BubbleButton
                      variant="peach"
                      size="sm"
                      disabled={loading === item.id || probe.results.some((r) => r === null)}
                      onClick={() => submitProbe(item.id)}
                      className="w-full text-xs"
                    >
                      {loading === item.id
                        ? "..."
                        : probe.results.some((r) => r === null)
                        ? "단어를 모두 평가해주세요"
                        : "🎓 졸업 시험 결과 확인"}
                    </BubbleButton>
                  </div>
                ) : (
                  /* 평가 전 */
                  <div className="space-y-2">
                    {/* 단어 정보 */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-[#3D3530]">{item.targetWord}</span>
                      <span className="text-[#C4B5A8] text-xs">→</span>
                      <span className="text-base font-bold text-[#FCA5A5]">{item.childPronunciation}</span>
                      <div className="flex gap-1 flex-wrap ml-auto">
                        <PastelBadge color="lavender">{item.phoneme}</PastelBadge>
                        <PastelBadge color="pink">{item.errorPattern}</PastelBadge>
                        <PastelBadge color="yellow">
                          {item.reviewCount === 0 ? "첫 복습" : `${item.reviewCount}회차`}
                        </PastelBadge>
                      </div>
                    </div>

                    {/* 4단계 훈련법 요약 */}
                    {hasSteps && (
                      <div className="bg-[#FAF8F5] rounded-xl px-3 py-2 space-y-1">
                        <p className="text-[10px] font-black text-[#8B7E74] mb-1">📋 훈련 가이드</p>
                        {steps.map((step, i) =>
                          step ? (
                            <div key={i} className="flex gap-1.5 items-start">
                              <span className={`text-[10px] font-black flex-shrink-0 mt-0.5 ${STEP_COLORS[i]}`}>
                                {STEP_LABELS[i]}
                              </span>
                              <p className="text-[11px] text-[#5C5047] leading-snug">
                                {truncate(step.replace(/^【[^】]*】\s*/, ""), 50)}
                              </p>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}

                    {/* 평가 버튼 */}
                    <div className="flex gap-1.5">
                      <BubbleButton
                        variant="mint"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleReview(item.id, 5)}
                        className="flex-1 text-xs"
                      >
                        {isLoading ? "..." : "✅ 잘 했어요"}
                      </BubbleButton>
                      <BubbleButton
                        variant="white"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleReview(item.id, 1)}
                        className="flex-1 text-xs"
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
