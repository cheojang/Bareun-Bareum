import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/parent/notes?childId=xxx
 * 부모가 치료 일지 조회 (isVisibleToParent=true 만)
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

  const notes = await prisma.therapyNote.findMany({
    where: { childId, isVisibleToParent: true },
    orderBy: { sessionDate: "desc" },
    include: { therapist: { select: { name: true } } },
  });

  return NextResponse.json({
    notes: notes.map((n) => ({
      id: n.id,
      sessionDate: n.sessionDate,
      targetPhonemes: JSON.parse(n.targetPhonemes),
      performance: n.performance,
      memo: n.memo,
      therapistName: n.therapist.name,
    })),
  });
}
