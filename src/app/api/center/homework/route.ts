import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTherapistSession, canAccessChild } from "@/lib/therapist-auth";

/**
 * GET /api/center/homework?childId=xxx
 * 특정 아이의 숙제 목록
 */
export async function GET(request: NextRequest) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const childId = request.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId 필수" }, { status: 400 });

  if (!(await canAccessChild(ts.therapistId, childId))) {
    return NextResponse.json({ error: "담당 아이가 아닙니다" }, { status: 403 });
  }

  const homeworks = await prisma.homework.findMany({
    where: { therapistId: ts.therapistId, childId },
    orderBy: { dueDate: "desc" },
  });

  return NextResponse.json({
    homeworks: homeworks.map((h) => ({
      ...h,
      targetWords: JSON.parse(h.targetWords),
    })),
  });
}

/**
 * POST /api/center/homework
 * 숙제 배정
 */
export async function POST(request: NextRequest) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { childId, targetWords, targetPhoneme, description, dueDate } =
    await request.json();

  if (!childId || !targetWords?.length || !dueDate) {
    return NextResponse.json(
      { error: "childId, targetWords, dueDate 필수" },
      { status: 400 }
    );
  }

  // 입력 검증: targetWords는 배열이어야 하고 각 항목은 짧은 문자열
  if (!Array.isArray(targetWords) || targetWords.length > 50) {
    return NextResponse.json(
      { error: "targetWords는 최대 50개 배열이어야 합니다" },
      { status: 400 }
    );
  }
  const sanitizedWords = targetWords
    .filter((w): w is string => typeof w === "string")
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && w.length <= 50);
  if (sanitizedWords.length === 0) {
    return NextResponse.json(
      { error: "유효한 단어가 없습니다" },
      { status: 400 }
    );
  }

  // 날짜 유효성
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) {
    return NextResponse.json({ error: "dueDate 형식이 올바르지 않습니다" }, { status: 400 });
  }

  if (!(await canAccessChild(ts.therapistId, childId))) {
    return NextResponse.json({ error: "담당 아이가 아닙니다" }, { status: 403 });
  }

  const homework = await prisma.homework.create({
    data: {
      therapistId: ts.therapistId,
      childId,
      targetWords: JSON.stringify(sanitizedWords),
      targetPhoneme: typeof targetPhoneme === "string" ? targetPhoneme.slice(0, 20) : null,
      description: typeof description === "string" ? description.slice(0, 500) : null,
      dueDate: due,
    },
  });

  return NextResponse.json({
    ...homework,
    targetWords: JSON.parse(homework.targetWords),
  });
}

/**
 * PATCH /api/center/homework
 * body: { homeworkId, status } — 상태 변경 (done/pending)
 */
export async function PATCH(request: NextRequest) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { homeworkId, status } = await request.json();
  if (!homeworkId || !["pending", "done"].includes(status)) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const hw = await prisma.homework.findFirst({
    where: { id: homeworkId, therapistId: ts.therapistId },
  });
  if (!hw) return NextResponse.json({ error: "없는 숙제입니다" }, { status: 404 });

  await prisma.homework.update({ where: { id: homeworkId }, data: { status } });
  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/center/homework
 * body: { homeworkId }
 */
export async function DELETE(request: NextRequest) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { homeworkId } = await request.json();
  await prisma.homework.deleteMany({
    where: { id: homeworkId, therapistId: ts.therapistId },
  });
  return NextResponse.json({ success: true });
}
