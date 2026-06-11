/**
 * 단어 이미지 생성 스크립트 (아동용 귀여운 일러스트)
 * 실행: npx tsx scripts/generate-word-images.ts
 *
 * - WORD_IMAGE_SLUGS(src/lib/word-images.ts)를 순회
 * - 이미 /public/images/words/{slug}.webp 있으면 건너뜀 (idempotent)
 * - Gemini 이미지 생성 → sharp로 512×512 webp(흰배경) 변환 후 저장
 * - 배치 처리 + 딜레이로 Rate Limit 회피
 *
 * 사전조건:
 *   - .env.local 의 GEMINI_API_KEY (이미지 생성 권한 필요)
 *   - npm install (sharp 포함)
 *
 * ⚠️ 모델 ID는 계정/리전에 따라 다를 수 있음. IMAGE_MODEL 상수를 확인/조정하세요.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WORD_IMAGE_SLUGS } from "../src/lib/word-images";
import { getWordByText } from "../src/lib/word-database";

// ── 설정 ─────────────────────────────────────────────────────────────────────
const IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation"; // 필요 시 조정
const OUT_DIR = join(process.cwd(), "public", "images", "words");
const SIZE = 512;          // 저장 해상도(정사각)
const WEBP_QUALITY = 80;
const BATCH_SIZE = 4;      // 동시 호출 수
const DELAY_MS = 2000;     // 배치 간 대기
const MAX_RETRY = 2;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY 가 .env.local 에 없습니다.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);

// ── 일관된 귀여운 스타일 프롬프트 ───────────────────────────────────────────
function buildPrompt(word: string, sentence?: string): string {
  const ctx = sentence ? ` (맥락: "${sentence}")` : "";
  return [
    `Create a single cute illustration of "${word}"${ctx} for a Korean toddler (age 3-5).`,
    "Style: flat vector, thick rounded outlines, soft pastel colors (peach, mint, cream),",
    "friendly and simple, one centered object only, plain solid white background,",
    "no text, no letters, no words, no border. Square composition.",
  ].join(" ");
}

// ── Gemini 이미지 1장 생성 → Buffer(webp) ───────────────────────────────────
async function generateOne(word: string, sentence?: string): Promise<Buffer | null> {
  const model = genAI.getGenerativeModel({
    model: IMAGE_MODEL,
    // @ts-expect-error responseModalities는 이미지 생성 전용 옵션
    generationConfig: { responseModalities: ["Image", "Text"] },
  });

  const res = await model.generateContent(buildPrompt(word, sentence));
  const parts = res.response.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    const data = (p as { inlineData?: { data?: string } }).inlineData?.data;
    if (data) {
      const raw = Buffer.from(data, "base64");
      return await sharp(raw)
        .resize(SIZE, SIZE, { fit: "cover" })
        .flatten({ background: "#ffffff" })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
    }
  }
  return null;
}

async function withRetry(word: string, sentence?: string): Promise<Buffer | null> {
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const buf = await generateOne(word, sentence);
      if (buf) return buf;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`  ⚠ ${word} 시도 ${attempt + 1} 실패: ${msg}`);
    }
    if (attempt < MAX_RETRY) await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  return null;
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const entries = Object.entries(WORD_IMAGE_SLUGS);
  let done = 0, skipped = 0, failed = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async ([word, slug]) => {
        const outPath = join(OUT_DIR, `${slug}.webp`);
        if (existsSync(outPath)) { skipped++; return; }

        const sentence = getWordByText(word)?.sampleSentence;
        const buf = await withRetry(word, sentence);
        if (buf) {
          writeFileSync(outPath, buf);
          done++;
          console.log(`  ✓ ${word} → ${slug}.webp (${(buf.length / 1024).toFixed(1)}KB)`);
        } else {
          failed++;
          console.error(`  ✗ ${word} 실패`);
        }
      }),
    );
    if (i + BATCH_SIZE < entries.length) await new Promise((r) => setTimeout(r, DELAY_MS));
    console.log(`진행: ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length}`);
  }

  console.log(`\n완료 — 생성 ${done} · 건너뜀 ${skipped} · 실패 ${failed}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
