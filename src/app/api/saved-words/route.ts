import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireChildOwner, apiErrorResponse } from "@/lib/api-auth";

/**
 * POST /api/saved-words
 * 부모가 연습 카드의 저장 버튼을 누른 단어를 SavedWord에 저장 (수동)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { childId, word, targetPhoneme, difficulty } = await request.json();

    if (!word) {
      return NextResponse.json({ error: "word 필수" }, { status: 400 });
    }
    // 문장(공백 포함)은 저장 불가 — 단어만 저장
    if (word.trim().includes(" ")) {
      return NextResponse.json(
        { error: "단어만 저장할 수 있어요. 문장은 저장되지 않아요." },
        { status: 400 }
      );
    }

    await requireChildOwner(childId, userId);

    const saved = await prisma.savedWord.upsert({
      where: { childId_word: { childId, word } },
      create: {
        childId,
        word,
        targetPhoneme: targetPhoneme ?? "연습",
        difficulty: difficulty ?? "medium",
      },
      update: {
        targetPhoneme: targetPhoneme ?? "연습",
        difficulty: difficulty ?? "medium",
        savedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, savedWordId: saved.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

/**
 * GET /api/saved-words?childId=xxx
 * 저장된 단어 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const childId = new URL(request.url).searchParams.get("childId");
    await requireChildOwner(childId, userId);

    const savedWords = await prisma.savedWord.findMany({
      where: { childId: childId! },
      orderBy: { savedAt: "desc" },
    });

    return NextResponse.json(savedWords);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

/**
 * DELETE /api/saved-words
 * - 쿼리 ?childId=&word= : 해당 단어 1개만 저장 해제
 * - body { childId }     : 해당 아이의 저장 단어 전체 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const url = new URL(request.url);
    const qChildId = url.searchParams.get("childId");
    const qWord = url.searchParams.get("word");

    // 단일 단어 저장 해제
    if (qWord) {
      await requireChildOwner(qChildId, userId);
      await prisma.savedWord.deleteMany({ where: { childId: qChildId!, word: qWord } });
      return NextResponse.json({ success: true, deleted: 1 });
    }

    // 전체 삭제 (body)
    const { childId } = await request.json();
    await requireChildOwner(childId, userId);
    const { count } = await prisma.savedWord.deleteMany({ where: { childId } });
    return NextResponse.json({ success: true, deleted: count });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
