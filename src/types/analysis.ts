import { PhonemeError } from "./phonetics";

export interface AnalysisResult {
  targetWord: string;
  heardWord: string;
  isCorrect: boolean;
  errors: PhonemeError[];
  guidanceText: string;
  articulationGuides: ArticulationGuide[];
  wordRecordId: string;
}

export interface ArticulationGuide {
  phoneme: string;
  place: string;
  manner: string;
  imageKey: string;  // maps to a static image asset
  tipText: string;
}

export interface RecommendedWord {
  word: string;
  sentence: string;
  targetPhonemes: string[];
  difficulty: "easy" | "medium" | "hard";
}

export interface AnalysisRequest {
  targetWord: string;
  heardWord: string;
  childId: string;
  sessionId: string;
}
