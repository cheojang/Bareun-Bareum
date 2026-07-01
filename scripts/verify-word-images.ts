/**
 * 단어 이미지 품질 검증 + 재생성 스크립트 — Gemini Vision 심사관
 * 실행:
 *   npx tsx scripts/verify-word-images.ts            # 전체 검증 → 불합격 목록 생성
 *   npx tsx scripts/verify-word-images.ts --regen    # 불합격분만 삭제·재생성·재검증(자기치유)
 *   npx tsx scripts/verify-word-images.ts --force     # 캐시 무시하고 전부 재검증
 *   LIMIT=20 npx tsx scripts/verify-word-images.ts    # 앞 20개만(스모크 테스트)
 *   ONLY="목,사과" npx tsx scripts/verify-word-images.ts   # 특정 단어만
 *
 * 검사 항목(아동용 단어 플래시카드 기준):
 *   1) 단어와 그림 의미 일치 (예: "목"인데 기린 → 불합격)
 *   2) 글씨/숫자/캡션 유무 (읽지 못하는 아동에게 혼란 → 글자 있으면 불합격)
 *   3) 무생물 의인화 (사물에 불필요한 얼굴·팔·다리 → 불합격, 동물/캐릭터/동작은 허용)
 *   4) 색깔 단어: 해당 색이 화면 대부분을 채우는지 (작은 부분만이면 불합격)
 *   5) 기타 심각한 문제(주제 여러 개·무섭거나 부적절·산만)
 *
 * 사전조건은 generate-word-images.ts 와 동일 (GCP 서비스계정 키, @google/genai).
 * 비전 모델: VERIFY_MODEL (기본 gemini-2.5-flash).
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { WORD_IMAGE_SLUGS } from "../src/lib/word-images";
// 생성 로직 재사용 (import 시 main()은 실행되지 않도록 가드됨)
import { ai, WORD_CONTEXT, buildPrompt, generateImage } from "./generate-word-images";

// 영어 글로스(있으면 심사관에게 의도된 의미로 전달)
let WORD_GLOSS: Record<string, string> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WORD_GLOSS = require("../src/lib/word-image-glosses").WORD_GLOSS ?? {};
} catch { /* 없으면 단어 자체 사용 */ }

// ── 설정 ─────────────────────────────────────────────────────────────────────
const VERIFY_MODEL = process.env.VERIFY_MODEL || "gemini-2.5-flash";
const WORDS_DIR = join(process.cwd(), "public", "images", "words");
const REJECTED_PATH = join(process.cwd(), "public", "images", ".word-images-rejected.json");
const VERDICT_CACHE = join(process.cwd(), "public", "images", ".word-images-verdicts.json");
const CONCURRENCY = Number(process.env.CONCURRENCY) || 4;
const MAX_REGEN = Number(process.env.MAX_REGEN) || 2;   // 재생성 후 재검증 최대 시도
const REGEN_DELAY_MS = Number(process.env.DELAY_MS) || 3000;

const REGEN = process.argv.includes("--regen");
const FORCE = process.argv.includes("--force");
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",").map((s) => s.trim())) : null;

// 수면 관련 단어 — ZZZ/zzz 기호는 허용 (수면의 표준 시각 표현)
const SLEEP_WORDS = new Set(["자다", "졸음", "졸리다", "잠", "낮잠", "꿈"]);

// 텍스트가 의미의 핵심인 단어 — hasText 검사 전체 면제
const TEXT_ALLOWED_WORDS = new Set(["글자", "숫자", "이름", "편지", "글씨", "단어", "키보드", "컴퓨터", "이름표", "달력", "책", "바코드", "돈", "신문", "잡지",
  "건전지", "나침반", "쨍그랑", "양념병", "오일병", "비료", "소독기", "캐러멜", "홀", "먼저"]);

// 디자인적으로 얼굴이 있어야 정상인 장난감/물체 — 의인화 검사 면제
// (오뚝이는 전통적으로 얼굴이 그려진 장난감, 목마는 말 얼굴이 있는 장난감)
const FACE_ALLOWED_WORDS = new Set(["오뚝이", "목마", "인형", "봉제인형", "장난감로봇", "꼭두각시", "가면", "주둥이"]);

// 색깔 단어(전 화면을 그 색으로 채워야 함)
const COLOR_WORDS = new Set([
  "빨강", "파랑", "노랑", "초록", "보라", "분홍", "하양", "검정",
  "주황", "회색", "갈색", "금색", "은색", "빨간색", "파란색", "노란색",
  "초록색", "검정색", "하얀색", "보라색", "분홍색", "주황색",
]);

type Category = "color" | "general";
function categoryOf(word: string): Category {
  return COLOR_WORDS.has(word) ? "color" : "general";
}

// 심사관에게 알려줄 "의도된 의미": 손튜닝 맥락 > 영어 글로스 > 단어
function intendedMeaning(word: string): string {
  return WORD_CONTEXT[word] ?? WORD_GLOSS[word] ?? word;
}

// ── 심사 결과 타입/스키마 ────────────────────────────────────────────────────
interface Verdict {
  depictsWord: boolean;        // 단어 의미를 명확히 표현하는가
  hasText: boolean;            // 글자/숫자/캡션이 보이는가
  badAnthropomorphism: boolean;// 무생물에 부적절한 얼굴·팔·다리
  colorDominant: boolean;      // (색깔 단어) 그 색이 대부분을 채우는가
  extraIssues: string;         // 기타 문제
  verdict: "ok" | "regenerate";
  reason: string;              // 한국어 한 문장
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    depictsWord: { type: "boolean" },
    hasText: { type: "boolean" },
    badAnthropomorphism: { type: "boolean" },
    colorDominant: { type: "boolean" },
    extraIssues: { type: "string" },
    verdict: { type: "string", enum: ["ok", "regenerate"] },
    reason: { type: "string" },
  },
  required: [
    "depictsWord", "hasText", "badAnthropomorphism",
    "colorDominant", "extraIssues", "verdict", "reason",
  ],
};

function buildJudgePrompt(word: string, category: Category): string {
  const meaning = intendedMeaning(word);
  return [
    `You are a STRICT QA reviewer for a Korean toddler (age 3-5) speech-therapy flashcard app.`,
    `Each image must clearly and correctly depict ONE Korean word so a child who cannot read instantly recognizes it.`,
    ``,
    `WORD (Korean): "${word}"`,
    `INTENDED MEANING / what it should show: ${meaning}`,
    `CATEGORY: ${category}`,
    ``,
    `Return JSON evaluating the image. Set verdict="regenerate" if ANY problem exists, else "ok".`,
    ``,
    `Checks:`,
    `1. depictsWord: Does the image clearly and unambiguously depict "${word}" (${meaning})?`,
    `   If it shows a DIFFERENT object/animal/scene, set false. Example: word "목"(neck) but image shows a giraffe → false.`,
    `   Symbolic representations of abstract words are fine if they match the intended meaning above.`,
    ...(TEXT_ALLOWED_WORDS.has(word) ? [
    `2. hasText: This word's MEANING is writing/text itself. Text in the image IS the subject.`,
    `   ALWAYS set hasText=false for this word — the text shown IS the correct depiction.`,
    ] : [
    `2. hasText: Are there ANY letters, numbers, words, captions, labels, or writing visible ANYWHERE`,
    `   in the image? This includes: store signs, price tags, product labels, name tags, street signs,`,
    `   text on clothing, speech bubbles, watermarks, or ANY other written text. Toddlers cannot read`,
    `   and ANY text confuses them. If ANY text is visible anywhere in the scene → set true (regenerate).`,
    ...(SLEEP_WORDS.has(word) ? [
    `   EXCEPTION for this sleep-related word: ZZZ / zzz / Zzz sleep symbols are a standard visual`,
    `   shorthand for sleeping and are acceptable — do NOT flag them as text (set hasText=false for zzz only).`,
    ] : []),
    ]),
    ...(FACE_ALLOWED_WORDS.has(word) ? [
    `3. badAnthropomorphism: This word is a TOY or OBJECT that is traditionally designed WITH a face/features by design.`,
    `   A simple painted face on this toy is ACCEPTABLE and EXPECTED — set badAnthropomorphism=false.`,
    `   Only set true if there are ADDITIONAL cartoon limbs/arms/legs that make it look like a separate cartoon character.`,
    ] : [
    `3. badAnthropomorphism: Decide from the WORD's meaning:`,
    `   - If the word is an ANIMAL, PERSON, CHARACTER, an EMOTION, or an ACTION, a friendly face/limbs is natural → set false.`,
    `   - If the word is an INANIMATE OBJECT, FOOD, FRUIT, BODY PART, VEHICLE, or NATURE thing, it must NOT have`,
    `     cartoon eyes/face/mouth/arms/legs. If such a plain thing was given a face or limbs → set true.`,
    ]),
    `4. colorDominant: ONLY for CATEGORY=color. Is the named color clearly the SINGLE dominant color filling most`,
    `   of the image? If the color appears only as a small part of some object, set false. For non-color category, set true.`,
    `5. extraIssues: note any other serious problem (multiple competing subjects, scary/inappropriate, cluttered, unclear). Else "".`,
    ``,
    `reason: ONE short Korean sentence explaining the verdict.`,
  ].join("\n");
}

// 코드에서 최종 판정 강제(모델이 verdict를 누락/오판해도 하드룰 우선)
function finalize(category: Category, v: Verdict, word?: string): Verdict {
  const hasText = word && TEXT_ALLOWED_WORDS.has(word) ? false : v.hasText;
  const hasFace = word && FACE_ALLOWED_WORDS.has(word) ? false : v.badAnthropomorphism;
  const hardFail =
    !v.depictsWord ||
    hasText ||
    hasFace ||
    (category === "color" && !v.colorDominant);
  return { ...v, verdict: hardFail ? "regenerate" : "ok" };
}

function failReasons(category: Category, v: Verdict, word?: string): string[] {
  const hasText = word && TEXT_ALLOWED_WORDS.has(word) ? false : v.hasText;
  const hasFace = word && FACE_ALLOWED_WORDS.has(word) ? false : v.badAnthropomorphism;
  const r: string[] = [];
  if (!v.depictsWord) r.push("단어와 그림 의미 불일치");
  if (hasText) r.push("이미지에 글자/숫자 포함");
  if (hasFace) r.push("무생물에 부적절한 얼굴·팔·다리(의인화)");
  if (category === "color" && !v.colorDominant) r.push("색깔이 화면을 채우지 못함");
  if (v.extraIssues && v.extraIssues.trim()) r.push(v.extraIssues.trim());
  return r;
}

// ── Gemini Vision 심사 1장 (429 자동 재시도) ────────────────────────────────
async function judgeImage(word: string, slug: string, retries = 4): Promise<Verdict | null> {
  const file = join(WORDS_DIR, `${slug}.webp`);
  if (!existsSync(file)) return null;
  const b64 = readFileSync(file).toString("base64");
  const category = categoryOf(word);
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: VERIFY_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: "image/webp", data: b64 } },
              { text: buildJudgePrompt(word, category) },
            ],
          },
        ],
        config: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA as any,
        },
      });
      const text = res.text;
      if (!text) return null;
      const parsed = JSON.parse(text) as Verdict;
      return finalize(category, parsed, word);
    } catch (e: any) {
      const is429 = e?.status === 429 || String(e).includes("429");
      if (is429 && attempt < retries) {
        const wait = Math.min(60000, 5000 * 2 ** attempt);
        console.warn(`  ⏳ judgeImage 429 — ${wait / 1000}s 후 재시도 (${attempt + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw e;
      }
    }
  }
  return null;
}

// ── 캐시/불합격 목록 IO ──────────────────────────────────────────────────────
type CacheEntry = { word: string; verdict: "ok" | "regenerate"; reasons: string[]; reason: string };
function loadJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try { return JSON.parse(readFileSync(path, "utf8")) as T; } catch { return fallback; }
}
function saveJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 2));
}

// ── 동시성 풀 ────────────────────────────────────────────────────────────────
async function pool<T>(items: T[], size: number, fn: (item: T, idx: number) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

// ── 재생성: 불합격 사유를 회피 힌트로 붙여 다시 생성 ──────────────────────────
function regenPrompt(word: string, reasons: string[]): string {
  const avoid = reasons.length
    ? ` The previous attempt was REJECTED because: ${reasons.join("; ")}. Strictly fix these.`
    : "";
  const reinforce =
    " Show a single clear subject on a plain white background." +
    " Absolutely NO text, letters, numbers or captions anywhere." +
    " Do NOT add faces, eyes, mouths, arms or legs to inanimate objects, food, fruit, body parts or vehicles.";
  return buildPrompt(word) + avoid + reinforce;
}

async function regenerateOne(word: string, slug: string, reasons: string[]): Promise<Verdict | null> {
  const file = join(WORDS_DIR, `${slug}.webp`);
  let lastReasons = reasons;
  for (let attempt = 1; attempt <= MAX_REGEN; attempt++) {
    try {
      const buf = await generateImage(regenPrompt(word, lastReasons));
      if (!buf) { console.warn(`  ⚠ ${word} 재생성 ${attempt}: 안전필터로 이미지 없음`); continue; }
      writeFileSync(file, buf);
      const v = await judgeImage(word, slug);
      if (!v) return null;
      if (v.verdict === "ok") {
        console.log(`  ✓ ${word} 재생성·재검증 통과 (시도 ${attempt})`);
        return v;
      }
      lastReasons = failReasons(categoryOf(word), v, word);
      console.warn(`  ↻ ${word} 재생성 ${attempt} 후에도 불합격: ${lastReasons.join(", ")}`);
    } catch (e) {
      console.warn(`  ⚠ ${word} 재생성 오류: ${(e instanceof Error ? e.message : String(e)).slice(0, 160)}`);
    }
    await new Promise((r) => setTimeout(r, REGEN_DELAY_MS));
  }
  try {
    return await judgeImage(word, slug); // 마지막 상태 반환(여전히 불합격일 수 있음)
  } catch {
    return null;
  }
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`검증 모델: ${VERIFY_MODEL} · 모드: ${REGEN ? "재생성" : "검증"}${FORCE ? " (force)" : ""}`);

  const cache = loadJson<Record<string, CacheEntry>>(VERDICT_CACHE, {});

  let entries = Object.entries(WORD_IMAGE_SLUGS).filter(([, slug]) =>
    existsSync(join(WORDS_DIR, `${slug}.webp`)),
  );
  if (ONLY) entries = entries.filter(([word]) => ONLY.has(word));

  // ── 재생성 모드: 캐시상 불합격(또는 ONLY 지정분)만 처리 ────────────────────
  if (REGEN) {
    let targets = entries.filter(([, slug]) =>
      ONLY ? true : cache[slug]?.verdict === "regenerate",
    );
    if (targets.length === 0) {
      console.log("재생성할 불합격 이미지가 없습니다. 먼저 검증을 실행하세요(인자 없이).");
      return;
    }
    targets = targets.slice(0, LIMIT);
    console.log(`재생성 대상 ${targets.length}개`);
    let fixed = 0, still = 0;
    // 재생성은 Imagen quota 영향이 커 동시성 낮게
    await pool(targets, Math.min(2, CONCURRENCY), async ([word, slug]) => {
      const reasons = cache[slug]?.reasons ?? [];
      const v = await regenerateOne(word, slug, reasons);
      if (v && v.verdict === "ok") {
        cache[slug] = { word, verdict: "ok", reasons: [], reason: v.reason };
        fixed++;
      } else if (v) {
        cache[slug] = { word, verdict: "regenerate", reasons: failReasons(categoryOf(word), v, word), reason: v.reason };
        still++;
      }
      saveJson(VERDICT_CACHE, cache);
    });
    rebuildRejected(cache);
    console.log(`\n재생성 완료 — 해결 ${fixed} · 여전히 불합격 ${still}`);
    return;
  }

  // ── 검증 모드 ──────────────────────────────────────────────────────────────
  const todo = entries.filter(([, slug]) => FORCE || !cache[slug]).slice(0, LIMIT);
  console.log(`검증 대상 ${todo.length}개 (전체 ${entries.length}, 캐시 ${entries.length - todo.length})`);

  let ok = 0, bad = 0, errs = 0, processed = 0;
  await pool(todo, CONCURRENCY, async ([word, slug]) => {
    try {
      const v = await judgeImage(word, slug);
      if (!v) { errs++; return; }
      const reasons = failReasons(categoryOf(word), v, word);
      cache[slug] = { word, verdict: v.verdict, reasons, reason: v.reason };
      if (v.verdict === "ok") ok++;
      else { bad++; console.log(`  ✗ ${word} (${slug}): ${reasons.join(", ")}`); }
    } catch (e) {
      errs++;
      console.warn(`  ⚠ ${word} 검증 오류: ${(e instanceof Error ? e.message : String(e)).slice(0, 160)}`);
    } finally {
      processed++;
      if (processed % 50 === 0) {
        saveJson(VERDICT_CACHE, cache);
        console.log(`진행 ${processed}/${todo.length} (합격:${ok} 불합격:${bad} 오류:${errs})`);
      }
    }
  });

  saveJson(VERDICT_CACHE, cache);
  rebuildRejected(cache);
  console.log(`\n검증 완료 — 합격 ${ok} · 불합격 ${bad} · 오류 ${errs}`);
  console.log(`불합격 목록: ${REJECTED_PATH}`);
  console.log(`재생성하려면: npx tsx scripts/verify-word-images.ts --regen`);
}

// 캐시 전체에서 불합격분을 추려 .word-images-rejected.json 갱신
function rebuildRejected(cache: Record<string, CacheEntry>) {
  const rejected: Record<string, { word: string; reasons: string[]; reason: string }> = {};
  for (const [slug, e] of Object.entries(cache)) {
    if (e.verdict === "regenerate") rejected[slug] = { word: e.word, reasons: e.reasons, reason: e.reason };
  }
  saveJson(REJECTED_PATH, rejected);
}

main().catch((e) => { console.error(e); process.exit(1); });
