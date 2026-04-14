import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/saved-words
 * 아이연습에서 5회 완료한 단어를 SavedWord에 저장
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, word, targetPhoneme, difficulty } = body;

    if (!childId || !word) {
      return NextResponse.json(
        { error: "childId, word 필수" },
        { status: 400 }
      );
    }

    // ✨ 1. findUnique를 사용한 빠른 소유권 확인 (인덱스 활용)
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { userId: true },
    });
    if (!child || child.userId !== session.user.id) {
      return NextResponse.json(
        { error: "아이를 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    // ✨ 2. upsert 로직 보강: 다시 저장될 때도 최신 정보 반영
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
        // 기존 단어를 다시 저장할 때 최신 정보로 갱신
        targetPhoneme: targetPhoneme ?? "연습",
        difficulty: difficulty ?? "medium",
        savedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, savedWordId: saved.id }, { status: 201 });
  } catch (error) {
    console.error("[SavedWords POST Error]:", error);
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다" }, { status: 500 });
  }
}

/**
 * GET /api/saved-words?childId=xxx
 * 저장된 단어 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

    if (!childId) {
      return NextResponse.json({ error: "childId 필수" }, { status: 400 });
    }

    // ✨ 소유권 확인 (findUnique 사용)
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { userId: true },
    });
    if (!child || child.userId !== session.user.id) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    const savedWords = await prisma.savedWord.findMany({
      where: { childId },
      orderBy: { savedAt: "desc" },
    });

    return NextResponse.json(savedWords);
  } catch (error) {
    console.error("[SavedWords GET Error]:", error);
    return NextResponse.json({ error: "조회 중 오류 발생" }, { status: 500 });
  }
}
