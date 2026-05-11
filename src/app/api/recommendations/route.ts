import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRecommendations } from "@/lib/recommendations";
import { PhonemeError } from "@/types/phonetics";
import { requireUserId, apiErrorResponse } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const childId = new URL(req.url).searchParams.get("childId");
    if (!childId) {
      return NextResponse.json({ error: "childId is required" }, { status: 400 });
    }

    // session.userId로 소유권 검증을 where 절에 함께 포함 (childRecord가 없으면 빈 배열)
    const recentRecords = await prisma.wordRecord.findMany({
      where: { session: { childId, userId } },
      orderBy: { practicedAt: "desc" },
      take: 50,
      select: { errorPhonemes: true, targetWord: true },
    });

    // 2. 데이터 가공 및 방어 로직
    const errorHistory = recentRecords.map((r) => {
      // ✨ JSON 타입 캐스팅 및 null 방어
      const errors =
        ((r.errorPhonemes as unknown as PhonemeError[]) || []);
      return errors;
    });

    // 최근에 연습한 단어 리스트 추출 (중복 제거)
    const practicedWords = Array.from(
      new Set(recentRecords.map((r) => r.targetWord))
    );

    // 3. 추천 알고리즘 호출
    const recommendations = getRecommendations(
      errorHistory,
      practicedWords,
      5
    );

    // 4. 결과 반환 및 캐싱 제어
    return NextResponse.json(recommendations, {
      headers: {
        "Cache-Control": "no-store, max-age=0", // 추천은 매번 새로워야 하므로 캐싱 방지
      },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
