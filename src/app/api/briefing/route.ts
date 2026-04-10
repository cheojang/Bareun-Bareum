import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSessionBriefing } from "@/lib/gemini-ai";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  if (!childId) {
    return NextResponse.json({ error: "Missing childId" }, { status: 400 });
  }

  // Fetch recent word records for error pattern analysis
  const recentRecords = await prisma.wordRecord.findMany({
    where: { session: { childId, userId: session.user.id } },
    orderBy: { practicedAt: "desc" },
    take: 30,
    select: { errorPhonemes: true },
  });

  // Count error phoneme frequency
  const errorMap: Record<string, number> = {};
  for (const r of recentRecords) {
    const errors = (r.errorPhonemes as { targetPhoneme: string }[]) ?? [];
    for (const e of errors) {
      errorMap[e.targetPhoneme] = (errorMap[e.targetPhoneme] ?? 0) + 1;
    }
  }

  const topErrors = Object.entries(errorMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([phoneme]) => phoneme);

  const briefing = await generateSessionBriefing(topErrors);

  return NextResponse.json({ briefing, topErrors });
}
