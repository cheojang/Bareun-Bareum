import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSelectedChildId } from "@/lib/child-cookie";

// ⚠️ 임시 진단용 — 대시보드 홈과 동일한 쿼리를 단계별 실행해 실패 지점을 특정. 확인 후 삭제.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인 후 접속해주세요" }, { status: 401 });
  }
  const userId = session.user.id;

  const steps: { step: string; ok: boolean; note?: string }[] = [];
  const run = async (step: string, fn: () => Promise<unknown>) => {
    try {
      const r = await fn();
      steps.push({ step, ok: true, note: typeof r === "number" ? `count=${r}` : undefined });
      return r;
    } catch (e) {
      steps.push({ step, ok: false, note: e instanceof Error ? e.message : String(e) });
      return null;
    }
  };

  const children = (await run("child.findMany(select)", () =>
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, mascotLevel: true, image: true, streakDays: true, totalWords: true },
    }),
  )) as { id: string }[] | null;

  // 스키마 드리프트 감지: select 없이 전체 컬럼 요청 (없는 컬럼 있으면 여기서 실패)
  await run("child.findFirst(전체 컬럼 — gender 등 드리프트 감지)", () =>
    prisma.child.findFirst({ where: { userId } }),
  );
  await run("user.findUnique(전체 컬럼)", () =>
    prisma.user.findUnique({ where: { id: userId } }),
  );

  const savedId = await run("getSelectedChildId(쿠키)", () => getSelectedChildId());
  const child = children?.find((c) => c.id === savedId) ?? children?.[0];

  if (child) {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const calendarStart = new Date();
    calendarStart.setDate(calendarStart.getDate() - 14);

    await run("reviewSchedule.count", () =>
      prisma.reviewSchedule.count({
        where: { childId: child.id, isLearned: false, nextReviewAt: { lte: todayEnd } },
      }),
    );
    await run("practiceSession.findMany(전체 컬럼+include)", () =>
      prisma.practiceSession.findMany({
        where: { userId, childId: child.id },
        orderBy: { startedAt: "desc" },
        take: 5,
        include: {
          child: { select: { name: true } },
          wordRecords: { select: { targetWord: true }, orderBy: { practicedAt: "asc" } },
        },
      }),
    );
    await run("wordRecord.findMany(캘린더)", () =>
      prisma.wordRecord.findMany({
        where: { session: { childId: child.id }, practicedAt: { gte: calendarStart } },
        select: { practicedAt: true },
      }),
    );
  } else {
    steps.push({ step: "child 선택", ok: false, note: "children 없음 또는 이전 단계 실패" });
  }

  return NextResponse.json({ userId: userId.slice(0, 8) + "…", steps });
}
