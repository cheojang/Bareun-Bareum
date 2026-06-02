export interface PracticeWord {
  word: string;
  targetPhonemes: string[];
  difficulty: "easy" | "medium" | "hard";
  ageGroup: "2-3세" | "3-4세" | "4-5세" | "5-6세";
  sampleSentence: string;
  soundEffect?: string;
  imageSlug?: string; // 이미지 파일명 (확장자 제외). 예: "sagwa" → /images/words/sagwa.webp
}

export interface MinimalPair {
  id: string;
  word1: string;
  word2: string;
  targetPhoneme: string;
  contrastPhoneme: string;
  label: string;
}

export const MINIMAL_PAIRS: MinimalPair[] = [
  { id: "mp-dal-mal",       word1: "달", word2: "말", targetPhoneme: "ㄷ", contrastPhoneme: "ㅁ", label: "ㄷ vs ㅁ 구별" },
  { id: "mp-gabang-nabang", word1: "가방", word2: "나방", targetPhoneme: "ㄱ", contrastPhoneme: "ㄴ", label: "ㄱ vs ㄴ 구별" },
  { id: "mp-daligi-naligi", word1: "달리기", word2: "날리기", targetPhoneme: "ㄷ", contrastPhoneme: "ㄴ", label: "ㄷ vs ㄴ 구별" },
  { id: "mp-bada-mada",     word1: "바다", word2: "마다", targetPhoneme: "ㅂ", contrastPhoneme: "ㅁ", label: "ㅂ vs ㅁ 구별" },
  { id: "mp-sagwa-dagwa",   word1: "사과", word2: "다과", targetPhoneme: "ㅅ", contrastPhoneme: "ㄷ", label: "ㅅ vs ㄷ 구별" },
  { id: "mp-gorae-norae",   word1: "고래", word2: "노래", targetPhoneme: "ㄱ", contrastPhoneme: "ㄴ", label: "ㄱ vs ㄴ 구별" },
  { id: "mp-ramyeon-namyeon",word1:"라면", word2: "나면", targetPhoneme: "ㄹ", contrastPhoneme: "ㄴ", label: "ㄹ vs ㄴ 구별" },
  { id: "mp-son-jon",       word1: "손", word2: "존", targetPhoneme: "ㅅ", contrastPhoneme: "ㅈ", label: "ㅅ vs ㅈ 구별" },
  { id: "mp-bul-mul",       word1: "불", word2: "물", targetPhoneme: "ㅂ", contrastPhoneme: "ㅁ", label: "ㅂ vs ㅁ 구별" },
  { id: "mp-gom-dom",       word1: "곰", word2: "돔", targetPhoneme: "ㄱ", contrastPhoneme: "ㄷ", label: "ㄱ vs ㄷ 구별" },
  { id: "mp-jip-zip",       word1: "집", word2: "짚", targetPhoneme: "ㅈ", contrastPhoneme: "ㅉ", label: "ㅈ vs ㅉ 구별" },
  { id: "mp-chal-sal",      word1: "찰", word2: "살", targetPhoneme: "ㅊ", contrastPhoneme: "ㅅ", label: "ㅊ vs ㅅ 구별" },
  { id: "mp-pal-mal",       word1: "팔", word2: "말", targetPhoneme: "ㅍ", contrastPhoneme: "ㅁ", label: "ㅍ vs ㅁ 구별" },
  { id: "mp-nun-dun",       word1: "눈", word2: "돈", targetPhoneme: "ㄴ", contrastPhoneme: "ㄷ", label: "ㄴ vs ㄷ 구별" },
  { id: "mp-bap-map",       word1: "밥", word2: "맙", targetPhoneme: "ㅂ", contrastPhoneme: "ㅁ", label: "ㅂ vs ㅁ 구별" },
  { id: "mp-podo-bodo",     word1: "포도", word2: "보도", targetPhoneme: "ㅍ", contrastPhoneme: "ㅂ", label: "ㅍ vs ㅂ 구별" },

  // ── 평음 vs 경음 (lax vs tense) ────────────────────────────────────────────
  { id: "mp-gul-ggul",     word1: "굴",   word2: "꿀",   targetPhoneme: "ㄱ", contrastPhoneme: "ㄲ", label: "ㄱ vs ㄲ 구별" },
  { id: "mp-dal-ddal",     word1: "달",   word2: "딸",   targetPhoneme: "ㄷ", contrastPhoneme: "ㄸ", label: "ㄷ vs ㄸ 구별" },
  { id: "mp-sal-ssal",     word1: "살",   word2: "쌀",   targetPhoneme: "ㅅ", contrastPhoneme: "ㅆ", label: "ㅅ vs ㅆ 구별" },
  { id: "mp-bang-ppang",   word1: "방",   word2: "빵",   targetPhoneme: "ㅂ", contrastPhoneme: "ㅃ", label: "ㅂ vs ㅃ 구별" },

  // ── 평음 vs 격음 (lax vs aspirated) ────────────────────────────────────────
  { id: "mp-dal-tal",      word1: "달",   word2: "탈",   targetPhoneme: "ㄷ", contrastPhoneme: "ㅌ", label: "ㄷ vs ㅌ 구별" },
  { id: "mp-ja-cha",       word1: "자",   word2: "차",   targetPhoneme: "ㅈ", contrastPhoneme: "ㅊ", label: "ㅈ vs ㅊ 구별" },
  { id: "mp-gong-kong",    word1: "공",   word2: "콩",   targetPhoneme: "ㄱ", contrastPhoneme: "ㅋ", label: "ㄱ vs ㅋ 구별" },
  { id: "mp-bal-pal",      word1: "발",   word2: "팔",   targetPhoneme: "ㅂ", contrastPhoneme: "ㅍ", label: "ㅂ vs ㅍ 구별" },
  { id: "mp-tokki-dokki",  word1: "토끼", word2: "도끼", targetPhoneme: "ㅌ", contrastPhoneme: "ㄷ", label: "ㅌ vs ㄷ 구별" },

  // ── 조음 위치 대조 (place of articulation) ──────────────────────────────────
  { id: "mp-mal-nal",      word1: "말",   word2: "날",   targetPhoneme: "ㅁ", contrastPhoneme: "ㄴ", label: "ㅁ vs ㄴ 구별" },
  { id: "mp-bal-dal",      word1: "발",   word2: "달",   targetPhoneme: "ㅂ", contrastPhoneme: "ㄷ", label: "ㅂ vs ㄷ 구별" },

  // ── 받침 대조 (final consonant contrast) ────────────────────────────────────
  { id: "mp-bab-bam",      word1: "밥",   word2: "밤",   targetPhoneme: "ㅂ", contrastPhoneme: "ㅁ", label: "ㅂ vs ㅁ 받침 구별" },
  { id: "mp-gong-gom",     word1: "공",   word2: "곰",   targetPhoneme: "ㅇ", contrastPhoneme: "ㅁ", label: "ㅇ vs ㅁ 받침 구별" },
  { id: "mp-san-sal",      word1: "산",   word2: "살",   targetPhoneme: "ㄴ", contrastPhoneme: "ㄹ", label: "ㄴ vs ㄹ 받침 구별" },
  { id: "mp-gam-gang",     word1: "감",   word2: "강",   targetPhoneme: "ㅁ", contrastPhoneme: "ㅇ", label: "ㅁ vs ㅇ 받침 구별" },
];

export const WORD_DATABASE: PracticeWord[] = [
  // ══════════════════════════════════════════════════════════
  // ㄹ — 유음 (5-6세, 가장 늦게 완성되는 소리)
  // ══════════════════════════════════════════════════════════
  { word: "라면", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "엄마가 라면을 끓여요.",      soundEffect: "후루룩~" },
  { word: "리본", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "머리에 리본을 달았어요." },
  { word: "로봇", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "로봇이 춤을 춰요.",          soundEffect: "삐빅!" },
  { word: "루돌프", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "루돌프 코는 빨개요." },
  { word: "레몬", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "레몬은 새콤해요.",           soundEffect: "새콤~" },
  { word: "리모컨", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "리모컨으로 TV를 켜요." },
  { word: "라디오", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "라디오에서 노래가 나와요." },
  { word: "레고", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "레고로 집을 만들어요.",      soundEffect: "딸깍딸깍~" },
  { word: "라켓", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "라켓으로 공을 쳐요." },
  { word: "로켓", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "로켓이 하늘로 날아가요.",   soundEffect: "슝~" },
  { word: "나라", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "우리나라는 대한민국이에요." },
  { word: "노래", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "신나는 노래를 불러요.",     soundEffect: "라라라~" },
  { word: "모래", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "모래로 성을 만들어요.",     soundEffect: "사르르~" },
  { word: "바람", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "바람이 쌩쌩 불어요.",       soundEffect: "쌩쌩~" },
  { word: "사랑", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "엄마 사랑해요." },
  { word: "다람쥐", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "다람쥐가 도토리를 먹어요.", soundEffect: "냠냠~" },
  { word: "달리기", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "운동장에서 달리기를 해요.", soundEffect: "후다닥!" },
  { word: "별", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "밤하늘에 별이 빛나요.",     soundEffect: "반짝반짝~" },
  { word: "달", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "밤에 달이 떠요." },
  { word: "물", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "물을 마셔요.",              soundEffect: "꿀꺽~" },
  { word: "말", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "말이 달려가요.",            soundEffect: "히히힝~" },
  { word: "하늘", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "파란 하늘을 봐요." },
  { word: "물고기", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "물고기가 헤엄쳐요.",        soundEffect: "첨벙~" },
  { word: "얼음", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "얼음이 차가워요." },
  { word: "날개", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "새가 날개를 펼쳐요.",       soundEffect: "팔랑팔랑~" },
  { word: "달팽이", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "달팽이가 천천히 기어요.",   soundEffect: "느릿느릿~" },
  { word: "빨대", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빨대로 주스를 마셔요.",     soundEffect: "쭈르르~" },
  { word: "여름", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "여름에 수영해요.",          soundEffect: "첨벙~" },
  { word: "겨울", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "겨울에 눈이 와요.",         soundEffect: "펄펄~" },
  { word: "가을", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "가을에 단풍이 들어요.",     soundEffect: "바스락~" },
  { word: "팔", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "팔을 흔들어요." },
  { word: "발", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "발로 뛰어요.",              soundEffect: "쿵쿵~" },
  { word: "불", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "불이 뜨거워요.",            soundEffect: "활활~" },
  { word: "길", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "길을 걸어요." },
  { word: "구름", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "하늘에 구름이 떠요.",       soundEffect: "둥실둥실~" },
  { word: "이름", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "내 이름은 뭐예요?" },
  { word: "열매", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나무에 열매가 달렸어요." },
  { word: "알람", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "알람이 울려요.",            soundEffect: "따르릉~" },
  { word: "공룡", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "공룡이 크고 무서워요.",     soundEffect: "우르릉~" },
  { word: "풍선", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "풍선이 하늘로 날아가요.",   soundEffect: "펑!" },
  { word: "돌고래", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "돌고래가 헤엄쳐요.",        soundEffect: "첨벙~" },
  { word: "올챙이", targetPhonemes: ["ㄹ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "올챙이가 개구리가 돼요." },
  { word: "파란색", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "하늘은 파란색이에요." },
  { word: "노란색", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "바나나는 노란색이에요." },
  { word: "초록색", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "잎사귀는 초록색이에요." },
  { word: "빨간색", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "딸기는 빨간색이에요." },
  { word: "수레", targetPhonemes: ["ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수레에 짐을 실어요." },
  { word: "하루", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "오늘 하루도 즐거워요." },
  { word: "마을", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "우리 마을은 예뻐요." },
  { word: "호루라기", targetPhonemes: ["ㄹ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "호루라기를 불어요.",         soundEffect: "삐~" },

  // ══════════════════════════════════════════════════════════
  // ㅅ — 치조 마찰음 (4-5세)
  // ══════════════════════════════════════════════════════════
  { word: "사자", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "사자가 으르렁거려요.",     soundEffect: "으르렁~" },
  { word: "수박", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "수박은 달고 시원해요.",     soundEffect: "아삭~" },
  { word: "소", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "소가 음메 울어요.",         soundEffect: "음메~" },
  { word: "새", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "새가 하늘을 날아요.",       soundEffect: "짹짹~" },
  { word: "사과", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "빨간 사과가 맛있어요.",     soundEffect: "아삭~" },
  { word: "손", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "손을 깨끗이 씻어요." },
  { word: "시소", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "시소를 타요.",              soundEffect: "끼익~" },
  { word: "사탕", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "사탕이 달콤해요.",          soundEffect: "냠냠~" },
  { word: "소파", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "소파에 앉아요." },
  { word: "사슴", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사슴이 뛰어요." },
  { word: "사진", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사진을 찍어요.",            soundEffect: "찰칵~" },
  { word: "시장", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "시장에서 과일을 사요." },
  { word: "소리", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "소리를 잘 들어요." },
  { word: "신발", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "신발을 신어요." },
  { word: "선물", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "선물을 받았어요.",          soundEffect: "와~" },
  { word: "숟가락", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "숟가락으로 밥을 먹어요." },
  { word: "솜사탕", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "솜사탕이 달콤해요.",        soundEffect: "사르르~" },
  { word: "소풍", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "소풍 가서 도시락 먹어요." },
  { word: "식빵", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "식빵을 먹어요." },
  { word: "상어", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "상어가 헤엄쳐요.",          soundEffect: "으~ 무서워!" },
  { word: "시계", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "시계가 똑딱거려요.",         soundEffect: "똑딱똑딱~" },
  { word: "소금", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "소금은 짜요." },
  { word: "수영", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "수영장에서 수영해요.",       soundEffect: "첨벙첨벙~" },
  { word: "수건", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "수건으로 닦아요." },
  { word: "색연필", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "색연필로 그림을 그려요." },
  { word: "선생님", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "선생님께 인사해요." },
  { word: "수달", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "수달이 강에서 헤엄쳐요." },
  { word: "사다리", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사다리를 올라가요." },
  { word: "수족관", targetPhonemes: ["ㅅ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "수족관에 물고기가 많아요." },
  { word: "스티커", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "스티커를 붙여요." },

  // ══════════════════════════════════════════════════════════
  // ㅈ — 치조구개 파찰음 (4-5세)
  // ══════════════════════════════════════════════════════════
  { word: "자동차", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "자동차가 빵빵거려요.",     soundEffect: "부릉부릉!" },
  { word: "잠자리", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "잠자리가 날아가요.",        soundEffect: "윙윙~" },
  { word: "지구", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "지구는 둥글어요." },
  { word: "주스", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "주스가 달콤해요.",          soundEffect: "꿀꺽~" },
  { word: "자전거", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "자전거를 타요.",            soundEffect: "씽씽~" },
  { word: "지우개", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "지우개로 지워요." },
  { word: "장난감", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "장난감으로 놀아요." },
  { word: "조개", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "조개를 주웠어요.",          soundEffect: "파도 소리~" },
  { word: "젓가락", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "젓가락으로 반찬을 집어요." },
  { word: "자석", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "자석이 철을 끌어당겨요." },
  { word: "지렁이", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "지렁이가 땅속에 있어요." },
  { word: "집", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "우리 집이 예뻐요." },
  { word: "젤리", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "젤리가 쫄깃해요.",          soundEffect: "쫄깃쫄깃~" },
  { word: "장갑", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "장갑을 끼어요." },
  { word: "전화기", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "전화기로 통화해요.",        soundEffect: "따르릉~" },
  { word: "지하철", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "지하철을 타요." },
  { word: "저금통", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "저금통에 동전을 넣어요.",   soundEffect: "짤랑~" },
  { word: "자장가", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "자장가를 들으며 자요.",     soundEffect: "자장자장~" },
  { word: "지팡이", targetPhonemes: ["ㅈ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "지팡이를 짚어요." },
  { word: "재미", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "놀이가 재미있어요." },
  { word: "재채기", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "재채기가 나요.",            soundEffect: "에취!" },
  { word: "조각", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "퍼즐 조각을 맞춰요.",      soundEffect: "딸깍!" },
  { word: "지갑", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "지갑에 돈이 있어요." },
  { word: "주머니", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "주머니에 손을 넣어요." },
  { word: "진달래", targetPhonemes: ["ㅈ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "봄에 진달래가 피어요." },

  // ══════════════════════════════════════════════════════════
  // ㅊ — 치조구개 파찰음 격음 (4-5세)
  // ══════════════════════════════════════════════════════════
  { word: "차", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "차를 타고 가요.",           soundEffect: "부릉!" },
  { word: "채소", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "채소를 먹으면 건강해요.",   soundEffect: "아삭아삭~" },
  { word: "치킨", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "치킨이 맛있어요.",          soundEffect: "냠냠~" },
  { word: "초콜릿", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초콜릿은 달콤해요.", soundEffect: "스르르~" },
  { word: "축구", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "축구공을 차요.",            soundEffect: "뻥!" },
  { word: "책", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "책을 읽어요." },
  { word: "침대", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "침대에서 자요." },
  { word: "창문", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "창문을 열어요." },
  { word: "참새", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "참새가 짹짹 울어요.",       soundEffect: "짹짹~" },
  { word: "청소기", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "청소기로 먼지를 빨아요.",   soundEffect: "윙윙~" },
  { word: "치약", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "치약으로 이를 닦아요." },
  { word: "촛불", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "촛불이 반짝여요.",          soundEffect: "훅~" },
  { word: "치즈", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "치즈가 맛있어요.",          soundEffect: "냠냠~" },
  { word: "춤", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "신나게 춤을 춰요.",         soundEffect: "신나~" },
  { word: "철봉", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "철봉에 매달려요." },
  { word: "천둥", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "천둥이 우르릉 소리가 나요.", soundEffect: "우르릉~" },
  { word: "청개구리", targetPhonemes: ["ㅊ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "청개구리가 개굴개굴 울어요.", soundEffect: "개굴~" },

  // ══════════════════════════════════════════════════════════
  // ㄱ — 연구개 파열음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "고양이", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "고양이가 야옹 울어요.",     soundEffect: "야옹~" },
  { word: "곰", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "곰이 꿀을 좋아해요.",       soundEffect: "으으~" },
  { word: "기차", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "기차가 달려요.",            soundEffect: "칙칙폭폭!" },
  { word: "가방", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "가방에 책을 넣어요." },
  { word: "강아지", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "강아지가 멍멍 짖어요.",     soundEffect: "멍멍~" },
  { word: "기린", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "기린의 목이 길어요." },
  { word: "거미", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거미가 줄을 타요." },
  { word: "개구리", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "개구리가 개굴개굴 울어요.", soundEffect: "개굴개굴~" },
  { word: "귤", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "귤이 새콤달콤해요.",        soundEffect: "새콤~" },
  { word: "그네", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "그네를 타요.",              soundEffect: "씽씽~" },
  { word: "가위", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "가위로 종이를 잘라요.",     soundEffect: "싹둑~" },
  { word: "거울", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거울을 봐요." },
  { word: "고구마", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "고구마가 달콤해요.",        soundEffect: "냠냠~" },
  { word: "감자", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "감자를 삶아요." },
  { word: "게", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "게가 옆으로 걸어요.",       soundEffect: "집게!" },
  { word: "거북이", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거북이가 느릿느릿 가요.",   soundEffect: "느릿느릿~" },
  { word: "공", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "공을 던져요.",              soundEffect: "통통~" },
  { word: "고래", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "고래가 물을 뿜어요.", soundEffect: "쏴~" },
  { word: "고릴라", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "고릴라가 나무를 타요." },
  { word: "가지", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "가지를 먹어요." },
  { word: "국수", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "국수가 길고 맛있어요.",     soundEffect: "후루룩~" },
  { word: "귀", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "귀로 소리를 들어요." },
  { word: "극장", targetPhonemes: ["ㄱ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "극장에서 영화를 봐요." },

  // ══════════════════════════════════════════════════════════
  // ㄴ — 치조 비음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "나비", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "나비가 꽃 위에 앉아요.",   soundEffect: "팔랑팔랑~" },
  { word: "눈", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "하얀 눈이 내려요.",         soundEffect: "펄펄~" },
  { word: "냉장고", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "냉장고에 우유가 있어요.",   soundEffect: "웅웅~" },
  { word: "나무", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "나무가 높이 자라요." },
  { word: "냄비", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "냄비에 국을 끓여요.",       soundEffect: "보글보글~" },
  { word: "나팔", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나팔을 불어요.", soundEffect: "빠라밤~" },
  { word: "낙타", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "낙타가 사막을 걸어요." },
  { word: "놀이터", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "놀이터에서 놀아요.", soundEffect: "까르르~" },
  { word: "눈물", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "눈물이 뚝뚝 흘러요.", soundEffect: "뚝뚝~" },
  { word: "나물", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나물을 먹어요." },
  { word: "낮잠", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "낮잠을 자요.",              soundEffect: "쿨쿨~" },
  { word: "노트", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "노트에 글씨를 써요." },
  { word: "누나", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "누나가 예뻐요." },
  { word: "낙엽", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "낙엽이 바스락거려요.", soundEffect: "바스락~" },
  { word: "너구리", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "너구리가 뒤뚱거려요." },
  { word: "냉면", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "냉면이 시원해요.",    soundEffect: "후루룩~" },
  { word: "노루", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "노루가 뛰어요." },
  { word: "무지개", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "비 온 뒤에 무지개가 떠요." },

  // ══════════════════════════════════════════════════════════
  // ㄷ — 치조 파열음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "도토리", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "다람쥐가 도토리를 모아요.", soundEffect: "데굴데굴~" },
  { word: "딸기", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "빨간 딸기가 달콤해요.", soundEffect: "냠냠~" },
  { word: "당근", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "당근을 먹어요.",            soundEffect: "아삭~" },
  { word: "돼지", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "돼지가 꿀꿀 울어요.",       soundEffect: "꿀꿀~" },
  { word: "동생", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "동생이 귀여워요." },
  { word: "도넛", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "도넛이 맛있어요.",          soundEffect: "냠냠~" },
  { word: "달걀", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "달걀을 삶아요." },
  { word: "도서관", targetPhonemes: ["ㄷ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "도서관에서 책을 읽어요." },
  { word: "다리", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "다리로 뛰어요." },
  { word: "도마뱀", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "도마뱀이 기어가요." },
  { word: "독수리", targetPhonemes: ["ㄷ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "독수리가 높이 날아요." },
  { word: "도화지", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "도화지에 그림을 그려요." },
  { word: "두더지", targetPhonemes: ["ㄷ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "두더지가 땅을 파요." },
  { word: "도깨비", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "도깨비가 나타났어요.",      soundEffect: "으~ 무서워!" },
  { word: "달고나", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "달고나가 달콤해요." },
  { word: "대나무", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "판다가 대나무를 먹어요." },
  { word: "두루미", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "두루미가 날아가요." },

  // ══════════════════════════════════════════════════════════
  // ㅂ — 양순 파열음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "바나나", targetPhonemes: ["ㅂ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "원숭이가 바나나를 먹어요.", soundEffect: "냠냠~" },
  { word: "버스", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "버스를 타고 가요.",         soundEffect: "부릉부릉!" },
  { word: "병아리", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "병아리가 삐약삐약 울어요.", soundEffect: "삐약~" },
  { word: "별빛", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "2-3세", sampleSentence: "별빛이 반짝반짝 빛나요.", soundEffect: "반짝반짝~" },
  { word: "부엉이", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "부엉이가 부엉부엉 울어요.", soundEffect: "부엉부엉~" },
  { word: "버섯", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "버섯이 숲속에 있어요." },
  { word: "바다", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "바다가 넓어요.",            soundEffect: "파도 철썩~" },
  { word: "배", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "배가 달콤해요.",            soundEffect: "아삭~" },
  { word: "봄", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "봄에 꽃이 피어요." },
  { word: "번개", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "번개가 번쩍 쳐요.",         soundEffect: "번쩍!" },
  { word: "바위", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "바위가 크고 무거워요." },
  { word: "배추", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "배추로 김치를 만들어요." },
  { word: "비행기", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "비행기가 하늘을 날아요.",   soundEffect: "윙~" },
  { word: "반딧불이", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "반딧불이가 반짝여요.",   soundEffect: "반짝반짝~" },
  { word: "빗자루", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "빗자루로 쓸어요." },
  { word: "병원", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "병원에 가요." },
  { word: "불꽃", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "불꽃놀이가 예뻐요.",    soundEffect: "펑펑~" },
  { word: "빵", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "빵을 먹어요.",              soundEffect: "냠냠~" },

  // ══════════════════════════════════════════════════════════
  // ㅁ — 양순 비음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "마트", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "마트에서 과일을 사요." },
  { word: "모자", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "빨간 모자를 써요." },
  { word: "문어", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "문어는 다리가 여덟 개예요.", soundEffect: "꿈틀꿈틀~" },
  { word: "미끄럼틀", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "hard", ageGroup: "2-3세", sampleSentence: "미끄럼틀을 타요.",     soundEffect: "슝~" },
  { word: "메뚜기", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "메뚜기가 풀밭에 있어요." },
  { word: "목도리", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "목도리를 목에 감아요." },
  { word: "물감", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "물감으로 그림을 그려요." },
  { word: "마이크", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "마이크에 대고 노래해요.",  soundEffect: "라라라~" },
  { word: "망원경", targetPhonemes: ["ㅁ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "망원경으로 별을 봐요." },
  { word: "만두", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "만두가 맛있어요.",          soundEffect: "냠냠~" },
  { word: "매미", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "매미가 맴맴 울어요.",       soundEffect: "맴맴~" },
  { word: "모기", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "모기가 윙윙거려요.",        soundEffect: "윙윙~" },
  { word: "먹구름", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "먹구름이 몰려와요." },
  { word: "무당벌레", targetPhonemes: ["ㅁ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "무당벌레가 예뻐요." },
  { word: "메론", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "메론이 달콤해요.",     soundEffect: "냠냠~" },
  { word: "망고", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "망고가 달콤해요.",          soundEffect: "냠냠~" },
  { word: "마스크", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "마스크를 써요." },
  { word: "모래성", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "모래성을 만들어요." },

  // ══════════════════════════════════════════════════════════
  // ㅎ — 성문 마찰음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "하마", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "하마는 입이 커요.",         soundEffect: "으르렁!" },
  { word: "호랑이", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "호랑이가 어흥 울어요.", soundEffect: "어흥~" },
  { word: "화분", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "화분에 꽃이 피었어요." },
  { word: "해", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "해가 반짝반짝 빛나요.",     soundEffect: "반짝반짝~" },
  { word: "호박", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "호박이 크고 둥글어요." },
  { word: "해바라기", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "해바라기가 해를 봐요." },
  { word: "헬리콥터", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "헬리콥터가 하늘을 날아요.", soundEffect: "두두두두~" },
  { word: "호떡", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "호떡이 달콤해요.",          soundEffect: "지글지글~" },
  { word: "해파리", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "해파리가 둥둥 떠요." },
  { word: "학교", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "학교에 가요." },
  { word: "호수", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "호수에 오리가 있어요." },
  { word: "하품", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "하품이 나와요.",            soundEffect: "하~암" },
  { word: "허수아비", targetPhonemes: ["ㅎ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "허수아비가 논에 있어요." },
  { word: "화장실", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "화장실에 가요." },
  { word: "흙", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "흙을 만져요." },

  // ══════════════════════════════════════════════════════════
  // ㅌ — 치조 파열음 격음 (3-4세)
  // ══════════════════════════════════════════════════════════
  { word: "토끼", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "토끼가 깡충깡충 뛰어요.",   soundEffect: "깡충깡충!" },
  { word: "타조", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "타조가 빨리 달려요." },
  { word: "태양", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "태양이 뜨거워요." },
  { word: "토마토", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "토마토가 빨개요.",          soundEffect: "아삭~" },
  { word: "트럭", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "트럭이 짐을 실어요.",       soundEffect: "부릉부릉!" },
  { word: "터널", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "터널을 지나가요.",          soundEffect: "윙~" },
  { word: "탱크", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "탱크가 크고 무거워요." },
  { word: "태풍", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "태풍이 거세게 불어요.",     soundEffect: "쌩쌩~" },
  { word: "턱", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "턱을 만져요." },
  { word: "텔레비전", targetPhonemes: ["ㅌ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "텔레비전을 봐요." },
  { word: "튀김", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "튀김이 바삭바삭해요.",      soundEffect: "바삭바삭~" },
  { word: "탑", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "탑이 높이 솟아 있어요." },
  { word: "택시", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "택시를 타요." },

  // ══════════════════════════════════════════════════════════
  // ㅍ — 양순 파열음 격음 (3-4세)
  // ══════════════════════════════════════════════════════════
  { word: "파도", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "파도가 출렁거려요.",        soundEffect: "철썩철썩~" },
  { word: "파인애플", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "파인애플이 달콤새콤해요." },
  { word: "포도", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "포도가 달콤해요.",          soundEffect: "냠냠~" },
  { word: "피자", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "피자가 맛있어요.",          soundEffect: "냠냠~" },
  { word: "팽이", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "팽이를 돌려요.",            soundEffect: "윙윙~" },
  { word: "풍선", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "풍선이 하늘로 날아가요.",   soundEffect: "펑!" },
  { word: "피리", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "피리를 불어요.",    soundEffect: "삐리리~" },
  { word: "편지", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "편지를 써요." },
  { word: "폭포", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "폭포가 시원하게 떨어져요.", soundEffect: "콸콸~" },
  { word: "팝콘", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "팝콘이 톡톡 튀어요.",       soundEffect: "팡팡~" },
  { word: "펭귄", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "펭귄이 뒤뚱뒤뚱 걸어요.",  soundEffect: "뒤뚱뒤뚱~" },
  { word: "피아노", targetPhonemes: ["ㅍ", "ㄴ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "피아노를 쳐요.",            soundEffect: "도레미~" },
  { word: "표범", targetPhonemes: ["ㅍ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "표범이 빠르게 달려요." },

  // ══════════════════════════════════════════════════════════
  // 경음 — ㄲ ㄸ ㅃ ㅆ ㅉ (4-5세 이후)
  // ══════════════════════════════════════════════════════════
  { word: "꽃", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "꽃이 예뻐요.",              soundEffect: "향기롭다~" },
  { word: "꿀벌", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "꿀벌이 윙윙 날아요.",       soundEffect: "윙윙~" },
  { word: "꿈", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "예쁜 꿈을 꿔요.",           soundEffect: "쿨쿨~" },
  { word: "깃발", targetPhonemes: ["ㄲ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "깃발을 흔들어요.",          soundEffect: "펄럭펄럭~" },
  { word: "끈", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "끈으로 묶어요." },
  { word: "떡볶이", targetPhonemes: ["ㄸ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "떡볶이가 맛있어요.",        soundEffect: "매콤~" },
  { word: "뚜껑", targetPhonemes: ["ㄸ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "뚜껑을 열어요.",            soundEffect: "펑~" },
  { word: "떡국", targetPhonemes: ["ㄸ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "설날에 떡국을 먹어요." },
  { word: "딸기잼", targetPhonemes: ["ㄸ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "딸기잼을 빵에 발라요." },
  { word: "빨래", targetPhonemes: ["ㅃ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "빨래를 널어요." },
  { word: "뿌리", targetPhonemes: ["ㅃ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "식물의 뿌리가 땅속에 있어요." },
  { word: "씨앗", targetPhonemes: ["ㅆ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "씨앗을 심어요." },
  { word: "쓰레기통", targetPhonemes: ["ㅆ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "쓰레기통에 버려요." },
  { word: "썰매", targetPhonemes: ["ㅆ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "눈 위에서 썰매를 타요.",    soundEffect: "씽씽~" },
  { word: "찌개", targetPhonemes: ["ㅉ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "찌개가 보글보글 끓어요.",   soundEffect: "보글보글~" },
  { word: "쪽지", targetPhonemes: ["ㅉ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "쪽지에 쓸게요." },
  { word: "찐만두", targetPhonemes: ["ㅉ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "찐만두가 맛있어요.",        soundEffect: "냠냠~" },

  // ══════════════════════════════════════════════════════════
  // 신체·가족·일상 (자주 쓰는 단어)
  // ══════════════════════════════════════════════════════════
  { word: "엄마", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "엄마가 좋아요." },
  { word: "아빠", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "아빠가 힘이 세요." },
  { word: "할머니", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "할머니가 사랑스러워요." },
  { word: "할아버지", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "할아버지께 인사해요." },
  { word: "언니", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "언니가 예뻐요." },
  { word: "오빠", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "오빠가 멋져요." },
  { word: "형", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "형이 친절해요." },
  { word: "눈코입", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "눈코입이 있어요." },
  { word: "무릎", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "무릎을 굽혀요." },
  { word: "머리", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "머리를 감아요." },
  { word: "배꼽", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "배꼽이 있어요." },
  { word: "밥", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "밥을 먹어요.",              soundEffect: "냠냠~" },
  { word: "국", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "국을 마셔요.",              soundEffect: "후루룩~" },
  { word: "우유", targetPhonemes: [], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "우유를 마셔요.",            soundEffect: "꿀꺽~" },
  { word: "과자", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "과자가 바삭바삭해요.",  soundEffect: "바삭~" },
  { word: "사탕수수", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "사탕수수로 설탕을 만들어요.", soundEffect: "냠냠~" },
  { word: "케이크", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "케이크에 초를 꽂아요.",    soundEffect: "생일 축하~" },
  { word: "아이스크림", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "아이스크림이 시원해요.",   soundEffect: "야호~" },

  // ══════════════════════════════════════════════════════════
  // 자연·날씨·계절
  // ══════════════════════════════════════════════════════════
  { word: "꽃잎", targetPhonemes: ["ㄲ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "꽃잎이 날려요.",           soundEffect: "팔랑팔랑~" },
  { word: "비", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "비가 내려요.",              soundEffect: "후두두~" },
  { word: "눈사람", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "눈사람을 만들어요." },
  { word: "무지개", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "무지개가 일곱 색이에요." },
  { word: "바닷가", targetPhonemes: ["ㅂ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "바닷가에서 놀아요." },
  { word: "폭풍", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "폭풍이 세게 불어요." },
  { word: "새싹", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "새싹이 돋아났어요." },
  { word: "솔방울", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "솔방울을 주웠어요." },
  { word: "단풍", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "단풍이 빨갛게 물들었어요.", soundEffect: "바스락~" },

  // ══════════════════════════════════════════════════════════
  // 놀이·장난감·활동
  // ══════════════════════════════════════════════════════════
  { word: "블록", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "블록으로 탑을 쌓아요.", soundEffect: "딸깍딸깍~" },
  { word: "인형", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "인형을 안아요." },
  { word: "퍼즐", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "퍼즐을 맞춰요.",            soundEffect: "딸깍!" },
  { word: "색종이", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "색종이로 접어요." },
  { word: "크레파스", targetPhonemes: ["ㄹ"], difficulty: "hard",   ageGroup: "4-5세", sampleSentence: "크레파스로 그림 그려요." },
  { word: "수영복", targetPhonemes: ["ㅅ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "수영복을 입어요." },
  { word: "줄넘기", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "줄넘기를 해요.",     soundEffect: "휙휙~" },
  { word: "미술", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "미술 시간이 재미있어요." },

  // ══════════════════════════════════════════════════════════
  // 직업 (직업 관련 단어들)
  // ══════════════════════════════════════════════════════════
  { word: "의사", targetPhonemes: ["ㅇ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "의사가 병을 고쳐요." },
  { word: "경찰관", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "경찰관이 질서를 지켜요." },
  { word: "소방관", targetPhonemes: ["ㅅ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "소방관이 불을 꺼요." },
  { word: "교사", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "교사가 우리에게 배워요." },
  { word: "농부", targetPhonemes: ["ㄴ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "농부가 쌀을 키워요." },
  { word: "요리사", targetPhonemes: ["ㅇ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "요리사가 맛있는 음식을 만들어요." },
  { word: "의사선생님", targetPhonemes: ["ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "의사선생님께서 약을 주셨어요." },
  { word: "우체부", targetPhonemes: ["ㅇ", "ㅊ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "우체부가 편지를 나르는 일을 해요." },
  { word: "경찰", targetPhonemes: ["ㄱ", "ㅊ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "경찰이 우리를 지켜줘요." },
  { word: "화가", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "화가가 그림을 그려요." },
  { word: "음악가", targetPhonemes: ["ㅇ", "ㅁ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "음악가가 아름다운 곡을 만들어요." },
  { word: "운동선수", targetPhonemes: ["ㅇ", "ㄴ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "운동선수가 경쟁에서 우승했어요." },
  { word: "선수", targetPhonemes: ["ㅅ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "선수가 게임에서 이겼어요." },

  // ══════════════════════════════════════════════════════════
  // 운동·게임
  // ══════════════════════════════════════════════════════════
  { word: "야구", targetPhonemes: ["ㅇ", "ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "야구를 해요.",             soundEffect: "탁!" },
  { word: "탁구", targetPhonemes: ["ㅌ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "탁구 경기가 재미있어요.",   soundEffect: "탁탁~" },
  { word: "배드민턴", targetPhonemes: ["ㅂ", "ㄷ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "배드민턴을 친다." },
  { word: "스키", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "눈 위에서 스키를 타요." },
  { word: "스케이트", targetPhonemes: ["ㅅ", "ㄱ", "ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "스케이트를 신고 미끄러져요." },
  { word: "멀리뛰기", targetPhonemes: ["ㅁ", "ㄹ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "멀리뛰기 대회에 나갔어요." },
  { word: "높이뛰기", targetPhonemes: ["ㄴ", "ㄱ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "높이뛰기를 해요." },
  { word: "체조", targetPhonemes: ["ㅊ", "ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "체조 시간이 재미있어요." },
  { word: "무술", targetPhonemes: ["ㅁ", "ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "무술을 배워요." },
  { word: "태권도", targetPhonemes: ["ㅌ", "ㄱ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "태권도를 배우고 있어요." },

  // ══════════════════════════════════════════════════════════
  // 감정·상태
  // ══════════════════════════════════════════════════════════
  { word: "행복", targetPhonemes: ["ㅎ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "행복한 기분이에요." },
  { word: "슬픔", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "슬픈 영화를 봤어요." },
  { word: "화남", targetPhonemes: ["ㅎ", "ㄴ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "화나면 안 돼요." },
  { word: "무서움", targetPhonemes: ["ㅁ", "ㅅ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "무서운 영화 보지 말아요." },
  { word: "신남", targetPhonemes: ["ㅅ", "ㄴ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "신나는 음악을 들어요." },
  { word: "졸음", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "졸음이 와요." },
  { word: "피로", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "피로해 보여요." },
  { word: "부끄러움", targetPhonemes: ["ㅂ", "ㄲ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "부끄러워하지 말아요." },
  { word: "설렘", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "설레는 마음이에요." },

  // ══════════════════════════════════════════════════════════
  // 더 많은 동물들
  // ══════════════════════════════════════════════════════════
  { word: "사자", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "사자가 사바나에 살아요." },
  { word: "얼룩말", targetPhonemes: ["ㅇ", "ㄹ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "얼룩말이 줄무늬가 있어요." },
  { word: "코끼리", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "코끼리 코는 길어요." },
  { word: "캥거루", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "캥거루가 뛰어가요." },
  { word: "오랑우탄", targetPhonemes: ["ㅇ", "ㄹ", "ㄴ", "ㅇ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "오랑우탄이 나무에 매달려요." },
  { word: "침팬지", targetPhonemes: ["ㅊ", "ㅍ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "침팬지가 똑똑해요." },
  { word: "고릴라", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "고릴라가 힘이 세요." },
  { word: "사슴", targetPhonemes: ["ㅅ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사슴의 뿔이 크네요." },
  { word: "들소", targetPhonemes: ["ㄷ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "들소는 목초지에 산다." },
  { word: "라마", targetPhonemes: ["ㄹ", "ㅁ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "라마가 털이 복슬복슬해요." },
  { word: "양", targetPhonemes: ["ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "양이 메메 울어요.",      soundEffect: "메메~" },
  { word: "염소", targetPhonemes: ["ㅇ", "ㅁ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "염소가 풀을 뜯어 먹어요." },
  { word: "사슴벌레", targetPhonemes: ["ㅅ", "ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "사슴벌레 애벌레를 찾았어요." },
  { word: "나방", targetPhonemes: ["ㄴ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나방이 불빛에 모여요." },
  { word: "매", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "매가 높이 날아가요." },
  { word: "문제", targetPhonemes: ["ㅁ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "어려운 문제를 풀어요." },
  { word: "악어", targetPhonemes: ["ㅇ", "ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "악어의 입이 커요." },
  { word: "개미", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "개미가 줄지어 가요." },
  { word: "나뭇잎", targetPhonemes: ["ㄴ", "ㅁ", "ㄷ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "나뭇잎이 바스락거려요." },

  // ══════════════════════════════════════════════════════════
  // 더 많은 음식
  // ══════════════════════════════════════════════════════════
  { word: "소시지", targetPhonemes: ["ㅅ", "ㅅ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "소시지를 구워먹어요." },
  { word: "비빔밥", targetPhonemes: ["ㅂ", "ㅂ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "비빔밥이 맛있어요." },
  { word: "김밥", targetPhonemes: ["ㄱ", "ㅂ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "김밥을 말아요." },
  { word: "우동", targetPhonemes: ["ㅇ", "ㄷ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "우동이 길고 맛있어요." },
  { word: "스파게티", targetPhonemes: ["ㅅ", "ㅍ", "ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "스파게티를 먹어요." },
  { word: "카레", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "카레가 맵지만 맛있어요." },
  { word: "핫도그", targetPhonemes: ["ㅎ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "핫도그를 먹어요." },
  { word: "케첩", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "감자튀김에 케첩을 쳐요." },
  { word: "마요네즈", targetPhonemes: ["ㅁ", "ㅇ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "마요네즈를 짜요." },
  { word: "기름", targetPhonemes: ["ㄱ", "ㄹ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "기름으로 부쳐요." },
  { word: "소금", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "소금을 뿌려요." },
  { word: "설탕", targetPhonemes: ["ㅅ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "설탕이 달콤해요." },
  { word: "초콜릿", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초콜릿을 먹어요." },
  { word: "아이스크림", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "아이스크림이 차가워요." },
  { word: "요구르트", targetPhonemes: ["ㅇ", "ㄱ", "ㄹ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "요구르트를 마셔요." },
  { word: "버터", targetPhonemes: ["ㅂ", "ㅌ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "버터를 빵에 바르는거예요." },
  { word: "잼", targetPhonemes: ["ㅈ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "딸기잼이 맛있어요." },
  { word: "누텔라", targetPhonemes: ["ㄴ", "ㅌ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "누텔라를 빵에 발라요." },
  { word: "두유", targetPhonemes: ["ㄷ", "ㅇ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "두유를 마셔요." },

  // ══════════════════════════════════════════════════════════
  // 신체 부위 추가
  // ══════════════════════════════════════════════════════════
  { word: "머리카락", targetPhonemes: ["ㅁ", "ㄹ", "ㄱ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "머리카락이 길어요." },
  { word: "이마", targetPhonemes: ["ㅇ", "ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "이마에 뽀뽀했어요." },
  { word: "눈썹", targetPhonemes: ["ㄴ", "ㅆ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "눈썹이 진하네요." },
  { word: "코", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "코로 숨을 쉬어요." },
  { word: "입술", targetPhonemes: ["ㅇ", "ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "입술이 빨갛네요." },
  { word: "이빨", targetPhonemes: ["ㅇ", "ㅃ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "이빨을 닦아요." },
  { word: "혀", targetPhonemes: ["ㅎ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "혀로 맛을 봐요." },
  { word: "턱", targetPhonemes: ["ㅌ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "턱이 뾰족해요." },
  { word: "목", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "목이 아파요." },
  { word: "어깨", targetPhonemes: ["ㄲ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "어깨가 아파요." },
  { word: "팔꿈치", targetPhonemes: ["ㅍ", "ㄲ", "ㅁ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "팔꿈치로 탁자에 부딪혔어요." },
  { word: "손가락", targetPhonemes: ["ㅅ", "ㄱ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손가락 다섯 개가 있어요." },
  { word: "가슴", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "가슴이 철렁했어요." },
  { word: "배", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "배가 고파요." },
  { word: "엉덩이", targetPhonemes: ["ㅇ", "ㄷ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "엉덩이를 탁탁 치지 마요." },
  { word: "정강이", targetPhonemes: ["ㅈ", "ㄱ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "정강이가 아파요." },
  { word: "발목", targetPhonemes: ["ㅂ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "발목이 삐끗했어요." },
  { word: "발톱", targetPhonemes: ["ㅂ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "발톱을 깎아요." },
  { word: "피", targetPhonemes: ["ㅍ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "피가 나왔어요." },
  { word: "근육", targetPhonemes: ["ㄱ", "ㄴ", "ㅇ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "근육이 커야 세요." },
  { word: "뼈", targetPhonemes: ["ㄲ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "뼈가 부러졌어요." },
  { word: "뇌", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "뇌는 중요한 기관이에요." },

  // ══════════════════════════════════════════════════════════
  // 옷과 신발
  // ══════════════════════════════════════════════════════════
  { word: "셔츠", targetPhonemes: ["ㅅ", "ㅊ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "셔츠를 입어요." },
  { word: "바지", targetPhonemes: ["ㅂ", "ㅈ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "파란 바지를 입어요." },
  { word: "속옷", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "속옷을 입어요." },
  { word: "양말", targetPhonemes: ["ㅇ", "ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "양말을 신어요." },
  { word: "부츠", targetPhonemes: ["ㅂ", "ㅊ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "부츠가 따뜻해요." },
  { word: "운동화", targetPhonemes: ["ㅇ", "ㄷ", "ㅇ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "운동화로 뛰어요." },
  { word: "슬리퍼", targetPhonemes: ["ㅅ", "ㄹ", "ㅍ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "슬리퍼를 신어요." },
  { word: "내복", targetPhonemes: ["ㄴ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "겨울에 내복을 입어요." },
  { word: "스웨터", targetPhonemes: ["ㅅ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "스웨터가 따뜻해요." },
  { word: "코트", targetPhonemes: ["ㄱ", "ㅌ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "겨울 코트를 입어요." },

  // ══════════════════════════════════════════════════════════
  // 동사 (행동)
  // ══════════════════════════════════════════════════════════
  { word: "웃다", targetPhonemes: ["ㅇ", "ㅆ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "재미있어서 웃어요." },
  { word: "울다", targetPhonemes: ["ㅇ", "ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "슬퍼서 울어요." },
  { word: "걷다", targetPhonemes: ["ㄱ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "천천히 걸어요." },
  { word: "앉다", targetPhonemes: ["ㅇ", "ㄴ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "의자에 앉아요." },
  { word: "누우다", targetPhonemes: ["ㄴ", "ㅇ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "침대에 누워요." },
  { word: "일어나다", targetPhonemes: ["ㅇ", "ㄹ", "ㄴ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "아침에 일어나요." },
  { word: "자다", targetPhonemes: ["ㅈ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밤에 자요." },
  { word: "먹다", targetPhonemes: ["ㅁ", "ㄱ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밥을 먹어요." },
  { word: "마시다", targetPhonemes: ["ㅁ", "ㅅ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "물을 마셔요." },
  { word: "보다", targetPhonemes: ["ㅂ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하늘을 봐요." },
  { word: "듣다", targetPhonemes: ["ㄷ", "ㅅ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "음악을 들어요." },
  { word: "말하다", targetPhonemes: ["ㅁ", "ㄹ", "ㅎ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "천천히 말해요." },
  { word: "쓰다", targetPhonemes: ["ㅆ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "글씨를 써요." },
  { word: "읽다", targetPhonemes: ["ㅇ", "ㄷ", "ㄱ", "ㄷ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "책을 읽어요." },
  { word: "그리다", targetPhonemes: ["ㄱ", "ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "그림을 그려요." },
  { word: "만들다", targetPhonemes: ["ㅁ", "ㄷ", "ㄹ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "장난감을 만들어요." },
  { word: "찾다", targetPhonemes: ["ㅊ", "ㅊ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "물건을 찾아요." },
  { word: "숨다", targetPhonemes: ["ㅅ", "ㅁ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "숨바꼭질을 해요." },
  { word: "밀다", targetPhonemes: ["ㅁ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "문을 밀어요." },
  { word: "당기다", targetPhonemes: ["ㄷ", "ㄲ", "ㄱ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손으로 당겨요." },

  // ══════════════════════════════════════════════════════════
  // 형용사 (특성)
  // ══════════════════════════════════════════════════════════
  { word: "크다", targetPhonemes: ["ㅋ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "상자가 커요." },
  { word: "작다", targetPhonemes: ["ㅈ", "ㄲ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "아기가 작아요." },
  { word: "길다", targetPhonemes: ["ㄱ", "ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "막대가 길어요." },
  { word: "짧다", targetPhonemes: ["ㅆ", "ㅃ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "머리가 짧네요." },
  { word: "높다", targetPhonemes: ["ㄴ", "ㅁ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하늘이 높아요." },
  { word: "낮다", targetPhonemes: ["ㄴ", "ㅅ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "의자가 낮아요." },
  { word: "넓다", targetPhonemes: ["ㄴ", "ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "공원이 넓어요." },
  { word: "좁다", targetPhonemes: ["ㅈ", "ㅂ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "방이 좁아요." },
  { word: "뜨겁다", targetPhonemes: ["ㄷ", "ㄲ", "ㅂ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "물이 뜨거워요." },
  { word: "차갑다", targetPhonemes: ["ㅊ", "ㄱ", "ㅂ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "얼음이 차가워요." },
  { word: "빠르다", targetPhonemes: ["ㅃ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "차가 빨라요." },
  { word: "느리다", targetPhonemes: ["ㄴ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "달팽이가 느려요." },
  { word: "밝다", targetPhonemes: ["ㅂ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "햇빛이 밝아요." },
  { word: "어둡다", targetPhonemes: ["ㄷ", "ㅂ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "밤이 어두워요." },
  { word: "깨끗하다", targetPhonemes: ["ㄲ", "ㄷ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손을 깨끗이 씻어요." },
  { word: "더럽다", targetPhonemes: ["ㄷ", "ㄹ", "ㅂ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "진흙이 더러워요." },
  { word: "단맛", targetPhonemes: ["ㄷ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "단맛이 좋아요." },
  { word: "짠맛", targetPhonemes: ["ㅉ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "짠맛이 나요." },

  // ══════════════════════════════════════════════════════════
  // 마지막 추가 카테고리 (교실, 학용품, 기타)
  // ══════════════════════════════════════════════════════════
  { word: "책상", targetPhonemes: ["ㅊ", "ㄱ", "ㅅ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "책상에 책을 놓아요." },
  { word: "의자", targetPhonemes: ["ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "의자에 앉아요." },
  { word: "칠판", targetPhonemes: ["ㅊ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "칠판에 글씨를 써요." },
  { word: "지우개", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "지우개로 지워요." },
  { word: "딱지", targetPhonemes: ["ㄷ", "ㄲ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "딱지를 모아요." },
  { word: "그림책", targetPhonemes: ["ㄱ", "ㄹ", "ㅁ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "그림책을 읽어요." },
  { word: "교실", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "교실에서 공부해요." },
  { word: "운동장", targetPhonemes: ["ㄷ", "ㄴ", "ㄷ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "운동장에서 달려요." },
  { word: "화장실", targetPhonemes: ["ㅎ", "ㅈ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "화장실에 갔어요." },
  { word: "급식실", targetPhonemes: ["ㄲ", "ㅂ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "급식실에서 밥을 먹어요." },

  // 색깔 (Colors)
  { word: "빨강", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "이건 빨강이에요." },
  { word: "파랑", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "파랑은 하늘색이에요." },
  { word: "노랑", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "해는 노랑이에요." },
  { word: "초록", targetPhonemes: ["ㅊ", "ㄹ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "나뭇잎은 초록이에요." },
  { word: "보라", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "포도는 보라색이에요." },
  { word: "분홍", targetPhonemes: ["ㅂ", "ㄴ", "ㅎ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "분홍은 예뻐요." },
  { word: "회색", targetPhonemes: ["ㅎ", "ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "생쥐는 회색이에요." },
  { word: "검정", targetPhonemes: ["ㄱ", "ㅁ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "검정색은 어두워요." },
  { word: "하양", targetPhonemes: ["ㅎ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "눈은 하얗고 차가워요." },
  { word: "주황", targetPhonemes: ["ㅊ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "귤은 주황색이에요." },

  // 숫자 (Numbers)
  { word: "하나", targetPhonemes: ["ㅎ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하나, 둘, 셋." },
  { word: "둘", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "사과가 둘 있어요." },
  { word: "셋", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "사탕이 셋이에요." },
  { word: "넷", targetPhonemes: ["ㄴ", "ㅅ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "넷까지 세어요." },
  { word: "다섯", targetPhonemes: ["ㄷ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "손가락이 다섯 개예요." },
  { word: "여섯", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "여섯 살이에요." },
  { word: "일곱", targetPhonemes: ["ㄱ", "ㅂ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "일곱이 되었어요." },
  { word: "여덟", targetPhonemes: ["ㄷ", "ㅂ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "여덟 개가 있어요." },
  { word: "아홉", targetPhonemes: ["ㅎ", "ㅂ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "아홉 개를 샀어요." },
  { word: "열", targetPhonemes: ["ㅇ", "ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "열 개가 있어요." },

  // 날씨 (Weather)
  { word: "날씨", targetPhonemes: ["ㄴ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "오늘 날씨가 좋아요." },
  { word: "맑음", targetPhonemes: ["ㅁ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "하늘이 맑아요." },
  { word: "흐림", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "오늘은 흐려요." },
  { word: "비", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "비가 오고 있어요." },
  { word: "눈", targetPhonemes: ["ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "눈이 많이 내려요." },
  { word: "바람", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "바람이 불어요." },
  { word: "천둥", targetPhonemes: ["ㅊ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "천둥이 울려요." },
  { word: "번개", targetPhonemes: ["ㅂ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "번개가 쳤어요." },
  { word: "구름", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "구름이 떠가요." },
  { word: "햇빛", targetPhonemes: ["ㅎ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "햇빛이 따뜻해요." },

  // 탈것 (Vehicles)
  { word: "버스", targetPhonemes: ["ㅂ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "버스를 탔어요." },
  { word: "택시", targetPhonemes: ["ㅌ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "택시를 불렀어요." },
  { word: "기차", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "기차는 빨라요." },
  { word: "비행기", targetPhonemes: ["ㅂ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "비행기를 타고 갔어요." },
  { word: "배", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "배를 타요." },
  { word: "자동차", targetPhonemes: ["ㅊ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "자동차가 빨리 가요." },
  { word: "오토바이", targetPhonemes: ["ㅌ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "오토바이는 시끄러워요." },
  { word: "자전거", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "자전거를 타요." },
  { word: "스쿠터", targetPhonemes: ["ㅆ", "ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "스쿠터를 탔어요." },
  { word: "헬리콥터", targetPhonemes: ["ㅎ", "ㄹ", "ㄱ", "ㅂ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "헬리콥터가 날고 있어요." },

  // 과일 (Fruits) - 추가
  { word: "딸기", targetPhonemes: ["ㄷ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "딸기는 빨가고 맛있어요." },
  { word: "포도", targetPhonemes: ["ㅍ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "포도를 먹었어요." },
  { word: "수박", targetPhonemes: ["ㅅ", "ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수박은 시원해요." },
  { word: "참외", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "참외가 맛있어요." },
  { word: "복숭아", targetPhonemes: ["ㅂ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "복숭아는 부드러워요." },
  { word: "체리", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "체리는 작고 빨가요." },
  { word: "라임", targetPhonemes: ["ㄹ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "라임은 초록색이에요." },
  { word: "배", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "배가 맛있어요." },
  { word: "귀리", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "귀리는 곡물이에요." },
  { word: "무화과", targetPhonemes: ["ㅁ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "무화과는 달아요." },

  // 채소 (Vegetables)
  { word: "당근", targetPhonemes: ["ㄷ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "당근을 깎아요." },
  { word: "옥수수", targetPhonemes: ["ㅆ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "옥수수를 먹어요." },
  { word: "감자", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "감자로 밥을 해요." },
  { word: "고구마", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고구마는 달아요." },
  { word: "양파", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "양파를 잘라요." },
  { word: "마늘", targetPhonemes: ["ㅁ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "마늘 냄새가 나요." },
  { word: "상추", targetPhonemes: ["ㅅ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "상추를 씻어요." },
  { word: "배추", targetPhonemes: ["ㅂ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "배추로 김치를 만들어요." },
  { word: "오이", targetPhonemes: ["ㅇ", "ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "오이는 아삭해요." },
  { word: "토마토", targetPhonemes: ["ㅌ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "토마토는 빨가요." },

  // 방·장소 (Rooms/Places)
  { word: "침실", targetPhonemes: ["ㅊ", "ㅂ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "침실에서 자요." },
  { word: "거실", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "거실에서 놀아요." },
  { word: "주방", targetPhonemes: ["ㅊ, ㅂ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "주방에서 밥을 해요." },
  { word: "욕실", targetPhonemes: ["ㅇ, ㅂ, ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "욕실에서 씻어요." },
  { word: "현관", targetPhonemes: ["ㅎ, ㄴ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "현관에서 신발을 벗어요." },
  { word: "베란다", targetPhonemes: ["ㅂ, ㄹ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "베란다에 빨래를 널어요." },
  { word: "복도", targetPhonemes: ["ㅂ, ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "복도에서 뛰지 마세요." },
  { word: "계단", targetPhonemes: ["ㄱ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "계단을 올라가요." },
  { word: "엘리베이터", targetPhonemes: ["ㅇ, ㄹ, ㅂ, ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "엘리베이터를 탔어요." },
  { word: "놀이터", targetPhonemes: ["ㄴ, ㅇ, ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "놀이터에서 놀아요." },

  // 움직임 (Actions/Movements)
  { word: "뛰다", targetPhonemes: ["ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "빨리 뛰어요." },
  { word: "점프", targetPhonemes: ["ㅈ, ㅁ, ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "높이 점프했어요." },
  { word: "기다리다", targetPhonemes: ["ㄱ, ㄷ, ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "엄마를 기다려요." },
  { word: "어기다", targetPhonemes: ["ㅇ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "약속을 어겼어요." },
  { word: "미끄러지다", targetPhonemes: ["ㅁ, ㄱ, ㄹ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "미끄러져서 넘어졌어요." },
  { word: "밀다", targetPhonemes: ["ㅁ, ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "문을 밀어요." },
  { word: "당기다", targetPhonemes: ["ㄷ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "밧줄을 당겨요." },
  { word: "비틀다", targetPhonemes: ["ㅂ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "손수건을 비틀어요." },
  { word: "세우다", targetPhonemes: ["ㅅ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "블록을 세워요." },
  { word: "누르다", targetPhonemes: ["ㄴ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "버튼을 눌러요." },

  // 가족 (Family)
  { word: "할아버지", targetPhonemes: ["ㅎ, ㄹ, ㅂ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "할아버지를 찾아뵀어요." },
  { word: "할머니", targetPhonemes: ["ㅎ, ㅁ, ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "할머니가 밥을 해주세요." },
  { word: "엄마", targetPhonemes: ["ㅇ, ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "엄마, 사랑해요." },
  { word: "아빠", targetPhonemes: ["ㅇ, ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "아빠가 왔어요." },
  { word: "형", targetPhonemes: ["ㅎ, ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "형이랑 놀아요." },
  { word: "누나", targetPhonemes: ["ㄴ, ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "누나를 따라가요." },
  { word: "동생", targetPhonemes: ["ㄷ, ㅅ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "동생이 작아요." },
  { word: "친구", targetPhonemes: ["ㅊ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "친구랑 놀아요." },
  { word: "아주머니", targetPhonemes: ["ㅇ, ㅊ, ㅁ, ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "아주머니가 안녕하세요." },
  { word: "아저씨", targetPhonemes: ["ㅇ, ㅊ, ㅆ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "아저씨가 도와주세요." },

  // 악기 (Instruments)
  { word: "기타", targetPhonemes: ["ㄱ, ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "기타를 쳐요." },
  { word: "피아노", targetPhonemes: ["ㅍ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "피아노를 배워요." },
  { word: "드럼", targetPhonemes: ["ㄷ, ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "드럼을 두드려요." },
  { word: "바이올린", targetPhonemes: ["ㅂ, ㅇ, ㄹ, ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "바이올린이 예뻐요." },
  { word: "플루트", targetPhonemes: ["ㅍ, ㄹ, ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "플루트를 불어요." },
  { word: "트롬본", targetPhonemes: ["ㅌ, ㄹ, ㅁ, ㅂ, ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "트롬본은 길어요." },
  { word: "마라카스", targetPhonemes: ["ㅁ, ㄹ, ㄱ, ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마라카스로 음악을 만들어요." },
  { word: "실로폰", targetPhonemes: ["ㅅ, ㄹ, ㅍ, ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "실로폰을 치자!" },
  { word: "종", targetPhonemes: ["ㅊ, ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "종 소리가 나요." },
  { word: "탬버린", targetPhonemes: ["ㅌ, ㅁ, ㅂ, ㄹ, ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "탬버린을 흔들어요." },

  // 장난감 (Toys)
  { word: "인형", targetPhonemes: ["ㅇ, ㅎ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "인형을 꼭 안아줘요." },
  { word: "블록", targetPhonemes: ["ㅂ, ㄹ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "블록으로 만들었어요." },
  { word: "공", targetPhonemes: ["ㄱ, ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "공을 던져요." },
  { word: "자동차", targetPhonemes: ["ㅊ, ㄷ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "자동차 장난감이에요." },
  { word: "로봇", targetPhonemes: ["ㄹ, ㅂ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "로봇이 움직여요." },
  { word: "보드게임", targetPhonemes: ["ㅂ, ㄷ, ㄱ, ㅇ, ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "보드게임을 해요." },
  { word: "주사위", targetPhonemes: ["ㅊ, ㅅ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "주사위를 굴려요." },
  { word: "카드", targetPhonemes: ["ㄲ, ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "카드를 섞어요." },
  { word: "퍼즐", targetPhonemes: ["ㅍ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "퍼즐을 맞춰요." },
  { word: "연", targetPhonemes: ["ㅇ, ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "연을 날려요." },

  // 책/독서 (Reading/Books)
  { word: "책", targetPhonemes: ["ㅊ, ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "책을 읽어요." },
  { word: "동화", targetPhonemes: ["ㄷ, ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "동화는 재미있어요." },
  { word: "만화", targetPhonemes: ["ㅁ, ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "만화를 봐요." },
  { word: "글자", targetPhonemes: ["ㄱ, ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "글자를 배워요." },
  { word: "그림", targetPhonemes: ["ㄱ, ㄹ, ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "그림을 그려요." },
  { word: "색칠", targetPhonemes: ["ㅅ, ㄱ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "색칠해서 만들었어요." },
  { word: "이야기", targetPhonemes: ["ㅇ, ㅎ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "이야기를 들어요." },
  { word: "페이지", targetPhonemes: ["ㅍ, ㅇ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "페이지를 넘겨요." },
  { word: "표지", targetPhonemes: ["ㅍ, ㅇ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "표지가 예뻐요." },
  { word: "잉크", targetPhonemes: ["ㅇ, ㅇ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "잉크가 나와요." },

  // 음식 재료 (Food Ingredients)
  { word: "계란", targetPhonemes: ["ㄱ, ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "계란을 부쳤어요." },
  { word: "밀가루", targetPhonemes: ["ㅁ, ㄱ, ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "밀가루로 빵을 만들어요." },
  { word: "설탕", targetPhonemes: ["ㅅ, ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "설탕은 달아요." },
  { word: "소금", targetPhonemes: ["ㅅ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "소금을 넣어요." },
  { word: "간장", targetPhonemes: ["ㄱ, ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "간장을 조금 넣어요." },
  { word: "고추장", targetPhonemes: ["ㄱ, ㅊ, ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "고추장은 맵아요." },
  { word: "된장", targetPhonemes: ["ㄷ, ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "된장찌개는 맛있어요." },
  { word: "기름", targetPhonemes: ["ㄱ, ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "기름을 두르고 해요." },
  { word: "버터", targetPhonemes: ["ㅂ, ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "버터를 발라요." },
  { word: "치즈", targetPhonemes: ["ㅊ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "치즈를 먹어요." },

  // 계절 (Seasons)
  { word: "봄", targetPhonemes: ["ㅂ, ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "봄이 왔어요." },
  { word: "여름", targetPhonemes: ["ㅇ, ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "여름은 더워요." },
  { word: "가을", targetPhonemes: ["ㄱ, ㅇ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "가을이 되었어요." },
  { word: "겨울", targetPhonemes: ["ㄱ, ㅇ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "겨울은 추워요." },
  { word: "봄날", targetPhonemes: ["ㅂ, ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "봄날은 예뻐요." },
  { word: "여름방학", targetPhonemes: ["ㅇ, ㅁ, ㅂ, ㅎ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "여름방학에 수영장에 가요." },
  { word: "개학", targetPhonemes: ["ㄱ, ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "개학이 되었어요." },
  { word: "방학", targetPhonemes: ["ㅂ, ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "방학이 좋아요." },
  { word: "명절", targetPhonemes: ["ㅁ, ㅇ, ㅇ, ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "명절에 놀러 가요." },
  { word: "정월", targetPhonemes: ["ㅈ, ㅇ, ㅇ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "정월 대보름에 부럼을 깨요." },

  // 식사 시간 (Meals)
  { word: "아침", targetPhonemes: ["ㅇ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "아침밥을 먹어요." },
  { word: "점심", targetPhonemes: ["ㅈ, ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "점심을 먹을 시간이에요." },
  { word: "저녁", targetPhonemes: ["ㅈ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "저녁을 먹어요." },
  { word: "간식", targetPhonemes: ["ㄱ, ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "간식을 먹고 싶어요." },
  { word: "밥", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밥을 먹어요." },
  { word: "국", targetPhonemes: ["ㄱ, ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "국이 따뜻해요." },
  { word: "반찬", targetPhonemes: ["ㅂ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "반찬이 맛있어요." },
  { word: "국물", targetPhonemes: ["ㄱ, ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "국물이 맛있어요." },
  { word: "끼니", targetPhonemes: ["ㄲ, ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "끼니를 거르면 안 돼요." },
  { word: "식탁", targetPhonemes: ["ㅅ, ㅌ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "식탁에 앉았어요." },

  // 학용품 (School Supplies)
  { word: "연필", targetPhonemes: ["ㅇ, ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "연필로 글씨를 써요." },
  { word: "지우개", targetPhonemes: ["ㅇ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "지우개로 지워요." },
  { word: "색연필", targetPhonemes: ["ㅅ, ㄱ, ㅇ, ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "색연필로 그려요." },
  { word: "펜", targetPhonemes: ["ㅍ, ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "펜으로 써요." },
  { word: "자", targetPhonemes: ["ㅊ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "자로 재요." },
  { word: "풀", targetPhonemes: ["ㅍ, ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "풀을 바르는 거예요." },
  { word: "깍지", targetPhonemes: ["ㄲ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "두 손을 깍지 끼어요." },
  { word: "스템프", targetPhonemes: ["ㅆ, ㅌ, ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "스템프를 찍어요." },
  { word: "테이프", targetPhonemes: ["ㅌ, ㅇ, ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "테이프로 붙여요." },
  { word: "가위", targetPhonemes: ["ㄱ, ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "가위로 잘라요." },

  // 가정용품 (Household Items)
  { word: "베개", targetPhonemes: ["ㅂ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "베개가 부드러워요." },
  { word: "담요", targetPhonemes: ["ㄷ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "담요로 덮었어요." },
  { word: "매트리스", targetPhonemes: ["ㅁ, ㅌ, ㄹ, ㅆ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "매트리스가 편해요." },
  { word: "거울", targetPhonemes: ["ㄱ, ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "거울에 내 얼굴이 비쳐요." },
  { word: "빗", targetPhonemes: ["ㅂ, ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빗으로 머리를 빗어요." },
  { word: "타올", targetPhonemes: ["ㅌ, ㅇ, ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "타올로 닦아요." },
  { word: "휴지", targetPhonemes: ["ㅎ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "휴지를 가져와요." },
  { word: "쓰레기통", targetPhonemes: ["ㅆ, ㄹ, ㄱ, ㅌ, ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "쓰레기통에 버려요." },
  { word: "청소기", targetPhonemes: ["ㅊ, ㅇ, ㅇ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "청소기를 돌려요." },
  { word: "걸레", targetPhonemes: ["ㄱ, ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "걸레로 닦아요." },

  // 인사/표현 (Greetings/Expressions)
  { word: "안녕하세요", targetPhonemes: ["ㅇ, ㄴ, ㄹ, ㅎ, ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "안녕하세요." },
  { word: "안녕", targetPhonemes: ["ㅇ, ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "친구에게 안녕 인사해요." },
  { word: "고마워", targetPhonemes: ["ㄱ, ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고마워요." },
  { word: "미안해", targetPhonemes: ["ㅁ, ㅇ, ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "미안해요." },
  { word: "괜찮아", targetPhonemes: ["ㄲ, ㅎ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "괜찮아요." },
  { word: "좋아", targetPhonemes: ["ㅊ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "이 과자 정말 좋아요!" },
  { word: "싫어", targetPhonemes: ["ㅅ, ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "이건 싫어요." },
  { word: "네", targetPhonemes: ["ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "네, 알겠어요." },
  { word: "아니오", targetPhonemes: ["ㅇ, ㄴ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "아니오, 먹고 싶지 않아요." },
  { word: "축하해", targetPhonemes: ["ㅊ, ㅎ, ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "생일 축하해!" },

  // 시간 표현 (Time Expressions)
  { word: "아침", targetPhonemes: ["ㅇ, ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "아침이에요." },
  { word: "낮", targetPhonemes: ["ㄴ, ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "낮이 밝아요." },
  { word: "저녁", targetPhonemes: ["ㅊ, ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "저녁이 되었어요." },
  { word: "밤", targetPhonemes: ["ㅂ, ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밤이 어두워요." },
  { word: "시간", targetPhonemes: ["ㅅ, ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "시간이 많아요." },
  { word: "분", targetPhonemes: ["ㅂ, ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "5분만 기다려요." },
  { word: "초", targetPhonemes: ["ㅊ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "10초를 세어요." },
  { word: "어제", targetPhonemes: ["ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "어제는 놀았어요." },
  { word: "오늘", targetPhonemes: ["ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "오늘은 신날 것 같아요." },
  { word: "내일", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "내일도 놀아요." },

  // 위치/방향 (Location/Direction)
  { word: "위", targetPhonemes: [], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "위에 있어요." },
  { word: "아래", targetPhonemes: ["ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "아래를 봐요." },
  { word: "앞", targetPhonemes: ["ㅍ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "앞으로 가요." },
  { word: "뒤", targetPhonemes: ["ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "뒤로 와요." },
  { word: "옆", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "옆에 앉아요." },
  { word: "안", targetPhonemes: ["ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "안에 있어요." },
  { word: "밖", targetPhonemes: ["ㅂ", "ㄲ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "밖으로 나가요." },
  { word: "오른쪽", targetPhonemes: ["ㄹ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "오른쪽을 봐요." },
  { word: "왼쪽", targetPhonemes: ["ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "왼쪽으로 가요." },
  { word: "중간", targetPhonemes: ["ㅈ", "ㄱ", "ㅇ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "중간에 있어요." },

  // 물건/소유 (Objects/Possession)
  { word: "내 것", targetPhonemes: ["ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "이건 내 것이에요." },
  { word: "너 것", targetPhonemes: ["ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "저건 너 것이에요." },
  { word: "물건", targetPhonemes: ["ㅁ", "ㄱ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "물건을 정리했어요." },
  { word: "가방", targetPhonemes: ["ㄱ", "ㅂ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "가방에 넣어요." },
  { word: "상자", targetPhonemes: ["ㅅ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "상자 안에 있어요." },
  { word: "도구", targetPhonemes: ["ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도구로 만들어요." },
  { word: "물", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "물을 마셔요." },
  { word: "먼지", targetPhonemes: ["ㅁ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "먼지가 날아요." },
  { word: "모래", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "모래로 놀아요." },
  { word: "흙", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "흙을 파요." },

  // 상황/이벤트 (Situations/Events)
  { word: "생일", targetPhonemes: ["ㅅ", "ㅇ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "생일은 언제예요?" },
  { word: "파티", targetPhonemes: ["ㅍ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "파티를 했어요." },
  { word: "선물", targetPhonemes: ["ㅅ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "선물을 받았어요." },
  { word: "초대", targetPhonemes: ["ㅊ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초대장을 받았어요." },
  { word: "축제", targetPhonemes: ["ㅊ", "ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "축제에서 놀아요." },
  { word: "졸업", targetPhonemes: ["ㅈ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "졸업식이 있어요." },
  { word: "운동회", targetPhonemes: ["ㄷ", "ㄴ", "ㅎ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "운동회가 재미있어요." },
  { word: "발표", targetPhonemes: ["ㅂ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "발표를 했어요." },
  { word: "경쟁", targetPhonemes: ["ㄱ", "ㅈ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "경쟁에서 이겼어요." },
  { word: "게임", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "게임을 할래?" },

  // ── 경음 ㄲ (velar tense) ─────────────────────────────────────────────────
  { word: "꽃", targetPhonemes: ["ㄲ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "꽃이 예뻐요." },
  { word: "꿈", targetPhonemes: ["ㄲ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "꿈을 꿔요." },
  { word: "꼬리", targetPhonemes: ["ㄲ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "강아지 꼬리가 흔들려요." },
  { word: "껌", targetPhonemes: ["ㄲ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "껌을 씹어요." },
  { word: "꼭", targetPhonemes: ["ㄲ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "꼭 안아줘요." },
  { word: "꿀", targetPhonemes: ["ㄲ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "꿀이 달아요.", soundEffect: "달콤" },
  { word: "꿀벌", targetPhonemes: ["ㄲ", "ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "꿀벌이 날아요.", soundEffect: "윙윙" },
  { word: "끈", targetPhonemes: ["ㄲ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "끈으로 묶어요." },
  { word: "꼬마", targetPhonemes: ["ㄲ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "꼬마가 놀아요." },
  { word: "꼬치", targetPhonemes: ["ㄲ", "ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "꼬치를 먹어요." },
  { word: "꽈배기", targetPhonemes: ["ㄲ", "ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "꽈배기가 맛있어요." },
  { word: "꿩", targetPhonemes: ["ㄲ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "꿩이 울어요.", soundEffect: "꽁꽁" },

  // ── 경음 ㄸ (alveolar tense stop) ────────────────────────────────────────
  { word: "딸기", targetPhonemes: ["ㄸ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "딸기가 빨개요." },
  { word: "떡", targetPhonemes: ["ㄸ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "떡을 먹어요." },
  { word: "똥", targetPhonemes: ["ㄸ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "똥을 쌌어요." },
  { word: "뚜껑", targetPhonemes: ["ㄸ", "ㄲ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "뚜껑을 열어요." },
  { word: "딱따구리", targetPhonemes: ["ㄸ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "딱따구리가 나무를 쪼아요.", soundEffect: "딱딱" },
  { word: "딱지", targetPhonemes: ["ㄸ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "딱지를 쳐요.", soundEffect: "딱" },
  { word: "따뜻해", targetPhonemes: ["ㄸ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "따뜻해요." },
  { word: "뚜벅뚜벅", targetPhonemes: ["ㄸ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뚜벅뚜벅 걸어요.", soundEffect: "뚜벅뚜벅" },
  { word: "땅콩", targetPhonemes: ["ㄸ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "땅콩을 먹어요." },
  { word: "딸꾹질", targetPhonemes: ["ㄸ", "ㄲ", "ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "딸꾹질이 나요.", soundEffect: "딸꾹" },
  { word: "뚝", targetPhonemes: ["ㄸ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "뚝 그쳐요.", soundEffect: "뚝" },

  // ── 경음 ㅃ (bilabial tense stop) ─────────────────────────────────────────
  { word: "빵", targetPhonemes: ["ㅃ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "빵을 먹어요." },
  { word: "뽀로로", targetPhonemes: ["ㅃ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "뽀로로를 봐요." },
  { word: "뻐꾸기", targetPhonemes: ["ㅃ", "ㄲ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뻐꾸기가 울어요.", soundEffect: "뻐꾹뻐꾹" },
  { word: "빼기", targetPhonemes: ["ㅃ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빼기를 해요." },
  { word: "뿌리", targetPhonemes: ["ㅃ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "나무 뿌리예요." },
  { word: "빨리", targetPhonemes: ["ㅃ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빨리 달려요." },
  { word: "빵집", targetPhonemes: ["ㅃ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빵집에 가요." },
  { word: "뽑기", targetPhonemes: ["ㅃ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "뽑기를 해요." },
  { word: "뻥튀기", targetPhonemes: ["ㅃ", "ㅌ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뻥튀기를 먹어요.", soundEffect: "뻥" },
  { word: "빵빵", targetPhonemes: ["ㅃ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "차가 빵빵 울려요.", soundEffect: "빵빵" },

  // ── 경음 ㅆ (alveolar tense fricative) ───────────────────────────────────
  { word: "쌀", targetPhonemes: ["ㅆ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "쌀로 밥을 지어요." },
  { word: "씨앗", targetPhonemes: ["ㅆ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "씨앗을 심어요." },
  { word: "쓰레기", targetPhonemes: ["ㅆ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "쓰레기를 버려요." },
  { word: "씻어", targetPhonemes: ["ㅆ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "손을 씻어요." },
  { word: "쌓다", targetPhonemes: ["ㅆ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "블록을 쌓아요." },
  { word: "씩씩해", targetPhonemes: ["ㅆ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "씩씩해요." },
  { word: "쏙쏙", targetPhonemes: ["ㅆ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "쏙쏙 들어가요.", soundEffect: "쏙쏙" },
  { word: "썰매", targetPhonemes: ["ㅆ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "썰매를 타요." },
  { word: "쑥쑥", targetPhonemes: ["ㅆ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "키가 쑥쑥 자라요.", soundEffect: "쑥쑥" },
  { word: "쓰다듬어", targetPhonemes: ["ㅆ", "ㄷ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "머리를 쓰다듬어요." },

  // ── 경음 ㅉ (palato-alveolar tense affricate) ─────────────────────────────
  { word: "짜다", targetPhonemes: ["ㅉ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "음식이 짜요." },
  { word: "찌개", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "찌개가 뜨거워요." },
  { word: "쪼개", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "사과를 쪼개요." },
  { word: "찐빵", targetPhonemes: ["ㅉ", "ㄴ", "ㅃ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "찐빵을 먹어요." },
  { word: "짱구", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "짱구를 봐요." },
  { word: "쫄깃", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "떡이 쫄깃해요.", soundEffect: "쫄깃" },
  { word: "쪽", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "쪽 뽀뽀해요.", soundEffect: "쪽" },
  { word: "쫑긋", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "귀를 쫑긋 세워요.", soundEffect: "쫑긋" },

  // ── ㄹ 심화 ───────────────────────────────────────────────────────────────
  { word: "라면", targetPhonemes: ["ㄹ", "ㅁ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "라면을 끓여요." },
  { word: "리본", targetPhonemes: ["ㄹ", "ㅂ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "리본을 달았어요." },
  { word: "로봇", targetPhonemes: ["ㄹ", "ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "로봇이 걸어요." },
  { word: "레몬", targetPhonemes: ["ㄹ", "ㅁ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "레몬이 시어요." },
  { word: "리코더", targetPhonemes: ["ㄹ", "ㄱ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "리코더를 불어요." },
  { word: "롤케이크", targetPhonemes: ["ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "롤케이크를 먹어요." },
  { word: "라디오", targetPhonemes: ["ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "라디오를 들어요." },
  { word: "리듬", targetPhonemes: ["ㄹ", "ㄷ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "리듬을 맞춰요." },
  { word: "레고", targetPhonemes: ["ㄹ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "레고를 조립해요." },
  { word: "롤러스케이트", targetPhonemes: ["ㄹ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "롤러스케이트를 타요." },
  { word: "루돌프", targetPhonemes: ["ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "루돌프가 날아요." },

  // ── ㅅ 심화 ───────────────────────────────────────────────────────────────
  { word: "소풍", targetPhonemes: ["ㅅ", "ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "소풍을 가요." },
  { word: "선생님", targetPhonemes: ["ㅅ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "선생님이 가르쳐요." },
  { word: "쇼핑", targetPhonemes: ["ㅅ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "쇼핑을 해요." },
  { word: "세수", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "세수를 해요." },
  { word: "수달", targetPhonemes: ["ㅅ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수달이 헤엄쳐요." },
  { word: "소시지", targetPhonemes: ["ㅅ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "소시지를 구워요." },
  { word: "설탕", targetPhonemes: ["ㅅ", "ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "설탕이 달아요." },
  { word: "슬라임", targetPhonemes: ["ㅅ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "슬라임을 만져요." },
  { word: "수영장", targetPhonemes: ["ㅅ", "ㅇ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수영장에서 수영해요." },
  { word: "서랍", targetPhonemes: ["ㅅ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "서랍을 열어요." },
  { word: "손수건", targetPhonemes: ["ㅅ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "손수건으로 닦아요." },

  // ── ㅈ 심화 ───────────────────────────────────────────────────────────────
  { word: "주스", targetPhonemes: ["ㅈ", "ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "주스를 마셔요." },
  { word: "지구", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "지구가 둥글어요." },
  { word: "자전거", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "자전거를 타요." },
  { word: "지우개", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "지우개로 지워요." },
  { word: "젤리", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "젤리를 먹어요." },
  { word: "줄넘기", targetPhonemes: ["ㅈ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "줄넘기를 해요." },
  { word: "장난감", targetPhonemes: ["ㅈ", "ㄴ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "장난감을 가지고 놀아요." },
  { word: "지렁이", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "지렁이가 기어요." },
  { word: "저금통", targetPhonemes: ["ㅈ", "ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "저금통에 넣어요." },
  { word: "졸음", targetPhonemes: ["ㅈ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "졸음이 와요." },

  // ── ㅊ 심화 ───────────────────────────────────────────────────────────────
  { word: "참새", targetPhonemes: ["ㅊ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "참새가 짹짹해요.", soundEffect: "짹짹" },
  { word: "청소", targetPhonemes: ["ㅊ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "청소를 해요." },
  { word: "치약", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "치약으로 닦아요." },
  { word: "초코", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "초코가 달아요." },
  { word: "창문", targetPhonemes: ["ㅊ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "창문을 열어요." },
  { word: "채소", targetPhonemes: ["ㅊ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "채소를 먹어요." },
  { word: "철봉", targetPhonemes: ["ㅊ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "철봉을 잡아요." },
  { word: "추석", targetPhonemes: ["ㅊ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "추석에 송편을 먹어요." },
  { word: "초록색", targetPhonemes: ["ㅊ", "ㄹ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초록색이에요." },
  { word: "침대", targetPhonemes: ["ㅊ", "ㅁ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "침대에서 자요." },

  // ── ㄱ 심화 ───────────────────────────────────────────────────────────────
  { word: "거울", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거울을 봐요." },
  { word: "고구마", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "고구마가 달아요." },
  { word: "그네", targetPhonemes: ["ㄱ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "그네를 타요." },
  { word: "고슴도치", targetPhonemes: ["ㄱ", "ㅅ", "ㄷ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고슴도치가 뾰족해요." },
  { word: "곤충", targetPhonemes: ["ㄱ", "ㄴ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "곤충을 잡아요." },
  { word: "금붕어", targetPhonemes: ["ㄱ", "ㅁ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "금붕어가 헤엄쳐요." },
  { word: "기차역", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "기차역에 가요." },
  { word: "국수", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "국수를 먹어요." },
  { word: "가위", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "가위로 잘라요." },
  { word: "강낭콩", targetPhonemes: ["ㄱ", "ㄴ", "ㅋ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "강낭콩을 심어요." },

  // ── ㄴ 심화 ───────────────────────────────────────────────────────────────
  { word: "냄비", targetPhonemes: ["ㄴ", "ㅁ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "냄비가 끓어요." },
  { word: "놀이터", targetPhonemes: ["ㄴ", "ㄹ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "놀이터에서 놀아요." },
  { word: "눈사람", targetPhonemes: ["ㄴ", "ㅅ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "눈사람을 만들어요." },
  { word: "낙타", targetPhonemes: ["ㄴ", "ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "낙타가 걸어요." },
  { word: "냉장고", targetPhonemes: ["ㄴ", "ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "냉장고를 열어요." },
  { word: "나뭇잎", targetPhonemes: ["ㄴ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "나뭇잎이 떨어져요." },
  { word: "노루", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "노루가 뛰어요." },
  { word: "나팔", targetPhonemes: ["ㄴ", "ㅍ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "나팔을 불어요.", soundEffect: "빠바밤" },

  // ── ㄷ 심화 ───────────────────────────────────────────────────────────────
  { word: "달팽이", targetPhonemes: ["ㄷ", "ㄹ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "달팽이가 기어요." },
  { word: "두더지", targetPhonemes: ["ㄷ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "두더지가 땅을 파요." },
  { word: "대나무", targetPhonemes: ["ㄷ", "ㄴ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "대나무가 높아요." },
  { word: "도마뱀", targetPhonemes: ["ㄷ", "ㅁ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도마뱀이 기어요." },
  { word: "달력", targetPhonemes: ["ㄷ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "달력을 봐요." },
  { word: "도시락", targetPhonemes: ["ㄷ", "ㅅ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도시락을 먹어요." },
  { word: "동화책", targetPhonemes: ["ㄷ", "ㅎ", "ㅊ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "동화책을 읽어요." },
  { word: "도너츠", targetPhonemes: ["ㄷ", "ㄴ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도너츠를 먹어요." },

  // ── ㅂ 심화 ───────────────────────────────────────────────────────────────
  { word: "버터", targetPhonemes: ["ㅂ", "ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "버터를 발라요." },
  { word: "비행기", targetPhonemes: ["ㅂ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "비행기가 날아요." },
  { word: "번데기", targetPhonemes: ["ㅂ", "ㄴ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "번데기가 나비가 돼요." },
  { word: "보물섬", targetPhonemes: ["ㅂ", "ㅁ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "보물섬을 찾아요." },
  { word: "봄바람", targetPhonemes: ["ㅂ", "ㅁ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "봄바람이 불어요." },
  { word: "벌레", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "벌레가 기어요." },
  { word: "볶음밥", targetPhonemes: ["ㅂ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "볶음밥을 먹어요." },
  { word: "보라색", targetPhonemes: ["ㅂ", "ㄹ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "보라색이에요." },

  // ── ㅁ 심화 ───────────────────────────────────────────────────────────────
  { word: "마트", targetPhonemes: ["ㅁ", "ㅌ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "마트에 가요." },
  { word: "모기", targetPhonemes: ["ㅁ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "모기가 물어요.", soundEffect: "윙윙" },
  { word: "무지개", targetPhonemes: ["ㅁ", "ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "무지개가 떠요." },
  { word: "미끄럼틀", targetPhonemes: ["ㅁ", "ㄲ", "ㄹ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "미끄럼틀을 타요." },
  { word: "망원경", targetPhonemes: ["ㅁ", "ㅇ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "망원경으로 봐요." },
  { word: "미로", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "미로를 통과해요." },
  { word: "마카롱", targetPhonemes: ["ㅁ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마카롱이 맛있어요." },

  // ── ㅎ 심화 ───────────────────────────────────────────────────────────────
  { word: "하마", targetPhonemes: ["ㅎ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하마가 커요." },
  { word: "호박", targetPhonemes: ["ㅎ", "ㅂ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "호박이 동그래요." },
  { word: "해바라기", targetPhonemes: ["ㅎ", "ㅂ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "해바라기가 피었어요." },
  { word: "헬리콥터", targetPhonemes: ["ㅎ", "ㄹ", "ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "헬리콥터가 날아요.", soundEffect: "두두두" },
  { word: "호두", targetPhonemes: ["ㅎ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "호두를 까요." },
  { word: "향기", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "꽃 향기가 나요." },
  { word: "호루라기", targetPhonemes: ["ㅎ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "호루라기를 불어요.", soundEffect: "삐삐" },
  { word: "혀", targetPhonemes: ["ㅎ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "혀를 내밀어요." },

  // ── ㅍ 심화 ───────────────────────────────────────────────────────────────
  { word: "파도", targetPhonemes: ["ㅍ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "파도가 쳐요." },
  { word: "펭귄", targetPhonemes: ["ㅍ", "ㄱ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "펭귄이 뒤뚱뒤뚱 걸어요." },
  { word: "포크", targetPhonemes: ["ㅍ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "포크로 찍어요." },
  { word: "피아노", targetPhonemes: ["ㅍ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "피아노를 쳐요." },
  { word: "팽이", targetPhonemes: ["ㅍ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "팽이를 돌려요.", soundEffect: "윙윙" },
  { word: "표범", targetPhonemes: ["ㅍ", "ㅂ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "표범이 빨라요." },
  { word: "풍선껌", targetPhonemes: ["ㅍ", "ㄱ", "ㄲ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "풍선껌을 불어요." },

  // ── ㅌ 심화 ───────────────────────────────────────────────────────────────
  { word: "타조", targetPhonemes: ["ㅌ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "타조가 달려요." },
  { word: "태권도", targetPhonemes: ["ㅌ", "ㄱ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "태권도를 배워요." },
  { word: "탱크", targetPhonemes: ["ㅌ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "탱크가 굴러가요." },
  { word: "터널", targetPhonemes: ["ㅌ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "터널을 통과해요." },
  { word: "토마토", targetPhonemes: ["ㅌ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "토마토가 빨개요." },
  { word: "트럭", targetPhonemes: ["ㅌ", "ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "트럭이 달려요." },
  { word: "트램폴린", targetPhonemes: ["ㅌ", "ㄹ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "트램폴린에서 뛰어요." },

  // ── 의성어·의태어 ─────────────────────────────────────────────────────────
  { word: "쿵쿵", targetPhonemes: ["ㄲ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "쿵쿵 소리가 나요.", soundEffect: "쿵쿵" },
  { word: "찰싹", targetPhonemes: ["ㅊ", "ㄹ", "ㅅ", "ㄲ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "찰싹 때려요.", soundEffect: "찰싹" },
  { word: "사각사각", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "사각사각 소리 나요.", soundEffect: "사각사각" },
  { word: "데굴데굴", targetPhonemes: ["ㄷ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "데굴데굴 굴러요.", soundEffect: "데굴데굴" },
  { word: "졸졸", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "물이 졸졸 흘러요.", soundEffect: "졸졸" },
  { word: "깔깔", targetPhonemes: ["ㄲ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "깔깔 웃어요.", soundEffect: "깔깔" },
  { word: "빙글빙글", targetPhonemes: ["ㅂ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "빙글빙글 돌아요.", soundEffect: "빙글빙글" },
  { word: "폴짝폴짝", targetPhonemes: ["ㅍ", "ㄹ", "ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "폴짝폴짝 뛰어요.", soundEffect: "폴짝폴짝" },
  { word: "살금살금", targetPhonemes: ["ㅅ", "ㄹ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "살금살금 걸어요.", soundEffect: "살금살금" },
  { word: "부글부글", targetPhonemes: ["ㅂ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "부글부글 끓어요.", soundEffect: "부글부글" },

  // ── 학교·유치원 생활 ──────────────────────────────────────────────────────
  { word: "연필", targetPhonemes: ["ㄴ", "ㅍ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "연필로 써요." },
  { word: "색연필", targetPhonemes: ["ㅅ", "ㄱ", "ㄴ", "ㅍ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "색연필로 칠해요." },
  { word: "도화지", targetPhonemes: ["ㄷ", "ㅎ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도화지에 그려요." },
  { word: "물감", targetPhonemes: ["ㅁ", "ㄹ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "물감으로 그려요." },
  { word: "붓", targetPhonemes: ["ㅂ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "붓으로 칠해요." },
  { word: "찰흙", targetPhonemes: ["ㅊ", "ㄹ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "찰흙으로 만들어요." },
  { word: "스케치북", targetPhonemes: ["ㅅ", "ㄱ", "ㅊ", "ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "스케치북에 그려요." },
  { word: "책가방", targetPhonemes: ["ㅊ", "ㄱ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "책가방을 싸요." },
  { word: "알림장", targetPhonemes: ["ㄹ", "ㄴ", "ㅁ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "알림장을 써요." },

  // ── 날씨·자연 심화 ────────────────────────────────────────────────────────
  { word: "소나기", targetPhonemes: ["ㅅ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "소나기가 와요." },
  { word: "천둥", targetPhonemes: ["ㅊ", "ㄴ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "천둥 번개가 쳐요.", soundEffect: "쾅쾅" },
  { word: "번개", targetPhonemes: ["ㅂ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "번개가 번쩍여요." },
  { word: "안개", targetPhonemes: ["ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "안개가 끼었어요." },
  { word: "솔방울", targetPhonemes: ["ㅅ", "ㄹ", "ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "솔방울을 주웠어요." },
  { word: "도토리", targetPhonemes: ["ㄷ", "ㅌ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도토리를 주웠어요." },
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
