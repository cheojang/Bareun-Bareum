"use client";

import { useEffect, useState } from "react";
import { BubbleCard } from "@/components/ui/BubbleCard";

interface WeakPhonemeInput {
  phoneme: string;
  errorRate: number;
  totalAttempts: number;
  weaknessLevel: string;
}

interface CategoryStatInput {
  label: string;
  count: number;
  pct: number;
}

interface Props {
  childId: string;
  childName: string;
  weakPhonemes: WeakPhonemeInput[];
  categoryStats: CategoryStatInput[];
}

export function AiAdvice({ childId, childName, weakPhonemes, categoryStats }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchAdvice() {
      try {
        const res = await fetch("/api/comprehensive-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId, childName, weakPhonemes, categoryStats }),
        });

        if (!res.ok) {
          let isQuotaError = false;
          try {
            const err = await res.json();
            isQuotaError = err?.isQuotaError === true;
          } catch {}

          setError(
            isQuotaError
              ? "오늘 AI 분석 횟수를 모두 사용했어요. 내일 다시 시도해 보세요."
              : "선생님 조언을 불러오지 못했어요. 잠시 후 새로고침해 주세요."
          );
          setLoading(false);
          return;
        }

        const contentType = res.headers.get("Content-Type") ?? "";

        // ── 캐시 HIT: JSON 응답 즉시 표시 ────────────────────────────────────
        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (cancelled) return;
          if (!data.report) {
            setError("응답을 받지 못했어요.");
            setLoading(false);
            return;
          }
          setText(data.report);
          setLoading(false);
          return;
        }

        // ── 캐시 MISS: 스트림으로 실시간 표시 ──────────────────────────────
        if (!res.body) {
          setError("응답을 받지 못했어요.");
          setLoading(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let firstChunk = true;

        while (true) {
          const { value, done } = await reader.read();
          if (done || cancelled) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            if (firstChunk) {
              setLoading(false);
              setStreaming(true);
              firstChunk = false;
            }
            accumulated += chunk;
            setText(accumulated);
          }
        }
        if (!cancelled) setStreaming(false);
      } catch {
        if (!cancelled) setError("네트워크 오류가 발생했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAdvice();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BubbleCard color="mint">
      <p className="font-bold text-[#3D3530] mb-3">👩‍⚕️ 선생님의 종합 조언</p>

      {loading && (
        <div className="flex items-center gap-2 py-2">
          <div className="w-2 h-2 rounded-full bg-[#7EDFD0] animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-[#7EDFD0] animate-bounce [animation-delay:0.15s]" />
          <div className="w-2 h-2 rounded-full bg-[#7EDFD0] animate-bounce [animation-delay:0.3s]" />
          <span className="text-xs text-[#8B7E74] ml-1">선생님이 분석 중이에요... 🔍</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-[#8B7E74] leading-relaxed">{error}</p>
      )}

      {text && (
        <p className="text-sm text-[#3D3530] leading-relaxed whitespace-pre-wrap">
          {text}
          {streaming && (
            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#7EDFD0] align-middle animate-pulse" />
          )}
        </p>
      )}
    </BubbleCard>
  );
}
