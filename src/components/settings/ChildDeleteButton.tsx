"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChildDeleteButtonProps {
  childId: string;
  childName: string;
}

// 🗑️ 아이 삭제 버튼 + 경고 팝업 컴포넌트
export function ChildDeleteButton({ childId, childName }: ChildDeleteButtonProps) {
  const router = useRouter();

  // 팝업 열림/닫힘 상태
  const [isOpen, setIsOpen] = useState(false);
  // 삭제 진행 중 상태 (버튼 비활성화용)
  const [isDeleting, setIsDeleting] = useState(false);
  // 오류 메시지 상태
  const [error, setError] = useState<string | null>(null);

  // 삭제 확인 버튼 클릭 시 실행되는 함수
  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/children/${childId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "삭제에 실패했어요");
      }

      // 삭제 성공 → 페이지 새로고침으로 목록 갱신
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요");
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* 🗑️ 휴지통 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[#C4B5A8] hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors"
        title="아이 삭제"
      >
        🗑️
      </button>

      {/* ── 경고 팝업 (모달) ───────────────────────────────────────── */}
      {isOpen && (
        // 배경 어둡게 처리 (오버레이)
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={(e) => {
            // 배경 클릭 시 팝업 닫기 (삭제 중이면 닫기 불가)
            if (e.target === e.currentTarget && !isDeleting) setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 shadow-2xl"
            style={{ backgroundColor: "#FFFAF7", border: "1.5px solid #F0E8E0" }}
          >
            {/* 경고 아이콘 */}
            <div className="text-5xl text-center mb-4">⚠️</div>

            {/* 제목 */}
            <h3 className="text-lg font-black text-[#3D3530] text-center mb-2">
              정말 삭제하시겠어요?
            </h3>

            {/* 경고 문구 */}
            <p className="text-sm text-center text-[#8B7E74] mb-1">
              <span className="font-bold text-[#EF4444]">'{childName}'</span>의 모든 기록이
            </p>
            <p className="text-sm text-center text-[#8B7E74] mb-1">
              <span className="font-bold text-[#EF4444]">영구적으로 삭제</span>됩니다.
            </p>
            <p className="text-xs text-center text-[#C4B5A8] mt-2 mb-5">
              🚨 삭제 후에는 절대 복구할 수 없습니다.
            </p>

            {/* 오류 메시지 */}
            {error && (
              <p className="text-xs text-center text-[#EF4444] mb-3 font-semibold">
                {error}
              </p>
            )}

            {/* 버튼 영역 */}
            <div className="flex gap-3">
              {/* 취소 버튼 */}
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl font-bold text-[#8B7E74] bg-[#F0E8E0] hover:bg-[#E8DDD5] transition-colors disabled:opacity-50"
              >
                취소
              </button>

              {/* 삭제 확인 버튼 */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl font-bold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: isDeleting ? "#FCA5A5" : "#EF4444" }}
              >
                {isDeleting ? "삭제 중..." : "삭제할게요"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
