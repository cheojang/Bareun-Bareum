import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKST(date: Date): Date {
  return new Date(date.getTime() + KST_OFFSET_MS);
}

export async function GET(_: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisMonth,
    premiumSubsCount,
    totalChildren,
    childrenWithBirthDate,
    genderGrouped,
    totalErrorRecords,
    totalGeminiFeedbacks,
    wordPairCacheAgg,
    topCachedWords,
    errorCategoryGrouped,
    errorTypeGrouped,
    activeChildrenRaw,
    recentErrorsForTime,
    recentSignupsRaw,
    weakPhonemeGrouped,
    sessions7d,
    words7d,
    correctWords7d,
    pushSubscribers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.subscription.count({ where: { plan: "premium", status: "active" } }),
    prisma.child.count(),
    prisma.child.findMany({
      select: { birthDate: true },
      where: { birthDate: { not: null } },
    }),
    prisma.child.groupBy({
      by: ["gender"],
      _count: { id: true },
    }),
    prisma.errorRecord.count(),
    prisma.geminiFeedback.count(),
    prisma.wordPairCache.aggregate({
      _sum: { hitCount: true },
      _count: { id: true },
    }),
    prisma.wordPairCache.findMany({
      orderBy: { hitCount: "desc" },
      take: 10,
      select: {
        targetWord: true,
        childPronunciation: true,
        hitCount: true,
        errorType: true,
        errorCategory: true,
      },
    }),
    prisma.errorRecord.groupBy({
      by: ["errorCategory"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.errorRecord.groupBy({
      by: ["errorType"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.errorRecord.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { childId: true },
      distinct: ["childId"],
    }),
    prisma.errorRecord.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.weakPhoneme.groupBy({
      by: ["phoneme"],
      _sum: { errorCount: true },
      orderBy: { _sum: { errorCount: "desc" } },
      take: 10,
    }),
    // 연습 활동 (최근 7일) — 오답 입력과 별개의 실제 학습 지표
    prisma.practiceSession.count({ where: { startedAt: { gte: sevenDaysAgo } } }),
    prisma.wordRecord.count({ where: { practicedAt: { gte: sevenDaysAgo } } }),
    prisma.wordRecord.count({ where: { practicedAt: { gte: sevenDaysAgo }, isCorrect: true } }),
    prisma.pushSubscription.count(),
  ]);

  // ─── 파생 지표 계산 ───────────────────────────────────────────
  const cacheHitTotal = wordPairCacheAgg._sum.hitCount ?? 0;
  const cacheItemCount = wordPairCacheAgg._count.id;
  const totalAiRequests = cacheHitTotal + totalGeminiFeedbacks;
  const cacheHitRate =
    totalAiRequests > 0
      ? Math.round((cacheHitTotal / totalAiRequests) * 100)
      : 0;

  // ─── 아이 연령 분포 ───────────────────────────────────────────
  const AGE_LABELS = ["1세 이하", "2세", "3세", "4세", "5세", "6세", "7세", "8세 이상"];
  const ageGroupCounts: Record<string, number> = {};
  const today = new Date();
  for (const child of childrenWithBirthDate) {
    if (!child.birthDate) continue;
    const bd = new Date(child.birthDate);
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    const label =
      age <= 1 ? "1세 이하" : age >= 8 ? "8세 이상" : `${age}세`;
    ageGroupCounts[label] = (ageGroupCounts[label] ?? 0) + 1;
  }
  const ageDistribution = AGE_LABELS.map((label) => ({
    label,
    count: ageGroupCounts[label] ?? 0,
  }));

  // ─── 시간대별 사용량 (KST 기준) ──────────────────────────────
  const hourCounts = new Array(24).fill(0);
  for (const rec of recentErrorsForTime) {
    const kstHour = toKST(rec.createdAt).getUTCHours();
    hourCounts[kstHour]++;
  }
  const hourlyUsage = hourCounts.map((count, hour) => ({ hour, count }));

  // ─── 요일별 사용량 (KST, 월=0 ~ 일=6 순서) ────────────────────
  const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
  const dayCounts = new Array(7).fill(0); // JS: 0=일 1=월 ... 6=토
  for (const rec of recentErrorsForTime) {
    const kstDay = toKST(rec.createdAt).getUTCDay(); // 0=Sun
    dayCounts[kstDay]++;
  }
  // 월(1)~일(0) 순서로 재배열
  const weekdayUsage = [1, 2, 3, 4, 5, 6, 0].map((jsDay, i) => ({
    day: DAY_LABELS[i],
    count: dayCounts[jsDay],
  }));

  // ─── 일별 신규 가입자 (최근 30일) ────────────────────────────
  const signupByDate: Record<string, number> = {};
  for (const u of recentSignupsRaw) {
    const dateStr = toKST(u.createdAt).toISOString().slice(0, 10);
    signupByDate[dateStr] = (signupByDate[dateStr] ?? 0) + 1;
  }
  const dailySignups = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    const dateStr = toKST(d).toISOString().slice(0, 10);
    return { date: dateStr, count: signupByDate[dateStr] ?? 0 };
  });

  return NextResponse.json({
    users: {
      total: totalUsers,
      newThisMonth: newUsersThisMonth,
      premium: premiumSubsCount,
      free: totalUsers - premiumSubsCount,
      activeChildren7d: activeChildrenRaw.length,
    },
    analysis: {
      totalErrorRecords,
      totalGeminiCalls: totalGeminiFeedbacks,
      cacheHitTotal,
      cacheItemCount,
      cacheHitRate,
    },
    engagement: {
      sessions7d,
      words7d,
      accuracy7d: words7d > 0 ? Math.round((correctWords7d / words7d) * 100) : null,
      pushSubscribers,
    },
    children: {
      total: totalChildren,
      ageDistribution,
      genderDistribution: genderGrouped.map(
        (g: { gender: string | null; _count: { id: number } }) => ({
          label: g.gender ?? "미입력",
          count: g._count.id,
        })
      ),
    },
    hourlyUsage,
    weekdayUsage,
    topCachedWords,
    errorCategories: errorCategoryGrouped.map((g: { errorCategory: string; _count: { id: number } }) => ({
      category: g.errorCategory,
      count: g._count.id,
    })),
    errorTypes: errorTypeGrouped.map((g: { errorType: string; _count: { id: number } }) => ({
      type: g.errorType,
      count: g._count.id,
    })),
    weakPhonemes: weakPhonemeGrouped.map((g: { phoneme: string; _sum: { errorCount: number | null } }) => ({
      phoneme: g.phoneme,
      errorCount: g._sum.errorCount ?? 0,
    })),
    dailySignups,
    generatedAt: now.toISOString(),
  });
}
