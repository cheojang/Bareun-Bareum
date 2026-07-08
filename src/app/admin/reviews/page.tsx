"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 관리자 후기 심사 페이지.
 * 심사중(pending) 제출을 승인/거절할 수 있다. 2일이 지나면 자동 승인되므로,
 * 거절할 것이 있으면 그 전에 여기서 처리한다.
 */

interface Submission {
  id: string;
  url: string | null;
  screenshotUrl: string | null;
  channel: string;
  status: string;
  rejectReason: string | null;
  createdAt: string;
  approvedAt: string | null;
  user: { email: string | null; name: string | null; reviewBonusCount: number };
}

const CHANNEL_LABEL: Record<string, string> = {
  blog: "블로그",
  sns: "SNS",
  community: "커뮤니티",
  playstore: "플레이스토어",
};

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "심사중", bg: "#FEF3C7", color: "#B45309" },
  approved: { label: "승인", bg: "#F0FAF8", color: "#0D9488" },
  rejected: { label: "거절", bg: "#FDF2F8", color: "#EC4899" },
};

function remainHours(createdAt: string): number {
  const deadline = new Date(createdAt).getTime() + 2 * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((deadline - Date.now()) / (60 * 60 * 1000)));
}

export default function AdminReviewsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "불러오기 실패");
      setSubmissions(data.submissions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(id: string, action: "approve" | "reject") {
    if (action === "reject" && !confirm("이 후기를 거절할까요? 사용자에게 '출처 확인이 어려웠다'는 안내가 표시됩니다.")) return;
    setActing(id);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "처리 실패");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActing(null);
    }
  }

  const pending = submissions.filter((s) => s.status === "pending");
  const done = submissions.filter((s) => s.status !== "pending");

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#3D3530]">✍️ 후기 심사</h1>
          <p className="text-xs text-[#8B7E74] mt-1">
            심사중 후기는 제출 2일 후 자동 승인돼요. 거절할 건이 있으면 그 전에 처리하세요.
          </p>
        </div>
        <button
          onClick={load}
          className="px-3 py-1.5 rounded-xl text-sm font-bold bg-white border border-[#F0E8E0] text-[#8B7E74] hover:bg-[#F5F0EB]"
        >
          🔄 새로고침
        </button>
      </div>

      {error && (
        <p className="text-sm font-semibold text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-[#8B7E74] py-10 text-center">불러오는 중...</p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-bold text-[#3D3530]">
              심사중 <span className="text-[#B45309]">{pending.length}</span>건
            </h2>
            {pending.length === 0 && (
              <p className="text-sm text-[#C4B5A8] bg-white rounded-2xl px-4 py-6 text-center">
                심사할 후기가 없어요 ✅
              </p>
            )}
            {pending.map((s) => (
              <SubmissionCard key={s.id} s={s} acting={acting} onAct={act} />
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-[#3D3530]">처리 완료 {done.length}건</h2>
            {done.slice(0, 30).map((s) => (
              <SubmissionCard key={s.id} s={s} acting={acting} onAct={act} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function SubmissionCard({
  s,
  acting,
  onAct,
}: {
  s: Submission;
  acting: string | null;
  onAct: (id: string, action: "approve" | "reject") => void;
}) {
  const meta = STATUS_META[s.status] ?? STATUS_META.pending;
  const isPending = s.status === "pending";

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#F0E8E0] space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
        <span className="text-xs font-bold text-[#3D3530]">
          {s.user.name ?? "이름 없음"}
        </span>
        <span className="text-xs text-[#8B7E74]">{s.user.email}</span>
        <span className="text-[11px] text-[#C4B5A8]">
          누적 승인 {s.user.reviewBonusCount}회
        </span>
        <span className="text-[11px] text-[#C4B5A8] ml-auto">
          {new Date(s.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#8B7E74] flex-wrap">
        <span className="px-2 py-0.5 rounded-full bg-[#F5F0EB] font-semibold">
          {CHANNEL_LABEL[s.channel] ?? s.channel}
        </span>
        {s.screenshotUrl && (
          <a href={s.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-[#0D9488] font-bold hover:underline">
            📷 캡처본 보기
          </a>
        )}
        {s.url ? (
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#5B4E9B] font-bold hover:underline break-all">
            🔗 {s.url.length > 50 ? s.url.slice(0, 50) + "…" : s.url}
          </a>
        ) : (
          <span className="text-[#C4B5A8]">URL 미제출</span>
        )}
        {isPending && (
          <span className="text-[#B45309] font-semibold">
            ⏱ {remainHours(s.createdAt)}시간 후 자동 승인
          </span>
        )}
      </div>

      {isPending && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onAct(s.id, "approve")}
            disabled={acting === s.id}
            className="flex-1 py-2 rounded-xl text-sm font-black bg-[#F0FAF8] border-2 border-[#7EDFD0] text-[#0D9488] transition-all active:scale-95 disabled:opacity-50"
          >
            {acting === s.id ? "처리 중..." : "✓ 승인"}
          </button>
          <button
            onClick={() => onAct(s.id, "reject")}
            disabled={acting === s.id}
            className="flex-1 py-2 rounded-xl text-sm font-black bg-[#FDF2F8] border-2 border-[#F9A8D4] text-[#EC4899] transition-all active:scale-95 disabled:opacity-50"
          >
            ✕ 거절
          </button>
        </div>
      )}
    </div>
  );
}
