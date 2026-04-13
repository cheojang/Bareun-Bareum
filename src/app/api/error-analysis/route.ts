import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeError } from '@/lib/jamo-analysis';
import { getGeminiFeedback } from '@/lib/gemini-client';
import { auth } from '@/lib/auth';

// ─── WeakPhoneme 자동 집계 ────────────────────────────────────────────────────

function getWeaknessLevel(errorRate: number, totalRecords: number): string {
  if (totalRecords < 10) return '관찰중';
  if (errorRate >= 30) return '집중교정필요';
  if (errorRate >= 20) return '꾸준한연습필요';
  if (errorRate >= 10) return '관찰중';
  return '정상범위';
}

async function recalculateWeakPhonemes(
  childId: string,
  latestTargetJamo?: string
) {
  // 최근 300개 오답 기록 조회
  const records = await prisma.errorRecord.findMany({
    where: { childId },
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: { localAnalysis: true },
  });

  const totalRecords = records.length;
  if (totalRecords === 0) return;

  // 음소별 오류 횟수 집계
  const phonemeCounts: Record<string, number> = {};

  for (const record of records) {
    let targetJamo: string | null = null;

    // jamoBreakdown JSON에서 targetJamo 추출
    if (record.localAnalysis?.jamoBreakdown) {
      try {
        const bd = JSON.parse(record.localAnalysis.jamoBreakdown) as {
          analysis?: { targetJamo?: string };
        };
        targetJamo = bd.analysis?.targetJamo ?? null;
      } catch {
        // JSON 파싱 실패 시 무시
      }
    }

    // 가장 최근 기록은 latestTargetJamo 사용 (DB 반영 전이므로)
    if (!targetJamo && record.id === records[0].id && latestTargetJamo) {
      targetJamo = latestTargetJamo;
    }

    if (targetJamo && targetJamo !== '(없음)') {
      phonemeCounts[targetJamo] = (phonemeCounts[targetJamo] ?? 0) + 1;
    }
  }

  // WeakPhoneme upsert
  for (const [phoneme, errorCount] of Object.entries(phonemeCounts)) {
    const errorRate = (errorCount / totalRecords) * 100;
    const weaknessLevel = getWeaknessLevel(errorRate, totalRecords);

    await prisma.weakPhoneme.upsert({
      where: { childId_phoneme: { childId, phoneme } },
      create: { childId, phoneme, totalAttempts: totalRecords, errorCount, errorRate, weaknessLevel },
      update: { totalAttempts: totalRecords, errorCount, errorRate, weaknessLevel },
    });
  }
}

/**
 * POST /api/error-analysis
 * 오답 입력 → 로컬 분석 → Gemini 호출 (필요시) → 결과 저장
 */
export async function POST(request: NextRequest) {

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { childId, targetWord, childPronunciation } = body;

    // 1. 요청 검증
    if (!childId || !targetWord || !childPronunciation) {
      return NextResponse.json(
        { error: 'childId, targetWord, childPronunciation 필수' },
        { status: 400 }
      );
    }

    // 2. Child 존재 여부 + 소유권 확인
    const child = await prisma.child.findUnique({
      where: { id: childId }
    });

    if (!child) {
      return NextResponse.json(
        { error: '해당 아이를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (child.userId !== session.user.id) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다' },
        { status: 403 }
      );
    }

    // 3. 로컬 자모 분해 분석
    const localAnalysis = analyzeError(targetWord, childPronunciation);

    // 4. ErrorRecord 저장
    const errorRecord = await prisma.errorRecord.create({
      data: {
        childId,
        targetWord,
        childPronunciation,
        errorType: localAnalysis.errorType,
        errorCategory: localAnalysis.errorCategory || '미판정',
        errorPattern: localAnalysis.errorPattern || '미판정',
        // LocalAnalysis는 별도로 저장 (관계 설정)
        localAnalysis: {
          create: {
            detectedPattern: localAnalysis.errorType,
            jamoBreakdown: JSON.stringify({
              target: targetWord,
              child: childPronunciation,
              analysis: localAnalysis
            }),
            confidence: localAnalysis.confidence || 0,
            requiresGemini: localAnalysis.requiresGemini || false
          }
        }
      },
      include: {
        localAnalysis: true
      }
    });

    // 5. Gemini 호출 (동화 오류, 패턴미인식, 복합오류)
    let geminiFeedback = null;
    let isIndividualHabit = false;

    const localAnalysisTyped = localAnalysis as Record<string, unknown>;
    const needsGemini =
      localAnalysis.requiresGemini ||
      localAnalysis.errorType === '복합오류' ||
      localAnalysis.errorType === '패턴미인식';

    if (needsGemini) {
      try {
        const geminiResult = await getGeminiFeedback(
          targetWord,
          childPronunciation,
          localAnalysis.errorType,
          localAnalysis.errorCategory || '미판정',
          child,
          !!(localAnalysisTyped.isUnknownPattern)
        );

        if (geminiResult && geminiResult.success) {
          // 개별 습관 여부 판단
          isIndividualHabit = !!(geminiResult.isIndividualHabit);

          if (isIndividualHabit) {
            // 독특한 개별 습관 → errorRecord 업데이트
            await prisma.errorRecord.update({
              where: { id: errorRecord.id },
              data: {
                errorCategory: '개별습관',
                errorPattern: '독특한 개별 발음 습관',
              }
            });
          }

          geminiFeedback = await prisma.geminiFeedback.create({
            data: {
              errorRecordId: errorRecord.id,
              rootCause: geminiResult.rootCause || '분석할 수 없습니다',
              trainingStep1: geminiResult.trainingStep1 || '단계 정보 없음',
              trainingStep2: geminiResult.trainingStep2 || '단계 정보 없음',
              trainingStep3: geminiResult.trainingStep3 || '단계 정보 없음',
              trainingStep4: geminiResult.trainingStep4 || '단계 정보 없음',
              recommendedWords: JSON.stringify(geminiResult.recommendedWords || []),
              parentMessage: geminiResult.parentMessage || '매일 조금씩 함께 연습하며 아이의 성장을 응원합니다.'
            }
          });
        } else if (!geminiResult || !geminiResult.success) {
          // Gemini도 실패 → 개별 습관으로 분류
          isIndividualHabit = true;
          await prisma.errorRecord.update({
            where: { id: errorRecord.id },
            data: {
              errorCategory: '개별습관',
              errorPattern: '독특한 개별 발음 습관',
            }
          });
        }
      } catch (geminError) {
        console.error('Gemini API error:', geminError);
        // Gemini 에러 발생 시에도 로컬 분석 결과는 반환 (나중에 재시도 가능)
      }
    }

    // 재조회 (개별습관 업데이트 반영)
    const updatedRecord = await prisma.errorRecord.findUnique({
      where: { id: errorRecord.id },
      include: { localAnalysis: true }
    });

    // 6. WeakPhoneme 자동 집계 (백그라운드 처리, 실패해도 응답에 영향 없음)
    const targetJamo = localAnalysisTyped.targetJamo as string | undefined;
    recalculateWeakPhonemes(childId, targetJamo).catch((e) =>
      console.error('WeakPhoneme 집계 오류:', e)
    );

    // 7. 응답 반환
    return NextResponse.json(
      {
        success: true,
        errorRecordId: errorRecord.id,
        errorCategory: updatedRecord?.errorCategory ?? errorRecord.errorCategory,
        errorPattern: updatedRecord?.errorPattern ?? errorRecord.errorPattern,
        isIndividualHabit,
        ...(isIndividualHabit && {
          individualHabitNote: {
            message: '아이만의 독특한 발음 습관이에요!',
            description: '일반적인 조음 발달 패턴으로 분류되지 않는 개성 있는 발음이에요. 아이가 특정 환경이나 상황에서 반복적으로 보이는 패턴인지 관찰하고, 언어재활사 상담을 통해 맞춤 접근법을 찾아보세요.',
            suggestion: '전문가 상담을 통해 아이에게 맞는 개별화된 훈련법을 받아보세요.'
          }
        }),
        localAnalysis: {
          detectedPattern: errorRecord.localAnalysis?.detectedPattern,
          confidence: errorRecord.localAnalysis?.confidence,
          requiresGemini: errorRecord.localAnalysis?.requiresGemini,
          note: localAnalysis.note || '',
          parentHint: localAnalysisTyped.parentHint || '',
          description: localAnalysisTyped.description || ''
        },
        geminiFeedback: geminiFeedback
          ? {
              rootCause: geminiFeedback.rootCause,
              trainingSteps: [
                geminiFeedback.trainingStep1,
                geminiFeedback.trainingStep2,
                geminiFeedback.trainingStep3,
                geminiFeedback.trainingStep4
              ],
              recommendedWords: JSON.parse(geminiFeedback.recommendedWords),
              parentMessage: geminiFeedback.parentMessage || ''
            }
          : null
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in /api/error-analysis:', error);
    return NextResponse.json(
      { error: '오답 분석 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
