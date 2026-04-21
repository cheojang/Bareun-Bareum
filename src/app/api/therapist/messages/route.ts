import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTherapistSession } from "@/lib/therapist-auth";

/**
 * GET /api/therapist/messages?childId=xxx
 * 특정 아이 부모와의 메시지 목록
 */
export async function GET(request: NextRequest) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const childId = request.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId 필수" }, { status: 400 });

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { userId: true },
  });
  if (!child) return NextResponse.json({ error: "아이를 찾을 수 없습니다" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { therapistId: ts.therapistId, parentId: child.userId, childId },
    orderBy: { sentAt: "asc" },
    take: 100,
  });

  // 읽음 처리 (치료사가 조회할 때 부모 메시지 읽음 처리)
  await prisma.message.updateMany({
    where: {
      therapistId: ts.therapistId,
      parentId: child.userId,
      childId,
      senderRole: "parent",
      isRead: false,
    },
    data: { isRead: true },
  });

  return NextResponse.json({ messages, parentId: child.userId });
}

/**
 * POST /api/therapist/messages
 * 치료사 → 부모 메시지 전송
 */
export async function POST(request: NextRequest) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { childId, content } = await request.json();
  if (!childId || !content?.trim()) {
    return NextResponse.json({ error: "childId, content 필수" }, { status: 400 });
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { userId: true },
  });
  if (!child) return NextResponse.json({ error: "아이를 찾을 수 없습니다" }, { status: 404 });

  const message = await prisma.message.create({
    data: {
      therapistId: ts.therapistId,
      parentId: child.userId,
      childId,
      content: content.trim(),
      senderRole: "therapist",
    },
  });

  return NextResponse.json(message);
}
