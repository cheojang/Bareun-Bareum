import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/parent/homework?childId=xxx
 * 부모가 아이 숙제 목록 조회
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const childId = request.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId 필수" }, { status: 400 });

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "접근 권한 없음" }, { status: 403 });
  }

  const homeworks = await prisma.homework.findMany({
    where: { childId },
    orderBy: { dueDate: "asc" },
    include: { therapist: { select: { name: true } } },
  });

  return NextResponse.json({
    homeworks: homeworks.map((h) => ({
      ...h,
      targetWords: JSON.parse(h.targetWords),
      therapistName: h.therapist.name,
    })),
  });
}

/**
 * PATCH /api/parent/homework
 * body: { homeworkId } — 숙제 완료 처리
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { homeworkId } = await request.json();

  const hw = await prisma.homework.findUnique({
    where: { id: homeworkId },
    include: { child: true },
  });
  if (!hw || hw.child.userId !== session.user.id) {
    return NextResponse.json({ error: "접근 권한 없음" }, { status: 403 });
  }

  await prisma.homework.update({
    where: { id: homeworkId },
    data: { status: "done" },
  });

  return NextResponse.json({ success: true });
}
