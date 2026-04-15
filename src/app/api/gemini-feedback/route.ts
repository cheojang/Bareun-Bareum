import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getGeminiFeedback } from '@/lib/gemini-client';
import { auth } from '@/lib/auth';

/**
 * POST /api/gemini-feedback
 * 로컬 분석 완료 후 Gemini 처방전을 별도로 요청
 * body: { errorRecordId }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { errorRecordId } = await request.json();
    if (!errorRecordId) {
      return NextResponse.json({ error: "errorRecordId 필수" }, { status: 400 });
    }

    // ErrorRecord + 소유권 확인
    const errorRecord = await prisma.errorRecord.findUnique({
      where: { id: errorRecordId },
      include: {
        localAnalysis: true,
        child: true,
        geminiFeedback: true,
      },
    });

    if (!errorRecord) return NextResponse.json({ error: "기록을 찾을 수 없습니다" }, { status: 404 });
    if (errorRecord.child.userId !== session.user.id) return NextResponse.json({ error: "접근 권한이 없습니다" }, { status: 403 });

    // 이미 Gemini 결과가 있으면 재사용
    if (errorRecord.geminiFeedback) {
      const fb = errorRecord.geminiFeedback;
      return NextResponse.json({
        success: true,
        rootCause: fb.rootCause,
        trainingSteps: [fb.trainingStep1, fb.trainingStep2, fb.trainingStep3, fb.trainingStep4],
        recommendedWords: JSON.parse(fb.recommendedWords),
        parentMessage: fb.parentMessage,
      });
    }

    // 로컬 분석 힌트 추출
    let parentHint = "";
    let description = "";
    if (errorRecord.localAnalysis?.jamoBreakdown) {
      try {
        const bd = JSON.parse(errorRecord.localAnalysis.jamoBreakdown) as {
          analysis?: { parentHint?: string; description?: string };
        };
        parentHint = bd.analysis?.parentHint || "";
        description = bd.analysis?.description || "";
      } catch { /* skip */ }
    }

    // Gemini 호출
    const geminiResult = await getGeminiFeedback(
      errorRecord.targetWord,
      errorRecord.childPronunciation,
      errorRecord.errorType,
      errorRecord.errorCategory,
      errorRecord.child,
      false,
      parentHint,
      description
    );

    if (!geminiResult || !geminiResult.success) {
      return NextResponse.json({ error: "AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
    }

    // DB 저장
    const saved = await prisma.geminiFeedback.create({
      data: {
        errorRecordId,
        rootCause: geminiResult.rootCause,
        trainingStep1: geminiResult.trainingStep1,
        trainingStep2: geminiResult.trainingStep2,
        trainingStep3: geminiResult.trainingStep3,
        trainingStep4: geminiResult.trainingStep4,
        recommendedWords: JSON.stringify(geminiResult.recommendedWords || []),
        parentMessage: geminiResult.parentMessage || "",
      }
    });

    return NextResponse.json({
      success: true,
      rootCause: saved.rootCause,
      trainingSteps: [saved.trainingStep1, saved.trainingStep2, saved.trainingStep3, saved.trainingStep4],
      recommendedWords: JSON.parse(saved.recommendedWords),
      parentMessage: saved.parentMessage,
    });

  } catch (error) {
    console.error("Error in /api/gemini-feedback:", error);
    return NextResponse.json({ error: "AI 분석 중 오류가 발생했습니다" }, { status: 500 });
  }
}
