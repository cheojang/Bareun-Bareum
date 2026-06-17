/**
 * 단어 영어 뜻(시각 설명) 생성기 — Vertex AI Gemini
 * 실행: GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/gcp-key.json npx tsx scripts/generate-word-glosses.ts
 *
 * WORD_IMAGE_SLUGS의 한글 단어를 "아동 일러스트용 영어 시각 설명"으로 번역해
 * src/lib/word-image-glosses.ts (WORD_GLOSS) 를 생성/갱신한다.
 * 이미지 생성 시 한글 대신 이 영어 설명을 프롬프트에 넣어 정확도를 높임.
 * (예: 루돌프 → "Rudolph the red-nosed reindeer")
 *
 * - 배치(50개)로 묶어 Gemini에 JSON 매핑 요청 → 호출 수 최소화
 * - 멱등: 이미 글로스가 있는 단어는 건너뜀 (--force 로 전체 재생성)
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WORD_IMAGE_SLUGS } from "../src/lib/word-images";

const TEXT_MODEL = process.env.TEXT_MODEL || "gemini-2.5-flash";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
const OUT = join(process.cwd(), "src", "lib", "word-image-glosses.ts");
const BATCH = 50;
const FORCE = process.argv.includes("--force");

function resolveProject(): string {
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath && existsSync(keyPath)) {
    try { return JSON.parse(readFileSync(keyPath, "utf8")).project_id ?? ""; } catch { /* */ }
  }
  return "";
}
const PROJECT = resolveProject();
if (!PROJECT) { console.error("GCP 프로젝트 ID 없음"); process.exit(1); }

const ai = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });

// 기존 글로스 로드 (멱등)
function loadExisting(): Record<string, string> {
  if (!existsSync(OUT)) return {};
  try {
    const txt = readFileSync(OUT, "utf8");
    const m = txt.match(/WORD_GLOSS[^{]*\{([\s\S]*?)\};/);
    if (!m) return {};
    const out: Record<string, string> = {};
    for (const line of m[1].split("\n")) {
      const e = line.match(/"([^"]+)":\s*"([^"]*)"/);
      if (e) out[e[1]] = e[2];
    }
    return out;
  } catch { return {}; }
}

const PROMPT_HEAD =
  `You translate Korean words into SHORT English visual descriptions for cute children's illustrations (age 3-5).\n` +
  `Rules:\n` +
  `- 2 to 7 words, describe the concrete visible object/scene.\n` +
  `- For proper nouns / loanwords, use the real meaning (e.g. 루돌프 = "Rudolph the red-nosed reindeer", 뽀로로 = "a cute blue penguin character").\n` +
  `- For verbs, describe a cute animal doing the action (e.g. 뛰다 = "a cute bunny running").\n` +
  `- For emotions, describe a facial expression (e.g. 행복 = "a happy smiling face").\n` +
  `- No Korean, no punctuation except spaces. Lowercase.\n` +
  `Return ONLY a JSON object mapping each Korean word to its English description.\n\n` +
  `Korean words:\n`;

async function translateBatch(words: string[]): Promise<Record<string, string>> {
  const res = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: PROMPT_HEAD + JSON.stringify(words),
    config: { responseMimeType: "application/json", temperature: 0.3 },
  });
  const text = res.text ?? "";
  try {
    const parsed = JSON.parse(text);
    return (parsed && typeof parsed === "object") ? parsed : {};
  } catch {
    console.warn("  ⚠ JSON 파싱 실패, 배치 건너뜀");
    return {};
  }
}

async function main() {
  console.log(`Gemini 모델: ${TEXT_MODEL} · 프로젝트: ${PROJECT}`);
  const all = Object.keys(WORD_IMAGE_SLUGS);
  const existing = FORCE ? {} : loadExisting();
  const todo = all.filter((w) => !existing[w]);
  console.log(`전체 ${all.length}개 · 기존 ${Object.keys(existing).length}개 · 신규 ${todo.length}개`);

  const result: Record<string, string> = { ...existing };
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    try {
      const map = await translateBatch(batch);
      let n = 0;
      for (const w of batch) {
        if (map[w]) { result[w] = String(map[w]).trim(); n++; }
      }
      console.log(`  배치 ${i / BATCH + 1}: ${n}/${batch.length} 완료`);
    } catch (e) {
      console.warn(`  배치 ${i / BATCH + 1} 실패:`, e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  // 단어 DB 순서 유지하며 파일 생성
  const body = all
    .filter((w) => result[w])
    .map((w) => `  "${w}": "${result[w].replace(/"/g, "'")}",`)
    .join("\n");
  const out = `// 자동 생성 — scripts/generate-word-glosses.ts
// 한글 단어 → 영어 시각 설명 (이미지 생성 프롬프트용, 정확도 향상).
export const WORD_GLOSS: Record<string, string> = {
${body}
};
`;
  writeFileSync(OUT, out, "utf8");
  console.log(`\n생성 완료: ${OUT} (총 ${Object.keys(result).length}개)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
