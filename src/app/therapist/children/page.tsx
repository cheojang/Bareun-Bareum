"use client";

import { useEffect, useState } from "react";

type WeakPhoneme = { phoneme: string; level: string; errorRate: number };
type ChildItem = {
  id: string;
  name: string;
  birthDate: string | null;
  assignedAt: string;
  parentName: string | null;
  parentEmail: string;
  weakPhonemes: WeakPhoneme[];
  pendingHomework: { dueDate: string } | null;
  lastSession: { date: string; performance: number } | null;
};

const LEVEL_COLOR: Record<string, string> = {
  집중교정필요: "bg-red-100 text-red-600",
  꾸준한연습필요: "bg-yellow-100 text-yellow-700",
  관찰중: "bg-green-100 text-green-700",
  정상범위: "bg-teal-100 text-teal-700",
};

export default function TherapistChildrenPage() {
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteInput, setInviteInput] = useState("");
  const [childIdInput, setChildIdInput] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/therapist/children");
    if (res.ok) {
      const data = await res.json();
      setChildren(data.children);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function assignChild() {
    if (!childIdInput.trim()) { setMsg("아이 ID를 입력해주세요"); return; }
    setAssigning(true);
    setMsg("");
    const res = await fetch("/api/therapist/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: childIdInput.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("담당 배정 완료!");
      setChildIdInput("");
      load();
    } else {
      setMsg(data.error ?? "오류 발생");
    }
    setAssigning(false);
  }

  async function unassign(childId: string, name: string) {
    if (!confirm(`${name} 담당을 해제하시겠습니까?`)) return;
    await fetch("/api/therapist/children", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId }),
    });
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#8B7E74]">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#3D3530]">담당 아이 목록</h1>
        <p className="text-sm text-[#8B7E74] mt-1">배정된 아이 {children.length}명</p>
      </div>

      {/* 아이 배정 섹션 */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: "#FFF5EE", border: "1.5px solid #FFE4D8" }}
      >
        <p className="font-bold text-[#3D3530] text-sm">새 아이 담당 배정</p>
        <p className="text-xs text-[#8B7E74]">
          센터에 등록된 아이의 ID를 입력하세요. (아이 ID는 부모 앱 설정에서 확인)
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={childIdInput}
            onChange={(e) => setChildIdInput(e.target.value)}
            placeholder="아이 ID 입력..."
            className="flex-1 rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
          />
          <button
            onClick={assignChild}
            disabled={assigning}
            className="rounded-xl bg-[#FFB38A] text-white font-bold px-4 py-2 text-sm disabled:opacity-50"
          >
            배정
          </button>
        </div>
        {msg && (
          <p className={`text-xs font-semibold ${msg.includes("완료") ? "text-green-600" : "text-red-500"}`}>
            {msg}
          </p>
        )}
      </div>

      {/* 아이 목록 */}
      {children.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👦</p>
          <p className="font-bold text-[#3D3530]">담당 아이가 없습니다</p>
          <p className="text-sm text-[#8B7E74] mt-1">위에서 아이를 배정해주세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child) => (
            <div
              key={child.id}
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "white", border: "1.5px solid #F0E8E0" }}
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-black text-[#3D3530] text-base">{child.name}</p>
                  <p className="text-xs text-[#8B7E74]">
                    보호자: {child.parentName ?? child.parentEmail}
                  </p>
                </div>
                <button
                  onClick={() => unassign(child.id, child.name)}
                  className="text-xs text-[#C4B5A8] hover:text-red-400 font-semibold"
                >
                  담당 해제
                </button>
              </div>

              {/* 약점 음소 */}
              {child.weakPhonemes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#8B7E74] mb-1.5">취약 음소</p>
                  <div className="flex flex-wrap gap-1.5">
                    {child.weakPhonemes.map((w) => (
                      <span
                        key={w.phoneme}
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLOR[w.level] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {w.phoneme} {w.errorRate}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 메타 정보 */}
              <div className="flex gap-4 text-xs text-[#8B7E74]">
                {child.lastSession && (
                  <div className="flex items-center gap-1">
                    <span>📓</span>
                    <span>
                      최근 세션: {new Date(child.lastSession.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      {" "}({child.lastSession.performance}점)
                    </span>
                  </div>
                )}
                {child.pendingHomework && (
                  <div className="flex items-center gap-1">
                    <span>📋</span>
                    <span>
                      숙제 마감: {new Date(child.pendingHomework.dueDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
