// 단어 이미지 매니페스트 생성기 (의존성 없음, plain node)
// 실행: node scripts/build-word-image-manifest.mjs
//
// word-database.ts에서 easy 난이도 구체명사를 골라 로마자 슬러그를 부여하고
// src/lib/word-images.ts (WORD_IMAGE_SLUGS) 를 생성한다.
// 동사/형용사/숫자/색깔/방향/의성어/추상어는 블록리스트로 제외.

import { readFileSync, writeFileSync } from "node:fs";

const SRC = "src/lib/word-database.ts";
const OUT = "src/lib/word-images.ts";

// ── 그림으로 표현하기 어려운 단어 제외 ──────────────────────────────────────
const BLOCKLIST = new Set([
  // 동사·형용사
  "웃다","울다","걷다","앉다","누우다","자다","먹다","보다","듣다","쓰다","읽다",
  "그리다","숨다","크다","작다","길다","짧다","높다","낮다","넓다","좁다","밝다","뛰다",
  "차요","잡아","놓아","밀어","펴","짜요","써요","아파요","알아요","맛있어요","차다",
  // 숫자
  "하나","둘","셋","넷","다섯","여섯","일곱","여덟","아홉","열",
  // 색깔
  "빨강","파랑","노랑","초록","보라","분홍","하양","검정","주황",
  // 방향·위치
  "앞","뒤","위","아래","안","밖","옆","사이",
  // 의성어·감탄사
  "우와","아이고","헉","야호","아싸","붕붕","쿵쿵","깔깔","빵빵","뚝",
  // 시간·계절(그림 모호)
  "아침","점심","저녁","어제","오늘","내일","봄","여름","가을","겨울",
  // 추상·기타
  "사랑","재미","소리","화남","신남","졸음","단맛","꿈","조금","많이","이야기","요리",
  "세수","수영","춤","노래","유도","원","네","초","바람","피",
  // 도형(오브젝트 일러스트 부적합 — MVP 제외)
  "네모","세모","하트",
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

// ── word-database.ts 파싱 (easy 난이도만) ───────────────────────────────────
const text = readFileSync(SRC, "utf8");
// 한 줄에 하나의 엔트리: { word: "...", targetPhonemes: [...], difficulty: "easy", ... }
const lineRe = /\{\s*word:\s*"([^"]+)"[^}]*?difficulty:\s*"easy"/g;

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
// 큐레이션된 "그림 가능한 구체명사" → 이미지 슬러그.
// 이미지 파일: /public/images/words/{slug}.webp
// 이 맵에 있는 단어만 유사패턴(stage2) 단어로 이미지가 보장된다.
// 수동으로 단어를 추가/삭제해도 됨 (재생성 시 동사/추상어는 블록리스트로 제외됨).

export const WORD_IMAGE_SLUGS: Record<string, string> = {
${body}
};

export const IMAGED_WORDS: ReadonlySet<string> = new Set(Object.keys(WORD_IMAGE_SLUGS));
`;

writeFileSync(OUT, out, "utf8");
console.log(`생성 완료: ${OUT}`);
console.log(`총 ${entries.length}개 단어`);
