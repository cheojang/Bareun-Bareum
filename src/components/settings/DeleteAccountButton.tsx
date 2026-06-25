"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";

export function DeleteAccountButton({ compact = false }: { compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 포털은 클라이언트 마운트 후에만 (SSR에서 document 없음)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 모달 열린 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  function openModal() {
    setConfirmed(false);
    setError(null);
    setIsOpen(true);
  }

  function closeModal() {
    if (isDeleting) return;
    setIsOpen(false);
  }

  async function handleDelete() {
    if (!confirmed || isDeleting) return;
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "탈퇴 처리 중 오류가 발생했어요.");
        setIsDeleting(false);
        return;
      }
      // 계정 삭제 성공 → 로그아웃 후 홈으로
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      {compact ? (
        <button
          onClick={openModal}
          aria-label="회원 탈퇴"
          className="flex items-center gap-1 text-xs font-semibold text-[#C4B5A8] hover:text-[#EF4444] transition-colors leading-none"
        >
          🗑 회원탈퇴
        </button>
      ) : (
        <button
          onClick={openModal}
          className="w-full py-3 rounded-2xl text-sm font-bold text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
        >
          회원 탈퇴
        </button>
      )}

      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-5"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-5 shadow-2xl overflow-y-auto max-h-[90dvh]"
            style={{ backgroundColor: "#FFFAF7", border: "1.5px solid #F0E8E0" }}
          >
            <div className="text-4xl text-center mb-2">😢</div>

            <h3 className="text-lg font-black text-[#3D3530] text-center mb-1">
              정말 탈퇴하시겠어요?
            </h3>
            <p className="text-sm text-center text-[#8B7E74] mb-3">
              바른발음을 이용해 주셔서 감사했어요.
            </p>

            {/* 삭제 항목 안내 */}
            <div
              className="rounded-2xl px-4 py-3 mb-3 space-y-1.5"
              style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}
            >
              <p className="text-xs font-black text-[#EF4444] mb-1.5">탈퇴 시 삭제되는 정보</p>
              {[
                "계정 정보 (이름, 이메일)",
                "아이 프로필 전체",
                "모든 발음 연습 기록",
                "오답노트 및 분석 결과",
                "복습 스케줄 및 약점 음소 데이터",
                "구독 정보",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-[#EF4444] text-xs">✕</span>
                  <span className="text-xs text-[#EF4444]">{item}</span>
                </div>
              ))}
              <p className="text-[11px] text-[#EF4444] font-bold mt-2">
                삭제된 데이터는 복구할 수 없습니다.
              </p>
            </div>

            {/* 동의 체크박스 */}
            <label className="flex items-start gap-3 cursor-pointer mb-3 px-1">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#EF4444] flex-shrink-0"
              />
              <span className="text-xs text-[#3D3530] leading-relaxed">
                위 내용을 확인했으며, 모든 기록이{" "}
                <span className="font-bold text-[#EF4444]">영구 삭제</span>됨에 동의합니다.
              </span>
            </label>

            {error && (
              <p className="text-xs text-center text-[#EF4444] mb-3 font-semibold">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl font-bold text-[#8B7E74] bg-[#F0E8E0] hover:bg-[#E8DDD5] transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={!confirmed || isDeleting}
                className="flex-1 py-3 rounded-2xl font-bold text-white transition-colors disabled:opacity-40"
                style={{ backgroundColor: confirmed && !isDeleting ? "#EF4444" : "#FCA5A5" }}
              >
                {isDeleting ? "처리 중..." : "탈퇴할게요"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
