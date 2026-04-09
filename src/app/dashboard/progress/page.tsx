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

  // Phoneme errors
  const recentRecords = await prisma.wordRecord.findMany({
    where: { session: { childId: child.id } },
    orderBy: { practicedAt: "desc" },
    take: 50,
    select: { errorPhonemes: true, isCorrect: true },
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
