"use client";

import { useState, useRef, useEffect } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

interface Props {
  initialUnreadCount: number;
}

const TYPE_META: Record<string, { label: string; textColor: string; bg: string }> = {
  notice: { label: "공지",       textColor: "text-[#FFB38A]", bg: "bg-[#FFF5EE]" },
  update: { label: "업데이트",  textColor: "text-[#8B7EFF]", bg: "bg-[#F5F3FF]" },
  event:  { label: "이벤트",    textColor: "text-[#0D9488]", bg: "bg-[#F0FAF8]" },
};

export function NotificationBell({ initialUnreadCount }: Props) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
    setLoading(true);

    try {
      const res = await fetch("/api/announcements");
      if (!res.ok) throw new Error("fetch failed");
      const data: Announcement[] = await res.json();
      setAnnouncements(data);

      // 안읽은 항목 일괄 읽음 처리 (fire-and-forget)
      const unread = data.filter((a) => !a.isRead);
      if (unread.length > 0) {
        await Promise.allSettled(
          unread.map((a) =>
            fetch(`/api/announcements/${a.id}/read`, { method: "POST" })
          )
        );
        setUnreadCount(0);
        // 로컬 상태도 읽음으로 갱신
        setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
      }
    } catch {
      // 에러 시 조용히 실패 (알림 기능은 비핵심)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      {/* 벨 버튼 */}
      <button
        onClick={handleToggle}
        aria-label="알림"
        className="relative p-2 rounded-full hover:bg-[#FFF5EE] transition-colors"
      >
        <span className="text-xl leading-none">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#EF4444] rounded-full text-white text-[10px] font-black flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 패널 */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-xl border border-[#F0E8E0] z-50 overflow-hidden"
          style={{
            background: "rgba(253,250,245,0.98)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* 헤더 */}
          <div className="px-4 py-3 border-b border-[#F0E8E0] flex items-center justify-between">
            <p className="font-black text-[#3D3530] text-sm">🔔 알림</p>
            <span className="text-[10px] text-[#C4B5A8]">
              {unreadCount === 0 ? "모두 읽음" : `${unreadCount}개 안읽음`}
            </span>
          </div>

          {/* 목록 */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center space-y-2">
                <div className="text-2xl animate-pulse">🔔</div>
                <p className="text-sm text-[#8B7E74]">불러오는 중...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-3xl">🔕</p>
                <p className="text-sm font-semibold text-[#3D3530]">새로운 알림이 없어요</p>
                <p className="text-xs text-[#8B7E74]">업데이트나 공지가 있으면 알려드릴게요</p>
              </div>
            ) : (
              announcements.map((a) => {
                const meta = TYPE_META[a.type] ?? TYPE_META.notice;
                const date = new Date(a.createdAt).toLocaleDateString("ko-KR", {
                  month: "long",
                  day: "numeric",
                });
                return (
                  <div
                    key={a.id}
                    className={`px-4 py-3.5 border-b border-[#F0E8E0] last:border-0 transition-colors ${
                      !a.isRead ? "bg-[#FFFAF7]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.textColor}`}
                      >
                        {meta.label}
                      </span>
                      {!a.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                      )}
                      <span className="ml-auto text-[10px] text-[#C4B5A8]">{date}</span>
                    </div>
                    <p className="text-sm font-bold text-[#3D3530] leading-snug">{a.title}</p>
                    <p className="text-xs text-[#8B7E74] mt-1 leading-relaxed whitespace-pre-line">
                      {a.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
