"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

export default function LoginPage() {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const canLogin = terms && privacy;

  // 이메일/비밀번호 로그인 상태
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!canLogin || !email.trim() || !password) return;

    setEmailLoading(true);
    setEmailError("");

    const res = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    if (res?.error) {
      setEmailError("이메일 또는 비밀번호가 맞지 않아요.");
      setEmailLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(160deg, #FFF5EE 0%, #F0FAF8 60%, #EDE9FE 100%)" }}
    >
      <div className="text-center mb-10">
        <div className="text-7xl mb-4 animate-float inline-block">🐣</div>
        <h1 className="text-3xl font-black text-[#3D3530]">바른발음</h1>
        <p className="text-[#8B7E74] mt-2">발음 연습, 놀이처럼 즐겁게!</p>
      </div>

      <BubbleCard className="w-full max-w-sm">
        <h2 className="text-xl font-bold text-[#3D3530] text-center mb-5">시작하기</h2>

        <div className="bg-[#FFF5EE] border-l-4 border-[#FFB38A] rounded-r-lg px-4 py-3 mb-5">
          <p className="text-xs font-bold text-[#3D3530] mb-1">⚠️ 중요 안내</p>
          <p className="text-xs text-[#8B7E74] leading-relaxed">
            바른발음은 가정 학습 보조 도구이며, 의료 서비스가 아닙니다.
            발음에 우려가 있으면 반드시 언어재활사와 상담하세요.
          </p>
        </div>

        {/* 전체 동의 */}
        <label className="flex items-center gap-3 cursor-pointer bg-[#FFF5EE] hover:bg-[#FFE8D6] px-4 py-3 rounded-xl mb-3 transition-colors">
          <input
            type="checkbox"
            checked={canLogin}
            onChange={(e) => { setTerms(e.target.checked); setPrivacy(e.target.checked); }}
            className="w-5 h-5 accent-[#FFB38A] flex-shrink-0"
          />
          <span className="text-sm font-bold text-[#3D3530]">아래 약관에 모두 동의합니다</span>
        </label>

        {/* 이용약관 */}
        <label className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl mb-2 hover:bg-[#FAFAF8] transition-colors">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="w-5 h-5 accent-[#FFB38A] flex-shrink-0"
          />
          <span className="text-sm text-[#3D3530] flex-1">이용약관 동의 <span className="text-[#FFB38A]">*</span></span>
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-xs text-[#FFB38A] hover:underline flex-shrink-0">보기</a>
        </label>

        {/* 개인정보 */}
        <label className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl mb-5 hover:bg-[#FAFAF8] transition-colors">
          <input
            type="checkbox"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
            className="w-5 h-5 accent-[#FFB38A] flex-shrink-0"
          />
          <span className="text-sm text-[#3D3530] flex-1">개인정보 처리방침 동의 <span className="text-[#FFB38A]">*</span></span>
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-[#FFB38A] hover:underline flex-shrink-0">보기</a>
        </label>

        <div className="flex flex-col gap-3">
          {/* 카카오 */}
          <button
            onClick={() => signIn("kakao", { callbackUrl: "/dashboard" })}
            disabled={!canLogin}
            className={`w-full flex items-center justify-center gap-3 rounded-full px-6 py-4 font-bold text-base bubble-btn transition-all border-2 ${
              canLogin
                ? "bg-[#FEE500] hover:bg-[#F5DC00] text-[#191919] border-[#FEE500]"
                : "bg-[#F0E8E0] text-[#C4B5A8] cursor-not-allowed border-[#F0E8E0]"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.78 1.56 5.22 3.9 6.73-.15.55-.97 3.63-.97 3.63-.02.09.03.18.11.22.08.04.17.02.23-.04l4.24-2.81c.82.13 1.66.2 2.49.2 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
            </svg>
            카카오로 계속하기
          </button>

          {/* 구글 */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            disabled={!canLogin}
            className={`w-full flex items-center justify-center gap-3 rounded-full px-6 py-4 font-bold text-base bubble-btn transition-all border-2 ${
              canLogin
                ? "bg-white hover:bg-gray-50 text-[#3D3530] border-[#F0E8E0]"
                : "bg-[#F0F0F0] text-[#C4B5A8] cursor-not-allowed border-[#E8E8E8]"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill={canLogin ? "#4285F4" : "#C4B5A8"} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill={canLogin ? "#34A853" : "#C4B5A8"} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill={canLogin ? "#FBBC05" : "#C4B5A8"} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill={canLogin ? "#EA4335" : "#C4B5A8"} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 계속하기
          </button>

          {/* 이메일 로그인 토글 */}
          <button
            onClick={() => setShowEmailLogin((v) => !v)}
            disabled={!canLogin}
            className={`w-full flex items-center justify-center gap-3 rounded-full px-6 py-4 font-bold text-base bubble-btn transition-all border-2 ${
              canLogin
                ? "bg-[#FAFAF8] hover:bg-[#F0E8E0] text-[#3D3530] border-[#F0E8E0]"
                : "bg-[#F0F0F0] text-[#C4B5A8] cursor-not-allowed border-[#E8E8E8]"
            }`}
          >
            <span className="text-lg">✉️</span>
            이메일로 로그인
          </button>
        </div>

        {/* 이메일/비밀번호 로그인 폼 */}
        {showEmailLogin && (
          <form onSubmit={handleEmailLogin} className="mt-4 pt-4 border-t border-[#F0E8E0] space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm text-[#3D3530] placeholder:text-[#C4B5A8] transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm text-[#3D3530] placeholder:text-[#C4B5A8] transition-colors"
            />
            {emailError && (
              <p className="text-xs text-[#EF4444] font-semibold">{emailError}</p>
            )}
            <BubbleButton
              type="submit"
              variant="peach"
              size="md"
              disabled={emailLoading || !canLogin || !email.trim() || !password}
              className="w-full"
            >
              {emailLoading ? "로그인 중..." : "로그인"}
            </BubbleButton>
          </form>
        )}

        {!canLogin && (
          <p className="text-xs text-center text-[#C4B5A8] mt-3">약관에 동의하면 로그인 버튼이 활성화돼요</p>
        )}

        {/* 회원가입 링크 */}
        <div className="mt-5 pt-4 border-t border-[#F0E8E0] text-center">
          <p className="text-xs text-[#8B7E74]">
            아직 계정이 없으신가요?{" "}
            <Link href="/signup" className="text-[#FFB38A] font-bold hover:underline">
              회원가입
            </Link>
          </p>
        </div>

        {/* 개발용 빠른 로그인 */}
        {process.env.NODE_ENV === "development" && (
          <DevLoginButtons />
        )}
      </BubbleCard>
    </main>
  );
}

function DevLoginButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function devLogin(email: string, dest: string) {
    setLoading(email);
    setError("");
    const res = await signIn("dev", { email, redirect: false });
    if (res?.error) {
      setError(res.error);
      setLoading(null);
      return;
    }
    window.location.href = dest;
  }

  return (
    <div className="mt-5 pt-4 border-t border-[#F0E8E0] space-y-2">
      <p className="text-[10px] text-center text-[#C4B5A8] font-semibold">개발 모드 빠른 로그인</p>
      <button
        onClick={() => devLogin("dev@test.com", "/dashboard")}
        disabled={!!loading}
        className="w-full rounded-xl bg-[#F0E8E0] hover:bg-[#E8DDD5] text-[#8B7E74] font-bold py-2.5 text-sm transition-colors disabled:opacity-50"
      >
        {loading === "dev@test.com" ? "로그인 중..." : "👪 부모 계정"}
      </button>
      <button
        onClick={() => devLogin("therapist@test.com", "/center/children")}
        disabled={!!loading}
        className="w-full rounded-xl bg-[#E8F5E9] hover:bg-[#D8EFD9] text-[#388E3C] font-bold py-2.5 text-sm transition-colors disabled:opacity-50"
      >
        {loading === "therapist@test.com" ? "로그인 중..." : "🩺 치료사 계정"}
      </button>
      <button
        onClick={() => devLogin("admin@test.com", "/center")}
        disabled={!!loading}
        className="w-full rounded-xl bg-[#E3F2FD] hover:bg-[#D3E8F5] text-[#1565C0] font-bold py-2.5 text-sm transition-colors disabled:opacity-50"
      >
        {loading === "admin@test.com" ? "로그인 중..." : "🏥 센터 어드민 계정"}
      </button>
      {error && <p className="text-xs text-red-500 text-center mt-1">{error}</p>}
    </div>
  );
}
