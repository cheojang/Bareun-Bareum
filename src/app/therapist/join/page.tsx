"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SoriLogo } from "@/components/ui/SoriMascot";

export default function TherapistJoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inviteCode, setInviteCode] = useState(searchParams.get("code") ?? "");
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim() || !name.trim()) {
      setError("초대코드와 이름을 입력해주세요");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/therapist/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: inviteCode.trim(), name: name.trim(), license, phone }),
    });
    const data = await res.json();

    if (res.ok) {
      setSuccess(
        `${data.centerName}에 ${data.isAdmin ? "센터 관리자" : "치료사"}로 등록됐습니다!`
      );
      // 세션 갱신을 위해 리로드 후 이동
      setTimeout(() => {
        window.location.href = data.isAdmin ? "/center" : "/therapist/children";
      }, 1500);
    } else {
      setError(data.error ?? "오류가 발생했습니다");
    }
    setSubmitting(false);
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(160deg, #FFF5EE 0%, #F0FAF8 60%, #EDE9FE 100%)" }}
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <SoriLogo size={40} />
          <span className="text-2xl font-black text-[#3D3530]">바른발음</span>
        </div>
        <h1 className="text-xl font-black text-[#3D3530]">치료사 가입</h1>
        <p className="text-sm text-[#8B7E74] mt-1">센터 초대코드로 치료사 계정을 등록하세요</p>
      </div>

      <div
        className="w-full max-w-sm rounded-3xl p-6 space-y-4"
        style={{ background: "white", boxShadow: "0 8px 32px rgba(255,179,138,0.15)", border: "1.5px solid #F0E8E0" }}
      >
        {success ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-4xl">🎉</p>
            <p className="font-bold text-[#3D3530]">{success}</p>
            <p className="text-xs text-[#8B7E74]">잠시 후 대시보드로 이동합니다...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#8B7E74] block mb-1">센터 초대코드 *</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="센터에서 받은 초대코드 입력"
                className="w-full rounded-xl border border-[#F0E8E0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40 font-mono tracking-wider"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8B7E74] block mb-1">이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full rounded-xl border border-[#F0E8E0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8B7E74] block mb-1">
                언어재활사 자격증 번호 <span className="font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="제 00000 호"
                className="w-full rounded-xl border border-[#F0E8E0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8B7E74] block mb-1">
                연락처 <span className="font-normal">(선택)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full rounded-xl border border-[#F0E8E0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40"
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#FFB38A] text-white font-bold py-3 text-sm disabled:opacity-50"
            >
              {submitting ? "등록 중..." : "치료사로 가입하기"}
            </button>

            <p className="text-center text-xs text-[#C4B5A8]">
              치료사 가입 전 반드시{" "}
              <a href="/login" className="text-[#FFB38A] underline">로그인</a>이 필요합니다
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
