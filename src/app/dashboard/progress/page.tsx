import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";

export const dynamic = "force-dynamic";
import { GrassCalendar } from "@/components/progress/GrassCalendar";
import { getSelectedChildId } from "@/lib/child-cookie";

export default async function ProgressPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  // 아이 목록 + 선택 ID 병렬 조회
  const [children, savedId] = await Promise.all([
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, mascotLevel: true, streakDays: true, totalWords: true },
    }),
    getSelectedChildId(),
  ]);

  if (children.length === 0) redirect("/onboarding");

  const child = children.find((c) => c.id === savedId) ?? children[0];

  // Calendar data: last 12 weeks
  const since = new Date();
  since.setDate(since.getDate() - 84);

  // ── Weekly report 기준일 ───────────────────────────────────────────────────
  const now = new Date();
  // Start of this week (Monday)
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  thisMonday.setHours(0, 0, 0, 0);
  // Start of last week
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  // 7개 독립 쿼리 병렬 실행 (직렬 대비 원격 DB 왕복 6회 절약)
  const [
    sessions,
    recentRecords,
    weakPhonemes,
    totalErrorRecords,
    savedWordsCount,
    thisWeekRecords,
    lastWeekRecords,
  ] = await Promise.all([
    prisma.practiceSession.findMany({
      where: { childId: child.id, startedAt: { gte: since } },
      include: { _count: { select: { wordRecords: true } } },
    }),
    prisma.wordRecord.findMany({
      where: { session: { childId: child.id } },
      orderBy: { practicedAt: "desc" },
      take: 50,
      select: { errorPhonemes: true, isCorrect: true, practicedAt: true },
    }),
    prisma.weakPhoneme.findMany({
      where: { childId: child.id },
      orderBy: { errorCount: "desc" },
      take: 6,
    }),
    prisma.errorRecord.count({ where: { childId: child.id } }),
    prisma.savedWord.count({ where: { childId: child.id } }),
    prisma.wordRecord.findMany({
      where: { session: { childId: child.id }, practicedAt: { gte: thisMonday } },
      select: { isCorrect: true, errorPhonemes: true },
    }),
    prisma.wordRecord.findMany({
      where: {
        session: { childId: child.id },
        practicedAt: { gte: lastMonday, lt: thisMonday },
      },
      select: { isCorrect: true, errorPhonemes: true },
    }),
  ]);

  const calendarMap: Record<string, number> = {};
  for (const s of sessions) {
    const dateKey = s.startedAt.toISOString().split("T")[0];
    calendarMap[dateKey] = (calendarMap[dateKey] ?? 0) + s._count.wordRecords;
  }

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

  const thisWeekTotal = thisWeekRecords.length;
  const lastWeekTotal = lastWeekRecords.length;
  const thisWeekCorrect = thisWeekRecords.filter((r: { isCorrect: boolean }) => r.isCorrect).length;
  const lastWeekCorrect = lastWeekRecords.filter((r: { isCorrect: boolean }) => r.isCorrect).length;

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
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-8">
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
      <div className="grid grid-cols-2 gap-3">
        <StatCard value={child.totalWords} label="총 연습 단어" emoji="📝" color="#FFB38A" />
        <StatCard value={child.streakDays} label="연속 출석" emoji="🔥" color="#FCA5A5" />
        <StatCard value={totalErrorRecords} label="발음 분석 기록" emoji="📝" color="#C4B5FD" />
        <StatCard value={savedWordsCount} label="복습 저장" emoji="📌" color="#7EDFD0" />
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

      {/* ── 발음 분석 기반 약점 음소 분석 ────────────────────────────── */}
      <BubbleCard>
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-[#3D3530]">🎯 약점 음소 분석</p>
          <span className="text-xs text-[#8B7E74]">발음 분석 {totalErrorRecords}개 기준</span>
        </div>

        {weakPhonemes.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-[#8B7E74]">
              {totalErrorRecords < 10
                ? `발음 분석 ${totalErrorRecords}/10개 — 10개 이상 입력하면 분석이 시작돼요`
                : "약점 분석 준비 중이에요"}
            </p>
            {totalErrorRecords < 10 && (
              <div className="mt-3 h-2 bg-[#F0E8E0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFB38A] rounded-full transition-all"
                  style={{ width: `${(totalErrorRecords / 10) * 100}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {weakPhonemes.map((w: { id: string; phoneme: string; errorCount: number; errorRate: number; weaknessLevel: string }) => {
              const levelMeta: Record<string, { color: string; bar: string; label: string }> = {
                집중교정필요: { color: "text-[#EF4444]", bar: "#FCA5A5", label: "🔴 집중 교정" },
                꾸준한연습필요: { color: "text-[#D97706]", bar: "#FDE68A", label: "🟡 꾸준히 연습" },
                관찰중:       { color: "text-[#16A34A]", bar: "#86EFAC", label: "🟢 관찰 중" },
                정상범위:     { color: "text-[#0D9488]", bar: "#7EDFD0", label: "✅ 정상" },
              };
              const meta = levelMeta[w.weaknessLevel] ?? levelMeta["관찰중"];
              const barW = Math.max(Math.round(w.errorRate), 4);
              return (
                <div key={w.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F0E8E0] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-black text-[#3D3530]">{w.phoneme}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs text-[#8B7E74]">{w.errorCount}회 오류</span>
                    </div>
                    <div className="h-2.5 bg-[#F0E8E0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${barW}%`, backgroundColor: meta.bar }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
