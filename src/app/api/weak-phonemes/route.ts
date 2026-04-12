import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

/**
 * GET /api/weak-phonemes?childId=...
 * 누적 약점 음소 분석 결과 조회 (최근 300개 오답 기준)
 */
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    const childId = request.nextUrl.searchParams.get('childId');

    if (!childId) {
      return NextResponse.json({ error: 'childId 필수' }, { status: 400 });
    }

    // Child 확인
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { id: true, name: true },
    });

    if (!child) {
      return NextResponse.json({ error: '아이를 찾을 수 없습니다' }, { status: 404 });
    }

    // 오답 총 개수
    const totalRecords = await prisma.errorRecord.count({ where: { childId } });

    // WeakPhoneme 조회 (오류 많은 순)
    const weakPhonemes = await prisma.weakPhoneme.findMany({
      where: { childId },
      orderBy: { errorCount: 'desc' },
      take: 10,
    });

    // 데이터 품질 메시지
    const dataQuality = getDataQuality(totalRecords);

    return NextResponse.json({
      childName: child.name,
      totalRecords,
      dataQuality,
      weakPhonemes: weakPhonemes.map((w) => ({
        phoneme: w.phoneme,
        totalAttempts: w.totalAttempts,
        errorCount: w.errorCount,
        errorRate: Math.round(w.errorRate),
        weaknessLevel: w.weaknessLevel,
      })),
    });
  } catch (error) {
    console.error('GET /api/weak-phonemes error:', error);
    return NextResponse.json({ error: '분석 데이터를 가져오지 못했습니다' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
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
      message: '아직 오답 기록이 없어요. 오답 노트를 사용해보세요!',
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
    message: `${Math.min(totalRecords, 300)}개 오답을 분석한 신뢰도 높은 결과예요!`,
    confidence: 'high',
  };
}
