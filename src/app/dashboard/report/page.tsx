import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSelectedChildId } from "@/lib/child-cookie";
import { getKSTStartOfWeek, getKSTDateString } from "@/lib/kst-utils";
import { computeAdaptiveDifficulty, DIFFICULTY_LABEL } from "@/lib/adaptive-difficulty";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { PastelBadge } from "@/components/ui/PastelBadge";

export const dynamic = "force-dynamic";

/** 증감 화살표 + 색 */
function Delta({ now, prev, unit }: { now: number; prev: number; unit: string }) {
  const diff = now - prev;
  if (diff === 0) return <span className="text-[11px] text-[#A89B8E]">지난주와 같아요</span>;
  return diff > 0 ? (
    <span className="text-[11px] font-bold text-[#0D9488]">▲ {diff}{unit} 늘었어요</span>
  ) : (
    <span className="text-[11px] font-bold text-[#EC4899]">▼ {Math.abs(diff)}{unit} 줄었어요</span>
  );
}

/** 규칙 기반 다음 주 코칭 한 줄 */
function coachingMessage(opts: {
  days: number;
  words: number;
  accuracy: number | null;
  graduated: number;
}): string {
  const { days, words, accuracy, graduated } = opts;
  if (words === 0) return "이번 주는 쉬어갔네요. 다음 주엔 '오늘의 루틴' 한 번이면 충분해요 — 딱 5분!";
  if (graduated >= 3) return `한 주에 ${graduated}개 졸업은 대단한 성과예요! 다음 주엔 새로운 발음 분석으로 새 목표를 만들어주세요.`;
  if (days >= 5) return "주 5일 이상 연습 — 습관이 완성되고 있어요! 이 리듬 그대로만 유지해주세요.";
  if (accuracy !== null && accuracy >= 85) return "정확도가 아주 높아요. 난이도가 자동으로 올라가니 새로운 도전을 즐겨보세요!";
  if (accuracy !== null && accuracy < 50) return "어려운 단어가 많았나봐요. 난이도가 자동으로 내려가니 부담 갖지 말고 짧게라도 매일 해보세요.";
  if (days <= 2) return "일주일에 3일만 연습해도 효과가 훨씬 좋아져요. 알림을 켜두면 잊지 않을 수 있어요!";
  return "꾸준히 잘하고 있어요. 다음 주엔 하루만 더 연습 일수를 늘려볼까요?";
}

export default async function WeeklyReportPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  if (session?.user?.isGuest) redirect("/dashboard");

  const [children, savedId] = await Promise.all([
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, streakDays: true },
    }),
    getSelectedChildId(),
  ]);
  if (children.length === 0) redirect("/onboarding");
  const child = children.find((c) => c.id === savedId) ?? children[0];

  const thisWeekStart = getKSTStartOfWeek(0);
  const lastWeekStart = getKSTStartOfWeek(-1);
  const nextWeekStart = getKSTStartOfWeek(1);

  const [records, graduatedThisWeek, weakPhonemes, recentResults] = await Promise.all([
    // 지난주 월요일부터 전체 — JS에서 이번 주/지난주 분리
    prisma.wordRecord.findMany({
      where: {
        session: { childId: child.id },
        practicedAt: { gte: lastWeekStart, lt: nextWeekStart },
      },
      select: { practicedAt: true, isCorrect: true },
    }),
    // 이번 주 졸업(마스터)한 단어 — 5회 이상 성공으로 isLearned 전환
    prisma.reviewSchedule.findMany({
      where: { childId: child.id, isLearned: true, updatedAt: { gte: thisWeekStart } },
      select: { targetWord: true },
      take: 10,
    }),
    prisma.weakPhoneme.findMany({
      where: { childId: child.id, weaknessLevel: { not: "정상범위" } },
      orderBy: { errorRate: "desc" },
      take: 3,
    }),
    prisma.wordRecord.findMany({
      where: { session: { childId: child.id } },
      orderBy: { practicedAt: "desc" },
      take: 30,
      select: { isCorrect: true },
    }),
  ]);

  const thisWeek = records.filter((r) => r.practicedAt >= thisWeekStart);
  const lastWeek = records.filter((r) => r.practicedAt < thisWeekStart);

  const countDays = (rs: typeof records) =>
    new Set(rs.map((r) => getKSTDateString(r.practicedAt))).size;
  const accuracyOf = (rs: typeof records) =>
    rs.length === 0 ? null : Math.round((rs.filter((r) => r.isCorrect).length / rs.length) * 100);

  const stats = {
    days: countDays(thisWeek),
    prevDays: countDays(lastWeek),
    words: thisWeek.length,
    prevWords: lastWeek.length,
    accuracy: accuracyOf(thisWeek),
    prevAccuracy: accuracyOf(lastWeek),
  };

  const difficulty = computeAdaptiveDifficulty(
    recentResults.map((r) => r.isCorrect).reverse(),
  );

  // 주차 라벨: "6월 2주차 (6/8 ~ 6/14)" — 주 시작일 기준 계산 (렌더 순수성)
  const kstNow = new Date(thisWeekStart.getTime() + 9 * 60 * 60 * 1000);
  const weekOfMonth = Math.ceil(kstNow.getUTCDate() / 7);
  const fmt = (d: Date) => {
    const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return `${k.getUTCMonth() + 1}/${k.getUTCDate()}`;
  };
  const weekEnd = new Date(nextWeekStart.getTime() - 24 * 60 * 60 * 1000);

  const coaching = coachingMessage({
    days: stats.days,
    words: stats.words,
    accuracy: stats.accuracy,
    graduated: graduatedThisWeek.length,
  });

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <h2 className="text-2xl font-black text-[#3D3530]">주간 리포트 📊</h2>
        <p className="text-sm text-[#8B7E74] mt-1">
          {kstNow.getUTCMonth() + 1}월 {weekOfMonth}주차 · {fmt(thisWeekStart)} ~ {fmt(weekEnd)} · {child.name}
        </p>
      </div>

      {/* 핵심 지표 — 지난주 대비 */}
      <div className="grid grid-cols-3 gap-2.5">
        <BubbleCard padding="sm" className="text-center">
          <p className="text-2xl font-black text-[#3D3530]">{stats.days}<span className="text-sm text-[#A89B8E]">/7일</span></p>
          <p className="text-[11px] text-[#8B7E74] mb-1">연습한 날</p>
          <Delta now={stats.days} prev={stats.prevDays} unit="일" />
        </BubbleCard>
        <BubbleCard padding="sm" className="text-center">
          <p className="text-2xl font-black text-[#3D3530]">{stats.words}<span className="text-sm text-[#A89B8E]">개</span></p>
          <p className="text-[11px] text-[#8B7E74] mb-1">연습 단어</p>
          <Delta now={stats.words} prev={stats.prevWords} unit="개" />
        </BubbleCard>
        <BubbleCard padding="sm" className="text-center">
          <p className="text-2xl font-black text-[#3D3530]">
            {stats.accuracy === null ? "—" : `${stats.accuracy}`}
            {stats.accuracy !== null && <span className="text-sm text-[#A89B8E]">%</span>}
          </p>
          <p className="text-[11px] text-[#8B7E74] mb-1">정확도</p>
          {stats.accuracy !== null && stats.prevAccuracy !== null ? (
            <Delta now={stats.accuracy} prev={stats.prevAccuracy} unit="%p" />
          ) : (
            <span className="text-[11px] text-[#A89B8E]">비교 기록 없음</span>
          )}
        </BubbleCard>
      </div>

      {/* 이번 주 졸업한 단어 */}
      <BubbleCard color="mint">
        <p className="font-bold text-[#3D3530] mb-2">🎓 이번 주 졸업한 단어</p>
        {graduatedThisWeek.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {graduatedThisWeek.map((g) => (
              <PastelBadge key={g.targetWord} color="mint">{g.targetWord}</PastelBadge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8B7E74]">
            아직 없어요. 복습에서 5번 연속 성공하면 단어가 졸업해요!
          </p>
        )}
      </BubbleCard>

      {/* 집중 필요 음소 + 현재 난이도 */}
      <BubbleCard>
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-[#3D3530]">🎯 다음 주 집중 포인트</p>
          <PastelBadge color="lavender">난이도 {DIFFICULTY_LABEL[difficulty]}</PastelBadge>
        </div>
        {weakPhonemes.length > 0 ? (
          <div className="space-y-2">
            {weakPhonemes.map((w) => (
              <div key={w.phoneme} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#FFF5EE] flex items-center justify-center font-black text-[#FF9B6A]">
                  {w.phoneme}
                </span>
                <div className="flex-1">
                  <div className="h-2 bg-[#F0E8E0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#FFB38A]"
                      style={{ width: `${Math.min(100, Math.round(w.errorRate))}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-[#8B7E74] w-20 text-right">{w.weaknessLevel}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8B7E74]">집중 교정이 필요한 음소가 없어요. 잘하고 있어요! 🌟</p>
        )}
      </BubbleCard>

      {/* 코칭 한 줄 */}
      <BubbleCard color="peach">
        <p className="font-bold text-[#3D3530] mb-1">💌 다음 주를 위한 한마디</p>
        <p className="text-sm text-[#8B7E74] leading-relaxed">{coaching}</p>
      </BubbleCard>

      <Link href="/dashboard/routine" className="block">
        <BubbleButton variant="peach" size="lg" className="w-full">
          오늘의 루틴 시작하기 🌞
        </BubbleButton>
      </Link>
    </div>
  );
}
