export interface PracticeWord {
  word: string;
  meaning: string;
  emoji: string;
  targetPhonemes: string[];  // key consonants to practice
  difficulty: "easy" | "medium" | "hard";
  ageGroup: "2-3세" | "3-4세" | "4-5세" | "5-6세";
  sampleSentence: string;
  soundEffect?: string;      // 의성어/의태어 (onomatopoeia / mimetic word)
}

// ─── Minimal Pairs ────────────────────────────────────────────────────────────
export interface MinimalPair {
  id: string;
  word1: string;
  emoji1: string;
  word2: string;
  emoji2: string;
  targetPhoneme: string;
  contrastPhoneme: string;
  label: string;   // e.g. "ㄱ vs ㄴ 구별 연습"
}

export const MINIMAL_PAIRS: MinimalPair[] = [
  { id: "mp-dal-mal",    word1: "달",    emoji1: "🌙", word2: "말",    emoji2: "🐴", targetPhoneme: "ㄷ", contrastPhoneme: "ㅁ", label: "ㄷ vs ㅁ 구별" },
  { id: "mp-gabang-nabang", word1: "가방", emoji1: "🎒", word2: "나방", emoji2: "🦋", targetPhoneme: "ㄱ", contrastPhoneme: "ㄴ", label: "ㄱ vs ㄴ 구별" },
  { id: "mp-daligi-naligi", word1: "달리기", emoji1: "🏃", word2: "날리기", emoji2: "🎈", targetPhoneme: "ㄷ", contrastPhoneme: "ㄴ", label: "ㄷ vs ㄴ 구별" },
  { id: "mp-bada-mada",  word1: "바다",  emoji1: "🌊", word2: "마다",  emoji2: "⏰", targetPhoneme: "ㅂ", contrastPhoneme: "ㅁ", label: "ㅂ vs ㅁ 구별" },
  { id: "mp-sagwa-dagwa", word1: "사과", emoji1: "🍎", word2: "다과",  emoji2: "🍘", targetPhoneme: "ㅅ", contrastPhoneme: "ㄷ", label: "ㅅ vs ㄷ 구별" },
  { id: "mp-gorae-norae", word1: "고래", emoji1: "🐋", word2: "노래",  emoji2: "🎵", targetPhoneme: "ㄱ", contrastPhoneme: "ㄴ", label: "ㄱ vs ㄴ 구별" },
  { id: "mp-ramyeon-namyeon", word1: "라면", emoji1: "🍜", word2: "나면", emoji2: "🤔", targetPhoneme: "ㄹ", contrastPhoneme: "ㄴ", label: "ㄹ vs ㄴ 구별" },
  { id: "mp-son-jon",    word1: "손",    emoji1: "✋", word2: "존",    emoji2: "🎸", targetPhoneme: "ㅅ", contrastPhoneme: "ㅈ", label: "ㅅ vs ㅈ 구별" },
];

// Korean practice word database organized by target phoneme patterns
export const WORD_DATABASE: PracticeWord[] = [
  // ㄹ words (5-6세, hardest)
  { word: "라면", meaning: "라면", emoji: "🍜", targetPhonemes: ["ㄹ"], difficulty: "easy", ageGroup: "5-6세", sampleSentence: "엄마가 라면을 끓여요.", soundEffect: "후루룩~" },
  { word: "리본", meaning: "리본", emoji: "🎀", targetPhonemes: ["ㄹ"], difficulty: "easy", ageGroup: "5-6세", sampleSentence: "머리에 리본을 달았어요." },
  { word: "로봇", meaning: "로봇", emoji: "🤖", targetPhonemes: ["ㄹ"], difficulty: "easy", ageGroup: "5-6세", sampleSentence: "로봇이 춤을 춰요.", soundEffect: "삐빅!" },
  { word: "루돌프", meaning: "루돌프", emoji: "🦌", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "루돌프 코는 빨개요.", soundEffect: "달려라~" },
  { word: "나라", meaning: "나라", emoji: "🌍", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "우리나라는 대한민국이에요." },
  { word: "고려", meaning: "고려", emoji: "📜", targetPhonemes: ["ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "고려는 옛날 나라예요." },
  { word: "달리기", meaning: "달리기", emoji: "🏃", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "운동장에서 달리기를 해요.", soundEffect: "후다닥!" },
  { word: "별", meaning: "별", emoji: "⭐", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "밤하늘에 별이 빛나요.", soundEffect: "반짝반짝✨" },

  // ㅅ words (4-5세)
  { word: "사자", meaning: "사자", emoji: "🦁", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "사자가 으르렁거려요.", soundEffect: "으르렁~" },
  { word: "수박", meaning: "수박", emoji: "🍉", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "수박은 여름 과일이에요.", soundEffect: "아삭아삭!" },
  { word: "소", meaning: "소", emoji: "🐄", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "소는 음메 하고 울어요.", soundEffect: "음메~" },
  { word: "새", meaning: "새", emoji: "🐦", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "새가 하늘을 날아요.", soundEffect: "짹짹~" },
  { word: "사과", meaning: "사과", emoji: "🍎", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "빨간 사과가 맛있어요.", soundEffect: "아삭~" },
  { word: "손", meaning: "손", emoji: "✋", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "손을 깨끗이 씻어요." },
  { word: "시소", meaning: "시소", emoji: "🪜", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "시소를 타요.", soundEffect: "끼익끼익~" },
  { word: "서점", meaning: "서점", emoji: "📚", targetPhonemes: ["ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "서점에서 책을 사요." },

  // ㅈ words (4-5세)
  { word: "자동차", meaning: "자동차", emoji: "🚗", targetPhonemes: ["ㅈ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "자동차가 빵빵거려요.", soundEffect: "부릉부릉!" },
  { word: "잠자리", meaning: "잠자리", emoji: "🪲", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "잠자리가 날아가요.", soundEffect: "윙윙~" },
  { word: "지구", meaning: "지구", emoji: "🌍", targetPhonemes: ["ㅈ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "지구는 둥글어요." },
  { word: "조각", meaning: "조각", emoji: "🧩", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "퍼즐 조각을 맞춰요.", soundEffect: "딸깍!" },
  { word: "주스", meaning: "주스", emoji: "🧃", targetPhonemes: ["ㅈ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "주스가 달콤해요.", soundEffect: "꿀꺽~" },

  // ㅊ words (4-5세)
  { word: "차", meaning: "차", emoji: "🚕", targetPhonemes: ["ㅊ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "차를 타고 가요.", soundEffect: "부릉!" },
  { word: "채소", meaning: "채소", emoji: "🥦", targetPhonemes: ["ㅊ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "채소를 먹으면 건강해요.", soundEffect: "아삭아삭~" },
  { word: "치킨", meaning: "치킨", emoji: "🍗", targetPhonemes: ["ㅊ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "치킨이 맛있어요.", soundEffect: "냠냠~" },
  { word: "초콜릿", meaning: "초콜릿", emoji: "🍫", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초콜릿은 달콤해요.", soundEffect: "스르르~" },

  // ㄱ words (2-3세)
  { word: "고양이", meaning: "고양이", emoji: "🐱", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "고양이가 야옹 울어요.", soundEffect: "야옹~" },
  { word: "곰", meaning: "곰", emoji: "🐻", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "곰이 꿀을 좋아해요.", soundEffect: "으으~" },
  { word: "기차", meaning: "기차", emoji: "🚂", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "기차가 칙칙폭폭 달려요.", soundEffect: "칙칙폭폭!" },
  { word: "구름", meaning: "구름", emoji: "☁️", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "하늘에 구름이 떠요.", soundEffect: "둥실둥실~" },
  { word: "가방", meaning: "가방", emoji: "🎒", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "가방에 책을 넣어요." },

  // ㄴ words (2-3세)
  { word: "나비", meaning: "나비", emoji: "🦋", targetPhonemes: ["ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "나비가 꽃 위에 앉아요.", soundEffect: "팔랑팔랑~" },
  { word: "눈", meaning: "눈", emoji: "❄️", targetPhonemes: ["ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하얀 눈이 내려요.", soundEffect: "펄펄~" },
  { word: "냉장고", meaning: "냉장고", emoji: "🧊", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "냉장고에 우유가 있어요.", soundEffect: "웅웅~" },
  { word: "노래", meaning: "노래", emoji: "🎵", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "신나는 노래를 불러요.", soundEffect: "라라라~" },

  // ㅂ words (2-3세)
  { word: "바나나", meaning: "바나나", emoji: "🍌", targetPhonemes: ["ㅂ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "원숭이가 바나나를 먹어요.", soundEffect: "냠냠~" },
  { word: "버스", meaning: "버스", emoji: "🚌", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "버스를 타고 학교에 가요.", soundEffect: "부릉부릉!" },
  { word: "병아리", meaning: "병아리", emoji: "🐥", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "병아리가 삐약삐약 울어요.", soundEffect: "삐약삐약~" },
  { word: "별빛", meaning: "별빛", emoji: "✨", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "2-3세", sampleSentence: "별빛이 반짝반짝 빛나요.", soundEffect: "반짝반짝~" },

  // ㅁ words (2-3세)
  { word: "마트", meaning: "마트", emoji: "🏪", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "마트에서 과일을 사요." },
  { word: "모자", meaning: "모자", emoji: "🧢", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "빨간 모자를 써요." },
  { word: "문어", meaning: "문어", emoji: "🐙", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "문어는 다리가 여덟 개예요.", soundEffect: "꿈틀꿈틀~" },
  { word: "미끄럼틀", meaning: "미끄럼틀", emoji: "🛝", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "hard", ageGroup: "2-3세", sampleSentence: "미끄럼틀을 타요.", soundEffect: "슝~" },

  // ㄷ words (2-3세)
  { word: "달", meaning: "달", emoji: "🌙", targetPhonemes: ["ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밤에 달이 떠요." },
  { word: "도토리", meaning: "도토리", emoji: "🌰", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "다람쥐가 도토리를 모아요.", soundEffect: "데굴데굴~" },
  { word: "딸기", meaning: "딸기", emoji: "🍓", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "빨간 딸기가 달콤해요.", soundEffect: "냠냠~" },

  // ㅎ words (2-3세)
  { word: "하마", meaning: "하마", emoji: "🦛", targetPhonemes: ["ㅎ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하마는 입이 커요.", soundEffect: "으르렁!" },
  { word: "호랑이", meaning: "호랑이", emoji: "🐯", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "호랑이가 어흥 울어요.", soundEffect: "어흥~" },
  { word: "화분", meaning: "화분", emoji: "🪴", targetPhonemes: ["ㅎ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "화분에 꽃이 피었어요." },

  // Mixed/complex
  { word: "사슴", meaning: "사슴", emoji: "🦌", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사슴이 뛰어요." },
  { word: "코끼리", meaning: "코끼리", emoji: "🐘", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "코끼리 코는 길어요.", soundEffect: "뿡~" },
  { word: "토끼", meaning: "토끼", emoji: "🐰", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "토끼가 깡충깡충 뛰어요.", soundEffect: "깡충깡충!" },
  { word: "파란색", meaning: "파란색", emoji: "💙", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "하늘은 파란색이에요." },
  { word: "수레", meaning: "수레", emoji: "🛒", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수레에 짐을 실어요." },
];

export function getWordsByPhoneme(phoneme: string): PracticeWord[] {
  return WORD_DATABASE.filter((w) => w.targetPhonemes.includes(phoneme));
}

export function getWordByText(word: string): PracticeWord | undefined {
  return WORD_DATABASE.find((w) => w.word === word);
}

export function getAllWords(): PracticeWord[] {
  return WORD_DATABASE;
}

export function getMinimalPairsByPhoneme(phoneme: string): MinimalPair[] {
  return MINIMAL_PAIRS.filter(
    (p) => p.targetPhoneme === phoneme || p.contrastPhoneme === phoneme
  );
}

/** Returns words sorted by difficulty (easy first) for a given phoneme */
export function getWordsByDifficulty(phoneme: string, difficulty: "easy" | "medium" | "hard"): PracticeWord[] {
  return WORD_DATABASE.filter(
    (w) => w.targetPhonemes.includes(phoneme) && w.difficulty === difficulty
  );
}
