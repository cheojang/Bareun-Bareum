import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSelectedChildId } from "@/lib/child-cookie";

// ⚠️ 임시 진단용 — 홈/저장단어/설정 페이지 쿼리를 단계별 실행해 실패 지점을 특정. 확인 후 삭제.
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

  // 연결 자체 확인
  await run("DB 연결 (SELECT 1)", () => prisma.$queryRaw`SELECT 1`);

  const children = (await run("child.findMany(전체 컬럼 — 설정 페이지와 동일)", () =>
    prisma.child.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  )) as { id: string }[] | null;

  await run("user.findUnique(전체 컬럼)", () =>
    prisma.user.findUnique({ where: { id: userId } }),
  );
  await run("subscription.findUnique(전체 컬럼 — 설정)", () =>
    prisma.subscription.findUnique({ where: { userId } }),
  );

  const savedId = await run("getSelectedChildId(쿠키)", () => getSelectedChildId());
  const child = children?.find((c) => c.id === savedId) ?? children?.[0];

  if (child) {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    await run("reviewSchedule.count (홈·저장단어)", () =>
      prisma.reviewSchedule.count({
        where: { childId: child.id, isLearned: false, nextReviewAt: { lte: todayEnd } },
      }),
    );
    await run("reviewSchedule.findMany(전체 컬럼 — 복습)", () =>
      prisma.reviewSchedule.findMany({ where: { childId: child.id }, take: 3 }),
    );
    await run("savedWord.findMany(전체 컬럼 — 저장단어)", () =>
      prisma.savedWord.findMany({
        where: { childId: child.id },
        orderBy: { savedAt: "desc" },
      }),
    );
    await run("errorRecord.findMany(select — 저장단어)", () =>
      prisma.errorRecord.findMany({
        where: { childId: child.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true, targetWord: true, childPronunciation: true,
          errorPattern: true, errorCategory: true, createdAt: true,
        },
      }),
    );
    await run("practiceSession.findMany(전체 컬럼+include — 홈)", () =>
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
  } else {
    steps.push({ step: "child 선택", ok: false, note: "children 없음 (비회원이거나 아이 미등록)" });
  }

  return NextResponse.json({
    userId: userId.slice(0, 8) + "…",
    isGuest: userId.startsWith("guest:"),
    steps,
  });
}
