export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getGeminiFeedbackStream } from '@/lib/gemini-client';
import { auth } from '@/lib/auth';

// ── 스트리밍 중 완성된 문자열 필드 추출 (안전하게 닫힌 것만) ──────────────
// JSON 모드로 응답하므로 value 내부의 "는 반드시 \"로 escape됨
// 따라서 ([^"\\]|\\.)*로 이스케이프 시퀀스까지 정확히 파싱
const STRING_FIELD_REGEX =
  /"(patternName|rootCause|trainingStep1|trainingStep2|trainingStep3|trainingStep4|parentMessage)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;

function unescapeJsonString(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`);
  } catch {
    return raw;
  }
}

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

    // 월간 제한은 캐시 미스 시에만 적용 (아래 캐시 확인 후)

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

    // ─── 1순위: GeminiFeedback DB 캐시 확인 ──────────────────────────────────
    // 1) 현재 기록에 캐시가 있는지 먼저 확인
    let cachedFeedback = errorRecord.geminiFeedback;

    // 2) 현재 기록에 없다면 동일 아이의 동일 단어/발음 조합 중 결과가 있는 것 검색
    if (!cachedFeedback) {
      const existingRecord = await prisma.errorRecord.findFirst({
        where: {
          childId: errorRecord.childId,
          targetWord: errorRecord.targetWord,
          childPronunciation: errorRecord.childPronunciation,
          geminiFeedback: { isNot: null }
        },
        include: { geminiFeedback: true },
        orderBy: { createdAt: 'desc' }
      });
      if (existingRecord?.geminiFeedback) {
        cachedFeedback = existingRecord.geminiFeedback;
        console.log("[Cache] 동일 패턴 과거 기록 캐시 HIT:", errorRecord.targetWord);
      }
    }

    if (cachedFeedback) {
      const cached = cachedFeedback;
      let recWords: string[] = [];
      try { recWords = JSON.parse(cached.recommendedWords); } catch {}

      return NextResponse.json({
        patternName:      errorRecord.errorPattern,
        rootCause:        cached.rootCause,
        trainingStep1:    cached.trainingStep1,
        trainingStep2:    cached.trainingStep2,
        trainingStep3:    cached.trainingStep3,
        trainingStep4:    cached.trainingStep4,
        recommendedWords: recWords,
        parentMessage:    cached.parentMessage,
        geminiConfidence: 5,
        fromCache:        true,
      });
    }

    // ─── 월간 사용 제한 체크 (캐시 미스 경우에만 적용) ──────────────────────
    const {
      FREE_AI_MONTHLY_LIMIT, GUEST_AI_MONTHLY_LIMIT, GUEST_COOKIE_NAME,
      isUserPremium, countMonthlyGeminiUsage, parseGuestCookie, makeGuestCookieValue,
    } = await import("@/lib/usage-limit");

    const isGuest = session.user.id === "guest";
    let guestCookieHeader: string | null = null;

    if (isGuest) {
      const cookieValue = request.cookies.get(GUEST_COOKIE_NAME)?.value;
      const used = parseGuestCookie(cookieValue);
      if (used >= GUEST_AI_MONTHLY_LIMIT) {
        return NextResponse.json({
          error: `비회원은 AI 분석을 월 ${GUEST_AI_MONTHLY_LIMIT}회까지 이용할 수 있어요. 회원가입하면 월 ${FREE_AI_MONTHLY_LIMIT}회 이용할 수 있어요.`,
          isMonthlyLimitReached: true,
          isGuest: true,
          limit: GUEST_AI_MONTHLY_LIMIT,
          used,
        }, { status: 429 });
      }
      // 쿠키 갱신 헤더 준비 (스트리밍 응답에 첨부)
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);
      guestCookieHeader = `${GUEST_COOKIE_NAME}=${makeGuestCookieValue(used + 1)}; Path=/; SameSite=Lax; Expires=${expires.toUTCString()}`;
    } else {
      const premium = await isUserPremium(session.user.id);
      if (!premium) {
        const used = await countMonthlyGeminiUsage(session.user.id);
        if (used >= FREE_AI_MONTHLY_LIMIT) {
          return NextResponse.json({
            error: `이번 달 AI 분석 횟수(${FREE_AI_MONTHLY_LIMIT}회)를 모두 사용했어요. 다음 달 1일에 초기화돼요. 프리미엄으로 업그레이드하면 무제한으로 이용할 수 있어요.`,
            isMonthlyLimitReached: true,
            limit: FREE_AI_MONTHLY_LIMIT,
            used,
          }, { status: 429 });
        }
      }
    }

    // ─── 2순위: Gemini API 신규 호출 (NDJSON 스트리밍) ───────────────────────
    console.log("[Gemini] 신규 스트리밍 호출:", errorRecord.targetWord);

    let streamResult;
    try {
      streamResult = await getGeminiFeedbackStream(
        errorRecord.targetWord,
        errorRecord.childPronunciation,
        errorRecord.errorType,
        errorRecord.errorCategory,
        errorRecord.child,
        false,
        parentHint,
        description
      );
    } catch (geminiErr: any) {
      console.error("[Gemini] 스트림 시작 실패:", geminiErr.message);
      if (geminiErr.message?.includes('키가 설정되지 않았습니다')) {
        return NextResponse.json({ error: "AI 분석 서비스를 사용할 수 없습니다. 관리자에게 문의하세요." }, { status: 503 });
      }
      if (geminiErr.message?.includes('503') || geminiErr.message?.includes('Service Unavailable')) {
        return NextResponse.json({ error: "AI 서버가 바빠요. 잠시 후 다시 눌러주세요.", isServiceBusy: true }, { status: 503 });
      }
      if (geminiErr.message?.includes('429') || geminiErr.message?.includes('quota')) {
        return NextResponse.json({
          error: "AI 분석 일일 한도에 도달했습니다. 내일 다시 시도해 주세요.",
          isQuotaError: true
        }, { status: 429 });
      }
      return NextResponse.json({ error: "AI 분석 중 오류가 발생했습니다" }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const sentFields = new Set<string>();
    let accumulated = "";

    const stream = new ReadableStream({
      async start(controller) {
        const sendLine = (obj: unknown) => {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        };

        try {
          // ── 스트림 청크 처리: 완성된 필드만 클라이언트에 전송 ──────────
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (!text) continue;
            accumulated += text;

            STRING_FIELD_REGEX.lastIndex = 0;
            let m: RegExpExecArray | null;
            while ((m = STRING_FIELD_REGEX.exec(accumulated)) !== null) {
              const fieldName = m[1];
              if (sentFields.has(fieldName)) continue;
              sentFields.add(fieldName);
              sendLine({
                type: "field",
                field: fieldName,
                value: unescapeJsonString(m[2]),
              });
            }
          }

          // ── 스트림 완료 후 전체 JSON 파싱 ────────────────────────────
          const cleaned = accumulated
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/, "")
            .trim();

          let parsed: any = null;
          try {
            parsed = JSON.parse(cleaned);
            if (typeof parsed === "string") parsed = JSON.parse(parsed);
          } catch (e) {
            console.error("[Gemini] 최종 JSON 파싱 실패:", e);
          }

          if (parsed) {
            // 배열 필드 전송
            if (Array.isArray(parsed.recommendedWords)) {
              sendLine({
                type: "array",
                field: "recommendedWords",
                value: parsed.recommendedWords,
              });
            }

            // ── DB 저장 (비동기, 응답 지연 없음) ──────────────────────
            (async () => {
              try {
                if (parsed.patternName && errorRecord.errorPattern.includes("미등록 패턴")) {
                  await prisma.errorRecord.update({
                    where: { id: errorRecordId },
                    data: { errorPattern: errorRecord.errorPattern.replace("미등록 패턴", parsed.patternName) }
                  });
                }
                await prisma.geminiFeedback.deleteMany({ where: { errorRecordId } });
                await prisma.geminiFeedback.create({
                  data: {
                    errorRecordId,
                    rootCause:        parsed.rootCause ?? "",
                    trainingStep1:    parsed.trainingStep1 ?? "",
                    trainingStep2:    parsed.trainingStep2 ?? "",
                    trainingStep3:    parsed.trainingStep3 ?? "",
                    trainingStep4:    parsed.trainingStep4 ?? "",
                    recommendedWords: JSON.stringify(parsed.recommendedWords ?? []),
                    parentMessage:    parsed.parentMessage ?? "",
                  },
                });

                if (phoneme && phoneme !== "(없음)") {
                  await prisma.phonemeTemplate.upsert({
                    where: { phoneme_position_errorType: { phoneme, position, errorType: errorRecord.errorType } },
                    create: {
                      phoneme, position,
                      errorType:        errorRecord.errorType,
                      errorCategory:    errorRecord.errorCategory,
                      exampleTarget:    errorRecord.targetWord,
                      exampleChild:     errorRecord.childPronunciation,
                      parentHint:       parsed.parentMessage ?? "",
                      rootCause:        parsed.rootCause ?? "",
                      trainingStep1:    parsed.trainingStep1 ?? "",
                      trainingStep2:    parsed.trainingStep2 ?? "",
                      trainingStep3:    parsed.trainingStep3 ?? "",
                      trainingStep4:    parsed.trainingStep4 ?? "",
                      recommendedWords: JSON.stringify(parsed.recommendedWords ?? []),
                    },
                    update: {},
                  }).catch(() => {});
                }
              } catch (saveError) {
                console.error("DB Save Error:", saveError);
              }
            })();
          } else {
            sendLine({ type: "error", error: "응답을 해석하지 못했어요" });
          }

          sendLine({ type: "done" });
          controller.close();
        } catch (err: any) {
          console.error("[Gemini] 스트림 처리 오류:", err);
          const isQuota = err?.message?.includes('429') || err?.message?.includes('quota');
          const isServiceBusy = err?.message?.includes('503') || err?.message?.includes('Service Unavailable');
          try {
            sendLine({
              type: "error",
              error: isQuota
                ? "오늘 AI 분석 한도를 모두 사용했어요"
                : isServiceBusy
                ? "AI 서버가 바빠요. 잠시 후 다시 눌러주세요."
                : "AI 분석 중 오류가 발생했습니다",
              isQuotaError: isQuota,
              isServiceBusy,
            });
          } catch {}
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        ...(guestCookieHeader ? { "Set-Cookie": guestCookieHeader } : {}),
      },
    });

  } catch (error: any) {
    console.error("Critical Error in /api/gemini-feedback:", error);
    return NextResponse.json({ error: "AI 분석 중 오류가 발생했습니다" }, { status: 500 });
  }
}
