import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PhonemeError } from "@/types/phonetics";
import { getKSTDateString } from "@/lib/kst-utils";
import { requireUserId, requireChildOwner, apiErrorResponse } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const childId = new URL(req.url).searchParams.get("childId");
    const child = await requireChildOwner(childId, userId);

    // 2. 캘린더 히트맵 (최근 12주)
    const since = new Date();
    since.setDate(since.getDate() - 84);

    const sessions = await prisma.practiceSession.findMany({
      where: { childId: child.id, startedAt: { gte: since } },
      include: { _count: { select: { wordRecords: true } } },
      orderBy: { startedAt: "asc" },
    });

    const calendarMap: Record<string, number> = {};
    for (const s of sessions) {
      const dateKey = getKSTDateString(s.startedAt);
      calendarMap[dateKey] =
        (calendarMap[dateKey] ?? 0) + s._count.wordRecords;
    }

    // 3. 최근 30개 기록을 통한 오류 분석 및 정확도 계산
    const recentRecords = await prisma.wordRecord.findMany({
      where: { session: { childId: child.id } },
      orderBy: { practicedAt: "desc" },
      take: 30,
      select: { errorPhonemes: true, isCorrect: true },
    });

    const phonemeCounts: Record<string, number> = {};
    let correctCount = 0;

    for (const record of recentRecords) {
      if (record.isCorrect) correctCount++;

      // ✨ 런타임 에러 방어: null이거나 undefined일 경우 빈 배열로 처리
      const errors =
        ((record.errorPhonemes as unknown as PhonemeError[]) || []);

      for (const e of errors) {
        // ✨ 빈 문자열(첨가 오류 등)이 차트에 들어가는 것 방지
        if (!e.targetPhoneme || e.targetPhoneme.trim() === "") continue;
        phonemeCounts[e.targetPhoneme] =
          (phonemeCounts[e.targetPhoneme] ?? 0) + 1;
      }
    }

    const phonemeErrors = Object.entries(phonemeCounts)
      .map(([phoneme, count]) => ({ phoneme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // 상위 8개 취약 발음

    return NextResponse.json({
      child: {
        name: child.name,
        mascotLevel: child.mascotLevel,
        totalWords: child.totalWords,
        totalMinutes: child.totalMinutes,
        streakDays: child.streakDays,
        lastPractice: child.lastPractice,
      },
      calendar: calendarMap,
      accuracy:
        recentRecords.length > 0
          ? Math.round((correctCount / recentRecords.length) * 100)
          : 0,
      phonemeErrors,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
