"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResetSavedWordsButton({ childId }: { childId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!confirm("저장된 단어를 전부 삭제할까요?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/saved-words", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("초기화에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="text-xs font-bold text-[#C4B5A8] hover:text-[#EF4444] transition-colors px-2 py-1 rounded-xl hover:bg-[#FEF2F2] disabled:opacity-50"
    >
      {loading ? "삭제 중..." : "🗑 전체 초기화"}
    </button>
  );
}
