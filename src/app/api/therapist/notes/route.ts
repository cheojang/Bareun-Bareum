import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTherapistSession, canAccessChild } from "@/lib/therapist-auth";

/**
 * GET /api/therapist/notes?childId=xxx
 * 치료 일지 목록
 */
export async function GET(request: NextRequest) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const childId = request.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId 필수" }, { status: 400 });

  if (!(await canAccessChild(ts.therapistId, childId))) {
    return NextResponse.json({ error: "담당 아이가 아닙니다" }, { status: 403 });
  }

  const notes = await prisma.therapyNote.findMany({
    where: { therapistId: ts.therapistId, childId },
    orderBy: { sessionDate: "desc" },
    include: { therapist: { select: { name: true } } },
  });

  return NextResponse.json({
    notes: notes.map((n) => ({
      ...n,
      targetPhonemes: JSON.parse(n.targetPhonemes),
      therapistName: n.therapist.name,
    })),
  });
}

/**
 * POST /api/therapist/notes
 * 일지 작성
 */
export async function POST(request: NextRequest) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { childId, sessionDate, targetPhonemes, performance, memo, isVisibleToParent } =
    await request.json();

  if (!childId || !sessionDate || !targetPhonemes?.length || performance == null || !memo) {
    return NextResponse.json({ error: "필수 항목이 빠졌습니다" }, { status: 400 });
  }

  if (!(await canAccessChild(ts.therapistId, childId))) {
    return NextResponse.json({ error: "담당 아이가 아닙니다" }, { status: 403 });
  }

  const note = await prisma.therapyNote.create({
    data: {
      therapistId: ts.therapistId,
      childId,
      sessionDate: new Date(sessionDate),
      targetPhonemes: JSON.stringify(targetPhonemes),
      performance: Math.min(100, Math.max(0, Number(performance))),
      memo,
      isVisibleToParent: isVisibleToParent !== false,
    },
  });

  return NextResponse.json({ ...note, targetPhonemes: JSON.parse(note.targetPhonemes) });
}

/**
 * PATCH /api/therapist/notes
 * body: { noteId, memo?, performance?, isVisibleToParent? }
 */
export async function PATCH(request: NextRequest) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { noteId, memo, performance, isVisibleToParent } = await request.json();

  const note = await prisma.therapyNote.findFirst({
    where: { id: noteId, therapistId: ts.therapistId },
  });
  if (!note) return NextResponse.json({ error: "일지를 찾을 수 없습니다" }, { status: 404 });

  await prisma.therapyNote.update({
    where: { id: noteId },
    data: {
      ...(memo !== undefined && { memo }),
      ...(performance !== undefined && {
        performance: Math.min(100, Math.max(0, Number(performance))),
      }),
      ...(isVisibleToParent !== undefined && { isVisibleToParent }),
    },
  });

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/therapist/notes
 * body: { noteId }
 */
export async function DELETE(request: NextRequest) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { noteId } = await request.json();
  await prisma.therapyNote.deleteMany({
    where: { id: noteId, therapistId: ts.therapistId },
  });
  return NextResponse.json({ success: true });
}
