"use client";

import { useEffect, useState } from "react";

type ChildOption = { id: string; name: string };
type HomeworkItem = {
  id: string;
  childId: string;
  targetWords: string[];
  targetPhoneme: string | null;
  description: string | null;
  dueDate: string;
  status: string;
  createdAt: string;
};

export default function TherapistHomeworkPage() {
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 폼 상태
  const [words, setWords] = useState("");
  const [phoneme, setPhoneme] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  // 담당 아이 목록 불러오기
  useEffect(() => {
    fetch("/api/therapist/children")
      .then((r) => r.json())
      .then((data) => {
        const list = data.children as { id: string; name: string }[];
        setChildren(list);
        if (list.length > 0) setSelectedChildId(list[0].id);
      });
  }, []);

  // 선택된 아이의 숙제 불러오기
  useEffect(() => {
    if (!selectedChildId) return;
    setLoading(true);
    fetch(`/api/therapist/homework?childId=${selectedChildId}`)
      .then((r) => r.json())
      .then((data) => { setHomeworks(data.homeworks ?? []); setLoading(false); });
  }, [selectedChildId]);

  async function submitHomework() {
    const wordList = words.split(/[,\s]+/).map((w) => w.trim()).filter(Boolean);
    if (!selectedChildId || wordList.length === 0 || !dueDate) {
      setMsg("아이, 단어, 마감일을 모두 입력해주세요");
      return;
    }
    setSubmitting(true);
    setMsg("");
    const res = await fetch("/api/therapist/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId: selectedChildId,
        targetWords: wordList,
        targetPhoneme: phoneme.trim() || null,
        description: desc.trim() || null,
        dueDate,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("숙제 배정 완료!");
      setWords(""); setPhoneme(""); setDesc(""); setDueDate("");
      // 목록 새로고침
      fetch(`/api/therapist/homework?childId=${selectedChildId}`)
        .then((r) => r.json())
        .then((d) => setHomeworks(d.homeworks ?? []));
    } else {
      setMsg(data.error ?? "오류 발생");
    }
    setSubmitting(false);
  }

  async function deleteHomework(homeworkId: string) {
    if (!confirm("숙제를 삭제하시겠습니까?")) return;
    await fetch("/api/therapist/homework", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeworkId }),
    });
    setHomeworks((prev) => prev.filter((h) => h.id !== homeworkId));
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#3D3530]">숙제 배정</h1>
        <p className="text-sm text-[#8B7E74] mt-1">아이별 연습 단어와 마감일을 설정하세요</p>
      </div>

      {/* 아이 선택 */}
      {children.length > 0 && (
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

      {/* 새 숙제 폼 */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: "#FFF5EE", border: "1.5px solid #FFE4D8" }}
      >
        <p className="font-bold text-[#3D3530] text-sm">새 숙제 배정</p>

        <div>
          <label className="text-xs text-[#8B7E74] font-semibold block mb-1">
            연습 단어 (쉼표 또는 공백으로 구분)
          </label>
          <input
            type="text"
            value={words}
            onChange={(e) => setWords(e.target.value)}
            placeholder="예: 사과, 수박, 사자"
            className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#8B7E74] font-semibold block mb-1">
              목표 음소 (선택)
            </label>
            <input
              type="text"
              value={phoneme}
              onChange={(e) => setPhoneme(e.target.value)}
              placeholder="예: ㅅ"
              className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
            />
          </div>
          <div>
            <label className="text-xs text-[#8B7E74] font-semibold block mb-1">
              마감일
            </label>
            <input
              type="date"
              value={dueDate}
              min={todayStr}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-[#8B7E74] font-semibold block mb-1">
            메모 (선택)
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="숙제 설명이나 주의사항을 입력하세요"
            rows={2}
            className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40 resize-none"
          />
        </div>

        <button
          onClick={submitHomework}
          disabled={submitting}
          className="w-full rounded-xl bg-[#FFB38A] text-white font-bold py-2.5 text-sm disabled:opacity-50"
        >
          {submitting ? "배정 중..." : "숙제 배정하기"}
        </button>

        {msg && (
          <p className={`text-xs font-semibold text-center ${msg.includes("완료") ? "text-green-600" : "text-red-500"}`}>
            {msg}
          </p>
        )}
      </div>

      {/* 숙제 목록 */}
      <div>
        <h2 className="font-bold text-[#3D3530] mb-3">배정된 숙제</h2>
        {loading ? (
          <p className="text-sm text-[#8B7E74] text-center py-6">불러오는 중...</p>
        ) : homeworks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm text-[#8B7E74]">배정된 숙제가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {homeworks.map((hw) => {
              const isDone = hw.status === "done";
              const isOverdue = !isDone && new Date(hw.dueDate) < new Date();
              return (
                <div
                  key={hw.id}
                  className="rounded-2xl p-4"
                  style={{
                    background: isDone ? "#F0FAF8" : "white",
                    border: `1.5px solid ${isOverdue ? "#FCA5A5" : "#F0E8E0"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isDone ? "bg-teal-100 text-teal-700" :
                            isOverdue ? "bg-red-100 text-red-600" :
                            "bg-[#FFF5EE] text-[#FFB38A]"
                          }`}
                        >
                          {isDone ? "완료" : isOverdue ? "기한 초과" : "진행 중"}
                        </span>
                        {hw.targetPhoneme && (
                          <span className="text-xs bg-[#F0E8E0] text-[#3D3530] font-bold px-2 py-0.5 rounded-full">
                            목표: {hw.targetPhoneme}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#3D3530]">
                        {hw.targetWords.join(" · ")}
                      </p>
                      {hw.description && (
                        <p className="text-xs text-[#8B7E74]">{hw.description}</p>
                      )}
                      <p className="text-xs text-[#C4B5A8]">
                        마감: {new Date(hw.dueDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
                      </p>
                    </div>
                    {!isDone && (
                      <button
                        onClick={() => deleteHomework(hw.id)}
                        className="text-xs text-[#C4B5A8] hover:text-red-400 font-semibold shrink-0"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
