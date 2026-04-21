import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/parent/messages?childId=xxx
 * 부모가 해당 아이 담당 치료사와의 메시지 조회
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

  // 담당 치료사 확인
  const assignment = await prisma.therapistChild.findFirst({
    where: { childId },
    include: { therapist: { select: { id: true, name: true } } },
  });
  if (!assignment) {
    return NextResponse.json({ messages: [], therapist: null });
  }

  const messages = await prisma.message.findMany({
    where: {
      therapistId: assignment.therapistId,
      parentId: session.user.id,
      childId,
    },
    orderBy: { sentAt: "asc" },
    take: 100,
  });

  // 읽음 처리 (부모가 조회할 때 치료사 메시지 읽음)
  await prisma.message.updateMany({
    where: {
      therapistId: assignment.therapistId,
      parentId: session.user.id,
      childId,
      senderRole: "therapist",
      isRead: false,
    },
    data: { isRead: true },
  });

  return NextResponse.json({
    messages,
    therapist: {
      id: assignment.therapistId,
      name: assignment.therapist.name,
    },
  });
}

/**
 * POST /api/parent/messages
 * 부모 → 치료사 메시지 전송
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { childId, content } = await request.json();
  if (!childId || !content?.trim()) {
    return NextResponse.json({ error: "childId, content 필수" }, { status: 400 });
  }

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "접근 권한 없음" }, { status: 403 });
  }

  const assignment = await prisma.therapistChild.findFirst({ where: { childId } });
  if (!assignment) {
    return NextResponse.json({ error: "담당 치료사가 없습니다" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      therapistId: assignment.therapistId,
      parentId: session.user.id,
      childId,
      content: content.trim(),
      senderRole: "parent",
    },
  });

  return NextResponse.json(message);
}
