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

  const child = children[0];

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
    children.map(async (c) => {
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
    <div className="px-5 pt-6 max-w-lg mx-auto space-y-5">
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

      {/* ── Daily mission card ──────────────────────────────────────── */}
      <MissionCard
        phoneme={missionPhoneme}
        missionText={missionText}
        targetCount={3}
      />

      {/* ── Weekly progress delta ───────────────────────────────────── */}
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

      {/* Start session CTA */}
      <BubbleCard color="peach" className="text-center">
        <p className="text-lg font-black text-[#3D3530] mb-3">오늘도 연습해볼까요? 🎯</p>
        <Link href="/dashboard/session/new">
          <BubbleButton variant="peach" size="lg" className="w-full">
            발음 연습 시작!
          </BubbleButton>
        </Link>
      </BubbleCard>

      {/* ── Sibling comparison (2+ children) ───────────────────────── */}
      {children.length >= 2 && (
        <BubbleCard>
          <p className="font-bold text-[#3D3530] mb-3">👨‍👩‍👧‍👦 형제자매 이번 주 현황</p>
          <div className="space-y-3">
            {weeklyStatsPerChild.map(({ child: c, thisWeek }, idx) => {
              const maxWords = Math.max(...weeklyStatsPerChild.map((s) => s.thisWeek), 1);
              const barW = Math.max((thisWeek / maxWords) * 100, 4);
              const isLeading =
                thisWeek === Math.max(...weeklyStatsPerChild.map((s) => s.thisWeek)) &&
                thisWeek > 0;
              const MASCOT_EMOJIS = ["🥚", "🐣", "🐥", "🐤", "🐦"];
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">
                    {MASCOT_EMOJIS[Math.min(c.mascotLevel - 1, 4)]}
                  </span>
                  <div className="w-16 text-sm font-semibold text-[#3D3530] truncate">
                    {c.name}
                  </div>
                  <div className="flex-1 h-4 bg-[#F0E8E0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${barW}%`,
                        backgroundColor: idx === 0 ? "#FFB38A" : "#7EDFD0",
                      }}
                    />
                  </div>
                  <div className="text-sm font-bold text-[#3D3530] w-10 text-right">
                    {thisWeek}개
                    {isLeading && <span className="ml-0.5">👑</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[#C4B5A8] mt-3 text-center">
            이번 주 연습한 단어 수 기준
          </p>
        </BubbleCard>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="font-bold text-[#3D3530] mb-3">최근 연습</h3>
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

      {/* ── 약점 음소 분석 카드 ──────────────────────────────────────── */}
      <BubbleCard>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-[#3D3530]">🔍 약점 음소 분석</p>
          <Link href="/dashboard/answer-note">
            <span className="text-xs text-[#FFB38A] font-semibold">오답 추가 →</span>
          </Link>
        </div>

        {totalErrorRecords === 0 ? (
          /* 오답 기록 없음 */
          <div className="text-center py-4">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm font-semibold text-[#3D3530]">아직 오답 기록이 없어요</p>
            <p className="text-xs text-[#8B7E74] mt-1">오답 노트에서 발음을 입력하면 약점을 분석해드려요</p>
          </div>
        ) : totalErrorRecords < 10 ? (
          /* 데이터 부족 */
          <div className="text-center py-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: i < totalErrorRecords ? "#FFB38A" : "#F0E8E0" }}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-[#8B7E74]">
              현재 <span className="font-bold text-[#FFB38A]">{totalErrorRecords}</span>개 기록 중 —
              10개 이상이면 약점 분석이 시작돼요
            </p>
          </div>
        ) : weakPhonemes.length === 0 ? (
          /* 집계 대기 */
          <p className="text-sm text-[#8B7E74] text-center py-3">분석 준비 중이에요...</p>
        ) : (
          /* 약점 음소 바 차트 */
          <div className="space-y-3">
            {weakPhonemes.map((w) => {
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
      </BubbleCard>

      {/* Child play mode button */}
      <BubbleCard color="mint" className="text-center">
        <p className="font-bold text-[#3D3530] mb-2">🎮 아이에게 넘겨줄까요?</p>
        <p className="text-sm text-[#8B7E74] mb-3">아이 전용 놀이 화면으로 전환해요</p>
        <Link href="/dashboard/child">
          <BubbleButton variant="mint" className="w-full">아이 모드로!</BubbleButton>
        </Link>
      </BubbleCard>
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
