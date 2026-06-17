/**
 * 단어 DB 확장기 — Vertex AI Gemini로 "그림 가능한" 아동 단어를 대량 생성해
 * src/lib/word-database.ts 의 WORD_DATABASE 배열 끝에 추가한다.
 * 실행: GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/gcp-key.json npx tsx scripts/expand-word-database.ts
 *
 * - 카테고리별로 구체명사 생성(중복 회피) → 기존/신규 중복 제거
 * - targetPhonemes는 jamo 분해로 자동 계산(초성 ㅇ 제외 + 정규화 종성)
 * - difficulty/ageGroup 휴리스틱 부여, sampleSentence 포함
 * - TARGET_NEW 개수에 도달하면 종료
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { decomposeWord, normalizeJongseong } from "../src/lib/jamo-analysis";
import { WORD_DATABASE } from "../src/lib/word-database";

const TEXT_MODEL = process.env.TEXT_MODEL || "gemini-2.5-flash";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
const DB_PATH = join(process.cwd(), "src", "lib", "word-database.ts");
const TARGET_NEW = process.env.TARGET_NEW ? Number(process.env.TARGET_NEW) : 2400;

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

// ── 그림 가능한 구체명사 카테고리 (음소 다양성 확보용) ──────────────────────
const CATEGORIES = [
  "육지 동물 (포유류·파충류)", "바다 생물·물고기", "새·조류", "곤충·벌레", "공룡",
  "과일", "채소", "한국 음식·반찬", "간식·디저트·빵", "음료",
  "집안 물건·가구", "주방 도구", "장난감·놀이기구", "학용품·문구",
  "옷·신발·악세서리", "탈것·교통수단", "꽃·나무·식물", "날씨·자연·우주",
  "신체 부위", "장소·건물", "악기", "운동·스포츠 용품", "도구·공구",
  "직업(그림 가능)", "생활용품·욕실용품",
];

// ── 음소 계산 (초성 ㅇ 제외 + 정규화 종성, 중복 제거) ───────────────────────
function computePhonemes(word: string): string[] {
  const set = new Set<string>();
  for (const syl of decomposeWord(word)) {
    if (!syl) continue;
    if (syl.choseong && syl.choseong !== "ㅇ") set.add(syl.choseong);
    if (syl.jongseong) set.add(normalizeJongseong(syl.jongseong));
  }
  return [...set];
}

// ── 난이도 휴리스틱: 어려운 음소/음절수 기반 ─────────────────────────────────
const HARD_PHO = new Set(["ㄹ", "ㅅ", "ㅆ", "ㅈ", "ㅊ", "ㄲ", "ㄸ", "ㅃ", "ㅉ", "ㅋ", "ㅌ", "ㅍ"]);
function computeDifficulty(word: string, phonemes: string[]): "easy" | "medium" | "hard" {
  const syl = [...word].length;
  const hardCount = phonemes.filter((p) => HARD_PHO.has(p)).length;
  if (syl >= 4 || hardCount >= 2) return "hard";
  if (syl === 3 || hardCount === 1) return "medium";
  return "easy";
}

const HANGUL = /^[가-힣]{1,5}$/;

// ── Gemini로 카테고리별 단어 생성 ────────────────────────────────────────────
async function genCategory(cat: string, avoidHint: string): Promise<{ word: string; sampleSentence: string }[]> {
  const prompt =
    `한국 3~7세 아동이 아는, "그림으로 그릴 수 있는 구체적인 사물/대상"인 한국어 단어를 카테고리 "${cat}"에서 최대한 많이(80개 이상) 생성해줘.\n` +
    `규칙:\n` +
    `- 반드시 구체명사(눈에 보이는 사물·동물·음식 등). 추상어·동사·형용사·의성어 금지.\n` +
    `- 1~5글자 순우리말/외래어 명사. 고유명사·상표명 금지.\n` +
    `- 각 단어에 7세 이하가 이해할 짧은 예문 1개.\n` +
    `- 다음 단어들은 이미 있으니 피해: ${avoidHint}\n` +
    `JSON 배열만 출력: [{"word":"사과","sampleSentence":"사과가 빨개요."}, ...]`;
  const res = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: { responseMimeType: "application/json", temperature: 0.9 },
  });
  try {
    const arr = JSON.parse(res.text ?? "[]");
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

async function main() {
  console.log(`Gemini: ${TEXT_MODEL} · 프로젝트: ${PROJECT} · 목표 신규 ${TARGET_NEW}개`);

  const existing = new Set(WORD_DATABASE.map((w) => w.word));
  const newEntries: { word: string; targetPhonemes: string[]; difficulty: string; ageGroup: string; sampleSentence: string }[] = [];
  const seenNew = new Set<string>();

  // 라운드 반복: 카테고리를 돌며 목표 수량까지 모음
  let round = 0;
  while (newEntries.length < TARGET_NEW && round < 4) {
    for (const cat of CATEGORIES) {
      if (newEntries.length >= TARGET_NEW) break;
      // 회피 힌트: 이번 카테고리에서 이미 모은 일부 + 기존 일부 샘플
      const avoid = [...seenNew].slice(-40).join(", ") || "사과, 토끼, 자동차";
      let items: { word: string; sampleSentence: string }[] = [];
      try {
        items = await genCategory(cat, avoid);
      } catch (e) {
        console.warn(`  [${cat}] 실패:`, e instanceof Error ? e.message : e);
      }
      let added = 0;
      for (const it of items) {
        const word = (it.word ?? "").trim();
        if (!HANGUL.test(word)) continue;
        if (existing.has(word) || seenNew.has(word)) continue;
        const phonemes = computePhonemes(word);
        if (phonemes.length === 0) continue;
        seenNew.add(word);
        newEntries.push({
          word,
          targetPhonemes: phonemes,
          difficulty: computeDifficulty(word, phonemes),
          ageGroup: "4-5세",
          sampleSentence: (it.sampleSentence ?? `${word} 그림이에요.`).trim().slice(0, 40),
        });
        added++;
      }
      console.log(`  R${round + 1} [${cat}] +${added} (누적 ${newEntries.length})`);
      await new Promise((r) => setTimeout(r, 600));
    }
    round++;
  }

  // ── word-database.ts 배열 끝(`];`)에 삽입 ──────────────────────────────────
  const text = readFileSync(DB_PATH, "utf8");
  const marker = "\nexport const WORD_DATABASE: PracticeWord[] = [";
  const startIdx = text.indexOf(marker);
  // WORD_DATABASE 배열을 닫는 첫 번째 "\n];" 를 시작 지점 이후에서 찾음
  const closeIdx = text.indexOf("\n];", startIdx + marker.length);
  if (startIdx < 0 || closeIdx < 0) { console.error("WORD_DATABASE 배열 위치를 찾지 못함"); process.exit(1); }

  const lines = newEntries.map((e) =>
    `  { word: ${JSON.stringify(e.word)}, targetPhonemes: [${e.targetPhonemes.map((p) => `"${p}"`).join(", ")}], difficulty: "${e.difficulty}", ageGroup: "${e.ageGroup}", sampleSentence: ${JSON.stringify(e.sampleSentence)} },`
  ).join("\n");

  const banner = `\n  // ── 자동 확장(expand-word-database.ts) — 그림 가능 구체명사 ${newEntries.length}개 ──\n`;
  const updated = text.slice(0, closeIdx) + banner + lines + "\n" + text.slice(closeIdx + 1);
  writeFileSync(DB_PATH, updated, "utf8");

  console.log(`\n완료 — 신규 ${newEntries.length}개 추가. 총 DB ≈ ${existing.size + newEntries.length}개`);
  console.log(`다음: node scripts/build-word-image-manifest.mjs 로 매니페스트 갱신`);
}

main().catch((e) => { console.error(e); process.exit(1); });
