"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setSelectedChild } from "@/lib/child-cookie";

interface Child {
  id: string;
  name: string;
  mascotLevel: number;
  image?: string | null;
}

interface Props {
  children: Child[];
  selectedId: string;
}

const MASCOT_EMOJIS = ["🥚", "🐣", "🐥", "🐤", "🐦"];

export function ChildSelector({ children, selectedId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = children.find((c) => c.id === selectedId) ?? children[0];

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSelect(child: Child) {
    setOpen(false);
    await setSelectedChild(child.id);
    router.refresh();
  }

  if (children.length === 0) return null;

  const emoji = MASCOT_EMOJIS[Math.min((selected?.mascotLevel ?? 1) - 1, 4)];

  return (
    <div ref={ref} className="relative flex items-center">
      {/* 트리거 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-[#FFF5EE] hover:bg-[#FFE4D8] transition-colors rounded-full px-3 py-1.5 border border-[#FFD4B8]"
      >
        {selected?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selected.image}
            alt={selected.name}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <span className="text-base leading-none">{emoji}</span>
        )}
        <span className="text-base font-black text-[#3D3530] max-w-[70px] truncate">
          {selected?.name ?? "선택"}
        </span>
        <span className="text-[#C4B5A8] text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {/* 드롭다운 */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-lg border border-[#F0E8E0] z-50 overflow-hidden"
          style={{ background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)" }}
        >
          {children.map((child) => {
            const isSelected = child.id === selected?.id;
            const childEmoji = MASCOT_EMOJIS[Math.min((child.mascotLevel ?? 1) - 1, 4)];
            return (
              <button
                key={child.id}
                onClick={() => handleSelect(child)}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left transition-colors
                  ${isSelected ? "bg-[#FFE4D8]" : "hover:bg-[#FFF5EE]"}`}
              >
                {child.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={child.image}
                    alt={child.name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="text-lg">{childEmoji}</span>
                )}
                <span className={`text-sm font-bold ${isSelected ? "text-[#FFB38A]" : "text-[#3D3530]"}`}>
                  {child.name}
                </span>
                {isSelected && <span className="ml-auto text-[#FFB38A] text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
