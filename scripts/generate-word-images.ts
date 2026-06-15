/**
 * 단어 이미지 생성 스크립트 — Vertex AI Imagen (아동용 귀여운 일러스트)
 * 실행: npx tsx scripts/generate-word-images.ts
 *
 * - WORD_IMAGE_SLUGS(src/lib/word-images.ts)를 순회
 * - 이미 /public/images/words/{slug}.webp 있으면 건너뜀 (idempotent)
 * - Vertex AI Imagen 이미지 생성 → sharp로 webp(흰배경) 변환 후 저장
 * - 배치 + 딜레이로 Rate Limit 회피, 안전필터 차단 시 마스코트 프롬프트로 재시도
 *
 * 사전조건 (.env.local 또는 환경변수):
 *   GOOGLE_APPLICATION_CREDENTIALS = 서비스 계정 JSON 키 파일 경로
 *   GOOGLE_CLOUD_PROJECT           = GCP 프로젝트 ID (키에 있으면 생략 가능)
 *   GOOGLE_CLOUD_LOCATION          = 리전 (기본 us-central1)
 *   IMAGE_MODEL                    = Imagen 모델 ID (기본 imagen-4.0-generate-001)
 *   npm install (@google/genai, sharp 포함)
 *
 * 비용은 GCP 결제 계정/무료 크레딧에서 차감됨 (AI Studio 키와 별도).
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WORD_IMAGE_SLUGS } from "../src/lib/word-images";

// 영어 시각 설명(글로스) — 있으면 한글 대신 사용해 정확도 향상.
// 파일이 아직 없을 수 있으므로(선행: generate-word-glosses.ts) 안전하게 로드.
let WORD_GLOSS: Record<string, string> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WORD_GLOSS = require("../src/lib/word-image-glosses").WORD_GLOSS ?? {};
} catch { /* 글로스 파일 없으면 한글 폴백 */ }

// ── 설정 ─────────────────────────────────────────────────────────────────────
const IMAGE_MODEL = process.env.IMAGE_MODEL || "imagen-4.0-generate-001";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
const OUT_DIR = join(process.cwd(), "public", "images", "words");
const STORE_SIZE = 1024;    // 저장 해상도(정사각) — 화질 우선
const WEBP_QUALITY = 90;    // webp 품질 (화질 우선)
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 2;   // 동시 호출 수 (quota 회피 위해 낮춤)
const DELAY_MS = Number(process.env.DELAY_MS) || 3000;    // 배치 간 대기
const MAX_RETRY = 2;        // 콘텐츠(안전필터) 재시도 횟수
const QUOTA_RETRY = 8;      // 429(quota) 재시도 횟수
const QUOTA_WAIT_MS = 30000; // 429 시 대기 (지수 증가)

// 프로젝트 ID: 환경변수 우선, 없으면 서비스 계정 키 JSON에서 추출
function resolveProject(): string {
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath && existsSync(keyPath)) {
    try {
      const key = JSON.parse(readFileSync(keyPath, "utf8"));
      if (key.project_id) return key.project_id;
    } catch { /* skip */ }
  }
  return "";
}

const PROJECT = resolveProject();
if (!PROJECT) {
  console.error("GCP 프로젝트 ID를 찾을 수 없습니다. GOOGLE_CLOUD_PROJECT 또는 서비스 계정 키를 설정하세요.");
  process.exit(1);
}

const ai = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });

// ── 단어 종류별 시각적 맥락 (Imagen이 올바른 장면을 생성하도록) ──────────────
// 추상적일 수 있는 단어는 "무엇을 그려야 하는지" 영어 힌트를 명시.
// ⚠️ 사람(특히 아동) 생성은 Imagen 안전필터에 막힐 수 있어 동물 마스코트로 표현.
const WORD_CONTEXT: Record<string, string> = {
  // 색깔 → 대표 오브젝트
  "빨강": "a cute red apple",
  "파랑": "a cute blue water drop",
  "노랑": "a cute yellow baby chick",
  "초록": "a cute green frog",
  "보라": "a cute purple grape cluster",
  "분홍": "a cute pink flower",
  "하양": "a cute white cloud on a light sky background",
  "검정": "a cute black cat",
  "주황": "a cute orange mandarin fruit",
  "회색": "a cute gray elephant",
  "갈색": "a cute brown bear",
  "금색": "a shiny golden star",
  "은색": "a shiny silver moon",
  // 계절
  "봄": "a cheerful spring scene with pink cherry blossom flowers",
  "여름": "a bright summer scene with sun and watermelon",
  "가을": "an autumn scene with red and orange maple leaves falling",
  "겨울": "a winter scene with a smiling snowman and snowflakes",
  // 동사 → 동물 마스코트가 동작 (아동 대신 토끼 캐릭터)
  "웃다": "a cute cartoon bunny laughing with a big bright smile",
  "울다": "a cute cartoon bunny crying with a teardrop",
  "먹다": "a cute cartoon bunny eating from a bowl",
  "자다": "a cute cartoon bunny sleeping peacefully with zzz",
  "걷다": "a cute cartoon bunny walking forward",
  "뛰다": "a cute cartoon bunny running fast with motion lines",
  "앉다": "a cute cartoon bunny sitting down",
  "읽다": "a cute cartoon bunny reading an open picture book",
  "그리다": "a cute cartoon bunny drawing a picture on paper",
  "숨다": "a cute cartoon bunny hiding behind a big tree",
  "보다": "a cute cartoon bunny looking through toy binoculars",
  "듣다": "a cute cartoon bunny listening with a hand behind its ear",
  "쓰다": "a cute cartoon bunny writing with a crayon",
  "잡다": "a cute cartoon bunny catching a butterfly with a net",
  "놀다": "a cute cartoon bunny playing happily with toys",
  "타다": "a cute cartoon bunny riding a bicycle",
  "던지다": "a cute cartoon bunny throwing a ball",
  "받다": "a cute cartoon bunny catching a ball",
  "씻다": "a cute cartoon bunny washing at a sink with bubbles",
  "입다": "a cute cartoon bunny putting on colorful clothes",
  "신다": "a cute cartoon bunny putting on shoes",
  "올라가다": "a cute cartoon bunny climbing up stairs",
  "내려가다": "a cute cartoon bunny sliding down a slide",
  // 동작명사
  "수영": "a cute cartoon bunny swimming with floaties in water",
  "춤": "a cute cartoon bunny dancing with arms raised joyfully",
  "노래": "a cute cartoon bunny singing with musical notes around",
  "세수": "a cute cartoon bunny washing its face with bubbles",
  "달리기": "a cute cartoon bunny sprinting on a race track",
  "요리": "a cute cartoon bunny in a tiny apron stirring a pot",
  "청소": "a cute cartoon bunny sweeping the floor with a broom",
  // 감정 → 표정 (동물 얼굴)
  "행복": "a cute cartoon animal face with a big happy smile and rosy cheeks",
  "슬픔": "a cute cartoon animal face looking sad with a single teardrop",
  "화남": "a cute cartoon animal face with an angry frown",
  "무서움": "a cute cartoon animal face looking scared with wide eyes",
  "신남": "a cute cartoon animal face excited with star-shaped eyes",
  "졸음": "a cute cartoon animal face sleepy with half-closed eyes and zzz",
  "놀람": "a cute cartoon animal face surprised with wide round eyes",
  "부끄러움": "a cute cartoon animal face blushing shyly with rosy cheeks",
  // 날씨
  "비": "a cute rain cloud with raindrops and a small umbrella",
  "바람": "cute wind swirls with leaves blowing and a spinning pinwheel",
  "햇빛": "a cute bright yellow sun with rays and a smiley face",
  "천둥": "a cute storm cloud with a lightning bolt",
  "무지개": "a colorful rainbow arc over fluffy white clouds",
  // 추상어 → 시각 상징
  "사랑": "a big cute red heart with sparkles on a white background",
  "꿈": "a cute crescent moon with a dream bubble of stars and rainbows",
  "재미": "cute colorful balloons and confetti on a white background",
  "소리": "a cute cartoon speaker emitting colorful musical notes",
  "단맛": "a cute colorful lollipop with sparkles",
  // 기타
  "초": "a cute birthday cake with a glowing candle on top",
  "하트": "a big cute pink heart with a happy smiley face",
};

// ── 일관된 귀여운 스타일 프롬프트 ───────────────────────────────────────────
const STYLE = [
  "Style: flat vector illustration, thick rounded outlines, soft pastel colors (peach, mint, cream),",
  "friendly and simple, one single centered subject only, plain solid white background.",
  "ABSOLUTELY NO text, no letters, no words, no numbers, no labels, no captions, no writing on any surface;",
  "keep all surfaces blank. No border, no watermark, no signature.",
  "Square 1:1 composition, high quality, crisp, clean.",
].join(" ");

// 프롬프트 주제 우선순위: 손튜닝 맥락(WORD_CONTEXT) > 영어 글로스 > 한글 폴백
function buildPrompt(word: string): string {
  const subject =
    WORD_CONTEXT[word] ??
    (WORD_GLOSS[word] ? `${WORD_GLOSS[word]}` : `a cute illustration representing "${word}"`);
  return `Create a single cute illustration of ${subject} for a Korean toddler (age 3-5). ${STYLE}`;
}

// 안전필터 차단 시: 사람 표현을 동물 마스코트로 치환해 재시도
function sanitizePrompt(prompt: string): string {
  return prompt
    .replace(/cartoon child(ren)?/gi, "cute cartoon bunny character")
    .replace(/\bchild(ren)?\b/gi, "bunny character")
    .replace(/\bkid(s)?\b/gi, "bunny character")
    .replace(/\bbaby\b/gi, "baby animal");
}

// ── Imagen 이미지 1장 생성 → Buffer(webp) ───────────────────────────────────
async function generateImage(prompt: string): Promise<Buffer | null> {
  const res = await ai.models.generateImages({
    model: IMAGE_MODEL,
    prompt,
    config: { numberOfImages: 1, aspectRatio: "1:1" },
  });
  const b64 = res.generatedImages?.[0]?.image?.imageBytes;
  if (!b64) return null;
  const raw = Buffer.from(b64, "base64");
  return await sharp(raw)
    .resize(STORE_SIZE, STORE_SIZE, { fit: "cover" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

function isQuotaError(msg: string): boolean {
  return /RESOURCE_EXHAUSTED|quota|429/i.test(msg);
}

async function withRetry(word: string): Promise<Buffer | null> {
  const base = buildPrompt(word);
  let contentAttempt = 0;
  let quotaAttempt = 0;

  while (contentAttempt <= MAX_RETRY) {
    // 1차는 원본, 콘텐츠 차단·실패 시 마스코트 프롬프트로 재시도
    const prompt = contentAttempt === 0 ? base : sanitizePrompt(base);
    try {
      const buf = await generateImage(prompt);
      if (buf) return buf;
      console.warn(`  ⚠ ${word} 시도 ${contentAttempt + 1}: 이미지 없음(안전필터 가능)`);
      contentAttempt++;
      await new Promise((r) => setTimeout(r, 1500 * contentAttempt));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // 429(quota): 콘텐츠 시도 카운트 증가 없이 길게 대기 후 같은 요청 재시도
      if (isQuotaError(msg) && quotaAttempt < QUOTA_RETRY) {
        quotaAttempt++;
        const wait = QUOTA_WAIT_MS * Math.min(quotaAttempt, 4); // 30s→120s 상한
        console.warn(`  ⏳ ${word} quota 대기 ${(wait / 1000)}s (${quotaAttempt}/${QUOTA_RETRY})`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      console.warn(`  ⚠ ${word} 시도 ${contentAttempt + 1} 실패: ${msg}`);
      contentAttempt++;
      await new Promise((r) => setTimeout(r, 1500 * contentAttempt));
    }
  }
  return null;
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Imagen 모델: ${IMAGE_MODEL} · 프로젝트: ${PROJECT} · 리전: ${LOCATION}`);

  // LIMIT 환경변수로 부분 실행 가능 (스모크 테스트용): LIMIT=5
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
  const entries = Object.entries(WORD_IMAGE_SLUGS).slice(0, limit);
  let done = 0, skipped = 0, failed = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    let anyGenerated = false;
    await Promise.all(
      batch.map(async ([word, slug]) => {
        const outPath = join(OUT_DIR, `${slug}.webp`);
        if (existsSync(outPath)) { skipped++; return; }

        const buf = await withRetry(word);
        if (buf) {
          writeFileSync(outPath, buf);
          done++;
          anyGenerated = true;
          console.log(`  ✓ ${word} → ${slug}.webp (${(buf.length / 1024).toFixed(1)}KB)`);
        } else {
          failed++;
          console.error(`  ✗ ${word} 실패`);
        }
      }),
    );
    // 스킵만 했다면 딜레이 없이 즉시 다음 배치 (빠른 탐색)
    if (anyGenerated && i + BATCH_SIZE < entries.length) await new Promise((r) => setTimeout(r, DELAY_MS));
    if (i % 200 === 0 || anyGenerated) console.log(`진행: ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length} (신규:${done} 스킵:${skipped})`);
  }

  console.log(`\n완료 — 생성 ${done} · 건너뜀 ${skipped} · 실패 ${failed}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
