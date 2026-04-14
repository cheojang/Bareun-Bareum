import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

    const { childId } = await req.json();
    if (!childId) {
      return NextResponse.json({ error: "childId is required" }, { status: 400 });
    }

    // ✨ Pro Fix 3: findFirst 대신 findUnique로 인덱스 스캔 속도 극대화
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { userId: true }
    });

    if (!child || child.userId !== session.user.id) {
      return NextResponse.json({ error: "Child not found or forbidden" }, { status: 404 });
    }

    const practiceSession = await prisma.practiceSession.create({
      data: { userId: session.user.id, childId },
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
