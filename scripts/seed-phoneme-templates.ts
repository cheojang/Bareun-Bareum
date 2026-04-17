/**
 * 음소 패턴 템플릿 300개 시드 스크립트
 * 실행: npx tsx scripts/seed-phoneme-templates.ts
 *
 * - PHONEME_COMBINATIONS(300개)를 순차 처리
 * - 이미 생성된 항목은 건너뜀 (idempotent)
 * - Gemini API로 임상 품질 처방전 생성 후 DB 저장
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PHONEME_COMBINATIONS, type TemplateCombination } from "../src/data/phoneme-combinations";

const prisma = new PrismaClient();
const BATCH_SIZE = 5;      // 동시 병렬 호출 수 (Rate Limit 방지)
const DELAY_MS   = 1200;   // 배치 간 대기 (ms)

// ─── Gemini 초기화 ──────────────────────────────────────────────────────────
function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY 환경변수가 없습니다");
  return new GoogleGenerativeAI(key);
}

// ─── 프롬프트 ────────────────────────────────────────────────────────────────
function buildPrompt(combo: TemplateCombination): string {
  return `당신은 15년 경력의 아동 언어재활사입니다.
아래 음소 오류 패턴에 대해 가정 내 훈련법(Home-T)을 JSON 형식으로 작성하세요.

오류 정보:
- 음소: ${combo.phoneme}
- 위치: ${combo.position} (초성/어중/종성)
- 오류유형: ${combo.errorType} (${combo.errorCategory})
- 예시 목표 단어: ${combo.exampleTarget}
- 예시 아이 발음: ${combo.exampleChild}

다음 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이):
{
  "parentHint": "부모가 아이에게 바로 말해줄 수 있는 한 줄 힌트 (예: '혀를 입천장에 붙이고 말해봐!')",
  "rootCause": "조음 발달 원인 설명 200~300자. 왜 이 오류가 발생하는지 해부학적/감각적으로 설명. 부모가 이해할 수 있는 쉬운 언어 사용.",
  "trainingStep1": "【1단계: 조음 감각 깨우기】\\n준비물이나 몸짓을 활용해 입술·혀·호흡의 위치를 느끼게 하는 구체적 활동. 2~3문장.",
  "trainingStep2": "【2단계: 소리 느끼기】\\n거울이나 촉각을 활용해 소리를 만드는 방법. 단음절 수준. 2~3문장.",
  "trainingStep3": "【3단계: 음절/단어로 연결하기】\\n연습 단어 3~5개와 함께 음절→단어로 확장하는 방법. 2~3문장.",
  "trainingStep4": "【4단계: 일상에서 적용하기】\\n놀이나 일상 대화에서 자연스럽게 연습하는 방법. 2~3문장.",
  "recommendedWords": ["같은 음소가 포함된 연습 단어 8~10개"]
}`;
}

// ─── 단일 항목 생성 ──────────────────────────────────────────────────────────
async function generateTemplate(
  combo: TemplateCombination,
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>
): Promise<{
  parentHint: string;
  rootCause: string;
  trainingStep1: string;
  trainingStep2: string;
  trainingStep3: string;
  trainingStep4: string;
  recommendedWords: string;
}> {
  const result = await model.generateContent(buildPrompt(combo));
  let text = result.response.text()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/,           "")
    .trim();

  const parsed = JSON.parse(text);
  return {
    parentHint:      String(parsed.parentHint      ?? ""),
    rootCause:       String(parsed.rootCause       ?? ""),
    trainingStep1:   String(parsed.trainingStep1   ?? ""),
    trainingStep2:   String(parsed.trainingStep2   ?? ""),
    trainingStep3:   String(parsed.trainingStep3   ?? ""),
    trainingStep4:   String(parsed.trainingStep4   ?? ""),
    recommendedWords: JSON.stringify(
      Array.isArray(parsed.recommendedWords) ? parsed.recommendedWords : []
    ),
  };
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀  음소 템플릿 시드 시작 — 총 ${PHONEME_COMBINATIONS.length}개\n`);

  const genai = getGenAI();
  const model = genai.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // 이미 존재하는 조합 조회
  const existing = await prisma.phonemeTemplate.findMany({
    select: { phoneme: true, position: true, errorType: true },
  });
  const existingSet = new Set(
    existing.map((e) => `${e.phoneme}|${e.position}|${e.errorType}`)
  );
  console.log(`  기존 완료: ${existingSet.size}개 / 남은 작업: ${PHONEME_COMBINATIONS.length - existingSet.size}개\n`);

  let done = 0;
  let skipped = 0;
  let failed = 0;

  // 배치 처리
  for (let i = 0; i < PHONEME_COMBINATIONS.length; i += BATCH_SIZE) {
    const batch = PHONEME_COMBINATIONS.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (combo) => {
        const key = `${combo.phoneme}|${combo.position}|${combo.errorType}`;
        if (existingSet.has(key)) {
          skipped++;
          return;
        }

        try {
          const content = await generateTemplate(combo, model);
          await prisma.phonemeTemplate.upsert({
            where: {
              phoneme_position_errorType: {
                phoneme:   combo.phoneme,
                position:  combo.position,
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
              parentHint:      content.parentHint,
              rootCause:       content.rootCause,
              trainingStep1:   content.trainingStep1,
              trainingStep2:   content.trainingStep2,
              trainingStep3:   content.trainingStep3,
              trainingStep4:   content.trainingStep4,
              recommendedWords: content.recommendedWords,
            },
            update: {},
          });
          done++;
          console.log(`  ✅  [${i + done + skipped + failed}/${PHONEME_COMBINATIONS.length}] ${combo.phoneme} ${combo.position} ${combo.errorType}`);
        } catch (err) {
          failed++;
          console.error(`  ❌  ${combo.phoneme} ${combo.position} ${combo.errorType}:`, (err as Error).message);
        }
      })
    );

    if (i + BATCH_SIZE < PHONEME_COMBINATIONS.length) {
      process.stdout.write(`     ... 잠시 대기 (${DELAY_MS}ms)\r`);
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n🎉  완료 — 신규: ${done}  건너뜀: ${skipped}  실패: ${failed}\n`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
