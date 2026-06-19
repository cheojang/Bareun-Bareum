import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSessionBriefing } from "@/lib/gemini-ai";
import { geminiLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/usage-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자별 레이트리밋 — Gemini 비용 버스트 방어
    const limitKey = session.user.isGuest ? `ip:${getClientIp(req)}` : session.user.id;
    if (!geminiLimiter.allow(limitKey)) {
      return NextResponse.json({ error: "요청이 많아요. 잠시 후 다시 시도해주세요." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");
    if (!childId) {
      return NextResponse.json({ error: "Missing childId" }, { status: 400 });
    }

    // Fetch recent word records for error pattern analysis
    const recentRecords = await prisma.wordRecord.findMany({
      where: {
        session: {
          childId: childId,
          userId: session.user.id,
        },
      },
      orderBy: { practicedAt: "desc" },
      take: 30,
      select: { errorPhonemes: true },
    });

    // Count error phoneme frequency (빈 문자열 방어)
    const errorMap: Record<string, number> = {};

    for (const r of recentRecords) {
      const errors = (r.errorPhonemes as { targetPhoneme?: string }[]) ?? [];

      for (const e of errors) {
        // 첨가 오류 등으로 인한 빈 문자열이나 undefined는 통계에서 제외
        if (!e.targetPhoneme || e.targetPhoneme.trim() === "") continue;

        errorMap[e.targetPhoneme] = (errorMap[e.targetPhoneme] ?? 0) + 1;
      }
    }

    // 상위 3개 에러 추출
    const topErrors = Object.entries(errorMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([phoneme]) => phoneme);

    // Gemini AI 브리핑 생성
    const briefing = await generateSessionBriefing(topErrors);

    return NextResponse.json({ briefing, topErrors });
  } catch (error) {
    console.error("[Session Briefing API Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate briefing" },
      { status: 500 }
    );
  }
}
