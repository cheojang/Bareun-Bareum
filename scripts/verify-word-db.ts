/**
 * 단어 DB 전수 검증기 — npm run verify:word-db
 *
 * 검사 항목:
 *  1. targetPhonemes 정합성 — 선언된 음소가 실제 단어 자모(초성/종성/중성)에 존재하는가
 *     · 초성 ㅇ은 음가가 없으므로 target "ㅇ"은 종성(받침)에 있을 때만 인정
 *     · 겹받침은 대표 자음으로 정규화해 비교 (예: ㄺ→ㄹ)
 *  2. 중복 단어 — 같은 단어가 여러 번 등록된 경우 (getWordByText는 첫 항목만 반환)
 *  3. 최소대립쌍 정합성 — 두 단어가 정확히 한 자모만 다른 진짜 대립쌍인지,
 *     선언된 targetPhoneme/contrastPhoneme이 실제로 달라지는 자모와 일치하는지
 *  4. 이미지 슬러그 — WORD_IMAGE_SLUGS의 단어가 DB에 존재하는지, 슬러그 중복 없는지
 *
 * 종료 코드: 문제 발견 시 1 (CI 연동 가능)
 */
import { WORD_DATABASE, MINIMAL_PAIRS } from "../src/lib/word-database";
import { WORD_IMAGE_SLUGS } from "../src/lib/word-images";
import { decomposeWord, normalizeJongseong, JUNGSEONG } from "../src/lib/jamo-analysis";

type Issue = { kind: string; detail: string };
const issues: Issue[] = [];
const VOWELS = new Set(JUNGSEONG);

/** 단어가 음소를 (의미 있는 위치에) 포함하는지 — 초성 ㅇ은 무음이므로 제외 */
function wordContainsPhoneme(word: string, phoneme: string): boolean {
  for (const syl of decomposeWord(word)) {
    if (!syl) continue;
    if (VOWELS.has(phoneme)) {
      if (syl.jungseong === phoneme) return true;
      continue;
    }
    // 자음: 초성(단, ㅇ 제외 — 음가 없음) 또는 종성(정규화)
    if (phoneme !== "ㅇ" && syl.choseong === phoneme) return true;
    if (syl.jongseong && normalizeJongseong(syl.jongseong) === phoneme) return true;
  }
  return false;
}

// ── 1. targetPhonemes 정합성 ────────────────────────────────────────────────
for (const entry of WORD_DATABASE) {
  for (const ph of entry.targetPhonemes) {
    if (!wordContainsPhoneme(entry.word, ph)) {
      issues.push({
        kind: "음소 불일치",
        detail: `"${entry.word}" (${entry.difficulty}) — targetPhonemes에 "${ph}"가 있지만 단어에 해당 음소 없음`,
      });
    }
  }
  if (entry.targetPhonemes.length === 0) {
    issues.push({ kind: "음소 누락", detail: `"${entry.word}" — targetPhonemes가 비어 있음` });
  }
}

// ── 2. 중복 단어 ────────────────────────────────────────────────────────────
// 정책: 난이도가 다른 동일 단어는 의도적 분화로 허용. 같은 (단어, 난이도) 중복만 오류.
const wordDiffCount = new Map<string, number>();
for (const e of WORD_DATABASE) {
  const key = `${e.word}::${e.difficulty}`;
  wordDiffCount.set(key, (wordDiffCount.get(key) ?? 0) + 1);
}
for (const [key, n] of wordDiffCount) {
  if (n > 1) {
    const [w, d] = key.split("::");
    issues.push({ kind: "중복 단어", detail: `"${w}" (${d}) — 같은 난이도로 ${n}회 등록` });
  }
}

// ── 3. 최소대립쌍 정합성 ────────────────────────────────────────────────────
for (const pair of MINIMAL_PAIRS) {
  const a = decomposeWord(pair.word1);
  const b = decomposeWord(pair.word2);
  if (a.length !== b.length) {
    issues.push({ kind: "대립쌍 길이", detail: `${pair.id}: "${pair.word1}"/"${pair.word2}" — 음절 수가 다름` });
    continue;
  }
  const diffs: { jamoA: string; jamoB: string }[] = [];
  for (let i = 0; i < a.length; i++) {
    const sa = a[i];
    const sb = b[i];
    if (!sa || !sb) continue;
    if (sa.choseong !== sb.choseong) diffs.push({ jamoA: sa.choseong, jamoB: sb.choseong });
    if (sa.jungseong !== sb.jungseong) diffs.push({ jamoA: sa.jungseong, jamoB: sb.jungseong });
    const ja = normalizeJongseong(sa.jongseong);
    const jb = normalizeJongseong(sb.jongseong);
    if (ja !== jb) diffs.push({ jamoA: ja || "(없음)", jamoB: jb || "(없음)" });
  }
  if (diffs.length !== 1) {
    issues.push({
      kind: "대립쌍 자모",
      detail: `${pair.id}: "${pair.word1}"/"${pair.word2}" — 다른 자모가 ${diffs.length}개 (정확히 1개여야 최소대립쌍)`,
    });
    continue;
  }
  const actual = new Set([diffs[0].jamoA, diffs[0].jamoB]);
  const declared = new Set([pair.targetPhoneme, pair.contrastPhoneme]);
  const match = [...declared].every((p) => actual.has(p));
  if (!match) {
    issues.push({
      kind: "대립쌍 선언",
      detail: `${pair.id}: 실제 대조는 ${[...actual].join("/")}인데 선언은 ${pair.targetPhoneme}/${pair.contrastPhoneme}`,
    });
  }
}

// ── 4. 이미지 슬러그 ────────────────────────────────────────────────────────
const dbWords = new Set(WORD_DATABASE.map((e) => e.word));
const slugSeen = new Map<string, string>();
for (const [word, slug] of Object.entries(WORD_IMAGE_SLUGS)) {
  if (!dbWords.has(word)) {
    issues.push({ kind: "슬러그 고아", detail: `"${word}" → ${slug} — WORD_DATABASE에 없는 단어` });
  }
  const prev = slugSeen.get(slug);
  if (prev) {
    issues.push({ kind: "슬러그 중복", detail: `"${prev}"와 "${word}"가 같은 슬러그 "${slug}" 사용 (이미지 충돌)` });
  } else {
    slugSeen.set(slug, word);
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    issues.push({ kind: "슬러그 형식", detail: `"${word}" → "${slug}" — 소문자/숫자/하이픈만 허용` });
  }
}

// ── 리포트 ──────────────────────────────────────────────────────────────────
console.log(`단어 ${WORD_DATABASE.length}개 · 대립쌍 ${MINIMAL_PAIRS.length}개 · 슬러그 ${Object.keys(WORD_IMAGE_SLUGS).length}개 검사 완료\n`);

if (issues.length === 0) {
  console.log("✅ 문제 없음");
  process.exit(0);
}

const byKind = new Map<string, Issue[]>();
for (const i of issues) {
  if (!byKind.has(i.kind)) byKind.set(i.kind, []);
  byKind.get(i.kind)!.push(i);
}
for (const [kind, list] of byKind) {
  console.log(`\n❌ ${kind} (${list.length}건)`);
  for (const i of list) console.log(`   - ${i.detail}`);
}
console.log(`\n총 ${issues.length}건`);
process.exit(1);
