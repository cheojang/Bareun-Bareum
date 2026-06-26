"use client";

import { useState } from "react";
import { BubbleButton } from "@/components/ui/BubbleButton";

interface Props {
  periodEnd: string; // ISO string
}

export function CancelSubscriptionButton({ periodEnd }: Props) {
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const endDate = new Date(periodEnd).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleCancel() {
    const confirmed = window.confirm(
      `구독을 취소하시겠어요?\n\n${endDate}까지는 계속 이용하실 수 있어요.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      if (res.ok) {
        setCancelled(true);
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "취소에 실패했어요. 다시 시도해주세요.");
      }
    } catch {
      alert("네트워크 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (cancelled) return null;

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-xs text-[#B0A89E] underline underline-offset-2 hover:text-[#8B7E74] transition-colors disabled:opacity-50"
    >
      {loading ? "처리 중..." : "구독 취소"}
    </button>
  );
}
