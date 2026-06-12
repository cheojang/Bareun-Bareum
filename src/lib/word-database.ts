import { WORD_IMAGE_SLUGS } from "./word-images";
import { decomposeWord, normalizeJongseong } from "./jamo-analysis";

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
  { id: "mp-jada-jjada",    word1: "자다", word2: "짜다", targetPhoneme: "ㅈ", contrastPhoneme: "ㅉ", label: "ㅈ vs ㅉ 구별" },
  { id: "mp-chal-sal",      word1: "찰", word2: "살", targetPhoneme: "ㅊ", contrastPhoneme: "ㅅ", label: "ㅊ vs ㅅ 구별" },
  { id: "mp-pal-mal",       word1: "팔", word2: "말", targetPhoneme: "ㅍ", contrastPhoneme: "ㅁ", label: "ㅍ vs ㅁ 구별" },
  { id: "mp-nun-mun",       word1: "눈", word2: "문", targetPhoneme: "ㄴ", contrastPhoneme: "ㅁ", label: "ㄴ vs ㅁ 구별" },
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
  { word: "라면", targetPhonemes: ["ㄹ", "ㅁ", "ㄴ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "엄마가 라면을 끓여요.",      soundEffect: "후루룩~" },
  { word: "리본", targetPhonemes: ["ㄹ", "ㅂ", "ㄴ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "머리에 리본을 달았어요." },
  { word: "로봇", targetPhonemes: ["ㄹ", "ㅂ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "로봇이 춤을 춰요.",          soundEffect: "삐빅!" },
  { word: "루돌프", targetPhonemes: ["ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "루돌프 코는 빨개요." },
  { word: "레몬", targetPhonemes: ["ㄹ", "ㅁ", "ㄴ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "레몬은 새콤해요.",           soundEffect: "새콤~" },
  { word: "리모컨", targetPhonemes: ["ㄹ", "ㅁ", "ㅋ", "ㄴ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "리모컨으로 TV를 켜요." },
  { word: "라디오", targetPhonemes: ["ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "라디오에서 노래가 나와요." },
  { word: "레고", targetPhonemes: ["ㄹ", "ㄱ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "레고로 집을 만들어요.",      soundEffect: "딸깍딸깍~" },
  { word: "라켓", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "라켓으로 공을 쳐요." },
  { word: "로켓", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "5-6세", sampleSentence: "로켓이 하늘로 날아가요.",   soundEffect: "슝~" },
  { word: "노래", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "신나는 노래를 불러요.",     soundEffect: "라라라~" },
  { word: "모래", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "모래로 성을 만들어요.",     soundEffect: "사르르~" },
  { word: "바람", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "바람이 쌩쌩 불어요.",       soundEffect: "쌩쌩~" },
  { word: "사랑", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "엄마 사랑해요." },
  { word: "다람쥐", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "다람쥐가 도토리를 먹어요.", soundEffect: "냠냠~" },
  { word: "달리기", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "운동장에서 달리기를 해요.", soundEffect: "후다닥!" },
  { word: "별", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "밤하늘에 별이 빛나요.",     soundEffect: "반짝반짝~" },
  { word: "달", targetPhonemes: ["ㄹ", "ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "밤에 달이 떠요." },
  { word: "물", targetPhonemes: ["ㄹ", "ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "물을 마셔요.",              soundEffect: "꿀꺽~" },
  { word: "말", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "말이 달려가요.",            soundEffect: "히히힝~" },
  { word: "하늘", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "파란 하늘을 봐요." },
  { word: "물고기", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "물고기가 헤엄쳐요.",        soundEffect: "첨벙~" },
  { word: "얼음", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "얼음이 차가워요." },
  { word: "날개", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "새가 날개를 펼쳐요.",       soundEffect: "팔랑팔랑~" },
  { word: "달팽이", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "달팽이가 천천히 기어요.",   soundEffect: "느릿느릿~" },
  { word: "빨대", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빨대로 주스를 마셔요.",     soundEffect: "쭈르르~" },
  { word: "여름", targetPhonemes: ["ㄹ", "ㅁ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "여름에 수영해요.",          soundEffect: "첨벙~" },
  { word: "겨울", targetPhonemes: ["ㄹ", "ㄱ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "겨울에 눈이 와요.",         soundEffect: "펄펄~" },
  { word: "가을", targetPhonemes: ["ㄹ", "ㄱ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "가을에 단풍이 들어요.",     soundEffect: "바스락~" },
  { word: "팔", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "팔을 흔들어요." },
  { word: "발", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "발로 뛰어요.",              soundEffect: "쿵쿵~" },
  { word: "불", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "불이 뜨거워요.",            soundEffect: "활활~" },
  { word: "길", targetPhonemes: ["ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "길을 걸어요." },
  { word: "구름", targetPhonemes: ["ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "하늘에 구름이 떠요.",       soundEffect: "둥실둥실~" },
  { word: "이름", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "내 이름은 뭐예요?" },
  { word: "열매", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나무에 열매가 달렸어요." },
  { word: "알람", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "알람이 울려요.",            soundEffect: "따르릉~" },
  { word: "공룡", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "공룡이 크고 무서워요.",     soundEffect: "우르릉~" },
  { word: "풍선", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "풍선이 하늘로 날아가요.",   soundEffect: "펑!" },
  { word: "돌고래", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "돌고래가 헤엄쳐요.",        soundEffect: "첨벙~" },
  { word: "올챙이", targetPhonemes: ["ㄹ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "올챙이가 개구리가 돼요." },
  { word: "파란색", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "하늘은 파란색이에요." },
  { word: "노란색", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "바나나는 노란색이에요." },
  { word: "초록색", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "잎사귀는 초록색이에요." },
  { word: "빨간색", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "딸기는 빨간색이에요." },
  { word: "수레", targetPhonemes: ["ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수레에 짐을 실어요." },
  { word: "하루", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "오늘 하루도 즐거워요." },
  { word: "마을", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "우리 마을은 예뻐요." },
  { word: "호루라기", targetPhonemes: ["ㄹ", "ㅎ", "ㄱ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "호루라기를 불어요.",         soundEffect: "삐~" },

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
  { word: "사탕", targetPhonemes: ["ㅅ", "ㅌ", "ㅇ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "사탕이 달콤해요.",          soundEffect: "냠냠~" },
  { word: "소파", targetPhonemes: ["ㅅ", "ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "소파에 앉아요." },
  { word: "사슴", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사슴이 뛰어요." },
  { word: "사진", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사진을 찍어요.",            soundEffect: "찰칵~" },
  { word: "시장", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "시장에서 과일을 사요." },
  { word: "소리", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "소리를 잘 들어요." },
  { word: "신발", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "신발을 신어요." },
  { word: "선물", targetPhonemes: ["ㅅ", "ㄴ", "ㄹ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "선물을 받았어요.",          soundEffect: "와~" },
  { word: "숟가락", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "숟가락으로 밥을 먹어요." },
  { word: "솜사탕", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "솜사탕이 달콤해요.",        soundEffect: "사르르~" },
  { word: "소풍", targetPhonemes: ["ㅅ", "ㅍ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "소풍 가서 도시락 먹어요." },
  { word: "식빵", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "식빵을 먹어요." },
  { word: "상어", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "상어가 헤엄쳐요.",          soundEffect: "으~ 무서워!" },
  { word: "시계", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "시계가 똑딱거려요.",         soundEffect: "똑딱똑딱~" },
  { word: "소금", targetPhonemes: ["ㅅ", "ㄱ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "소금은 짜요." },
  { word: "수영", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "수영장에서 수영해요.",       soundEffect: "첨벙첨벙~" },
  { word: "수건", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "수건으로 닦아요." },
  { word: "색연필", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "색연필로 그림을 그려요." },
  { word: "선생님", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "선생님께 인사해요." },
  { word: "수달", targetPhonemes: ["ㅅ", "ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "수달이 강에서 헤엄쳐요." },
  { word: "사다리", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사다리를 올라가요." },
  { word: "수족관", targetPhonemes: ["ㅅ", "ㅈ", "ㄱ", "ㄴ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "수족관에 물고기가 많아요." },
  { word: "스티커", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "스티커를 붙여요." },

  // ══════════════════════════════════════════════════════════
  // ㅈ — 치조구개 파찰음 (4-5세)
  // ══════════════════════════════════════════════════════════
  { word: "자동차", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "자동차가 빵빵거려요.",     soundEffect: "부릉부릉!" },
  { word: "잠자리", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "잠자리가 날아가요.",        soundEffect: "윙윙~" },
  { word: "지구", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "지구는 둥글어요." },
  { word: "주스", targetPhonemes: ["ㅈ", "ㅅ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "주스가 달콤해요.",          soundEffect: "꿀꺽~" },
  { word: "자전거", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "자전거를 타요.",            soundEffect: "씽씽~" },
  { word: "지우개", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "지우개로 지워요." },
  { word: "장난감", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "장난감으로 놀아요." },
  { word: "조개", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "조개를 주웠어요.",          soundEffect: "파도 소리~" },
  { word: "젓가락", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "젓가락으로 반찬을 집어요." },
  { word: "자석", targetPhonemes: ["ㅈ", "ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "자석이 철을 끌어당겨요." },
  { word: "지렁이", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "지렁이가 땅속에 있어요." },
  { word: "집", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "우리 집이 예뻐요." },
  { word: "젤리", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "젤리가 쫄깃해요.",          soundEffect: "쫄깃쫄깃~" },
  { word: "장갑", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "장갑을 끼어요." },
  { word: "전화기", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "전화기로 통화해요.",        soundEffect: "따르릉~" },
  { word: "지하철", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "지하철을 타요." },
  { word: "저금통", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "저금통에 동전을 넣어요.",   soundEffect: "짤랑~" },
  { word: "자장가", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "자장가를 들으며 자요.",     soundEffect: "자장자장~" },
  { word: "지팡이", targetPhonemes: ["ㅈ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "지팡이를 짚어요." },
  { word: "재미", targetPhonemes: ["ㅈ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "놀이가 재미있어요." },
  { word: "재채기", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "재채기가 나요.",            soundEffect: "에취!" },
  { word: "조각", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "퍼즐 조각을 맞춰요.",      soundEffect: "딸깍!" },
  { word: "지갑", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "지갑에 돈이 있어요." },
  { word: "주머니", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "주머니에 손을 넣어요." },
  { word: "진달래", targetPhonemes: ["ㅈ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "봄에 진달래가 피어요." },

  // ══════════════════════════════════════════════════════════
  // ㅊ — 치조구개 파찰음 격음 (4-5세)
  // ══════════════════════════════════════════════════════════
  { word: "차", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "차를 타고 가요.",           soundEffect: "부릉!" },
  { word: "채소", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "채소를 먹으면 건강해요.",   soundEffect: "아삭아삭~" },
  { word: "치킨", targetPhonemes: ["ㅊ", "ㅋ", "ㄴ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "치킨이 맛있어요.",          soundEffect: "냠냠~" },
  { word: "초콜릿", targetPhonemes: ["ㅊ", "ㄹ", "ㅋ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초콜릿은 달콤해요.", soundEffect: "스르르~" },
  { word: "축구", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "축구공을 차요.",            soundEffect: "뻥!" },
  { word: "책", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "책을 읽어요." },
  { word: "침대", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "침대에서 자요." },
  { word: "창문", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "창문을 열어요." },
  { word: "참새", targetPhonemes: ["ㅊ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "참새가 짹짹 울어요.",       soundEffect: "짹짹~" },
  { word: "청소기", targetPhonemes: ["ㅊ", "ㅇ", "ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "청소기로 먼지를 빨아요.",   soundEffect: "윙윙~" },
  { word: "치약", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "치약으로 이를 닦아요." },
  { word: "촛불", targetPhonemes: ["ㅊ", "ㅅ", "ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "촛불이 반짝여요.",          soundEffect: "훅~" },
  { word: "치즈", targetPhonemes: ["ㅊ", "ㅈ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "치즈가 맛있어요.",          soundEffect: "냠냠~" },
  { word: "춤", targetPhonemes: ["ㅊ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "신나게 춤을 춰요.",         soundEffect: "신나~" },
  { word: "철봉", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "철봉에 매달려요." },
  { word: "천둥", targetPhonemes: ["ㅊ", "ㄴ", "ㄷ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "천둥이 우르릉 소리가 나요.", soundEffect: "우르릉~" },
  { word: "청개구리", targetPhonemes: ["ㅊ", "ㅇ", "ㄱ", "ㄹ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "청개구리가 개굴개굴 울어요.", soundEffect: "개굴~" },

  // ══════════════════════════════════════════════════════════
  // ㄱ — 연구개 파열음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "고양이", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "고양이가 야옹 울어요.",     soundEffect: "야옹~" },
  { word: "곰", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "곰이 꿀을 좋아해요.",       soundEffect: "으으~" },
  { word: "기차", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "기차가 달려요.",            soundEffect: "칙칙폭폭!" },
  { word: "가방", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "가방에 책을 넣어요." },
  { word: "강아지", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "강아지가 멍멍 짖어요.",     soundEffect: "멍멍~" },
  { word: "기린", targetPhonemes: ["ㄱ", "ㄹ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "기린의 목이 길어요." },
  { word: "거미", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거미가 줄을 타요." },
  { word: "개구리", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "개구리가 개굴개굴 울어요.", soundEffect: "개굴개굴~" },
  { word: "귤", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "귤이 새콤달콤해요.",        soundEffect: "새콤~" },
  { word: "그네", targetPhonemes: ["ㄱ", "ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "그네를 타요.",              soundEffect: "씽씽~" },
  { word: "가위", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "가위로 종이를 잘라요.",     soundEffect: "싹둑~" },
  { word: "거울", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거울을 봐요." },
  { word: "고구마", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "고구마가 달콤해요.",        soundEffect: "냠냠~" },
  { word: "감자", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "감자를 삶아요." },
  { word: "게", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "게가 옆으로 걸어요.",       soundEffect: "집게!" },
  { word: "거북이", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거북이가 느릿느릿 가요.",   soundEffect: "느릿느릿~" },
  { word: "공", targetPhonemes: ["ㄱ", "ㅇ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "공을 던져요.",              soundEffect: "통통~" },
  { word: "고래", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "고래가 물을 뿜어요.", soundEffect: "쏴~" },
  { word: "고릴라", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "고릴라가 나무를 타요." },
  { word: "가지", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "가지를 먹어요." },
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
  { word: "냄비", targetPhonemes: ["ㄴ", "ㅁ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "냄비에 국을 끓여요.",       soundEffect: "보글보글~" },
  { word: "나팔", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나팔을 불어요.", soundEffect: "빠라밤~" },
  { word: "낙타", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "낙타가 사막을 걸어요." },
  { word: "놀이터", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "놀이터에서 놀아요.", soundEffect: "까르르~" },
  { word: "눈물", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "눈물이 뚝뚝 흘러요.", soundEffect: "뚝뚝~" },
  { word: "나물", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나물을 먹어요." },
  { word: "낮잠", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "낮잠을 자요.",              soundEffect: "쿨쿨~" },
  { word: "노트", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "노트에 글씨를 써요." },
  { word: "누나", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "누나가 예뻐요." },
  { word: "낙엽", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "낙엽이 바스락거려요.", soundEffect: "바스락~" },
  { word: "너구리", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "너구리가 뒤뚱거려요." },
  { word: "냉면", targetPhonemes: ["ㄴ", "ㅇ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "냉면이 시원해요.",    soundEffect: "후루룩~" },
  { word: "노루", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "노루가 뛰어요." },
  { word: "무지개", targetPhonemes: ["ㅁ", "ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "비 온 뒤에 무지개가 떠요." },

  // ══════════════════════════════════════════════════════════
  // ㄷ — 치조 파열음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "도토리", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "다람쥐가 도토리를 모아요.", soundEffect: "데굴데굴~" },
  { word: "딸기", targetPhonemes: ["ㄸ", "ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "빨간 딸기가 달콤해요.", soundEffect: "냠냠~" },
  { word: "당근", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "당근을 먹어요.",            soundEffect: "아삭~" },
  { word: "돼지", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "돼지가 꿀꿀 울어요.",       soundEffect: "꿀꿀~" },
  { word: "동생", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "동생이 귀여워요." },
  { word: "도넛", targetPhonemes: ["ㄷ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "도넛이 맛있어요.",          soundEffect: "냠냠~" },
  { word: "달걀", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "달걀을 삶아요." },
  { word: "도서관", targetPhonemes: ["ㄷ", "ㅅ", "ㄱ", "ㄴ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "도서관에서 책을 읽어요." },
  { word: "다리", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "다리로 뛰어요." },
  { word: "도마뱀", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "도마뱀이 기어가요." },
  { word: "독수리", targetPhonemes: ["ㄷ", "ㄱ", "ㅅ", "ㄹ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "독수리가 높이 날아요." },
  { word: "도화지", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "도화지에 그림을 그려요." },
  { word: "두더지", targetPhonemes: ["ㄷ", "ㅈ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "두더지가 땅을 파요." },
  { word: "도깨비", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "도깨비가 나타났어요.",      soundEffect: "으~ 무서워!" },
  { word: "달고나", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "달고나가 달콤해요." },
  { word: "대나무", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "판다가 대나무를 먹어요." },
  { word: "두루미", targetPhonemes: ["ㄷ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "두루미가 날아가요." },

  // ══════════════════════════════════════════════════════════
  // ㅂ — 양순 파열음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "바나나", targetPhonemes: ["ㅂ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "원숭이가 바나나를 먹어요.", soundEffect: "냠냠~" },
  { word: "버스", targetPhonemes: ["ㅂ", "ㅅ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "버스를 타고 가요.",         soundEffect: "부릉부릉!" },
  { word: "병아리", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "병아리가 삐약삐약 울어요.", soundEffect: "삐약~" },
  { word: "별빛", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "2-3세", sampleSentence: "별빛이 반짝반짝 빛나요.", soundEffect: "반짝반짝~" },
  { word: "부엉이", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "부엉이가 부엉부엉 울어요.", soundEffect: "부엉부엉~" },
  { word: "버섯", targetPhonemes: ["ㅂ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "버섯이 숲속에 있어요." },
  { word: "바다", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "바다가 넓어요.",            soundEffect: "파도 철썩~" },
  { word: "배", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "배가 달콤해요.",            soundEffect: "아삭~" },
  { word: "봄", targetPhonemes: ["ㅂ", "ㅁ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "봄에 꽃이 피어요." },
  { word: "번개", targetPhonemes: ["ㅂ", "ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "번개가 번쩍 쳐요.",         soundEffect: "번쩍!" },
  { word: "바위", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "바위가 크고 무거워요." },
  { word: "배추", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "배추로 김치를 만들어요." },
  { word: "비행기", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "비행기가 하늘을 날아요.",   soundEffect: "윙~" },
  { word: "반딧불이", targetPhonemes: ["ㅂ", "ㄹ", "ㄴ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "반딧불이가 반짝여요.",   soundEffect: "반짝반짝~" },
  { word: "빗자루", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "빗자루로 쓸어요." },
  { word: "병원", targetPhonemes: ["ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "병원에 가요." },
  { word: "불꽃", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "불꽃놀이가 예뻐요.",    soundEffect: "펑펑~" },
  { word: "빵", targetPhonemes: ["ㅃ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "빵을 먹어요.",              soundEffect: "냠냠~" },

  // ══════════════════════════════════════════════════════════
  // ㅁ — 양순 비음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "마트", targetPhonemes: ["ㅁ", "ㅌ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "마트에서 과일을 사요." },
  { word: "모자", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "빨간 모자를 써요." },
  { word: "문어", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "문어는 다리가 여덟 개예요.", soundEffect: "꿈틀꿈틀~" },
  { word: "미끄럼틀", targetPhonemes: ["ㅁ", "ㄹ", "ㄲ", "ㅌ"], difficulty: "hard", ageGroup: "2-3세", sampleSentence: "미끄럼틀을 타요.",     soundEffect: "슝~" },
  { word: "메뚜기", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "메뚜기가 풀밭에 있어요." },
  { word: "목도리", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "목도리를 목에 감아요." },
  { word: "물감", targetPhonemes: ["ㅁ", "ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "물감으로 그림을 그려요." },
  { word: "마이크", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "마이크에 대고 노래해요.",  soundEffect: "라라라~" },
  { word: "망원경", targetPhonemes: ["ㅁ", "ㅇ", "ㄱ", "ㄴ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "망원경으로 별을 봐요." },
  { word: "만두", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "만두가 맛있어요.",          soundEffect: "냠냠~" },
  { word: "매미", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "매미가 맴맴 울어요.",       soundEffect: "맴맴~" },
  { word: "모기", targetPhonemes: ["ㅁ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "모기가 윙윙거려요.",        soundEffect: "윙윙~" },
  { word: "먹구름", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "먹구름이 몰려와요." },
  { word: "무당벌레", targetPhonemes: ["ㅁ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "무당벌레가 예뻐요." },
  { word: "메론", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "메론이 달콤해요.",     soundEffect: "냠냠~" },
  { word: "망고", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "망고가 달콤해요.",          soundEffect: "냠냠~" },
  { word: "마스크", targetPhonemes: ["ㅁ", "ㅅ", "ㅋ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "마스크를 써요." },
  { word: "모래성", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "모래성을 만들어요." },

  // ══════════════════════════════════════════════════════════
  // ㅎ — 성문 마찰음 (2-3세)
  // ══════════════════════════════════════════════════════════
  { word: "하마", targetPhonemes: ["ㅎ", "ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "하마는 입이 커요.",         soundEffect: "으르렁!" },
  { word: "호랑이", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "medium", ageGroup: "2-3세", sampleSentence: "호랑이가 어흥 울어요.", soundEffect: "어흥~" },
  { word: "화분", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "화분에 꽃이 피었어요." },
  { word: "해", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "해가 반짝반짝 빛나요.",     soundEffect: "반짝반짝~" },
  { word: "호박", targetPhonemes: ["ㅎ", "ㅂ", "ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "호박이 크고 둥글어요." },
  { word: "해바라기", targetPhonemes: ["ㅎ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "해바라기가 해를 봐요." },
  { word: "헬리콥터", targetPhonemes: ["ㅎ", "ㄹ", "ㅋ", "ㅂ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "헬리콥터가 하늘을 날아요.", soundEffect: "두두두두~" },
  { word: "호떡", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "호떡이 달콤해요.",          soundEffect: "지글지글~" },
  { word: "해파리", targetPhonemes: ["ㅎ", "ㄹ", "ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "해파리가 둥둥 떠요." },
  { word: "학교", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "학교에 가요." },
  { word: "호수", targetPhonemes: ["ㅎ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "호수에 오리가 있어요." },
  { word: "하품", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "하품이 나와요.",            soundEffect: "하~암" },
  { word: "허수아비", targetPhonemes: ["ㅎ", "ㅅ", "ㅂ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "허수아비가 논에 있어요." },
  { word: "화장실", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "화장실에 가요." },
  { word: "흙", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "흙을 만져요." },

  // ══════════════════════════════════════════════════════════
  // ㅌ — 치조 파열음 격음 (3-4세)
  // ══════════════════════════════════════════════════════════
  { word: "토끼", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "토끼가 깡충깡충 뛰어요.",   soundEffect: "깡충깡충!" },
  { word: "타조", targetPhonemes: ["ㅌ", "ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "타조가 빨리 달려요." },
  { word: "태양", targetPhonemes: ["ㅌ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "태양이 뜨거워요." },
  { word: "토마토", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "토마토가 빨개요.",          soundEffect: "아삭~" },
  { word: "트럭", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "트럭이 짐을 실어요.",       soundEffect: "부릉부릉!" },
  { word: "터널", targetPhonemes: ["ㅌ", "ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "터널을 지나가요.",          soundEffect: "윙~" },
  { word: "탱크", targetPhonemes: ["ㅌ", "ㅋ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "탱크가 크고 무거워요." },
  { word: "태풍", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "태풍이 거세게 불어요.",     soundEffect: "쌩쌩~" },
  { word: "턱", targetPhonemes: ["ㅌ", "ㄱ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "턱을 만져요." },
  { word: "텔레비전", targetPhonemes: ["ㅌ", "ㄹ", "ㅂ", "ㅈ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "텔레비전을 봐요." },
  { word: "튀김", targetPhonemes: ["ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "튀김이 바삭바삭해요.",      soundEffect: "바삭바삭~" },
  { word: "탑", targetPhonemes: ["ㅌ", "ㅂ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "탑이 높이 솟아 있어요." },
  { word: "택시", targetPhonemes: ["ㅌ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "택시를 타요." },

  // ══════════════════════════════════════════════════════════
  // ㅍ — 양순 파열음 격음 (3-4세)
  // ══════════════════════════════════════════════════════════
  { word: "파도", targetPhonemes: ["ㅍ", "ㄷ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "파도가 출렁거려요.",        soundEffect: "철썩철썩~" },
  { word: "파인애플", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "파인애플이 달콤새콤해요." },
  { word: "포도", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "포도가 달콤해요.",          soundEffect: "냠냠~" },
  { word: "피자", targetPhonemes: ["ㅍ", "ㅈ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "피자가 맛있어요.",          soundEffect: "냠냠~" },
  { word: "팽이", targetPhonemes: ["ㅍ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "팽이를 돌려요.",            soundEffect: "윙윙~" },
  { word: "피리", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "피리를 불어요.",    soundEffect: "삐리리~" },
  { word: "편지", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "편지를 써요." },
  { word: "폭포", targetPhonemes: ["ㅍ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "폭포가 시원하게 떨어져요.", soundEffect: "콸콸~" },
  { word: "팝콘", targetPhonemes: ["ㅍ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "팝콘이 톡톡 튀어요.",       soundEffect: "팡팡~" },
  { word: "펭귄", targetPhonemes: ["ㅍ", "ㄱ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "펭귄이 뒤뚱뒤뚱 걸어요.",  soundEffect: "뒤뚱뒤뚱~" },
  { word: "피아노", targetPhonemes: ["ㅍ", "ㄴ"], difficulty: "easy",   ageGroup: "4-5세", sampleSentence: "피아노를 쳐요.",            soundEffect: "도레미~" },
  { word: "표범", targetPhonemes: ["ㅍ", "ㅂ", "ㅁ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "표범이 빠르게 달려요." },

  // ══════════════════════════════════════════════════════════
  // 경음 — ㄲ ㄸ ㅃ ㅆ ㅉ (4-5세 이후)
  // ══════════════════════════════════════════════════════════
  { word: "꽃", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "꽃이 예뻐요.",              soundEffect: "향기롭다~" },
  { word: "꿀벌", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "꿀벌이 윙윙 날아요.",       soundEffect: "윙윙~" },
  { word: "꿈", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "예쁜 꿈을 꿔요.",           soundEffect: "쿨쿨~" },
  { word: "깃발", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "깃발을 흔들어요.",          soundEffect: "펄럭펄럭~" },
  { word: "끈", targetPhonemes: ["ㄲ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "끈으로 묶어요." },
  { word: "떡볶이", targetPhonemes: ["ㄸ", "ㄱ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "떡볶이가 맛있어요.",        soundEffect: "매콤~" },
  { word: "뚜껑", targetPhonemes: ["ㄸ", "ㄲ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "뚜껑을 열어요.",            soundEffect: "펑~" },
  { word: "떡국", targetPhonemes: ["ㄸ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "설날에 떡국을 먹어요." },
  { word: "딸기잼", targetPhonemes: ["ㄸ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "딸기잼을 빵에 발라요." },
  { word: "빨래", targetPhonemes: ["ㅃ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "빨래를 널어요." },
  { word: "뿌리", targetPhonemes: ["ㅃ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "식물의 뿌리가 땅속에 있어요." },
  { word: "씨앗", targetPhonemes: ["ㅆ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "씨앗을 심어요." },
  { word: "쓰레기통", targetPhonemes: ["ㅆ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "쓰레기통에 버려요." },
  { word: "썰매", targetPhonemes: ["ㅆ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "눈 위에서 썰매를 타요.",    soundEffect: "씽씽~" },
  { word: "찌개", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "찌개가 보글보글 끓어요.",   soundEffect: "보글보글~" },
  { word: "쪽지", targetPhonemes: ["ㅉ", "ㄱ", "ㅈ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "쪽지에 쓸게요." },
  { word: "찐만두", targetPhonemes: ["ㅉ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "찐만두가 맛있어요.",        soundEffect: "냠냠~" },

  // ══════════════════════════════════════════════════════════
  // 신체·가족·일상 (자주 쓰는 단어)
  // ══════════════════════════════════════════════════════════
  { word: "엄마", targetPhonemes: ["ㅁ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "엄마가 좋아요." },
  { word: "아빠", targetPhonemes: ["ㅃ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "아빠가 힘이 세요." },
  { word: "할머니", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "할머니가 사랑스러워요." },
  { word: "할아버지", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "할아버지께 인사해요." },
  { word: "언니", targetPhonemes: ["ㄴ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "언니가 예뻐요." },
  { word: "오빠", targetPhonemes: ["ㅃ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "오빠가 멋져요." },
  { word: "형", targetPhonemes: ["ㅎ", "ㅇ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "형이 친절해요." },
  { word: "눈코입", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "눈코입이 있어요." },
  { word: "무릎", targetPhonemes: ["ㅁ", "ㄹ", "ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "무릎을 굽혀요." },
  { word: "머리", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "머리를 감아요." },
  { word: "배꼽", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "배꼽이 있어요." },
  { word: "밥", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "밥을 먹어요.",              soundEffect: "냠냠~" },
  { word: "국", targetPhonemes: ["ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "국을 마셔요.",              soundEffect: "후루룩~" },
  { word: "우유", targetPhonemes: ["ㅜ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "우유를 마셔요.",            soundEffect: "꿀꺽~" },
  { word: "과자", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "과자가 바삭바삭해요.",  soundEffect: "바삭~" },
  { word: "사탕수수", targetPhonemes: ["ㅅ"], difficulty: "easy",   ageGroup: "3-4세", sampleSentence: "사탕수수로 설탕을 만들어요.", soundEffect: "냠냠~" },
  { word: "케이크", targetPhonemes: ["ㅋ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "케이크에 초를 꽂아요.",    soundEffect: "생일 축하~" },
  { word: "아이스크림", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "아이스크림이 시원해요.",   soundEffect: "야호~" },

  // ══════════════════════════════════════════════════════════
  // 자연·날씨·계절
  // ══════════════════════════════════════════════════════════
  { word: "꽃잎", targetPhonemes: ["ㄲ", "ㅊ", "ㅍ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "꽃잎이 날려요.",           soundEffect: "팔랑팔랑~" },
  { word: "비", targetPhonemes: ["ㅂ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "비가 내려요.",              soundEffect: "후두두~" },
  { word: "눈사람", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "눈사람을 만들어요." },
  { word: "바닷가", targetPhonemes: ["ㅂ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "바닷가에서 놀아요." },
  { word: "폭풍", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "폭풍이 세게 불어요." },
  { word: "새싹", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "새싹이 돋아났어요." },
  { word: "솔방울", targetPhonemes: ["ㅅ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "솔방울을 주웠어요." },
  { word: "단풍", targetPhonemes: ["ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "단풍이 빨갛게 물들었어요.", soundEffect: "바스락~" },

  // ══════════════════════════════════════════════════════════
  // 놀이·장난감·활동
  // ══════════════════════════════════════════════════════════
  { word: "블록", targetPhonemes: ["ㅂ", "ㄹ", "ㄱ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "블록으로 탑을 쌓아요.", soundEffect: "딸깍딸깍~" },
  { word: "인형", targetPhonemes: ["ㅎ"], difficulty: "easy",   ageGroup: "2-3세", sampleSentence: "인형을 안아요." },
  { word: "퍼즐", targetPhonemes: ["ㅍ", "ㅈ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "퍼즐을 맞춰요.",            soundEffect: "딸깍!" },
  { word: "색종이", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "색종이로 접어요." },
  { word: "크레파스", targetPhonemes: ["ㄹ"], difficulty: "hard",   ageGroup: "4-5세", sampleSentence: "크레파스로 그림 그려요." },
  { word: "수영복", targetPhonemes: ["ㅅ", "ㅇ", "ㅂ", "ㄱ"], difficulty: "hard",   ageGroup: "5-6세", sampleSentence: "수영복을 입어요." },
  { word: "줄넘기", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "줄넘기를 해요.",     soundEffect: "휙휙~" },
  { word: "미술", targetPhonemes: ["ㅁ", "ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "미술 시간이 재미있어요." },

  // ══════════════════════════════════════════════════════════
  // 직업 (직업 관련 단어들)
  // ══════════════════════════════════════════════════════════
  { word: "의사", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "의사가 병을 고쳐요." },
  { word: "경찰관", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "경찰관이 질서를 지켜요." },
  { word: "소방관", targetPhonemes: ["ㅅ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "소방관이 불을 꺼요." },
  { word: "교사", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "교사가 우리에게 배워요." },
  { word: "농부", targetPhonemes: ["ㄴ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "농부가 쌀을 키워요." },
  { word: "요리사", targetPhonemes: ["ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "요리사가 맛있는 음식을 만들어요." },
  { word: "의사선생님", targetPhonemes: ["ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "의사선생님께서 약을 주셨어요." },
  { word: "우체부", targetPhonemes: ["ㅊ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "우체부가 편지를 나르는 일을 해요." },
  { word: "경찰", targetPhonemes: ["ㄱ", "ㅊ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "경찰이 우리를 지켜줘요." },
  { word: "화가", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "화가가 그림을 그려요." },
  { word: "음악가", targetPhonemes: ["ㅁ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "음악가가 아름다운 곡을 만들어요." },
  { word: "운동선수", targetPhonemes: ["ㅇ", "ㄴ", "ㄷ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "운동선수가 경쟁에서 우승했어요." },
  { word: "선수", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "선수가 게임에서 이겼어요." },

  // ══════════════════════════════════════════════════════════
  // 운동·게임
  // ══════════════════════════════════════════════════════════
  { word: "야구", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "야구를 해요.",             soundEffect: "탁!" },
  { word: "탁구", targetPhonemes: ["ㅌ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "탁구 경기가 재미있어요.",   soundEffect: "탁탁~" },
  { word: "배드민턴", targetPhonemes: ["ㅂ", "ㄷ", "ㅁ", "ㄴ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "배드민턴을 친다." },
  { word: "스키", targetPhonemes: ["ㅅ", "ㅋ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "눈 위에서 스키를 타요." },
  { word: "스케이트", targetPhonemes: ["ㅅ", "ㅋ", "ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "스케이트를 신고 미끄러져요." },
  { word: "멀리뛰기", targetPhonemes: ["ㅁ", "ㄹ", "ㄸ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "멀리뛰기 대회에 나갔어요." },
  { word: "높이뛰기", targetPhonemes: ["ㄴ", "ㄱ", "ㄸ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "높이뛰기를 해요." },
  { word: "체조", targetPhonemes: ["ㅊ", "ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "체조 시간이 재미있어요." },
  { word: "무술", targetPhonemes: ["ㅁ", "ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "무술을 배워요." },
  { word: "태권도", targetPhonemes: ["ㅌ", "ㄱ", "ㄷ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "태권도를 배우고 있어요." },

  // ══════════════════════════════════════════════════════════
  // 감정·상태
  // ══════════════════════════════════════════════════════════
  { word: "행복", targetPhonemes: ["ㅎ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "행복한 기분이에요." },
  { word: "슬픔", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "슬픈 영화를 봤어요." },
  { word: "화남", targetPhonemes: ["ㅎ", "ㄴ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "화나면 안 돼요." },
  { word: "무서움", targetPhonemes: ["ㅁ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "무서운 영화 보지 말아요." },
  { word: "신남", targetPhonemes: ["ㅅ", "ㄴ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "신나는 음악을 들어요." },
  { word: "졸음", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "졸음이 와요." },
  { word: "피로", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "피로해 보여요." },
  { word: "부끄러움", targetPhonemes: ["ㅂ", "ㄲ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "부끄러워하지 말아요." },
  { word: "설렘", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "설레는 마음이에요." },

  // ══════════════════════════════════════════════════════════
  // 더 많은 동물들
  // ══════════════════════════════════════════════════════════
  { word: "얼룩말", targetPhonemes: ["ㄹ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "얼룩말이 줄무늬가 있어요." },
  { word: "코끼리", targetPhonemes: ["ㄲ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "코끼리 코는 길어요." },
  { word: "캥거루", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "캥거루가 뛰어가요." },
  { word: "오랑우탄", targetPhonemes: ["ㅇ", "ㄹ", "ㄴ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "오랑우탄이 나무에 매달려요." },
  { word: "침팬지", targetPhonemes: ["ㅊ", "ㅍ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "침팬지가 똑똑해요." },
  { word: "들소", targetPhonemes: ["ㄷ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "들소는 목초지에 산다." },
  { word: "라마", targetPhonemes: ["ㄹ", "ㅁ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "라마가 털이 복슬복슬해요." },
  { word: "양", targetPhonemes: ["ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "양이 메메 울어요.",      soundEffect: "메메~" },
  { word: "염소", targetPhonemes: ["ㅁ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "염소가 풀을 뜯어 먹어요." },
  { word: "사슴벌레", targetPhonemes: ["ㅅ", "ㅂ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "사슴벌레 애벌레를 찾았어요." },
  { word: "나방", targetPhonemes: ["ㄴ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "나방이 불빛에 모여요." },
  { word: "매", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "매가 높이 날아가요." },
  { word: "문제", targetPhonemes: ["ㅁ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "어려운 문제를 풀어요." },
  { word: "악어", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "악어의 입이 커요." },
  { word: "개미", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "개미가 줄지어 가요." },
  { word: "나뭇잎", targetPhonemes: ["ㄴ", "ㅁ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "나뭇잎이 바스락거려요." },

  // ══════════════════════════════════════════════════════════
  // 더 많은 음식
  // ══════════════════════════════════════════════════════════
  { word: "소시지", targetPhonemes: ["ㅅ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "소시지를 구워먹어요." },
  { word: "비빔밥", targetPhonemes: ["ㅂ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "비빔밥이 맛있어요." },
  { word: "김밥", targetPhonemes: ["ㄱ", "ㅂ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "김밥을 말아요." },
  { word: "우동", targetPhonemes: ["ㅇ", "ㄷ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "우동이 길고 맛있어요." },
  { word: "스파게티", targetPhonemes: ["ㅅ", "ㅍ", "ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "스파게티를 먹어요." },
  { word: "카레", targetPhonemes: ["ㅋ", "ㄹ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "카레가 맵지만 맛있어요." },
  { word: "핫도그", targetPhonemes: ["ㅎ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "핫도그를 먹어요." },
  { word: "케첩", targetPhonemes: ["ㅋ", "ㅊ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "감자튀김에 케첩을 쳐요." },
  { word: "마요네즈", targetPhonemes: ["ㅁ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "마요네즈를 짜요." },
  { word: "기름", targetPhonemes: ["ㄱ", "ㄹ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "기름으로 부쳐요." },
  { word: "설탕", targetPhonemes: ["ㅅ", "ㅌ", "ㄹ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "설탕이 달콤해요." },
  { word: "요구르트", targetPhonemes: ["ㄱ", "ㄹ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "요구르트를 마셔요." },
  { word: "버터", targetPhonemes: ["ㅂ", "ㅌ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "버터를 빵에 바르는거예요." },
  { word: "잼", targetPhonemes: ["ㅈ", "ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "딸기잼이 맛있어요." },
  { word: "누텔라", targetPhonemes: ["ㄴ", "ㅌ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "누텔라를 빵에 발라요." },
  { word: "두유", targetPhonemes: ["ㄷ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "두유를 마셔요." },

  // ══════════════════════════════════════════════════════════
  // 신체 부위 추가
  // ══════════════════════════════════════════════════════════
  { word: "머리카락", targetPhonemes: ["ㅁ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "머리카락이 길어요." },
  { word: "이마", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "이마에 뽀뽀했어요." },
  { word: "눈썹", targetPhonemes: ["ㄴ", "ㅆ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "눈썹이 진하네요." },
  { word: "코", targetPhonemes: ["ㅋ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "코로 숨을 쉬어요." },
  { word: "입술", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "입술이 빨갛네요." },
  { word: "이빨", targetPhonemes: ["ㅃ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "이빨을 닦아요." },
  { word: "혀", targetPhonemes: ["ㅎ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "혀로 맛을 봐요." },
  { word: "목", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "목이 아파요." },
  { word: "어깨", targetPhonemes: ["ㄲ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "어깨가 아파요." },
  { word: "팔꿈치", targetPhonemes: ["ㅍ", "ㄲ", "ㅁ", "ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "팔꿈치로 탁자에 부딪혔어요." },
  { word: "손가락", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손가락 다섯 개가 있어요." },
  { word: "가슴", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "가슴이 철렁했어요." },
  { word: "엉덩이", targetPhonemes: ["ㅇ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "엉덩이를 탁탁 치지 마요." },
  { word: "정강이", targetPhonemes: ["ㅈ", "ㄱ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "정강이가 아파요." },
  { word: "발목", targetPhonemes: ["ㅂ", "ㅁ", "ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "발목이 삐끗했어요." },
  { word: "발톱", targetPhonemes: ["ㅂ", "ㅌ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "발톱을 깎아요." },
  { word: "근육", targetPhonemes: ["ㄱ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "근육이 커야 세요." },
  { word: "뼈", targetPhonemes: ["ㅃ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "뼈가 부러졌어요." },
  { word: "뇌", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "5-6세", sampleSentence: "뇌는 중요한 기관이에요." },

  // ══════════════════════════════════════════════════════════
  // 옷과 신발
  // ══════════════════════════════════════════════════════════
  { word: "셔츠", targetPhonemes: ["ㅅ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "셔츠를 입어요." },
  { word: "바지", targetPhonemes: ["ㅂ", "ㅈ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "파란 바지를 입어요." },
  { word: "속옷", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "속옷을 입어요." },
  { word: "양말", targetPhonemes: ["ㅇ", "ㅁ", "ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "양말을 신어요." },
  { word: "부츠", targetPhonemes: ["ㅂ", "ㅊ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "부츠가 따뜻해요." },
  { word: "운동화", targetPhonemes: ["ㅇ", "ㄷ", "ㅎ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "운동화로 뛰어요." },
  { word: "슬리퍼", targetPhonemes: ["ㅅ", "ㄹ", "ㅍ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "슬리퍼를 신어요." },
  { word: "내복", targetPhonemes: ["ㄴ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "겨울에 내복을 입어요." },
  { word: "스웨터", targetPhonemes: ["ㅅ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "스웨터가 따뜻해요." },
  { word: "코트", targetPhonemes: ["ㅋ", "ㅌ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "겨울 코트를 입어요." },

  // ══════════════════════════════════════════════════════════
  // 동사 (행동)
  // ══════════════════════════════════════════════════════════
  { word: "웃다", targetPhonemes: ["ㅅ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "재미있어서 웃어요." },
  { word: "울다", targetPhonemes: ["ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "슬퍼서 울어요." },
  { word: "걷다", targetPhonemes: ["ㄱ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "천천히 걸어요." },
  { word: "앉다", targetPhonemes: ["ㄴ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "의자에 앉아요." },
  { word: "누우다", targetPhonemes: ["ㄴ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "침대에 누워요." },
  { word: "일어나다", targetPhonemes: ["ㄹ", "ㄴ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "아침에 일어나요." },
  { word: "자다", targetPhonemes: ["ㅈ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밤에 자요." },
  { word: "먹다", targetPhonemes: ["ㅁ", "ㄱ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밥을 먹어요." },
  { word: "마시다", targetPhonemes: ["ㅁ", "ㅅ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "물을 마셔요." },
  { word: "보다", targetPhonemes: ["ㅂ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하늘을 봐요." },
  { word: "듣다", targetPhonemes: ["ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "음악을 들어요." },
  { word: "말하다", targetPhonemes: ["ㅁ", "ㄹ", "ㅎ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "천천히 말해요." },
  { word: "쓰다", targetPhonemes: ["ㅆ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "글씨를 써요." },
  { word: "읽다", targetPhonemes: ["ㄷ"], difficulty: "easy", ageGroup: "4-5세", sampleSentence: "책을 읽어요." },
  { word: "그리다", targetPhonemes: ["ㄱ", "ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "그림을 그려요." },
  { word: "만들다", targetPhonemes: ["ㅁ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "장난감을 만들어요." },
  { word: "찾다", targetPhonemes: ["ㅊ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "물건을 찾아요." },
  { word: "숨다", targetPhonemes: ["ㅅ", "ㅁ", "ㄷ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "숨바꼭질을 해요." },
  { word: "밀다", targetPhonemes: ["ㅁ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "문을 밀어요." },
  { word: "당기다", targetPhonemes: ["ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손으로 당겨요." },

  // ══════════════════════════════════════════════════════════
  // 형용사 (특성)
  // ══════════════════════════════════════════════════════════
  { word: "뜨겁다", targetPhonemes: ["ㄷ", "ㄱ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "물이 뜨거워요." },
  { word: "차갑다", targetPhonemes: ["ㅊ", "ㄱ", "ㅂ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "얼음이 차가워요." },
  { word: "빠르다", targetPhonemes: ["ㅃ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "차가 빨라요." },
  { word: "느리다", targetPhonemes: ["ㄴ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "달팽이가 느려요." },
  { word: "어둡다", targetPhonemes: ["ㄷ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "밤이 어두워요." },
  { word: "깨끗하다", targetPhonemes: ["ㄲ", "ㄷ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손을 깨끗이 씻어요." },
  { word: "더럽다", targetPhonemes: ["ㄷ", "ㄹ", "ㅂ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "진흙이 더러워요." },
  { word: "단맛", targetPhonemes: ["ㄷ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "단맛이 좋아요." },
  { word: "짠맛", targetPhonemes: ["ㅉ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "짠맛이 나요." },

  // ══════════════════════════════════════════════════════════
  // 마지막 추가 카테고리 (교실, 학용품, 기타)
  // ══════════════════════════════════════════════════════════
  { word: "책상", targetPhonemes: ["ㅊ", "ㄱ", "ㅅ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "책상에 책을 놓아요." },
  { word: "의자", targetPhonemes: ["ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "의자에 앉아요." },
  { word: "칠판", targetPhonemes: ["ㅊ", "ㅍ", "ㄹ", "ㄴ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "칠판에 글씨를 써요." },
  { word: "지우개", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "지우개로 지워요." },
  { word: "딱지", targetPhonemes: ["ㄸ", "ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "딱지를 모아요." },
  { word: "그림책", targetPhonemes: ["ㄱ", "ㄹ", "ㅁ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "그림책을 읽어요." },
  { word: "교실", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "교실에서 공부해요." },
  { word: "운동장", targetPhonemes: ["ㄷ", "ㄴ", "ㅈ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "운동장에서 달려요." },
  { word: "화장실", targetPhonemes: ["ㅎ", "ㅈ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "화장실에 갔어요." },
  { word: "급식실", targetPhonemes: ["ㄱ", "ㅂ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "급식실에서 밥을 먹어요." },

  // 색깔 (Colors)
  { word: "빨강", targetPhonemes: ["ㅃ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "이건 빨강이에요." },
  { word: "파랑", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "파랑은 하늘색이에요." },
  { word: "노랑", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "해는 노랑이에요." },
  { word: "초록", targetPhonemes: ["ㅊ", "ㄹ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "나뭇잎은 초록이에요." },
  { word: "보라", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "포도는 보라색이에요." },
  { word: "분홍", targetPhonemes: ["ㅂ", "ㄴ", "ㅎ"], difficulty: "easy", ageGroup: "3-4세", sampleSentence: "분홍은 예뻐요." },
  { word: "회색", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "생쥐는 회색이에요." },
  { word: "검정", targetPhonemes: ["ㄱ", "ㅁ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "검정색은 어두워요." },
  { word: "하양", targetPhonemes: ["ㅎ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "눈은 하얗고 차가워요." },
  { word: "주황", targetPhonemes: ["ㅈ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "귤은 주황색이에요." },

  // 숫자 (Numbers)

  // 날씨 (Weather)
  { word: "날씨", targetPhonemes: ["ㄴ", "ㅆ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "오늘 날씨가 좋아요." },
  { word: "맑음", targetPhonemes: ["ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "하늘이 맑아요." },
  { word: "흐림", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "오늘은 흐려요." },
  { word: "바람", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "바람이 불어요." },
  { word: "천둥", targetPhonemes: ["ㅊ", "ㄷ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "천둥이 울려요." },
  { word: "번개", targetPhonemes: ["ㅂ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "번개가 쳤어요." },
  { word: "햇빛", targetPhonemes: ["ㅎ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "햇빛이 따뜻해요." },

  // 탈것 (Vehicles)
  { word: "버스", targetPhonemes: ["ㅂ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "버스를 탔어요." },
  { word: "택시", targetPhonemes: ["ㅌ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "택시를 불렀어요." },
  { word: "기차", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "기차는 빨라요." },
  { word: "비행기", targetPhonemes: ["ㅂ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "비행기를 타고 갔어요." },
  { word: "자동차", targetPhonemes: ["ㅊ", "ㄷ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "자동차가 빨리 가요." },
  { word: "오토바이", targetPhonemes: ["ㅌ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "오토바이는 시끄러워요." },
  { word: "자전거", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "자전거를 타요." },
  { word: "스쿠터", targetPhonemes: ["ㅅ", "ㅋ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "스쿠터를 탔어요." },

  // 과일 (Fruits) - 추가
  { word: "포도", targetPhonemes: ["ㅍ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "포도를 먹었어요." },
  { word: "수박", targetPhonemes: ["ㅅ", "ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수박은 시원해요." },
  { word: "참외", targetPhonemes: ["ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "참외가 맛있어요." },
  { word: "복숭아", targetPhonemes: ["ㅂ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "복숭아는 부드러워요." },
  { word: "체리", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "체리는 작고 빨가요." },
  { word: "라임", targetPhonemes: ["ㄹ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "라임은 초록색이에요." },
  { word: "귀리", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "귀리는 곡물이에요." },
  { word: "무화과", targetPhonemes: ["ㅁ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "무화과는 달아요." },

  // 채소 (Vegetables)
  { word: "당근", targetPhonemes: ["ㄷ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "당근을 깎아요." },
  { word: "옥수수", targetPhonemes: ["ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "옥수수를 먹어요." },
  { word: "감자", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "감자로 밥을 해요." },
  { word: "고구마", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고구마는 달아요." },
  { word: "양파", targetPhonemes: ["ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "양파를 잘라요." },
  { word: "마늘", targetPhonemes: ["ㅁ", "ㄴ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "마늘 냄새가 나요." },
  { word: "상추", targetPhonemes: ["ㅅ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "상추를 씻어요." },
  { word: "배추", targetPhonemes: ["ㅂ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "배추로 김치를 만들어요." },
  { word: "오이", targetPhonemes: ["ㅗ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "오이는 아삭해요." },
  { word: "토마토", targetPhonemes: ["ㅌ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "토마토는 빨가요." },

  // 방·장소 (Rooms/Places)
  { word: "침실", targetPhonemes: ["ㅊ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "침실에서 자요." },
  { word: "거실", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "거실에서 놀아요." },
  { word: "주방", targetPhonemes: ["ㅈ", "ㅂ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "주방에서 밥을 해요." },
  { word: "욕실", targetPhonemes: ["ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "욕실에서 씻어요." },
  { word: "현관", targetPhonemes: ["ㅎ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "현관에서 신발을 벗어요." },
  { word: "베란다", targetPhonemes: ["ㅂ", "ㄹ", "ㄷ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "베란다에 빨래를 널어요." },
  { word: "복도", targetPhonemes: ["ㅂ", "ㄷ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "복도에서 뛰지 마세요." },
  { word: "계단", targetPhonemes: ["ㄱ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "계단을 올라가요." },
  { word: "엘리베이터", targetPhonemes: ["ㄹ", "ㅂ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "엘리베이터를 탔어요." },
  { word: "놀이터", targetPhonemes: ["ㄴ", "ㅌ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "놀이터에서 놀아요." },

  // 움직임 (Actions/Movements)
  { word: "뛰다", targetPhonemes: ["ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "빨리 뛰어요." },
  { word: "점프", targetPhonemes: ["ㅈ", "ㅁ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "높이 점프했어요." },
  { word: "기다리다", targetPhonemes: ["ㄱ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "엄마를 기다려요." },
  { word: "어기다", targetPhonemes: ["ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "약속을 어겼어요." },
  { word: "미끄러지다", targetPhonemes: ["ㅁ", "ㄲ", "ㄹ", "ㅈ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "미끄러져서 넘어졌어요." },
  { word: "비틀다", targetPhonemes: ["ㅂ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "손수건을 비틀어요." },
  { word: "세우다", targetPhonemes: ["ㅅ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "블록을 세워요." },
  { word: "누르다", targetPhonemes: ["ㄴ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "버튼을 눌러요." },

  // 가족 (Family)
  { word: "할아버지", targetPhonemes: ["ㅎ", "ㄹ", "ㅂ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "할아버지를 찾아뵀어요." },
  { word: "할머니", targetPhonemes: ["ㅎ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "할머니가 밥을 해주세요." },
  { word: "누나", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "누나를 따라가요." },
  { word: "동생", targetPhonemes: ["ㄷ", "ㅅ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "동생이 작아요." },
  { word: "친구", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "친구랑 놀아요." },
  { word: "아주머니", targetPhonemes: ["ㅈ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "아주머니가 안녕하세요." },
  { word: "아저씨", targetPhonemes: ["ㅈ", "ㅆ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "아저씨가 도와주세요." },

  // 악기 (Instruments)
  { word: "기타", targetPhonemes: ["ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "기타를 쳐요." },
  { word: "피아노", targetPhonemes: ["ㅍ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "피아노를 배워요." },
  { word: "드럼", targetPhonemes: ["ㄷ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "드럼을 두드려요." },
  { word: "바이올린", targetPhonemes: ["ㅂ", "ㄹ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "바이올린이 예뻐요." },
  { word: "플루트", targetPhonemes: ["ㅍ", "ㄹ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "플루트를 불어요." },
  { word: "트롬본", targetPhonemes: ["ㅌ", "ㄹ", "ㅁ", "ㅂ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "트롬본은 길어요." },
  { word: "마라카스", targetPhonemes: ["ㅁ", "ㄹ", "ㅋ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마라카스로 음악을 만들어요." },
  { word: "실로폰", targetPhonemes: ["ㅅ", "ㄹ", "ㅍ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "실로폰을 치자!" },
  { word: "종", targetPhonemes: ["ㅈ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "종 소리가 나요." },
  { word: "탬버린", targetPhonemes: ["ㅌ", "ㅁ", "ㅂ", "ㄹ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "탬버린을 흔들어요." },

  // 장난감 (Toys)
  { word: "인형", targetPhonemes: ["ㅇ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "인형을 꼭 안아줘요." },
  { word: "블록", targetPhonemes: ["ㅂ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "블록으로 만들었어요." },
  { word: "로봇", targetPhonemes: ["ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "로봇이 움직여요." },
  { word: "보드게임", targetPhonemes: ["ㅂ", "ㄷ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "보드게임을 해요." },
  { word: "주사위", targetPhonemes: ["ㅈ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "주사위를 굴려요." },
  { word: "카드", targetPhonemes: ["ㅋ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "카드를 섞어요." },
  { word: "퍼즐", targetPhonemes: ["ㅍ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "퍼즐을 맞춰요." },
  { word: "연", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "연을 날려요." },

  // 책/독서 (Reading/Books)
  { word: "동화", targetPhonemes: ["ㄷ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "동화는 재미있어요." },
  { word: "만화", targetPhonemes: ["ㅁ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "만화를 봐요." },
  { word: "글자", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "글자를 배워요." },
  { word: "그림", targetPhonemes: ["ㄱ", "ㄹ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "그림을 그려요." },
  { word: "색칠", targetPhonemes: ["ㅅ", "ㄱ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "색칠해서 만들었어요." },
  { word: "이야기", targetPhonemes: ["ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "이야기를 들어요." },
  { word: "페이지", targetPhonemes: ["ㅍ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "페이지를 넘겨요." },
  { word: "표지", targetPhonemes: ["ㅍ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "표지가 예뻐요." },
  { word: "잉크", targetPhonemes: ["ㅇ", "ㅋ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "잉크가 나와요." },

  // 음식 재료 (Food Ingredients)
  { word: "계란", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "계란을 부쳤어요." },
  { word: "밀가루", targetPhonemes: ["ㅁ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "밀가루로 빵을 만들어요." },
  { word: "설탕", targetPhonemes: ["ㅅ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "설탕은 달아요." },
  { word: "소금", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "소금을 넣어요." },
  { word: "간장", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "간장을 조금 넣어요." },
  { word: "고추장", targetPhonemes: ["ㄱ", "ㅊ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "고추장은 맵아요." },
  { word: "된장", targetPhonemes: ["ㄷ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "된장찌개는 맛있어요." },
  { word: "버터", targetPhonemes: ["ㅂ", "ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "버터를 발라요." },
  { word: "치즈", targetPhonemes: ["ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "치즈를 먹어요." },

  // 계절 (Seasons)
  { word: "가을", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "가을이 되었어요." },
  { word: "겨울", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "겨울은 추워요." },
  { word: "봄날", targetPhonemes: ["ㅂ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "봄날은 예뻐요." },
  { word: "여름방학", targetPhonemes: ["ㅇ", "ㅁ", "ㅂ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "여름방학에 수영장에 가요." },
  { word: "개학", targetPhonemes: ["ㄱ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "개학이 되었어요." },
  { word: "방학", targetPhonemes: ["ㅂ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "방학이 좋아요." },
  { word: "명절", targetPhonemes: ["ㅁ", "ㅇ", "ㅈ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "명절에 놀러 가요." },
  { word: "정월", targetPhonemes: ["ㅈ", "ㅇ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "정월 대보름에 부럼을 깨요." },

  // 식사 시간 (Meals)
  { word: "간식", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "간식을 먹고 싶어요." },
  { word: "반찬", targetPhonemes: ["ㅂ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "반찬이 맛있어요." },
  { word: "국물", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "국물이 맛있어요." },
  { word: "끼니", targetPhonemes: ["ㄲ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "끼니를 거르면 안 돼요." },
  { word: "식탁", targetPhonemes: ["ㅅ", "ㅌ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "식탁에 앉았어요." },

  // 학용품 (School Supplies)
  { word: "연필", targetPhonemes: ["ㅍ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "연필로 글씨를 써요." },
  { word: "색연필", targetPhonemes: ["ㅅ", "ㄱ", "ㅍ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "색연필로 그려요." },
  { word: "펜", targetPhonemes: ["ㅍ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "펜으로 써요." },
  { word: "자", targetPhonemes: ["ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "자로 재요." },
  { word: "풀", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "풀을 바르는 거예요." },
  { word: "깍지", targetPhonemes: ["ㄲ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "두 손을 깍지 끼어요." },
  { word: "스템프", targetPhonemes: ["ㅅ", "ㅌ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "스템프를 찍어요." },
  { word: "테이프", targetPhonemes: ["ㅌ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "테이프로 붙여요." },

  // 가정용품 (Household Items)
  { word: "베개", targetPhonemes: ["ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "베개가 부드러워요." },
  { word: "담요", targetPhonemes: ["ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "담요로 덮었어요." },
  { word: "매트리스", targetPhonemes: ["ㅁ", "ㅌ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "매트리스가 편해요." },
  { word: "거울", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "거울에 내 얼굴이 비쳐요." },
  { word: "빗", targetPhonemes: ["ㅂ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빗으로 머리를 빗어요." },
  { word: "타올", targetPhonemes: ["ㅌ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "타올로 닦아요." },
  { word: "휴지", targetPhonemes: ["ㅎ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "휴지를 가져와요." },
  { word: "쓰레기통", targetPhonemes: ["ㅆ", "ㄹ", "ㄱ", "ㅌ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "쓰레기통에 버려요." },
  { word: "청소기", targetPhonemes: ["ㅊ", "ㅇ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "청소기를 돌려요." },
  { word: "걸레", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "걸레로 닦아요." },

  // 인사/표현 (Greetings/Expressions)
  { word: "안녕하세요", targetPhonemes: ["ㅇ", "ㄴ", "ㅎ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "안녕하세요." },
  { word: "안녕", targetPhonemes: ["ㅇ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "친구에게 안녕 인사해요." },
  { word: "고마워", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고마워요." },
  { word: "미안해", targetPhonemes: ["ㅁ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "미안해요." },
  { word: "괜찮아", targetPhonemes: ["ㄱ", "ㄴ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "괜찮아요." },
  { word: "좋아", targetPhonemes: ["ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "이 과자 정말 좋아요!" },
  { word: "싫어", targetPhonemes: ["ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "이건 싫어요." },
  { word: "아니오", targetPhonemes: ["ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "아니오, 먹고 싶지 않아요." },
  { word: "축하해", targetPhonemes: ["ㅊ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "생일 축하해!" },

  // 시간 표현 (Time Expressions)
  { word: "낮", targetPhonemes: ["ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "낮이 밝아요." },
  { word: "밤", targetPhonemes: ["ㅂ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밤이 어두워요." },
  { word: "시간", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "시간이 많아요." },
  { word: "분", targetPhonemes: ["ㅂ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "5분만 기다려요." },
  { word: "초", targetPhonemes: ["ㅊ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "10초를 세어요." },

  // 위치/방향 (Location/Direction)
  { word: "위", targetPhonemes: ["ㅟ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "위에 있어요." },
  { word: "아래", targetPhonemes: ["ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "아래를 봐요." },
  { word: "앞", targetPhonemes: ["ㅍ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "앞으로 가요." },
  { word: "뒤", targetPhonemes: ["ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "뒤로 와요." },
  { word: "옆", targetPhonemes: ["ㅍ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "옆에 앉아요." },
  { word: "안", targetPhonemes: ["ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "안에 있어요." },
  { word: "밖", targetPhonemes: ["ㅂ", "ㄲ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "밖으로 나가요." },
  { word: "오른쪽", targetPhonemes: ["ㄹ", "ㅉ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "오른쪽을 봐요." },
  { word: "왼쪽", targetPhonemes: ["ㄴ", "ㅉ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "왼쪽으로 가요." },
  { word: "중간", targetPhonemes: ["ㅈ", "ㄱ", "ㅇ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "중간에 있어요." },

  // 물건/소유 (Objects/Possession)
  { word: "내 것", targetPhonemes: ["ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "이건 내 것이에요." },
  { word: "너 것", targetPhonemes: ["ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "저건 너 것이에요." },
  { word: "물건", targetPhonemes: ["ㅁ", "ㄱ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "물건을 정리했어요." },
  { word: "가방", targetPhonemes: ["ㄱ", "ㅂ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "가방에 넣어요." },
  { word: "상자", targetPhonemes: ["ㅅ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "상자 안에 있어요." },
  { word: "도구", targetPhonemes: ["ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도구로 만들어요." },
  { word: "먼지", targetPhonemes: ["ㅁ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "먼지가 날아요." },
  { word: "모래", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "모래로 놀아요." },
  { word: "흙", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "흙을 파요." },

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
  { word: "꼬리", targetPhonemes: ["ㄲ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "강아지 꼬리가 흔들려요." },
  { word: "껌", targetPhonemes: ["ㄲ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "껌을 씹어요." },
  { word: "꼭", targetPhonemes: ["ㄲ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "꼭 안아줘요." },
  { word: "꿀", targetPhonemes: ["ㄲ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "꿀이 달아요.", soundEffect: "달콤" },
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
  { word: "딱따구리", targetPhonemes: ["ㄸ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "딱따구리가 나무를 쪼아요.", soundEffect: "딱딱" },
  { word: "딱지", targetPhonemes: ["ㄸ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "딱지를 쳐요.", soundEffect: "딱" },
  { word: "따뜻해", targetPhonemes: ["ㄸ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "따뜻해요." },
  { word: "뚜벅뚜벅", targetPhonemes: ["ㄸ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뚜벅뚜벅 걸어요.", soundEffect: "뚜벅뚜벅" },
  { word: "땅콩", targetPhonemes: ["ㄸ", "ㅋ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "땅콩을 먹어요." },
  { word: "딸꾹질", targetPhonemes: ["ㄸ", "ㄲ", "ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "딸꾹질이 나요.", soundEffect: "딸꾹" },

  // ── 경음 ㅃ (bilabial tense stop) ─────────────────────────────────────────
  { word: "뽀로로", targetPhonemes: ["ㅃ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "뽀로로를 봐요." },
  { word: "뻐꾸기", targetPhonemes: ["ㅃ", "ㄲ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뻐꾸기가 울어요.", soundEffect: "뻐꾹뻐꾹" },
  { word: "빼기", targetPhonemes: ["ㅃ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빼기를 해요." },
  { word: "빨리", targetPhonemes: ["ㅃ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빨리 달려요." },
  { word: "빵집", targetPhonemes: ["ㅃ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빵집에 가요." },
  { word: "뽑기", targetPhonemes: ["ㅃ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "뽑기를 해요." },
  { word: "뻥튀기", targetPhonemes: ["ㅃ", "ㅌ", "ㄱ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뻥튀기를 먹어요.", soundEffect: "뻥" },

  // ── 경음 ㅆ (alveolar tense fricative) ───────────────────────────────────
  { word: "쌀", targetPhonemes: ["ㅆ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "쌀로 밥을 지어요." },
  { word: "쓰레기", targetPhonemes: ["ㅆ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "쓰레기를 버려요." },
  { word: "씻어", targetPhonemes: ["ㅆ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "손을 씻어요." },
  { word: "쌓다", targetPhonemes: ["ㅆ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "블록을 쌓아요." },
  { word: "씩씩해", targetPhonemes: ["ㅆ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "씩씩해요." },
  { word: "쏙쏙", targetPhonemes: ["ㅆ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "쏙쏙 들어가요.", soundEffect: "쏙쏙" },
  { word: "쑥쑥", targetPhonemes: ["ㅆ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "키가 쑥쑥 자라요.", soundEffect: "쑥쑥" },
  { word: "쓰다듬어", targetPhonemes: ["ㅆ", "ㄷ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "머리를 쓰다듬어요." },

  // ── 경음 ㅉ (palato-alveolar tense affricate) ─────────────────────────────
  { word: "짜다", targetPhonemes: ["ㅉ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "음식이 짜요." },
  { word: "쪼개", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "사과를 쪼개요." },
  { word: "찐빵", targetPhonemes: ["ㅉ", "ㄴ", "ㅃ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "찐빵을 먹어요." },
  { word: "짱구", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "짱구를 봐요." },
  { word: "쫄깃", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "떡이 쫄깃해요.", soundEffect: "쫄깃" },
  { word: "쪽", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "쪽 뽀뽀해요.", soundEffect: "쪽" },
  { word: "쫑긋", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "귀를 쫑긋 세워요.", soundEffect: "쫑긋" },

  // ── ㄹ 심화 ───────────────────────────────────────────────────────────────
  { word: "리코더", targetPhonemes: ["ㄹ", "ㅋ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "리코더를 불어요." },
  { word: "롤케이크", targetPhonemes: ["ㄹ", "ㅋ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "롤케이크를 먹어요." },
  { word: "리듬", targetPhonemes: ["ㄹ", "ㄷ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "리듬을 맞춰요." },
  { word: "롤러스케이트", targetPhonemes: ["ㄹ", "ㅅ", "ㅋ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "롤러스케이트를 타요." },

  // ── ㅅ 심화 ───────────────────────────────────────────────────────────────
  { word: "선생님", targetPhonemes: ["ㅅ", "ㄴ", "ㅇ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "선생님이 가르쳐요." },
  { word: "쇼핑", targetPhonemes: ["ㅅ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "쇼핑을 해요." },
  { word: "세수", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "세수를 해요." },
  { word: "수달", targetPhonemes: ["ㅅ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수달이 헤엄쳐요." },
  { word: "소시지", targetPhonemes: ["ㅅ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "소시지를 구워요." },
  { word: "슬라임", targetPhonemes: ["ㅅ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "슬라임을 만져요." },
  { word: "수영장", targetPhonemes: ["ㅅ", "ㅇ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수영장에서 수영해요." },
  { word: "서랍", targetPhonemes: ["ㅅ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "서랍을 열어요." },
  { word: "손수건", targetPhonemes: ["ㅅ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "손수건으로 닦아요." },

  // ── ㅈ 심화 ───────────────────────────────────────────────────────────────
  { word: "지구", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "지구가 둥글어요." },
  { word: "지우개", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "지우개로 지워요." },
  { word: "줄넘기", targetPhonemes: ["ㅈ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "줄넘기를 해요." },
  { word: "장난감", targetPhonemes: ["ㅈ", "ㄴ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "장난감을 가지고 놀아요." },
  { word: "지렁이", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "지렁이가 기어요." },
  { word: "저금통", targetPhonemes: ["ㅈ", "ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "저금통에 넣어요." },
  { word: "졸음", targetPhonemes: ["ㅈ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "졸음이 와요." },

  // ── ㅊ 심화 ───────────────────────────────────────────────────────────────
  { word: "청소", targetPhonemes: ["ㅊ", "ㅅ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "청소를 해요." },
  { word: "치약", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "치약으로 닦아요." },
  { word: "초코", targetPhonemes: ["ㅊ", "ㅋ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "초코가 달아요." },
  { word: "창문", targetPhonemes: ["ㅊ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "창문을 열어요." },
  { word: "채소", targetPhonemes: ["ㅊ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "채소를 먹어요." },
  { word: "철봉", targetPhonemes: ["ㅊ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "철봉을 잡아요." },
  { word: "추석", targetPhonemes: ["ㅊ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "추석에 송편을 먹어요." },
  { word: "초록색", targetPhonemes: ["ㅊ", "ㄹ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초록색이에요." },
  { word: "침대", targetPhonemes: ["ㅊ", "ㅁ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "침대에서 자요." },

  // ── ㄱ 심화 ───────────────────────────────────────────────────────────────
  { word: "고구마", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "고구마가 달아요." },
  { word: "고슴도치", targetPhonemes: ["ㄱ", "ㅅ", "ㄷ", "ㅊ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고슴도치가 뾰족해요." },
  { word: "곤충", targetPhonemes: ["ㄱ", "ㄴ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "곤충을 잡아요." },
  { word: "금붕어", targetPhonemes: ["ㄱ", "ㅁ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "금붕어가 헤엄쳐요." },
  { word: "기차역", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "기차역에 가요." },
  { word: "국수", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "국수를 먹어요." },
  { word: "가위", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "가위로 잘라요." },
  { word: "강낭콩", targetPhonemes: ["ㄱ", "ㄴ", "ㅋ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "강낭콩을 심어요." },

  // ── ㄴ 심화 ───────────────────────────────────────────────────────────────
  { word: "눈사람", targetPhonemes: ["ㄴ", "ㅅ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "눈사람을 만들어요." },
  { word: "낙타", targetPhonemes: ["ㄴ", "ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "낙타가 걸어요." },
  { word: "냉장고", targetPhonemes: ["ㄴ", "ㅈ", "ㄱ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "냉장고를 열어요." },
  { word: "나팔", targetPhonemes: ["ㄴ", "ㅍ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "나팔을 불어요.", soundEffect: "빠바밤" },

  // ── ㄷ 심화 ───────────────────────────────────────────────────────────────
  { word: "달팽이", targetPhonemes: ["ㄷ", "ㄹ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "달팽이가 기어요." },
  { word: "대나무", targetPhonemes: ["ㄷ", "ㄴ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "대나무가 높아요." },
  { word: "도마뱀", targetPhonemes: ["ㄷ", "ㅁ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도마뱀이 기어요." },
  { word: "달력", targetPhonemes: ["ㄷ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "달력을 봐요." },
  { word: "도시락", targetPhonemes: ["ㄷ", "ㅅ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도시락을 먹어요." },
  { word: "동화책", targetPhonemes: ["ㄷ", "ㅎ", "ㅊ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "동화책을 읽어요." },
  { word: "도너츠", targetPhonemes: ["ㄷ", "ㄴ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도너츠를 먹어요." },

  // ── ㅂ 심화 ───────────────────────────────────────────────────────────────
  { word: "번데기", targetPhonemes: ["ㅂ", "ㄴ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "번데기가 나비가 돼요." },
  { word: "보물섬", targetPhonemes: ["ㅂ", "ㅁ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "보물섬을 찾아요." },
  { word: "봄바람", targetPhonemes: ["ㅂ", "ㅁ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "봄바람이 불어요." },
  { word: "벌레", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "벌레가 기어요." },
  { word: "볶음밥", targetPhonemes: ["ㅂ", "ㄲ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "볶음밥을 먹어요." },
  { word: "보라색", targetPhonemes: ["ㅂ", "ㄹ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "보라색이에요." },

  // ── ㅁ 심화 ───────────────────────────────────────────────────────────────
  { word: "무지개", targetPhonemes: ["ㅁ", "ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "무지개가 떠요." },
  { word: "미로", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "미로를 통과해요." },
  { word: "마카롱", targetPhonemes: ["ㅁ", "ㅋ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마카롱이 맛있어요." },

  // ── ㅎ 심화 ───────────────────────────────────────────────────────────────
  { word: "호박", targetPhonemes: ["ㅎ", "ㅂ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "호박이 동그래요." },
  { word: "해바라기", targetPhonemes: ["ㅎ", "ㅂ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "해바라기가 피었어요." },
  { word: "호두", targetPhonemes: ["ㅎ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "호두를 까요." },
  { word: "향기", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "꽃 향기가 나요." },

  // ── ㅍ 심화 ───────────────────────────────────────────────────────────────
  { word: "파도", targetPhonemes: ["ㅍ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "파도가 쳐요." },
  { word: "포크", targetPhonemes: ["ㅍ", "ㅋ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "포크로 찍어요." },
  { word: "피아노", targetPhonemes: ["ㅍ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "피아노를 쳐요." },
  { word: "팽이", targetPhonemes: ["ㅍ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "팽이를 돌려요.", soundEffect: "윙윙" },
  { word: "풍선껌", targetPhonemes: ["ㅍ", "ㄲ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "풍선껌을 불어요." },

  // ── ㅌ 심화 ───────────────────────────────────────────────────────────────
  { word: "터널", targetPhonemes: ["ㅌ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "터널을 통과해요." },
  { word: "토마토", targetPhonemes: ["ㅌ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "토마토가 빨개요." },
  { word: "트럭", targetPhonemes: ["ㅌ", "ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "트럭이 달려요." },
  { word: "트램폴린", targetPhonemes: ["ㅌ", "ㄹ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "트램폴린에서 뛰어요." },

  // ── 의성어·의태어 ─────────────────────────────────────────────────────────
  { word: "찰싹", targetPhonemes: ["ㅊ", "ㄹ", "ㅆ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "찰싹 때려요.", soundEffect: "찰싹" },
  { word: "사각사각", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "사각사각 소리 나요.", soundEffect: "사각사각" },
  { word: "데굴데굴", targetPhonemes: ["ㄷ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "데굴데굴 굴러요.", soundEffect: "데굴데굴" },
  { word: "졸졸", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "물이 졸졸 흘러요.", soundEffect: "졸졸" },
  { word: "빙글빙글", targetPhonemes: ["ㅂ", "ㄱ", "ㄹ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "빙글빙글 돌아요.", soundEffect: "빙글빙글" },
  { word: "폴짝폴짝", targetPhonemes: ["ㅍ", "ㄹ", "ㅉ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "폴짝폴짝 뛰어요.", soundEffect: "폴짝폴짝" },
  { word: "살금살금", targetPhonemes: ["ㅅ", "ㄹ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "살금살금 걸어요.", soundEffect: "살금살금" },
  { word: "부글부글", targetPhonemes: ["ㅂ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "부글부글 끓어요.", soundEffect: "부글부글" },

  // ── 학교·유치원 생활 ──────────────────────────────────────────────────────
  { word: "도화지", targetPhonemes: ["ㄷ", "ㅎ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도화지에 그려요." },
  { word: "물감", targetPhonemes: ["ㅁ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "물감으로 그려요." },
  { word: "붓", targetPhonemes: ["ㅂ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "붓으로 칠해요." },
  { word: "찰흙", targetPhonemes: ["ㅊ", "ㄹ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "찰흙으로 만들어요." },
  { word: "스케치북", targetPhonemes: ["ㅅ", "ㄱ", "ㅊ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "스케치북에 그려요." },
  { word: "책가방", targetPhonemes: ["ㅊ", "ㄱ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "책가방을 싸요." },
  { word: "알림장", targetPhonemes: ["ㄹ", "ㅁ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "알림장을 써요." },

  // ── 날씨·자연 심화 ────────────────────────────────────────────────────────
  { word: "소나기", targetPhonemes: ["ㅅ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "소나기가 와요." },
  { word: "안개", targetPhonemes: ["ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "안개가 끼었어요." },
  { word: "도토리", targetPhonemes: ["ㄷ", "ㅌ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도토리를 주웠어요." },

  // ── 동물 심화 (Animals) ───────────────────────────────────────────────────
  { word: "코끼리", targetPhonemes: ["ㄲ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "코끼리가 물을 뿌려요.", soundEffect: "뿌우" },
  { word: "악어", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "악어 입이 커요." },
  { word: "홍학", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "홍학이 분홍색이에요." },
  { word: "카멜레온", targetPhonemes: ["ㅋ", "ㅁ", "ㄹ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "카멜레온이 색이 바뀌어요." },
  { word: "코알라", targetPhonemes: ["ㅋ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "코알라가 나무에 매달려요." },
  { word: "판다", targetPhonemes: ["ㅍ", "ㄴ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "판다가 대나무를 먹어요." },
  { word: "미어캣", targetPhonemes: ["ㅁ", "ㅋ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "미어캣이 서 있어요." },
  { word: "올빼미", targetPhonemes: ["ㄹ", "ㅃ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "올빼미가 밤에 울어요.", soundEffect: "부엉부엉" },
  { word: "문어", targetPhonemes: ["ㅁ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "문어 다리가 많아요." },
  { word: "불가사리", targetPhonemes: ["ㅂ", "ㄹ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "불가사리를 발견했어요." },
  { word: "해파리", targetPhonemes: ["ㅎ", "ㅍ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "해파리가 떠다녀요." },
  { word: "홍합", targetPhonemes: ["ㅎ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "홍합을 먹어요." },
  { word: "가오리", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "가오리가 납작해요." },
  { word: "쥐", targetPhonemes: ["ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "쥐가 치즈를 먹어요.", soundEffect: "찍찍" },
  { word: "토끼풀", targetPhonemes: ["ㅌ", "ㄲ", "ㅍ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "토끼풀을 뜯어요." },
  { word: "장수풍뎅이", targetPhonemes: ["ㅈ", "ㅅ", "ㅍ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "장수풍뎅이 뿔이 있어요." },

  // ── 음식 심화 (Food) ──────────────────────────────────────────────────────
  { word: "순대", targetPhonemes: ["ㅅ", "ㄴ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "순대를 먹어요." },
  { word: "튀김", targetPhonemes: ["ㅌ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "튀김이 바삭해요." },
  { word: "김밥", targetPhonemes: ["ㄱ", "ㅁ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "김밥을 먹어요." },
  { word: "잡채", targetPhonemes: ["ㅈ", "ㅂ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "잡채가 맛있어요." },
  { word: "된장찌개", targetPhonemes: ["ㄷ", "ㄴ", "ㅈ", "ㅉ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "된장찌개가 구수해요." },
  { word: "삼겹살", targetPhonemes: ["ㅅ", "ㅁ", "ㄱ", "ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "삼겹살을 구워요." },
  { word: "냉면", targetPhonemes: ["ㄴ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "냉면이 시원해요." },
  { word: "삼계탕", targetPhonemes: ["ㅅ", "ㅁ", "ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "삼계탕이 따뜻해요." },
  { word: "갈비", targetPhonemes: ["ㄱ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "갈비를 먹어요." },
  { word: "감자튀김", targetPhonemes: ["ㄱ", "ㅁ", "ㅈ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "감자튀김이 바삭해요." },
  { word: "치킨", targetPhonemes: ["ㅊ", "ㅋ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "치킨이 맛있어요." },
  { word: "햄버거", targetPhonemes: ["ㅎ", "ㅁ", "ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "햄버거를 먹어요." },
  { word: "쿠키", targetPhonemes: ["ㅋ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "쿠키를 구워요." },
  { word: "아이스크림", targetPhonemes: ["ㅅ", "ㅋ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "아이스크림이 차가워요." },
  { word: "팝콘", targetPhonemes: ["ㅍ", "ㅂ", "ㅋ", "ㄴ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "팝콘이 톡톡 튀어요.", soundEffect: "탁탁" },
  { word: "솜사탕", targetPhonemes: ["ㅅ", "ㅁ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "솜사탕이 달아요." },
  { word: "삶은달걀", targetPhonemes: ["ㅅ", "ㄹ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "삶은달걀을 먹어요." },
  { word: "군고구마", targetPhonemes: ["ㄱ", "ㄴ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "군고구마가 달아요." },
  { word: "호떡", targetPhonemes: ["ㅎ", "ㄸ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "호떡이 달아요." },
  { word: "붕어빵", targetPhonemes: ["ㅂ", "ㅇ", "ㅃ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "붕어빵을 먹어요." },
  { word: "타코야끼", targetPhonemes: ["ㅌ", "ㄲ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "타코야끼가 동그래요." },
  { word: "오징어볶음", targetPhonemes: ["ㅈ", "ㅇ", "ㅂ", "ㄲ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "오징어볶음이 매워요." },

  // ── 탈것·교통 (Transportation) ────────────────────────────────────────────
  { word: "지하철", targetPhonemes: ["ㅈ", "ㅎ", "ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "지하철을 타요." },
  { word: "택시", targetPhonemes: ["ㅌ", "ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "택시를 타요." },
  { word: "소방차", targetPhonemes: ["ㅅ", "ㅂ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "소방차가 달려요.", soundEffect: "삐뽀삐뽀" },
  { word: "구급차", targetPhonemes: ["ㄱ", "ㅂ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "구급차가 달려요.", soundEffect: "삐뽀삐뽀" },
  { word: "경찰차", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "경찰차가 순찰해요." },
  { word: "굴착기", targetPhonemes: ["ㄱ", "ㄹ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "굴착기가 땅을 파요." },
  { word: "기중기", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "기중기가 짐을 들어요." },
  { word: "잠수함", targetPhonemes: ["ㅈ", "ㅁ", "ㅅ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "잠수함이 물속에 있어요." },
  { word: "로켓", targetPhonemes: ["ㄹ", "ㅋ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "로켓이 날아가요.", soundEffect: "슝" },
  { word: "우주선", targetPhonemes: ["ㅈ", "ㅅ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "우주선이 날아요." },
  { word: "케이블카", targetPhonemes: ["ㅋ", "ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "케이블카를 타요." },
  { word: "킥보드", targetPhonemes: ["ㄱ", "ㅂ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "킥보드를 타요." },

  // ── 신체 부위 심화 (Body Parts) ───────────────────────────────────────────
  { word: "눈썹", targetPhonemes: ["ㄴ", "ㅆ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "눈썹이 있어요." },
  { word: "속눈썹", targetPhonemes: ["ㅅ", "ㄱ", "ㄴ", "ㅂ", "ㅆ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "속눈썹이 길어요." },
  { word: "볼", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "볼이 빨개요." },
  { word: "뒤통수", targetPhonemes: ["ㄷ", "ㅌ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뒤통수를 만져요." },
  { word: "겨드랑이", targetPhonemes: ["ㄱ", "ㄷ", "ㄹ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "겨드랑이가 간지러워요." },
  { word: "손톱", targetPhonemes: ["ㅅ", "ㄴ", "ㅌ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "손톱을 깎아요." },
  { word: "발톱", targetPhonemes: ["ㅂ", "ㄹ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "발톱을 깎아요." },
  { word: "무릎", targetPhonemes: ["ㅁ", "ㄹ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "무릎이 아파요." },
  { word: "발뒤꿈치", targetPhonemes: ["ㅂ", "ㄹ", "ㄷ", "ㄲ", "ㅁ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "발뒤꿈치가 아파요." },
  { word: "갈비뼈", targetPhonemes: ["ㄱ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "갈비뼈가 있어요." },
  { word: "척추", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "척추를 펴요." },

  // ── 집·가구 심화 (Home/Furniture) ────────────────────────────────────────
  { word: "장롱", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "장롱에 옷을 넣어요." },
  { word: "세탁기", targetPhonemes: ["ㅅ", "ㅌ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "세탁기로 빨아요." },
  { word: "전자레인지", targetPhonemes: ["ㅈ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "전자레인지로 데워요." },
  { word: "가스레인지", targetPhonemes: ["ㄱ", "ㅅ", "ㄹ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "가스레인지로 끓여요." },
  { word: "커튼", targetPhonemes: ["ㅋ", "ㅌ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "커튼을 쳐요." },
  { word: "베개", targetPhonemes: ["ㅂ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "베개를 베어요." },
  { word: "이불", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "이불을 덮어요." },
  { word: "선풍기", targetPhonemes: ["ㅅ", "ㄴ", "ㅍ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "선풍기를 틀어요.", soundEffect: "윙윙" },
  { word: "에어컨", targetPhonemes: ["ㅋ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "에어컨이 시원해요." },
  { word: "화분", targetPhonemes: ["ㅎ", "ㅂ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "화분에 물을 줘요." },
  { word: "수도꼭지", targetPhonemes: ["ㅅ", "ㄷ", "ㄲ", "ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수도꼭지를 틀어요." },

  // ── 스포츠·놀이 (Sports/Play) ─────────────────────────────────────────────
  { word: "축구", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "축구를 해요." },
  { word: "농구", targetPhonemes: ["ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "농구를 해요." },
  { word: "야구", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "야구를 해요." },
  { word: "배구", targetPhonemes: ["ㅂ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "배구를 해요." },
  { word: "수영", targetPhonemes: ["ㅅ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "수영을 해요." },
  { word: "스키", targetPhonemes: ["ㅅ", "ㅋ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "스키를 타요." },
  { word: "스케이트", targetPhonemes: ["ㅅ", "ㅋ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "스케이트를 타요." },
  { word: "볼링", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "볼링을 해요." },
  { word: "훌라후프", targetPhonemes: ["ㅎ", "ㄹ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "훌라후프를 돌려요." },
  { word: "평행봉", targetPhonemes: ["ㅍ", "ㅇ", "ㅎ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "평행봉에서 운동해요." },

  // ── 직업 (Occupations) ────────────────────────────────────────────────────
  { word: "간호사", targetPhonemes: ["ㄱ", "ㄴ", "ㅎ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "간호사가 도와줘요." },
  { word: "소방관", targetPhonemes: ["ㅅ", "ㅂ", "ㄱ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "소방관이 불을 꺼요." },
  { word: "경찰관", targetPhonemes: ["ㄱ", "ㅊ", "ㄴ", "ㅇ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "경찰관이 지켜요." },
  { word: "조종사", targetPhonemes: ["ㅈ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "조종사가 비행기를 몰아요." },
  { word: "우주인", targetPhonemes: ["ㅈ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "우주인이 우주에 가요." },
  { word: "화가", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "화가가 그림을 그려요." },

  // ── 색깔 심화 (Colors) ────────────────────────────────────────────────────
  { word: "분홍색", targetPhonemes: ["ㅂ", "ㄴ", "ㅎ", "ㄱ", "ㅅ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "분홍색이 예뻐요." },
  { word: "주황색", targetPhonemes: ["ㅈ", "ㅎ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "주황색 당근이에요." },
  { word: "갈색", targetPhonemes: ["ㄱ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "갈색 곰이에요." },
  { word: "하늘색", targetPhonemes: ["ㅎ", "ㄴ", "ㄹ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "하늘색 하늘이에요." },
  { word: "금색", targetPhonemes: ["ㄱ", "ㅁ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "금색이 반짝여요." },
  { word: "은색", targetPhonemes: ["ㄴ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "은색이 빛나요." },
  { word: "연두색", targetPhonemes: ["ㄴ", "ㄷ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "연두색 새싹이에요." },
  { word: "자주색", targetPhonemes: ["ㅈ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "자주색 포도예요." },
  { word: "살구색", targetPhonemes: ["ㅅ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "살구색 얼굴이에요." },
  { word: "베이지", targetPhonemes: ["ㅂ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "베이지색 바지예요." },

  // ── 숫자·수학 개념 (Numbers/Math) ────────────────────────────────────────
  { word: "더하기", targetPhonemes: ["ㄷ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "더하기를 해요." },
  { word: "빼기", targetPhonemes: ["ㅃ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "빼기를 해요." },
  { word: "같아요", targetPhonemes: ["ㄱ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "같아요." },
  { word: "달라요", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "달라요." },

  // ── 감각·감정 심화 (Senses/Emotions) ────────────────────────────────────
  { word: "달콤해", targetPhonemes: ["ㄷ", "ㄹ", "ㅋ", "ㅁ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "달콤해요." },
  { word: "쓰디써", targetPhonemes: ["ㅆ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "쓰디써요." },
  { word: "새콤해", targetPhonemes: ["ㅅ", "ㅋ", "ㅁ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "새콤해요." },
  { word: "짭짤해", targetPhonemes: ["ㅉ", "ㅂ", "ㄹ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "짭짤해요." },
  { word: "고소해", targetPhonemes: ["ㄱ", "ㅅ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고소해요." },
  { word: "뜨거워", targetPhonemes: ["ㄸ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "뜨거워요." },
  { word: "차가워", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "차가워요." },
  { word: "부드러워", targetPhonemes: ["ㅂ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "부드러워요." },
  { word: "거칠어", targetPhonemes: ["ㄱ", "ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "거칠어요." },
  { word: "미끄러워", targetPhonemes: ["ㅁ", "ㄲ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "미끄러워요." },
  { word: "두근두근", targetPhonemes: ["ㄷ", "ㄱ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "두근두근해요.", soundEffect: "두근두근" },
  { word: "설레어", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "설레어요." },
  { word: "창피해", targetPhonemes: ["ㅊ", "ㅍ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "창피해요." },
  { word: "부러워", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "부러워요." },

  // ── 옷·의류 (Clothing) ────────────────────────────────────────────────────
  { word: "티셔츠", targetPhonemes: ["ㅌ", "ㅅ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "티셔츠를 입어요." },
  { word: "치마", targetPhonemes: ["ㅊ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "치마를 입어요." },
  { word: "조끼", targetPhonemes: ["ㅈ", "ㄲ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "조끼를 입어요." },
  { word: "잠옷", targetPhonemes: ["ㅈ", "ㅁ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "잠옷을 입어요." },
  { word: "목도리", targetPhonemes: ["ㅁ", "ㄱ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "목도리를 해요." },
  { word: "장갑", targetPhonemes: ["ㅈ", "ㄱ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "장갑을 껴요." },
  { word: "부츠", targetPhonemes: ["ㅂ", "ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "부츠를 신어요." },
  { word: "구두", targetPhonemes: ["ㄱ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "구두를 신어요." },

  // ── 장소 (Places) ─────────────────────────────────────────────────────────
  { word: "박물관", targetPhonemes: ["ㅂ", "ㄱ", "ㅁ", "ㄹ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "박물관에 가요." },
  { word: "미술관", targetPhonemes: ["ㅁ", "ㅅ", "ㄹ", "ㄱ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "미술관에 가요." },
  { word: "놀이공원", targetPhonemes: ["ㄴ", "ㄹ", "ㄱ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "놀이공원에 가요." },
  { word: "편의점", targetPhonemes: ["ㅍ", "ㄴ", "ㅈ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "편의점에 가요." },
  { word: "약국", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "약국에서 약을 사요." },
  { word: "우체국", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "우체국에서 편지를 부쳐요." },
  { word: "은행", targetPhonemes: ["ㄴ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "은행에서 돈을 찾아요." },
  { word: "공항", targetPhonemes: ["ㄱ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "공항에서 비행기를 타요." },
  { word: "항구", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "항구에 배가 있어요." },

  // ── 자연·환경 (Nature) ────────────────────────────────────────────────────
  { word: "돌멩이", targetPhonemes: ["ㄷ", "ㄹ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "돌멩이를 던져요." },
  { word: "조개", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "조개를 주워요." },
  { word: "모래성", targetPhonemes: ["ㅁ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "모래성을 쌓아요." },
  { word: "산봉우리", targetPhonemes: ["ㅅ", "ㄴ", "ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "산봉우리가 높아요." },
  { word: "계곡", targetPhonemes: ["ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "계곡이 시원해요." },
  { word: "폭포", targetPhonemes: ["ㅍ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "폭포가 떨어져요." },
  { word: "사막", targetPhonemes: ["ㅅ", "ㅁ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "사막이 뜨거워요." },
  { word: "열대우림", targetPhonemes: ["ㄹ", "ㄷ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "열대우림이 울창해요." },
  { word: "빙하", targetPhonemes: ["ㅂ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "빙하가 녹아요." },

  // ── 식물 (Plants) ─────────────────────────────────────────────────────────
  { word: "민들레", targetPhonemes: ["ㅁ", "ㄴ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "민들레가 피었어요." },
  { word: "튤립", targetPhonemes: ["ㅌ", "ㄹ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "튤립이 예뻐요." },
  { word: "장미", targetPhonemes: ["ㅈ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "장미가 빨개요." },
  { word: "벚꽃", targetPhonemes: ["ㅂ", "ㅊ", "ㄲ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "벚꽃이 예뻐요." },
  { word: "코스모스", targetPhonemes: ["ㅋ", "ㅅ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "코스모스가 흔들려요." },
  { word: "수선화", targetPhonemes: ["ㅅ", "ㄴ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수선화가 예뻐요." },
  { word: "선인장", targetPhonemes: ["ㅅ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "선인장이 뾰족해요." },
  { word: "이끼", targetPhonemes: ["ㄲ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "이끼가 초록색이에요." },
  { word: "단풍잎", targetPhonemes: ["ㄷ", "ㄴ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "단풍잎이 빨개요." },
  { word: "소나무", targetPhonemes: ["ㅅ", "ㄴ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "소나무가 늘 푸르러요." },
  { word: "느티나무", targetPhonemes: ["ㄴ", "ㅌ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "느티나무가 시원해요." },
  { word: "넝쿨", targetPhonemes: ["ㄴ", "ㅋ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "넝쿨이 벽을 타요." },

  // ── 날씨·계절 심화 (Seasons/Weather) ────────────────────────────────────
  { word: "태풍", targetPhonemes: ["ㅌ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "태풍이 강해요." },
  { word: "홍수", targetPhonemes: ["ㅎ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "홍수가 났어요." },
  { word: "가뭄", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "가뭄이 들었어요." },
  { word: "눈보라", targetPhonemes: ["ㄴ", "ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "눈보라가 쳐요." },
  { word: "비구름", targetPhonemes: ["ㅂ", "ㄱ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "비구름이 왔어요." },
  { word: "황사", targetPhonemes: ["ㅎ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "황사가 심해요." },
  { word: "결빙", targetPhonemes: ["ㄱ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "도로가 결빙됐어요." },

  // ── 우주·과학 (Space/Science) ─────────────────────────────────────────────
  { word: "별", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "별이 반짝여요." },
  { word: "화성", targetPhonemes: ["ㅎ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "화성이 빨개요." },
  { word: "목성", targetPhonemes: ["ㅁ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "목성이 커요." },
  { word: "토성", targetPhonemes: ["ㅌ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "토성에 고리가 있어요." },
  { word: "혜성", targetPhonemes: ["ㅎ", "ㅅ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "혜성이 지나가요." },
  { word: "은하수", targetPhonemes: ["ㄴ", "ㅎ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "은하수가 아름다워요." },
  { word: "자석", targetPhonemes: ["ㅈ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "자석이 붙어요." },
  { word: "전기", targetPhonemes: ["ㅈ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "전기를 아껴요." },
  { word: "실험", targetPhonemes: ["ㅅ", "ㄹ", "ㅎ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "실험을 해요." },
  { word: "돋보기", targetPhonemes: ["ㄷ", "ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "돋보기로 봐요." },

  // ── 악기 (Musical Instruments) ───────────────────────────────────────────
  { word: "기타", targetPhonemes: ["ㄱ", "ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "기타를 쳐요.", soundEffect: "둥둥" },
  { word: "첼로", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "첼로를 켜요." },
  { word: "트럼펫", targetPhonemes: ["ㅌ", "ㄹ", "ㅁ", "ㅍ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "트럼펫을 불어요.", soundEffect: "빠라밤" },
  { word: "드럼", targetPhonemes: ["ㄷ", "ㄹ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "드럼을 쳐요.", soundEffect: "둥둥" },
  { word: "심벌즈", targetPhonemes: ["ㅅ", "ㅁ", "ㅂ", "ㄹ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "심벌즈를 쳐요.", soundEffect: "쨍" },
  { word: "하모니카", targetPhonemes: ["ㅎ", "ㅁ", "ㄴ", "ㅋ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "하모니카를 불어요." },
  { word: "북", targetPhonemes: ["ㅂ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "북을 쳐요.", soundEffect: "둥둥" },

  // ── 미술·공작 (Art/Craft) ─────────────────────────────────────────────────
  { word: "종이접기", targetPhonemes: ["ㅈ", "ㅇ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "종이접기를 해요." },
  { word: "꼴라주", targetPhonemes: ["ㄲ", "ㄹ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "꼴라주를 만들어요." },
  { word: "도자기", targetPhonemes: ["ㄷ", "ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "도자기를 만들어요." },
  { word: "스텐실", targetPhonemes: ["ㅅ", "ㅌ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "스텐실로 꾸며요." },
  { word: "뜨개질", targetPhonemes: ["ㄸ", "ㄱ", "ㅈ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "뜨개질을 해요." },
  { word: "자수", targetPhonemes: ["ㅈ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "자수를 놓아요." },
  { word: "비즈공예", targetPhonemes: ["ㅂ", "ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "비즈공예를 해요." },
  { word: "목공예", targetPhonemes: ["ㅁ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "목공예를 해요." },

  // ── 동작 동사 심화 (Action Verbs) ────────────────────────────────────────
  { word: "두드려", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "문을 두드려요.", soundEffect: "똑똑" },
  { word: "굴려", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "공을 굴려요." },
  { word: "던져", targetPhonemes: ["ㄷ", "ㄴ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "공을 던져요." },
  { word: "받아", targetPhonemes: ["ㅂ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "공을 받아요." },
  { word: "당겨", targetPhonemes: ["ㄷ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "당겨요." },
  { word: "돌려", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "돌려요." },
  { word: "흔들어", targetPhonemes: ["ㅎ", "ㄴ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "흔들어요." },
  { word: "구부려", targetPhonemes: ["ㄱ", "ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "구부려요." },
  { word: "접어", targetPhonemes: ["ㅈ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "접어요." },
  { word: "끼워", targetPhonemes: ["ㄲ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "끼워요." },
  { word: "빠져", targetPhonemes: ["ㅃ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빠져요." },
  { word: "올라가", targetPhonemes: ["ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "올라가요." },
  { word: "내려가", targetPhonemes: ["ㄴ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "내려가요." },
  { word: "건너", targetPhonemes: ["ㄱ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "건너요." },
  { word: "통과해", targetPhonemes: ["ㅌ", "ㄱ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "통과해요." },

  // ── 반대말 쌍 (Antonyms) ──────────────────────────────────────────────────
  { word: "무겁다", targetPhonemes: ["ㅁ", "ㄱ", "ㅂ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "돌이 무겁다." },
  { word: "가볍다", targetPhonemes: ["ㄱ", "ㅂ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "깃털이 가볍다." },
  { word: "빠르다", targetPhonemes: ["ㅃ", "ㄹ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "치타가 빠르다." },
  { word: "느리다", targetPhonemes: ["ㄴ", "ㄹ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "거북이가 느리다." },
  { word: "많다", targetPhonemes: ["ㅁ", "ㄴ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "별이 많다." },
  { word: "적다", targetPhonemes: ["ㅈ", "ㄱ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "물이 적다." },

  // ── 사회성·예절 (Social Skills) ───────────────────────────────────────────
  { word: "감사해", targetPhonemes: ["ㄱ", "ㅁ", "ㅅ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "감사해요." },
  { word: "죄송해", targetPhonemes: ["ㅈ", "ㅅ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "죄송해요." },
  { word: "실례해", targetPhonemes: ["ㅅ", "ㄹ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "실례해요." },
  { word: "기다려", targetPhonemes: ["ㄱ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "기다려요." },
  { word: "차례차례", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "차례차례 해요." },
  { word: "나눠요", targetPhonemes: ["ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "친구와 나눠요." },
  { word: "도와줘", targetPhonemes: ["ㄷ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "도와줘요." },
  { word: "함께해", targetPhonemes: ["ㅎ", "ㅁ", "ㄲ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "함께해요." },
  { word: "배려해", targetPhonemes: ["ㅂ", "ㄹ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "배려해요." },

  // ── 건강·위생 (Health/Hygiene) ────────────────────────────────────────────
  { word: "양치질", targetPhonemes: ["ㅇ", "ㅊ", "ㅈ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "양치질을 해요." },
  { word: "손발씻기", targetPhonemes: ["ㅅ", "ㄴ", "ㅂ", "ㄹ", "ㅆ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "손발을 씻어요." },
  { word: "샤워", targetPhonemes: ["ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "샤워를 해요." },
  { word: "목욕", targetPhonemes: ["ㅁ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "목욕을 해요." },
  { word: "비누", targetPhonemes: ["ㅂ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "비누로 씻어요." },
  { word: "수건", targetPhonemes: ["ㅅ", "ㄱ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "수건으로 닦아요." },
  { word: "체온계", targetPhonemes: ["ㅊ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "체온계로 재요." },
  { word: "반창고", targetPhonemes: ["ㅂ", "ㄴ", "ㅊ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "반창고를 붙여요." },
  { word: "주사", targetPhonemes: ["ㅈ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "주사를 맞아요." },
  { word: "약", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "약을 먹어요." },
  { word: "기침", targetPhonemes: ["ㄱ", "ㅊ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "기침이 나요." },
  { word: "재채기", targetPhonemes: ["ㅈ", "ㅊ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "재채기가 나와요.", soundEffect: "에취" },

  // ── 계절별 활동 (Seasonal Activities) ────────────────────────────────────
  { word: "벚꽃놀이", targetPhonemes: ["ㅂ", "ㅊ", "ㄲ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "벚꽃놀이를 가요." },
  { word: "단풍구경", targetPhonemes: ["ㄷ", "ㄴ", "ㅍ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "단풍구경을 가요." },
  { word: "낙엽밟기", targetPhonemes: ["ㄴ", "ㄱ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "낙엽밟기를 해요.", soundEffect: "사각사각" },
  { word: "썰매타기", targetPhonemes: ["ㅆ", "ㄹ", "ㅁ", "ㅌ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "썰매타기를 해요." },
  { word: "눈싸움", targetPhonemes: ["ㄴ", "ㅆ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "눈싸움을 해요." },
  { word: "모래놀이", targetPhonemes: ["ㅁ", "ㄹ", "ㄴ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "모래놀이를 해요." },

  // ── 이야기·동화 속 단어 (Fairy Tale Words) ───────────────────────────────
  { word: "마법사", targetPhonemes: ["ㅁ", "ㅂ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마법사가 마법을 써요." },
  { word: "용", targetPhonemes: ["ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "용이 불을 뿜어요.", soundEffect: "푸아~" },
  { word: "요정", targetPhonemes: ["ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "요정이 날아요." },
  { word: "마녀", targetPhonemes: ["ㅁ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "마녀가 빗자루를 타요." },
  { word: "왕자", targetPhonemes: ["ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "왕자가 멋져요." },
  { word: "공주", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "공주가 예뻐요." },
  { word: "기사", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "기사가 용감해요." },
  { word: "거인", targetPhonemes: ["ㄱ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "거인이 커요." },
  { word: "난쟁이", targetPhonemes: ["ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "난쟁이가 작아요." },
  { word: "보물", targetPhonemes: ["ㅂ", "ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "보물을 찾아요." },
  { word: "성", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "성이 커요." },
  { word: "성곽", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "성곽이 튼튼해요." },

  // ── 하루 일과 (Daily Routine) ─────────────────────────────────────────────
  { word: "일어나기", targetPhonemes: ["ㄹ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "아침에 일어나요." },
  { word: "세수하기", targetPhonemes: ["ㅅ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "세수를 해요." },
  { word: "밥먹기", targetPhonemes: ["ㅂ", "ㅁ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "밥을 먹어요." },
  { word: "가방싸기", targetPhonemes: ["ㄱ", "ㅂ", "ㅆ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "가방을 싸요." },
  { word: "등교하기", targetPhonemes: ["ㄷ", "ㄱ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "학교에 가요." },
  { word: "하교하기", targetPhonemes: ["ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "학교에서 와요." },
  { word: "숙제하기", targetPhonemes: ["ㅅ", "ㄱ", "ㅈ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "숙제를 해요." },
  { word: "잠자기", targetPhonemes: ["ㅈ", "ㅁ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "잠을 자요." },

  // ── 한국 전통·문화 (Korean Culture) ──────────────────────────────────────
  { word: "한복", targetPhonemes: ["ㅎ", "ㄴ", "ㅂ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "한복이 예뻐요." },
  { word: "태극기", targetPhonemes: ["ㅌ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "태극기를 흔들어요." },
  { word: "김치", targetPhonemes: ["ㄱ", "ㅁ", "ㅊ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "김치가 맛있어요." },
  { word: "한옥", targetPhonemes: ["ㅎ", "ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "한옥이 멋져요." },
  { word: "기와", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "기와가 있어요." },
  { word: "장구", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "장구를 쳐요.", soundEffect: "쿵덕쿵" },
  { word: "가야금", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "가야금을 타요." },
  { word: "탈춤", targetPhonemes: ["ㅌ", "ㄹ", "ㅊ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "탈춤을 춰요." },
  { word: "부채", targetPhonemes: ["ㅂ", "ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "부채를 흔들어요." },
  { word: "연날리기", targetPhonemes: ["ㄹ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "연을 날려요." },
  { word: "윷놀이", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "윷놀이를 해요." },
  { word: "제기차기", targetPhonemes: ["ㅈ", "ㄱ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "제기차기를 해요." },
  { word: "씨름", targetPhonemes: ["ㅆ", "ㄹ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "씨름을 해요." },
  { word: "설날", targetPhonemes: ["ㅅ", "ㄹ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "설날에 떡국을 먹어요." },
  { word: "추석", targetPhonemes: ["ㅊ", "ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "추석에 송편을 먹어요." },
  { word: "송편", targetPhonemes: ["ㅅ", "ㅍ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "송편이 맛있어요." },

  // ── 음식 심화 (Advanced Food) ─────────────────────────────────────────────
  { word: "떡볶이", targetPhonemes: ["ㄸ", "ㄱ", "ㅂ", "ㄲ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "떡볶이가 매워요." },
  { word: "불고기", targetPhonemes: ["ㅂ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "불고기가 맛있어요." },
  { word: "순두부", targetPhonemes: ["ㅅ", "ㄴ", "ㄷ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "순두부를 먹어요." },
  { word: "칼국수", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "칼국수가 따뜻해요." },
  { word: "된장국", targetPhonemes: ["ㄷ", "ㄴ", "ㅈ", "ㅇ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "된장국이 맛있어요." },
  { word: "오믈렛", targetPhonemes: ["ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "오믈렛을 먹어요." },
  { word: "샌드위치", targetPhonemes: ["ㅅ", "ㄴ", "ㄷ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "샌드위치를 먹어요." },
  { word: "햄버거", targetPhonemes: ["ㅎ", "ㅁ", "ㅂ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "햄버거를 먹어요." },
  { word: "팝콘", targetPhonemes: ["ㅍ", "ㅂ", "ㅋ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "팝콘을 먹어요.", soundEffect: "팡팡" },

  // ── 동물 심화 (Advanced Animals) ─────────────────────────────────────────
  { word: "공작새", targetPhonemes: ["ㄱ", "ㅇ", "ㅈ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "공작새가 예뻐요." },
  { word: "플라밍고", targetPhonemes: ["ㅍ", "ㄹ", "ㅁ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "플라밍고가 분홍이에요." },
  { word: "두루미", targetPhonemes: ["ㄷ", "ㄹ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "두루미가 날아요." },
  { word: "까치", targetPhonemes: ["ㄲ", "ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "까치가 울어요.", soundEffect: "까악까악" },
  { word: "제비", targetPhonemes: ["ㅈ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "제비가 날아요." },
  { word: "박쥐", targetPhonemes: ["ㅂ", "ㄱ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "박쥐가 날아요." },
  { word: "두더지", targetPhonemes: ["ㄷ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "두더지가 땅을 파요." },
  { word: "오소리", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "오소리가 걸어요." },
  { word: "해마", targetPhonemes: ["ㅎ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "해마가 귀여워요." },
  { word: "가오리", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "가오리가 헤엄쳐요." },
  { word: "복어", targetPhonemes: ["ㅂ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "복어가 부풀어요." },
  { word: "뱀장어", targetPhonemes: ["ㅂ", "ㅁ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뱀장어가 길어요." },
  { word: "전갈", targetPhonemes: ["ㅈ", "ㄴ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "전갈이 무서워요." },
  { word: "타란툴라", targetPhonemes: ["ㅌ", "ㄹ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "타란툴라가 커요." },
  { word: "이구아나", targetPhonemes: ["ㄱ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "이구아나가 햇볕을 쬐어요." },
  { word: "알파카", targetPhonemes: ["ㄹ", "ㅍ", "ㅋ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "알파카 털이 복슬복슬해요." },
  { word: "재규어", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "재규어가 빨라요." },
  { word: "치타", targetPhonemes: ["ㅊ", "ㅌ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "치타가 빨라요." },
  { word: "망고새", targetPhonemes: ["ㅁ", "ㅇ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "망고새가 예뻐요." },
  { word: "홍학", targetPhonemes: ["ㅎ", "ㅇ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "홍학이 분홍이에요." },
  { word: "왜가리", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "왜가리가 서 있어요." },

  // ── 직업 심화 (Advanced Occupations) ─────────────────────────────────────
  { word: "수의사", targetPhonemes: ["ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수의사가 동물을 치료해요." },
  { word: "약사", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "약사가 약을 줘요." },
  { word: "건축가", targetPhonemes: ["ㄱ", "ㄴ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "건축가가 집을 설계해요." },
  { word: "작가", targetPhonemes: ["ㅈ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "작가가 책을 써요." },
  { word: "기자", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "기자가 소식을 전해요." },
  { word: "우체부", targetPhonemes: ["ㅊ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "우체부가 편지를 가져요." },
  { word: "파일럿", targetPhonemes: ["ㅍ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "파일럿이 비행기를 몰아요." },
  { word: "선장", targetPhonemes: ["ㅅ", "ㄴ", "ㅈ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "선장이 배를 몰아요." },
  { word: "우주비행사", targetPhonemes: ["ㅇ", "ㅈ", "ㅂ", "ㅎ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "우주비행사가 우주에 가요." },

  // ── 스포츠·운동 심화 (Advanced Sports) ───────────────────────────────────
  { word: "농구", targetPhonemes: ["ㄴ", "ㅇ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "농구를 해요." },
  { word: "배구", targetPhonemes: ["ㅂ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "배구를 해요." },
  { word: "테니스", targetPhonemes: ["ㅌ", "ㄴ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "테니스를 쳐요." },
  { word: "골프", targetPhonemes: ["ㄱ", "ㄹ", "ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "골프를 쳐요." },
  { word: "권투", targetPhonemes: ["ㄱ", "ㄴ", "ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "권투를 해요." },
  { word: "유도", targetPhonemes: ["ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "유도를 해요." },
  { word: "스케이팅", targetPhonemes: ["ㅅ", "ㅋ", "ㅇ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "스케이팅을 해요." },
  { word: "서핑", targetPhonemes: ["ㅅ", "ㅍ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "서핑을 해요." },
  { word: "사이클", targetPhonemes: ["ㅅ", "ㅋ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "사이클을 타요." },
  { word: "마라톤", targetPhonemes: ["ㅁ", "ㄹ", "ㅌ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마라톤을 달려요." },
  { word: "양궁", targetPhonemes: ["ㅇ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "양궁을 해요." },
  { word: "펜싱", targetPhonemes: ["ㅍ", "ㄴ", "ㅅ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "펜싱을 해요." },
  { word: "역도", targetPhonemes: ["ㄱ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "역도를 해요." },

  // ── 여행·장소 (Travel/Places) ─────────────────────────────────────────────
  { word: "공항", targetPhonemes: ["ㄱ", "ㅇ", "ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "공항에서 비행기를 타요." },
  { word: "버스터미널", targetPhonemes: ["ㅂ", "ㅅ", "ㅌ", "ㅁ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "버스터미널에서 버스를 타요." },
  { word: "항구", targetPhonemes: ["ㅎ", "ㅇ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "항구에 배가 있어요." },
  { word: "등대", targetPhonemes: ["ㄷ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "등대가 빛나요." },
  { word: "식물원", targetPhonemes: ["ㅅ", "ㄱ", "ㅁ", "ㄹ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "식물원에 꽃이 많아요." },
  { word: "캠핑장", targetPhonemes: ["ㅋ", "ㅁ", "ㅍ", "ㅇ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "캠핑장에서 자요." },
  { word: "계곡", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "계곡이 시원해요." },
  { word: "동굴", targetPhonemes: ["ㄷ", "ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "동굴 안이 어두워요." },
  { word: "절", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "절에서 절을 해요." },
  { word: "교회", targetPhonemes: ["ㄱ", "ㅎ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "교회에 가요." },
  { word: "시장", targetPhonemes: ["ㅅ", "ㅈ", "ㅇ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "시장에서 사요." },
  { word: "백화점", targetPhonemes: ["ㅂ", "ㄱ", "ㅎ", "ㅈ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "백화점에서 옷을 사요." },
  { word: "세탁소", targetPhonemes: ["ㅅ", "ㅌ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "세탁소에 맡겨요." },

  // ── 기술·전자기기 (Technology) ────────────────────────────────────────────
  { word: "컴퓨터", targetPhonemes: ["ㅋ", "ㅁ", "ㅍ", "ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "컴퓨터로 해요." },
  { word: "태블릿", targetPhonemes: ["ㅌ", "ㅂ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "태블릿으로 봐요." },
  { word: "스마트폰", targetPhonemes: ["ㅅ", "ㅁ", "ㅍ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "스마트폰으로 전화해요." },
  { word: "충전기", targetPhonemes: ["ㅊ", "ㅇ", "ㅈ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "충전기에 꽂아요." },
  { word: "이어폰", targetPhonemes: ["ㅍ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "이어폰을 끼워요." },
  { word: "카메라", targetPhonemes: ["ㅋ", "ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "카메라로 찍어요." },
  { word: "로봇", targetPhonemes: ["ㄹ", "ㅂ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "로봇이 움직여요.", soundEffect: "삐삐" },
  { word: "드론", targetPhonemes: ["ㄷ", "ㄹ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "드론이 날아요." },
  { word: "프린터", targetPhonemes: ["ㅍ", "ㄹ", "ㄴ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "프린터로 인쇄해요." },
  { word: "키보드", targetPhonemes: ["ㅋ", "ㅂ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "키보드를 두드려요.", soundEffect: "딸깍딸깍" },
  { word: "마우스", targetPhonemes: ["ㅁ", "ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "마우스를 클릭해요." },
  { word: "이메일", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "이메일을 보내요." },
  { word: "인터넷", targetPhonemes: ["ㄴ", "ㅌ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "인터넷을 해요." },
  { word: "게임기", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "게임기로 놀아요." },

  // ── 감정·표현 심화 (Advanced Emotions) ───────────────────────────────────
  { word: "신나요", targetPhonemes: ["ㅅ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "신나요!" },
  { word: "설레요", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "설레요." },
  { word: "부끄러워요", targetPhonemes: ["ㅂ", "ㄲ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "부끄러워요." },
  { word: "지루해요", targetPhonemes: ["ㅈ", "ㄹ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "지루해요." },
  { word: "당황해요", targetPhonemes: ["ㄷ", "ㅇ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "당황해요." },
  { word: "자랑스러워요", targetPhonemes: ["ㅈ", "ㄹ", "ㅅ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "자랑스러워요." },
  { word: "그리워요", targetPhonemes: ["ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "그리워요." },
  { word: "힘들어요", targetPhonemes: ["ㅎ", "ㅁ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "힘들어요." },
  { word: "걱정돼요", targetPhonemes: ["ㄱ", "ㅈ", "ㅇ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "걱정돼요." },
  { word: "안심해요", targetPhonemes: ["ㄴ", "ㅅ", "ㅁ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "안심해요." },
  { word: "피곤해요", targetPhonemes: ["ㅍ", "ㄱ", "ㄴ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "피곤해요." },
  { word: "배고파요", targetPhonemes: ["ㅂ", "ㄱ", "ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "배고파요." },
  { word: "목말라요", targetPhonemes: ["ㅁ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "목말라요." },
  { word: "졸려요", targetPhonemes: ["ㅈ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "졸려요." },

  // ── 방향·위치 (Direction/Position) ───────────────────────────────────────
  { word: "왼쪽", targetPhonemes: ["ㄴ", "ㅉ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "왼쪽으로 가요." },
  { word: "오른쪽", targetPhonemes: ["ㄹ", "ㄴ", "ㅉ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "오른쪽으로 가요." },
  { word: "가운데", targetPhonemes: ["ㄱ", "ㄴ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "가운데에 있어요." },
  { word: "밖", targetPhonemes: ["ㅂ", "ㄲ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밖에 있어요." },
  { word: "사이", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "사이에 있어요." },
  { word: "북쪽", targetPhonemes: ["ㅂ", "ㄱ", "ㅉ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "북쪽으로 가요." },
  { word: "남쪽", targetPhonemes: ["ㄴ", "ㅁ", "ㅉ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "남쪽으로 가요." },

  // ── 모양·무늬 (Shapes/Patterns) ──────────────────────────────────────────
  { word: "동그라미", targetPhonemes: ["ㄷ", "ㄱ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "동그라미를 그려요." },
  { word: "별모양", targetPhonemes: ["ㅂ", "ㄹ", "ㅁ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "별모양을 그려요." },
  { word: "하트", targetPhonemes: ["ㅎ", "ㅌ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "하트를 그려요." },
  { word: "다이아몬드", targetPhonemes: ["ㄷ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "다이아몬드 모양이에요." },
  { word: "줄무늬", targetPhonemes: ["ㅈ", "ㄹ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "줄무늬가 있어요." },
  { word: "물결무늬", targetPhonemes: ["ㅁ", "ㄹ", "ㄱ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "물결무늬가 예뻐요." },
  { word: "체크무늬", targetPhonemes: ["ㅊ", "ㅋ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "체크무늬 옷이에요." },
  { word: "점박이", targetPhonemes: ["ㅈ", "ㅁ", "ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "점박이 무늬예요." },
  { word: "구불구불", targetPhonemes: ["ㄱ", "ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "구불구불 선이에요.", soundEffect: "구불구불" },
  { word: "반짝반짝", targetPhonemes: ["ㅂ", "ㄴ", "ㅉ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "반짝반짝 빛나요.", soundEffect: "반짝반짝" },

  // ── 신체 심화 (Advanced Body Parts) ──────────────────────────────────────
  { word: "콧구멍", targetPhonemes: ["ㄱ", "ㅅ", "ㅁ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "콧구멍이 두 개예요." },
  { word: "귓볼", targetPhonemes: ["ㄱ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "귓볼을 잡아요." },
  { word: "손목", targetPhonemes: ["ㅅ", "ㄴ", "ㅁ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "손목을 돌려요." },
  { word: "손바닥", targetPhonemes: ["ㅅ", "ㄴ", "ㅂ", "ㄷ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "손바닥을 펴요." },
  { word: "발바닥", targetPhonemes: ["ㅂ", "ㄹ", "ㄷ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "발바닥이 간지러워요." },
  { word: "엄지", targetPhonemes: ["ㅁ", "ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "엄지를 들어요." },
  { word: "검지", targetPhonemes: ["ㄱ", "ㅁ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "검지로 가리켜요." },
  { word: "약지", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "약지에 반지를 껴요." },
  { word: "새끼손가락", targetPhonemes: ["ㅅ", "ㄲ", "ㄴ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "새끼손가락이 작아요." },

  // ── 색깔·빛 심화 (Advanced Colors/Light) ─────────────────────────────────
  { word: "금색", targetPhonemes: ["ㄱ", "ㅁ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "금색이 반짝여요." },
  { word: "은색", targetPhonemes: ["ㄴ", "ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "은색이 빛나요." },
  { word: "하늘색", targetPhonemes: ["ㅎ", "ㄴ", "ㄹ", "ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "하늘색이 예뻐요." },
  { word: "연두색", targetPhonemes: ["ㄴ", "ㄷ", "ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "연두색 풀이에요." },
  { word: "보라색", targetPhonemes: ["ㅂ", "ㄹ", "ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "보라색 꽃이에요." },
  { word: "갈색", targetPhonemes: ["ㄱ", "ㄹ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "갈색 곰이에요." },
  { word: "베이지색", targetPhonemes: ["ㅂ", "ㅈ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "베이지색 벽이에요." },
  { word: "투명", targetPhonemes: ["ㅌ", "ㅁ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "유리가 투명해요." },
  { word: "무지개색", targetPhonemes: ["ㅁ", "ㅈ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "무지개색이 예뻐요." },

  // ── 시간·날짜 (Time/Date) ─────────────────────────────────────────────────
  { word: "자정", targetPhonemes: ["ㅈ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "자정에는 자요." },
  { word: "새벽", targetPhonemes: ["ㅅ", "ㅂ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "새벽에는 어두워요." },
  { word: "모레", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "모레에 가요." },
  { word: "그저께", targetPhonemes: ["ㄱ", "ㅈ", "ㄲ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "그저께 왔어요." },
  { word: "일주일", targetPhonemes: ["ㄹ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "일주일 후에 가요." },
  { word: "한달", targetPhonemes: ["ㅎ", "ㄴ", "ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "한달이 지났어요." },

  // ── 한국어 의성어·의태어 심화 ────────────────────────────────────────────
  { word: "쿵쾅쿵쾅", targetPhonemes: ["ㅋ", "ㅇ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "쿵쾅쿵쾅 뛰어요.", soundEffect: "쿵쾅쿵쾅" },
  { word: "달그락달그락", targetPhonemes: ["ㄷ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "달그락달그락 소리나요.", soundEffect: "달그락달그락" },
  { word: "찰랑찰랑", targetPhonemes: ["ㅊ", "ㄹ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "물이 찰랑찰랑해요.", soundEffect: "찰랑찰랑" },
  { word: "뽀글뽀글", targetPhonemes: ["ㅃ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "국이 뽀글뽀글해요.", soundEffect: "뽀글뽀글" },
  { word: "쫄깃쫄깃", targetPhonemes: ["ㅉ", "ㄹ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "떡이 쫄깃쫄깃해요.", soundEffect: "쫄깃쫄깃" },
  { word: "보슬보슬", targetPhonemes: ["ㅂ", "ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "비가 보슬보슬 내려요.", soundEffect: "보슬보슬" },
  { word: "주룩주룩", targetPhonemes: ["ㅈ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "비가 주룩주룩 내려요.", soundEffect: "주룩주룩" },
  { word: "엉금엉금", targetPhonemes: ["ㅇ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "거북이가 엉금엉금 기어요.", soundEffect: "엉금엉금" },
  { word: "뒤뚱뒤뚱", targetPhonemes: ["ㄷ", "ㅇ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "펭귄이 뒤뚱뒤뚱 걸어요.", soundEffect: "뒤뚱뒤뚱" },
  { word: "깡충깡충", targetPhonemes: ["ㄲ", "ㅇ", "ㅊ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "토끼가 깡충깡충 뛰어요.", soundEffect: "깡충깡충" },
  { word: "알록달록", targetPhonemes: ["ㄹ", "ㄱ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "알록달록 꽃이 피었어요." },
  { word: "새콤달콤", targetPhonemes: ["ㅅ", "ㅋ", "ㅁ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "새콤달콤 맛이에요." },
  { word: "달달하다", targetPhonemes: ["ㄷ", "ㄹ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "사탕이 달달해요." },
  { word: "싱싱해요", targetPhonemes: ["ㅅ", "ㅇ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "과일이 싱싱해요." },

  // ── 과일·채소 심화 (Advanced Fruits/Vegetables) ───────────────────────────
  { word: "멜론", targetPhonemes: ["ㅁ", "ㄹ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "멜론이 달아요." },
  { word: "파인애플", targetPhonemes: ["ㅍ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "파인애플이 달아요." },
  { word: "망고", targetPhonemes: ["ㅁ", "ㅇ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "망고가 달아요." },
  { word: "코코넛", targetPhonemes: ["ㅋ", "ㄴ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "코코넛을 마셔요." },
  { word: "리치", targetPhonemes: ["ㄹ", "ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "리치가 달아요." },
  { word: "자두", targetPhonemes: ["ㅈ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "자두가 새콤해요." },
  { word: "살구", targetPhonemes: ["ㅅ", "ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "살구가 노래요." },
  { word: "모과", targetPhonemes: ["ㅁ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "모과차가 향기로워요." },
  { word: "고추", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "고추가 매워요." },
  { word: "피망", targetPhonemes: ["ㅍ", "ㅁ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "피망이 달아요." },
  { word: "아스파라거스", targetPhonemes: ["ㅅ", "ㅍ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "아스파라거스를 먹어요." },
  { word: "브로콜리", targetPhonemes: ["ㅂ", "ㄹ", "ㅋ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "브로콜리를 먹어요." },
  { word: "셀러리", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "셀러리를 먹어요." },
  { word: "버섯", targetPhonemes: ["ㅂ", "ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "버섯이 맛있어요." },
  { word: "콩나물", targetPhonemes: ["ㅋ", "ㅇ", "ㄴ", "ㅁ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "콩나물을 먹어요." },
  { word: "두부", targetPhonemes: ["ㄷ", "ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "두부를 먹어요." },
  { word: "생강", targetPhonemes: ["ㅅ", "ㅇ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "생강차를 마셔요." },
  { word: "파", targetPhonemes: ["ㅍ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "파가 있어요." },
  { word: "양파", targetPhonemes: ["ㅇ", "ㅍ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "양파를 잘라요." },
  { word: "대파", targetPhonemes: ["ㄷ", "ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "대파를 넣어요." },
  { word: "쪽파", targetPhonemes: ["ㅉ", "ㄱ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "쪽파를 올려요." },

  // ── 집·가구 심화 (Advanced Home/Furniture) ────────────────────────────────
  { word: "다락방", targetPhonemes: ["ㄷ", "ㄹ", "ㄱ", "ㅂ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "다락방에 올라가요." },
  { word: "지하실", targetPhonemes: ["ㅈ", "ㅎ", "ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "지하실이 어두워요." },
  { word: "발코니", targetPhonemes: ["ㅂ", "ㄹ", "ㅋ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "발코니에 꽃이 있어요." },
  { word: "창고", targetPhonemes: ["ㅊ", "ㅇ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "창고에 넣어요." },
  { word: "다용도실", targetPhonemes: ["ㄷ", "ㅇ", "ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "다용도실에 있어요." },
  { word: "붙박이장", targetPhonemes: ["ㅂ", "ㄱ", "ㅈ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "붙박이장에 넣어요." },
  { word: "서랍장", targetPhonemes: ["ㅅ", "ㄹ", "ㅂ", "ㅈ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "서랍장에 넣어요." },
  { word: "식탁", targetPhonemes: ["ㅅ", "ㄱ", "ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "식탁에 앉아요." },
  { word: "옷걸이", targetPhonemes: ["ㅅ", "ㄱ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "옷걸이에 걸어요." },
  { word: "빨래건조대", targetPhonemes: ["ㅃ", "ㄹ", "ㄱ", "ㄴ", "ㅈ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "빨래건조대에 널어요." },
  { word: "세탁기", targetPhonemes: ["ㅅ", "ㅌ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "세탁기를 돌려요.", soundEffect: "웅웅" },

  // ── 자연·환경 심화 (Advanced Nature/Environment) ──────────────────────────
  { word: "오로라", targetPhonemes: ["ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "오로라가 아름다워요." },
  { word: "황사", targetPhonemes: ["ㅎ", "ㅇ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "황사가 날아요." },
  { word: "미세먼지", targetPhonemes: ["ㅁ", "ㅅ", "ㄴ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "미세먼지가 많아요." },
  { word: "서리", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "서리가 내렸어요." },
  { word: "이슬", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "이슬이 맺혔어요." },
  { word: "사막", targetPhonemes: ["ㅅ", "ㅁ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "사막이 더워요." },
  { word: "초원", targetPhonemes: ["ㅊ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "초원이 넓어요." },
  { word: "툰드라", targetPhonemes: ["ㅌ", "ㄴ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "툰드라는 추워요." },
  { word: "맹그로브", targetPhonemes: ["ㅁ", "ㅇ", "ㄱ", "ㄹ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "맹그로브 숲이에요." },
  { word: "산호초", targetPhonemes: ["ㅅ", "ㄴ", "ㅎ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "산호초가 예뻐요." },

  // ── 교통·이동 심화 (Advanced Transport) ───────────────────────────────────
  { word: "고속버스", targetPhonemes: ["ㄱ", "ㅅ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고속버스를 타요." },
  { word: "시내버스", targetPhonemes: ["ㅅ", "ㄴ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "시내버스를 타요." },
  { word: "마을버스", targetPhonemes: ["ㅁ", "ㄹ", "ㅂ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마을버스를 타요." },
  { word: "급행열차", targetPhonemes: ["ㄱ", "ㅂ", "ㅎ", "ㄹ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "급행열차가 빨라요." },
  { word: "모노레일", targetPhonemes: ["ㅁ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "모노레일을 타요." },
  { word: "유람선", targetPhonemes: ["ㄹ", "ㅅ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "유람선을 타요." },
  { word: "열기구", targetPhonemes: ["ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "열기구가 날아요." },
  { word: "글라이더", targetPhonemes: ["ㄱ", "ㄹ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "글라이더가 날아요." },
  { word: "경운기", targetPhonemes: ["ㄱ", "ㅇ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "경운기가 달려요." },
  { word: "소방차", targetPhonemes: ["ㅅ", "ㅂ", "ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "소방차가 달려요.", soundEffect: "삐뽀삐뽀" },
  { word: "구급차", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "구급차가 달려요.", soundEffect: "삐뽀삐뽀" },

  // ── 학교·교육 (School/Education) ─────────────────────────────────────────
  { word: "교실", targetPhonemes: ["ㄱ", "ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "교실에서 공부해요." },
  { word: "분필", targetPhonemes: ["ㅂ", "ㄴ", "ㅍ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "분필로 써요." },
  { word: "공책", targetPhonemes: ["ㄱ", "ㅇ", "ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "공책에 써요." },
  { word: "크레용", targetPhonemes: ["ㅋ", "ㄹ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "크레용으로 그려요." },
  { word: "풀", targetPhonemes: ["ㅍ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "풀로 붙여요." },
  { word: "수학", targetPhonemes: ["ㅅ", "ㅎ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "수학을 해요." },
  { word: "과학", targetPhonemes: ["ㄱ", "ㅎ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "과학 실험을 해요." },
  { word: "음악", targetPhonemes: ["ㅁ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "음악을 들어요." },
  { word: "체육", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "체육을 해요." },

  // ── 가족·관계 (Family/Relations) ─────────────────────────────────────────
  { word: "외할머니", targetPhonemes: ["ㅎ", "ㄹ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "외할머니가 좋아요." },
  { word: "외할아버지", targetPhonemes: ["ㅎ", "ㄹ", "ㅂ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "외할아버지가 좋아요." },
  { word: "친할머니", targetPhonemes: ["ㅊ", "ㄴ", "ㅎ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "친할머니가 보고 싶어요." },
  { word: "친할아버지", targetPhonemes: ["ㅊ", "ㄴ", "ㅎ", "ㄹ", "ㅂ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "친할아버지가 보고 싶어요." },
  { word: "외삼촌", targetPhonemes: ["ㅅ", "ㅁ", "ㅊ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "외삼촌이 왔어요." },
  { word: "이모", targetPhonemes: ["ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "이모가 왔어요." },
  { word: "고모", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "고모가 왔어요." },
  { word: "삼촌", targetPhonemes: ["ㅅ", "ㅁ", "ㅊ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "삼촌이 왔어요." },
  { word: "사촌", targetPhonemes: ["ㅅ", "ㅊ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "사촌과 놀아요." },
  { word: "조카", targetPhonemes: ["ㅈ", "ㅋ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "조카가 귀여워요." },
  { word: "친구", targetPhonemes: ["ㅊ", "ㄴ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "친구와 놀아요." },
  { word: "단짝", targetPhonemes: ["ㄷ", "ㄴ", "ㅉ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "단짝 친구예요." },
  { word: "이웃", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "이웃이 친절해요." },

  // ── 음악·악기 심화 (Advanced Music) ─────────────────────────────────────
  { word: "오르간", targetPhonemes: ["ㄹ", "ㄱ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "오르간을 연주해요." },
  { word: "플루트", targetPhonemes: ["ㅍ", "ㄹ", "ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "플루트를 불어요." },
  { word: "클라리넷", targetPhonemes: ["ㅋ", "ㄹ", "ㄴ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "클라리넷을 불어요." },
  { word: "색소폰", targetPhonemes: ["ㅅ", "ㄱ", "ㅍ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "색소폰을 불어요." },
  { word: "하프", targetPhonemes: ["ㅎ", "ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "하프를 켜요." },
  { word: "첼로", targetPhonemes: ["ㅊ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "첼로를 켜요." },
  { word: "콘트라베이스", targetPhonemes: ["ㅋ", "ㄴ", "ㅌ", "ㄹ", "ㅂ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "콘트라베이스를 켜요." },
  { word: "캐스터네츠", targetPhonemes: ["ㅋ", "ㅅ", "ㅌ", "ㄴ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "캐스터네츠를 치요.", soundEffect: "딱딱" },
  { word: "노래", targetPhonemes: ["ㄴ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "노래를 불러요." },
  { word: "박자", targetPhonemes: ["ㅂ", "ㄱ", "ㅈ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "박자에 맞춰요." },
  { word: "리듬", targetPhonemes: ["ㄹ", "ㄷ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "리듬을 타요." },

  // ── 미술·공예 심화 (Advanced Arts/Crafts) ────────────────────────────────
  { word: "수채화", targetPhonemes: ["ㅅ", "ㅊ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수채화를 그려요." },
  { word: "유화", targetPhonemes: ["ㅎ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "유화를 그려요." },
  { word: "판화", targetPhonemes: ["ㅍ", "ㄴ", "ㅎ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "판화를 찍어요." },
  { word: "점토", targetPhonemes: ["ㅈ", "ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "점토로 만들어요." },
  { word: "콜라주", targetPhonemes: ["ㅋ", "ㄹ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "콜라주를 만들어요." },
  { word: "데칼코마니", targetPhonemes: ["ㄷ", "ㅋ", "ㄹ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "데칼코마니를 해요." },
  { word: "마블링", targetPhonemes: ["ㅁ", "ㅂ", "ㄹ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마블링을 해요." },

  // ── 우주·천문 심화 (Advanced Space/Astronomy) ────────────────────────────
  { word: "태양계", targetPhonemes: ["ㅌ", "ㅇ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "태양계가 넓어요." },
  { word: "소행성", targetPhonemes: ["ㅅ", "ㅎ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "소행성이 날아요." },
  { word: "블랙홀", targetPhonemes: ["ㅂ", "ㄹ", "ㄱ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "블랙홀이 있어요." },
  { word: "성운", targetPhonemes: ["ㅅ", "ㅇ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "성운이 아름다워요." },
  { word: "위성", targetPhonemes: ["ㅅ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "위성이 돌아요." },
  { word: "천체망원경", targetPhonemes: ["ㅊ", "ㄴ", "ㅁ", "ㅇ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "천체망원경으로 봐요." },
  { word: "북극성", targetPhonemes: ["ㅂ", "ㄱ", "ㅅ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "북극성이 빛나요." },
  { word: "금성", targetPhonemes: ["ㄱ", "ㅅ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "금성이 밝아요." },
  { word: "토성", targetPhonemes: ["ㅌ", "ㅅ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "토성에 고리가 있어요." },
  { word: "천왕성", targetPhonemes: ["ㅊ", "ㄴ", "ㅅ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "천왕성이 멀어요." },

  // ── 공룡 (Dinosaurs) ──────────────────────────────────────────────────────
  { word: "공룡", targetPhonemes: ["ㄱ", "ㅇ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "공룡이 커요." },
  { word: "티라노사우루스", targetPhonemes: ["ㅌ", "ㄹ", "ㄴ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "티라노사우루스가 무서워요." },
  { word: "트리케라톱스", targetPhonemes: ["ㅌ", "ㄹ", "ㅋ", "ㅅ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "트리케라톱스에게 뿔이 있어요." },
  { word: "브라키오사우루스", targetPhonemes: ["ㅂ", "ㄹ", "ㅋ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "브라키오사우루스 목이 길어요." },
  { word: "스테고사우루스", targetPhonemes: ["ㅅ", "ㅌ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "스테고사우루스 등에 판이 있어요." },
  { word: "익룡", targetPhonemes: ["ㄱ", "ㄹ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "익룡이 날아요." },
  { word: "수장룡", targetPhonemes: ["ㅅ", "ㅈ", "ㅇ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수장룡이 헤엄쳐요." },
  { word: "화석", targetPhonemes: ["ㅎ", "ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "화석을 발견해요." },
  { word: "공룡알", targetPhonemes: ["ㄱ", "ㅇ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "공룡알을 찾았어요." },

  // ── 옷·패션 심화 (Advanced Clothing/Fashion) ─────────────────────────────
  { word: "티셔츠", targetPhonemes: ["ㅌ", "ㅅ", "ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "티셔츠를 입어요." },
  { word: "원피스", targetPhonemes: ["ㄴ", "ㅍ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "원피스를 입어요." },
  { word: "점퍼", targetPhonemes: ["ㅈ", "ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "점퍼를 입어요." },
  { word: "가디건", targetPhonemes: ["ㄱ", "ㄷ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "가디건을 걸쳐요." },
  { word: "후드티", targetPhonemes: ["ㅎ", "ㄷ", "ㅌ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "후드티를 입어요." },
  { word: "청바지", targetPhonemes: ["ㅊ", "ㅇ", "ㅂ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "청바지를 입어요." },
  { word: "반바지", targetPhonemes: ["ㅂ", "ㄴ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "반바지를 입어요." },
  { word: "운동화", targetPhonemes: ["ㄴ", "ㄷ", "ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "운동화를 신어요." },
  { word: "샌들", targetPhonemes: ["ㅅ", "ㄴ", "ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "샌들을 신어요." },
  { word: "장화", targetPhonemes: ["ㅈ", "ㅇ", "ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "장화를 신어요." },
  { word: "슬리퍼", targetPhonemes: ["ㅅ", "ㄹ", "ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "슬리퍼를 신어요." },
  { word: "장갑", targetPhonemes: ["ㅈ", "ㅇ", "ㄱ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "장갑을 껴요." },
  { word: "수영복", targetPhonemes: ["ㅅ", "ㅇ", "ㅂ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "수영복을 입어요." },

  // ── 요리·부엌 (Cooking/Kitchen) ──────────────────────────────────────────
  { word: "냄비", targetPhonemes: ["ㄴ", "ㅁ", "ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "냄비에 끓여요." },
  { word: "프라이팬", targetPhonemes: ["ㅍ", "ㄹ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "프라이팬에 볶아요." },
  { word: "도마", targetPhonemes: ["ㄷ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "도마 위에 올려요." },
  { word: "국자", targetPhonemes: ["ㄱ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "국자로 떠요." },
  { word: "뒤집개", targetPhonemes: ["ㄷ", "ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뒤집개로 뒤집어요." },
  { word: "체", targetPhonemes: ["ㅊ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "체로 걸러요." },
  { word: "믹서기", targetPhonemes: ["ㅁ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "믹서기로 갈아요.", soundEffect: "윙윙" },
  { word: "오븐", targetPhonemes: ["ㅂ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "오븐에 구워요." },
  { word: "식칼", targetPhonemes: ["ㅅ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "식칼로 잘라요." },
  { word: "수저", targetPhonemes: ["ㅅ", "ㅈ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "수저로 먹어요." },
  { word: "젓가락", targetPhonemes: ["ㅈ", "ㅅ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "젓가락으로 집어요." },
  { word: "숟가락", targetPhonemes: ["ㅅ", "ㄷ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "숟가락으로 떠요." },
  { word: "접시", targetPhonemes: ["ㅈ", "ㅂ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "접시에 담아요." },
  { word: "그릇", targetPhonemes: ["ㄱ", "ㄹ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "그릇에 담아요." },
  { word: "컵", targetPhonemes: ["ㅋ", "ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "컵에 따라요." },
  { word: "머그컵", targetPhonemes: ["ㅁ", "ㄱ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "머그컵에 마셔요." },
  { word: "냄비받침", targetPhonemes: ["ㄴ", "ㅁ", "ㅂ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "냄비받침 위에 올려요." },

  // ── 파티·행사 (Party/Events) ──────────────────────────────────────────────
  { word: "생일", targetPhonemes: ["ㅅ", "ㅇ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "생일 축하해요." },
  { word: "생일파티", targetPhonemes: ["ㅅ", "ㅇ", "ㄹ", "ㅍ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "생일파티를 해요." },
  { word: "초대장", targetPhonemes: ["ㅊ", "ㄷ", "ㅈ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초대장을 써요." },
  { word: "포장지", targetPhonemes: ["ㅍ", "ㅈ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "포장지로 싸요." },
  { word: "리본", targetPhonemes: ["ㄹ", "ㅂ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "리본을 달아요." },
  { word: "풍선", targetPhonemes: ["ㅍ", "ㅇ", "ㅅ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "풍선을 불어요.", soundEffect: "빵" },
  { word: "폭죽", targetPhonemes: ["ㅍ", "ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "폭죽이 터져요.", soundEffect: "펑" },
  { word: "축하", targetPhonemes: ["ㅊ", "ㄱ", "ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "축하해요." },
  { word: "입학", targetPhonemes: ["ㅂ", "ㄱ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "입학을 축하해요." },
  { word: "발표회", targetPhonemes: ["ㅂ", "ㄹ", "ㅍ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "발표회에서 춰요." },
  { word: "크리스마스", targetPhonemes: ["ㅋ", "ㄹ", "ㅅ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "크리스마스가 좋아요." },

  // ── 동화·판타지 심화 (Advanced Fairy Tale) ───────────────────────────────
  { word: "마법봉", targetPhonemes: ["ㅁ", "ㅂ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마법봉을 흔들어요." },
  { word: "투명망토", targetPhonemes: ["ㅌ", "ㅁ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "투명망토를 입어요." },
  { word: "빗자루", targetPhonemes: ["ㅂ", "ㅅ", "ㅈ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마녀가 빗자루를 타요." },
  { word: "수정구슬", targetPhonemes: ["ㅅ", "ㅈ", "ㅇ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "수정구슬이 빛나요." },
  { word: "요술램프", targetPhonemes: ["ㄹ", "ㅅ", "ㅁ", "ㅍ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "요술램프를 문질러요." },
  { word: "황금열쇠", targetPhonemes: ["ㅎ", "ㄱ", "ㅁ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "황금열쇠로 열어요." },
  { word: "마법약", targetPhonemes: ["ㅁ", "ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마법약을 마셔요." },
  { word: "저주", targetPhonemes: ["ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "저주를 풀어요." },
  { word: "유니콘", targetPhonemes: ["ㄴ", "ㅋ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "유니콘이 날아요." },
  { word: "인어공주", targetPhonemes: ["ㄴ", "ㄱ", "ㅇ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "인어공주가 헤엄쳐요." },
  { word: "피노키오", targetPhonemes: ["ㅍ", "ㄴ", "ㅋ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "피노키오 코가 길어요." },
  { word: "빨간모자", targetPhonemes: ["ㅃ", "ㄹ", "ㄱ", "ㄴ", "ㅁ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "빨간모자가 걸어요." },
  { word: "신데렐라", targetPhonemes: ["ㅅ", "ㄴ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "신데렐라가 예뻐요." },
  { word: "백설공주", targetPhonemes: ["ㅂ", "ㄱ", "ㅅ", "ㄹ", "ㅇ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "백설공주가 일어나요." },

  // ── 직업 심화2 (More Occupations) ────────────────────────────────────────
  { word: "판사", targetPhonemes: ["ㅍ", "ㄴ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "판사가 판결해요." },
  { word: "변호사", targetPhonemes: ["ㅂ", "ㄴ", "ㅎ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "변호사가 도와줘요." },
  { word: "회계사", targetPhonemes: ["ㅎ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "회계사가 계산해요." },
  { word: "프로그래머", targetPhonemes: ["ㅍ", "ㄹ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "프로그래머가 코딩해요." },
  { word: "디자이너", targetPhonemes: ["ㄷ", "ㅈ", "ㄴ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "디자이너가 만들어요." },
  { word: "영양사", targetPhonemes: ["ㅇ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "영양사가 식단을 짜요." },
  { word: "사진사", targetPhonemes: ["ㅅ", "ㅈ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "사진사가 찍어요." },
  { word: "마술사", targetPhonemes: ["ㅁ", "ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마술사가 마술을 해요." },
  { word: "환경미화원", targetPhonemes: ["ㅎ", "ㄴ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "환경미화원이 청소해요." },
  { word: "배우", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "배우가 연기해요." },
  { word: "가수", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "가수가 노래해요." },
  { word: "댄서", targetPhonemes: ["ㄷ", "ㄴ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "댄서가 춤춰요." },
  { word: "만화가", targetPhonemes: ["ㅁ", "ㄴ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "만화가가 만화를 그려요." },
  { word: "요리사", targetPhonemes: ["ㄹ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "요리사가 요리해요." },
  { word: "제빵사", targetPhonemes: ["ㅈ", "ㅃ", "ㅇ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "제빵사가 빵을 구워요." },

  // ── 환경·지구 (Environment/Earth) ────────────────────────────────────────
  { word: "재활용", targetPhonemes: ["ㅈ", "ㅎ", "ㄹ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "재활용을 해요." },
  { word: "분리수거", targetPhonemes: ["ㅂ", "ㄴ", "ㄹ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "분리수거를 해요." },
  { word: "쓰레기", targetPhonemes: ["ㅆ", "ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "쓰레기를 버려요." },
  { word: "지구온난화", targetPhonemes: ["ㅈ", "ㄱ", "ㄴ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "지구온난화가 심해요." },
  { word: "태양광", targetPhonemes: ["ㅌ", "ㅇ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "태양광 에너지를 써요." },
  { word: "풍력", targetPhonemes: ["ㅍ", "ㅇ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "풍력 에너지를 써요." },
  { word: "나무심기", targetPhonemes: ["ㄴ", "ㅁ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "나무심기를 해요." },
  { word: "텃밭", targetPhonemes: ["ㅌ", "ㅅ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "텃밭에 채소를 심어요." },
  { word: "퇴비", targetPhonemes: ["ㅌ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "퇴비를 만들어요." },
  { word: "절수", targetPhonemes: ["ㅈ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "절수를 해요." },
  { word: "탄소", targetPhonemes: ["ㅌ", "ㄴ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "탄소를 줄여요." },

  // ── 수 개념 심화 (Advanced Math Concepts) ────────────────────────────────
  { word: "곱하기", targetPhonemes: ["ㄱ", "ㅂ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "곱하기를 해요." },
  { word: "나누기", targetPhonemes: ["ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "나누기를 해요." },
  { word: "같다", targetPhonemes: ["ㄱ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "같아요." },
  { word: "다르다", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "달라요." },

  // ── 병원·응급 (Hospital/Emergency) ───────────────────────────────────────
  { word: "병원", targetPhonemes: ["ㅂ", "ㅇ", "ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "병원에 가요." },
  { word: "의사", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "의사 선생님이에요." },
  { word: "청진기", targetPhonemes: ["ㅊ", "ㅇ", "ㅈ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "청진기를 대요.", soundEffect: "두근두근" },
  { word: "붕대", targetPhonemes: ["ㅂ", "ㅇ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "붕대를 감아요." },
  { word: "석고붕대", targetPhonemes: ["ㅅ", "ㄱ", "ㅂ", "ㅇ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "석고붕대를 해요." },
  { word: "수술", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "수술을 해요." },
  { word: "엑스레이", targetPhonemes: ["ㄱ", "ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "엑스레이로 찍어요." },
  { word: "응급실", targetPhonemes: ["ㅇ", "ㄱ", "ㅅ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "응급실에 가요." },
  { word: "입원", targetPhonemes: ["ㅂ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "입원을 해요." },
  { word: "퇴원", targetPhonemes: ["ㅌ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "퇴원을 해요." },
  { word: "처방전", targetPhonemes: ["ㅊ", "ㅂ", "ㅈ", "ㄴ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "처방전을 받아요." },

  // ── 놀이·게임 (Play/Games) ────────────────────────────────────────────────
  { word: "숨바꼭질", targetPhonemes: ["ㅅ", "ㅁ", "ㅂ", "ㄲ", "ㄱ", "ㅈ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "숨바꼭질을 해요." },
  { word: "술래잡기", targetPhonemes: ["ㅅ", "ㄹ", "ㅈ", "ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "술래잡기를 해요." },
  { word: "오징어게임", targetPhonemes: ["ㅈ", "ㅇ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "오징어게임을 해요." },
  { word: "달팽이게임", targetPhonemes: ["ㄷ", "ㄹ", "ㅍ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "달팽이게임을 해요." },
  { word: "무궁화꽃이피었습니다", targetPhonemes: ["ㅁ", "ㄱ", "ㅎ", "ㄲ", "ㅊ", "ㅍ", "ㅇ", "ㅅ", "ㄴ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "무궁화꽃이 피었습니다!" },
  { word: "가위바위보", targetPhonemes: ["ㄱ", "ㅂ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "가위바위보를 해요." },
  { word: "딱지치기", targetPhonemes: ["ㄸ", "ㄱ", "ㅈ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "딱지치기를 해요." },
  { word: "구슬치기", targetPhonemes: ["ㄱ", "ㅅ", "ㄹ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "구슬치기를 해요." },
  { word: "고무줄넘기", targetPhonemes: ["ㄱ", "ㅁ", "ㅈ", "ㄹ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고무줄넘기를 해요." },
  { word: "체스", targetPhonemes: ["ㅊ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "체스를 둬요." },
  { word: "장기", targetPhonemes: ["ㅈ", "ㅇ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "장기를 둬요." },
  { word: "바둑", targetPhonemes: ["ㅂ", "ㄷ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "바둑을 둬요." },
  { word: "카드게임", targetPhonemes: ["ㄱ", "ㄷ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "카드게임을 해요." },

  // ── 자연·식물 심화 (Advanced Plants/Nature) ───────────────────────────────
  { word: "단풍나무", targetPhonemes: ["ㄷ", "ㄴ", "ㅍ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "단풍나무가 빨개요." },
  { word: "은행나무", targetPhonemes: ["ㄴ", "ㅎ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "은행나무 잎이 노래요." },
  { word: "수국", targetPhonemes: ["ㅅ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "수국이 예뻐요." },
  { word: "라일락", targetPhonemes: ["ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "라일락 향기가 좋아요." },
  { word: "제비꽃", targetPhonemes: ["ㅈ", "ㅂ", "ㄲ", "ㅊ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "제비꽃이 보라색이에요." },
  { word: "냉이", targetPhonemes: ["ㄴ", "ㅇ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "냉이나물을 먹어요." },
  { word: "쑥", targetPhonemes: ["ㅆ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "쑥을 뜯어요." },
  { word: "부들", targetPhonemes: ["ㅂ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "부들이 연못에 있어요." },
  { word: "수련", targetPhonemes: ["ㅅ", "ㄹ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "수련이 물 위에 떠요." },
  { word: "연꽃", targetPhonemes: ["ㄴ", "ㄲ", "ㅊ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "연꽃이 아름다워요." },
  { word: "싹", targetPhonemes: ["ㅆ", "ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "싹이 났어요." },
  { word: "줄기", targetPhonemes: ["ㅈ", "ㄹ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "줄기가 길어요." },
  { word: "꽃봉오리", targetPhonemes: ["ㄲ", "ㅊ", "ㅂ", "ㅇ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "꽃봉오리가 피어요." },
  { word: "열매", targetPhonemes: ["ㄹ", "ㅁ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "열매가 열렸어요." },

  // ── 날씨·기상 심화 (Advanced Weather) ────────────────────────────────────
  { word: "소나기", targetPhonemes: ["ㅅ", "ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "소나기가 내려요." },
  { word: "가랑비", targetPhonemes: ["ㄱ", "ㄹ", "ㅇ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "가랑비가 내려요." },
  { word: "장마", targetPhonemes: ["ㅈ", "ㅇ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "장마가 왔어요." },
  { word: "가뭄", targetPhonemes: ["ㄱ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "가뭄이 들었어요." },
  { word: "폭염", targetPhonemes: ["ㅍ", "ㄱ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "폭염이 심해요." },
  { word: "한파", targetPhonemes: ["ㅎ", "ㄴ", "ㅍ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "한파가 왔어요." },
  { word: "습도", targetPhonemes: ["ㅅ", "ㅂ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "습도가 높아요." },
  { word: "기온", targetPhonemes: ["ㄱ", "ㄴ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "기온이 낮아요." },
  { word: "기압", targetPhonemes: ["ㄱ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "기압이 변해요." },
  { word: "무더위", targetPhonemes: ["ㅁ", "ㄷ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "무더위가 심해요." },
  { word: "꽃샘추위", targetPhonemes: ["ㄲ", "ㅊ", "ㅅ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "꽃샘추위가 왔어요." },
  { word: "온도", targetPhonemes: ["ㄴ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "온도를 재요." },
  { word: "기상예보", targetPhonemes: ["ㄱ", "ㅅ", "ㅇ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "기상예보를 봐요." },
  { word: "태풍경보", targetPhonemes: ["ㅌ", "ㅍ", "ㄱ", "ㅂ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "태풍경보가 울려요." },

  // ── 동작·움직임 심화 (Advanced Actions) ─────────────────────────────────
  { word: "뛰어오르다", targetPhonemes: ["ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "뛰어올라요." },
  { word: "구르다", targetPhonemes: ["ㄱ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "데굴데굴 굴러요." },
  { word: "넘어지다", targetPhonemes: ["ㄴ", "ㅁ", "ㅈ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "넘어졌어요." },
  { word: "기어가다", targetPhonemes: ["ㄱ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "기어가요." },
  { word: "날아가다", targetPhonemes: ["ㄴ", "ㄹ", "ㄱ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "날아가요." },
  { word: "헤엄치다", targetPhonemes: ["ㅎ", "ㅁ", "ㅊ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "헤엄쳐요." },
  { word: "파닥파닥", targetPhonemes: ["ㅍ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "새가 파닥파닥 날아요.", soundEffect: "파닥파닥" },
  { word: "끄덕끄덕", targetPhonemes: ["ㄲ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "끄덕끄덕 고개를 끄덕여요.", soundEffect: "끄덕끄덕" },
  { word: "고개젓다", targetPhonemes: ["ㄱ", "ㅈ", "ㅅ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "고개를 저어요." },
  { word: "손흔들다", targetPhonemes: ["ㅅ", "ㄴ", "ㅎ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "손을 흔들어요." },
  { word: "안아주다", targetPhonemes: ["ㄴ", "ㅈ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "안아줘요." },
  { word: "토닥토닥", targetPhonemes: ["ㅌ", "ㄷ", "ㄱ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "토닥토닥 두드려요.", soundEffect: "토닥토닥" },

  // ── 크기·양·비교 (Size/Amount/Comparison) ────────────────────────────────
  { word: "조금씩", targetPhonemes: ["ㅈ", "ㄱ", "ㅁ", "ㅆ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "조금씩 먹어요." },
  { word: "가득", targetPhonemes: ["ㄱ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "가득 차요." },
  { word: "텅텅", targetPhonemes: ["ㅌ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "텅텅 비었어요.", soundEffect: "텅텅" },
  { word: "절반", targetPhonemes: ["ㅈ", "ㄹ", "ㅂ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "절반만 먹어요." },
  { word: "처음", targetPhonemes: ["ㅊ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "처음이에요." },
  { word: "나중", targetPhonemes: ["ㄴ", "ㅈ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "나중에 해요." },
  { word: "먼저", targetPhonemes: ["ㅁ", "ㄴ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "먼저 해요." },
  { word: "천천히", targetPhonemes: ["ㅊ", "ㄴ", "ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "천천히 해요." },
  { word: "함께", targetPhonemes: ["ㅎ", "ㅁ", "ㄲ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "함께 해요." },

  // ── 감각·느낌 (Senses/Feelings) ──────────────────────────────────────────
  { word: "따뜻해요", targetPhonemes: ["ㄸ", "ㅅ", "ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "따뜻해요." },
  { word: "차가워요", targetPhonemes: ["ㅊ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "차가워요." },
  { word: "뜨거워요", targetPhonemes: ["ㄸ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "뜨거워요." },
  { word: "시원해요", targetPhonemes: ["ㅅ", "ㄴ", "ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "시원해요." },
  { word: "딱딱해요", targetPhonemes: ["ㄸ", "ㄱ", "ㅎ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "딱딱해요." },
  { word: "말랑말랑", targetPhonemes: ["ㅁ", "ㄹ", "ㅇ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "말랑말랑해요.", soundEffect: "말랑말랑" },
  { word: "보들보들", targetPhonemes: ["ㅂ", "ㄷ", "ㄹ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "보들보들해요.", soundEffect: "보들보들" },
  { word: "거칠거칠", targetPhonemes: ["ㄱ", "ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "거칠거칠해요.", soundEffect: "거칠거칠" },
  { word: "미끌미끌", targetPhonemes: ["ㅁ", "ㄲ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "미끌미끌해요.", soundEffect: "미끌미끌" },
  { word: "향기롭다", targetPhonemes: ["ㅎ", "ㅇ", "ㄱ", "ㄹ", "ㅂ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "향기로워요." },
  { word: "냄새나요", targetPhonemes: ["ㄴ", "ㅁ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "냄새나요." },
  { word: "소리나요", targetPhonemes: ["ㅅ", "ㄹ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "소리나요." },
  { word: "맛없어요", targetPhonemes: ["ㅁ", "ㅅ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "맛없어요." },
  { word: "신맛", targetPhonemes: ["ㅅ", "ㄴ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "신맛이 나요." },
  { word: "단맛", targetPhonemes: ["ㄷ", "ㄴ", "ㅁ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "단맛이 나요." },
  { word: "쓴맛", targetPhonemes: ["ㅆ", "ㄴ", "ㅁ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "쓴맛이 나요." },
  { word: "매운맛", targetPhonemes: ["ㅁ", "ㄴ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "매운맛이 나요." },

  // ── 수학·도형 (Math/Shapes) ───────────────────────────────────────────────
  { word: "삼각형", targetPhonemes: ["ㅅ", "ㅁ", "ㄱ", "ㅎ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "삼각형을 그려요." },
  { word: "사각형", targetPhonemes: ["ㅅ", "ㄱ", "ㅎ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "사각형을 그려요." },
  { word: "원", targetPhonemes: ["ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "원을 그려요." },
  { word: "육각형", targetPhonemes: ["ㄱ", "ㅎ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "육각형을 그려요." },
  { word: "정육면체", targetPhonemes: ["ㅈ", "ㅇ", "ㄱ", "ㅁ", "ㄴ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "정육면체 주사위예요." },
  { word: "구형", targetPhonemes: ["ㄱ", "ㅎ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "구형은 공 모양이에요." },
  { word: "원기둥", targetPhonemes: ["ㄴ", "ㄱ", "ㄷ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "원기둥은 통 모양이에요." },
  { word: "짝수", targetPhonemes: ["ㅉ", "ㄱ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "짝수는 둘씩 짝이 되요." },
  { word: "홀수", targetPhonemes: ["ㅎ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "홀수는 짝이 없어요." },
  { word: "순서", targetPhonemes: ["ㅅ", "ㄴ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "순서대로 해요." },
  { word: "분류", targetPhonemes: ["ㅂ", "ㄴ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "분류해요." },
  { word: "비교", targetPhonemes: ["ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "비교해요." },

  // ── 언어·읽기 (Language/Reading) ─────────────────────────────────────────
  { word: "글자", targetPhonemes: ["ㄱ", "ㄹ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "글자를 읽어요." },
  { word: "단어", targetPhonemes: ["ㄷ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "단어를 배워요." },
  { word: "문장", targetPhonemes: ["ㅁ", "ㄴ", "ㅈ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "문장을 읽어요." },
  { word: "사전", targetPhonemes: ["ㅅ", "ㅈ", "ㄴ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "사전에서 찾아요." },
  { word: "이야기", targetPhonemes: ["ㄱ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "이야기를 해요." },
  { word: "수수께끼", targetPhonemes: ["ㅅ", "ㄲ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "수수께끼를 맞춰요." },
  { word: "받아쓰기", targetPhonemes: ["ㅂ", "ㄷ", "ㅆ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "받아쓰기를 해요." },
  { word: "소리내어읽기", targetPhonemes: ["ㅅ", "ㄹ", "ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "소리내어 읽어요." },

  // ── 집안일·청소 (Household Chores) ───────────────────────────────────────
  { word: "설거지", targetPhonemes: ["ㅅ", "ㄹ", "ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "설거지를 해요." },
  { word: "장보기", targetPhonemes: ["ㅈ", "ㅇ", "ㅂ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "장보기를 해요." },
  { word: "요리", targetPhonemes: ["ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "요리를 해요." },
  { word: "다림질", targetPhonemes: ["ㄷ", "ㄹ", "ㅁ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "다림질을 해요." },
  { word: "정리", targetPhonemes: ["ㅈ", "ㅇ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "정리를 해요." },
  { word: "쓸다", targetPhonemes: ["ㅆ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빗자루로 쓸어요." },
  { word: "닦다", targetPhonemes: ["ㄷ", "ㄲ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "걸레로 닦아요." },
  { word: "버리다", targetPhonemes: ["ㅂ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "쓰레기를 버려요." },

  // ── 안전·규칙 (Safety/Rules) ──────────────────────────────────────────────
  { word: "안전벨트", targetPhonemes: ["ㄴ", "ㅈ", "ㅂ", "ㄹ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "안전벨트를 해요." },
  { word: "신호등", targetPhonemes: ["ㅅ", "ㄴ", "ㅎ", "ㄷ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "신호등을 지켜요." },
  { word: "횡단보도", targetPhonemes: ["ㅎ", "ㅇ", "ㄷ", "ㄴ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "횡단보도를 건너요." },
  { word: "안전모", targetPhonemes: ["ㄴ", "ㅈ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "안전모를 써요." },
  { word: "구명조끼", targetPhonemes: ["ㄱ", "ㅁ", "ㅇ", "ㅈ", "ㄲ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "구명조끼를 입어요." },
  { word: "소화기", targetPhonemes: ["ㅅ", "ㅎ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "소화기로 끄요." },
  { word: "비상구", targetPhonemes: ["ㅂ", "ㅅ", "ㅇ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "비상구로 나가요." },
  { word: "규칙", targetPhonemes: ["ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "규칙을 지켜요." },
  { word: "약속", targetPhonemes: ["ㄱ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "약속을 지켜요." },
  { word: "조심", targetPhonemes: ["ㅈ", "ㅅ", "ㅁ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "조심해요." },

  // ── 과학·실험 (Science/Experiments) ──────────────────────────────────────
  { word: "현미경", targetPhonemes: ["ㅎ", "ㄴ", "ㅁ", "ㄱ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "현미경으로 봐요." },
  { word: "전기", targetPhonemes: ["ㅈ", "ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "전기가 흘러요." },
  { word: "물질", targetPhonemes: ["ㅁ", "ㄹ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "물질을 관찰해요." },
  { word: "기체", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "기체는 보이지 않아요." },
  { word: "액체", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "액체는 흘러요." },
  { word: "고체", targetPhonemes: ["ㄱ", "ㅊ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "고체는 단단해요." },
  { word: "관찰", targetPhonemes: ["ㄱ", "ㄴ", "ㅊ", "ㄹ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "관찰해요." },
  { word: "비교실험", targetPhonemes: ["ㅂ", "ㄱ", "ㅅ", "ㄹ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "비교실험을 해요." },

  // ── 건물·구조물 (Buildings/Structures) ───────────────────────────────────
  { word: "아파트", targetPhonemes: ["ㅍ", "ㅌ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "아파트에 살아요." },
  { word: "빌라", targetPhonemes: ["ㅂ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "빌라에 살아요." },
  { word: "단독주택", targetPhonemes: ["ㄷ", "ㄴ", "ㅈ", "ㅌ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "단독주택에 살아요." },
  { word: "계단", targetPhonemes: ["ㄱ", "ㄷ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "계단을 올라가요." },
  { word: "난간", targetPhonemes: ["ㄴ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "난간을 잡아요." },
  { word: "현관", targetPhonemes: ["ㅎ", "ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "현관에서 신발을 신어요." },
  { word: "울타리", targetPhonemes: ["ㄹ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "울타리가 있어요." },
  { word: "지붕", targetPhonemes: ["ㅈ", "ㅂ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "지붕이 있어요." },
  { word: "굴뚝", targetPhonemes: ["ㄱ", "ㄹ", "ㄸ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "굴뚝에서 연기가 나요." },
  { word: "댐", targetPhonemes: ["ㄷ", "ㅁ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "댐에 물이 있어요." },

  // ── 바다·해양 (Ocean/Marine) ──────────────────────────────────────────────
  { word: "모래사장", targetPhonemes: ["ㅁ", "ㄹ", "ㅅ", "ㅈ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "모래사장에서 놀아요." },
  { word: "소라", targetPhonemes: ["ㅅ", "ㄹ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "소라를 들어봐요.", soundEffect: "쏴아" },
  { word: "성게", targetPhonemes: ["ㅅ", "ㅇ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "성게에 가시가 있어요." },
  { word: "새우", targetPhonemes: ["ㅅ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "새우가 맛있어요." },
  { word: "낙지", targetPhonemes: ["ㄴ", "ㄱ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "낙지가 꿈틀거려요." },
  { word: "오징어", targetPhonemes: ["ㅈ", "ㅇ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "오징어를 먹어요." },
  { word: "바닷속", targetPhonemes: ["ㅂ", "ㄷ", "ㅅ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "바닷속이 신기해요." },
  { word: "잠수", targetPhonemes: ["ㅈ", "ㅁ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "잠수를 해요." },
  { word: "스노클링", targetPhonemes: ["ㅅ", "ㄴ", "ㅋ", "ㄹ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "스노클링을 해요." },

  // ── 농장·시골 (Farm/Country) ──────────────────────────────────────────────
  { word: "농장", targetPhonemes: ["ㄴ", "ㅇ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "농장에 가요." },
  { word: "논", targetPhonemes: ["ㄴ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "논에 벼가 자라요." },
  { word: "밭", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "밭에 채소가 자라요." },
  { word: "벼", targetPhonemes: ["ㅂ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "벼가 황금색이에요." },
  { word: "트랙터", targetPhonemes: ["ㅌ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "트랙터가 밭을 갈아요." },
  { word: "우물", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "우물에서 물을 길어요." },
  { word: "초가집", targetPhonemes: ["ㅊ", "ㄱ", "ㅈ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "초가집이 예뻐요." },
  { word: "닭장", targetPhonemes: ["ㄷ", "ㅈ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "닭장에 닭이 있어요." },
  { word: "외양간", targetPhonemes: ["ㅇ", "ㄱ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "외양간에 소가 있어요." },

  // ── 표현·감탄사 (Expressions/Interjections) ──────────────────────────────
  { word: "앗따", targetPhonemes: ["ㅅ", "ㄸ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "앗따, 맛있다!", soundEffect: "앗따" },
  { word: "어머나", targetPhonemes: ["ㅁ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "어머나, 예쁘다!", soundEffect: "어머나" },
  { word: "짝짝짝", targetPhonemes: ["ㅉ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "짝짝짝, 잘했어요!", soundEffect: "짝짝짝" },
  { word: "맞아요", targetPhonemes: ["ㅁ", "ㅈ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "맞아요." },
  { word: "틀려요", targetPhonemes: ["ㅌ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "틀려요." },
  { word: "몰라요", targetPhonemes: ["ㅁ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "몰라요." },
  { word: "왜냐면", targetPhonemes: ["ㄴ", "ㅁ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "왜냐면이요." },
  { word: "그래서", targetPhonemes: ["ㄱ", "ㄹ", "ㅅ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "그래서 해요." },
  { word: "하지만", targetPhonemes: ["ㅎ", "ㅈ", "ㅁ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "하지만 안 돼요." },

  // ── 위생·청결 심화 (Advanced Hygiene) ────────────────────────────────────
  { word: "손가락질", targetPhonemes: ["ㅅ", "ㄴ", "ㄱ", "ㄹ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손가락질하지 않아요." },
  { word: "코풀기", targetPhonemes: ["ㄱ", "ㅍ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "코를 풀어요." },
  { word: "손톱깎기", targetPhonemes: ["ㅅ", "ㄴ", "ㅌ", "ㅂ", "ㄲ", "ㄱ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손톱을 깎아요." },
  { word: "머리감기", targetPhonemes: ["ㅁ", "ㄹ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "머리를 감아요." },
  { word: "칫솔", targetPhonemes: ["ㅊ", "ㅅ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "칫솔로 닦아요." },
  { word: "샴푸", targetPhonemes: ["ㅅ", "ㅁ", "ㅍ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "샴푸로 감아요." },
  { word: "린스", targetPhonemes: ["ㄹ", "ㄴ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "린스로 헹궈요." },
  { word: "손소독제", targetPhonemes: ["ㅅ", "ㄴ", "ㄷ", "ㄱ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "손소독제를 발라요." },

  // ── 미디어·엔터테인먼트 (Media/Entertainment) ─────────────────────────────
  { word: "만화", targetPhonemes: ["ㅁ", "ㄴ", "ㅎ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "만화를 봐요." },
  { word: "애니메이션", targetPhonemes: ["ㄴ", "ㅁ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "애니메이션이 재미있어요." },
  { word: "영화", targetPhonemes: ["ㅇ", "ㅎ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "영화를 봐요." },
  { word: "유튜브", targetPhonemes: ["ㅌ", "ㅂ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "유튜브를 봐요." },
  { word: "라디오", targetPhonemes: ["ㄹ", "ㄷ"], difficulty: "easy", ageGroup: "2-3세", sampleSentence: "라디오를 들어요." },
  { word: "음악방송", targetPhonemes: ["ㅇ", "ㅁ", "ㄱ", "ㅂ", "ㅅ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "음악방송을 봐요." },
  { word: "뉴스", targetPhonemes: ["ㄴ", "ㅅ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "뉴스를 봐요." },
  { word: "콘서트", targetPhonemes: ["ㅋ", "ㄴ", "ㅅ", "ㅌ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "콘서트에 가요." },
  { word: "뮤지컬", targetPhonemes: ["ㅁ", "ㅈ", "ㅋ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뮤지컬을 봐요." },
  { word: "연극", targetPhonemes: ["ㄴ", "ㄱ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "연극을 봐요." },
  { word: "마술공연", targetPhonemes: ["ㅁ", "ㅅ", "ㄹ", "ㄱ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "마술공연을 봐요." },

  // ── 한글 자모 집중 연습 (Phoneme-Focused Words) ──────────────────────────
  { word: "뚜껑", targetPhonemes: ["ㄸ", "ㄲ", "ㅇ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뚜껑을 열어요." },
  { word: "쌍둥이", targetPhonemes: ["ㅆ", "ㅇ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "쌍둥이가 닮았어요." },
  { word: "짬뽕", targetPhonemes: ["ㅉ", "ㅁ", "ㅃ", "ㅇ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "짬뽕이 맛있어요." },
  { word: "쭈꾸미", targetPhonemes: ["ㅉ", "ㄲ", "ㅁ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "쭈꾸미를 먹어요." },
  { word: "끼니", targetPhonemes: ["ㄲ", "ㄴ"], difficulty: "medium", ageGroup: "4-5세", sampleSentence: "끼니를 챙겨요." },
  { word: "씩씩해요", targetPhonemes: ["ㅆ", "ㄱ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "씩씩해요." },
  { word: "뚝뚝", targetPhonemes: ["ㄸ", "ㄱ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "물이 뚝뚝 떨어져요.", soundEffect: "뚝뚝" },
  { word: "쪼그리다", targetPhonemes: ["ㅉ", "ㄱ", "ㄹ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "쪼그리고 앉아요." },
  { word: "뽑다", targetPhonemes: ["ㅃ", "ㅂ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "뽑아요." },
  { word: "쌓다", targetPhonemes: ["ㅆ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "쌓아요." },
  { word: "찌르다", targetPhonemes: ["ㅉ", "ㄹ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "콕 찔러요." },
  { word: "떨다", targetPhonemes: ["ㄸ", "ㄹ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "추워서 떨어요." },
  { word: "쏘다", targetPhonemes: ["ㅆ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "활을 쏴요." },
  { word: "삐다", targetPhonemes: ["ㅃ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "발목을 삐었어요." },
  { word: "뚜렷해요", targetPhonemes: ["ㄸ", "ㄹ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "뚜렷해요." },
  { word: "빛나요", targetPhonemes: ["ㅂ", "ㅊ", "ㄴ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "빛나요." },
  { word: "짜증나요", targetPhonemes: ["ㅉ", "ㅈ", "ㅇ", "ㄴ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "짜증나요." },
  { word: "쑤셔요", targetPhonemes: ["ㅆ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "머리가 쑤셔요." },
  { word: "뻣뻣해요", targetPhonemes: ["ㅃ", "ㅅ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뻣뻣해요." },
  { word: "따분해요", targetPhonemes: ["ㄸ", "ㅂ", "ㄴ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "따분해요." },
  { word: "쓸쓸해요", targetPhonemes: ["ㅆ", "ㄹ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "쓸쓸해요." },
  { word: "뿌듯해요", targetPhonemes: ["ㅃ", "ㄷ", "ㅅ", "ㅎ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "뿌듯해요." },
  { word: "따끔해요", targetPhonemes: ["ㄸ", "ㄲ", "ㅁ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "따끔해요." },
  { word: "쫄깃해요", targetPhonemes: ["ㅉ", "ㄹ", "ㄱ", "ㅅ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "쫄깃해요." },
  { word: "뚱뚱해요", targetPhonemes: ["ㄸ", "ㅇ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뚱뚱해요." },
  { word: "까칠해요", targetPhonemes: ["ㄲ", "ㅊ", "ㄹ", "ㅎ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "까칠해요." },
  { word: "찌릿찌릿", targetPhonemes: ["ㅉ", "ㄹ", "ㅅ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "찌릿찌릿해요.", soundEffect: "찌릿찌릿" },
  { word: "으쓱으쓱", targetPhonemes: ["ㅆ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "으쓱으쓱해요.", soundEffect: "으쓱으쓱" },
  { word: "펄떡펄떡", targetPhonemes: ["ㅍ", "ㄹ", "ㄸ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "물고기가 펄떡펄떡해요.", soundEffect: "펄떡펄떡" },
  { word: "꼬불꼬불", targetPhonemes: ["ㄲ", "ㅂ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "꼬불꼬불 라면이에요.", soundEffect: "꼬불꼬불" },
  { word: "따르릉", targetPhonemes: ["ㄸ", "ㄹ", "ㅇ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "전화가 따르릉 울려요.", soundEffect: "따르릉" },
  { word: "쨍그랑", targetPhonemes: ["ㅉ", "ㅇ", "ㄱ", "ㄹ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "유리가 쨍그랑 소리나요.", soundEffect: "쨍그랑" },
  { word: "삐걱삐걱", targetPhonemes: ["ㅃ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "문이 삐걱삐걱해요.", soundEffect: "삐걱삐걱" },
  { word: "쿨쿨", targetPhonemes: ["ㅋ", "ㄹ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "쿨쿨 자요.", soundEffect: "쿨쿨" },
  { word: "뚝딱뚝딱", targetPhonemes: ["ㄸ", "ㄱ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "뚝딱뚝딱 만들어요.", soundEffect: "뚝딱뚝딱" },
  { word: "쏴아", targetPhonemes: ["ㅆ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "물이 쏴아 흘러요.", soundEffect: "쏴아" },
  { word: "쫄쫄", targetPhonemes: ["ㅉ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "물이 쫄쫄 흘러요.", soundEffect: "쫄쫄" },
  { word: "폭신폭신", targetPhonemes: ["ㅍ", "ㄱ", "ㅅ", "ㄴ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "폭신폭신해요.", soundEffect: "폭신폭신" },
  { word: "뾰족뾰족", targetPhonemes: ["ㅃ", "ㅈ", "ㄱ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뾰족뾰족해요." },
  { word: "삐뚤삐뚤", targetPhonemes: ["ㅃ", "ㄸ", "ㄹ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "삐뚤삐뚤 써요.", soundEffect: "삐뚤삐뚤" },
  { word: "쏙쏙", targetPhonemes: ["ㅆ", "ㄱ"], difficulty: "hard", ageGroup: "3-4세", sampleSentence: "쏙쏙 들어가요.", soundEffect: "쏙쏙" },
  { word: "뚝배기", targetPhonemes: ["ㄸ", "ㄱ", "ㅂ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "뚝배기에 끓여요." },
  { word: "쑤시다", targetPhonemes: ["ㅆ", "ㅅ", "ㄷ"], difficulty: "hard", ageGroup: "4-5세", sampleSentence: "이쑤시개로 쑤셔요." },
  { word: "꿰매다", targetPhonemes: ["ㄲ", "ㅁ", "ㄷ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "꿰매요." },
  { word: "써레질", targetPhonemes: ["ㅆ", "ㄹ", "ㅈ"], difficulty: "hard", ageGroup: "5-6세", sampleSentence: "써레질을 해요." },
  { word: "뜯다", targetPhonemes: ["ㄸ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "뜯어요." },
  { word: "쫓다", targetPhonemes: ["ㅉ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "쫓아요." },
  { word: "찢다", targetPhonemes: ["ㅉ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "찢어요." },
  { word: "깎다", targetPhonemes: ["ㄲ", "ㄷ"], difficulty: "medium", ageGroup: "3-4세", sampleSentence: "깎아요." },
];






export function getWordsByPhoneme(phoneme: string): PracticeWord[] {
  return WORD_DATABASE.filter((w) => w.targetPhonemes.includes(phoneme));
}

export function getWordByText(word: string): PracticeWord | undefined {
  const found = WORD_DATABASE.find((w) => w.word === word);
  if (!found) return undefined;
  // 큐레이션된 이미지 슬러그를 오버레이 (단일 소스: word-images.ts)
  const slug = WORD_IMAGE_SLUGS[word];
  return slug ? { ...found, imageSlug: slug } : found;
}

/** 음소 위치 — 초성(onset) / 종성·받침(coda) / 무관(any) */
export type PhonemePosition = "onset" | "coda" | "any";

/**
 * 오류 정보(errorPattern/errorType)에서 음소 위치를 추출.
 * - "종성 탈락"·"종성 변화" 등 → coda(받침)
 * - "초성 탈락"·"초성 첨가" 등 → onset(초성)
 * - 그 외(음절탈락·대치 등 위치 불명) → any
 * 예) 노트북 → 노트부(종성 ㄱ 탈락)는 coda → 받침 ㄱ 단어(책·수박)만 유사패턴으로 선택.
 */
export function phonemePositionFromError(
  errorPattern?: string | null,
  errorType?: string | null,
): PhonemePosition {
  const s = `${errorPattern ?? ""} ${errorType ?? ""}`;
  if (s.includes("종성")) return "coda";
  if (s.includes("초성")) return "onset";
  return "any";
}

/** 단어가 특정 자모를 특정 위치(초성/종성)에 실제로 포함하는지 (한글 분해 기반) */
function wordHasPhonemeAt(word: string, jamo: string, pos: PhonemePosition): boolean {
  if (pos === "any") return true;
  for (const syl of decomposeWord(word)) {
    if (!syl) continue;
    if (pos === "onset" && syl.choseong === jamo) return true;
    if (pos === "coda" && syl.jongseong && normalizeJongseong(syl.jongseong) === jamo) return true;
  }
  return false;
}

/**
 * 해당 음소를 포함하면서 이미지가 있는 단어만 반환 (유사패턴 stage2 선택용).
 * position을 지정하면 그 위치(초성/종성)에 음소가 오는 단어만 선택해
 * "노트북(받침 ㄱ 탈락)에 가방(초성 ㄱ)이 추천되는" 위치 불일치를 방지한다.
 * 위치 지정 시에는 targetPhonemes(주로 초성 위주)에 의존하지 않고 실제 분해로 판정한다.
 * (받침 ㄱ은 targetPhonemes에 없을 수 있으므로)
 */
export function getImagedWordsByPhoneme(
  phoneme: string,
  position: PhonemePosition = "any",
): PracticeWord[] {
  const match = (w: PracticeWord) =>
    position === "any"
      ? w.targetPhonemes.includes(phoneme)
      : wordHasPhonemeAt(w.word, phoneme, position);
  return WORD_DATABASE.filter((w) => WORD_IMAGE_SLUGS[w.word] && match(w)).map(
    (w) => ({ ...w, imageSlug: WORD_IMAGE_SLUGS[w.word] }),
  );
}

/**
 * 유사패턴 단어 선택 (stage2·복습 공용).
 * 위치(초성/종성)가 일치하는 이미지 단어를 우선 선택하고,
 * 해당 위치 단어가 하나도 없으면(예: 받침 ㄷ) 위치 무관으로 폴백해 빈 카드를 방지한다.
 */
export function getSimilarPatternWords(
  phoneme: string,
  position: PhonemePosition = "any",
): PracticeWord[] {
  if (position === "any") return getImagedWordsByPhoneme(phoneme, "any");
  const strict = getImagedWordsByPhoneme(phoneme, position);
  return strict.length > 0 ? strict : getImagedWordsByPhoneme(phoneme, "any");
}

export function getAllWords(): PracticeWord[] {
  return WORD_DATABASE;
}

/**
 * 최소대립쌍의 대조가 일어나는 위치(초성/종성) 판정.
 * 두 단어를 분해해 처음으로 달라지는 자리가 초성이면 onset, 종성이면 coda.
 * 예) 곰/돔 → 초성(ㄱ/ㄷ) = onset, 공/곰 → 종성(ㅇ/ㅁ) = coda.
 */
function minimalPairContrastPosition(pair: MinimalPair): PhonemePosition {
  const a = decomposeWord(pair.word1);
  const b = decomposeWord(pair.word2);
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const sa = a[i];
    const sb = b[i];
    if (!sa || !sb) continue;
    if (sa.choseong !== sb.choseong) return "onset";
    if (normalizeJongseong(sa.jongseong) !== normalizeJongseong(sb.jongseong)) return "coda";
  }
  return "any";
}

/**
 * 음소를 대조하는 최소대립쌍 반환.
 * position을 지정하면 그 위치(초성/종성)에서 대조하는 쌍을 우선 반환하고,
 * 해당 위치 쌍이 없으면 전체로 폴백한다(빈 결과 방지).
 * 예) 받침 ㅁ/ㅇ 혼동 → 공/곰 같은 종성 대조쌍을 우선 제시.
 */
export function getMinimalPairsByPhoneme(
  phoneme: string,
  position: PhonemePosition = "any",
): MinimalPair[] {
  const matched = MINIMAL_PAIRS.filter(
    (p) => p.targetPhoneme === phoneme || p.contrastPhoneme === phoneme
  );
  if (position === "any") return matched;
  const positioned = matched.filter((p) => minimalPairContrastPosition(p) === position);
  return positioned.length > 0 ? positioned : matched;
}

export function getWordsByDifficulty(phoneme: string, difficulty: "easy" | "medium" | "hard"): PracticeWord[] {
  return WORD_DATABASE.filter(
    (w) => w.targetPhonemes.includes(phoneme) && w.difficulty === difficulty
  );
}
