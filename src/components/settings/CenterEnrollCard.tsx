"use client";

import { useState } from "react";
import { BubbleButton } from "@/components/ui/BubbleButton";

interface ChildWithCenter {
  id: string;
  name: string;
  centerMappings: { centerId: string; center: { id: string; name: string } }[];
}

export function CenterEnrollCard({ children }: { children: ChildWithCenter[] }) {
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? "");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [localChildren, setLocalChildren] = useState(children);

  const selectedChild = localChildren.find((c) => c.id === selectedChildId);
  const connectedCenter = selectedChild?.centerMappings[0]?.center ?? null;

  async function handleEnroll() {
    if (!inviteCode.trim() || !selectedChildId) return;
    setLoading(true);
    setMsg(null);

    const res = await fetch("/api/center/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: selectedChildId, inviteCode: inviteCode.trim() }),
    });
    const data = await res.json();

    if (res.ok) {
      setMsg({ text: `✅ ${data.centerName}에 등록됐어요!`, ok: true });
      setInviteCode("");
      // 로컬 상태 갱신 — 페이지 새로고침 없이 반영
      setLocalChildren((prev) =>
        prev.map((c) =>
          c.id === selectedChildId
            ? {
                ...c,
                centerMappings: [
                  { centerId: data.centerId ?? "", center: { id: data.centerId ?? "", name: data.centerName } },
                ],
              }
            : c
        )
      );
      // 사이드바 반영을 위해 새로고침
      window.location.reload();
    } else {
      setMsg({ text: data.error ?? "등록에 실패했어요.", ok: false });
    }
    setLoading(false);
  }

  async function handleDisconnect() {
    if (!connectedCenter || !selectedChildId) return;
    if (!confirm(`${connectedCenter.name}에서 연결을 해제할까요?`)) return;
    setLoading(true);
    setMsg(null);

    const res = await fetch("/api/center/join", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: selectedChildId, centerId: connectedCenter.id }),
    });

    if (res.ok) {
      setMsg({ text: "연결이 해제됐어요.", ok: true });
      setLocalChildren((prev) =>
        prev.map((c) =>
          c.id === selectedChildId ? { ...c, centerMappings: [] } : c
        )
      );
      window.location.reload();
    } else {
      setMsg({ text: "해제에 실패했어요.", ok: false });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* 아이 선택 (2명 이상일 때만 표시) */}
      {localChildren.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {localChildren.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedChildId(c.id); setMsg(null); }}
              className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                selectedChildId === c.id
                  ? "bg-[#FFB38A] text-white"
                  : "bg-[#F0E8E0] text-[#8B7E74]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* 연결 상태 */}
      {connectedCenter ? (
        <div className="flex items-center justify-between bg-[#F0FAF8] rounded-2xl px-4 py-3">
          <div>
            <p className="text-xs text-[#8B7E74]">연결된 센터</p>
            <p className="font-bold text-[#3D3530]">🏥 {connectedCenter.name}</p>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="text-xs text-[#C4B5A8] hover:text-[#EF4444] font-semibold transition-colors disabled:opacity-50"
          >
            연결 해제
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setMsg(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleEnroll()}
            placeholder="초대코드 입력 (예: DEVTEST)"
            maxLength={20}
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm font-mono font-bold text-[#3D3530] placeholder:text-[#C4B5A8] placeholder:font-normal transition-colors"
          />
          <BubbleButton
            variant="peach"
            size="md"
            onClick={handleEnroll}
            disabled={loading || !inviteCode.trim()}
          >
            {loading ? "등록 중..." : "등록"}
          </BubbleButton>
        </div>
      )}

      {msg && (
        <p className={`text-xs font-semibold ${msg.ok ? "text-[#0D9488]" : "text-[#EF4444]"}`}>
          {msg.text}
        </p>
      )}

      <p className="text-xs text-[#C4B5A8] leading-relaxed">
        초대코드는 언어재활사 선생님께 받을 수 있어요. 연결하면 선생님이 아이의 발음 기록을 확인하고 숙제를 배정할 수 있어요.
      </p>
    </div>
  );
}
