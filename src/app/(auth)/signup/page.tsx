"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

type Step = "form" | "verify";

export default function SignupPage() {
  const [step, setStep] = useState<Step>("form");

  // 폼 필드
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  // 인증번호
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 재발송 쿨다운
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const canSubmitForm = terms && privacy;
  const pwMatch = password === confirmPw;
  const pwLong = password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  const fullCode = code.join("");

  // ── Step 1: 폼 제출 → 인증번호 발송 ──────────────────────────────────────
  async function handleSendCode() {
    setError("");
    if (!name.trim() || !email.trim() || !password) {
      setError("모든 항목을 입력해주세요."); return;
    }
    if (!pwLong) { setError("비밀번호는 8자 이상, 영문과 숫자를 포함해야 해요."); return; }
    if (!pwMatch) { setError("비밀번호가 일치하지 않아요."); return; }
    if (!canSubmitForm) { setError("약관에 동의해주세요."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setError(data?.error || "발송 실패. 잠시 후 다시 시도해주세요."); return; }
      setStep("verify");
      setCooldown(60);
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: 인증번호 입력 → 회원가입 완료 ────────────────────────────────
  async function handleVerify() {
    if (fullCode.length < 6) { setError("인증번호 6자리를 입력해주세요."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, code: fullCode }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setError(data?.error || "회원가입에 실패했어요."); return; }

      // 자동 로그인
      const loginRes = await signIn("credentials", { email: email.trim(), password, redirect: false });
      if (loginRes?.error) {
        setError("가입은 완료됐지만 로그인에 실패했어요. 로그인 페이지에서 다시 시도해주세요.");
        return;
      }
      window.location.href = "/onboarding";
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  // 재발송
  async function handleResend() {
    if (cooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setError(data?.error || "재발송 실패."); return; }
      setCode(["", "", "", "", "", ""]);
      setCooldown(60);
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  // 인증번호 입력 핸들러
  function handleCodeInput(idx: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    setError("");
    if (digit && idx < 5) codeRefs.current[idx + 1]?.focus();
  }

  function handleCodeKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      codeRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter" && fullCode.length === 6) handleVerify();
  }

  // 붙여넣기 처리
  function handleCodePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      codeRefs.current[5]?.focus();
    }
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(160deg, #FFF5EE 0%, #F0FAF8 60%, #EDE9FE 100%)" }}
    >
      <div className="text-center mb-8">
        <div className="text-6xl mb-3 animate-float inline-block">🐣</div>
        <h1 className="text-2xl font-black text-[#3D3530]">
          {step === "form" ? "회원가입" : "이메일 인증"}
        </h1>
        <p className="text-sm text-[#8B7E74] mt-1">
          {step === "form" ? "바른발음과 함께 시작해요!" : `${email} 로 인증번호를 보냈어요`}
        </p>
      </div>

      <BubbleCard className="w-full max-w-sm">

        {/* ── Step 1: 가입 폼 ─────────────────────────────────────────── */}
        {step === "form" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3D3530] mb-1.5">이름</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="부모님 이름"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm text-[#3D3530] placeholder:text-[#C4B5A8] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D3530] mb-1.5">이메일</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm text-[#3D3530] placeholder:text-[#C4B5A8] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D3530] mb-1.5">비밀번호</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상, 영문+숫자"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm text-[#3D3530] placeholder:text-[#C4B5A8] transition-colors"
              />
              {password.length > 0 && !pwLong && (
                <p className="text-[11px] text-[#FCA5A5] mt-1">8자 이상, 영문과 숫자를 포함해주세요</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D3530] mb-1.5">비밀번호 확인</label>
              <input
                type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="비밀번호를 다시 입력해주세요"
                onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] focus:border-[#FFB38A] outline-none text-sm text-[#3D3530] placeholder:text-[#C4B5A8] transition-colors"
              />
              {confirmPw.length > 0 && !pwMatch && (
                <p className="text-[11px] text-[#FCA5A5] mt-1">비밀번호가 일치하지 않아요</p>
              )}
            </div>

            {/* 약관 동의 */}
            <div className="pt-1 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer bg-[#FFF5EE] hover:bg-[#FFE8D6] px-4 py-3 rounded-xl transition-colors">
                <input
                  type="checkbox" checked={canSubmitForm}
                  onChange={(e) => { setTerms(e.target.checked); setPrivacy(e.target.checked); }}
                  className="w-5 h-5 accent-[#FFB38A] flex-shrink-0"
                />
                <span className="text-sm font-bold text-[#3D3530]">약관에 모두 동의합니다</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer px-4 py-1.5 rounded-xl hover:bg-[#FAFAF8] transition-colors">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
                  className="w-4 h-4 accent-[#FFB38A] flex-shrink-0" />
                <span className="text-xs text-[#3D3530] flex-1">이용약관 동의 <span className="text-[#FFB38A]">*</span></span>
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#FFB38A] hover:underline flex-shrink-0">보기</a>
              </label>
              <label className="flex items-center gap-3 cursor-pointer px-4 py-1.5 rounded-xl hover:bg-[#FAFAF8] transition-colors">
                <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)}
                  className="w-4 h-4 accent-[#FFB38A] flex-shrink-0" />
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
              onClick={handleSendCode}
              variant="peach" size="lg"
              disabled={loading || !canSubmitForm}
              className="w-full"
            >
              {loading ? "발송 중..." : "인증번호 받기 📧"}
            </BubbleButton>
          </div>
        )}

        {/* ── Step 2: 인증번호 입력 ────────────────────────────────────── */}
        {step === "verify" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-[#8B7E74]">6자리 인증번호를 입력해주세요</p>
              <p className="text-xs text-[#C4B5A8] mt-1">스팸 메일함도 확인해보세요</p>
            </div>

            {/* 6자리 입력 박스 */}
            <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { codeRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(idx, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                  className={`
                    w-11 h-14 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all
                    ${digit ? "border-[#FFB38A] bg-[#FFF5EE] text-[#FFB38A]" : "border-[#F0E8E0] bg-white text-[#3D3530]"}
                    focus:border-[#FFB38A] focus:bg-[#FFF5EE]
                  `}
                />
              ))}
            </div>

            {error && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5]/30 rounded-xl px-4 py-3">
                <p className="text-xs text-[#EF4444] font-semibold text-center">{error}</p>
              </div>
            )}

            <BubbleButton
              onClick={handleVerify}
              variant="peach" size="lg"
              disabled={loading || fullCode.length < 6}
              className="w-full"
            >
              {loading ? "확인 중..." : "가입 완료 🎉"}
            </BubbleButton>

            {/* 재발송 + 이메일 수정 */}
            <div className="flex items-center justify-center gap-4 text-xs text-[#8B7E74]">
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="hover:text-[#FFB38A] disabled:opacity-50 transition-colors"
              >
                {cooldown > 0 ? `재발송 (${cooldown}s)` : "인증번호 재발송"}
              </button>
              <span className="text-[#F0E8E0]">|</span>
              <button
                onClick={() => { setStep("form"); setError(""); setCode(["","","","","",""]); }}
                className="hover:text-[#FFB38A] transition-colors"
              >
                이메일 수정
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-[#F0E8E0] text-center">
          <p className="text-xs text-[#8B7E74]">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-[#FFB38A] font-bold hover:underline">로그인</Link>
          </p>
        </div>
      </BubbleCard>
    </main>
  );
}
