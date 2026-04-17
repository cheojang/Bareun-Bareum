import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { MissionCard } from "@/components/dashboard/MissionCard";
import { SoriMascot } from "@/components/ui/SoriMascot";

// ─── 약점 레벨 색상 ────────────────────────────────────────────────────────────
const WEAKNESS_COLOR: Record<string, { bar: string; badge: string; text: string }> = {
  집중교정필요: { bar: "#FCA5A5", badge: "bg-[#FEE2E2]", text: "text-[#EF4444]" },
  꾸준한연습필요: { bar: "#FCD34D", badge: "bg-[#FEF3C7]", text: "text-[#D97706]" },
  관찰중:       { bar: "#86EFAC", badge: "bg-[#DCFCE7]", text: "text-[#16A34A]" },
  정상범위:     { bar: "#7EDFD0", badge: "bg-[#F0FAF8]", text: "text-[#0D9488]" },
};

// ─── Daily mission generator ───────────────────────────────────────────────
const MISSION_PHONEMES = ["ㄹ", "ㅅ", "ㅈ", "ㄱ", "ㄴ", "ㅂ", "ㅁ"];
const MISSION_TEXTS: Record<string, string> = {
  "ㄹ": "ㄹ 소리가 들어간 단어 3번 성공하기",
  "ㅅ": "ㅅ 소리 정확하게 3번 발음하기",
  "ㅈ": "ㅈ 소리 단어로 3번 도전하기",
  "ㄱ": "ㄱ 소리 단어 3번 완성하기",
  "ㄴ": "ㄴ 소리 연습 3번 성공하기",
  "ㅂ": "ㅂ 소리 단어 3번 정확히 말하기",
  "ㅁ": "ㅁ 소리 3번 도전 완료하기",
};

function getDailyMissionPhoneme(childId: string, topErrorPhoneme?: string): string {
  if (topErrorPhoneme) return topErrorPhoneme;
  // Deterministic daily rotation based on date
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MISSION_PHONEMES[dayOfYear % MISSION_PHONEMES.length];
}

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user!.id!;

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  // 선택된 아이 쿠키 반영
  const { getSelectedChildId } = await import("@/lib/child-cookie");
  const savedId = await getSelectedChildId();

  const recentSessions = await prisma.practiceSession.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take: 3,
    include: {
      child: { select: { name: true } },
      _count: { select: { wordRecords: true } },
    },
  });

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

  // Fetch top error phoneme for daily mission
  const recentErrors = await prisma.wordRecord.findMany({
    where: { session: { childId: child.id }, isCorrect: false },
    orderBy: { practicedAt: "desc" },
    take: 20,
    select: { errorPhonemes: true },
  });

  const errorMap: Record<string, number> = {};
  for (const r of recentErrors) {
    const errors = (r.errorPhonemes as { targetPhoneme: string }[]) ?? [];
    for (const e of errors) {
      errorMap[e.targetPhoneme] = (errorMap[e.targetPhoneme] ?? 0) + 1;
    }
  }
  const topErrorPhoneme = Object.entries(errorMap).sort(([, a], [, b]) => b - a)[0]?.[0];
  const missionPhoneme = getDailyMissionPhoneme(child.id, topErrorPhoneme);
  const missionText = MISSION_TEXTS[missionPhoneme] ?? `'${missionPhoneme}' 소리 3번 성공하기`;

  // ── 오늘 복습 개수 (SM-2) ────────────────────────────────────────────────────
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const reviewDueCount = await prisma.reviewSchedule.count({
    where: { childId: child.id, isLearned: false, nextReviewAt: { lte: todayEnd } },
  });

  // ── 약점 음소 데이터 조회 ────────────────────────────────────────────────────
  const totalErrorRecords = await prisma.errorRecord.count({ where: { childId: child.id } });
  const weakPhonemes = await prisma.weakPhoneme.findMany({
    where: { childId: child.id },
    orderBy: { errorCount: "desc" },
    take: 5,
  });

  // ── This week vs last week comparison (for sibling mode or solo) ──────────
  const now = new Date();
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  thisMonday.setHours(0, 0, 0, 0);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  // Weekly stats for all children (for sibling comparison)
  const weeklyStatsPerChild = await Promise.all(
    children.map(async (c: { id: string; name: string; mascotLevel: number; totalWords: number; createdAt: Date; userId: string }) => {
      const thisWeekCount = await prisma.wordRecord.count({
        where: { session: { childId: c.id }, practicedAt: { gte: thisMonday } },
      });
      const lastWeekCount = await prisma.wordRecord.count({
        where: {
          session: { childId: c.id },
          practicedAt: { gte: lastMonday, lt: thisMonday },
        },
      });
      return { child: c, thisWeek: thisWeekCount, lastWeek: lastWeekCount };
    })
  );

  const primaryStats = weeklyStatsPerChild[0];
  const weeklyDelta = (primaryStats?.thisWeek ?? 0) - (primaryStats?.lastWeek ?? 0);

  return (
    <div className="px-5 pt-6 md:pt-8 md:px-8 max-w-lg md:max-w-5xl mx-auto">

      {/* ── 그리드 래퍼: 모바일 1컬럼 / 데스크탑 2컬럼 ── */}
      <div className="md:grid md:grid-cols-2 md:gap-8 space-y-5 md:space-y-0">

        {/* ── 왼쪽 컬럼 ─────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Greeting */}
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

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatMini value={child.totalWords} label="단어" emoji="📝" />
            <StatMini value={child.totalMinutes} label="분" emoji="⏱️" />
            <StatMini value={child.streakDays} label="연속" emoji="🔥" />
          </div>

          {/* ── Daily mission card ── */}
          <MissionCard
            phoneme={missionPhoneme}
            missionText={missionText}
            targetCount={3}
          />

          {/* Start session CTA */}
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
        <div className="space-y-5">

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

          {/* ── Weekly progress delta ── */}
          {primaryStats && (primaryStats.thisWeek > 0 || primaryStats.lastWeek > 0) && (
            <BubbleCard padding="sm" className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#3D3530]">이번 주</p>
                <p className="text-xs text-[#8B7E74]">
                  {primaryStats.thisWeek}개 단어 연습
                  {weeklyDelta > 0 && (
                    <span className="text-[#7EDFD0] font-bold"> ↑ {weeklyDelta}개 더</span>
                  )}
                  {weeklyDelta < 0 && (
                    <span className="text-[#FCA5A5] font-bold"> ↓ {Math.abs(weeklyDelta)}개 덜</span>
                  )}
                  {weeklyDelta === 0 && primaryStats.lastWeek > 0 && (
                    <span className="text-[#8B7E74]"> (지난주와 동일)</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#C4B5A8]">지난주 {primaryStats.lastWeek}개</p>
              </div>
            </BubbleCard>
          )}

          {/* Recent sessions */}
          {recentSessions.length > 0 && (
            <div>
              <h3 className="font-bold text-[#3D3530] mb-3">최근 연습</h3>
              <div className="space-y-3">
                {recentSessions.map((s: { id: string; startedAt: Date; child: { name: string }; _count: { wordRecords: number } }) => (
                  <BubbleCard key={s.id} padding="sm" className="flex items-center gap-4">
                    <span className="text-2xl">📖</span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#3D3530] text-sm">{s.child.name}</p>
                      <p className="text-xs text-[#8B7E74]">
                        {s._count.wordRecords}개 단어 ·{" "}
                        {new Date(s.startedAt).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Link href={`/dashboard/session/${s.id}`}>
                      <span className="text-[#FFB38A] text-sm font-semibold">보기 →</span>
                    </Link>
                  </BubbleCard>
                ))}
              </div>
            </div>
          )}

          {/* ── 약점 음소 분석 카드 ── */}
          <BubbleCard>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-[#3D3530]">🔍 약점 음소 분석</p>
              <Link href="/dashboard/answer-note">
                <span className="text-xs text-[#FFB38A] font-semibold">발음 분석 추가 →</span>
              </Link>
            </div>

            {totalErrorRecords === 0 ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-sm font-semibold text-[#3D3530]">아직 발음 분석 기록이 없어요</p>
                <p className="text-xs text-[#8B7E74] mt-1">발음 분석에서 발음을 입력하면 약점을 분석해드려요</p>
              </div>
            ) : totalErrorRecords < 10 ? (
              <div className="py-4 px-1">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🌱</span>
                    <p className="text-sm font-bold text-[#3D3530]">첫 분석 준비 중</p>
                  </div>
                  <p className="text-xs font-black text-[#FFB38A] bg-[#FFF5EE] px-2 py-0.5 rounded-full border border-[#FFE4D8]">
                    {totalErrorRecords} / 10
                  </p>
                </div>
                <div className="h-3.5 bg-[#F0E8E0] rounded-full overflow-hidden mb-3 shadow-inner">
                  <div
                    className="h-full bg-[#FFB38A] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(totalErrorRecords / 10) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#8B7E74] leading-relaxed text-center">
                  오답을 <span className="font-bold text-[#FFB38A]">10개</span>만 기록해도 <br />
                  우리 아이의 첫 발음 분석 리포트가 열려요!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {totalErrorRecords < 100 && (
                  <div className="bg-[#FFF5EE] rounded-xl p-3 border border-[#FFE4D8] mb-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-[11px] font-bold text-[#FFB38A]">✨ 정교한 분석 진행 중</p>
                      <p className="text-[10px] font-black text-[#FFB38A]">{totalErrorRecords}%</p>
                    </div>
                    <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FFB38A] rounded-full transition-all duration-1000"
                        style={{ width: `${totalErrorRecords}%` }}
                      />
                    </div>
                  </div>
                )}

                {weakPhonemes.length === 0 ? (
                  <p className="text-sm text-[#8B7E74] text-center py-3">분석 준비 중이에요...</p>
                ) : (
                  <div className="space-y-3">
                    {weakPhonemes.map((w: { id: string; phoneme: string; errorRate: number; weaknessLevel: string; errorCount: number; totalAttempts: number }) => {
                      const style = WEAKNESS_COLOR[w.weaknessLevel] ?? WEAKNESS_COLOR["정상범위"];
                      const barW = Math.max(Math.round(w.errorRate), 4);
                      return (
                        <div key={w.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F0E8E0] flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-black text-[#3D3530]">{w.phoneme}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-semibold ${style.text}`}>{w.weaknessLevel}</span>
                              <span className="text-xs text-[#8B7E74]">{w.errorCount}회 / {barW}%</span>
                            </div>
                            <div className="h-2.5 bg-[#F0E8E0] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${barW}%`, backgroundColor: style.bar }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-xs text-[#C4B5A8] mt-1 text-right">
                      최근 {Math.min(totalErrorRecords, 300)}개 오답 기준
                    </p>
                  </div>
                )}
              </div>
            )}
          </BubbleCard>

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
