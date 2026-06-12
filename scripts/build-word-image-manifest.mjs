// 단어 이미지 매니페스트 생성기 (의존성 없음, plain node)
// 실행: node scripts/build-word-image-manifest.mjs
//
// word-database.ts에서 easy+medium 난이도 단어를 골라 로마자 슬러그를 부여하고
// src/lib/word-images.ts (WORD_IMAGE_SLUGS) 를 생성한다.
//
// 이미지화 가능 범위 (확장됨):
//   ✓ 구체명사 (동물·음식·사물·자연)
//   ✓ 색깔 (빨강→빨간 사과 일러스트)
//   ✓ 계절 (봄→벚꽃 장면)
//   ✓ 동사 (먹다→먹는 아이 캐릭터)
//   ✓ 동작명사 (수영·달리기·춤)
//   ✓ 감정 (행복·슬픔→표정 일러스트)
//
// 여전히 제외:
//   ✗ 숫자 (하나·둘 등 — 수개념 이미지 모호)
//   ✗ 방향·위치 (앞·뒤·위·아래 — 맥락 없이 그림 불분명)
//   ✗ 의성어·감탄사
//   ✗ 시간대 (아침·점심·저녁 — 그림 구분 어려움)
//   ✗ 진짜 추상어 (사랑·꿈·재미)
//   ✗ 비완전형 활용어 (차요·잡아 등)

import { readFileSync, writeFileSync } from "node:fs";

const SRC = "src/lib/word-database.ts";
const OUT = "src/lib/word-images.ts";

// ── 그림으로 표현하기 어려운 단어만 제외 ────────────────────────────────────
const BLOCKLIST = new Set([
  // 숫자 (수개념 이미지 → 그림 하나로 전달 모호)
  "하나","둘","셋","넷","다섯","여섯","일곱","여덟","아홉","열",
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
  // 도형 (오브젝트 일러스트 부적합 — MVP 제외)
  "네모","세모",
]);

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

// ── word-database.ts 파싱 (easy + medium 난이도) ─────────────────────────────
const text = readFileSync(SRC, "utf8");
// 한 줄에 하나의 엔트리: { word: "...", targetPhonemes: [...], difficulty: "easy"|"medium", ... }
const lineRe = /\{\s*word:\s*"([^"]+)"[^}]*?difficulty:\s*"(?:easy|medium)"/g;

const seenWords = new Set();
const slugCount = new Map();
const entries = []; // { word, slug }

let m;
while ((m = lineRe.exec(text)) !== null) {
  const word = m[1];
  if (seenWords.has(word)) continue;       // 중복 단어 1회만
  if (BLOCKLIST.has(word)) continue;        // 그림 불가 제외
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
// "그림 표현 가능한 단어" → 이미지 슬러그 (easy+medium 난이도).
// 이미지 파일: /public/images/words/{slug}.webp
// 이 맵에 있는 단어만 유사패턴(stage2) 단어로 이미지가 보장된다.
// 포함 범위: 구체명사·색깔·계절·동사(동작)·동작명사·감정 표정
// 수동으로 단어를 추가/삭제해도 됨 (재생성 시 blocklist 단어는 제외됨).

export const WORD_IMAGE_SLUGS: Record<string, string> = {
${body}
};

export const IMAGED_WORDS: ReadonlySet<string> = new Set(Object.keys(WORD_IMAGE_SLUGS));
`;

writeFileSync(OUT, out, "utf8");
console.log(`생성 완료: ${OUT}`);
console.log(`총 ${entries.length}개 단어`);
