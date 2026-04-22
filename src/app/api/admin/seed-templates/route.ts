import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PHONEME_COMBINATIONS, type TemplateCombination } from "@/data/phoneme-combinations";
import { isAdmin } from "@/lib/admin-auth";

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY 없음");
  return new GoogleGenerativeAI(key);
}

function buildPrompt(combo: TemplateCombination) {
  return `당신은 15년 경력의 아동 언어재활사입니다.
아래 음소 오류 패턴에 대해 가정 내 훈련법(Home-T)을 JSON 형식으로 작성하세요.

오류 정보:
- 음소: ${combo.phoneme}
- 위치: ${combo.position}
- 오류유형: ${combo.errorType} (${combo.errorCategory})
- 예시 목표 단어: ${combo.exampleTarget}
- 예시 아이 발음: ${combo.exampleChild}

다음 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이):
{
  "parentHint": "부모가 아이에게 바로 말해줄 수 있는 한 줄 힌트",
  "rootCause": "조음 발달 원인 설명 200~300자",
  "trainingStep1": "【1단계: 조음 감각 깨우기】구체적 활동 2~3문장",
  "trainingStep2": "【2단계: 소리 느끼기】거울·촉각 활용 2~3문장",
  "trainingStep3": "【3단계: 음절/단어로 연결하기】연습 단어 포함 2~3문장",
  "trainingStep4": "【4단계: 일상에서 적용하기】놀이 연계 2~3문장",
  "recommendedWords": ["연습 단어 8~10개"]
}`;
}

/**
 * GET /api/admin/seed-templates
 * 현재 시드 진행 상황 조회
 */
export async function GET(_: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const done = await prisma.phonemeTemplate.count();
  return NextResponse.json({
    total: PHONEME_COMBINATIONS.length,
    done,
    remaining: PHONEME_COMBINATIONS.length - done,
  });
}

/**
 * POST /api/admin/seed-templates
 * body: { limit?: number }  — 한 번 호출로 처리할 최대 항목 수 (기본 20)
 *
 * Vercel 함수 타임아웃(60s)을 감안해 소량씩 호출하도록 설계.
 * 관리자 페이지에서 반복 호출해 전체 300개를 채웁니다.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const limit: number = Math.min(Number(body.limit) || 20, 50);

    const genai = getGenAI();
    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 이미 완료된 조합 조회
    const existing = await prisma.phonemeTemplate.findMany({
      select: { phoneme: true, position: true, errorType: true },
    });
    const existingSet = new Set(
      existing.map((e) => `${e.phoneme}|${e.position}|${e.errorType}`)
    );

    // 미완료 항목 추출
    const pending = PHONEME_COMBINATIONS.filter(
      (c) => !existingSet.has(`${c.phoneme}|${c.position}|${c.errorType}`)
    ).slice(0, limit);

    if (pending.length === 0) {
      return NextResponse.json({ message: "모든 템플릿이 이미 생성되어 있습니다", done: existing.length });
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const combo of pending) {
      try {
        const raw = await model.generateContent(buildPrompt(combo));
        const text = raw.response.text()
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
        const parsed = JSON.parse(text);

        await prisma.phonemeTemplate.upsert({
          where: {
            phoneme_position_errorType: {
              phoneme: combo.phoneme,
              position: combo.position,
              errorType: combo.errorType,
            },
          },
          create: {
            phoneme:         combo.phoneme,
            position:        combo.position,
            errorType:       combo.errorType,
            errorCategory:   combo.errorCategory,
            exampleTarget:   combo.exampleTarget,
            exampleChild:    combo.exampleChild,
            parentHint:      String(parsed.parentHint    ?? ""),
            rootCause:       String(parsed.rootCause     ?? ""),
            trainingStep1:   String(parsed.trainingStep1 ?? ""),
            trainingStep2:   String(parsed.trainingStep2 ?? ""),
            trainingStep3:   String(parsed.trainingStep3 ?? ""),
            trainingStep4:   String(parsed.trainingStep4 ?? ""),
            recommendedWords: JSON.stringify(
              Array.isArray(parsed.recommendedWords) ? parsed.recommendedWords : []
            ),
          },
          update: {},
        });
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`${combo.phoneme}/${combo.position}/${combo.errorType}: ${(err as Error).message}`);
      }
    }

    const totalDone = existing.length + results.success;
    return NextResponse.json({
      processed: pending.length,
      success: results.success,
      failed: results.failed,
      errors: results.errors,
      totalDone,
      totalRemaining: PHONEME_COMBINATIONS.length - totalDone,
    });
  } catch (error) {
    console.error("[seed-templates]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
