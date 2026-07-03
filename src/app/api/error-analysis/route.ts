import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from '@/lib/prisma';
import { analyzeError } from '@/lib/jamo-analysis';
import { auth } from '@/lib/auth';
import {
  validateKoreanWord,
  computePhonemeSimilarity,
  syllableLengthDiff,
} from '@/lib/korean-input-validation';
import {
  getChildAgeMonths,
  getDevelopmentalStatus,
  getDevelopmentalDisplay,
} from '@/lib/developmental-norms';

// 발음 변형이 아니라 완전히 다른 단어로 판정하는 기준
const MIN_PHONEME_SIMILARITY = 0.4;  // 공통 자모 40% 미만이면 다른 단어
const MAX_SYLLABLE_DIFF = 1;          // 음절 수 2 이상 차이나면 다른 단어

// ─── WeakPhoneme 자동 집계 ────────────────────────────────────────────────────

function getWeaknessLevel(
  errorRate: number,
  totalRecords: number,
  ageMonths: number | null,
  phoneme: string,
): string {
  // 🌱 발달 규준 게이트: 아직 습득 시기가 안 된 소리는 오류율이 높아도
  //    "집중교정필요"로 올리지 않는다 (발달상 정상 → 부모 불안 방지).
  const status = getDevelopmentalStatus(phoneme, ageMonths);
  if (status === "developing") return "관찰중";                 // 아예 시기 이전 → 상향 금지
  const cap = status === "emerging" ? "꾸준한연습필요" : null;   // 배우는 중 → 집중교정까지는 X

  if (totalRecords < 10) return "관찰중";
  let level: string;
  if (errorRate >= 30) level = "집중교정필요";
  else if (errorRate >= 20) level = "꾸준한연습필요";
  else if (errorRate >= 10) level = "관찰중";
  else level = "정상범위";

  if (cap && level === "집중교정필요") return cap;
  return level;
}

async function recalculateWeakPhonemes(
  childId: string,
  ageMonths: number | null,
  latestTargetJamo?: string,
) {
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

  // 모든 음소를 단일 트랜잭션으로 병렬 upsert — 직렬 await 보다 N배 빠름
  const upserts = Object.entries(phonemeCounts).map(([phoneme, errorCount]) => {
    const errorRate = (errorCount / totalRecords) * 100;
    const weaknessLevel = getWeaknessLevel(errorRate, totalRecords, ageMonths, phoneme);
    return prisma.weakPhoneme.upsert({
      where: { childId_phoneme: { childId, phoneme } },
      create: { childId, phoneme, totalAttempts: totalRecords, errorCount, errorRate, weaknessLevel },
      update: { totalAttempts: totalRecords, errorCount, errorRate, weaknessLevel },
    });
  });
  if (upserts.length > 0) await prisma.$transaction(upserts);
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

    // ─── 발음 변형 vs 완전히 다른 단어 판정 ────────────────────────────────
    const syllableDiff = syllableLengthDiff(targetWord, childPronunciation);
    const similarity = computePhonemeSimilarity(targetWord, childPronunciation);
    if (syllableDiff > MAX_SYLLABLE_DIFF || similarity < MIN_PHONEME_SIMILARITY) {
      return NextResponse.json({
        error: "발음 변형이 아니라 다른 단어로 보여요.",
        hint: "같은 단어를 아이가 다르게 발음한 경우만 분석할 수 있어요. 목표 단어와 아이 발음이 너무 달라서, 혹시 목표 단어를 잘못 적으신 건 아닌지 확인해 주세요.",
        tooDifferent: true,
      }, { status: 400 });
    }

    // 로컬 자모 분해 분석 (즉시)
    const localAnalysis = analyzeError(targetWord, childPronunciation);
    const localAnalysisTyped = localAnalysis as Record<string, unknown>;

    // 목표 음소 추출 (발달 규준 게이트·약점 집계 공용)
    const targetJamoRaw = localAnalysisTyped.targetJamo as string | undefined;
    const targetPhoneme = targetJamoRaw && targetJamoRaw !== "(없음)" ? targetJamoRaw : null;

    // ── 게스트: 분석만 반환, DB 저장 안 함 ──────────────────────────────────
    // (게스트는 아이 나이 정보가 없어 발달 상태는 unknown → 게이트 미적용)
    const isGuest = session.user.isGuest === true;
    if (isGuest) {
      return NextResponse.json({
        success: true,
        isGuest: true,
        errorRecordId: null,
        errorCategory: (localAnalysisTyped.errorCategory as string) || "미판정",
        errorPattern: (localAnalysisTyped.errorPattern as string) || "미판정",
        developmental: getDevelopmentalDisplay("unknown", targetPhoneme),
        localAnalysis: {
          detectedPattern: localAnalysis.errorType,
          confidence: (localAnalysisTyped.confidence as number) || 0,
          requiresGemini: (localAnalysisTyped.requiresGemini as boolean) || false,
          parentHint: (localAnalysisTyped.parentHint as string) || "",
          description: (localAnalysisTyped.description as string) || "",
        },
      }, { status: 200 });
    }

    // ── 회원: DB 저장 ───────────────────────────────────────────────────────
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) return NextResponse.json({ error: "해당 아이를 찾을 수 없습니다" }, { status: 404 });
    if (child.userId !== session.user.id) return NextResponse.json({ error: "접근 권한이 없습니다" }, { status: 403 });

    // 🌱 발달 규준 게이트: 아이 나이(개월) × 목표 음소 습득 시기 비교
    const ageMonths = getChildAgeMonths(child.birthDate);
    const developmentalStatus = getDevelopmentalStatus(targetPhoneme, ageMonths);

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
    const phoneme = targetPhoneme ?? "미분류";

    // 응답 전송 후에도 백그라운드 작업 보장 — serverless 컨테이너 종료 방지
    after(async () => {
      const results = await Promise.allSettled([
        recalculateWeakPhonemes(childId, ageMonths, targetPhoneme ?? undefined),
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
      for (const r of results) {
        if (r.status === "rejected") console.error("[error-analysis bg]", r.reason);
      }
    });

    // 로컬 분석 결과만 즉시 반환
    return NextResponse.json({
      success: true,
      errorRecordId: errorRecord.id,
      errorCategory: errorRecord.errorCategory,
      errorPattern: errorRecord.errorPattern,
      developmental: getDevelopmentalDisplay(developmentalStatus, targetPhoneme),
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

    const body = await request.json();
    const { errorRecordId, childId } = body;

    // 전체 초기화: childId만 전달하면 해당 아이의 모든 기록 삭제
    if (childId && !errorRecordId) {
      const child = await prisma.child.findUnique({ where: { id: childId }, select: { userId: true } });
      if (!child || child.userId !== session.user.id) {
        return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
      }
      const { count } = await prisma.errorRecord.deleteMany({ where: { childId } });
      return NextResponse.json({ success: true, deleted: count });
    }

    if (!errorRecordId) {
      return NextResponse.json({ error: "errorRecordId 또는 childId 필수" }, { status: 400 });
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
