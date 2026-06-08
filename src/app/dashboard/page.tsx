import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSelectedChildId } from "@/lib/child-cookie";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

// 항상 최신 DB 데이터를 가져옴 (캐시 비활성화)
export const dynamic = "force-dynamic";
import { SoriMascot } from "@/components/ui/SoriMascot";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import { getKSTDateString } from "@/lib/kst-utils";

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user!.id!;
  const isGuest = session?.user?.isGuest === true;

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

  // 아이 목록 + 선택 ID 병렬 조회
  const [children, savedId] = await Promise.all([
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, mascotLevel: true, image: true, streakDays: true, totalWords: true },
    }),
    getSelectedChildId(),
  ]);

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

  // 3개 독립 쿼리 병렬 실행
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const calendarStart = new Date();
  calendarStart.setDate(calendarStart.getDate() - 14);

  const [reviewDueCount, recentSessions, calendarRecords] = await Promise.all([
    // ── 오늘 복습 개수 (SM-2)
    prisma.reviewSchedule.count({
      where: { childId: child.id, isLearned: false, nextReviewAt: { lte: todayEnd } },
    }),
    // ── 최근 연습 기록 (5개)
    prisma.practiceSession.findMany({
      where: { userId, childId: child.id },
      orderBy: { startedAt: "desc" },
      take: 5,
      include: {
        child: { select: { name: true } },
        wordRecords: {
          select: { targetWord: true },
          orderBy: { practicedAt: "asc" },
        },
      },
    }),
    // ── 활동 캘린더 데이터 (2주)
    prisma.wordRecord.findMany({
      where: {
        session: { childId: child.id },
        practicedAt: { gte: calendarStart },
      },
      select: { practicedAt: true },
    }),
  ]);

  // UTC+9(KST) 기준으로 날짜별 카운트 집계
  const calendarMap: Record<string, number> = {};
  for (const r of calendarRecords) {
    const date = getKSTDateString(r.practicedAt);
    calendarMap[date] = (calendarMap[date] ?? 0) + 1;
  }
  const calendarData = Object.entries(calendarMap).map(([date, count]) => ({ date, count }));

  // ── 전체 연습일 수 (기간 제한 없이 고유 날짜 카운트) ─────────────────────────
  const allSessions = await prisma.practiceSession.findMany({
    where: { childId: child.id },
    select: { startedAt: true },
  });
  const practiceDateSet = new Set<string>();
  for (const s of allSessions) {
    practiceDateSet.add(getKSTDateString(s.startedAt));
  }
  const totalPracticeDays = practiceDateSet.size;

  return (
    <div className="px-5 pt-6 md:pt-8 md:px-8 max-w-lg md:max-w-5xl mx-auto">

      <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-8">

        {/* ── 왼쪽 컬럼 ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* 인사 + 마스코트 */}
          <div className="flex items-center gap-3">
            <MascotAvatar level={child.mascotLevel} image={child.image} />
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
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <p className="font-bold text-[#3D3530]">📅 연습 기록 (2주)</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md" style={{ backgroundColor: "#F0E8E0" }} />
                  <span className="text-[10px] text-[#C4B5A8]">미연습</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md" style={{ backgroundColor: "#FFB38A" }} />
                  <span className="text-[10px] text-[#C4B5A8]">연습</span>
                </div>
              </div>
            </div>
            <ActivityCalendar data={calendarData} />
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
            ) : (() => {
              // 날짜별로 그 날 연습한 모든 단어 합치기 (중복 제거, 순서 유지)
              const dateMap = new Map<string, string[]>();
              for (const s of recentSessions) {
                const label = new Date(s.startedAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
                if (!dateMap.has(label)) dateMap.set(label, []);
                const arr = dateMap.get(label)!;
                for (const w of s.wordRecords) {
                  if (!arr.includes(w.targetWord)) arr.push(w.targetWord);
                }
              }
              // 최신순 유지(원본 sort가 startedAt desc)
              const groups: { dateLabel: string; words: string[] }[] = [];
              for (const [dateLabel, words] of dateMap) groups.push({ dateLabel, words });

              const MAX_CHIPS = 6; // 줄 넘침 방지

              return (
                <BubbleCard padding="sm">
                  {groups.map((group, gi) => {
                    const isLastGroup = gi === groups.length - 1;
                    const visible = group.words.slice(0, MAX_CHIPS);
                    const remaining = group.words.length - visible.length;
                    return (
                      <div key={group.dateLabel}>
                        {/* 날짜 구분선 */}
                        <div className={`flex items-center gap-3 ${gi > 0 ? "mt-1" : ""} py-2`}>
                          <div className="h-[1px] flex-1 bg-[#F0E8E0]" />
                          <span className="text-[11px] font-black text-[#C4B5A8] tracking-wider">{group.dateLabel}</span>
                          <div className="h-[1px] flex-1 bg-[#F0E8E0]" />
                        </div>
                        {/* 해당 날짜의 단어 모음 */}
                        <div className={`flex items-start gap-3 py-2.5 px-1 ${!isLastGroup ? "border-b border-[#F5F0EB]" : ""}`}>
                          <span className="text-xl flex-shrink-0">📖</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#8B7E74] mb-1.5">
                              {group.words.length}개 단어
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {visible.map((w) => (
                                <span
                                  key={w}
                                  className="inline-block text-[11px] font-semibold text-[#3D3530] bg-[#FFF5EE] border border-[#FFD4B8] rounded-full px-2 py-0.5"
                                >
                                  {w}
                                </span>
                              ))}
                              {remaining > 0 && (
                                <span className="inline-block text-[11px] font-semibold text-[#8B7E74] bg-[#F5F0EB] rounded-full px-2 py-0.5">
                                  외 {remaining}개
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </BubbleCard>
              );
            })()}
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

function MascotAvatar({ level, image }: { level: number; image?: string | null }) {
  return (
    <div className="relative flex-shrink-0">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt="아이 프로필"
          className="w-14 h-14 rounded-full object-cover border-2 border-[#FFD4B8]"
        />
      ) : (
        <SoriMascot size={56} variant="logo" animated={false} />
      )}
      <span className="absolute -bottom-1 -right-1 bg-[#FFB38A] text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center">
        {level}
      </span>
    </div>
  );
}
