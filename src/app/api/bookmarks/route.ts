import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, apiErrorResponse } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const childId = new URL(req.url).searchParams.get("childId");

    const bookmarks = await prisma.wordRecord.findMany({
      where: {
        isBookmarked: true,
        session: childId ? { childId, userId } : { userId },
      },
      orderBy: { practicedAt: "desc" },
      select: {
        id: true,
        targetWord: true,
        heardWord: true,
        errorPhonemes: true,
        isCorrect: true,
        practicedAt: true,
        session: { select: { child: { select: { name: true } } } },
      },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const { wordRecordId, isBookmarked } = await req.json();

    // 소유권 확인 — wordRecord는 session을 통해 user에 연결됨
    const record = await prisma.wordRecord.findFirst({
      where: { id: wordRecordId, session: { userId } },
    });
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.wordRecord.update({
      where: { id: wordRecordId },
      data: { isBookmarked },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
