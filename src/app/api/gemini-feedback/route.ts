import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getGeminiFeedback } from '@/lib/gemini-client';
import { auth } from '@/lib/auth';

/**
 * errorType + affectedSyllable 정보로 position(초성/어중/종성/중성) 판별
 */
function inferPosition(errorType: string, affectedSyllable: number): string {
  if (/종성/.test(errorType)) return "종성";
  if (/모음/.test(errorType) || /중성/.test(errorType)) return "중성";
  if (affectedSyllable === 0) return "초성";
  return "어중";
}

/**
 * POST /api/gemini-feedback
 * 1순위: PhonemeTemplate DB 조회 → 즉시 반환 (< 10ms)
 * 2순위: Gemini API 호출 → 결과를 Template에 캐시
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

    if (!errorRecord) {
      return NextResponse.json({ error: "기록을 찾을 수 없습니다" }, { status: 404 });
    }
    if (errorRecord.child.userId !== session.user.id) {
      return NextResponse.json({ error: "접근 권한이 없습니다" }, { status: 403 });
    }

    // ─── jamoBreakdown 파싱 → 음소 + 위치 추출 ──────────────────────────────
    let phoneme = "";
    let position = "초성";
    let parentHint = "";
    let description = "";

    if (errorRecord.localAnalysis?.jamoBreakdown) {
      try {
        const bd = JSON.parse(errorRecord.localAnalysis.jamoBreakdown) as {
          analysis?: {
            targetJamo?: string;
            affectedSyllable?: number;
            parentHint?: string;
            description?: string;
          };
        };
        phoneme = bd.analysis?.targetJamo ?? "";
        position = inferPosition(
          errorRecord.errorType,
          bd.analysis?.affectedSyllable ?? 0
        );
        parentHint = bd.analysis?.parentHint ?? "";
        description = bd.analysis?.description ?? "";
      } catch { /* skip */ }
    }

    // ─── 1순위: PhonemeTemplate 조회 ────────────────────────────────────────
    if (phoneme && phoneme !== "(없음)") {
      const template = await prisma.phonemeTemplate.findUnique({
        where: {
          phoneme_position_errorType: {
            phoneme,
            position,
            errorType: errorRecord.errorType,
          },
        },
      });

      if (template) {
        // 기존 GeminiFeedback 레코드가 있으면 재사용, 없으면 생성
        let feedback = errorRecord.geminiFeedback;
        if (!feedback) {
          feedback = await prisma.geminiFeedback.create({
            data: {
              errorRecordId,
              rootCause:       template.rootCause,
              trainingStep1:   template.trainingStep1,
              trainingStep2:   template.trainingStep2,
              trainingStep3:   template.trainingStep3,
              trainingStep4:   template.trainingStep4,
              recommendedWords: template.recommendedWords,
              parentMessage:   template.parentHint,
            },
          });
        }

        let words: string[] = [];
        try { words = JSON.parse(feedback.recommendedWords); } catch { /* skip */ }

        return NextResponse.json({
          success: true,
          source: "template",
          rootCause: feedback.rootCause,
          trainingSteps: [
            feedback.trainingStep1,
            feedback.trainingStep2,
            feedback.trainingStep3,
            feedback.trainingStep4,
          ],
          recommendedWords: words,
          parentMessage: feedback.parentMessage,
        });
      }
    }

    // ─── 2순위: Gemini API 호출 ──────────────────────────────────────────────
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
      const msg = (geminiResult as any)?.errorMessage ?? "AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // 기존 결과 삭제 후 새 결과 저장
    await prisma.geminiFeedback.deleteMany({ where: { errorRecordId } });

    const saved = await prisma.geminiFeedback.create({
      data: {
        errorRecordId,
        rootCause:       geminiResult.rootCause,
        trainingStep1:   geminiResult.trainingStep1,
        trainingStep2:   geminiResult.trainingStep2,
        trainingStep3:   geminiResult.trainingStep3,
        trainingStep4:   geminiResult.trainingStep4,
        recommendedWords: JSON.stringify(geminiResult.recommendedWords ?? []),
        parentMessage:   geminiResult.parentMessage ?? "",
      },
    });

    // 미등록 패턴이면 PhonemeTemplate에 캐시 (다음 동일 패턴 즉시 반환)
    if (phoneme && phoneme !== "(없음)") {
      prisma.phonemeTemplate.upsert({
        where: {
          phoneme_position_errorType: { phoneme, position, errorType: errorRecord.errorType },
        },
        create: {
          phoneme,
          position,
          errorType:     errorRecord.errorType,
          errorCategory: errorRecord.errorCategory,
          exampleTarget: errorRecord.targetWord,
          exampleChild:  errorRecord.childPronunciation,
          parentHint:    geminiResult.parentMessage ?? "",
          rootCause:     geminiResult.rootCause,
          trainingStep1: geminiResult.trainingStep1,
          trainingStep2: geminiResult.trainingStep2,
          trainingStep3: geminiResult.trainingStep3,
          trainingStep4: geminiResult.trainingStep4,
          recommendedWords: JSON.stringify(geminiResult.recommendedWords ?? []),
        },
        update: {},
      }).catch(() => { /* 중복 무시 */ });
    }

    let words: string[] = [];
    try { words = JSON.parse(saved.recommendedWords); } catch { /* skip */ }

    return NextResponse.json({
      success: true,
      source: "gemini",
      rootCause:    saved.rootCause,
      trainingSteps: [saved.trainingStep1, saved.trainingStep2, saved.trainingStep3, saved.trainingStep4],
      recommendedWords: words,
      parentMessage: saved.parentMessage,
    });

  } catch (error) {
    console.error("Error in /api/gemini-feedback:", error);
    return NextResponse.json({ error: "AI 분석 중 오류가 발생했습니다" }, { status: 500 });
  }
}
