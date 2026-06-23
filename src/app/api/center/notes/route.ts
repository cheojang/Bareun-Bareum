import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTherapistSession, canAccessChild } from "@/lib/therapist-auth";

/**
 * GET /api/center/notes?childId=xxx
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
 * POST /api/center/notes
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

  // 입력 검증
  if (!Array.isArray(targetPhonemes) || targetPhonemes.length > 30) {
    return NextResponse.json({ error: "targetPhonemes는 최대 30개 배열이어야 합니다" }, { status: 400 });
  }
  const sanitizedPhonemes = targetPhonemes
    .filter((p): p is string => typeof p === "string")
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.length <= 10);
  if (sanitizedPhonemes.length === 0) {
    return NextResponse.json({ error: "유효한 음소가 없습니다" }, { status: 400 });
  }

  const sessDate = new Date(sessionDate);
  if (isNaN(sessDate.getTime())) {
    return NextResponse.json({ error: "sessionDate 형식이 올바르지 않습니다" }, { status: 400 });
  }

  const safeMemo = typeof memo === "string" ? memo.slice(0, 2000) : "";
  if (!safeMemo) {
    return NextResponse.json({ error: "memo는 문자열이어야 합니다" }, { status: 400 });
  }

  if (!(await canAccessChild(ts.therapistId, childId))) {
    return NextResponse.json({ error: "담당 아이가 아닙니다" }, { status: 403 });
  }

  const note = await prisma.therapyNote.create({
    data: {
      therapistId: ts.therapistId,
      childId,
      sessionDate: sessDate,
      targetPhonemes: JSON.stringify(sanitizedPhonemes),
      performance: Math.min(100, Math.max(0, Number(performance))),
      memo: safeMemo,
      isVisibleToParent: isVisibleToParent !== false,
    },
  });

  return NextResponse.json({ ...note, targetPhonemes: JSON.parse(note.targetPhonemes) });
}

/**
 * PATCH /api/center/notes
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
      ...(memo !== undefined && { memo: typeof memo === "string" ? memo.slice(0, 2000) : "" }),
      ...(performance !== undefined && {
        performance: Math.min(100, Math.max(0, Number(performance))),
      }),
      ...(isVisibleToParent !== undefined && { isVisibleToParent }),
    },
  });

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/center/notes
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
