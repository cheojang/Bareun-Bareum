/**
 * 단어 DB targetPhonemes 자동 교정 — npx tsx scripts/fix-word-db-phonemes.ts
 *
 * 교정 규칙 (라인 단위로 word-database.ts를 직접 수정):
 *  1. 포맷 오류 분해 — ["ㅊ, ㅂ, ㅇ"] 처럼 한 요소에 여러 음소가 든 경우 분리
 *  2. 단어에 실제 존재하는 음소는 유지 (초성 ㅇ은 무음이므로 종성만 인정)
 *  3. 없는 음소는 같은 조음 계열로 대체 — 평음·경음·격음 혼동 교정
 *     (예: "코" ㄱ→ㅋ, "딸기" ㄷ→ㄸ, "빵" ㅂ→ㅃ)
 *  4. 계열 대체도 불가능하면 제거 (예: "풍선"의 ㄹ — 무관 음소)
 *  5. 중복 제거, 비면 단어의 첫 유의미 자모(초성 비ㅇ 우선, 다음 받침)로 채움
 */
import fs from "fs";
import path from "path";
import { decomposeWord, normalizeJongseong, JUNGSEONG } from "../src/lib/jamo-analysis";

const FILE = path.join(__dirname, "../src/lib/word-database.ts");
const VOWELS = new Set(JUNGSEONG);

// 조음 계열 (같은 조음 위치·방법 계열 내 평음↔경음↔격음 혼동은 데이터 입력 실수로 간주)
const SERIES: string[][] = [
  ["ㄱ", "ㄲ", "ㅋ"],
  ["ㄷ", "ㄸ", "ㅌ"],
  ["ㅂ", "ㅃ", "ㅍ"],
  ["ㅅ", "ㅆ"],
  ["ㅈ", "ㅉ", "ㅊ"],
];
const seriesOf = (p: string) => SERIES.find((s) => s.includes(p));

/** 단어의 유의미 자모 집합 — 초성(ㅇ 제외) + 정규화된 종성 + 중성 */
function wordJamos(word: string): { meaningful: string[]; vowels: string[] } {
  const meaningful: string[] = [];
  const vowels: string[] = [];
  for (const syl of decomposeWord(word)) {
    if (!syl) continue;
    if (syl.choseong !== "ㅇ") meaningful.push(syl.choseong);
    if (syl.jongseong) meaningful.push(normalizeJongseong(syl.jongseong));
    vowels.push(syl.jungseong);
  }
  return { meaningful, vowels };
}

function fixPhonemes(word: string, raw: string[]): { fixed: string[]; changes: string[] } {
  const { meaningful, vowels } = wordJamos(word);
  const present = new Set(meaningful);
  const vowelSet = new Set(vowels);
  const changes: string[] = [];
  const fixed: string[] = [];

  // 1. 포맷 오류 분해 ("ㅊ, ㅂ" → ㅊ, ㅂ)
  const split = raw.flatMap((p) => p.split(/[,\s]+/).filter(Boolean));
  if (split.length !== raw.length) changes.push(`포맷 분해 [${raw.join("|")}]`);

  for (const ph of split) {
    if (fixed.includes(ph)) continue; // 중복 제거
    if (VOWELS.has(ph)) {
      if (vowelSet.has(ph)) fixed.push(ph);
      else changes.push(`${ph} 제거(모음 없음)`);
      continue;
    }
    if (present.has(ph)) {
      fixed.push(ph);
      continue;
    }
    // 2. 같은 조음 계열로 대체
    const series = seriesOf(ph);
    const substitute = series?.find((s) => present.has(s));
    if (substitute && !fixed.includes(substitute)) {
      fixed.push(substitute);
      changes.push(`${ph}→${substitute}`);
    } else if (substitute) {
      changes.push(`${ph} 제거(${substitute} 이미 있음)`);
    } else {
      changes.push(`${ph} 제거(무관)`);
    }
  }

  // 3. 비면 첫 유의미 자모로
  if (fixed.length === 0 && meaningful.length > 0) {
    fixed.push(meaningful[0]);
    changes.push(`비어서 ${meaningful[0]} 채움`);
  }
  return { fixed, changes };
}

const src = fs.readFileSync(FILE, "utf8");
const lines = src.split("\n");
let fixedCount = 0;
const log: string[] = [];

const ENTRY_RE = /^(\s*\{\s*word:\s*")([^"]+)(",\s*targetPhonemes:\s*\[)([^\]]*)(\].*)$/;

const out = lines.map((line) => {
  const m = line.match(ENTRY_RE);
  if (!m) return line;
  const [, pre, word, mid, arrRaw, post] = m;
  const raw = [...arrRaw.matchAll(/"([^"]*)"/g)].map((x) => x[1]);
  if (raw.length === 0) return line;
  const { fixed, changes } = fixPhonemes(word, raw);
  const same = fixed.length === raw.length && fixed.every((p, i) => p === raw[i]);
  if (same) return line;
  fixedCount++;
  log.push(`"${word}": [${raw.join(",")}] → [${fixed.join(",")}]  (${changes.join(", ")})`);
  return `${pre}${word}${mid}${fixed.map((p) => `"${p}"`).join(", ")}${post}`;
});

fs.writeFileSync(FILE, out.join("\n"));
console.log(`총 ${fixedCount}개 항목 교정\n`);
for (const l of log) console.log("  " + l);
