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
 * jamo-analysis 실제 출력 → phoneme-combinations 등록 후보 목록
 * 단일 IN 쿼리로 처리해 DB 왕복을 최소화
 */
const ERROR_TYPE_ALIASES: Record<string, string[]> = {
  // ── ERROR_PATTERNS 직접 출력 ──
  "파열음의 경음화":           ["경음화"],
  "파열음의 기음화":           ["기음화", "기음감소"],
  "파열음의 치조음화":         ["전방화", "치조음화"],
  "파열음의 연구개음화":       ["후방화", "연구개음화"],
  "마찰음의 파열음화":         ["파열음화"],
  "마찰음의 경음화":           ["경음화", "마찰음강화"],
  "마찰음의 경음화 (쌍시옷)":  ["경음화", "마찰음강화"],
  "마찰음의 연구개음화":       ["후방화"],
  "마찰음 상호교환":           ["파찰음화", "마찰음화"],
  "마찰음 교환 (ㅈ→ㅅ)":      ["마찰음화"],
  "유음의 비음화":             ["비음화"],
  "유음의 파열음화":           ["파열음화"],
  "유음의 경음화":             ["경음화"],
  "유음의 초성탈락":           ["탈락"],
  "양순동화 (파열음→비음)":    ["순음화동화", "비음화동화", "비음화"],
  "양순동화 (비음 상호교환)":  ["순음화동화", "순음화"],
  "양순음의 초성탈락":         ["탈락"],
  "비음의 파열음화":           ["파열음화"],
  "비음의 초성탈락":           ["탈락"],
  "비음의 초성탈락 (ㄴ탈락)":  ["탈락"],
  "비음→파열음 치환 (ㅁ→ㄱ)": ["후방화", "파열음화"],
  "ㅎ의 무성화/탈락":          ["탈락"],
  "ㅎ의 경음화":               ["파열음화"],
  // ── 분기 직접 출력 ──
  "초성탈락":                  ["탈락"],
  "초성첨가":                  ["모음간첨가", "첨가", "어두첨가"],
  "종성탈락":                  ["탈락", "겹받침단순화"],
  "동화":                      ["순음화동화", "연구개음화동화", "비음화동화",
                                 "유음화동화", "치경음화동화"],
  "모음 오류":                  ["모음혼동", "모음단순화"],
  "음절탈락":                  ["음절구조단순화", "탈락"],
  "음절축약":                  ["음절구조단순화", "탈락"],
  "음절첨가":                  ["첨가"],
  // ── getDetailedSubstitutionPattern 출력 (이미 일치하는 것도 포함) ──
  "경음화":    ["경음화"],
  "기음화":    ["기음화", "기음감소"],
  "치조음화":  ["전방화"],
  "연구개음화":["후방화", "연구개음화"],
  "파열음화":  ["파열음화"],
  "비음화":    ["비음화", "비음연구개화", "비음순음화"],
  "탈비음화":  ["파열음화"],
  "유음대치":  ["비음화", "파열음화"],
};

/**
 * errorType 하나에 대해 DB 조회 후보 목록 반환 (중복 제거)
 */
function getErrorTypeCandidates(errorType: string): string[] {
  const aliases = ERROR_TYPE_ALIASES[errorType] ?? [];
  return [...new Set([errorType, ...aliases])];
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
    // jamo-analysis 출력명과 phoneme-combinations 등록명이 다를 수 있으므로
    // 후보 목록 전체를 IN 단일 쿼리로 조회
    if (phoneme && phoneme !== "(없음)") {
      const candidates = getErrorTypeCandidates(errorRecord.errorType);
      const template = await prisma.phonemeTemplate.findFirst({
        where: {
          phoneme,
          position,
          errorType: { in: candidates },
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
