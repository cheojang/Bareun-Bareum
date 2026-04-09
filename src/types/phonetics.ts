export interface Syllable {
  char: string;
  cho: string;  // 초성 (onset)
  jung: string; // 중성 (nucleus)
  jong: string; // 종성 (coda), empty string if none
}

export type PhonemePosition = "cho" | "jung" | "jong";

export interface PhonemeError {
  syllableIndex: number;
  syllableChar: string;
  position: PhonemePosition;
  targetPhoneme: string;
  heardPhoneme: string;
  articulationPlace: string;   // 조음 위치
  articulationManner: string;  // 조음 방법
  errorType: ErrorType;
}

export type ErrorType =
  | "substitution"   // 대치: ㅅ→ㄷ
  | "omission"       // 생략: 단어 끝 자음 빠짐
  | "addition"       // 첨가
  | "distortion";    // 왜곡

export interface ConsonantInfo {
  place: string;
  placeEn: string;
  manner: string;
  voiced?: boolean;
  aspirated?: boolean;
  tense?: boolean;
}

export interface AcquisitionStage {
  age: string;
  phonemes: string[];
}
