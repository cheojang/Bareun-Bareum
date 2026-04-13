"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { WORD_DATABASE, MINIMAL_PAIRS } from "@/lib/word-database";

interface Child {
  id: string;
  name: string;
  mascotLevel: number;
}

type SessionMode = "normal" | "minimal-pairs";

export function NewSessionClient({ children }: { children: Child[] }) {
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? "");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [selectedPairIds, setSelectedPairIds] = useState<string[]>([]);
  const [mode, setMode] = useState<SessionMode>("normal");
  const [loading, setLoading] = useState(false);

  // ── Session briefing ──────────────────────────────────────────────────────
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingPhonemes, setBriefingPhonemes] = useState<string[]>([]);
  const [briefingLoading, setBriefingLoading] = useState(true);

  useEffect(() => {
    if (!selectedChildId) return;
    setBriefingLoading(true);
    fetch(`/api/briefing?childId=${selectedChildId}`)
      .then((r) => r.json())
      .then((data) => {
        setBriefing(data.briefing ?? null);
        setBriefingPhonemes(data.topErrors ?? []);
      })
      .catch(() => setBriefing(null))
      .finally(() => setBriefingLoading(false));
  }, [selectedChildId]);

  const easyWords = WORD_DATABASE.filter((w) => w.difficulty === "easy").slice(0, 12);

  function toggleWord(word: string) {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  }

  function togglePair(pairId: string) {
    setSelectedPairIds((prev) =>
      prev.includes(pairId) ? prev.filter((id) => id !== pairId) : [...prev, pairId]
    );
  }

  // Build word list from selected minimal pairs (word1 then word2)
  function buildMinimalPairWordList(): string[] {
    const words: string[] = [];
    for (const id of selectedPairIds) {
      const pair = MINIMAL_PAIRS.find((p) => p.id === id);
      if (pair) {
        words.push(pair.word1, pair.word2);
      }
    }
    return words;
  }

  const hasSelection =
    mode === "normal" ? selectedWords.length > 0 : selectedPairIds.length > 0;

  async function startSession() {
    if (!hasSelection) {
      alert(mode === "normal" ? "연습할 단어를 최소 1개 선택해주세요" : "연습할 대립쌍을 최소 1개 선택해주세요");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: selectedChildId }),
      });

      if (res.ok) {
        const session = await res.json();
        const wordList =
          mode === "normal" ? selectedWords : buildMinimalPairWordList();
        const wordParam = encodeURIComponent(JSON.stringify(wordList));
        router.push(`/dashboard/session/${session.id}?words=${wordParam}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5 pt-6 max-w-lg mx-auto space-y-5 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#3D3530]">연습 설정 🎯</h2>
        <p className="text-[#8B7E74] text-sm mt-1">연습할 아이와 단어를 선택해주세요</p>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <BubbleCard padding="sm">
          <p className="text-sm font-semibold text-[#3D3530] mb-3">아이 선택</p>
          <div className="flex gap-2 flex-wrap">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  selectedChildId === child.id
                    ? "bg-[#FFB38A] text-white"
                    : "bg-[#F0E8E0] text-[#8B7E74]"
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        </BubbleCard>
      )}

      {/* ── Pre-session briefing ──────────────────────────────────────── */}
      <BubbleCard color="lavender">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-[#3D3530] text-sm">오늘의 연습 팁</p>
              {briefingPhonemes.length > 0 && (
                <div className="flex gap-1">
                  {briefingPhonemes.slice(0, 2).map((p) => (
                    <PastelBadge key={p} color="lavender" className="text-xs">{p}</PastelBadge>
                  ))}
                </div>
              )}
            </div>
            {briefingLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-xs text-[#8B7E74]">팁 불러오는 중...</span>
              </div>
            ) : (
              <p className="text-sm text-[#3D3530] leading-relaxed">
                {briefing ?? "연습을 시작해볼까요? 아이와 함께 즐겁게 연습해보세요! 💪"}
              </p>
            )}
          </div>
        </div>
      </BubbleCard>

      {/* ── Mode selector ─────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-semibold text-[#3D3530] mb-3">연습 모드</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode("normal")}
            className={`p-4 rounded-[20px] border-2 text-left transition-all ${
              mode === "normal"
                ? "border-[#FFB38A] bg-[#FFF5EE]"
                : "border-[#F0E8E0] bg-white"
            }`}
          >
            <div className="text-2xl mb-1">📝</div>
            <p className="font-bold text-[#3D3530] text-sm">단어 연습</p>
            <p className="text-xs text-[#8B7E74] mt-0.5">단어를 골라서 반복 연습</p>
          </button>
          <button
            onClick={() => setMode("minimal-pairs")}
            className={`p-4 rounded-[20px] border-2 text-left transition-all ${
              mode === "minimal-pairs"
                ? "border-[#7EDFD0] bg-[#F0FAF8]"
                : "border-[#F0E8E0] bg-white"
            }`}
          >
            <div className="text-2xl mb-1">🔄</div>
            <p className="font-bold text-[#3D3530] text-sm">최소대립쌍</p>
            <p className="text-xs text-[#8B7E74] mt-0.5">비슷한 소리 구별 집중 연습</p>
          </button>
        </div>
      </div>

      {/* ── Normal mode: word selection ──────────────────────────────── */}
      {mode === "normal" && (
        <div>
          <p className="text-sm font-semibold text-[#3D3530] mb-3">
            연습 단어 선택{" "}
            <span className="text-[#8B7E74] font-normal">({selectedWords.length}개 선택됨)</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {easyWords.map((word) => (
              <button
                key={word.word}
                onClick={() => toggleWord(word.word)}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-[20px] font-semibold text-sm
                  border-2 transition-all
                  ${
                    selectedWords.includes(word.word)
                      ? "border-[#FFB38A] bg-[#FFF5EE] text-[#FFB38A]"
                      : "border-[#F0E8E0] bg-white text-[#3D3530]"
                  }
                `}
              >
                <span className="w-8 h-8 bg-gray-100 rounded flex-shrink-0"></span>
                <span>{word.word}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Minimal pairs mode: pair selection ──────────────────────── */}
      {mode === "minimal-pairs" && (
        <div>
          <p className="text-sm font-semibold text-[#3D3530] mb-2">
            대립쌍 선택{" "}
            <span className="text-[#8B7E74] font-normal">({selectedPairIds.length}쌍 선택됨)</span>
          </p>
          <p className="text-xs text-[#8B7E74] mb-3">
            두 단어의 차이를 들으면서 소리를 구별하는 연습이에요
          </p>
          <div className="space-y-2">
            {MINIMAL_PAIRS.map((pair) => {
              const selected = selectedPairIds.includes(pair.id);
              return (
                <button
                  key={pair.id}
                  onClick={() => togglePair(pair.id)}
                  className={`w-full p-4 rounded-[20px] border-2 text-left transition-all flex items-center gap-4 ${
                    selected
                      ? "border-[#7EDFD0] bg-[#F0FAF8]"
                      : "border-[#F0E8E0] bg-white"
                  }`}
                >
                  {/* Word 1 */}
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded mb-2 mx-auto"></div>
                    <p className="font-black text-[#3D3530] text-lg">{pair.word1}</p>
                  </div>

                  <div className="flex-1 text-center">
                    <PastelBadge color={selected ? "mint" : "pink"} className="mb-1">
                      {pair.label}
                    </PastelBadge>
                    <div className="text-[#8B7E74] font-bold text-lg">↔</div>
                  </div>

                  {/* Word 2 */}
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded mb-2 mx-auto"></div>
                    <p className="font-black text-[#3D3530] text-lg">{pair.word2}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedPairIds.length > 0 && (
            <div className="mt-3 p-3 bg-[#F0FAF8] rounded-2xl text-xs text-[#8B7E74]">
              총 {selectedPairIds.length * 2}개 단어 연습 예정
              ({selectedPairIds.map((id) => {
                const p = MINIMAL_PAIRS.find((x) => x.id === id);
                return p ? `${p.word1}·${p.word2}` : "";
              }).join(", ")})
            </div>
          )}
        </div>
      )}

      <BubbleButton
        onClick={startSession}
        disabled={loading || !hasSelection}
        variant="peach"
        size="lg"
        className="w-full"
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : mode === "normal" ? (
          `연습 시작! (${selectedWords.length}개)`
        ) : (
          `최소대립쌍 시작! (${selectedPairIds.length}쌍)`
        )}
      </BubbleButton>
    </div>
  );
}
