"use client";

import { useEffect, useState } from "react";

type ChildOption = { id: string; name: string };
type NoteItem = {
  id: string;
  sessionDate: string;
  targetPhonemes: string[];
  performance: number;
  memo: string;
  isVisibleToParent: boolean;
  therapistName: string;
};

const PERFORMANCE_COLOR = (p: number) =>
  p >= 80 ? "text-teal-600" : p >= 60 ? "text-yellow-600" : "text-red-500";

export default function TherapistNotesPage() {
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 폼
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [phonemes, setPhonemes] = useState("");
  const [performance, setPerformance] = useState("75");
  const [memo, setMemo] = useState("");
  const [visible, setVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/center/children")
      .then((r) => r.json())
      .then((data) => {
        const list = data.children as { id: string; name: string }[];
        setChildren(list);
        if (list.length > 0) setSelectedChildId(list[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;
    setLoading(true);
    fetch(`/api/center/notes?childId=${selectedChildId}`)
      .then((r) => r.json())
      .then((data) => { setNotes(data.notes ?? []); setLoading(false); });
  }, [selectedChildId]);

  async function submitNote() {
    const phonemeList = phonemes.split(/[,\s]+/).map((p) => p.trim()).filter(Boolean);
    const perf = parseInt(performance, 10);
    if (!selectedChildId || phonemeList.length === 0 || !memo.trim() || isNaN(perf)) {
      setMsg("아이, 목표 음소, 수행도, 메모를 모두 입력해주세요");
      return;
    }
    setSubmitting(true);
    setMsg("");
    const res = await fetch("/api/center/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId: selectedChildId,
        sessionDate,
        targetPhonemes: phonemeList,
        performance: perf,
        memo: memo.trim(),
        isVisibleToParent: visible,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("일지 저장 완료!");
      setPhonemes(""); setMemo(""); setPerformance("75"); setVisible(true);
      setNotes((prev) => [data, ...prev]);
    } else {
      setMsg(data.error ?? "오류 발생");
    }
    setSubmitting(false);
  }

  async function toggleVisibility(noteId: string, current: boolean) {
    await fetch("/api/center/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, isVisibleToParent: !current }),
    });
    setNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, isVisibleToParent: !current } : n));
  }

  async function deleteNote(noteId: string) {
    if (!confirm("일지를 삭제하시겠습니까?")) return;
    await fetch("/api/center/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#3D3530]">치료 일지</h1>
        <p className="text-sm text-[#8B7E74] mt-1">회기별 치료 기록을 남기세요</p>
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

      {/* 일지 작성 폼 */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: "#FFF5EE", border: "1.5px solid #FFE4D8" }}
      >
        <p className="font-bold text-[#3D3530] text-sm">새 일지 작성</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#8B7E74] font-semibold block mb-1">세션 날짜</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
            />
          </div>
          <div>
            <label className="text-xs text-[#8B7E74] font-semibold block mb-1">
              수행도 (0~100)
            </label>
            <input
              type="number"
              value={performance}
              min="0"
              max="100"
              onChange={(e) => setPerformance(e.target.value)}
              className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-[#8B7E74] font-semibold block mb-1">
            목표 음소 (쉼표/공백 구분)
          </label>
          <input
            type="text"
            value={phonemes}
            onChange={(e) => setPhonemes(e.target.value)}
            placeholder="예: ㅅ, ㄹ"
            className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
          />
        </div>

        <div>
          <label className="text-xs text-[#8B7E74] font-semibold block mb-1">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="이번 세션 내용, 아이 반응, 다음 목표 등을 기록하세요"
            rows={4}
            className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40 resize-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="w-4 h-4 rounded accent-[#FFB38A]"
          />
          <span className="text-xs font-semibold text-[#3D3530]">부모에게 공개</span>
        </label>

        <button
          onClick={submitNote}
          disabled={submitting}
          className="w-full rounded-xl bg-[#FFB38A] text-white font-bold py-2.5 text-sm disabled:opacity-50"
        >
          {submitting ? "저장 중..." : "일지 저장하기"}
        </button>

        {msg && (
          <p className={`text-xs font-semibold text-center ${msg.includes("완료") ? "text-green-600" : "text-red-500"}`}>
            {msg}
          </p>
        )}
      </div>

      {/* 일지 목록 */}
      <div>
        <h2 className="font-bold text-[#3D3530] mb-3">저장된 일지</h2>
        {loading ? (
          <p className="text-sm text-[#8B7E74] text-center py-6">불러오는 중...</p>
        ) : notes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">📓</p>
            <p className="text-sm text-[#8B7E74]">작성된 일지가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl p-4 space-y-2"
                style={{ background: "white", border: "1.5px solid #F0E8E0" }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#3D3530] text-sm">
                    {new Date(note.sessionDate).toLocaleDateString("ko-KR", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${PERFORMANCE_COLOR(note.performance)}`}>
                      {note.performance}점
                    </span>
                    <button
                      onClick={() => toggleVisibility(note.id, note.isVisibleToParent)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        note.isVisibleToParent
                          ? "bg-teal-100 text-teal-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {note.isVisibleToParent ? "부모공개" : "비공개"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {note.targetPhonemes.map((p) => (
                    <span
                      key={p}
                      className="text-xs bg-[#FFF5EE] text-[#FFB38A] font-bold px-2 py-0.5 rounded-full"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-[#3D3530] leading-relaxed">{note.memo}</p>

                <div className="flex justify-end">
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-xs text-[#C4B5A8] hover:text-red-400 font-semibold"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
