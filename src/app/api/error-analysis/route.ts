import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { analyzeError } from '@/lib/jamo-analysis';
import { auth } from '@/lib/auth';
import { validateKoreanWord } from '@/lib/korean-input-validation';

// ─── WeakPhoneme 자동 집계 ────────────────────────────────────────────────────

function getWeaknessLevel(errorRate: number, totalRecords: number): string {
  if (totalRecords < 10) return "관찰중";
  if (errorRate >= 30) return "집중교정필요";
  if (errorRate >= 20) return "꾸준한연습필요";
  if (errorRate >= 10) return "관찰중";
  return "정상범위";
}

async function recalculateWeakPhonemes(childId: string, latestTargetJamo?: string) {
  const records = await prisma.errorRecord.findMany({
    where: { childId },
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { localAnalysis: true },
  });

  const totalRecords = records.length;
  if (totalRecords === 0) return;

  const phonemeCounts: Record<string, number> = {};
  for (const record of records) {
    let targetJamo: string | null = null;
    if (record.localAnalysis?.jamoBreakdown) {
      try {
        const bd = JSON.parse(record.localAnalysis.jamoBreakdown) as {
          analysis?: { targetJamo?: string };
        };
        targetJamo = bd.analysis?.targetJamo ?? null;
      } catch { /* skip */ }
    }
    if (!targetJamo && record.id === records[0].id && latestTargetJamo) {
      targetJamo = latestTargetJamo;
    }
    if (targetJamo && targetJamo !== "(없음)") {
      phonemeCounts[targetJamo] = (phonemeCounts[targetJamo] ?? 0) + 1;
    }
  }

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
 * 로컬 자모 분석만 수행 → 즉시 반환 (< 200ms)
 * Gemini 처방전은 /api/gemini-feedback 에서 별도 요청
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, targetWord, childPronunciation } = body;

    if (!childId || !targetWord || !childPronunciation) {
      return NextResponse.json({ error: "childId, targetWord, childPronunciation 필수" }, { status: 400 });
    }

    const targetErr = validateKoreanWord(targetWord);
    if (targetErr) return NextResponse.json({ error: `목표 단어: ${targetErr}` }, { status: 400 });

    const childErr = validateKoreanWord(childPronunciation);
    if (childErr) return NextResponse.json({ error: `아이 발음: ${childErr}` }, { status: 400 });

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) return NextResponse.json({ error: "해당 아이를 찾을 수 없습니다" }, { status: 404 });
    if (child.userId !== session.user.id) return NextResponse.json({ error: "접근 권한이 없습니다" }, { status: 403 });

    // 로컬 자모 분해 분석 (즉시)
    const localAnalysis = analyzeError(targetWord, childPronunciation);
    const localAnalysisTyped = localAnalysis as Record<string, unknown>;

    // ErrorRecord + LocalAnalysis 저장
    const errorRecord = await prisma.errorRecord.create({
      data: {
        childId,
        targetWord,
        childPronunciation,
        errorType: localAnalysis.errorType,
        errorCategory: (localAnalysisTyped.errorCategory as string) || "미판정",
        errorPattern: (localAnalysisTyped.errorPattern as string) || "미판정",
        localAnalysis: {
          create: {
            detectedPattern: localAnalysis.errorType,
            jamoBreakdown: JSON.stringify({
              target: targetWord,
              child: childPronunciation,
              analysis: localAnalysis,
            }),
            confidence: (localAnalysisTyped.confidence as number) || 0,
            requiresGemini: (localAnalysisTyped.requiresGemini as boolean) || false,
          }
        }
      },
      include: { localAnalysis: true }
    });

    // WeakPhoneme + ReviewSchedule (백그라운드, 응답 지연 없이)
    const targetJamo = localAnalysisTyped.targetJamo as string | undefined;
    const phoneme = targetJamo && targetJamo !== "(없음)" ? targetJamo : "미분류";

    Promise.allSettled([
      recalculateWeakPhonemes(childId, targetJamo),
      prisma.reviewSchedule.create({
        data: {
          childId,
          errorRecordId: errorRecord.id,
          targetWord,
          childPronunciation,
          phoneme,
          errorPattern: errorRecord.errorPattern,
          nextReviewAt: new Date(),
        },
      }),
    ]);

    // 로컬 분석 결과만 즉시 반환
    return NextResponse.json({
      success: true,
      errorRecordId: errorRecord.id,
      errorCategory: errorRecord.errorCategory,
      errorPattern: errorRecord.errorPattern,
      localAnalysis: {
        detectedPattern: errorRecord.localAnalysis?.detectedPattern,
        confidence: errorRecord.localAnalysis?.confidence,
        requiresGemini: errorRecord.localAnalysis?.requiresGemini,
        parentHint: (localAnalysisTyped.parentHint as string) || "",
        description: (localAnalysisTyped.description as string) || "",
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Error in /api/error-analysis:", error);
    return NextResponse.json({ error: "오답 분석 중 오류가 발생했습니다" }, { status: 500 });
  }
}

/**
 * DELETE /api/error-analysis
 * 오답 기록 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { errorRecordId } = await request.json();
    if (!errorRecordId) {
      return NextResponse.json({ error: "id 필수" }, { status: 400 });
    }

    const record = await prisma.errorRecord.findUnique({
      where: { id: errorRecordId },
      include: { child: true }
    });

    if (!record) return NextResponse.json({ error: "기록을 찾을 수 없습니다" }, { status: 404 });
    if (record.child.userId !== session.user.id) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

    await prisma.errorRecord.delete({ where: { id: errorRecordId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting record:", err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
