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

// ── 단어 종류별 시각적 맥락 (Gemini가 올바른 장면을 생성하도록) ──────────────
// 색깔·계절·동사·동작명사·감정처럼 추상적일 수 있는 단어는
// "무엇을 그려야 하는지" 영어 힌트를 명시해 일러스트 품질을 높임
const WORD_CONTEXT: Record<string, string> = {
  // 색깔 → 대표 오브젝트로 표현
  "빨강": "a cute red apple",
  "파랑": "a cute blue water drop or blue ball",
  "노랑": "a cute yellow baby chick",
  "초록": "a cute green frog or green leaf",
  "보라": "a cute purple grape cluster",
  "분홍": "a cute pink flower",
  "하양": "a cute white cloud with a light sky background",
  "검정": "a cute black cat with white outline",
  "주황": "a cute orange mandarin fruit",
  "회색": "a cute gray elephant",
  "갈색": "a cute brown bear",
  "금색": "a shiny golden star",
  "은색": "a shiny silver moon",
  // 계절 → 특징 장면
  "봄": "a cute spring scene with pink cherry blossom flowers",
  "여름": "a cute summer scene with bright sun and watermelon",
  "가을": "a cute autumn scene with red and orange maple leaves falling",
  "겨울": "a cute winter scene with a smiling snowman and snowflakes",
  // 동사 → 캐릭터가 동작하는 장면
  "웃다": "a cute cartoon child laughing with a big bright smile",
  "울다": "a cute cartoon child crying with a teardrop",
  "먹다": "a cute cartoon child eating rice with chopsticks",
  "자다": "a cute cartoon child sleeping peacefully in a bed with zzz",
  "걷다": "a cute cartoon child walking forward",
  "뛰다": "a cute cartoon child running fast with motion lines",
  "앉다": "a cute cartoon child sitting down cross-legged",
  "읽다": "a cute cartoon child reading an open picture book",
  "그리다": "a cute cartoon child drawing a picture on paper",
  "숨다": "a cute cartoon child hiding behind a big tree",
  "보다": "a cute cartoon child looking through toy binoculars",
  "듣다": "a cute cartoon child listening with hand behind ear",
  "쓰다": "a cute cartoon child writing with a crayon",
  "잡다": "a cute cartoon child catching a butterfly with net",
  "놀다": "a cute cartoon child playing happily",
  "타다": "a cute cartoon child riding a bicycle",
  "던지다": "a cute cartoon child throwing a ball",
  "받다": "a cute cartoon child catching a ball",
  "씻다": "a cute cartoon child washing hands at a sink",
  "입다": "a cute cartoon child putting on colorful clothes",
  "신다": "a cute cartoon child putting on shoes",
  "올라가다": "a cute cartoon child climbing up stairs",
  "내려가다": "a cute cartoon child sliding down a slide",
  // 동작명사
  "수영": "a cute cartoon child swimming with floaties in water",
  "춤": "a cute cartoon child dancing with arms raised joyfully",
  "노래": "a cute cartoon child singing with musical notes around",
  "세수": "a cute cartoon child washing face at a sink with bubbles",
  "달리기": "a cute cartoon child sprinting on a race track",
  "요리": "a cute cartoon child in a tiny apron stirring a pot",
  "유도": "a cute cartoon child doing judo in a white uniform",
  "태권도": "a cute cartoon child doing taekwondo kick in dobok",
  "청소": "a cute cartoon child sweeping floor with a broom",
  // 감정
  "행복": "a cute cartoon smiley face with big happy smile and rosy cheeks",
  "슬픔": "a cute cartoon face looking sad with a single teardrop",
  "화남": "a cute cartoon face with an angry frown and furrowed brows",
  "무서움": "a cute cartoon face looking scared, wide eyes and shaking",
  "신남": "a cute cartoon face excited with star-shaped eyes and open mouth",
  "졸음": "a cute cartoon face sleepy with half-closed eyes and zzz bubbles",
  "놀람": "a cute cartoon face surprised with wide round eyes and open mouth",
  // 날씨
  "비": "a cute rain cloud with raindrops falling and a small umbrella",
  "눈": "cute snowflakes falling from a white cloud",
  "바람": "cute wind swirls with leaves blowing and a spinning pinwheel",
  "햇빛": "a cute bright yellow sun with rays and a smiley face",
  "천둥": "a cute storm cloud with a lightning bolt",
  "무지개": "a colorful rainbow arc over fluffy white clouds",
  // 방향·위치 → 화살표와 귀여운 오브젝트로 표현
  "앞": "a cute cartoon arrow pointing forward, with a small character walking toward it",
  "뒤": "a cute cartoon arrow pointing backward, with a small character looking behind",
  "위": "a cute cartoon upward arrow with a star at the top on a pastel background",
  "아래": "a cute cartoon downward arrow with a small ball at the bottom",
  "안": "a cute cartoon open box with a small bunny sitting inside it",
  "밖": "a cute cartoon open box with a small bunny standing outside next to it",
  "옆": "two cute cartoon animals sitting side by side next to each other",
  "사이": "two cute cartoon trees with a small bunny sitting in the space between them",
  // 추상어 → 시각 상징으로 표현
  "사랑": "a big cute red heart with rosy cheeks and sparkles on a white background",
  "꿈": "a cute baby sleeping peacefully with a dream speech bubble showing stars and rainbows",
  "재미": "a cute cartoon child playing joyfully with balloons and confetti all around",
  "소리": "a cute cartoon speaker emitting colorful musical notes and sound waves",
  "이야기": "two cute cartoon children sitting together with speech bubbles above them",
  "단맛": "a cute colorful candy lollipop with sparkles and sugar crystals",
  // 기타
  "초": "a cute birthday cake with a glowing candle on top",
  "원": "a cute round donut shape with pastel pink frosting and sprinkles",
  "하트": "a big cute pink heart with a happy smiley face on it",
};

// ── 일관된 귀여운 스타일 프롬프트 ───────────────────────────────────────────
function buildPrompt(word: string, sentence?: string): string {
  const ctx = WORD_CONTEXT[word];
  // 맥락이 있으면 주제를 명확히 지정, 없으면 단어 이름으로 생성
  const subject = ctx ?? `the concept of "${word}"`;
  return [
    `Create a single cute illustration of ${subject} for a Korean toddler (age 3-5).`,
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
