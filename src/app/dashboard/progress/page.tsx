import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { GrassCalendar } from "@/components/progress/GrassCalendar";

export default async function ProgressPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const child = await prisma.child.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (!child) redirect("/onboarding");

  // Calendar data: last 12 weeks
  const since = new Date();
  since.setDate(since.getDate() - 84);

  const sessions = await prisma.practiceSession.findMany({
    where: { childId: child.id, startedAt: { gte: since } },
    include: { _count: { select: { wordRecords: true } } },
  });

  const calendarMap: Record<string, number> = {};
  for (const s of sessions) {
    const dateKey = s.startedAt.toISOString().split("T")[0];
    calendarMap[dateKey] = (calendarMap[dateKey] ?? 0) + s._count.wordRecords;
  }

  // Phoneme errors (last 50 records)
  const recentRecords = await prisma.wordRecord.findMany({
    where: { session: { childId: child.id } },
    orderBy: { practicedAt: "desc" },
    take: 50,
    select: { errorPhonemes: true, isCorrect: true, practicedAt: true },
  });

  const phonemeCounts: Record<string, number> = {};
  let correctCount = 0;
  for (const r of recentRecords) {
    if (r.isCorrect) correctCount++;
    const errors = (r.errorPhonemes as { targetPhoneme: string }[]) ?? [];
    for (const e of errors) {
      phonemeCounts[e.targetPhoneme] = (phonemeCounts[e.targetPhoneme] ?? 0) + 1;
    }
  }

  const topErrors = Object.entries(phonemeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const accuracy =
    recentRecords.length > 0
      ? Math.round((correctCount / recentRecords.length) * 100)
      : 0;

  // ── Weekly report ──────────────────────────────────────────────────────────
  const now = new Date();
  // Start of this week (Monday)
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  thisMonday.setHours(0, 0, 0, 0);
  // Start of last week
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  const thisWeekRecords = await prisma.wordRecord.findMany({
    where: { session: { childId: child.id }, practicedAt: { gte: thisMonday } },
    select: { isCorrect: true, errorPhonemes: true },
  });

  const lastWeekRecords = await prisma.wordRecord.findMany({
    where: {
      session: { childId: child.id },
      practicedAt: { gte: lastMonday, lt: thisMonday },
    },
    select: { isCorrect: true, errorPhonemes: true },
  });

  const thisWeekTotal = thisWeekRecords.length;
  const lastWeekTotal = lastWeekRecords.length;
  const thisWeekCorrect = thisWeekRecords.filter((r) => r.isCorrect).length;
  const lastWeekCorrect = lastWeekRecords.filter((r) => r.isCorrect).length;

  const thisWeekAccuracy =
    thisWeekTotal > 0 ? Math.round((thisWeekCorrect / thisWeekTotal) * 100) : 0;
  const lastWeekAccuracy =
    lastWeekTotal > 0 ? Math.round((lastWeekCorrect / lastWeekTotal) * 100) : 0;
  const accuracyDelta = thisWeekAccuracy - lastWeekAccuracy;

  // Which phonemes improved this week (fewer errors)
  const lastWeekErrors: Record<string, number> = {};
  for (const r of lastWeekRecords) {
    const errors = (r.errorPhonemes as { targetPhoneme: string }[]) ?? [];
    for (const e of errors) {
      lastWeekErrors[e.targetPhoneme] = (lastWeekErrors[e.targetPhoneme] ?? 0) + 1;
    }
  }
  const thisWeekErrors: Record<string, number> = {};
  for (const r of thisWeekRecords) {
    const errors = (r.errorPhonemes as { targetPhoneme: string }[]) ?? [];
    for (const e of errors) {
      thisWeekErrors[e.targetPhoneme] = (thisWeekErrors[e.targetPhoneme] ?? 0) + 1;
    }
  }

  // Phonemes that had fewer errors this week (improved)
  const improvedPhonemes = Object.entries(lastWeekErrors)
    .filter(([phoneme, lastCount]) => {
      const thisCount = thisWeekErrors[phoneme] ?? 0;
      return thisCount < lastCount;
    })
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([phoneme]) => phoneme);

  const mascotEmojis = ["🥚", "🐣", "🐥", "🐤", "🦅"];

  return (
    <div className="px-5 pt-6 max-w-lg mx-auto space-y-5 pb-8">
      <h2 className="text-2xl font-black text-[#3D3530]">성장 기록 📈</h2>

      {/* Mascot + Stats */}
      <BubbleCard className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-[#FFF5EE] flex items-center justify-center text-5xl border-2 border-[#FFD4B8]">
          {mascotEmojis[Math.min(child.mascotLevel - 1, 4)]}
        </div>
        <div className="flex-1">
          <p className="text-lg font-black text-[#3D3530]">{child.name}</p>
          <p className="text-sm text-[#8B7E74]">Lv.{child.mascotLevel}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <PastelBadge color="peach">🔥 {child.streakDays}일 연속</PastelBadge>
            <PastelBadge color="mint">✅ {accuracy}% 정확도</PastelBadge>
          </div>
        </div>
      </BubbleCard>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={child.totalWords} label="총 단어" emoji="📝" color="#FFB38A" />
        <StatCard value={child.totalMinutes} label="학습 분" emoji="⏱️" color="#7EDFD0" />
        <StatCard value={child.streakDays} label="연속일" emoji="🔥" color="#FCA5A5" />
      </div>

      {/* ── Weekly report ───────────────────────────────────────────── */}
      <BubbleCard>
        <p className="font-bold text-[#3D3530] mb-4">📋 주간 리포트</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#FFF5EE] rounded-2xl p-3 text-center">
            <p className="text-xs text-[#8B7E74] mb-1">이번 주 단어</p>
            <p className="text-2xl font-black text-[#FFB38A]">{thisWeekTotal}</p>
            {thisWeekTotal > lastWeekTotal && (
              <p className="text-xs text-[#7EDFD0] font-semibold mt-0.5">
                ↑ {thisWeekTotal - lastWeekTotal}개 증가
              </p>
            )}
            {thisWeekTotal < lastWeekTotal && (
              <p className="text-xs text-[#FCA5A5] font-semibold mt-0.5">
                ↓ {lastWeekTotal - thisWeekTotal}개 감소
              </p>
            )}
          </div>
          <div className="bg-[#F0FAF8] rounded-2xl p-3 text-center">
            <p className="text-xs text-[#8B7E74] mb-1">이번 주 정확도</p>
            <p className="text-2xl font-black text-[#7EDFD0]">
              {thisWeekTotal > 0 ? `${thisWeekAccuracy}%` : "-"}
            </p>
            {lastWeekTotal > 0 && thisWeekTotal > 0 && (
              <p
                className={`text-xs font-semibold mt-0.5 ${
                  accuracyDelta >= 0 ? "text-[#7EDFD0]" : "text-[#FCA5A5]"
                }`}
              >
                {accuracyDelta >= 0 ? `↑ ${accuracyDelta}%p 향상` : `↓ ${Math.abs(accuracyDelta)}%p`}
              </p>
            )}
          </div>
        </div>

        {/* Improved phonemes */}
        {improvedPhonemes.length > 0 && (
          <div className="bg-[#F0FAF8] rounded-2xl p-3 mb-3">
            <p className="text-xs font-semibold text-[#3D3530] mb-2">🌱 이번 주 늘어난 발음</p>
            <div className="flex gap-2 flex-wrap">
              {improvedPhonemes.map((p) => (
                <PastelBadge key={p} color="mint">{p} ↑</PastelBadge>
              ))}
            </div>
          </div>
        )}

        {/* Comparison bar */}
        {(thisWeekTotal > 0 || lastWeekTotal > 0) && (
          <div>
            <p className="text-xs text-[#8B7E74] mb-2">지난주 vs 이번 주</p>
            <div className="space-y-2">
              {[
                { label: "지난주", value: lastWeekTotal, color: "#F0E8E0" },
                { label: "이번 주", value: thisWeekTotal, color: "#FFB38A" },
              ].map(({ label, value, color }) => {
                const maxVal = Math.max(lastWeekTotal, thisWeekTotal, 1);
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-[#8B7E74] w-12">{label}</span>
                    <div className="flex-1 h-3 bg-[#F0E8E0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(value / maxVal) * 100}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#3D3530] w-8 text-right">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {thisWeekTotal === 0 && lastWeekTotal === 0 && (
          <p className="text-sm text-[#8B7E74] text-center py-2">
            아직 연습 기록이 없어요. 오늘 첫 연습을 시작해봐요! 🎯
          </p>
        )}
      </BubbleCard>

      {/* Calendar */}
      <BubbleCard>
        <p className="font-bold text-[#3D3530] mb-4">📅 학습 달력 (12주)</p>
        <GrassCalendar data={calendarMap} weeks={12} />
      </BubbleCard>

      {/* Phoneme errors */}
      {topErrors.length > 0 && (
        <BubbleCard>
          <p className="font-bold text-[#3D3530] mb-4">🔍 자주 틀리는 발음</p>
          <div className="space-y-2">
            {topErrors.map(([phoneme, count]) => (
              <div key={phoneme} className="flex items-center gap-3">
                <PastelBadge color="pink" className="w-12 justify-center">{phoneme}</PastelBadge>
                <div className="flex-1 h-3 bg-[#F0E8E0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FCA5A5] rounded-full"
                    style={{ width: `${Math.min((count / (topErrors[0]?.[1] ?? 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-[#8B7E74] w-8 text-right">{count}회</span>
              </div>
            ))}
          </div>
        </BubbleCard>
      )}

      {/* Encouragement */}
      {child.totalWords > 0 && (
        <BubbleCard color="mint" className="text-center">
          <p className="text-2xl mb-2">🌟</p>
          <p className="font-bold text-[#3D3530]">
            {child.totalWords}개 단어를 연습했어요!
          </p>
          <p className="text-sm text-[#8B7E74] mt-1">
            {child.mascotLevel < 5
              ? `${[5, 20, 50, 100][child.mascotLevel - 1] - child.totalWords}개 더 하면 레벨 업!`
              : "최고 레벨 달성! 대단해요! 🦅"}
          </p>
        </BubbleCard>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
  emoji,
  color,
}: {
  value: number;
  label: string;
  emoji: string;
  color: string;
}) {
  return (
    <BubbleCard padding="sm" className="text-center">
      <span className="text-2xl">{emoji}</span>
      <p className="text-2xl font-black mt-1" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-[#8B7E74]">{label}</p>
    </BubbleCard>
  );
}
