/**
 * 아동 조음 오류 시드 데이터 — WordPairCache 사전 생성용
 * 한국 SLP 임상 빈도 기반, 2~7세 아동 대표 오류 패턴 120개+
 *
 * phoneme/position/errorType은 PhonemeTemplate 조회 키와 일치해야 함
 * → seed-templates로 PhonemeTemplate을 먼저 채운 뒤 이 스크립트 실행
 */

export interface SeedWordPair {
  targetWord: string;
  childPronunciation: string;
  phoneme: string;
  position: string;   // 초성 | 어중 | 종성
  errorType: string;  // phoneme-combinations.ts의 errorType 값과 동일
  errorCategory: string;
}

export const SEED_WORD_PAIRS: SeedWordPair[] = [

  // ══════════════════════════════════════════════════════
  // ㄹ 오류 — 임상 빈도 1위 (초성 비음화·탈락, 어중·종성)
  // ══════════════════════════════════════════════════════

  // ㄹ 초성 → 비음화 (ㄹ→ㄴ)
  { targetWord:"라면",    childPronunciation:"나면",    phoneme:"ㄹ", position:"초성", errorType:"비음화",   errorCategory:"대치" },
  { targetWord:"로봇",    childPronunciation:"노봇",    phoneme:"ㄹ", position:"초성", errorType:"비음화",   errorCategory:"대치" },
  { targetWord:"리본",    childPronunciation:"니본",    phoneme:"ㄹ", position:"초성", errorType:"비음화",   errorCategory:"대치" },
  { targetWord:"레몬",    childPronunciation:"네몬",    phoneme:"ㄹ", position:"초성", errorType:"비음화",   errorCategory:"대치" },
  { targetWord:"라디오",  childPronunciation:"나디오",  phoneme:"ㄹ", position:"초성", errorType:"비음화",   errorCategory:"대치" },
  { targetWord:"리모컨",  childPronunciation:"니모컨",  phoneme:"ㄹ", position:"초성", errorType:"비음화",   errorCategory:"대치" },
  { targetWord:"로켓",    childPronunciation:"노켓",    phoneme:"ㄹ", position:"초성", errorType:"비음화",   errorCategory:"대치" },

  // ㄹ 초성 → 탈락
  { targetWord:"라면",    childPronunciation:"아면",    phoneme:"ㄹ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"리모컨",  childPronunciation:"이모컨",  phoneme:"ㄹ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"로봇",    childPronunciation:"오봇",    phoneme:"ㄹ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"레몬",    childPronunciation:"에몬",    phoneme:"ㄹ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },

  // ㄹ 어중 → 비음화
  { targetWord:"고래",    childPronunciation:"고내",    phoneme:"ㄹ", position:"어중", errorType:"비음화",   errorCategory:"대치" },
  { targetWord:"바람",    childPronunciation:"바남",    phoneme:"ㄹ", position:"어중", errorType:"비음화",   errorCategory:"대치" },
  { targetWord:"기린",    childPronunciation:"기닌",    phoneme:"ㄹ", position:"어중", errorType:"비음화",   errorCategory:"대치" },
  { targetWord:"나라",    childPronunciation:"나나",    phoneme:"ㄹ", position:"어중", errorType:"연속오류", errorCategory:"대치" },
  { targetWord:"우리",    childPronunciation:"우니",    phoneme:"ㄹ", position:"어중", errorType:"비음화",   errorCategory:"대치" },

  // ㄹ 어중 → 탈락
  { targetWord:"그림",    childPronunciation:"그임",    phoneme:"ㄹ", position:"어중", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"바람",    childPronunciation:"바암",    phoneme:"ㄹ", position:"어중", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"고래",    childPronunciation:"고에",    phoneme:"ㄹ", position:"어중", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"아이스크림", childPronunciation:"아이스크임", phoneme:"ㄹ", position:"어중", errorType:"탈락", errorCategory:"탈락" },
  { targetWord:"어른",    childPronunciation:"어은",    phoneme:"ㄹ", position:"어중", errorType:"탈락",     errorCategory:"탈락" },

  // ㄹ 종성 → 탈락
  { targetWord:"별",      childPronunciation:"벼",      phoneme:"ㄹ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"달",      childPronunciation:"다",      phoneme:"ㄹ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"물",      childPronunciation:"무",      phoneme:"ㄹ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"갈비",    childPronunciation:"가비",    phoneme:"ㄹ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"일",      childPronunciation:"이",      phoneme:"ㄹ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"발",      childPronunciation:"바",      phoneme:"ㄹ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },

  // ══════════════════════════════════════════════════════
  // ㅅ/ㅆ 오류 — 마찰음 전방화 (ㅅ→ㄷ)
  // ══════════════════════════════════════════════════════
  { targetWord:"사과",    childPronunciation:"다과",    phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"사자",    childPronunciation:"다자",    phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"수박",    childPronunciation:"두박",    phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"사탕",    childPronunciation:"다탕",    phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"신발",    childPronunciation:"딘발",    phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"소금",    childPronunciation:"도금",    phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"선생님",  childPronunciation:"던댕님",  phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"스티커",  childPronunciation:"드디커",  phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"사슴",    childPronunciation:"다듬",    phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"세수",    childPronunciation:"데두",    phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },

  // ══════════════════════════════════════════════════════
  // ㅈ/ㅉ 오류 — 파찰음 파열음화 (ㅈ→ㄷ)
  // ══════════════════════════════════════════════════════
  { targetWord:"자동차",  childPronunciation:"다동다",  phoneme:"ㅈ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"주스",    childPronunciation:"두쓰",    phoneme:"ㅈ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"자전거",  childPronunciation:"다던거",  phoneme:"ㅈ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"접시",    childPronunciation:"덥씨",    phoneme:"ㅈ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"잠자리",  childPronunciation:"담다리",  phoneme:"ㅈ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"지우개",  childPronunciation:"디우개",  phoneme:"ㅈ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"젓가락",  childPronunciation:"덛가락",  phoneme:"ㅈ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"조심",    childPronunciation:"도심",    phoneme:"ㅈ", position:"초성", errorType:"파열음화", errorCategory:"대치" },

  // ══════════════════════════════════════════════════════
  // ㅊ 오류 — 파찰음 파열음화 (ㅊ→ㄷ 또는 ㅊ→ㅌ)
  // ══════════════════════════════════════════════════════
  { targetWord:"초콜릿",  childPronunciation:"도코릿",  phoneme:"ㅊ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"치마",    childPronunciation:"디마",    phoneme:"ㅊ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"침대",    childPronunciation:"딤대",    phoneme:"ㅊ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"차",      childPronunciation:"다",      phoneme:"ㅊ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"책",      childPronunciation:"덱",      phoneme:"ㅊ", position:"초성", errorType:"파열음화", errorCategory:"대치" },

  // ══════════════════════════════════════════════════════
  // ㅎ 오류 — 탈락 (ㅎ→0)
  // ══════════════════════════════════════════════════════
  { targetWord:"하마",    childPronunciation:"아마",    phoneme:"ㅎ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"호랑이",  childPronunciation:"오랑이",  phoneme:"ㅎ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"해바라기",childPronunciation:"애바라기",phoneme:"ㅎ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"허수아비",childPronunciation:"어수아비",phoneme:"ㅎ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"하늘",    childPronunciation:"아늘",    phoneme:"ㅎ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"힘",      childPronunciation:"임",      phoneme:"ㅎ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"혀",      childPronunciation:"여",      phoneme:"ㅎ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },

  // ══════════════════════════════════════════════════════
  // ㄱ 초성 오류
  // ══════════════════════════════════════════════════════

  // 탈락
  { targetWord:"가방",    childPronunciation:"아방",    phoneme:"ㄱ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"고양이",  childPronunciation:"오양이",  phoneme:"ㄱ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },

  // 전방화 (ㄱ→ㄷ)
  { targetWord:"고기",    childPronunciation:"도디",    phoneme:"ㄱ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"고구마",  childPronunciation:"도두마",  phoneme:"ㄱ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"기차",    childPronunciation:"디차",    phoneme:"ㄱ", position:"초성", errorType:"전방화",   errorCategory:"대치" },

  // 경음화 (ㄱ→ㄲ)
  { targetWord:"가방",    childPronunciation:"까방",    phoneme:"ㄱ", position:"초성", errorType:"경음화",   errorCategory:"대치" },
  { targetWord:"고구마",  childPronunciation:"꼬구마",  phoneme:"ㄱ", position:"초성", errorType:"경음화",   errorCategory:"대치" },
  { targetWord:"기차",    childPronunciation:"끼차",    phoneme:"ㄱ", position:"초성", errorType:"경음화",   errorCategory:"대치" },

  // 기음화 (ㄱ→ㅋ)
  { targetWord:"구름",    childPronunciation:"쿠름",    phoneme:"ㄱ", position:"초성", errorType:"기음화",   errorCategory:"대치" },
  { targetWord:"기린",    childPronunciation:"키린",    phoneme:"ㄱ", position:"초성", errorType:"기음화",   errorCategory:"대치" },
  { targetWord:"가방",    childPronunciation:"카방",    phoneme:"ㄱ", position:"초성", errorType:"기음화",   errorCategory:"대치" },

  // ㄱ 종성 탈락
  { targetWord:"책",      childPronunciation:"채",      phoneme:"ㄱ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"국",      childPronunciation:"구",      phoneme:"ㄱ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"떡",      childPronunciation:"떠",      phoneme:"ㄱ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },

  // ══════════════════════════════════════════════════════
  // ㄷ 초성 오류
  // ══════════════════════════════════════════════════════

  // 경음화 (ㄷ→ㄸ)
  { targetWord:"도토리",  childPronunciation:"또토리",  phoneme:"ㄷ", position:"초성", errorType:"경음화",   errorCategory:"대치" },
  { targetWord:"다람쥐",  childPronunciation:"따람쥐",  phoneme:"ㄷ", position:"초성", errorType:"경음화",   errorCategory:"대치" },

  // 기음화 (ㄷ→ㅌ)
  { targetWord:"다리",    childPronunciation:"타리",    phoneme:"ㄷ", position:"초성", errorType:"기음화",   errorCategory:"대치" },
  { targetWord:"도로",    childPronunciation:"토로",    phoneme:"ㄷ", position:"초성", errorType:"기음화",   errorCategory:"대치" },

  // ══════════════════════════════════════════════════════
  // ㅂ 초성 오류
  // ══════════════════════════════════════════════════════

  // 경음화 (ㅂ→ㅃ)
  { targetWord:"바나나",  childPronunciation:"빠나나",  phoneme:"ㅂ", position:"초성", errorType:"경음화",   errorCategory:"대치" },
  { targetWord:"비행기",  childPronunciation:"삐행기",  phoneme:"ㅂ", position:"초성", errorType:"경음화",   errorCategory:"대치" },
  { targetWord:"버스",    childPronunciation:"뻐쓰",    phoneme:"ㅂ", position:"초성", errorType:"경음화",   errorCategory:"대치" },

  // 기음화 (ㅂ→ㅍ)
  { targetWord:"바지",    childPronunciation:"파지",    phoneme:"ㅂ", position:"초성", errorType:"기음화",   errorCategory:"대치" },
  { targetWord:"배",      childPronunciation:"패",      phoneme:"ㅂ", position:"초성", errorType:"기음화",   errorCategory:"대치" },
  { targetWord:"병원",    childPronunciation:"평원",    phoneme:"ㅂ", position:"초성", errorType:"기음화",   errorCategory:"대치" },

  // ㅂ 종성 탈락
  { targetWord:"밥",      childPronunciation:"바",      phoneme:"ㅂ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"컵",      childPronunciation:"커",      phoneme:"ㅂ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"입",      childPronunciation:"이",      phoneme:"ㅂ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"집",      childPronunciation:"지",      phoneme:"ㅂ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },

  // ══════════════════════════════════════════════════════
  // ㅇ 종성 (ㅇ 종성 탈락)
  // ══════════════════════════════════════════════════════
  { targetWord:"공",      childPronunciation:"고",      phoneme:"ㅇ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"방",      childPronunciation:"바",      phoneme:"ㅇ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"빵",      childPronunciation:"빠",      phoneme:"ㅇ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"강",      childPronunciation:"가",      phoneme:"ㅇ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"형",      childPronunciation:"혀",      phoneme:"ㅇ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"왕",      childPronunciation:"와",      phoneme:"ㅇ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"풍선",    childPronunciation:"푸선",    phoneme:"ㅇ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },

  // ══════════════════════════════════════════════════════
  // ㄴ 종성 탈락
  // ══════════════════════════════════════════════════════
  { targetWord:"눈",      childPronunciation:"누",      phoneme:"ㄴ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"손",      childPronunciation:"소",      phoneme:"ㄴ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"문",      childPronunciation:"무",      phoneme:"ㄴ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"신발",    childPronunciation:"시발",    phoneme:"ㄴ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },

  // ══════════════════════════════════════════════════════
  // ㄴ 초성 오류
  // ══════════════════════════════════════════════════════

  // 탈락
  { targetWord:"나비",    childPronunciation:"아비",    phoneme:"ㄴ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"나무",    childPronunciation:"아무",    phoneme:"ㄴ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },

  // 유음화 (ㄴ→ㄹ)
  { targetWord:"나무",    childPronunciation:"라무",    phoneme:"ㄴ", position:"초성", errorType:"유음화",   errorCategory:"대치" },
  { targetWord:"나비",    childPronunciation:"라비",    phoneme:"ㄴ", position:"초성", errorType:"유음화",   errorCategory:"대치" },

  // ══════════════════════════════════════════════════════
  // ㅁ 초성 오류
  // ══════════════════════════════════════════════════════
  { targetWord:"모자",    childPronunciation:"오자",    phoneme:"ㅁ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"모자",    childPronunciation:"보자",    phoneme:"ㅁ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"마루",    childPronunciation:"바루",    phoneme:"ㅁ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"미끄럼틀",childPronunciation:"비끄럼틀",phoneme:"ㅁ", position:"초성", errorType:"파열음화", errorCategory:"대치" },

  // ══════════════════════════════════════════════════════
  // 동화 오류 — 인접 음소 영향
  // ══════════════════════════════════════════════════════

  // 순행동화 (앞 자음의 영향)
  { targetWord:"도토리",  childPronunciation:"도도리",  phoneme:"ㄷ", position:"초성", errorType:"유성음화", errorCategory:"대치" },
  { targetWord:"기기",    childPronunciation:"기기",    phoneme:"ㄱ", position:"초성", errorType:"유성음화", errorCategory:"대치" },

  // 역행동화 (뒤 음소의 영향)
  { targetWord:"바지",    childPronunciation:"바비",    phoneme:"ㅈ", position:"초성", errorType:"순음화",   errorCategory:"동화" },
  { targetWord:"나비",    childPronunciation:"마비",    phoneme:"ㄴ", position:"초성", errorType:"순음화",   errorCategory:"동화" },

  // ══════════════════════════════════════════════════════
  // 자음군 단순화 (겹받침 → 단순화)
  // ══════════════════════════════════════════════════════
  { targetWord:"닭",      childPronunciation:"닥",      phoneme:"ㄱ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"삶",      childPronunciation:"삼",      phoneme:"ㄹ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"짧다",    childPronunciation:"짤다",    phoneme:"ㄹ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"읽다",    childPronunciation:"익다",    phoneme:"ㄹ", position:"종성", errorType:"탈락",     errorCategory:"탈락" },

  // ══════════════════════════════════════════════════════
  // 복합 어절 — 다중 오류 (가장 영향 큰 첫 오류 기준 분류)
  // ══════════════════════════════════════════════════════
  { targetWord:"자동차",  childPronunciation:"자동다",  phoneme:"ㅊ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"아이스크림",childPronunciation:"아이쓰크림",phoneme:"ㅅ", position:"초성", errorType:"경음화", errorCategory:"대치" },
  { targetWord:"사탕수수",childPronunciation:"다탕두두",phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"호랑이",  childPronunciation:"오랑이",  phoneme:"ㅎ", position:"초성", errorType:"탈락",     errorCategory:"탈락" },
  { targetWord:"지하철",  childPronunciation:"디아철",  phoneme:"ㅈ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"수영장",  childPronunciation:"두영당",  phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"라디오",  childPronunciation:"나디오",  phoneme:"ㄹ", position:"초성", errorType:"비음화",   errorCategory:"대치" },
  { targetWord:"사이렌",  childPronunciation:"다이넨",  phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
  { targetWord:"전화기",  childPronunciation:"던화기",  phoneme:"ㅈ", position:"초성", errorType:"파열음화", errorCategory:"대치" },
  { targetWord:"사인펜",  childPronunciation:"다인펜",  phoneme:"ㅅ", position:"초성", errorType:"전방화",   errorCategory:"대치" },
];
