"use client";

import { useState } from "react";
import { BubbleButton } from "@/components/ui/BubbleButton";

interface TermsAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export function TermsAgreementModal({
  isOpen,
  onClose,
  onAgree,
}: TermsAgreementModalProps) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  const canAgree = agreedTerms && agreedPrivacy;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-h-[90dvh] overflow-y-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#3D3530] mb-2">약관 확인</h2>
          <p className="text-sm text-[#8B7E74]">
            서비스 이용을 위해 아래 약관에 동의해주세요.
          </p>
        </div>

        {/* 주의 박스 */}
        <div className="bg-[#FFF5EE] border-l-4 border-[#FFB38A] rounded-r-lg px-4 py-3 mb-6">
          <p className="text-xs font-bold text-[#3D3530] mb-1">
            ⚠️ 중요 안내
          </p>
          <p className="text-xs text-[#8B7E74] leading-relaxed">
            바른발음은 가정 학습 보조 도구이며, 의료 서비스가 아닙니다.
            발음에 우려가 있으면 반드시 언어재활사와 상담하세요.
          </p>
        </div>

        {/* 체크박스 1 */}
        <div className="mb-4 pb-4 border-b border-[#F0E8E0]">
          <label className="flex items-start gap-3 cursor-pointer hover:bg-[#FAFAF8] p-2 -mx-2 rounded-lg">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-5 h-5 rounded accent-[#FFB38A] mt-0.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#3D3530]">
                이용약관 동의 <span className="text-[#FFB38A]">*</span>
              </p>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#FFB38A] hover:underline"
              >
                약관 보기 →
              </a>
            </div>
          </label>
        </div>

        {/* 체크박스 2 */}
        <div className="mb-6 pb-4 border-b border-[#F0E8E0]">
          <label className="flex items-start gap-3 cursor-pointer hover:bg-[#FAFAF8] p-2 -mx-2 rounded-lg">
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={(e) => setAgreedPrivacy(e.target.checked)}
              className="w-5 h-5 rounded accent-[#FFB38A] mt-0.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#3D3530]">
                개인정보 처리방침 동의 <span className="text-[#FFB38A]">*</span>
              </p>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#FFB38A] hover:underline"
              >
                방침 보기 →
              </a>
            </div>
          </label>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <BubbleButton
            variant="gray"
            size="lg"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </BubbleButton>
          <BubbleButton
            variant="peach"
            size="lg"
            onClick={onAgree}
            disabled={!canAgree}
            className="flex-1"
          >
            {canAgree ? "동의하고 시작" : "약관에 동의해주세요"}
          </BubbleButton>
        </div>
      </div>
    </div>
  );
}
