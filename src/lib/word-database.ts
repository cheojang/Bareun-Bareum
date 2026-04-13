export interface PracticeWord {
  word: string;
  meaning: string;
  emoji: string;
  targetPhonemes: string[];
  difficulty: "easy" | "medium" | "hard";
  ageGroup: "2-3세" | "3-4세" | "4-5세" | "5-6세";
  sampleSentence: string;
  soundEffect?: string;
}

export interface MinimalPair {
  id: string;
  word1: string;
  emoji1: string;
  word2: string;
  emoji2: string;
  targetPhoneme: string;
  contrastPhoneme: string;
  label: string;
}

export const MINIMAL_PAIRS: MinimalPair[] = [
  { id: "mp-dal-mal",       word1: "달",    emoji1: "🌙", word2: "말",    emoji2: "🐴", targetPhoneme: "ㄷ", contrastPhoneme: "ㅁ", label: "ㄷ vs ㅁ 구별" },
  { id: "mp-gabang-nabang", word1: "가방",  emoji1: "🎒", word2: "나방",  emoji2: "🦋", targetPhoneme: "ㄱ", contrastPhoneme: "ㄴ", label: "ㄱ vs ㄴ 구별" },
  { id: "mp-daligi-naligi", word1: "달리기",emoji1: "🏃", word2: "날리기",emoji2: "🎈", targetPhoneme: "ㄷ", contrastPhoneme: "ㄴ", label: "ㄷ vs ㄴ 구별" },
  { id: "mp-bada-mada",     word1: "바다",  emoji1: "🌊", word2: "마다",  emoji2: "⏰", targetPhoneme: "ㅂ", contrastPhoneme: "ㅁ", label: "ㅂ vs ㅁ 구별" },
  { id: "mp-sagwa-dagwa",   word1: "사과",  emoji1: "🍎", word2: "다과",  emoji2: "🍘", targetPhoneme: "ㅅ", contrastPhoneme: "ㄷ", label: "ㅅ vs ㄷ 구별" },
  { id: "mp-gorae-norae",   word1: "고래",  emoji1: "🐋", word2: "노래",  emoji2: "🎵", targetPhoneme: "ㄱ", contrastPhoneme: "ㄴ", label: "ㄱ vs ㄴ 구별" },
  { id: "mp-ramyeon-namyeon",word1:"라면",  emoji1: "🍜", word2: "나면",  emoji2: "🤔", targetPhoneme: "ㄹ", contrastPhoneme: "ㄴ", label: "ㄹ vs ㄴ 구별" },
  { id: "mp-son-jon",       word1: "손",    emoji1: "✋", word2: "존",    emoji2: "🎸", targetPhoneme: "ㅅ", contrastPhoneme: "ㅈ", label: "ㅅ vs ㅈ 구별" },
  { id: "mp-bul-mul",       word1: "불",    emoji1: "🔥", word2: "물",    emoji2: "💧", targetPhoneme: "ㅂ", contrastPhoneme: "ㅁ", label: "ㅂ vs ㅁ 구별" },
  { id: "mp-gom-dom",       word1: "곰",    emoji1: "🐻", word2: "돔",    emoji2: "🐟", targetPhoneme: "ㄱ", contrastPhoneme: "ㄷ", label: "ㄱ vs ㄷ 구별" },
  { id: "mp-jip-zip",       word1: "집",    emoji1: "🏠", word2: "짚",    emoji2: "🌾", targetPhoneme: "ㅈ", contrastPhoneme: "ㅉ", label: "ㅈ vs ㅉ 구별" },
  { id: "mp-chal-sal",      word1: "찰",    emoji1: "🌾", word2: "살",    emoji2: "🥩", targetPhoneme: "ㅊ", contrastPhoneme: "ㅅ", label: "ㅊ vs ㅅ 구별" },
  { id: "mp-pal-mal",       word1: "팔",    emoji1: "💪", word2: "말",    emoji2: "🐴", targetPhoneme: "ㅍ", contrastPhoneme: "ㅁ", label: "ㅍ vs ㅁ 구별" },
  { id: "mp-nun-dun",       word1: "눈",    emoji1: "👁️", word2: "돈",    emoji2: "💰", targetPhoneme: "ㄴ", contrastPhoneme: "ㄷ", label: "ㄴ vs ㄷ 구별" },
  { id: "mp-bap-map",       word1: "밥",    emoji1: "🍚", word2: "맙",    emoji2: "🙏", targetPhoneme: "ㅂ", contrastPhoneme: "ㅁ", label: "ㅂ vs ㅁ 구별" },
  { id: "mp-podo-bodo",     word1: "포도",  emoji1: "🍇", word2: "보도",  emoji2: "🚶", targetPhoneme: "ㅍ", contrastPhoneme: "ㅂ", label: "ㅍ vs ㅂ 구별" },
];

export const WORD_DATABASE: PracticeWord[] = [
  // ══════════════════════════════════════════════════════════
  // ㄹ — 유음 (5-6세, 가장 늦게 완성되는 소리)
  // ══════════════════════════════════════════════════════════
  { word: "라면",    meaning: "라면",    emoji: "🍜", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "엄마가 라면을 끓여요.",      soundEffect: "후루룩~" },
  { word: "리본",    meaning: "리본",    emoji: "🎀", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "머리에 리본을 달았어요." },
  { word: "로봇",    meaning: "로봇",    emoji: "🤖", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "로봇이 춤을 춰요.",          soundEffect: "삐빅!" },
  { word: "루돌프",  meaning: "루돌프",  emoji: "🦌", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "루돌프 코는 빨개요." },
  { word: "레몬",    meaning: "레몬",    emoji: "🍋", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "레몬은 새콤해요.",           soundEffect: "새콤~" },
  { word: "리모컨",  meaning: "리모컨",  emoji: "📱", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "리모컨으로 TV를 켜요." },
  { word: "라디오",  meaning: "라디오",  emoji: "📻", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "라디오에서 노래가 나와요." },
  { word: "레고",    meaning: "레고",    emoji: "🧱", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "레고로 집을 만들어요.",      soundEffect: "딸깍딸깍~" },
  { word: "라켓",    meaning: "라켓",    emoji: "🎾", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "라켓으로 공을 쳐요." },
  { word: "로켓",    meaning: "로켓",    emoji: "🚀", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "로켓이 하늘로 날아가요.",   soundEffect: "슝~" },
  { word: "나라",    meaning: "나라",    emoji: "🌍", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "우리나라는 대한민국이에요." },
  { word: "노래",    meaning: "노래",    emoji: "🎵", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "신나는 노래를 불러요.",     soundEffect: "라라라~" },
  { word: "모래",    meaning: "모래",    emoji: "🏖️", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "모래로 성을 만들어요.",     soundEffect: "사르르~" },
  { word: "바람",    meaning: "바람",    emoji: "💨", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "바람이 쌩쌩 불어요.",       soundEffect: "쌩쌩~" },
  { word: "사랑",    meaning: "사랑",    emoji: "❤️", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "엄마 사랑해요." },
  { word: "다람쥐",  meaning: "다람쥐",  emoji: "🐿️", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "다람쥐가 도토리를 먹어요.", soundEffect: "냠냠~" },
  { word: "달리기",  meaning: "달리기",  emoji: "🏃", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "운동장에서 달리기를 해요.", soundEffect: "후다닥!" },
  { word: "별",      meaning: "별",      emoji: "⭐", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "밤하늘에 별이 빛나요.",     soundEffect: "반짝반짝~" },
  { word: "달",      meaning: "달",      emoji: "🌙", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "밤에 달이 떠요." },
  { word: "물",      meaning: "물",      emoji: "💧", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "물을 마셔요.",              soundEffect: "꿀꺽~" },
  { word: "말",      meaning: "말",      emoji: "🐴", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "말이 달려가요.",            soundEffect: "히히힝~" },
  { word: "하늘",    meaning: "하늘",    emoji: "🌤️", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "파란 하늘을 봐요." },
  { word: "물고기",  meaning: "물고기",  emoji: "🐟", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "물고기가 헤엄쳐요.",        soundEffect: "첨벙~" },
  { word: "얼음",    meaning: "얼음",    emoji: "🧊", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "얼음이 차가워요." },
  { word: "날개",    meaning: "날개",    emoji: "🦅", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "새가 날개를 펼쳐요.",       soundEffect: "팔랑팔랑~" },
  { word: "달팽이",  meaning: "달팽이",  emoji: "🐌", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "달팽이가 천천히 기어요.",   soundEffect: "느릿느릿~" },
  { word: "빨대",    meaning: "빨대",    emoji: "🥤", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빨대로 주스를 마셔요.",     soundEffect: "쭈르르~" },
  { word: "여름",    meaning: "여름",    emoji: "☀️", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "여름에 수영해요.",          soundEffect: "첨벙~" },
  { word: "겨울",    meaning: "겨울",    emoji: "❄️", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "겨울에 눈이 와요.",         soundEffect: "펄펄~" },
  { word: "가을",    meaning: "가을",    emoji: "🍂", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "가을에 단풍이 들어요.",     soundEffect: "바스락~" },
  { word: "팔",      meaning: "팔",      emoji: "💪", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "팔을 흔들어요." },
  { word: "발",      meaning: "발",      emoji: "🦶", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "발로 뛰어요.",              soundEffect: "쿵쿵~" },
  { word: "불",      meaning: "불",      emoji: "🔥", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "불이 뜨거워요.",            soundEffect: "활활~" },
  { word: "길",      meaning: "길",      emoji: "🛣️", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "길을 걸어요." },
  { word: "구름",    meaning: "구름",    emoji: "☁️", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "하늘에 구름이 떠요.",       soundEffect: "둥실둥실~" },
  { word: "이름",    meaning: "이름",    emoji: "📛", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "내 이름은 뭐예요?" },
  { word: "열매",    meaning: "열매",    emoji: "🍎", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나무에 열매가 달렸어요." },
  { word: "알람",    meaning: "알람",    emoji: "⏰", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "알람이 울려요.",            soundEffect: "따르릉~" },
  { word: "공룡",    meaning: "공룡",    emoji: "🦕", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "공룡이 크고 무서워요.",     soundEffect: "우르릉~" },
  { word: "풍선",    meaning: "풍선",    emoji: "🎈", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "풍선이 하늘로 날아가요.",   soundEffect: "펑!" },
  { word: "돌고래",  meaning: "돌고래",  emoji: "🐬", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "돌고래가 헤엄쳐요.",        soundEffect: "첨벙~" },
  { word: "올챙이",  meaning: "올챙이",  emoji: "🐸", targetPhonemes: ["ㄹ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "올챙이가 개구리가 돼요." },
  { word: "파란색",  meaning: "파란색",  emoji: "💙", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "하늘은 파란색이에요." },
  { word: "노란색",  meaning: "노란색",  emoji: "💛", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "바나나는 노란색이에요." },
  { word: "초록색",  meaning: "초록색",  emoji: "💚", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "잎사귀는 초록색이에요." },
  { word: "빨간색",  meaning: "빨간색",  emoji: "❤️", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "딸기는 빨간색이에요." },
  { word: "수레",    meaning: "수레",    emoji: "🛒", targetPhonemes: ["ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수레에 짐을 실어요." },
  { word: "하루",    meaning: "하루",    emoji: "📅", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "오늘 하루도 즐거워요." },
  { word: "마을",    meaning: "마을",    emoji: "🏘️", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "우리 마을은 예뻐요." },
  { word: "호루라기",meaning: "호루라기",emoji: "📯", targetPhonemes: ["ㄹ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "호루라기를 불어요.",         soundEffect: "삐~" },

  // ══════════════════════════════════════════════════════════
  // ㅅ — 치조 마찰음 (4-5세)
  // ══════════════════════════════════════════════════════════
  { word: "사자",    meaning: "사자",    emoji: "🦁", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "사자가 으르렁거려요.",     soundEffect: "으르렁~" },
  { word: "수박",    meaning: "수박",    emoji: "🍉", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "수박은 달고 시원해요.",     soundEffect: "아삭~" },
  { word: "소",      meaning: "소",      emoji: "🐄", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "소가 음메 울어요.",         soundEffect: "음메~" },
  { word: "새",      meaning: "새",      emoji: "🐦", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "새가 하늘을 날아요.",       soundEffect: "짹짹~" },
  { word: "사과",    meaning: "사과",    emoji: "🍎", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "빨간 사과가 맛있어요.",     soundEffect: "아삭~" },
  { word: "손",      meaning: "손",      emoji: "✋", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "손을 깨끗이 씻어요." },
  { word: "시소",    meaning: "시소",    emoji: "⚖️", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "시소를 타요.",              soundEffect: "끼익~" },
  { word: "사탕",    meaning: "사탕",    emoji: "🍬", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "사탕이 달콤해요.",          soundEffect: "냠냠~" },
  { word: "소파",    meaning: "소파",    emoji: "🛋️", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "소파에 앉아요." },
  { word: "사슴",    meaning: "사슴",    emoji: "🦌", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사슴이 뛰어요." },
  { word: "사진",    meaning: "사진",    emoji: "📷", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사진을 찍어요.",            soundEffect: "찰칵~" },
  { word: "시장",    meaning: "시장",    emoji: "🏪", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "시장에서 과일을 사요." },
  { word: "소리",    meaning: "소리",    emoji: "🔊", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "소리를 잘 들어요." },
  { word: "신발",    meaning: "신발",    emoji: "👟", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "신발을 신어요." },
  { word: "선물",    meaning: "선물",    emoji: "🎁", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "선물을 받았어요.",          soundEffect: "와~" },
  { word: "숟가락",  meaning: "숟가락",  emoji: "🥄", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "숟가락으로 밥을 먹어요." },
  { word: "솜사탕",  meaning: "솜사탕",  emoji: "🍭", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "솜사탕이 달콤해요.",        soundEffect: "사르르~" },
  { word: "소풍",    meaning: "소풍",    emoji: "🧺", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "소풍 가서 도시락 먹어요." },
  { word: "식빵",    meaning: "식빵",    emoji: "🍞", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "식빵을 먹어요." },
  { word: "상어",    meaning: "상어",    emoji: "🦈", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "상어가 헤엄쳐요.",          soundEffect: "으~ 무서워!" },
  { word: "시계",    meaning: "시계",    emoji: "⏰", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "시계가 똑딱거려요.",         soundEffect: "똑딱똑딱~" },
  { word: "소금",    meaning: "소금",    emoji: "🧂", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "소금은 짜요." },
  { word: "수영",    meaning: "수영",    emoji: "🏊", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "수영장에서 수영해요.",       soundEffect: "첨벙첨벙~" },
  { word: "수건",    meaning: "수건",    emoji: "🧻", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "수건으로 닦아요." },
  { word: "색연필",  meaning: "색연필",  emoji: "🖍️", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "색연필로 그림을 그려요." },
  { word: "선생님",  meaning: "선생님",  emoji: "👩‍🏫", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "선생님께 인사해요." },
  { word: "수달",    meaning: "수달",    emoji: "🦦", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "수달이 강에서 헤엄쳐요." },
  { word: "사다리",  meaning: "사다리",  emoji: "🪜", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사다리를 올라가요." },
  { word: "수족관",  meaning: "수족관",  emoji: "🐠", targetPhonemes: ["ㅅ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "수족관에 물고기가 많아요." },
  { word: "스티커",  meaning: "스티커",  emoji: "⭐", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "스티커를 붙여요." },

  // ══════════════════════════════════════════════════════════
  // ㅈ — 치조구개 파찰음 (4-5세)
  // ══════════════════════════════════════════════════════════
  { word: "자동차",  meaning: "자동차",  emoji: "🚗", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "자동차가 빵빵거려요.",     soundEffect: "부릉부릉!" },
  { word: "잠자리",  meaning: "잠자리",  emoji: "🪲", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "잠자리가 날아가요.",        soundEffect: "윙윙~" },
  { word: "지구",    meaning: "지구",    emoji: "🌍", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "지구는 둥글어요." },
  { word: "주스",    meaning: "주스",    emoji: "🧃", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "주스가 달콤해요.",          soundEffect: "꿀꺽~" },
  { word: "자전거",  meaning: "자전거",  emoji: "🚲", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "자전거를 타요.",            soundEffect: "씽씽~" },
  { word: "지우개",  meaning: "지우개",  emoji: "🧹", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "지우개로 지워요." },
  { word: "장난감",  meaning: "장난감",  emoji: "🧸", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "장난감으로 놀아요." },
  { word: "조개",    meaning: "조개",    emoji: "🐚", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "조개를 주웠어요.",          soundEffect: "파도 소리~" },
  { word: "젓가락",  meaning: "젓가락",  emoji: "🥢", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "젓가락으로 반찬을 집어요." },
  { word: "자석",    meaning: "자석",    emoji: "🧲", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "자석이 철을 끌어당겨요." },
  { word: "지렁이",  meaning: "지렁이",  emoji: "🪱", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "지렁이가 땅속에 있어요." },
  { word: "집",      meaning: "집",      emoji: "🏠", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "우리 집이 예뻐요." },
  { word: "젤리",    meaning: "젤리",    emoji: "🍮", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "젤리가 쫄깃해요.",          soundEffect: "쫄깃쫄깃~" },
  { word: "장갑",    meaning: "장갑",    emoji: "🧤", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "장갑을 끼어요." },
  { word: "전화기",  meaning: "전화기",  emoji: "📞", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "전화기로 통화해요.",        soundEffect: "따르릉~" },
  { word: "지하철",  meaning: "지하철",  emoji: "🚇", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "지하철을 타요." },
  { word: "저금통",  meaning: "저금통",  emoji: "🏦", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "저금통에 동전을 넣어요.",   soundEffect: "짤랑~" },
  { word: "자장가",  meaning: "자장가",  emoji: "🎵", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "자장가를 들으며 자요.",     soundEffect: "자장자장~" },
  { word: "지팡이",  meaning: "지팡이",  emoji: "🦯", targetPhonemes: ["ㅈ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "지팡이를 짚어요." },
  { word: "재미",    meaning: "재미",    emoji: "😄", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "놀이가 재미있어요." },
  { word: "재채기",  meaning: "재채기",  emoji: "🤧", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "재채기가 나요.",            soundEffect: "에취!" },
  { word: "조각",    meaning: "조각",    emoji: "🧩", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "퍼즐 조각을 맞춰요.",      soundEffect: "딸깍!" },
  { word: "지갑",    meaning: "지갑",    emoji: "👛", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "지갑에 돈이 있어요." },
  { word: "주머니",  meaning: "주머니",  emoji: "👝", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "주머니에 손을 넣어요." },
  { word: "진달래",  meaning: "진달래",  emoji: "🌸", targetPhonemes: ["ㅈ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "봄에 진달래가 피어요." },

  // ══════════════════════════════════════════════════════════
  // ㅊ — 치조구개 파찰음 격음 (4-5세)
  // ══════════════════════════════════════════════════════════
  { word: "차",      meaning: "차",      emoji: "🚕", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "차를 타고 가요.",           soundEffect: "부릉!" },
  { word: "채소",    meaning: "채소",    emoji: "🥦", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "채소를 먹으면 건강해요.",   soundEffect: "아삭아삭~" },
  { word: "치킨",    meaning: "치킨",    emoji: "🍗", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "치킨이 맛있어요.",          soundEffect: "냠냠~" },
  { word: "초콜릿",  meaning: "초콜릿",  emoji: "🍫", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초콜릿은 달콤해요.", soundEffect: "스르르~" },
  { word: "축구",    meaning: "축구",    emoji: "⚽", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "축구공을 차요.",            soundEffect: "뻥!" },
  { word: "책",      meaning: "책",      emoji: "📚", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "책을 읽어요." },
  { word: "침대",    meaning: "침대",    emoji: "🛏️", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "침대에서 자요." },
  { word: "창문",    meaning: "창문",    emoji: "🪟", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "창문을 열어요." },
  { word: "참새",    meaning: "참새",    emoji: "🐦", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "참새가 짹짹 울어요.",       soundEffect: "짹짹~" },
  { word: "청소기",  meaning: "청소기",  emoji: "🧹", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "청소기로 먼지를 빨아요.",   soundEffect: "윙윙~" },
  { word: "치약",    meaning: "치약",    emoji: "🪥", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "치약으로 이를 닦아요." },
  { word: "촛불",    meaning: "촛불",    emoji: "🕯️", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "촛불이 반짝여요.",          soundEffect: "훅~" },
  { word: "치즈",    meaning: "치즈",    emoji: "🧀", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "치즈가 맛있어요.",          soundEffect: "냠냠~" },
  { word: "춤",      meaning: "춤",      emoji: "💃", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "신나게 춤을 춰요.",         soundEffect: "신나~" },
  { word: "철봉",    meaning: "철봉",    emoji: "🏋️", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "철봉에 매달려요." },
  { word: "천둥",    meaning: "천둥",    emoji: "⛈️", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "천둥이 우르릉 소리가 나요.", soundEffect: "우르릉~" },
  { word: "청개구리",meaning: "청개구리",emoji: "🐸", targetPhonemes: ["ㅊ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "청개구리가 개굴개굴 울어요.", soundEffect: "개굴~" },

  // ══════════════════════════════════════════════════════════
  // ㄱ — 연구개 파열음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "고양이",  meaning: "고양이",  emoji: "🐱", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "고양이가 야옹 울어요.",     soundEffect: "야옹~" },
  { word: "곰",      meaning: "곰",      emoji: "🐻", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "곰이 꿀을 좋아해요.",       soundEffect: "으으~" },
  { word: "기차",    meaning: "기차",    emoji: "🚂", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "기차가 달려요.",            soundEffect: "칙칙폭폭!" },
  { word: "가방",    meaning: "가방",    emoji: "🎒", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "가방에 책을 넣어요." },
  { word: "강아지",  meaning: "강아지",  emoji: "🐶", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "강아지가 멍멍 짖어요.",     soundEffect: "멍멍~" },
  { word: "기린",    meaning: "기린",    emoji: "🦒", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "기린의 목이 길어요." },
  { word: "거미",    meaning: "거미",    emoji: "🕷️", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거미가 줄을 타요." },
  { word: "개구리",  meaning: "개구리",  emoji: "🐸", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "개구리가 개굴개굴 울어요.", soundEffect: "개굴개굴~" },
  { word: "귤",      meaning: "귤",      emoji: "🍊", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "귤이 새콤달콤해요.",        soundEffect: "새콤~" },
  { word: "그네",    meaning: "그네",    emoji: "🎡", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "그네를 타요.",              soundEffect: "씽씽~" },
  { word: "가위",    meaning: "가위",    emoji: "✂️", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "가위로 종이를 잘라요.",     soundEffect: "싹둑~" },
  { word: "거울",    meaning: "거울",    emoji: "🪞", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거울을 봐요." },
  { word: "고구마",  meaning: "고구마",  emoji: "🍠", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "고구마가 달콤해요.",        soundEffect: "냠냠~" },
  { word: "감자",    meaning: "감자",    emoji: "🥔", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "감자를 삶아요." },
  { word: "게",      meaning: "게",      emoji: "🦀", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "게가 옆으로 걸어요.",       soundEffect: "집게!" },
  { word: "거북이",  meaning: "거북이",  emoji: "🐢", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거북이가 느릿느릿 가요.",   soundEffect: "느릿느릿~" },
  { word: "공",      meaning: "공",      emoji: "⚽", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "공을 던져요.",              soundEffect: "통통~" },
  { word: "고래",    meaning: "고래",    emoji: "🐳", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "고래가 물을 뿜어요.", soundEffect: "쏴~" },
  { word: "고릴라",  meaning: "고릴라",  emoji: "🦍", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "고릴라가 나무를 타요." },
  { word: "가지",    meaning: "가지",    emoji: "🍆", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "가지를 먹어요." },
  { word: "국수",    meaning: "국수",    emoji: "🍜", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "국수가 길고 맛있어요.",     soundEffect: "후루룩~" },
  { word: "귀",      meaning: "귀",      emoji: "👂", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "귀로 소리를 들어요." },
  { word: "극장",    meaning: "극장",    emoji: "🎭", targetPhonemes: ["ㄱ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "극장에서 영화를 봐요." },

  // ══════════════════════════════════════════════════════════
  // ㄴ — 치조 비음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "나비",    meaning: "나비",    emoji: "🦋", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "나비가 꽃 위에 앉아요.",   soundEffect: "팔랑팔랑~" },
  { word: "눈",      meaning: "눈",      emoji: "❄️", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "하얀 눈이 내려요.",         soundEffect: "펄펄~" },
  { word: "냉장고",  meaning: "냉장고",  emoji: "🧊", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "냉장고에 우유가 있어요.",   soundEffect: "웅웅~" },
  { word: "나무",    meaning: "나무",    emoji: "🌳", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "나무가 높이 자라요." },
  { word: "냄비",    meaning: "냄비",    emoji: "🍲", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "냄비에 국을 끓여요.",       soundEffect: "보글보글~" },
  { word: "나팔",    meaning: "나팔",    emoji: "🎺", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나팔을 불어요.", soundEffect: "빠라밤~" },
  { word: "낙타",    meaning: "낙타",    emoji: "🐫", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "낙타가 사막을 걸어요." },
  { word: "놀이터",  meaning: "놀이터",  emoji: "🛝", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "놀이터에서 놀아요.", soundEffect: "까르르~" },
  { word: "눈물",    meaning: "눈물",    emoji: "😢", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "눈물이 뚝뚝 흘러요.", soundEffect: "뚝뚝~" },
  { word: "나물",    meaning: "나물",    emoji: "🥬", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나물을 먹어요." },
  { word: "낮잠",    meaning: "낮잠",    emoji: "😴", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "낮잠을 자요.",              soundEffect: "쿨쿨~" },
  { word: "노트",    meaning: "노트",    emoji: "📔", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "노트에 글씨를 써요." },
  { word: "누나",    meaning: "누나",    emoji: "👩", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "누나가 예뻐요." },
  { word: "낙엽",    meaning: "낙엽",    emoji: "🍂", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "낙엽이 바스락거려요.", soundEffect: "바스락~" },
  { word: "너구리",  meaning: "너구리",  emoji: "🦝", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "너구리가 뒤뚱거려요." },
  { word: "냉면",    meaning: "냉면",    emoji: "🍜", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "냉면이 시원해요.",    soundEffect: "후루룩~" },
  { word: "노루",    meaning: "노루",    emoji: "🦌", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "노루가 뛰어요." },
  { word: "무지개",  meaning: "무지개",  emoji: "🌈", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "비 온 뒤에 무지개가 떠요." },

  // ══════════════════════════════════════════════════════════
  // ㄷ — 치조 파열음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "도토리",  meaning: "도토리",  emoji: "🌰", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "다람쥐가 도토리를 모아요.", soundEffect: "데굴데굴~" },
  { word: "딸기",    meaning: "딸기",    emoji: "🍓", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "빨간 딸기가 달콤해요.", soundEffect: "냠냠~" },
  { word: "당근",    meaning: "당근",    emoji: "🥕", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "당근을 먹어요.",            soundEffect: "아삭~" },
  { word: "돼지",    meaning: "돼지",    emoji: "🐷", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "돼지가 꿀꿀 울어요.",       soundEffect: "꿀꿀~" },
  { word: "동생",    meaning: "동생",    emoji: "👶", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "동생이 귀여워요." },
  { word: "도넛",    meaning: "도넛",    emoji: "🍩", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "도넛이 맛있어요.",          soundEffect: "냠냠~" },
  { word: "달걀",    meaning: "달걀",    emoji: "🥚", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "달걀을 삶아요." },
  { word: "도서관",  meaning: "도서관",  emoji: "📚", targetPhonemes: ["ㄷ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "도서관에서 책을 읽어요." },
  { word: "다리",    meaning: "다리",    emoji: "🦵", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "다리로 뛰어요." },
  { word: "도마뱀",  meaning: "도마뱀",  emoji: "🦎", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "도마뱀이 기어가요." },
  { word: "독수리",  meaning: "독수리",  emoji: "🦅", targetPhonemes: ["ㄷ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "독수리가 높이 날아요." },
  { word: "도화지",  meaning: "도화지",  emoji: "📄", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "도화지에 그림을 그려요." },
  { word: "두더지",  meaning: "두더지",  emoji: "🐾", targetPhonemes: ["ㄷ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "두더지가 땅을 파요." },
  { word: "도깨비",  meaning: "도깨비",  emoji: "👹", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "도깨비가 나타났어요.",      soundEffect: "으~ 무서워!" },
  { word: "달고나",  meaning: "달고나",  emoji: "🍮", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "달고나가 달콤해요." },
  { word: "대나무",  meaning: "대나무",  emoji: "🎋", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "판다가 대나무를 먹어요." },
  { word: "두루미",  meaning: "두루미",  emoji: "🕊️", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "두루미가 날아가요." },

  // ══════════════════════════════════════════════════════════
  // ㅂ — 양순 파열음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "바나나",  meaning: "바나나",  emoji: "🍌", targetPhonemes: ["ㅂ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "원숭이가 바나나를 먹어요.", soundEffect: "냠냠~" },
  { word: "버스",    meaning: "버스",    emoji: "🚌", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "버스를 타고 가요.",         soundEffect: "부릉부릉!" },
  { word: "병아리",  meaning: "병아리",  emoji: "🐥", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "병아리가 삐약삐약 울어요.", soundEffect: "삐약~" },
  { word: "별빛",    meaning: "별빛",    emoji: "✨", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "2-3세", sampleSentence: "별빛이 반짝반짝 빛나요.", soundEffect: "반짝반짝~" },
  { word: "부엉이",  meaning: "부엉이",  emoji: "🦉", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "부엉이가 부엉부엉 울어요.", soundEffect: "부엉부엉~" },
  { word: "버섯",    meaning: "버섯",    emoji: "🍄", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "버섯이 숲속에 있어요." },
  { word: "바다",    meaning: "바다",    emoji: "🌊", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "바다가 넓어요.",            soundEffect: "파도 철썩~" },
  { word: "배",      meaning: "배",      emoji: "🍐", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "배가 달콤해요.",            soundEffect: "아삭~" },
  { word: "봄",      meaning: "봄",      emoji: "🌸", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "봄에 꽃이 피어요." },
  { word: "번개",    meaning: "번개",    emoji: "⚡", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "번개가 번쩍 쳐요.",         soundEffect: "번쩍!" },
  { word: "바위",    meaning: "바위",    emoji: "🪨", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "바위가 크고 무거워요." },
  { word: "배추",    meaning: "배추",    emoji: "🥬", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "배추로 김치를 만들어요." },
  { word: "비행기",  meaning: "비행기",  emoji: "✈️", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "비행기가 하늘을 날아요.",   soundEffect: "윙~" },
  { word: "반딧불이",meaning: "반딧불이",emoji: "✨", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "반딧불이가 반짝여요.",   soundEffect: "반짝반짝~" },
  { word: "빗자루",  meaning: "빗자루",  emoji: "🧹", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "빗자루로 쓸어요." },
  { word: "병원",    meaning: "병원",    emoji: "🏥", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "병원에 가요." },
  { word: "불꽃",    meaning: "불꽃",    emoji: "🎆", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "불꽃놀이가 예뻐요.",    soundEffect: "펑펑~" },
  { word: "빵",      meaning: "빵",      emoji: "🍞", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "빵을 먹어요.",              soundEffect: "냠냠~" },

  // ══════════════════════════════════════════════════════════
  // ㅁ — 양순 비음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "마트",    meaning: "마트",    emoji: "🏪", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "마트에서 과일을 사요." },
  { word: "모자",    meaning: "모자",    emoji: "🧢", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "빨간 모자를 써요." },
  { word: "문어",    meaning: "문어",    emoji: "🐙", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "문어는 다리가 여덟 개예요.", soundEffect: "꿈틀꿈틀~" },
  { word: "미끄럼틀",meaning: "미끄럼틀",emoji: "🛝", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "hard", ageGroup: "2-3세", sampleSentence: "미끄럼틀을 타요.",     soundEffect: "슝~" },
  { word: "메뚜기",  meaning: "메뚜기",  emoji: "🦗", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "메뚜기가 풀밭에 있어요." },
  { word: "목도리",  meaning: "목도리",  emoji: "🧣", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "목도리를 목에 감아요." },
  { word: "물감",    meaning: "물감",    emoji: "🎨", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "물감으로 그림을 그려요." },
  { word: "마이크",  meaning: "마이크",  emoji: "🎤", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "마이크에 대고 노래해요.",  soundEffect: "라라라~" },
  { word: "망원경",  meaning: "망원경",  emoji: "🔭", targetPhonemes: ["ㅁ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "망원경으로 별을 봐요." },
  { word: "만두",    meaning: "만두",    emoji: "🥟", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "만두가 맛있어요.",          soundEffect: "냠냠~" },
  { word: "매미",    meaning: "매미",    emoji: "🦗", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "매미가 맴맴 울어요.",       soundEffect: "맴맴~" },
  { word: "모기",    meaning: "모기",    emoji: "🦟", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "모기가 윙윙거려요.",        soundEffect: "윙윙~" },
  { word: "먹구름",  meaning: "먹구름",  emoji: "⛈️", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "먹구름이 몰려와요." },
  { word: "무당벌레",meaning: "무당벌레",emoji: "🐞", targetPhonemes: ["ㅁ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "무당벌레가 예뻐요." },
  { word: "메론",    meaning: "메론",    emoji: "🍈", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "메론이 달콤해요.",     soundEffect: "냠냠~" },
  { word: "망고",    meaning: "망고",    emoji: "🥭", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "망고가 달콤해요.",          soundEffect: "냠냠~" },
  { word: "마스크",  meaning: "마스크",  emoji: "😷", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "마스크를 써요." },
  { word: "모래성",  meaning: "모래성",  emoji: "🏰", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "모래성을 만들어요." },

  // ══════════════════════════════════════════════════════════
  // ㅎ — 성문 마찰음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "하마",    meaning: "하마",    emoji: "🦛", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "하마는 입이 커요.",         soundEffect: "으르렁!" },
  { word: "호랑이",  meaning: "호랑이",  emoji: "🐯", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "호랑이가 어흥 울어요.", soundEffect: "어흥~" },
  { word: "화분",    meaning: "화분",    emoji: "🪴", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "화분에 꽃이 피었어요." },
  { word: "해",      meaning: "해",      emoji: "🌞", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "해가 반짝반짝 빛나요.",     soundEffect: "반짝반짝~" },
  { word: "호박",    meaning: "호박",    emoji: "🎃", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "호박이 크고 둥글어요." },
  { word: "해바라기",meaning: "해바라기",emoji: "🌻", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "해바라기가 해를 봐요." },
  { word: "헬리콥터",meaning: "헬리콥터",emoji: "🚁", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "헬리콥터가 하늘을 날아요.", soundEffect: "두두두두~" },
  { word: "호떡",    meaning: "호떡",    emoji: "🥞", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "호떡이 달콤해요.",          soundEffect: "지글지글~" },
  { word: "해파리",  meaning: "해파리",  emoji: "🪼", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "해파리가 둥둥 떠요." },
  { word: "학교",    meaning: "학교",    emoji: "🏫", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "학교에 가요." },
  { word: "호수",    meaning: "호수",    emoji: "🌊", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "호수에 오리가 있어요." },
  { word: "하품",    meaning: "하품",    emoji: "😮", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "하품이 나와요.",            soundEffect: "하~암" },
  { word: "허수아비",meaning: "허수아비",emoji: "🌾", targetPhonemes: ["ㅎ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "허수아비가 논에 있어요." },
  { word: "화장실",  meaning: "화장실",  emoji: "🚽", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "화장실에 가요." },
  { word: "흙",      meaning: "흙",      emoji: "🌱", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "흙을 만져요." },

  // ══════════════════════════════════════════════════════════
  // ㅌ — 치조 파열음 격음 (3-4세)
  // ══════════════════════════════════════════════════════════
  { word: "토끼",    meaning: "토끼",    emoji: "🐰", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "토끼가 깡충깡충 뛰어요.",   soundEffect: "깡충깡충!" },
  { word: "타조",    meaning: "타조",    emoji: "🦤", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "타조가 빨리 달려요." },
  { word: "태양",    meaning: "태양",    emoji: "☀️", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "태양이 뜨거워요." },
  { word: "토마토",  meaning: "토마토",  emoji: "🍅", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "토마토가 빨개요.",          soundEffect: "아삭~" },
  { word: "트럭",    meaning: "트럭",    emoji: "🚛", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "트럭이 짐을 실어요.",       soundEffect: "부릉부릉!" },
  { word: "터널",    meaning: "터널",    emoji: "🚇", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "터널을 지나가요.",          soundEffect: "윙~" },
  { word: "탱크",    meaning: "탱크",    emoji: "🛡️", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "탱크가 크고 무거워요." },
  { word: "태풍",    meaning: "태풍",    emoji: "🌀", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "태풍이 거세게 불어요.",     soundEffect: "쌩쌩~" },
  { word: "턱",      meaning: "턱",      emoji: "🦷", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "턱을 만져요." },
  { word: "텔레비전",meaning: "텔레비전",emoji: "📺", targetPhonemes: ["ㅌ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "텔레비전을 봐요." },
  { word: "튀김",    meaning: "튀김",    emoji: "🍤", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "튀김이 바삭바삭해요.",      soundEffect: "바삭바삭~" },
  { word: "탑",      meaning: "탑",      emoji: "🗼", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "탑이 높이 솟아 있어요." },
  { word: "택시",    meaning: "택시",    emoji: "🚕", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "택시를 타요." },

  // ══════════════════════════════════════════════════════════
  // ㅍ — 양순 파열음 격음 (3-4세)
  // ══════════════════════════════════════════════════════════
  { word: "파도",    meaning: "파도",    emoji: "🌊", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "파도가 출렁거려요.",        soundEffect: "철썩철썩~" },
  { word: "파인애플",meaning: "파인애플",emoji: "🍍", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "파인애플이 달콤새콤해요." },
  { word: "포도",    meaning: "포도",    emoji: "🍇", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "포도가 달콤해요.",          soundEffect: "냠냠~" },
  { word: "피자",    meaning: "피자",    emoji: "🍕", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "피자가 맛있어요.",          soundEffect: "냠냠~" },
  { word: "팽이",    meaning: "팽이",    emoji: "🪀", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "팽이를 돌려요.",            soundEffect: "윙윙~" },
  { word: "풍선",    meaning: "풍선",    emoji: "🎈", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "풍선이 하늘로 날아가요.",   soundEffect: "펑!" },
  { word: "피리",    meaning: "피리",    emoji: "🎵", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "피리를 불어요.",    soundEffect: "삐리리~" },
  { word: "편지",    meaning: "편지",    emoji: "✉️", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "편지를 써요." },
  { word: "폭포",    meaning: "폭포",    emoji: "🌊", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "폭포가 시원하게 떨어져요.", soundEffect: "콸콸~" },
  { word: "팝콘",    meaning: "팝콘",    emoji: "🍿", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "팝콘이 톡톡 튀어요.",       soundEffect: "팡팡~" },
  { word: "펭귄",    meaning: "펭귄",    emoji: "🐧", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "펭귄이 뒤뚱뒤뚱 걸어요.",  soundEffect: "뒤뚱뒤뚱~" },
  { word: "피아노",  meaning: "피아노",  emoji: "🎹", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "피아노를 쳐요.",            soundEffect: "도레미~" },
  { word: "표범",    meaning: "표범",    emoji: "🐆", targetPhonemes: ["ㅍ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "표범이 빠르게 달려요." },

  // ══════════════════════════════════════════════════════════
  // 경음 — ㄲ ㄸ ㅃ ㅆ ㅉ (4-5세 이후)
  // ══════════════════════════════════════════════════════════
  { word: "꽃",      meaning: "꽃",      emoji: "🌸", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "꽃이 예뻐요.",              soundEffect: "향기롭다~" },
  { word: "꿀벌",    meaning: "꿀벌",    emoji: "🐝", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "꿀벌이 윙윙 날아요.",       soundEffect: "윙윙~" },
  { word: "꿈",      meaning: "꿈",      emoji: "💭", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "예쁜 꿈을 꿔요.",           soundEffect: "쿨쿨~" },
  { word: "깃발",    meaning: "깃발",    emoji: "🚩", targetPhonemes: ["ㄲ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "깃발을 흔들어요.",          soundEffect: "펄럭펄럭~" },
  { word: "끈",      meaning: "끈",      emoji: "🧵", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "끈으로 묶어요." },
  { word: "떡볶이",  meaning: "떡볶이",  emoji: "🌶️", targetPhonemes: ["ㄸ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "떡볶이가 맛있어요.",        soundEffect: "매콤~" },
  { word: "뚜껑",    meaning: "뚜껑",    emoji: "🫙", targetPhonemes: ["ㄸ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "뚜껑을 열어요.",            soundEffect: "펑~" },
  { word: "떡국",    meaning: "떡국",    emoji: "🍲", targetPhonemes: ["ㄸ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "설날에 떡국을 먹어요." },
  { word: "딸기잼",  meaning: "딸기잼",  emoji: "🍓", targetPhonemes: ["ㄸ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "딸기잼을 빵에 발라요." },
  { word: "빨래",    meaning: "빨래",    emoji: "🧺", targetPhonemes: ["ㅃ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "빨래를 널어요." },
  { word: "뿌리",    meaning: "뿌리",    emoji: "🌱", targetPhonemes: ["ㅃ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "식물의 뿌리가 땅속에 있어요." },
  { word: "씨앗",    meaning: "씨앗",    emoji: "🌱", targetPhonemes: ["ㅆ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "씨앗을 심어요." },
  { word: "쓰레기통",meaning: "쓰레기통",emoji: "🗑️", targetPhonemes: ["ㅆ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "쓰레기통에 버려요." },
  { word: "썰매",    meaning: "썰매",    emoji: "🛷", targetPhonemes: ["ㅆ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "눈 위에서 썰매를 타요.",    soundEffect: "씽씽~" },
  { word: "찌개",    meaning: "찌개",    emoji: "🍲", targetPhonemes: ["ㅉ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "찌개가 보글보글 끓어요.",   soundEffect: "보글보글~" },
  { word: "쪽지",    meaning: "쪽지",    emoji: "📝", targetPhonemes: ["ㅉ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "쪽지에 쓸게요." },
  { word: "찐만두",  meaning: "찐만두",  emoji: "🥟", targetPhonemes: ["ㅉ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "찐만두가 맛있어요.",        soundEffect: "냠냠~" },

  // ══════════════════════════════════════════════════════════
  // 신체·가족·일상 (자주 쓰는 단어)
  // ══════════════════════════════════════════════════════════
  { word: "엄마",    meaning: "엄마",    emoji: "👩", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "엄마가 좋아요." },
  { word: "아빠",    meaning: "아빠",    emoji: "👨", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "아빠가 힘이 세요." },
  { word: "할머니",  meaning: "할머니",  emoji: "👵", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "할머니가 사랑스러워요." },
  { word: "할아버지",meaning: "할아버지",emoji: "👴", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "할아버지께 인사해요." },
  { word: "언니",    meaning: "언니",    emoji: "👩", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "언니가 예뻐요." },
  { word: "오빠",    meaning: "오빠",    emoji: "👦", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "오빠가 멋져요." },
  { word: "형",      meaning: "형",      emoji: "👦", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "형이 친절해요." },
  { word: "눈코입",  meaning: "눈코입",  emoji: "😊", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "눈코입이 있어요." },
  { word: "무릎",    meaning: "무릎",    emoji: "🦵", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "무릎을 굽혀요." },
  { word: "머리",    meaning: "머리",    emoji: "💆", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "머리를 감아요." },
  { word: "배꼽",    meaning: "배꼽",    emoji: "👶", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "배꼽이 있어요." },
  { word: "밥",      meaning: "밥",      emoji: "🍚", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "밥을 먹어요.",              soundEffect: "냠냠~" },
  { word: "국",      meaning: "국",      emoji: "🍲", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "국을 마셔요.",              soundEffect: "후루룩~" },
  { word: "우유",    meaning: "우유",    emoji: "🥛", targetPhonemes: ["ㅇ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "우유를 마셔요.",            soundEffect: "꿀꺽~" },
  { word: "과자",    meaning: "과자",    emoji: "🍪", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "과자가 바삭바삭해요.",  soundEffect: "바삭~" },
  { word: "사탕수수",meaning: "사탕",    emoji: "🍬", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "사탕이 달아요.",            soundEffect: "냠냠~" },
  { word: "케이크",  meaning: "케이크",  emoji: "🎂", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "케이크에 초를 꽂아요.",    soundEffect: "생일 축하~" },
  { word: "아이스크림",meaning:"아이스크림",emoji:"🍦",targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "아이스크림이 시원해요.",   soundEffect: "야호~" },

  // ══════════════════════════════════════════════════════════
  // 자연·날씨·계절
  // ══════════════════════════════════════════════════════════
  { word: "꽃잎",    meaning: "꽃잎",    emoji: "🌸", targetPhonemes: ["ㄲ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "꽃잎이 날려요.",           soundEffect: "팔랑팔랑~" },
  { word: "비",      meaning: "비",      emoji: "🌧️", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "비가 내려요.",              soundEffect: "후두두~" },
  { word: "눈사람",  meaning: "눈사람",  emoji: "⛄", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "눈사람을 만들어요." },
  { word: "무지개",  meaning: "무지개",  emoji: "🌈", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "무지개가 일곱 색이에요." },
  { word: "바닷가",  meaning: "바닷가",  emoji: "🏖️", targetPhonemes: ["ㅂ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "바닷가에서 놀아요." },
  { word: "폭풍",    meaning: "폭풍",    emoji: "🌀", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "폭풍이 세게 불어요." },
  { word: "새싹",    meaning: "새싹",    emoji: "🌱", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "새싹이 돋아났어요." },
  { word: "솔방울",  meaning: "솔방울",  emoji: "🌲", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "솔방울을 주웠어요." },
  { word: "단풍",    meaning: "단풍",    emoji: "🍁", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "단풍이 빨갛게 물들었어요.", soundEffect: "바스락~" },

  // ══════════════════════════════════════════════════════════
  // 놀이·장난감·활동
  // ══════════════════════════════════════════════════════════
  { word: "블록",    meaning: "블록",    emoji: "🧱", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "블록으로 탑을 쌓아요.", soundEffect: "딸깍딸깍~" },
  { word: "인형",    meaning: "인형",    emoji: "🪆", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "인형을 안아요." },
  { word: "퍼즐",    meaning: "퍼즐",    emoji: "🧩", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "퍼즐을 맞춰요.",            soundEffect: "딸깍!" },
  { word: "색종이",  meaning: "색종이",  emoji: "📄", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "색종이로 접어요." },
  { word: "크레파스",meaning: "크레파스",emoji: "🖍️", targetPhonemes: ["ㄹ"], difficulty: "hard",   ageGroup: "4-5세", sampleSentence: "크레파스로 그림 그려요." },
  { word: "수영복",  meaning: "수영복",  emoji: "👙", targetPhonemes: ["ㅅ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "수영복을 입어요." },
  { word: "줄넘기",  meaning: "줄넘기",  emoji: "🪢", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "줄넘기를 해요.",     soundEffect: "휙휙~" },
  { word: "미술",    meaning: "미술",    emoji: "🎨", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "미술 시간이 재미있어요." },

  // ══════════════════════════════════════════════════════════
  // 직업 (직업 관련 단어들)
  // ══════════════════════════════════════════════════════════
  { word: "의사",    meaning: "의사",    emoji: "👨‍⚕️", targetPhonemes: ["ㅇ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "의사가 병을 고쳐요." },
  { word: "경찰관",  meaning: "경찰관",  emoji: "👮", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "경찰관이 질서를 지켜요." },
  { word: "소방관",  meaning: "소방관",  emoji: "🧑‍🚒", targetPhonemes: ["ㅅ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "소방관이 불을 꺼요." },
  { word: "교사",    meaning: "교사",    emoji: "👩‍🏫", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "교사가 우리에게 배워요." },
  { word: "농부",    meaning: "농부",    emoji: "👨‍🌾", targetPhonemes: ["ㄴ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "농부가 쌀을 키워요." },
  { word: "요리사",  meaning: "요리사",  emoji: "👨‍🍳", targetPhonemes: ["ㅇ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "요리사가 맛있는 음식을 만들어요." },
  { word: "의사선생님",meaning: "의사선생님",emoji: "👨‍⚕️", targetPhonemes: ["ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "의사선생님께서 약을 주셨어요." },
  { word: "우체부",  meaning: "우체부",  emoji: "📬", targetPhonemes: ["ㅇ", "ㅊ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "우체부가 편지를 나르는 일을 해요." },
  { word: "경찰",    meaning: "경찰",    emoji: "👮", targetPhonemes: ["ㄱ", "ㅊ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "경찰이 우리를 지켜줘요." },
  { word: "화가",    meaning: "화가",    emoji: "🎨", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "화가가 그림을 그려요." },
  { word: "음악가",  meaning: "음악가",  emoji: "🎵", targetPhonemes: ["ㅇ", "ㅁ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "음악가가 아름다운 곡을 만들어요." },
  { word: "운동선수",meaning: "운동선수",emoji: "🏃", targetPhonemes: ["ㅇ", "ㄴ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "운동선수가 경쟁에서 우승했어요." },
  { word: "선수",    meaning: "선수",    emoji: "🏅", targetPhonemes: ["ㅅ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "선수가 게임에서 이겼어요." },

  // ══════════════════════════════════════════════════════════
  // 운동·게임
  // ══════════════════════════════════════════════════════════
  { word: "야구",    meaning: "야구",    emoji: "⚾", targetPhonemes: ["ㅇ", "ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "야구를 해요.",             soundEffect: "탁!" },
  { word: "탁구",    meaning: "탁구",    emoji: "🏓", targetPhonemes: ["ㅌ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "탁구 경기가 재미있어요.",   soundEffect: "탁탁~" },
  { word: "배드민턴",meaning: "배드민턴",emoji: "🏸", targetPhonemes: ["ㅂ", "ㄷ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "배드민턴을 친다." },
  { word: "스키",    meaning: "스키",    emoji: "⛷️", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "눈 위에서 스키를 타요." },
  { word: "스케이트",meaning: "스케이트",emoji: "⛸️", targetPhonemes: ["ㅅ", "ㄱ", "ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "스케이트를 신고 미끄러져요." },
  { word: "멀리뛰기",meaning: "멀리뛰기",emoji: "🤸", targetPhonemes: ["ㅁ", "ㄹ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "멀리뛰기 대회에 나갔어요." },
  { word: "높이뛰기",meaning: "높이뛰기",emoji: "🤸", targetPhonemes: ["ㄴ", "ㄱ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "높이뛰기를 해요." },
  { word: "체조",    meaning: "체조",    emoji: "🤸", targetPhonemes: ["ㅊ", "ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "체조 시간이 재미있어요." },
  { word: "무술",    meaning: "무술",    emoji: "🥋", targetPhonemes: ["ㅁ", "ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "무술을 배워요." },
  { word: "태권도",  meaning: "태권도",  emoji: "🥋", targetPhonemes: ["ㅌ", "ㄱ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "태권도를 배우고 있어요." },

  // ══════════════════════════════════════════════════════════
  // 감정·상태
  // ══════════════════════════════════════════════════════════
  { word: "행복",    meaning: "행복",    emoji: "😊", targetPhonemes: ["ㅎ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "행복한 기분이에요." },
  { word: "슬픔",    meaning: "슬픔",    emoji: "😢", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "슬픈 영화를 봤어요." },
  { word: "화남",    meaning: "화남",    emoji: "😠", targetPhonemes: ["ㅎ", "ㄴ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "화나면 안 돼요." },
  { word: "무서움",  meaning: "무서움",  emoji: "😨", targetPhonemes: ["ㅁ", "ㅅ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "무서운 영화 보지 말아요." },
  { word: "신남",    meaning: "신남",    emoji: "🤩", targetPhonemes: ["ㅅ", "ㄴ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "신나는 음악을 들어요." },
  { word: "졸음",    meaning: "졸음",    emoji: "😴", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "졸음이 와요." },
  { word: "피로",    meaning: "피로",    emoji: "😩", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "피로해 보여요." },
  { word: "부끄러움",meaning: "부끄러움",emoji: "🙈", targetPhonemes: ["ㅂ", "ㄲ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "부끄러워하지 말아요." },
  { word: "설렘",    meaning: "설렘",    emoji: "✨", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "설레는 마음이에요." },

  // ══════════════════════════════════════════════════════════
  // 더 많은 동물들
  // ══════════════════════════════════════════════════════════
  { word: "사자",    meaning: "사자",    emoji: "🦁", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "사자가 사바나에 살아요." },
  { word: "얼룩말",  meaning: "얼룩말",  emoji: "🦓", targetPhonemes: ["ㅇ", "ㄹ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "얼룩말이 줄무늬가 있어요." },
  { word: "코끼리",  meaning: "코끼리",  emoji: "🐘", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "코끼리 코는 길어요." },
  { word: "캥거루",  meaning: "캥거루",  emoji: "🦘", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "캥거루가 뛰어가요." },
  { word: "오랑우탄",meaning: "오랑우탄",emoji: "🦧", targetPhonemes: ["ㅇ", "ㄹ", "ㄴ", "ㅇ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "오랑우탄이 나무에 매달려요." },
  { word: "침팬지",  meaning: "침팬지",  emoji: "🐵", targetPhonemes: ["ㅊ", "ㅍ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "침팬지가 똑똑해요." },
  { word: "고릴라",  meaning: "고릴라",  emoji: "🦍", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "고릴라가 힘이 세요." },
  { word: "사슴",    meaning: "사슴",    emoji: "🦌", targetPhonemes: ["ㅅ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사슴의 뿔이 크네요." },
  { word: "들소",    meaning: "들소",    emoji: "🐂", targetPhonemes: ["ㄷ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "들소는 목초지에 산다." },
  { word: "라마",    meaning: "라마",    emoji: "🦙", targetPhonemes: ["ㄹ", "ㅁ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "라마가 털이 복슬복슬해요." },
  { word: "양",      meaning: "양",      emoji: "🐑", targetPhonemes: ["ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "양이 메메 울어요.",      soundEffect: "메메~" },
  { word: "염소",    meaning: "염소",    emoji: "🐐", targetPhonemes: ["ㅇ", "ㅁ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "염소가 풀을 뜯어 먹어요." },
  { word: "사슴벌레",meaning: "사슴벌레",emoji: "🦬", targetPhonemes: ["ㅅ", "ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "사슴벌레 애벌레를 찾았어요." },
  { word: "나방",    meaning: "나방",    emoji: "🦋", targetPhonemes: ["ㄴ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나방이 불빛에 모여요." },
  { word: "매",      meaning: "매",      emoji: "🦅", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "매가 높이 날아가요." },
  { word: "문제",    meaning: "문제",    emoji: "❓", targetPhonemes: ["ㅁ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "어려운 문제를 풀어요." },
  { word: "악어",    meaning: "악어",    emoji: "🐊", targetPhonemes: ["ㅇ", "ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "악어의 입이 커요." },
  { word: "개미",    meaning: "개미",    emoji: "🐜", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "개미가 줄지어 가요." },
  { word: "나뭇잎",  meaning: "나뭇잎",  emoji: "🍃", targetPhonemes: ["ㄴ", "ㅁ", "ㄷ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "나뭇잎이 바스락거려요." },

  // ══════════════════════════════════════════════════════════
  // 더 많은 음식
  // ══════════════════════════════════════════════════════════
  { word: "소시지",  meaning: "소시지",  emoji: "🌭", targetPhonemes: ["ㅅ", "ㅅ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "소시지를 구워먹어요." },
  { word: "비빔밥",  meaning: "비빔밥",  emoji: "🍚", targetPhonemes: ["ㅂ", "ㅂ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "비빔밥이 맛있어요." },
  { word: "김밥",    meaning: "김밥",    emoji: "🍣", targetPhonemes: ["ㄱ", "ㅂ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "김밥을 말아요." },
  { word: "우동",    meaning: "우동",    emoji: "🍜", targetPhonemes: ["ㅇ", "ㄷ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "우동이 길고 맛있어요." },
  { word: "스파게티",meaning: "스파게티",emoji: "🍝", targetPhonemes: ["ㅅ", "ㅍ", "ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "스파게티를 먹어요." },
  { word: "카레",    meaning: "카레",    emoji: "🍛", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "카레가 맵지만 맛있어요." },
  { word: "핫도그",  meaning: "핫도그",  emoji: "🌭", targetPhonemes: ["ㅎ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "핫도그를 먹어요." },
  { word: "케첩",    meaning: "케첩",    emoji: "🍅", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "감자튀김에 케첩을 쳐요." },
  { word: "마요네즈",meaning: "마요네즈",emoji: "🧈", targetPhonemes: ["ㅁ", "ㅇ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "마요네즈를 짜요." },
  { word: "기름",    meaning: "기름",    emoji: "🫙", targetPhonemes: ["ㄱ, ㄹ, ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "기름으로 부쳐요." },
  { word: "소금",    meaning: "소금",    emoji: "🧂", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "소금을 뿌려요." },
  { word: "설탕",    meaning: "설탕",    emoji: "🍯", targetPhonemes: ["ㅅ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "설탕이 달콤해요." },
  { word: "초콜릿",  meaning: "초콜릿",  emoji: "🍫", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초콜릿을 먹어요." },
  { word: "아이스크림",meaning:"아이스크림",emoji:"🍦",targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "아이스크림이 차가워요." },
  { word: "요구르트",meaning: "요구르트",emoji: "🥛", targetPhonemes: ["ㅇ", "ㄱ", "ㄹ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "요구르트를 마셔요." },
  { word: "버터",    meaning: "버터",    emoji: "🧈", targetPhonemes: ["ㅂ", "ㅌ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "버터를 빵에 바르는거예요." },
  { word: "잼",      meaning: "잼",      emoji: "🍓", targetPhonemes: ["ㅈ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "딸기잼이 맛있어요." },
  { word: "누텔라",  meaning: "누텔라",  emoji: "🍫", targetPhonemes: ["ㄴ", "ㅌ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "누텔라를 빵에 발라요." },
  { word: "두유",    meaning: "두유",    emoji: "🥛", targetPhonemes: ["ㄷ", "ㅇ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "두유를 마셔요." },

  // ══════════════════════════════════════════════════════════
  // 신체 부위 추가
  // ══════════════════════════════════════════════════════════
  { word: "머리카락",meaning: "머리카락",emoji: "💇", targetPhonemes: ["ㅁ", "ㄹ", "ㄱ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "머리카락이 길어요." },
  { word: "이마",    meaning: "이마",    emoji: "👶", targetPhonemes: ["ㅇ", "ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "이마에 뽀뽀했어요." },
  { word: "눈썹",    meaning: "눈썹",    emoji: "😠", targetPhonemes: ["ㄴ", "ㅆ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "눈썹이 진하네요." },
  { word: "코",      meaning: "코",      emoji: "👃", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "코로 숨을 쉬어요." },
  { word: "입술",    meaning: "입술",    emoji: "👄", targetPhonemes: ["ㅇ", "ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "입술이 빨갛네요." },
  { word: "이빨",    meaning: "이빨",    emoji: "😁", targetPhonemes: ["ㅇ", "ㅃ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "이빨을 닦아요." },
  { word: "혀",      meaning: "혀",      emoji: "👅", targetPhonemes: ["ㅎ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "혀로 맛을 봐요." },
  { word: "턱",      meaning: "턱",      emoji: "🦷", targetPhonemes: ["ㅌ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "턱이 뾰족해요." },
  { word: "목",      meaning: "목",      emoji: "🧣", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "목이 아파요." },
  { word: "어깨",    meaning: "어깨",    emoji: "💪", targetPhonemes: ["ㅇ, ㄲ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "어깨가 아파요." },
  { word: "팔꿈치",  meaning: "팔꿈치",  emoji: "💪", targetPhonemes: ["ㅍ", "ㄲ", "ㅁ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "팔꿈치로 탁자에 부딪혔어요." },
  { word: "손가락",  meaning: "손가락",  emoji: "🖐️", targetPhonemes: ["ㅅ", "ㄱ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손가락 다섯 개가 있어요." },
  { word: "가슴",    meaning: "가슴",    emoji: "💓", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "가슴이 철렁했어요." },
  { word: "배",      meaning: "배",      emoji: "🤰", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "배가 고파요." },
  { word: "엉덩이",  meaning: "엉덩이",  emoji: "🍑", targetPhonemes: ["ㅇ", "ㄷ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "엉덩이를 탁탁 치지 마요." },
  { word: "정강이",  meaning: "정강이",  emoji: "🦵", targetPhonemes: ["ㅈ", "ㄱ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "정강이가 아파요." },
  { word: "발목",    meaning: "발목",    emoji: "🦶", targetPhonemes: ["ㅂ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "발목이 삐끗했어요." },
  { word: "발톱",    meaning: "발톱",    emoji: "🦶", targetPhonemes: ["ㅂ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "발톱을 깎아요." },
  { word: "피",      meaning: "피",      emoji: "🩸", targetPhonemes: ["ㅍ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "피가 나왔어요." },
  { word: "근육",    meaning: "근육",    emoji: "💪", targetPhonemes: ["ㄱ", "ㄴ", "ㅇ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "근육이 커야 세요." },
  { word: "뼈",      meaning: "뼈",      emoji: "🦴", targetPhonemes: ["ㄲ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "뼈가 부러졌어요." },
  { word: "뇌",      meaning: "뇌",      emoji: "🧠", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "뇌는 중요한 기관이에요." },

  // ══════════════════════════════════════════════════════════
  // 옷과 신발
  // ══════════════════════════════════════════════════════════
  { word: "셔츠",    meaning: "셔츠",    emoji: "👔", targetPhonemes: ["ㅅ", "ㅊ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "셔츠를 입어요." },
  { word: "바지",    meaning: "바지",    emoji: "👖", targetPhonemes: ["ㅂ", "ㅈ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "파란 바지를 입어요." },
  { word: "속옷",    meaning: "속옷",    emoji: "🩱", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "속옷을 입어요." },
  { word: "양말",    meaning: "양말",    emoji: "🧦", targetPhonemes: ["ㅇ", "ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "양말을 신어요." },
  { word: "부츠",    meaning: "부츠",    emoji: "👢", targetPhonemes: ["ㅂ", "ㅊ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "부츠가 따뜻해요." },
  { word: "운동화",  meaning: "운동화",  emoji: "👟", targetPhonemes: ["ㅇ", "ㄷ", "ㅇ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "운동화로 뛰어요." },
  { word: "슬리퍼",  meaning: "슬리퍼",  emoji: "🩴", targetPhonemes: ["ㅅ", "ㄹ", "ㅍ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "슬리퍼를 신어요." },
  { word: "내복",    meaning: "내복",    emoji: "🧥", targetPhonemes: ["ㄴ, ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "겨울에 내복을 입어요." },
  { word: "스웨터",  meaning: "스웨터",  emoji: "🧶", targetPhonemes: ["ㅅ, ㅇ, ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "스웨터가 따뜻해요." },
  { word: "코트",    meaning: "코트",    emoji: "🧥", targetPhonemes: ["ㄱ, ㅌ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "겨울 코트를 입어요." },

  // ══════════════════════════════════════════════════════════
  // 동사 (행동)
  // ══════════════════════════════════════════════════════════
  { word: "웃다",    meaning: "웃다",    emoji: "😂", targetPhonemes: ["ㅇ", "ㅆ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "재미있어서 웃어요." },
  { word: "울다",    meaning: "울다",    emoji: "😭", targetPhonemes: ["ㅇ", "ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "슬파서 울어요." },
  { word: "걷다",    meaning: "걷다",    emoji: "🚶", targetPhonemes: ["ㄱ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "천천히 걸어요." },
  { word: "앉다",    meaning: "앉다",    emoji: "🪑", targetPhonemes: ["ㅇ", "ㄴ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "의자에 앉아요." },
  { word: "누우다",  meaning: "누우다",  emoji: "🛏️", targetPhonemes: ["ㄴ", "ㅇ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "침대에 누워요." },
  { word: "일어나다",meaning: "일어나다",emoji: "⬆️", targetPhonemes: ["ㅇ", "ㄹ", "ㄴ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "아침에 일어나요." },
  { word: "자다",    meaning: "자다",    emoji: "😴", targetPhonemes: ["ㅈ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밤에 자요." },
  { word: "먹다",    meaning: "먹다",    emoji: "🍽️", targetPhonemes: ["ㅁ", "ㄱ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밥을 먹어요." },
  { word: "마시다",  meaning: "마시다",  emoji: "🥛", targetPhonemes: ["ㅁ", "ㅅ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "물을 마셔요." },
  { word: "보다",    meaning: "보다",    emoji: "👀", targetPhonemes: ["ㅂ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하늘을 봐요." },
  { word: "듣다",    meaning: "듣다",    emoji: "👂", targetPhonemes: ["ㄷ", "ㅅ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "음악을 들어요." },
  { word: "말하다",  meaning: "말하다",  emoji: "💬", targetPhonemes: ["ㅁ", "ㄹ", "ㅎ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "천천히 말해요." },
  { word: "쓰다",    meaning: "쓰다",    emoji: "✏️", targetPhonemes: ["ㅆ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "글씨를 써요." },
  { word: "읽다",    meaning: "읽다",    emoji: "📚", targetPhonemes: ["ㅇ", "ㄷ", "ㄱ", "ㄷ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "책을 읽어요." },
  { word: "그리다",  meaning: "그리다",  emoji: "🎨", targetPhonemes: ["ㄱ", "ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "그림을 그려요." },
  { word: "만들다",  meaning: "만들다",  emoji: "🏗️", targetPhonemes: ["ㅁ", "ㄷ", "ㄹ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "장난감을 만들어요." },
  { word: "찾다",    meaning: "찾다",    emoji: "🔍", targetPhonemes: ["ㅊ", "ㅊ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "물건을 찾아요." },
  { word: "숨다",    meaning: "숨다",    emoji: "🙈", targetPhonemes: ["ㅅ", "ㅁ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "숨바꼭질을 해요." },
  { word: "밀다",    meaning: "밀다",    emoji: "🚪", targetPhonemes: ["ㅁ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "문을 밀어요." },
  { word: "당기다",  meaning: "당기다",  emoji: "📬", targetPhonemes: ["ㄷ", "ㄲ", "ㄱ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손으로 당겨요." },

  // ══════════════════════════════════════════════════════════
  // 형용사 (특성)
  // ══════════════════════════════════════════════════════════
  { word: "크다",    meaning: "크다",    emoji: "📏", targetPhonemes: ["ㄲ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "상자가 커요." },
  { word: "작다",    meaning: "작다",    emoji: "📏", targetPhonemes: ["ㅈ", "ㄲ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "아기가 작아요." },
  { word: "길다",    meaning: "길다",    emoji: "📏", targetPhonemes: ["ㄱ", "ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "막대가 길어요." },
  { word: "짧다",    meaning: "짧다",    emoji: "📏", targetPhonemes: ["ㅆ", "ㅃ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "머리가 짧네요." },
  { word: "높다",    meaning: "높다",    emoji: "📏", targetPhonemes: ["ㄴ", "ㅁ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하늘이 높아요." },
  { word: "낮다",    meaning: "낮다",    emoji: "📏", targetPhonemes: ["ㄴ", "ㅅ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "의자가 낮아요." },
  { word: "넓다",    meaning: "넓다",    emoji: "📏", targetPhonemes: ["ㄴ", "ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "공원이 넓어요." },
  { word: "좁다",    meaning: "좁다",    emoji: "📏", targetPhonemes: ["ㅈ, ㅇ, ㅂ, ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "방이 좁아요." },
  { word: "뜨겁다",  meaning: "뜨겁다",  emoji: "🔥", targetPhonemes: ["ㄷ, ㄲ, ㅂ, ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "물이 뜨거워요." },
  { word: "차갑다",  meaning: "차갑다",  emoji: "❄️", targetPhonemes: ["ㅊ, ㄱ, ㅂ, ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "얼음이 차가워요." },
  { word: "빠르다",  meaning: "빠르다",  emoji: "⚡", targetPhonemes: ["ㅃ, ㄹ, ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "차가 빨라요." },
  { word: "느리다",  meaning: "느리다",  emoji: "🐢", targetPhonemes: ["ㄴ, ㄹ, ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "달팽이가 느려요." },
  { word: "밝다",    meaning: "밝다",    emoji: "💡", targetPhonemes: ["ㅂ, ㅂ, ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "햇빛이 밝아요." },
  { word: "어둡다",  meaning: "어둡다",  emoji: "🌙", targetPhonemes: ["ㅇ, ㄷ, ㅂ, ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "밤이 어두워요." },
  { word: "깨끗하다",meaning: "깨끗하다",emoji: "✨", targetPhonemes: ["ㄲ, ㄷ, ㅎ, ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손을 깨끗이 씻어요." },
  { word: "더럽다",  meaning: "더럽다",  emoji: "💩", targetPhonemes: ["ㄷ, ㄹ, ㅂ, ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "진흙이 더러워요." },
  { word: "단맛",    meaning: "단맛",    emoji: "🍯", targetPhonemes: ["ㄷ, ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "단맛이 좋아요." },
  { word: "짠맛",    meaning: "짠맛",    emoji: "🧂", targetPhonemes: ["ㅆ, ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "짠맛이 난다." },

  // ══════════════════════════════════════════════════════════
  // 마지막 추가 카테고리 (교실, 학용품, 기타)
  // ══════════════════════════════════════════════════════════
  { word: "책상",    meaning: "책상",    emoji: "🪑", targetPhonemes: ["ㄲ, ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "책상에 책을 놓아요." },
  { word: "의자",    meaning: "의자",    emoji: "🪑", targetPhonemes: ["ㅇ, ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "의자에 앉아요." },
  { word: "칠판",    meaning: "칠판",    emoji: "🖊️", targetPhonemes: ["ㅊ, ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "칠판에 글씨를 써요." },
  { word: "지우개",  meaning: "지우개",  emoji: "🧹", targetPhonemes: ["ㅈ, ㅇ, ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "지우개로 지워요." },
  { word: "딱지",    meaning: "딱지",    emoji: "🎫", targetPhonemes: ["ㄷ, ㄲ, ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "딱지를 모아요." },
  { word: "그림책",  meaning: "그림책",  emoji: "📚", targetPhonemes: ["ㄱ, ㄹ, ㅁ, ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "그림책을 읽어요." },
  { word: "교실",    meaning: "교실",    emoji: "🏫", targetPhonemes: ["ㄱ, ㅇ, ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "교실에서 공부해요." },
  { word: "운동장",  meaning: "운동장",  emoji: "⚽", targetPhonemes: ["ㅇ, ㄷ, ㅇ, ㄴ, ㄷ, ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "운동장에서 달려요." },
  { word: "화장실",  meaning: "화장실",  emoji: "🚽", targetPhonemes: ["ㅎ, ㅈ, ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "화장실에 갔어요." },
  { word: "급식실",  meaning: "급식실",  emoji: "🍽️", targetPhonemes: ["ㄲ, ㅂ, ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "급식실에서 밥을 먹어요." },

  // 색깔 (Colors)
  { word: "빨강", meaning: "빨강", emoji: "🔴", targetPhonemes: ["ㅂ, ㄹ", "ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "이건 빨강이에요." },
  { word: "파랑", meaning: "파랑", emoji: "🔵", targetPhonemes: ["ㅍ, ㄹ", "ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "파랑은 하늘색이에요." },
  { word: "노랑", meaning: "노랑", emoji: "🟡", targetPhonemes: ["ㄴ, ㄹ", "ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "해는 노랑이에요." },
  { word: "초록", meaning: "초록", emoji: "🟢", targetPhonemes: ["ㅊ, ㄹ, ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "나뭇잎은 초록이에요." },
  { word: "보라", meaning: "보라", emoji: "🟣", targetPhonemes: ["ㅂ, ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "포도는 보라색이에요." },
  { word: "분홍", meaning: "분홍", emoji: "💗", targetPhonemes: ["ㅂ, ㄴ, ㅎ, ㅇ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "분홍은 예뻐요." },
  { word: "회색", meaning: "회색", emoji: "⚫", targetPhonemes: ["ㅎ, ㅇ, ㅈ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "생쥐는 회색이에요." },
  { word: "검정", meaning: "검정", emoji: "⚫", targetPhonemes: ["ㄱ, ㅁ, ㅈ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "검정색은 어두워요." },
  { word: "하양", meaning: "하양", emoji: "⚪", targetPhonemes: ["ㅎ, ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "눈은 하얗고 차가워요." },
  { word: "주황", meaning: "주황", emoji: "🟠", targetPhonemes: ["ㅊ, ㅎ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "귤은 주황색이에요." },

  // 숫자 (Numbers)
  { word: "하나", meaning: "하나", emoji: "1️⃣", targetPhonemes: ["ㅎ, ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하나, 둘, 셋." },
  { word: "둘", meaning: "둘", emoji: "2️⃣", targetPhonemes: ["ㄷ, ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "사과 둘." },
  { word: "셋", meaning: "셋", emoji: "3️⃣", targetPhonemes: ["ㅅ, ㅅ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "셋이에요." },
  { word: "넷", meaning: "넷", emoji: "4️⃣", targetPhonemes: ["ㄴ, ㅅ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "넷까지 세어요." },
  { word: "다섯", meaning: "다섯", emoji: "5️⃣", targetPhonemes: ["ㄷ, ㅅ, ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "손가락이 다섯 개예요." },
  { word: "여섯", meaning: "여섯", emoji: "6️⃣", targetPhonemes: ["ㅇ, ㅅ, ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "여섯 살이에요." },
  { word: "일곱", meaning: "일곱", emoji: "7️⃣", targetPhonemes: ["ㅇ, ㄱ, ㅂ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "일곱이 되었어요." },
  { word: "여덟", meaning: "여덟", emoji: "8️⃣", targetPhonemes: ["ㅇ, ㄷ, ㅂ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "여덟 개가 있어요." },
  { word: "아홉", meaning: "아홉", emoji: "9️⃣", targetPhonemes: ["ㅇ, ㅎ, ㅂ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "아홉 개를 샀어요." },
  { word: "열", meaning: "열", emoji: "🔟", targetPhonemes: ["ㅇ, ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "열 개가 있어요." },

  // 날씨 (Weather)
  { word: "날씨", meaning: "날씨", emoji: "🌤️", targetPhonemes: ["ㄴ, ㅅ, ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "오늘 날씨가 좋아요." },
  { word: "맑음", meaning: "맑음", emoji: "☀️", targetPhonemes: ["ㅁ, ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "하늘이 맑아요." },
  { word: "흐림", meaning: "흐림", emoji: "☁️", targetPhonemes: ["ㅎ, ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "오늘은 흐려요." },
  { word: "비", meaning: "비", emoji: "🌧️", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "비가 오고 있어요." },
  { word: "눈", meaning: "눈", emoji: "❄️", targetPhonemes: ["ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "눈이 많이 내려요." },
  { word: "바람", meaning: "바람", emoji: "💨", targetPhonemes: ["ㅂ, ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "바람이 불어요." },
  { word: "천둥", meaning: "천둥", emoji: "⚡", targetPhonemes: ["ㅊ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "천둥이 울려요." },
  { word: "번개", meaning: "번개", emoji: "⚡", targetPhonemes: ["ㅂ, ㄴ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "번개가 쳤어요." },
  { word: "구름", meaning: "구름", emoji: "☁️", targetPhonemes: ["ㄱ, ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "구름이 떠가요." },
  { word: "햇빛", meaning: "햇빛", emoji: "☀️", targetPhonemes: ["ㅎ, ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "햇빛이 따뜻해요." },

  // 탈것 (Vehicles)
  { word: "버스", meaning: "버스", emoji: "🚌", targetPhonemes: ["ㅂ, ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "버스를 탔어요." },
  { word: "택시", meaning: "택시", emoji: "🚕", targetPhonemes: ["ㅌ, ㄱ, ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "택시를 불렀어요." },
  { word: "기차", meaning: "기차", emoji: "🚂", targetPhonemes: ["ㄱ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "기차는 빨라요." },
  { word: "비행기", meaning: "비행기", emoji: "✈️", targetPhonemes: ["ㅂ, ㅎ, ㅇ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "비행기를 타고 갔어요." },
  { word: "배", meaning: "배", emoji: "🚢", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "배를 타요." },
  { word: "자동차", meaning: "자동차", emoji: "🚗", targetPhonemes: ["ㅊ, ㄷ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "자동차가 빨리 가요." },
  { word: "오토바이", meaning: "오토바이", emoji: "🏍️", targetPhonemes: ["ㅇ, ㅌ, ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "오토바이는 시끄러워요." },
  { word: "자전거", meaning: "자전거", emoji: "🚴", targetPhonemes: ["ㅊ, ㅇ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "자전거를 타요." },
  { word: "스쿠터", meaning: "스쿠터", emoji: "🛴", targetPhonemes: ["ㅆ, ㄱ, ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "스쿠터를 탔어요." },
  { word: "헬리콥터", meaning: "헬리콥터", emoji: "🚁", targetPhonemes: ["ㅎ, ㄹ, ㄱ, ㅂ, ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "헬리콥터가 날고 있어요." },

  // 과일 (Fruits) - 추가
  { word: "딸기", meaning: "딸기", emoji: "🍓", targetPhonemes: ["ㄷ, ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "딸기는 빨가고 맛있어요." },
  { word: "포도", meaning: "포도", emoji: "🍇", targetPhonemes: ["ㅍ, ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "포도를 먹었어요." },
  { word: "수박", meaning: "수박", emoji: "🍉", targetPhonemes: ["ㅅ, ㅂ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수박은 시원해요." },
  { word: "참외", meaning: "참외", emoji: "🍈", targetPhonemes: ["ㅊ, ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "참외가 맛있어요." },
  { word: "복숭아", meaning: "복숭아", emoji: "🍑", targetPhonemes: ["ㅂ, ㅅ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "복숭아는 부드러워요." },
  { word: "체리", meaning: "체리", emoji: "🍒", targetPhonemes: ["ㅊ, ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "체리는 작고 빨가요." },
  { word: "라임", meaning: "라임", emoji: "🟢", targetPhonemes: ["ㄹ, ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "라임은 초록색이에요." },
  { word: "배", meaning: "배", emoji: "🍐", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "배가 맛있어요." },
  { word: "귀리", meaning: "귀리", emoji: "🌾", targetPhonemes: ["ㄱ, ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "귀리는 곡물이에요." },
  { word: "무화과", meaning: "무화과", emoji: "🍑", targetPhonemes: ["ㅁ, ㅎ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "무화과는 달아요." },

  // 채소 (Vegetables)
  { word: "당근", meaning: "당근", emoji: "🥕", targetPhonemes: ["ㄷ, ㄴ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "당근을 깎아요." },
  { word: "옥수수", meaning: "옥수수", emoji: "🌽", targetPhonemes: ["ㅇ, ㅆ, ㅆ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "옥수수를 먹어요." },
  { word: "감자", meaning: "감자", emoji: "🥔", targetPhonemes: ["ㄱ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "감자로 밥을 해요." },
  { word: "고구마", meaning: "고구마", emoji: "🍠", targetPhonemes: ["ㄱ, ㄱ, ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고구마는 달아요." },
  { word: "양파", meaning: "양파", emoji: "🧅", targetPhonemes: ["ㅇ, ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "양파를 잘라요." },
  { word: "마늘", meaning: "마늘", emoji: "🧄", targetPhonemes: ["ㅁ, ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "마늘 냄새가 나요." },
  { word: "상추", meaning: "상추", emoji: "🥬", targetPhonemes: ["ㅅ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "상추를 씻어요." },
  { word: "배추", meaning: "배추", emoji: "🥬", targetPhonemes: ["ㅂ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "배추로 김치를 만들어요." },
  { word: "오이", meaning: "오이", emoji: "🥒", targetPhonemes: ["ㅇ", "ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "오이는 아삭해요." },
  { word: "토마토", meaning: "토마토", emoji: "🍅", targetPhonemes: ["ㅌ, ㅁ, ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "토마토는 빨가요." },

  // 방·장소 (Rooms/Places)
  { word: "침실", meaning: "침실", emoji: "🛏️", targetPhonemes: ["ㅊ, ㅂ, ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "침실에서 자요." },
  { word: "거실", meaning: "거실", emoji: "🛋️", targetPhonemes: ["ㄱ, ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "거실에서 놀아요." },
  { word: "주방", meaning: "주방", emoji: "🍳", targetPhonemes: ["ㅊ, ㅂ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "주방에서 밥을 해요." },
  { word: "욕실", meaning: "욕실", emoji: "🚿", targetPhonemes: ["ㅇ, ㅂ, ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "욕실에서 씻어요." },
  { word: "현관", meaning: "현관", emoji: "🚪", targetPhonemes: ["ㅎ, ㄴ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "현관에서 신발을 벗어요." },
  { word: "베란다", meaning: "베란다", emoji: "🪟", targetPhonemes: ["ㅂ, ㄹ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "베란다에 빨래를 널어요." },
  { word: "복도", meaning: "복도", emoji: "🚪", targetPhonemes: ["ㅂ, ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "복도에서 뛰지 마세요." },
  { word: "계단", meaning: "계단", emoji: "🪜", targetPhonemes: ["ㄱ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "계단을 올라가요." },
  { word: "엘리베이터", meaning: "엘리베이터", emoji: "🛗", targetPhonemes: ["ㅇ, ㄹ, ㅂ, ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "엘리베이터를 탔어요." },
  { word: "놀이터", meaning: "놀이터", emoji: "🎪", targetPhonemes: ["ㄴ, ㅇ, ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "놀이터에서 놀아요." },

  // 움직임 (Actions/Movements)
  { word: "뛰다", meaning: "뛰다", emoji: "🏃", targetPhonemes: ["ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "빨리 뛰어요." },
  { word: "점프", meaning: "점프", emoji: "🦘", targetPhonemes: ["ㅈ, ㅁ, ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "높이 점프했어요." },
  { word: "기다리다", meaning: "기다리다", emoji: "⏳", targetPhonemes: ["ㄱ, ㄷ, ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "엄마를 기다려요." },
  { word: "어기다", meaning: "어기다", emoji: "🚫", targetPhonemes: ["ㅇ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "약속을 어겼어요." },
  { word: "미끄러지다", meaning: "미끄러지다", emoji: "🛝", targetPhonemes: ["ㅁ, ㄱ, ㄹ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "미끄러져서 넘어졌어요." },
  { word: "밀다", meaning: "밀다", emoji: "💪", targetPhonemes: ["ㅁ, ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "문을 밀어요." },
  { word: "당기다", meaning: "당기다", emoji: "🫱", targetPhonemes: ["ㄷ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "밧줄을 당겨요." },
  { word: "비틀다", meaning: "비틀다", emoji: "🔄", targetPhonemes: ["ㅂ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "손수건을 비틀어요." },
  { word: "세우다", meaning: "세우다", emoji: "🧍", targetPhonemes: ["ㅅ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "블록을 세워요." },
  { word: "누르다", meaning: "누르다", emoji: "🔴", targetPhonemes: ["ㄴ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "버튼을 눌러요." },
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

export function getWordsByDifficulty(phoneme: string, difficulty: "easy" | "medium" | "hard"): PracticeWord[] {
  return WORD_DATABASE.filter(
    (w) => w.targetPhonemes.includes(phoneme) && w.difficulty === difficulty
  );
}
