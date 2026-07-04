'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] to-[#F5F3FF] px-5 py-12 flex flex-col items-center justify-center font-sans">
          <div className="max-w-sm w-full space-y-6">

            {/* 에러 헤더 */}
            <div className="text-center space-y-2">
              <div className="text-5xl">🚨</div>
              <h1 className="text-2xl font-black text-[#3D3530]">시스템 오류</h1>
              <p className="text-sm text-[#8B7E74]">
                앱 전체에 예상치 못한 오류가 발생했습니다.
              </p>
            </div>

            {/* 디버그 정보 (개발 모드에서만) + 프로덕션은 digest만 노출 */}
            {process.env.NODE_ENV === 'development' ? (
              <div className="bg-white border-2 border-red-300 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-red-600">🔧 에러 메시지:</p>
                <pre className="text-[10px] text-red-600 overflow-auto bg-red-50 rounded p-2">
                  {error.message}
                </pre>
              </div>
            ) : (
              error.digest && (
                <p className="text-[10px] text-[#C4B5A8] text-center font-mono">오류 코드: {error.digest}</p>
              )
            )}

            {/* 액션 버튼 */}
            <div className="space-y-3">
              <button
                onClick={() => reset()}
                className="w-full bg-[#FFB38A] text-white font-bold py-3 px-4 rounded-2xl hover:bg-[#FF9D6C] transition-colors text-base"
              >
                🔄 다시 시도
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-[#C4B5FD] text-white font-bold py-3 px-4 rounded-2xl hover:bg-[#A89CFF] transition-colors text-base"
              >
                🏠 처음으로 이동
              </button>
            </div>

            {/* 도움말 */}
            <div className="bg-[#F0FAF8] border-2 border-[#7EDFD0] rounded-2xl p-4">
              <p className="text-sm font-bold text-[#128670] mb-2">문제 해결:</p>
              <ul className="text-xs text-[#128670] space-y-1">
                <li>• F5로 새로고침 해보세요</li>
                <li>• 브라우저 캐시를 지워보세요</li>
                <li>• 잠시 후 다시 방문하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
