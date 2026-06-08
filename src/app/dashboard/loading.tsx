// Dashboard 전역 로딩 스켈레톤 — 라우트 전환/데이터 로딩 시 즉시 표시되어
// "버튼 눌러도 멈춰있는" 체감을 없앤다. 하위 모든 dashboard 라우트에 적용됨.
export default function DashboardLoading() {
  return (
    <div className="px-5 pt-6 md:pt-8 md:px-8 max-w-lg md:max-w-5xl mx-auto animate-pulse">
      {/* 헤더 영역 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-full bg-[#F0E8E0]" />
        <div className="flex-1">
          <div className="h-3 w-20 bg-[#F0E8E0] rounded-full mb-2" />
          <div className="h-5 w-36 bg-[#F0E8E0] rounded-full" />
        </div>
        <div className="h-8 w-16 bg-[#F0E8E0] rounded-full" />
      </div>

      {/* 카드 스켈레톤 */}
      <div className="flex flex-col gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bubble-card bg-white/85 p-6">
            <div className="h-4 w-1/3 bg-[#F0E8E0] rounded-full mb-4" />
            <div className="h-3 w-full bg-[#F5F0EB] rounded-full mb-2" />
            <div className="h-3 w-4/5 bg-[#F5F0EB] rounded-full mb-2" />
            <div className="h-3 w-2/3 bg-[#F5F0EB] rounded-full" />
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[#C4B5A8] mt-6">불러오는 중...</p>
    </div>
  );
}
