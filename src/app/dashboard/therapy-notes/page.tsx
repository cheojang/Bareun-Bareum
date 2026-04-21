"use client";

import { useEffect, useState } from "react";

type NoteItem = {
  id: string;
  sessionDate: string;
  targetPhonemes: string[];
  performance: number;
  memo: string;
  therapistName: string;
};

type ChildInfo = { id: string; name: string; therapist: { id: string; name: string } | null };

const PERFORMANCE_COLOR = (p: number) =>
  p >= 80 ? "text-teal-600 bg-teal-50" : p >= 60 ? "text-yellow-700 bg-yellow-50" : "text-red-500 bg-red-50";

export default function ParentTherapyNotesPage() {
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/parent/children")
      .then((r) => r.json())
      .then((data) => {
        const list = data.children ?? [];
        setChildren(list);
        if (list.length > 0) setSelectedChildId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;
    setLoading(true);
    fetch(`/api/parent/notes?childId=${selectedChildId}`)
      .then((r) => r.json())
      .then((data) => { setNotes(data.notes ?? []); setLoading(false); });
  }, [selectedChildId]);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#3D3530]">치료 일지</h1>
        <p className="text-sm text-[#8B7E74] mt-1">치료사가 공유한 회기 기록이에요</p>
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

      {/* 치료사 미연결 안내 */}
      {selectedChild && !selectedChild.therapist && !loading && (
        <div className="text-center py-12 space-y-2">
          <p className="text-4xl">📓</p>
          <p className="font-bold text-[#3D3530]">아직 치료사와 연결되지 않았어요</p>
          <p className="text-xs text-[#8B7E74]">
            숙제 탭에서 초대코드를 입력해 센터와 연결하세요
          </p>
        </div>
      )}

      {/* 일지 목록 */}
      {loading ? (
        <p className="text-center text-sm text-[#8B7E74] py-8">불러오는 중...</p>
      ) : notes.length === 0 && selectedChild?.therapist ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">📓</p>
          <p className="font-bold text-[#3D3530]">공유된 일지가 없어요</p>
          <p className="text-xs text-[#8B7E74] mt-1">치료사가 일지를 공유하면 여기에 표시돼요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "white", border: "1.5px solid #F0E8E0" }}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <p className="font-bold text-[#3D3530] text-sm">
                  {new Date(note.sessionDate).toLocaleDateString("ko-KR", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
                <span
                  className={`text-sm font-black px-3 py-1 rounded-full ${PERFORMANCE_COLOR(note.performance)}`}
                >
                  {note.performance}점
                </span>
              </div>

              {/* 목표 음소 */}
              <div className="flex flex-wrap gap-1.5">
                {note.targetPhonemes.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-[#FFF5EE] text-[#FFB38A] font-bold px-2 py-0.5 rounded-full"
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* 메모 */}
              <div
                className="rounded-xl p-3 text-sm text-[#3D3530] leading-relaxed"
                style={{ background: "#FAFAF8" }}
              >
                {note.memo}
              </div>

              <p className="text-xs text-[#C4B5A8] text-right">
                {note.therapistName} 치료사
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
