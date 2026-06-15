// 단어 이미지 매니페스트 생성기 (의존성 없음, plain node)
// 실행: node scripts/build-word-image-manifest.mjs
//
// word-database.ts의 easy+medium+hard 전 난이도 단어 중 "그림 가능"한 것을 골라
// 로마자 슬러그를 부여하고 src/lib/word-images.ts (WORD_IMAGE_SLUGS) 를 생성한다.
//
// 이미지화 가능 범위:
//   ✓ 구체명사 (동물·음식·사물·자연·탈것·장소)
//   ✓ 색깔 (빨강→빨간 사과 일러스트)
//   ✓ 계절 (봄→벚꽃 장면)
//   ✓ 동사 원형 (먹다→먹는 아이 캐릭터)
//   ✓ 동작명사 (수영·달리기·춤)
//   ✓ 감정 (행복·슬픔→표정 일러스트)
//
// 자동 제외 규칙:
//   ✗ "요"로 끝나는 활용형 (짜증나요·뻣뻣해요 — 문장형, 명사 아님)
//   ✗ 첩어/의성어·의태어 (찌릿찌릿·폭신폭신 — 앞뒤 반복형)
//   ✗ BLOCKLIST의 숫자·방향·접속어·추상어

import { readFileSync, writeFileSync } from "node:fs";

const SRC = "src/lib/word-database.ts";
const OUT = "src/lib/word-images.ts";

// ── 그림으로 표현하기 어려운 단어만 제외 ────────────────────────────────────
const BLOCKLIST = new Set([
  // 숫자 (수개념 이미지 → 그림 하나로 전달 모호)
  "하나","둘","셋","넷","다섯","여섯","일곱","여덟","아홉","열",
  "홀수","짝수",
  // 의성어·감탄사 (시각 표현 없음)
  "우와","아이고","헉","야호","아싸","붕붕","쿵쿵","깔깔","빵빵","뚝",
  // 시간대 (아침/점심/저녁은 장면 구분 어려움)
  "아침","점심","저녁","어제","오늘","내일",
  // 동사 활용형 / 비완전어 (원형 동사는 허용)
  "차요","잡아","놓아","밀어","펴","짜요","써요","아파요","알아요","맛있어요",
  // 정도 형용사 (상대적 크기 — 기준 없이 단독 그림 불분명)
  "크다","작다","길다","짧다","높다","낮다","넓다","좁다","밝다","차다",
  // 수량·정도 부사 (양 개념은 이미지 하나로 표현 모호)
  "조금","많이",
  // 단독 이미지 부적합
  "네","피","나라",
  // 도형 (오브젝트 일러스트 부적합)
  "네모","세모",
  // 접속어·문법·추상 개념 (그림 불가)
  "왜냐면","하지만","그리고","그래서","문제","문장","수수께끼",
  "받아쓰기","소리내어읽기","분류","비교","관찰","비교실험",
  "물질","기체","액체","고체",
]);

// "요"로 끝나는 활용형(짜증나요·뻣뻣해요 등)은 명사가 아니라 문장형 → 제외.
// (단, "마요네즈"처럼 명사인데 우연히 요로 끝나는 건 BLOCKLIST 미포함이므로
//  ENDS_YO_ALLOW로 예외 허용)
const ENDS_YO_ALLOW = new Set(["마요네즈"]);

function isConjugated(word) {
  return word.endsWith("요") && !ENDS_YO_ALLOW.has(word);
}

// 첩어/의성어·의태어: 앞 절반 == 뒤 절반 (찌릿찌릿, 폭신폭신, 쫄쫄, 쏙쏙)
function isReduplication(word) {
  const n = word.length;
  if (n < 2 || n % 2 !== 0) return false;
  const h = n / 2;
  return word.slice(0, h) === word.slice(h);
}

// ── 자모 → 로마자 (슬러그용, 음운규칙 무시·고유성만 확보) ────────────────────
const CHO = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
const JUNG = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
const JONG = ["","k","k","k","n","n","n","t","l","l","l","l","l","l","l","l","m","p","p","t","t","ng","t","t","k","t","p","t"];

function romanizeSyllable(ch) {
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return null;
  const cho = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const jong = code % 28;
  return (CHO[cho] || "") + JUNG[jung] + JONG[jong];
}

function toSlug(word) {
  let s = "";
  for (const ch of word) {
    const r = romanizeSyllable(ch);
    s += r ?? "";
  }
  return s || "w";
}

// ── word-database.ts 파싱 (easy + medium + hard 전 난이도) ───────────────────
const text = readFileSync(SRC, "utf8");
// 한 줄에 하나의 엔트리: { word: "...", targetPhonemes: [...], difficulty: "easy"|"medium"|"hard", ... }
const lineRe = /\{\s*word:\s*"([^"]+)"[^}]*?difficulty:\s*"(?:easy|medium|hard)"/g;

const seenWords = new Set();
const slugCount = new Map();
const entries = []; // { word, slug }
let dropped = 0;

let m;
while ((m = lineRe.exec(text)) !== null) {
  const word = m[1];
  if (seenWords.has(word)) continue;        // 중복 단어 1회만
  if (BLOCKLIST.has(word)) { dropped++; continue; }   // 그림 불가 제외
  if (isConjugated(word))  { dropped++; continue; }   // 활용형(~요) 제외
  if (isReduplication(word)) { dropped++; continue; } // 첩어/의성어 제외
  seenWords.add(word);

  let slug = toSlug(word);
  // 슬러그 충돌 시 숫자 접미사
  const n = slugCount.get(slug) ?? 0;
  slugCount.set(slug, n + 1);
  if (n > 0) slug = `${slug}-${n + 1}`;

  entries.push({ word, slug });
}

// ── 파일 생성 ───────────────────────────────────────────────────────────────
const body = entries.map((e) => `  "${e.word}": "${e.slug}",`).join("\n");
const out = `// 자동 생성 — scripts/build-word-image-manifest.mjs
// "그림 표현 가능한 단어" → 이미지 슬러그 (easy+medium+hard 전 난이도).
// 이미지 파일: /public/images/words/{slug}.webp
// 이 맵에 있는 단어만 유사패턴(stage2) 단어로 이미지가 보장된다.
// 포함 범위: 구체명사·색깔·계절·동사(동작)·동작명사·감정 표정
// 자동 제외: ~요 활용형 · 첩어(의성어) · blocklist(숫자·접속어·추상어)

export const WORD_IMAGE_SLUGS: Record<string, string> = {
${body}
};

export const IMAGED_WORDS: ReadonlySet<string> = new Set(Object.keys(WORD_IMAGE_SLUGS));
`;

writeFileSync(OUT, out, "utf8");
console.log(`생성 완료: ${OUT}`);
console.log(`총 ${entries.length}개 단어 (제외 ${dropped}개)`);
