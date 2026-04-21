"use client";

import { useEffect, useRef, useState } from "react";

type MessageItem = {
  id: string;
  content: string;
  senderRole: "therapist" | "parent";
  isRead: boolean;
  sentAt: string;
};

type ChildInfo = {
  id: string;
  name: string;
  therapist: { id: string; name: string } | null;
};

export default function ParentMessagesPage() {
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [therapistName, setTherapistName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  function loadMessages(childId: string) {
    setLoading(true);
    fetch(`/api/parent/messages?childId=${childId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages ?? []);
        setTherapistName(data.therapist?.name ?? null);
        setLoading(false);
      });
  }

  useEffect(() => {
    if (!selectedChildId) return;
    loadMessages(selectedChildId);
    const timer = setInterval(() => loadMessages(selectedChildId), 60_000);
    return () => clearInterval(timer);
  }, [selectedChildId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!content.trim() || !selectedChildId) return;
    setSending(true);
    const res = await fetch("/api/parent/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: selectedChildId, content: content.trim() }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setContent("");
    }
    setSending(false);
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const hasTherapist = !!selectedChild?.therapist;

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 56px - 72px)" }}>
      {/* 상단 */}
      <div className="px-5 pt-6 pb-3 md:px-8 space-y-3 border-b border-[#F0E8E0]">
        <div>
          <h1 className="text-2xl font-black text-[#3D3530]">메시지</h1>
          <p className="text-sm text-[#8B7E74] mt-0.5">
            {therapistName ? `${therapistName} 치료사와 대화하세요` : "치료사와 소통하세요"}
          </p>
        </div>
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
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-4 space-y-3">
        {!hasTherapist && !loading ? (
          <div className="text-center pt-12 space-y-2">
            <p className="text-4xl">💬</p>
            <p className="font-bold text-[#3D3530]">아직 치료사와 연결되지 않았어요</p>
            <p className="text-xs text-[#8B7E74]">
              숙제 탭에서 초대코드를 입력해 센터와 연결하세요
            </p>
          </div>
        ) : loading ? (
          <p className="text-center text-sm text-[#8B7E74] pt-8">불러오는 중...</p>
        ) : messages.length === 0 ? (
          <div className="text-center pt-12">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm text-[#8B7E74]">
              {therapistName} 치료사와의 대화를 시작하세요
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderRole === "parent";
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-[#F0E8E0] flex items-center justify-center text-xs font-bold text-[#8B7E74] mr-2 shrink-0 self-end">
                    치
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMe
                      ? "bg-[#FFB38A] text-white rounded-br-sm"
                      : "bg-[#F5EDE5] text-[#3D3530] rounded-bl-sm"
                  }`}
                >
                  <p>{m.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-[#C4B5A8]"} text-right`}>
                    {new Date(m.sentAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      {hasTherapist && (
        <div
          className="px-4 py-3 flex gap-2 items-end"
          style={{
            borderTop: "1.5px solid #F0E8E0",
            background: "rgba(255,255,255,0.96)",
          }}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder="메시지 입력..."
            rows={1}
            className="flex-1 rounded-xl border border-[#F0E8E0] px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40 resize-none"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !content.trim()}
            className="rounded-xl bg-[#FFB38A] text-white font-bold px-4 py-2.5 text-sm disabled:opacity-40 shrink-0"
          >
            전송
          </button>
        </div>
      )}
    </div>
  );
}
