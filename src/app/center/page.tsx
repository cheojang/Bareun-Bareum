"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = { therapistCount: number; childCount: number; homeworkTotal: number; homeworkDone: number; completionRate: number };
type TherapistItem = { id: string; name: string; email: string; license: string | null; childCount: number; homeworkCount: number; noteCount: number };
type ChildItem = { id: string; name: string; parentName: string | null; parentEmail: string; enrolledAt: string; therapistName: string | null; pendingHomework: number };
type CenterInfo = { id: string; name: string; inviteCode: string; plan: string };

export default function CenterDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<CenterInfo | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [therapists, setTherapists] = useState<TherapistItem[]>([]);
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/center/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setCenter(data.center);
        setStats(data.stats);
        setTherapists(data.therapists);
        setChildren(data.children);
        setLoading(false);
      });
  }, []);

  function copyCode() {
    if (!center) return;
    navigator.clipboard.writeText(center.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-[#8B7E74]">불러오는 중...</p></div>;
  }

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#3D3530]">{center?.name}</h1>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${center?.plan === "pro" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
            {center?.plan?.toUpperCase()} 플랜
          </span>
        </div>
      </div>

      {/* 초대코드 카드 */}
      <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 100%)", border: "1.5px solid #FFE4D8" }}>
        <p className="text-xs font-bold text-[#C4B5A8] mb-2">센터 초대코드</p>
        <div className="flex items-center gap-3 flex-wrap">
          <p className="font-mono font-black text-2xl text-[#FFB38A] tracking-widest">{center?.inviteCode}</p>
          <button onClick={copyCode}
            className={`rounded-xl font-bold px-4 py-2 text-sm transition-colors ${copied ? "bg-green-500 text-white" : "bg-[#FFB38A] text-white"}`}>
            {copied ? "복사됨 ✓" : "복사"}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="rounded-xl p-3" style={{ background: "white" }}>
            <p className="text-[10px] font-bold text-[#C4B5A8]">부모 연결 안내</p>
            <p className="text-xs text-[#8B7E74] mt-0.5">부모 앱 → 숙제 탭 → 초대코드 입력</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "white" }}>
            <p className="text-[10px] font-bold text-[#C4B5A8]">치료사 가입 링크</p>
            <p className="text-xs text-[#8B7E74] mt-0.5 break-all">
              /therapist/join?code={center?.inviteCode}
            </p>
          </div>
        </div>
      </div>

      {/* 통계 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "치료사", value: stats.therapistCount, icon: "🩺", unit: "명" },
            { label: "등록 아이", value: stats.childCount, icon: "👦", unit: "명" },
            { label: "숙제 완료율", value: stats.completionRate, icon: "📋", unit: "%" },
            { label: "전체 숙제", value: `${stats.homeworkDone}/${stats.homeworkTotal}`, icon: "✅", unit: "" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "white", border: "1.5px solid #F0E8E0" }}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-xl font-black text-[#3D3530]">{s.value}{s.unit}</p>
              <p className="text-xs text-[#8B7E74]">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
        {/* 치료사 목록 */}
        <div>
          <h2 className="font-bold text-[#3D3530] mb-3">치료사 ({therapists.length}명)</h2>
          {therapists.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: "white", border: "1.5px solid #F0E8E0" }}>
              <p className="text-3xl mb-2">🩺</p>
              <p className="text-sm text-[#8B7E74]">아직 가입한 치료사가 없습니다</p>
              <p className="text-xs text-[#C4B5A8] mt-1">위 초대코드를 공유하세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {therapists.map((t) => (
                <div key={t.id} className="rounded-2xl p-4" style={{ background: "white", border: "1.5px solid #F0E8E0" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#3D3530]">{t.name}</p>
                      <p className="text-xs text-[#8B7E74]">{t.email}</p>
                      {t.license && <p className="text-xs text-[#C4B5A8]">자격증: {t.license}</p>}
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs text-[#8B7E74]">담당 {t.childCount}명</p>
                      <p className="text-xs text-[#8B7E74]">일지 {t.noteCount}건</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 등록 아이 목록 */}
        <div>
          <h2 className="font-bold text-[#3D3530] mb-3">등록 아이 ({children.length}명)</h2>
          {children.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: "white", border: "1.5px solid #F0E8E0" }}>
              <p className="text-3xl mb-2">👦</p>
              <p className="text-sm text-[#8B7E74]">등록된 아이가 없습니다</p>
              <p className="text-xs text-[#C4B5A8] mt-1">부모에게 초대코드를 공유하세요</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {children.map((c) => (
                <div key={c.id} className="rounded-2xl p-4" style={{ background: "white", border: "1.5px solid #F0E8E0" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#3D3530]">{c.name}</p>
                      <p className="text-xs text-[#8B7E74]">보호자: {c.parentName ?? c.parentEmail}</p>
                    </div>
                    <div className="text-right">
                      {c.therapistName ? (
                        <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                          {c.therapistName}
                        </span>
                      ) : (
                        <span className="text-xs bg-[#FFF5EE] text-[#FFB38A] font-bold px-2 py-0.5 rounded-full">
                          미배정
                        </span>
                      )}
                      {c.pendingHomework > 0 && (
                        <p className="text-xs text-[#C4B5A8] mt-1">숙제 {c.pendingHomework}개</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 빠른 이동 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-6">
        {[
          { href: "/therapist/children", icon: "👦", label: "아이 배정" },
          { href: "/therapist/homework", icon: "📋", label: "숙제 배정" },
          { href: "/therapist/notes", icon: "📓", label: "치료 일지" },
          { href: "/therapist/messages", icon: "💬", label: "메시지" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="rounded-2xl p-4 text-center hover:bg-[#FFF5EE] transition-colors"
            style={{ background: "white", border: "1.5px solid #F0E8E0" }}>
            <p className="text-2xl mb-1">{item.icon}</p>
            <p className="text-sm font-bold text-[#3D3530]">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
