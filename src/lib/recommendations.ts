import { PhonemeError } from "@/types/phonetics";
import { RecommendedWord } from "@/types/analysis";
import { WORD_DATABASE, PracticeWord } from "./word-database";
import { getMostFrequentErrors } from "./articulation-analysis";

// 모듈 로드 시 한 번만 인덱싱 — 매 요청마다 풀스캔하지 않음
const WORDS_BY_PHONEME = (() => {
  const map = new Map<string, PracticeWord[]>();
  for (const w of WORD_DATABASE) {
    for (const p of w.targetPhonemes) {
      const list = map.get(p);
      if (list) list.push(w);
      else map.set(p, [w]);
    }
  }
  return map;
})();

const EASY_BEGINNER_WORDS = WORD_DATABASE.filter(
  (w) => w.difficulty === "easy" && w.ageGroup === "2-3세"
);
const EASY_WORDS = WORD_DATABASE.filter((w) => w.difficulty === "easy");

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRecommendations(
  recentErrors: PhonemeError[][],
  practicedWords: string[],
  maxResults = 5
): RecommendedWord[] {
  // 1. 에러 기록이 없을 때 (초기 상태 — 기초 단어 추천)
  if (!recentErrors || recentErrors.length === 0) {
    return shuffleArray(EASY_BEGINNER_WORDS).slice(0, maxResults).map(toRecommended);
  }

  const practicedSet = new Set(practicedWords);
  const frequentErrors = getMostFrequentErrors(recentErrors);

  // 2. 빈 문자열(첨가 오류 시 targetPhoneme="") 방어 및 상위 3개 추출
  const targetPhonemes = frequentErrors
    .map((e) => e.phoneme)
    .filter((p) => p.trim() !== "")
    .slice(0, 3);

  let candidates: PracticeWord[] = [];

  // 3. 1순위: 안 해본 단어 중 약점 음소 타겟 단어
  for (const phoneme of targetPhonemes) {
    const list = WORDS_BY_PHONEME.get(phoneme);
    if (!list) continue;
    for (const w of list) {
      if (!practicedSet.has(w.word)) candidates.push(w);
    }
  }

  // 4. Fallback 1: 안 해본 단어가 다 떨어졌다면 이미 했던 단어라도 다시 추천
  if (candidates.length === 0) {
    for (const phoneme of targetPhonemes) {
      const list = WORDS_BY_PHONEME.get(phoneme);
      if (list) candidates.push(...list);
    }
  }

  // 5. Fallback 2: 해당 음소 단어가 DB에 아예 없을 때 기초 단어로 폴백
  if (candidates.length === 0) {
    candidates = [...EASY_WORDS];
  }

  // 6. 중복 제거
  const seen = new Set<string>();
  const unique = candidates.filter((w) => {
    if (seen.has(w.word)) return false;
    seen.add(w.word);
    return true;
  });

  // 7. 셔플 후 난이도 정렬 조합
  // 같은 난이도(easy) 내에서도 순서가 무작위화되어 매번 다른 느낌을 줍니다
  const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
  const shuffled = shuffleArray(unique);
  shuffled.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

  return shuffled.slice(0, maxResults).map(toRecommended);
}

function toRecommended(w: PracticeWord): RecommendedWord {
  return {
    word: w.word,
    sentence: w.sampleSentence,
    targetPhonemes: w.targetPhonemes,
    difficulty: w.difficulty,
  };
}
