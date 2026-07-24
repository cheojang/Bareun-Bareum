'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BubbleCard } from '@/components/ui/BubbleCard';
import { BubbleButton } from '@/components/ui/BubbleButton';

export default function AnswerNoteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // ✨ Pro Fix 1: useRouter 훅 사용 (SPA 라우팅)
  const router = useRouter();

  useEffect(() => {
    console.error('[AnswerNote Error]', error);
  }, [error]);

  return (
    <div className="px-5 pt-6 pb-8 max-w-lg mx-auto space-y-5 animate-in fade-in duration-300">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-black text-[#3D3530]">📝 발음 분석</h1>
        <p className="text-sm text-[#8B7E74] mt-1">발음 분석 도구</p>
      </div>

      {/* 에러 카드 */}
      <BubbleCard className="bg-[#FFF5EE] border-2 border-[#FFB38A] space-y-4">
        <div className="text-center space-y-3">
          <div className="text-5xl">😅</div>
          <div>
            <p className="text-lg font-bold text-[#3D3530]">어라, 뭔가 잘못됐어요!</p>
            <p className="text-sm text-[#8B7E74] mt-2 leading-relaxed">
              분석 중에 예상치 못한 오류가 발생했어요.
              <br />
              잠깐 후 다시 시도해 주실 수 있을까요?
            </p>
          </div>
        </div>

        {/* ✨ Pro Fix 3: 개발 환경은 에러 메시지, 상용 환경은 CS 코드(digest) 표시 */}
        {process.env.NODE_ENV === 'development' ? (
          <details className="text-xs text-[#8B7E74] bg-white/50 rounded-lg p-2 cursor-pointer">
            <summary className="font-semibold">기술 정보 (개발자용)</summary>
            <pre className="mt-2 overflow-auto text-[10px] text-red-600">
              {error.message}
            </pre>
          </details>
        ) : error.digest ? (
          <div className="text-center mt-2">
            <p className="text-[10px] text-[#C4B5A8]">
              오류 코드: {error.digest}
            </p>
          </div>
        ) : null}

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-2">
          <BubbleButton
            variant="peach"
            size="md"
            onClick={() => reset()}
            className="flex-1"
          >
            🔄 다시 시도
          </BubbleButton>
          <BubbleButton
            variant="white"
            size="md"
            // ✨ Pro Fix 1: 부드러운 SPA 라우팅으로 성능 보존
            onClick={() => router.push('/dashboard')}
            className="flex-1"
          >
            🏠 대시보드
          </BubbleButton>
        </div>
      </BubbleCard>

      {/* ✨ Pro Fix 2: 팁 카드 - 사용자 친화적 용어로 순화 */}
      <BubbleCard className="bg-[#F5F3FF] border-2 border-[#C4B5FD]">
        <p className="text-sm font-semibold text-[#5B4E9B] mb-2">💡 문제가 계속되면:</p>
        <ul className="text-xs text-[#5B4E9B] space-y-1">
          <li>• 인터넷 연결 상태를 확인해주세요</li>
          <li>• 일시적인 서버 지연일 수 있어요. 나중에 다시 시도해주세요.</li>
          <li>• 계속 오류가 발생하면 고객센터로 알려주세요.</li>
        </ul>
      </BubbleCard>
    </div>
  );
}
