import { Syllable, ConsonantInfo, AcquisitionStage, PhonemeError, PhonemePosition } from "@/types/phonetics";
import { CHOSEONG, JUNGSEONG, JONGSEONG } from "./jamo-analysis";

// Korean Unicode ranges
const SYLLABLE_START = 0xac00;
const SYLLABLE_END = 0xd7a3;

// jamo-analysis.ts를 단일 소스로 사용 (중복 제거)
const CHO  = CHOSEONG;
const JUNG = JUNGSEONG;
const JONG = JONGSEONG;

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

    // 🚨 1. 음절 첨가 버그 수정: 아이가 불필요하게 덧붙인 글자 감지
    if (!target && heard) {
      errors.push({
        syllableIndex: i,
        syllableChar: "(없음)",
        position: "cho",
        targetPhoneme: "",
        heardPhoneme: heard.char,
        articulationPlace: "음절 첨가",
        articulationManner: "음절 첨가",
        errorType: "addition",
      });
      continue;
    }

    if (!target) continue;

    const positions: PhonemePosition[] = ["cho", "jung", "jong"];

    for (const pos of positions) {
      let targetPhoneme = target[pos];
      let heardPhoneme = heard ? heard[pos] : "";

      // 🌟 3. 초성 'ㅇ' 음운론적 예외 처리: 초성에서는 음가가 없으므로 빈 문자열로 취급
      if (pos === "cho") {
        if (targetPhoneme === "ㅇ") targetPhoneme = "";
        if (heardPhoneme === "ㅇ") heardPhoneme = "";
      }

      if (targetPhoneme === heardPhoneme) continue;

      // 🚨 2. 받침 첨가 버그 수정: 없는 받침을 만들어내는 오류 감지
      if (!targetPhoneme && heardPhoneme) {
        errors.push({
          syllableIndex: i,
          syllableChar: target.char,
          position: pos,
          targetPhoneme: "",
          heardPhoneme,
          articulationPlace: "알 수 없음",
          articulationManner: "음소 첨가",
          errorType: "addition",
        });
        continue;
      }

      // 탈락: 있는 소리를 안 내는 경우
      if (targetPhoneme && !heardPhoneme) {
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
          heardPhoneme: "(없음)",
          articulationPlace: info.place,
          articulationManner: info.manner,
          errorType: "omission",
        });
        continue;
      }

      // 대치: A 소리가 B 소리로 바뀐 경우
      if (targetPhoneme && heardPhoneme) {
        // 🚨 4. 모음 오류 크래시 위험 해결: 모음이 들어와도 안전하게 처리
        const info = CONSONANT_INFO[targetPhoneme] ?? {
          place: "모음",
          placeEn: "vowel",
          manner: "모음",
        };
        errors.push({
          syllableIndex: i,
          syllableChar: target.char,
          position: pos,
          targetPhoneme,
          heardPhoneme,
          articulationPlace: info.place,
          articulationManner: info.manner,
          errorType: "substitution",
        });
      }
    }
  }

  return errors;
}
