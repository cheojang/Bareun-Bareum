"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { ResetSavedWordsButton } from "./ResetSavedWordsButton";

export interface SavedWordItem {
  id: string;
  word: string;
  difficulty: string;
  savedAt: string;
}

export function SavedWordsList({
  childId,
  savedWords: initialWords,
}: {
  childId: string;
  savedWords: SavedWordItem[];
}) {
  const router = useRouter();
  const [words, setWords] = useState(initialWords);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const groups = useMemo(() => {
    const out: { dateLabel: string; words: SavedWordItem[] }[] = [];
    for (const sw of words) {
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
  }, [words]);

  const allWordKeys = useMemo(() => words.map((s) => s.word), [words]);
  const allChecked = selected.size > 0 && selected.size === allWordKeys.length;

  function toggle(word: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === allWordKeys.length ? new Set() : new Set(allWordKeys)
    );
  }

  function practiceSelected() {
    const ws = allWordKeys.filter((w) => selected.has(w));
    if (ws.length === 0) return;
    router.push(`/dashboard/practice?words=${encodeURIComponent(ws.join(","))}`);
  }

  async function deleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`선택한 ${selected.size}개 단어를 삭제할까요?`)) return;

    setDeleting(true);
    const toDelete = [...selected];
    await Promise.allSettled(
      toDelete.map((word) =>
        fetch(`/api/saved-words?childId=${childId}&word=${encodeURIComponent(word)}`, {
          method: "DELETE",
        })
      )
    );
    setWords((prev) => prev.filter((w) => !toDelete.includes(w.word)));
    setSelected(new Set());
    setDeleting(false);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-[#3D3530]">
          저장한 단어
          <span className="ml-2 text-sm font-normal text-[#8B7E74]">{words.length}개</span>
          {selected.size > 0 && (
            <span className="ml-2 text-sm font-semibold text-[#FFB38A]">{selected.size}개 선택</span>
          )}
        </p>
        <div className="flex items-center gap-3">
          {selected.size > 0 ? (
            <>
              <button
                onClick={deleteSelected}
                disabled={deleting}
                className="text-xs font-semibold text-[#E05050] leading-none disabled:opacity-40"
              >
                {deleting ? "삭제 중..." : "🗑 선택 삭제"}
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs font-semibold text-[#8B7E74] leading-none"
              >
                취소
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleAll}
                className="text-xs font-semibold text-[#FFB38A] leading-none"
              >
                {allChecked ? "전체 해제" : "전체 선택"}
              </button>
              <ResetSavedWordsButton childId={childId} />
            </>
          )}
        </div>
      </div>

      <BubbleCard padding="sm">
        {groups.map((group, gi) => (
          <div key={group.dateLabel}>
            <div className={`flex items-center gap-3 ${gi > 0 ? "mt-1" : ""} py-2`}>
              <div className="h-[1px] flex-1 bg-[#F0E8E0]" />
              <span className="text-[11px] font-black text-[#C4B5A8] tracking-wider">
                {group.dateLabel}
              </span>
              <div className="h-[1px] flex-1 bg-[#F0E8E0]" />
            </div>
            {group.words.map((sw, wi) => {
              const isLast = gi === groups.length - 1 && wi === group.words.length - 1;
              const checked = selected.has(sw.word);
              return (
                <label
                  key={sw.id}
                  className={`flex items-center gap-3 py-3 px-1 cursor-pointer ${
                    !isLast ? "border-b border-[#F5F0EB]" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(sw.word)}
                    className="w-5 h-5 rounded-md accent-[#FFB38A] flex-shrink-0 cursor-pointer"
                  />
                  <span className="text-base font-black text-[#3D3530] flex-1 truncate">
                    {sw.word}
                  </span>
                </label>
              );
            })}
          </div>
        ))}
      </BubbleCard>

      {/* 하단 버튼 영역 */}
      <div className="mt-3">
        <button
          onClick={practiceSelected}
          disabled={selected.size === 0}
          className="w-full py-3.5 rounded-2xl text-sm font-black shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-[#FFB38A] text-white"
        >
          {selected.size === 0
            ? "연습할 단어를 선택해주세요"
            : `선택한 ${selected.size}개 단어 연습하기 🎮`}
        </button>
      </div>
    </section>
  );
}
