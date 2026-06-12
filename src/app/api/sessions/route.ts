import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getKSTDateString } from "@/lib/kst-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");

    // ✨ Pro Fix 1: limit 값 검증 및 안전한 클램핑 (1 ~ 50 사이로 강제)
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
    const limit = isNaN(rawLimit) ? 10 : Math.max(1, Math.min(rawLimit, 50));

    // ✨ Pro Fix 2: Prisma의 완벽한 타입 추론 활용
    const where: Prisma.PracticeSessionWhereInput = {
      userId: session.user.id,
      ...(childId && { childId }),
    };

    const sessions = await prisma.practiceSession.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: limit,
      include: {
        child: { select: { name: true } },
        _count: { select: { wordRecords: true } },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("[PracticeSession GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId, words = [], sessionId } = await req.json();
    if (!childId) {
      return NextResponse.json({ error: "childId is required" }, { status: 400 });
    }

    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { userId: true, lastPractice: true, streakDays: true },
    });

    if (!child || child.userId !== session.user.id) {
      return NextResponse.json({ error: "Child not found or forbidden" }, { status: 404 });
    }

    // 연습한 단어 목록 — string[] | {text}[] | {word, correct}[] 모두 수용
    // correct 미지정은 true (하위 호환)
    const wordList: { word: string; correct: boolean }[] = Array.isArray(words)
      ? words
          .map((w: unknown) => {
            if (typeof w === "string") return { word: w, correct: true };
            const o = w as { word?: string; text?: string; correct?: boolean };
            return { word: o.word ?? o.text ?? "", correct: o.correct ?? true };
          })
          .filter((w) => w.word)
      : [];

    // streakDays 계산 — KST 기준 (UTC로 하면 한국 새벽 0~9시 연습이 어제로 잡힘)
    const now = new Date();
    const todayStr = getKSTDateString(now);
    const lastStr = child.lastPractice ? getKSTDateString(child.lastPractice) : "";
    const yesterdayStr = getKSTDateString(new Date(now.getTime() - 86400000));

    let newStreak = child.streakDays;
    if (lastStr === todayStr) {
      newStreak = child.streakDays; // 오늘 이미 연습함 — 유지
    } else if (lastStr === yesterdayStr) {
      newStreak = child.streakDays + 1; // 어제 연습 → 연속 +1
    } else {
      newStreak = 1; // 오래됐거나 첫 연습 → 1일로 리셋
    }

    // 트랜잭션으로 세션 + 단어기록 + 아이 통계 한번에 저장
    const practiceSession = await prisma.$transaction(async (tx) => {
      let ps: { id: string };

      if (sessionId && typeof sessionId === "string") {
        // 이어쓰기: 단어 완료마다 호출돼도 한 세션에 누적 (소유권 확인)
        const existing = await tx.practiceSession.findUnique({
          where: { id: sessionId },
          select: { id: true, userId: true, childId: true },
        });
        if (!existing || existing.userId !== session.user.id || existing.childId !== childId) {
          throw new Error("session not found or forbidden");
        }
        ps = existing;
        await tx.practiceSession.update({ where: { id: ps.id }, data: { endedAt: now } });
      } else {
        ps = await tx.practiceSession.create({
          data: {
            userId: session.user.id,
            childId,
            endedAt: now,
          },
        });
      }

      if (wordList.length > 0) {
        await tx.wordRecord.createMany({
          data: wordList.map(({ word, correct }) => ({
            sessionId: ps.id,
            targetWord: word,
            heardWord: word,
            isCorrect: correct,
            practicedAt: now,
          })),
        });

        await tx.child.update({
          where: { id: childId },
          data: {
            totalWords: { increment: wordList.length },
            lastPractice: now,
            streakDays: newStreak,
          },
        });
      } else {
        await tx.child.update({
          where: { id: childId },
          data: { lastPractice: now, streakDays: newStreak },
        });
      }

      return ps;
    });

    return NextResponse.json(practiceSession, { status: 201 });
  } catch (error) {
    console.error("[PracticeSession POST Error]:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, endedAt, durationMin } = await req.json();

    // 세션 정보 조회 (소유권 확인 + 현재 상태 파악)
    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id },
      select: { userId: true, childId: true, endedAt: true, durationMin: true }
    });

    if (!practiceSession || practiceSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    // ✨ Pro Fix 4: 멱등성 보장 (이미 종료된 세션에 중복 시간 누적 방지)
    if (practiceSession.endedAt) {
      return NextResponse.json(
        { message: "Session already ended" },
        { status: 200 }
      );
    }

    // ✨ Pro Fix 5: Date 파싱 에러 방어
    const parsedEndedAt = endedAt ? new Date(endedAt) : new Date();
    if (isNaN(parsedEndedAt.getTime())) {
      return NextResponse.json({ error: "Invalid endedAt date format" }, { status: 400 });
    }

    // ✨ Pro Fix 6: 원자적 트랜잭션 처리 (sessionEndedAt 업데이트와 totalMinutes 동시 갱신)
    const [updated] = await prisma.$transaction([
      prisma.practiceSession.update({
        where: { id },
        data: {
          endedAt: parsedEndedAt,
          durationMin: durationMin || 0,
        },
      }),
      ...(durationMin ? [
        prisma.child.update({
          where: { id: practiceSession.childId },
          data: { totalMinutes: { increment: durationMin } },
        })
      ] : []),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PracticeSession PATCH Error]:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
