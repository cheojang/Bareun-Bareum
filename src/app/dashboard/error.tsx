'use client';

import { useEffect } from 'react';
import { BubbleCard } from '@/components/ui/BubbleCard';
import { BubbleButton } from '@/components/ui/BubbleButton';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] to-[#F5F3FF] px-5 py-12 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-6">

        {/* 에러 메시지 */}
        <BubbleCard className="bg-white border-2 border-[#FFB38A] text-center space-y-3">
          <div className="text-6xl">🛑</div>
          <h1 className="text-2xl font-black text-[#3D3530]">앗, 문제가 생겼어요!</h1>
          <p className="text-sm text-[#8B7E74] leading-relaxed">
            대시보드를 불러오는 중에 예상치 못한 오류가 발생했습니다.
          </p>
        </BubbleCard>

        {/* 상세 에러 (개발 환경에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <BubbleCard className="bg-[#FFF5EE] border-2 border-[#FFB38A]">
            <p className="text-xs font-bold text-[#8B7E74] mb-2">🔧 개발자 정보:</p>
            <pre className="text-[10px] text-red-600 overflow-auto bg-white rounded p-2">
              {error.message}
            </pre>
          </BubbleCard>
        )}

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <BubbleButton
            variant="peach"
            size="lg"
            onClick={() => reset()}
            className="w-full text-base"
          >
            🔄 다시 시도해보기
          </BubbleButton>
          <BubbleButton
            variant="lavender"
            size="lg"
            onClick={() => window.location.href = '/'}
            className="w-full text-base"
          >
            🏠 처음으로 돌아가기
          </BubbleButton>
        </div>

        {/* 도움말 */}
        <BubbleCard className="bg-[#F0FAF8] border-2 border-[#7EDFD0]">
          <p className="text-sm font-bold text-[#128670] mb-2">✨ 이렇게 시도해보세요:</p>
          <ul className="text-xs text-[#128670] space-y-1.5">
            <li>✓ 페이지를 새로고침(F5) 해보세요</li>
            <li>✓ 브라우저 캐시를 지우고 다시 접속해보세요</li>
            <li>✓ 잠시 후 다시 시도해보세요</li>
            <li>✓ 인터넷 연결 상태를 확인해보세요</li>
          </ul>
        </BubbleCard>
      </div>
    </div>
  );
}
