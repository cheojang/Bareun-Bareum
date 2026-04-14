import { PhonemeError } from "@/types/phonetics";
import { RecommendedWord } from "@/types/analysis";
import { WORD_DATABASE, PracticeWord } from "./word-database";
import { getMostFrequentErrors } from "./articulation-analysis";

// 🎲 배열을 무작위로 섞어주는 유틸리티 함수
// 매번 똑같은 단어가 맨 앞에 나오는 지루함을 방지합니다
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
    const beginnerWords = WORD_DATABASE.filter(
      (w) => w.difficulty === "easy" && w.ageGroup === "2-3세"
    );
    // 기초 단어도 섞어서 제공 (덜 지루함)
    return shuffleArray(beginnerWords).slice(0, maxResults).map(toRecommended);
  }

  const frequentErrors = getMostFrequentErrors(recentErrors);

  // 2. 빈 문자열(첨가 오류 시 targetPhoneme="") 방어 및 상위 3개 추출
  const targetPhonemes = frequentErrors
    .map((e) => e.phoneme)
    .filter((p) => p.trim() !== "") // 🚨 빈 문자열 필터링
    .slice(0, 3);

  let candidates: PracticeWord[] = [];

  // 3. 1순위: 안 해본 단어 중 약점 음소 타겟 단어
  for (const phoneme of targetPhonemes) {
    const words = WORD_DATABASE.filter(
      (w) => w.targetPhonemes.includes(phoneme) && !practicedWords.includes(w.word)
    );
    candidates.push(...words);
  }

  // 4. 🚨 Fallback 1: 안 해본 단어가 다 떨어졌다면 이미 했던 단어라도 다시 추천
  if (candidates.length === 0) {
    for (const phoneme of targetPhonemes) {
      const fallbackWords = WORD_DATABASE.filter((w) =>
        w.targetPhonemes.includes(phoneme)
      );
      candidates.push(...fallbackWords);
    }
  }

  // 5. 🚨 Fallback 2: 해당 음소 단어가 DB에 아예 없을 때 기초 단어로 폴백
  if (candidates.length === 0) {
    const backupWords = WORD_DATABASE.filter((w) => w.difficulty === "easy");
    candidates.push(...backupWords);
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
