import { Syllable, ConsonantInfo, AcquisitionStage, PhonemeError, PhonemePosition } from "@/types/phonetics";

// Korean Unicode ranges
const SYLLABLE_START = 0xac00;
const SYLLABLE_END = 0xd7a3;

// 초성 (onset) — 19 consonants
const CHO = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ",
  "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

// 중성 (nucleus) — 21 vowels
const JUNG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
];

// 종성 (coda) — 28 slots (index 0 = no coda)
const JONG = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

export function isKoreanSyllable(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= SYLLABLE_START && code <= SYLLABLE_END;
}

export function decomposeSyllable(char: string): Syllable | null {
  const code = char.charCodeAt(0);
  if (code < SYLLABLE_START || code > SYLLABLE_END) return null;

  const idx = code - SYLLABLE_START;
  const jongIdx = idx % 28;
  const jungIdx = Math.floor((idx - jongIdx) / 28) % 21;
  const choIdx = Math.floor(Math.floor((idx - jongIdx) / 28) / 21);

  return {
    char,
    cho: CHO[choIdx],
    jung: JUNG[jungIdx],
    jong: JONG[jongIdx],
  };
}

export function decomposeWord(word: string): Syllable[] {
  return word
    .split("")
    .map((ch) => decomposeSyllable(ch))
    .filter((s): s is Syllable => s !== null);
}

// Articulation classification for Korean consonants
export const CONSONANT_INFO: Record<string, ConsonantInfo> = {
  "ㅂ": { place: "양순음", placeEn: "bilabial", manner: "파열음" },
  "ㅍ": { place: "양순음", placeEn: "bilabial", manner: "파열음", aspirated: true },
  "ㅃ": { place: "양순음", placeEn: "bilabial", manner: "파열음", tense: true },
  "ㅁ": { place: "양순음", placeEn: "bilabial", manner: "비음", voiced: true },
  "ㄷ": { place: "치조음", placeEn: "alveolar", manner: "파열음" },
  "ㅌ": { place: "치조음", placeEn: "alveolar", manner: "파열음", aspirated: true },
  "ㄸ": { place: "치조음", placeEn: "alveolar", manner: "파열음", tense: true },
  "ㄴ": { place: "치조음", placeEn: "alveolar", manner: "비음", voiced: true },
  "ㄹ": { place: "치조음", placeEn: "alveolar", manner: "탄설음", voiced: true },
  "ㅅ": { place: "치조음", placeEn: "alveolar", manner: "마찰음" },
  "ㅆ": { place: "치조음", placeEn: "alveolar", manner: "마찰음", tense: true },
  "ㅈ": { place: "치조구개음", placeEn: "palato-alveolar", manner: "파찰음" },
  "ㅊ": { place: "치조구개음", placeEn: "palato-alveolar", manner: "파찰음", aspirated: true },
  "ㅉ": { place: "치조구개음", placeEn: "palato-alveolar", manner: "파찰음", tense: true },
  "ㄱ": { place: "연구개음", placeEn: "velar", manner: "파열음" },
  "ㅋ": { place: "연구개음", placeEn: "velar", manner: "파열음", aspirated: true },
  "ㄲ": { place: "연구개음", placeEn: "velar", manner: "파열음", tense: true },
  "ㅇ": { place: "연구개음", placeEn: "velar", manner: "비음", voiced: true },
  "ㅎ": { place: "성문음", placeEn: "glottal", manner: "마찰음" },
};

// Age-based phoneme acquisition order (Korean SLP research)
export const ACQUISITION_ORDER: AcquisitionStage[] = [
  { age: "2-3세", phonemes: ["ㅂ", "ㅍ", "ㅁ", "ㄴ", "ㄷ", "ㅎ", "ㅇ", "ㄱ"] },
  { age: "3-4세", phonemes: ["ㅌ", "ㅋ", "ㅃ", "ㄸ", "ㄲ"] },
  { age: "4-5세", phonemes: ["ㅅ", "ㅆ", "ㅈ", "ㅉ", "ㅊ"] },
  { age: "5-6세", phonemes: ["ㄹ"] },
];

export function getExpectedAgeForPhoneme(phoneme: string): string {
  for (const stage of ACQUISITION_ORDER) {
    if (stage.phonemes.includes(phoneme)) return stage.age;
  }
  return "알 수 없음";
}

export function compareWords(targetWord: string, heardWord: string): PhonemeError[] {
  const targetSyllables = decomposeWord(targetWord);
  const heardSyllables = decomposeWord(heardWord);
  const errors: PhonemeError[] = [];

  const maxLen = Math.max(targetSyllables.length, heardSyllables.length);

  for (let i = 0; i < maxLen; i++) {
    const target = targetSyllables[i];
    const heard = heardSyllables[i];

    if (!target) continue;

    const positions: PhonemePosition[] = ["cho", "jung", "jong"];

    for (const pos of positions) {
      const targetPhoneme = target[pos];
      const heardPhoneme = heard ? heard[pos] : "";

      if (targetPhoneme === heardPhoneme) continue;
      if (!targetPhoneme) continue;

      const info = CONSONANT_INFO[targetPhoneme] ?? {
        place: "알 수 없음",
        placeEn: "unknown",
        manner: "알 수 없음",
      };

      errors.push({
        syllableIndex: i,
        syllableChar: target.char,
        position: pos,
        targetPhoneme,
        heardPhoneme: heardPhoneme || "(없음)",
        articulationPlace: info.place,
        articulationManner: info.manner,
        errorType: heardPhoneme === "" ? "omission" : "substitution",
      });
    }
  }

  return errors;
}
