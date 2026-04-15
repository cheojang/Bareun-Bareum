"use client";

import { useState, useEffect } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isPublished: boolean;
  createdAt: string;
}

const TYPE_OPTIONS = [
  { value: "notice", label: "📢 공지",      textColor: "text-[#FFB38A]", bg: "bg-[#FFF5EE]" },
  { value: "update", label: "✨ 업데이트",  textColor: "text-[#8B7EFF]", bg: "bg-[#F5F3FF]" },
  { value: "event",  label: "🎉 이벤트",    textColor: "text-[#0D9488]", bg: "bg-[#F0FAF8]" },
];

const EMPTY_FORM = { title: "", content: "", type: "notice" };

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      // 관리자용 전체 조회 (발행/비발행 포함) — 일반 GET은 published만 반환
      // 여기서는 편의상 일반 API 사용 (필요 시 별도 admin API 추가)
      const res = await fetch("/api/announcements/admin");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnnouncements(data);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id);
    setForm({ title: a.title, content: a.content, type: a.type });
    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editingId
        ? `/api/announcements/${editingId}`
        : "/api/announcements";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "저장 실패");
      }

      setSuccess(editingId ? "수정 완료!" : "공지사항이 등록됐어요!");
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(a: Announcement) {
    try {
      await fetch(`/api/announcements/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !a.isPublished }),
      });
      await loadAll();
    } catch {
      setError("상태 변경 실패");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제할까요?")) return;
    try {
      await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      setSuccess("삭제됐어요.");
      await loadAll();
    } catch {
      setError("삭제 실패");
    }
  }

  const selectedTypeMeta = TYPE_OPTIONS.find((t) => t.value === form.type) ?? TYPE_OPTIONS[0];

  return (
    <div className="px-5 pt-6 pb-12 max-w-3xl mx-auto space-y-8">

      {/* 페이지 제목 */}
      <div>
        <h1 className="text-2xl font-black text-[#3D3530]">📢 공지사항 관리</h1>
        <p className="text-sm text-[#8B7E74] mt-1">업데이트, 공지, 이벤트를 작성하고 관리해요</p>
      </div>

      {/* 글로벌 메시지 */}
      {error && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl px-4 py-3">
          <p className="text-sm text-[#EF4444] font-bold">🚨 {error}</p>
        </div>
      )}
      {success && (
        <div className="bg-[#F0FAF8] border border-[#7EDFD0] rounded-2xl px-4 py-3">
          <p className="text-sm text-[#0D9488] font-bold">✅ {success}</p>
        </div>
      )}

      {/* ── 작성 / 수정 폼 ──────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 space-y-4 border-2"
        style={{
          background: "rgba(255,255,255,0.85)",
          borderColor: editingId ? "#C4B5FD" : "#F0E8E0",
        }}
      >
        <p className="font-black text-[#3D3530] text-lg">
          {editingId ? "✏️ 공지 수정" : "➕ 새 공지사항 작성"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 유형 선택 */}
          <div>
            <label className="block text-sm font-bold text-[#3D3530] mb-2">유형</label>
            <div className="flex gap-2 flex-wrap">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                    form.type === t.value
                      ? `${t.bg} ${t.textColor} border-current`
                      : "bg-white text-[#8B7E74] border-[#F0E8E0]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-bold text-[#3D3530] mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mr-1 ${selectedTypeMeta.bg} ${selectedTypeMeta.textColor}`}>
                {selectedTypeMeta.label}
              </span>
              제목
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="예) 바른발음 v1.1 업데이트 안내"
              maxLength={100}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#F0E8E0] text-[#3D3530] font-semibold placeholder:text-[#C4B5A8] focus:outline-none focus:border-[#FFB38A] transition-colors"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-bold text-[#3D3530] mb-2">내용</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="공지 내용을 입력해주세요. 줄바꿈이 그대로 표시돼요."
              rows={5}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#F0E8E0] text-[#3D3530] text-sm font-medium placeholder:text-[#C4B5A8] focus:outline-none focus:border-[#FFB38A] transition-colors resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl font-black text-sm text-white transition-all disabled:opacity-50"
              style={{ backgroundColor: editingId ? "#C4B5FD" : "#FFB38A" }}
            >
              {saving ? "저장 중..." : editingId ? "수정 완료" : "공지 등록"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 rounded-2xl font-bold text-sm text-[#8B7E74] bg-[#F0E8E0] transition-all hover:bg-[#E8DDD5]"
              >
                취소
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── 기존 공지 목록 ─────────────────────────────────────── */}
      <div>
        <h2 className="font-black text-[#3D3530] mb-4">
          등록된 공지사항{" "}
          <span className="text-[#FFB38A]">{announcements.length}</span>개
        </h2>

        {loading ? (
          <p className="text-sm text-[#8B7E74] py-6 text-center">불러오는 중...</p>
        ) : announcements.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-semibold text-[#3D3530]">등록된 공지가 없어요</p>
            <p className="text-xs text-[#8B7E74] mt-1">위 폼에서 첫 공지를 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => {
              const meta = TYPE_OPTIONS.find((t) => t.value === a.type) ?? TYPE_OPTIONS[0];
              return (
                <div
                  key={a.id}
                  className={`rounded-2xl border-2 p-4 transition-all ${
                    !a.isPublished ? "opacity-50 border-dashed border-[#F0E8E0]" : "border-[#F0E8E0]"
                  }`}
                  style={{ background: "rgba(255,255,255,0.85)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.textColor}`}>
                          {meta.label}
                        </span>
                        {!a.isPublished && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#8B7E74]">
                            비공개
                          </span>
                        )}
                        <span className="text-[10px] text-[#C4B5A8]">
                          {new Date(a.createdAt).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="font-bold text-[#3D3530] text-sm leading-snug">{a.title}</p>
                      <p className="text-xs text-[#8B7E74] mt-1 leading-relaxed line-clamp-2">
                        {a.content}
                      </p>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => startEdit(a)}
                        className="text-xs px-3 py-1.5 rounded-xl font-bold bg-[#F5F3FF] text-[#8B7EFF] hover:bg-[#EDE9FE] transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleTogglePublish(a)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          a.isPublished
                            ? "bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A]"
                            : "bg-[#F0FAF8] text-[#0D9488] hover:bg-[#CCFBF1]"
                        }`}
                      >
                        {a.isPublished ? "숨기기" : "공개"}
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-xs px-3 py-1.5 rounded-xl font-bold bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                      >
                        삭제
                      </button>
                    </div>
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
