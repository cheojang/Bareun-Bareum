"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { ResetSavedWordsButton } from "./ResetSavedWordsButton";

const DIFFICULTY_META: Record<string, { label: string; color: "pink" | "yellow" | "mint" }> = {
  hard:   { label: "집중 연습", color: "pink" },
  medium: { label: "유사 패턴", color: "yellow" },
  easy:   { label: "쉬운 단어", color: "mint" },
};

export interface SavedWordItem {
  id: string;
  word: string;
  difficulty: string;
  savedAt: string; // ISO 문자열 (서버에서 직렬화)
}

export function SavedWordsList({
  childId,
  savedWords,
}: {
  childId: string;
  savedWords: SavedWordItem[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // 날짜별 그룹화 (서버 컴포넌트에서 하던 로직 그대로)
  const groups = useMemo(() => {
    const out: { dateLabel: string; words: SavedWordItem[] }[] = [];
    for (const sw of savedWords) {
      const label = new Date(sw.savedAt).toLocaleDateString("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "long",
        day: "numeric",
      });
      const last = out[out.length - 1];
      if (last && last.dateLabel === label) last.words.push(sw);
      else out.push({ dateLabel: label, words: [sw] });
    }
    return out;
  }, [savedWords]);

  const allWords = useMemo(() => savedWords.map((s) => s.word), [savedWords]);
  const allChecked = selected.size > 0 && selected.size === allWords.length;

  function toggle(word: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === allWords.length ? new Set() : new Set(allWords)));
  }

  function practiceSelected() {
    // 체크 순서가 아닌 목록 순서로 전달 (안정적)
    const words = allWords.filter((w) => selected.has(w));
    if (words.length === 0) return;
    const q = encodeURIComponent(words.join(","));
    router.push(`/dashboard/practice?words=${q}`);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-[#3D3530]">
          저장한 단어
          <span className="ml-2 text-sm font-normal text-[#8B7E74]">{savedWords.length}개</span>
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAll}
            className="text-xs font-semibold text-[#FFB38A] leading-none"
          >
            {allChecked ? "전체 해제" : "전체 선택"}
          </button>
          <ResetSavedWordsButton childId={childId} />
        </div>
      </div>

      <BubbleCard padding="sm">
        {groups.map((group, gi) => (
          <div key={group.dateLabel}>
            {/* 날짜 구분선 */}
            <div className={`flex items-center gap-3 ${gi > 0 ? "mt-1" : ""} py-2`}>
              <div className="h-[1px] flex-1 bg-[#F0E8E0]" />
              <span className="text-[11px] font-black text-[#C4B5A8] tracking-wider">{group.dateLabel}</span>
              <div className="h-[1px] flex-1 bg-[#F0E8E0]" />
            </div>
            {/* 해당 날짜 단어들 */}
            {group.words.map((sw, wi) => {
              const diff = DIFFICULTY_META[sw.difficulty] ?? DIFFICULTY_META.medium;
              const isLast = gi === groups.length - 1 && wi === group.words.length - 1;
              const checked = selected.has(sw.word);
              return (
                <label
                  key={sw.id}
                  className={`flex items-center gap-3 py-3 px-1 cursor-pointer ${!isLast ? "border-b border-[#F5F0EB]" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(sw.word)}
                    className="w-5 h-5 rounded-md accent-[#FFB38A] flex-shrink-0 cursor-pointer"
                  />
                  <span className="text-base font-black text-[#3D3530] flex-1 truncate">{sw.word}</span>
                  <PastelBadge color={diff.color}>{diff.label}</PastelBadge>
                </label>
              );
            })}
          </div>
        ))}
      </BubbleCard>

      {/* 선택한 단어 연습하기 버튼 */}
      <button
        onClick={practiceSelected}
        disabled={selected.size === 0}
        className="mt-3 w-full py-3.5 rounded-2xl text-sm font-black shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-[#FFB38A] text-white"
      >
        {selected.size === 0
          ? "연습할 단어를 선택해주세요"
          : `선택한 ${selected.size}개 단어 연습하기 🎮`}
      </button>
    </section>
  );
}
