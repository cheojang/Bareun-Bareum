"use client";

import { useState } from "react";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { TermsAgreementModal } from "@/components/auth/TermsAgreementModal";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  const handleAgreeTerms = () => {
    setHasAgreed(true);
    setShowModal(false);
  };

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(160deg, #FFF5EE 0%, #F0FAF8 60%, #EDE9FE 100%)" }}
    >
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="text-7xl mb-4 animate-float inline-block">🐣</div>
        <h1 className="text-3xl font-black text-[#3D3530]">바른발음</h1>
        <p className="text-[#8B7E74] mt-2">발음 연습, 놀이처럼 즐겁게!</p>
      </div>

      {/* Login card */}
      <BubbleCard className="w-full max-w-sm">
        <h2 className="text-xl font-bold text-[#3D3530] text-center mb-6">
          시작하기
        </h2>

        {hasAgreed ? (
          <div className="flex flex-col gap-3">
            <SocialLoginButton provider="kakao" />
            <SocialLoginButton provider="google" />

            <button
              onClick={() => setHasAgreed(false)}
              className="text-xs text-[#8B7E74] hover:underline text-center mt-2"
            >
              약관 다시 보기
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-[#FFF5EE] border-l-4 border-[#FFB38A] rounded-r-lg px-4 py-3">
              <p className="text-xs font-bold text-[#3D3530] mb-1">
                ⚠️ 중요 안내
              </p>
              <p className="text-xs text-[#8B7E74] leading-relaxed">
                바른발음은 가정 학습 보조 도구이며, 의료 서비스가 아닙니다.
                발음에 우려가 있으면 반드시 언어재활사와 상담하세요.
              </p>
            </div>

            <BubbleButton
              variant="peach"
              size="lg"
              onClick={() => setShowModal(true)}
              className="w-full"
            >
              약관 확인 및 동의
            </BubbleButton>
          </div>
        )}
      </BubbleCard>

      {/* 약관 동의 모달 */}
      <TermsAgreementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAgree={handleAgreeTerms}
      />
    </main>
  );
}
