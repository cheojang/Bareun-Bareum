import { PhonemeError } from "@/types/phonetics";
import { RecommendedWord } from "@/types/analysis";
import { WORD_DATABASE, PracticeWord } from "./word-database";
import { getMostFrequentErrors } from "./articulation-analysis";

export function getRecommendations(
  recentErrors: PhonemeError[][],
  practicedWords: string[],
  maxResults = 5
): RecommendedWord[] {
  if (recentErrors.length === 0) {
    // No history — return beginner words
    return WORD_DATABASE.filter((w) => w.difficulty === "easy" && w.ageGroup === "2-3세")
      .slice(0, maxResults)
      .map(toRecommended);
  }

  const frequentErrors = getMostFrequentErrors(recentErrors);
  const targetPhonemes = frequentErrors.slice(0, 3).map((e) => e.phoneme);

  // Priority: words that target the error phonemes, not recently practiced
  const candidates: PracticeWord[] = [];

  for (const phoneme of targetPhonemes) {
    const words = WORD_DATABASE.filter(
      (w) => w.targetPhonemes.includes(phoneme) && !practicedWords.includes(w.word)
    );
    candidates.push(...words);
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = candidates.filter((w) => {
    if (seen.has(w.word)) return false;
    seen.add(w.word);
    return true;
  });

  // Sort by difficulty (easy first)
  const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
  unique.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

  return unique.slice(0, maxResults).map(toRecommended);
}

function toRecommended(w: PracticeWord): RecommendedWord {
  return {
    word: w.word,
    sentence: w.sampleSentence,
    targetPhonemes: w.targetPhonemes,
    difficulty: w.difficulty,
    imageEmoji: w.emoji,
  };
}
