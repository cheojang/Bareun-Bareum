import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRecommendations } from "@/lib/recommendations";
import { PhonemeError } from "@/types/phonetics";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");

  if (!childId) {
    return NextResponse.json({ error: "childId is required" }, { status: 400 });
  }

  // Get recent word records for this child (last 30)
  const recentRecords = await prisma.wordRecord.findMany({
    where: {
      session: { childId },
    },
    orderBy: { practicedAt: "desc" },
    take: 30,
    select: { errorPhonemes: true, targetWord: true },
  });

  const errorHistory = recentRecords.map(
    (r: { errorPhonemes: unknown; targetWord: string }) => (r.errorPhonemes as unknown as PhonemeError[]) ?? []
  );
  const practicedWords = recentRecords.map((r: { errorPhonemes: unknown; targetWord: string }) => r.targetWord);

  const recommendations = getRecommendations(errorHistory, practicedWords, 5);

  return NextResponse.json(recommendations);
}
