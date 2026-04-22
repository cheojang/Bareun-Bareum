"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const canSubmit = terms && privacy;

  const pwMatch = password === confirmPw;
  const pwLong = password.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (!name.trim() || !email.trim() || !password) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    if (!pwLong) {
      setError("비밀번호는 6자 이상이어야 해요.");
      return;
    }
    if (!pwMatch) {
      setError("비밀번호가 일치하지 않아요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "회원가입에 실패했어요.");
        setLoading(false);
        return;
      }

      // 가입 성공 → 자동 로그인
      const loginRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError("가입은 완료됐지만 로그인에 실패했어요. 로그인 페이지에서 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      window.location.href = "/onboarding";
    } catch {
      setError("네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(160deg, #FFF5EE 0%, #F0FAF8 60%, #EDE9FE 100%)" }}
    >
      <div className="text-center mb-8">
        <div className="text-6xl mb-3 animate-float inline-block">🐣</div>
        <h1 className="text-2xl font-black text-[#3D3530]">회원가입</h1>
        <p className="text-sm text-[#8B7E74] mt-1">바른발음과 함께 시작해요!</p>
      </div>

      <BubbleCard className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-xs font-bold text-[#3D3530] mb-1.5">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="부모님 이름"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm text-[#3D3530] placeholder:text-[#C4B5A8] transition-colors"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-xs font-bold text-[#3D3530] mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm text-[#3D3530] placeholder:text-[#C4B5A8] transition-colors"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-xs font-bold text-[#3D3530] mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm text-[#3D3530] placeholder:text-[#C4B5A8] transition-colors"
            />
            {password.length > 0 && !pwLong && (
              <p className="text-[11px] text-[#FCA5A5] mt-1">6자 이상 입력해주세요</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-xs font-bold text-[#3D3530] mb-1.5">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="비밀번호를 다시 입력해주세요"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm text-[#3D3530] placeholder:text-[#C4B5A8] transition-colors"
            />
            {confirmPw.length > 0 && !pwMatch && (
              <p className="text-[11px] text-[#FCA5A5] mt-1">비밀번호가 일치하지 않아요</p>
            )}
          </div>

          {/* 약관 동의 */}
          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer bg-[#FFF5EE] hover:bg-[#FFE8D6] px-4 py-3 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={canSubmit}
                onChange={(e) => { setTerms(e.target.checked); setPrivacy(e.target.checked); }}
                className="w-5 h-5 accent-[#FFB38A] flex-shrink-0"
              />
              <span className="text-sm font-bold text-[#3D3530]">약관에 모두 동의합니다</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer px-4 py-1.5 rounded-xl hover:bg-[#FAFAF8] transition-colors">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="w-4 h-4 accent-[#FFB38A] flex-shrink-0"
              />
              <span className="text-xs text-[#3D3530] flex-1">이용약관 동의 <span className="text-[#FFB38A]">*</span></span>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#FFB38A] hover:underline flex-shrink-0">보기</a>
            </label>

            <label className="flex items-center gap-3 cursor-pointer px-4 py-1.5 rounded-xl hover:bg-[#FAFAF8] transition-colors">
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                className="w-4 h-4 accent-[#FFB38A] flex-shrink-0"
              />
              <span className="text-xs text-[#3D3530] flex-1">개인정보 처리방침 동의 <span className="text-[#FFB38A]">*</span></span>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#FFB38A] hover:underline flex-shrink-0">보기</a>
            </label>
          </div>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5]/30 rounded-xl px-4 py-3">
              <p className="text-xs text-[#EF4444] font-semibold">{error}</p>
            </div>
          )}

          <BubbleButton
            type="submit"
            variant="peach"
            size="lg"
            disabled={loading || !canSubmit}
            className="w-full"
          >
            {loading ? "가입 중..." : "회원가입"}
          </BubbleButton>
        </form>

        <div className="mt-5 pt-4 border-t border-[#F0E8E0] text-center">
          <p className="text-xs text-[#8B7E74]">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-[#FFB38A] font-bold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </BubbleCard>
    </main>
  );
}
