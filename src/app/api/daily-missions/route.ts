export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getKSTEndOfDay } from "@/lib/kst-utils";

/**
 * GET /api/daily-missions?childId=xxx
 *
 * 오늘 아이가 할 "미션 3개"를 자동 큐레이션하여 반환한다.
 *
 * 우선순위:
 *   1. 복습 (ReviewSchedule.nextReviewAt <= 오늘, isLearned=false)  — 최대 2개
 *   2. 약점 훈련 (WeakPhoneme 중 errorRate 높은 순)                 — 최대 1개
 *   3. 새 도전 (SavedWord 중 오래 연습 안 한 단어)                  — 남는 자리 채움
 *
 * 3개를 못 채우면 그대로 반환(클라이언트가 "오늘은 쉬어도 좋아요" 표시).
 */
import type { Mission } from "@/types/missions";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    if (!childId) {
      return NextResponse.json({ error: "childId 필수" }, { status: 400 });
    }

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.userId !== session.user.id) {
      return NextResponse.json({ error: "접근 권한 없음" }, { status: 403 });
    }

    // KST 기준 오늘의 끝 계산
    const kstEndOfDayInUTC = getKSTEndOfDay();

    // 병렬 조회
    const [reviewsDue, totalPending, weakPhonemes, savedWords] = await Promise.all([
      prisma.reviewSchedule.findMany({
        where: { childId, isLearned: false, nextReviewAt: { lte: kstEndOfDayInUTC } },
        orderBy: { nextReviewAt: "asc" },
        take: 2,
      }),
      prisma.reviewSchedule.count({ where: { childId, isLearned: false } }),
      prisma.weakPhoneme.findMany({
        where: { childId, weaknessLevel: { in: ["집중교정필요", "꾸준한연습필요"] } },
        orderBy: { errorRate: "desc" },
        take: 3,
      }),
      prisma.savedWord.findMany({
        where: { childId },
        orderBy: { savedAt: "asc" },
        take: 5,
      }),
    ]);

    const missions: Mission[] = [];

    // 1. 복습 미션 (최대 2개)
    for (const r of reviewsDue) {
      missions.push({
        type: "review",
        reviewScheduleId: r.id,
        targetWord: r.targetWord,
        phoneme: r.phoneme === "미분류" ? "전체" : r.phoneme,
        hint: r.reviewCount === 0 ? "처음 복습할 단어예요" : `${r.reviewCount + 1}번째 복습`,
      });
    }

    // 2. 약점 훈련 미션 (1개)
    if (missions.length < 3 && weakPhonemes.length > 0) {
      const top = weakPhonemes[0];
      missions.push({
        type: "weakness",
        phoneme: top.phoneme,
        errorRate: Math.round(top.errorRate),
        hint: `'${top.phoneme}' 소리가 약점이에요 (오류율 ${Math.round(top.errorRate)}%)`,
      });
    }

    // 3. 새 도전 (SavedWord 중 가장 오래된 것부터)
    const used = new Set(missions.filter((m) => m.type === "review").map((m: any) => m.targetWord));
    for (const w of savedWords) {
      if (missions.length >= 3) break;
      if (used.has(w.word)) continue;
      missions.push({
        type: "challenge",
        targetWord: w.word,
        phoneme: w.targetPhoneme,
        hint: "새로 도전해볼 단어예요",
      });
    }

    return NextResponse.json({
      missions,
      totalReviewPending: totalPending,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[DailyMissions API Error]:", error);
    return NextResponse.json({ error: "미션을 불러올 수 없습니다" }, { status: 500 });
  }
}
