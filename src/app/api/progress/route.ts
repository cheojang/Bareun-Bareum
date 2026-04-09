import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PhonemeError } from "@/types/phonetics";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  if (!childId) {
    return NextResponse.json({ error: "childId is required" }, { status: 400 });
  }

  // Verify ownership
  const child = await prisma.child.findFirst({
    where: { id: childId, userId: session.user.id },
  });
  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Calendar heatmap: last 12 weeks of activity
  const since = new Date();
  since.setDate(since.getDate() - 84);

  const sessions = await prisma.practiceSession.findMany({
    where: { childId, startedAt: { gte: since } },
    include: { _count: { select: { wordRecords: true } } },
    orderBy: { startedAt: "asc" },
  });

  const calendarMap: Record<string, number> = {};
  for (const s of sessions) {
    const dateKey = s.startedAt.toISOString().split("T")[0];
    calendarMap[dateKey] = (calendarMap[dateKey] ?? 0) + s._count.wordRecords;
  }

  // Phoneme error breakdown (last 30 records)
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
    const errors = record.errorPhonemes as unknown as PhonemeError[];
    for (const e of errors) {
      phonemeCounts[e.targetPhoneme] = (phonemeCounts[e.targetPhoneme] ?? 0) + 1;
    }
  }

  const phonemeErrors = Object.entries(phonemeCounts)
    .map(([phoneme, count]) => ({ phoneme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

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
    accuracy: recentRecords.length > 0 ? Math.round((correctCount / recentRecords.length) * 100) : 0,
    phonemeErrors,
  });
}
