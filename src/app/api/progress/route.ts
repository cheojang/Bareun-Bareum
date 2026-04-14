import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PhonemeError } from "@/types/phonetics";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");
    if (!childId) {
      return NextResponse.json({ error: "childId is required" }, { status: 400 });
    }

    // 1. 소유권 확인
    const child = await prisma.child.findFirst({
      where: { id: childId, userId: session.user.id },
    });
    if (!child) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 2. 캘린더 히트맵 (최근 12주)
    const since = new Date();
    since.setDate(since.getDate() - 84);

    const sessions = await prisma.practiceSession.findMany({
      where: { childId, startedAt: { gte: since } },
      include: { _count: { select: { wordRecords: true } } },
      orderBy: { startedAt: "asc" },
    });

    const calendarMap: Record<string, number> = {};
    for (const s of sessions) {
      // ✨ 타임존 버그 해결: KST 기준으로 날짜 키(YYYY-MM-DD) 생성
      const kstDate = new Date(
        s.startedAt.getTime() + 9 * 60 * 60 * 1000
      );
      const dateKey = kstDate.toISOString().split("T")[0];

      calendarMap[dateKey] =
        (calendarMap[dateKey] ?? 0) + s._count.wordRecords;
    }

    // 3. 최근 30개 기록을 통한 오류 분석 및 정확도 계산
    const recentRecords = await prisma.wordRecord.findMany({
      where: { session: { childId } },
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
    console.error("[Dashboard API Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
