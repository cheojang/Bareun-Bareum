import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");

  const bookmarks = await prisma.wordRecord.findMany({
    where: {
      isBookmarked: true,
      session: childId
        ? { childId, userId: session.user.id }
        : { userId: session.user.id },
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
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { wordRecordId, isBookmarked } = await req.json();

  // Verify ownership
  const record = await prisma.wordRecord.findFirst({
    where: {
      id: wordRecordId,
      session: { userId: session.user.id },
    },
  });

  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.wordRecord.update({
    where: { id: wordRecordId },
    data: { isBookmarked },
  });

  return NextResponse.json(updated);
}
