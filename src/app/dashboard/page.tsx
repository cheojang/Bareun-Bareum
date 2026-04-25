import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { SoriMascot } from "@/components/ui/SoriMascot";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user!.id!;
  const isGuest = userId === "guest";

  // ── 게스트: 발음 분석으로 바로 안내 ───────────────────────────────────────
  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <SoriMascot size={120} variant="full" animated />
        <h2 className="text-2xl font-black text-[#3D3530] mt-4 mb-2">체험 모드에요!</h2>
        <p className="text-sm text-[#8B7E74] mb-6 leading-relaxed">
          발음 분석 기능을 바로 사용해볼 수 있어요.<br />
          기록 저장은 회원가입 후 가능해요.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/dashboard/answer-note">
            <BubbleButton variant="peach" size="lg" className="w-full">
              🔍 발음 분석 체험하기
            </BubbleButton>
          </Link>
          <Link href="/signup">
            <BubbleButton variant="white" size="md" className="w-full">
              회원가입하고 모든 기능 이용하기
            </BubbleButton>
          </Link>
        </div>
      </div>
    );
  }

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  const { getSelectedChildId } = await import("@/lib/child-cookie");
  const savedId = await getSelectedChildId();

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <div className="text-7xl mb-4 animate-float">🐣</div>
        <h2 className="text-2xl font-black text-[#3D3530] mb-2">아이를 등록해주세요!</h2>
        <p className="text-[#8B7E74] mb-6">아이 정보를 입력하면 맞춤 연습을 시작할 수 있어요</p>
        <Link href="/onboarding">
          <BubbleButton variant="peach" size="lg">아이 등록하기</BubbleButton>
        </Link>
      </div>
    );
  }

  const child = children.find((c) => c.id === savedId) ?? children[0];

  // ── 오늘 복습 개수 (SM-2) ────────────────────────────────────────────────────
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const reviewDueCount = await prisma.reviewSchedule.count({
    where: { childId: child.id, isLearned: false, nextReviewAt: { lte: todayEnd } },
  });

  // ── 최근 연습 기록 (5개) ─────────────────────────────────────────────────────
  const recentSessions = await prisma.practiceSession.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take: 5,
    include: {
      child: { select: { name: true } },
      _count: { select: { wordRecords: true } },
    },
  });

  // ── 활동 캘린더 데이터 (16주) ───────────────────────────────────────────────
  const calendarStart = new Date();
  calendarStart.setDate(calendarStart.getDate() - 16 * 7);

  const calendarRecords = await prisma.wordRecord.findMany({
    where: {
      session: { childId: child.id },
      practicedAt: { gte: calendarStart },
    },
    select: { practicedAt: true },
  });

  // UTC+9(KST) 기준으로 날짜별 카운트 집계
  const calendarMap: Record<string, number> = {};
  for (const r of calendarRecords) {
    const kst = new Date(r.practicedAt.getTime() + 9 * 60 * 60 * 1000);
    const date = kst.toISOString().slice(0, 10);
    calendarMap[date] = (calendarMap[date] ?? 0) + 1;
  }
  const calendarData = Object.entries(calendarMap).map(([date, count]) => ({ date, count }));
  const totalPracticeDays = Object.keys(calendarMap).length;

  return (
    <div className="px-5 pt-6 md:pt-8 md:px-8 max-w-lg md:max-w-5xl mx-auto">

      <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-8">

        {/* ── 왼쪽 컬럼 ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* 인사 + 마스코트 */}
          <div className="flex items-center gap-3">
            <MascotAvatar level={child.mascotLevel} />
            <div>
              <p className="text-sm text-[#8B7E74]">안녕하세요!</p>
              <h2 className="text-xl font-black text-[#3D3530]">{child.name} 성장 중 🌱</h2>
            </div>
            <div className="ml-auto flex items-center gap-1 bg-[#FFF5EE] rounded-full px-3 py-1.5">
              <span className="text-lg">🔥</span>
              <span className="font-bold text-[#FFB38A] text-sm">{child.streakDays}일</span>
            </div>
          </div>

          {/* 요약 통계 */}
          <div className="grid grid-cols-3 gap-3">
            <StatMini value={child.totalWords} label="단어" emoji="📝" />
            <StatMini value={child.streakDays} label="연속" emoji="🔥" />
            <StatMini value={totalPracticeDays} label="연습일" emoji="📅" />
          </div>

          {/* 활동 캘린더 */}
          <BubbleCard>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-[#3D3530]">📅 연습 기록</p>
              <span className="text-xs text-[#C4B5A8]">최근 16주</span>
            </div>
            <ActivityCalendar data={calendarData} />
          </BubbleCard>

          {/* 오늘도 연습 CTA */}
          <BubbleCard color="peach" className="text-center">
            <p className="text-lg font-black text-[#3D3530] mb-3">오늘도 연습해볼까요? 🎯</p>
            <Link href="/dashboard/session/new">
              <BubbleButton variant="peach" size="lg" className="w-full">
                오늘의 코스 시작
              </BubbleButton>
            </Link>
          </BubbleCard>

        </div>

        {/* ── 오른쪽 컬럼 ───────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* 오늘 복습 배지 */}
          {reviewDueCount > 0 && (
            <Link href="/dashboard/bookmarks">
              <BubbleCard padding="sm" className="flex items-center gap-3 border-2 border-[#FCA5A5]/40 bg-[#FFF5EE] cursor-pointer hover:bg-[#FFE4D8] transition-colors">
                <span className="text-2xl">🔔</span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full leading-none bg-[#FCA5A5] text-white">
                      오늘의 복습
                    </span>
                    <p className="text-sm font-bold text-[#3D3530] leading-tight">
                      오늘 복습할 단어가 있어요
                    </p>
                  </div>
                  <p className="text-xs text-[#8B7E74] mt-0.5">
                    망각 곡선 — 지금 복습하면 기억이 오래 남아요
                  </p>
                </div>
                <span className="bg-[#FCA5A5] text-white text-sm font-black px-3 py-1 rounded-full">
                  {reviewDueCount}개
                </span>
              </BubbleCard>
            </Link>
          )}

          {/* 최근 연습 기록 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#3D3530]">최근 연습</h3>
              <Link href="/dashboard/progress">
                <span className="text-xs text-[#FFB38A] font-semibold">전체 보기 →</span>
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <BubbleCard className="text-center py-6">
                <p className="text-3xl mb-2">📖</p>
                <p className="text-sm font-semibold text-[#3D3530]">아직 연습 기록이 없어요</p>
                <p className="text-xs text-[#8B7E74] mt-1">첫 연습을 시작해보세요!</p>
              </BubbleCard>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((s) => (
                  <BubbleCard key={s.id} padding="sm" className="flex items-center gap-4">
                    <span className="text-2xl">📖</span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#3D3530] text-sm">{s.child.name}</p>
                      <p className="text-xs text-[#8B7E74]">
                        {s._count.wordRecords}개 단어 ·{" "}
                        {new Date(s.startedAt).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </p>
                    </div>
                    <Link href={`/dashboard/session/${s.id}`}>
                      <span className="text-[#FFB38A] text-sm font-semibold">보기 →</span>
                    </Link>
                  </BubbleCard>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function StatMini({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  return (
    <BubbleCard padding="sm" className="text-center">
      <span className="text-2xl">{emoji}</span>
      <p className="text-xl font-black text-[#3D3530]">{value}</p>
      <p className="text-xs text-[#8B7E74]">{label}</p>
    </BubbleCard>
  );
}

function MascotAvatar({ level }: { level: number }) {
  return (
    <div className="relative flex-shrink-0">
      <SoriMascot size={56} variant="logo" animated={false} />
      <span className="absolute -bottom-1 -right-1 bg-[#FFB38A] text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center">
        {level}
      </span>
    </div>
  );
}
