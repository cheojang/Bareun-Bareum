import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/saved-words
 * 아이연습에서 5회 완료한 단어를 SavedWord에 저장
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { childId, word, targetPhoneme, difficulty } = body;

    if (!childId || !word) {
      return NextResponse.json(
        { error: "childId, word 필수" },
        { status: 400 }
      );
    }

    // 아이가 해당 유저 소유인지 확인
    const child = await prisma.child.findFirst({
      where: { id: childId, userId: session.user.id },
    });
    if (!child) {
      return NextResponse.json({ error: "아이를 찾을 수 없습니다" }, { status: 404 });
    }

    // upsert: 이미 저장된 단어면 업데이트, 없으면 생성
    const saved = await prisma.savedWord.upsert({
      where: {
        childId_word: { childId, word },
      },
      create: {
        childId,
        word,
        targetPhoneme: targetPhoneme ?? "연습",
        difficulty: difficulty ?? "medium",
      },
      update: {
        savedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, savedWordId: saved.id }, { status: 201 });
  } catch (error) {
    console.error("saved-words POST error:", error);
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다" }, { status: 500 });
  }
}

/**
 * GET /api/saved-words?childId=xxx
 * 저장된 단어 목록 조회
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");

  if (!childId) {
    return NextResponse.json({ error: "childId 필수" }, { status: 400 });
  }

  const child = await prisma.child.findFirst({
    where: { id: childId, userId: session.user.id },
  });
  if (!child) {
    return NextResponse.json({ error: "아이를 찾을 수 없습니다" }, { status: 404 });
  }

  const savedWords = await prisma.savedWord.findMany({
    where: { childId },
    orderBy: { savedAt: "desc" },
  });

  return NextResponse.json(savedWords);
}
