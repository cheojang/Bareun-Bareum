/**
 * 단어 DB 중복 제거 — npx tsx scripts/dedupe-word-db.ts
 *
 * 정책:
 *  - 같은 (word, difficulty) 중복: 첫 항목에 targetPhonemes를 병합(합집합)하고 이후 라인 삭제
 *  - 난이도가 다른 동일 단어: 의도적 난이도 분화로 보존
 */
import fs from "fs";
import path from "path";

const FILE = path.join(__dirname, "../src/lib/word-database.ts");
const ENTRY_RE = /^(\s*\{\s*word:\s*")([^"]+)(",\s*targetPhonemes:\s*\[)([^\]]*)(\],\s*difficulty:\s*")(\w+)(".*)$/;

const lines = fs.readFileSync(FILE, "utf8").split("\n");
const firstIdx = new Map<string, number>(); // word::difficulty → 첫 라인 index
const merged = new Map<number, Set<string>>(); // 첫 라인 index → 병합된 음소
const drop = new Set<number>();
let dropped = 0;

lines.forEach((line, i) => {
  const m = line.match(ENTRY_RE);
  if (!m) return;
  const key = `${m[2]}::${m[6]}`;
  const phonemes = [...m[4].matchAll(/"([^"]*)"/g)].map((x) => x[1]);
  const first = firstIdx.get(key);
  if (first === undefined) {
    firstIdx.set(key, i);
    merged.set(i, new Set(phonemes));
  } else {
    for (const p of phonemes) merged.get(first)!.add(p);
    drop.add(i);
    dropped++;
  }
});

const out: string[] = [];
lines.forEach((line, i) => {
  if (drop.has(i)) return;
  const set = merged.get(i);
  if (set) {
    const m = line.match(ENTRY_RE)!;
    out.push(`${m[1]}${m[2]}${m[3]}${[...set].map((p) => `"${p}"`).join(", ")}${m[5]}${m[6]}${m[7]}`);
  } else {
    out.push(line);
  }
});

fs.writeFileSync(FILE, out.join("\n"));
console.log(`같은 (단어, 난이도) 중복 ${dropped}개 라인 제거 (음소는 첫 항목에 병합)`);
