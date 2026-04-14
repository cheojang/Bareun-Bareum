import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRecommendations } from "@/lib/recommendations";
import { PhonemeError } from "@/types/phonetics";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");

    if (!childId) {
      return NextResponse.json(
        { error: "childId is required" },
        { status: 400 }
      );
    }

    // 1. 최근 기록 조회 (최근 50개로 확장하여 중복 추천 방지 강화)
    const recentRecords = await prisma.wordRecord.findMany({
      where: {
        session: {
          childId: childId,
          userId: session.user.id, // ✨ 보안을 위해 userId 소유권 검증 추가
        },
      },
      orderBy: { practicedAt: "desc" }, // 최근 연습 순서로 정렬
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
    console.error("[Recommendations API Error]:", error);
    return NextResponse.json(
      { error: "추천 단어를 가져오지 못했습니다." },
      { status: 500 }
    );
  }
}
