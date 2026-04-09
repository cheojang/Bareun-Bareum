"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { WORD_DATABASE } from "@/lib/word-database";

interface Child {
  id: string;
  name: string;
  mascotLevel: number;
}

export function NewSessionClient({ children }: { children: Child[] }) {
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? "");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const easyWords = WORD_DATABASE.filter((w) => w.difficulty === "easy").slice(0, 12);

  function toggleWord(word: string) {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  }

  async function startSession() {
    if (selectedWords.length === 0) {
      alert("연습할 단어를 최소 1개 선택해주세요");
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
        const wordParam = encodeURIComponent(JSON.stringify(selectedWords));
        router.push(`/dashboard/session/${session.id}?words=${wordParam}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5 pt-6 max-w-lg mx-auto space-y-5">
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

      {/* Word selection */}
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
              <span className="text-2xl">{word.emoji}</span>
              <span>{word.word}</span>
            </button>
          ))}
        </div>
      </div>

      <BubbleButton
        onClick={startSession}
        disabled={loading || selectedWords.length === 0}
        variant="peach"
        size="lg"
        className="w-full"
      >
        {loading ? <LoadingSpinner size="sm" /> : `연습 시작! (${selectedWords.length}개)`}
      </BubbleButton>
    </div>
  );
}
