"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type HomeworkItem = {
  id: string;
  targetWords: string[];
  targetPhoneme: string | null;
  description: string | null;
  dueDate: string;
  status: string;
  therapistName: string;
};

type ChildInfo = { id: string; name: string; therapist: { id: string; name: string } | null };

export default function ParentHomeworkPage() {
  const searchParams = useSearchParams();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [selectedChildId, setSelectedChildId] = useState(searchParams.get("childId") ?? "");
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState("");

  // 아이 목록은 현재 쿠키로 선택된 아이를 기반으로 — 대신 간단하게 parent API 통해 조회
  useEffect(() => {
    fetch("/api/parent/children")
      .then((r) => r.json())
      .then((data) => {
        setChildren(data.children ?? []);
        if (!selectedChildId && data.children?.length > 0) {
          setSelectedChildId(data.children[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;
    setLoading(true);
    fetch(`/api/parent/homework?childId=${selectedChildId}`)
      .then((r) => r.json())
      .then((data) => { setHomeworks(data.homeworks ?? []); setLoading(false); });
  }, [selectedChildId]);

  async function markDone(homeworkId: string) {
    await fetch("/api/parent/homework", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeworkId }),
    });
    setHomeworks((prev) => prev.map((h) => h.id === homeworkId ? { ...h, status: "done" } : h));
  }

  async function joinCenter() {
    if (!inviteCode.trim() || !selectedChildId) return;
    setJoining(true);
    setJoinMsg("");
    const res = await fetch("/api/center/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: selectedChildId, inviteCode: inviteCode.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setJoinMsg(`${data.centerName}에 연결되었습니다! 치료사 배정 후 숙제가 표시됩니다.`);
      setInviteCode("");
    } else {
      setJoinMsg(data.error ?? "오류 발생");
    }
    setJoining(false);
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const pending = homeworks.filter((h) => h.status === "pending");
  const done = homeworks.filter((h) => h.status === "done");

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-black text-[#3D3530]">숙제</h1>
        <p className="text-sm text-[#8B7E74] mt-1">치료사가 배정한 연습 단어예요</p>
      </div>

      {/* 아이 선택 */}
      {children.length > 1 && (
        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(e.target.value)}
          className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40 font-semibold text-[#3D3530]"
        >
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {/* 치료사 없을 때: 센터 연결 안내 */}
      {selectedChild && !selectedChild.therapist && homeworks.length === 0 && !loading && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "#FFF5EE", border: "1.5px solid #FFE4D8" }}
        >
          <div className="text-center space-y-1">
            <p className="text-3xl">🏥</p>
            <p className="font-bold text-[#3D3530]">아직 치료사와 연결되지 않았어요</p>
            <p className="text-xs text-[#8B7E74]">
              언어치료센터에서 받은 초대코드를 입력하면 치료사가 숙제를 배정해드려요
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대코드 입력..."
              className="flex-1 rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
            />
            <button
              onClick={joinCenter}
              disabled={joining || !inviteCode.trim()}
              className="rounded-xl bg-[#FFB38A] text-white font-bold px-4 py-2 text-sm disabled:opacity-50"
            >
              {joining ? "연결 중..." : "연결하기"}
            </button>
          </div>
          {joinMsg && (
            <p className={`text-xs font-semibold text-center ${joinMsg.includes("연결") ? "text-green-600" : "text-red-500"}`}>
              {joinMsg}
            </p>
          )}
        </div>
      )}

      {/* 숙제 목록 */}
      {loading ? (
        <p className="text-center text-sm text-[#8B7E74] py-8">불러오는 중...</p>
      ) : (
        <>
          {/* 진행 중 숙제 */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-[#3D3530]">진행 중 ({pending.length})</h2>
              {pending.map((hw) => {
                const isOverdue = new Date(hw.dueDate) < new Date();
                return (
                  <div
                    key={hw.id}
                    className="rounded-2xl p-4 space-y-2.5"
                    style={{
                      background: "white",
                      border: `1.5px solid ${isOverdue ? "#FCA5A5" : "#F0E8E0"}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5 flex-1">
                        {hw.targetPhoneme && (
                          <span className="inline-block text-xs bg-[#FFF5EE] text-[#FFB38A] font-bold px-2 py-0.5 rounded-full">
                            목표 음소: {hw.targetPhoneme}
                          </span>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {hw.targetWords.map((w) => (
                            <span
                              key={w}
                              className="text-sm font-bold text-[#3D3530] bg-[#F5EDE5] px-2.5 py-1 rounded-xl"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                        {hw.description && (
                          <p className="text-xs text-[#8B7E74]">{hw.description}</p>
                        )}
                        <p className={`text-xs font-semibold ${isOverdue ? "text-red-500" : "text-[#C4B5A8]"}`}>
                          {isOverdue ? "기한 초과 · " : ""}마감: {new Date(hw.dueDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
                        </p>
                        <p className="text-xs text-[#C4B5A8]">배정: {hw.therapistName} 치료사</p>
                      </div>
                      <button
                        onClick={() => markDone(hw.id)}
                        className="shrink-0 rounded-xl bg-[#FFB38A] text-white font-bold px-3 py-2 text-xs"
                      >
                        완료 ✓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 완료된 숙제 */}
          {done.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-[#3D3530] text-sm text-[#8B7E74]">완료됨 ({done.length})</h2>
              {done.map((hw) => (
                <div
                  key={hw.id}
                  className="rounded-2xl p-4 opacity-60"
                  style={{ background: "#F0FAF8", border: "1.5px solid #D1FAE5" }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {hw.targetWords.map((w) => (
                      <span key={w} className="text-sm font-semibold text-[#0D9488] line-through">
                        {w}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#8B7E74] mt-1">
                    {new Date(hw.dueDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} · {hw.therapistName} 치료사
                  </p>
                </div>
              ))}
            </div>
          )}

          {homeworks.length === 0 && selectedChild?.therapist && (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-bold text-[#3D3530]">아직 숙제가 없어요</p>
              <p className="text-xs text-[#8B7E74] mt-1">{selectedChild.therapist.name} 치료사가 곧 배정할 거예요</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
