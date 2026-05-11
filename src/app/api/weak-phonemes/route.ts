import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { requireUserId, requireChildOwner, apiErrorResponse } from "@/lib/api-auth";

/**
 * GET /api/weak-phonemes?childId=...
 * 누적 약점 음소 분석 결과 조회 (최근 300개 오답 기준)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const childId = request.nextUrl.searchParams.get('childId');
    const child = await requireChildOwner(childId, userId);

    const weakPhonemes = await prisma.weakPhoneme.findMany({
      where: { childId: childId! },
      orderBy: { errorCount: 'desc' },
      take: 10,
    });

    // ✨ Pro Fix 1 & 2: 불필요한 count 쿼리 제거 및 데이터 정합성 보장
    // 이미 백그라운드 집계 시 저장된 정확한 모수(최대 300)를 사용합니다.
    const totalRecords = weakPhonemes.length > 0 ? weakPhonemes[0].totalAttempts : 0;

    // 데이터 품질 메시지
    const dataQuality = getDataQuality(totalRecords);

    return NextResponse.json({
      childName: child.name,
      totalRecords,
      dataQuality,
      // ✨ Pro Fix 3: 수동 타입 지정 제거 (Prisma 자동 타입 추론 활용)
      weakPhonemes: weakPhonemes.map((w) => ({
        phoneme: w.phoneme,
        totalAttempts: w.totalAttempts,
        errorCount: w.errorCount,
        errorRate: Math.round(w.errorRate),
        weaknessLevel: w.weaknessLevel,
      })),
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

function getDataQuality(totalRecords: number): {
  recordCount: number;
  message: string;
  confidence: 'none' | 'low' | 'medium' | 'high';
} {
  if (totalRecords === 0) {
    return {
      recordCount: totalRecords,
      message: '아직 발음 분석 기록이 없어요. 발음 분석을 사용해보세요!',
      confidence: 'none',
    };
  }
  if (totalRecords < 10) {
    return {
      recordCount: totalRecords,
      message: `현재 ${totalRecords}개 기록 중이에요. 10개 이상 입력하면 약점 분석이 시작돼요!`,
      confidence: 'low',
    };
  }
  if (totalRecords < 50) {
    return {
      recordCount: totalRecords,
      message: `${totalRecords}개 기록 기반이에요. 데이터가 쌓일수록 더 정확해져요.`,
      confidence: 'medium',
    };
  }
  return {
    recordCount: totalRecords,
    message: `${totalRecords}개 발음 분석을 실시한 신뢰도 높은 결과예요!`,
    confidence: 'high',
  };
}
