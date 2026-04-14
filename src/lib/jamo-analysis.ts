/**
 * 한글 자모 분해 엔진
 * 유니코드를 이용하여 한글을 초성/중성/종성으로 분해하고,
 * 두 단어를 비교하여 조음 오류를 탐지합니다.
 *
 * [수정 이력]
 * - fix: 초성 'ㅇ'(음가 없음) → 다른 자음 변화는 "대치"가 아닌 "첨가"로 처리
 * - fix: 목표보다 아이 발음이 길 때 음절 수준 첨가 감지 보강
 * - fix: 겹받침(ㄳ, ㄵ 등)을 첫 자음으로 분해해 조음 정보 조회
 * - feat: CONSONANT_INFO 기반 세부 패턴 판별 (경음화, 치조음화 등)
 * - feat: VOWEL_INFO 추가 (모음 고/저/전/후설 정보)
 */

// 한글 자모 테이블
const CHOSEONG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const JUNGSEONG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ', 'ㅤ', 'ㅥ', 'ㅦ', 'ㅧ', 'ㅨ'
];

const JONGSEONG = [
  '', // 0: 종성 없음
  'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// ─── 겹받침 → 대표 단일 자음 분해 테이블 ─────────────────────────────────────
// "앉다→안다"처럼 겹받침이 단일 자음으로 분석될 때 첫 자음 정보로 fallback
const COMPOUND_JONGSEONG: Record<string, string> = {
  'ㄳ': 'ㄱ', 'ㄵ': 'ㄴ', 'ㄶ': 'ㄴ', 'ㄺ': 'ㄹ',
  'ㄻ': 'ㄹ', 'ㄼ': 'ㄹ', 'ㄽ': 'ㄹ', 'ㄾ': 'ㄹ',
  'ㄿ': 'ㄹ', 'ㅀ': 'ㄹ', 'ㅄ': 'ㅂ',
};

/** 겹받침이면 대표 단일 자음 반환, 아니면 그대로 반환 */
function normalizeJongseong(j: string): string {
  return COMPOUND_JONGSEONG[j] ?? j;
}

// ─── 자음 조음 정보 ────────────────────────────────────────────────────────────
interface ConsonantInfo {
  place: string;    // 조음 위치 (양순음/치조음/경구개음/연구개음/성문음)
  manner: string;   // 조음 방법 (파열음/마찰음/파찰음/비음/유음)
  tense: boolean;   // 경음 여부 (ㄲ ㄸ ㅃ ㅆ ㅉ)
  aspirated: boolean; // 기음 여부 (ㅋ ㅌ ㅍ ㅊ ㅎ)
}

const CONSONANT_INFO: Record<string, ConsonantInfo> = {
  'ㄱ': { place: '연구개음', manner: '파열음',  tense: false, aspirated: false },
  'ㄲ': { place: '연구개음', manner: '파열음',  tense: true,  aspirated: false },
  'ㅋ': { place: '연구개음', manner: '파열음',  tense: false, aspirated: true  },
  'ㄷ': { place: '치조음',   manner: '파열음',  tense: false, aspirated: false },
  'ㄸ': { place: '치조음',   manner: '파열음',  tense: true,  aspirated: false },
  'ㅌ': { place: '치조음',   manner: '파열음',  tense: false, aspirated: true  },
  'ㅂ': { place: '양순음',   manner: '파열음',  tense: false, aspirated: false },
  'ㅃ': { place: '양순음',   manner: '파열음',  tense: true,  aspirated: false },
  'ㅍ': { place: '양순음',   manner: '파열음',  tense: false, aspirated: true  },
  'ㅅ': { place: '치조음',   manner: '마찰음',  tense: false, aspirated: false },
  'ㅆ': { place: '치조음',   manner: '마찰음',  tense: true,  aspirated: false },
  'ㅎ': { place: '성문음',   manner: '마찰음',  tense: false, aspirated: true  },
  'ㅈ': { place: '경구개음', manner: '파찰음',  tense: false, aspirated: false },
  'ㅉ': { place: '경구개음', manner: '파찰음',  tense: true,  aspirated: false },
  'ㅊ': { place: '경구개음', manner: '파찰음',  tense: false, aspirated: true  },
  'ㄴ': { place: '치조음',   manner: '비음',    tense: false, aspirated: false },
  'ㅁ': { place: '양순음',   manner: '비음',    tense: false, aspirated: false },
  'ㅇ': { place: '연구개음', manner: '비음',    tense: false, aspirated: false }, // 종성 ㅇ만 [ŋ]
  'ㄹ': { place: '치조음',   manner: '유음',    tense: false, aspirated: false },
};

// ─── 모음 조음 정보 ────────────────────────────────────────────────────────────
interface VowelInfo {
  height: string;    // 혀 높이: 고모음/중모음/저모음
  backness: string;  // 혀 위치: 전설/후설
  rounded: boolean;  // 원순 여부
}

const VOWEL_INFO: Record<string, VowelInfo> = {
  'ㅏ': { height: '저모음',  backness: '후설', rounded: false },
  'ㅐ': { height: '중모음',  backness: '전설', rounded: false },
  'ㅑ': { height: '저모음',  backness: '후설', rounded: false },
  'ㅒ': { height: '중모음',  backness: '전설', rounded: false },
  'ㅓ': { height: '중모음',  backness: '후설', rounded: false },
  'ㅔ': { height: '중모음',  backness: '전설', rounded: false },
  'ㅕ': { height: '중모음',  backness: '후설', rounded: false },
  'ㅖ': { height: '중모음',  backness: '전설', rounded: false },
  'ㅗ': { height: '고모음',  backness: '후설', rounded: true  },
  'ㅛ': { height: '고모음',  backness: '후설', rounded: true  },
  'ㅜ': { height: '고모음',  backness: '후설', rounded: true  },
  'ㅠ': { height: '고모음',  backness: '후설', rounded: true  },
  'ㅡ': { height: '고모음',  backness: '후설', rounded: false },
  'ㅣ': { height: '고모음',  backness: '전설', rounded: false },
};

/**
 * CONSONANT_INFO를 이용해 두 자음 간 세부 대치 패턴 판별
 * ERROR_PATTERNS 테이블에 없는 조합에 대한 fallback
 */
function getDetailedSubstitutionPattern(
  target: string,
  heard: string
): { name: string; description: string } | null {
  const t = CONSONANT_INFO[target];
  const h = CONSONANT_INFO[heard];
  if (!t || !h) return null;

  // 같은 조음 위치, 예사소리 → 경음
  if (t.place === h.place && !t.tense && h.tense && !h.aspirated) {
    return { name: '경음화', description: `${target}을 더 강하게 ${heard}로 발음하고 있어요.` };
  }
  // 같은 조음 위치, 예사소리 → 기음
  if (t.place === h.place && !t.aspirated && h.aspirated) {
    return { name: '기음화', description: `${target}을 숨을 내뿜는 ${heard}로 발음하고 있어요.` };
  }
  // 연구개음 → 치조음 (ㄱ→ㄷ 등)
  if (t.place === '연구개음' && h.place === '치조음') {
    return { name: '치조음화', description: `혀가 뒤에서 앞쪽으로 이동해 ${target} 대신 ${heard}를 발음하고 있어요.` };
  }
  // 치조음 → 연구개음 (ㄷ→ㄱ 등)
  if (t.place === '치조음' && h.place === '연구개음') {
    return { name: '연구개음화', description: `혀가 앞에서 뒤쪽으로 이동해 ${target} 대신 ${heard}를 발음하고 있어요.` };
  }
  // 마찰음 → 파열음
  if (t.manner === '마찰음' && h.manner === '파열음') {
    return { name: '파열음화', description: `바람 소리(${target})를 막히는 소리(${heard})로 발음하고 있어요.` };
  }
  // 파열음 → 비음
  if (t.manner === '파열음' && h.manner === '비음') {
    return { name: '비음화', description: `막히는 소리(${target})를 코 소리(${heard})로 발음하고 있어요.` };
  }
  // 비음 → 파열음
  if (t.manner === '비음' && h.manner === '파열음') {
    return { name: '탈비음화', description: `코 소리(${target})를 막히는 소리(${heard})로 발음하고 있어요.` };
  }
  // 유음 관련
  if (t.manner === '유음' && h.manner !== '유음') {
    return { name: '유음대치', description: `혀를 굴리는 소리(${target})를 다른 소리(${heard})로 바꾸고 있어요.` };
  }

  return null;
}

/**
 * 한 글자를 초성/중성/종성으로 분해
 * @param char 한글 글자
 * @returns { choseong, jungseong, jongseong } 또는 null
 */
export function decomposeChar(char: string) {
  const code = char.charCodeAt(0);

  // 한글 범위 확인 (AC00 ~ D7A3)
  if (code < 0xac00 || code > 0xd7a3) {
    return null;
  }

  const temp = code - 0xac00;
  const jongseongIdx = temp % 28;
  const jungseongIdx = Math.floor((temp % 588) / 28);
  const choseongIdx = Math.floor(temp / 588);

  return {
    choseong: CHOSEONG[choseongIdx],
    jungseong: JUNGSEONG[jungseongIdx],
    jongseong: JONGSEONG[jongseongIdx],
    choseongIdx,
    jungseongIdx,
    jongseongIdx
  };
}

/**
 * 단어 전체를 분해 (각 글자의 자모)
 * @param word 한글 단어
 * @returns 분해된 자모 배열
 */
export function decomposeWord(word: string) {
  const result: ReturnType<typeof decomposeChar>[] = [];

  for (const char of word) {
    const decomposed = decomposeChar(char);
    if (decomposed) {
      result.push(decomposed);
    } else {
      // 한글이 아닌 문자는 null로 추가
      result.push(null);
    }
  }

  return result;
}

/**
 * 오류 패턴 매칭 테이블 (언어치료학적 분류)
 * 목표 자음 → 아이 자음 → { 패턴명, 카테고리, 설명 }
 */
interface ErrorPattern {
  name: string;
  category: '대치' | '동화' | '탈락' | '첨가';
  description: string; // 부모 친화적 설명
  parentHint: string; // "바람이 숨어버렸어요!" 같은 표현
}

const ERROR_PATTERNS: Record<string, Record<string, ErrorPattern>> = {
  // ═══════════════════════════════════════════════════════════
  // 대치 (Substitution) - 한 음소가 다른 음소로 바뀜
  // ═══════════════════════════════════════════════════════════

  // [마찰음→파열음화] 시원한 바람이 막혀버리는 현상
  'ㅅ': {
    'ㄷ': {
      name: '마찰음의 파열음화',
      category: '대치',
      description: '시원한 바람 소리(ㅅ)를 내지 못하고, 혀로 꽉 막아버리는 파열음(ㄷ)으로 바꾸고 있어요.',
      parentHint: '바람이 숨어버렸어요! 혀가 꽉 닫혀서 강한 소리가 나고 있어요.'
    },
    'ㄲ': {
      name: '마찰음의 경음화',
      category: '대치',
      description: '시원한 바람 소리(ㅅ)를 경음(ㄲ)으로 발음하고 있어요.',
      parentHint: '힘을 주어서 발음하는 습관이 있어요.'
    },
    'ㄱ': {
      name: '마찰음의 연구개음화',
      category: '대치',
      description: '시원한 바람 소리(ㅅ)를 목 뒤쪽 소리(ㄱ)로 바꾸고 있어요.',
      parentHint: '혀 위치가 뒤로 물러나고 있는 것 같아요.'
    },
    'ㅆ': {
      name: '마찰음의 경음화 (쌍시옷)',
      category: '대치',
      description: '시원한 바람 소리(ㅅ)를 경음의 쌍시옷(ㅆ)으로 발음하고 있어요.',
      parentHint: '더 강하게 발음하려는 경향이 있어요.'
    }
  },

  // [마찰음 시리즈 상호 교환]
  'ㅈ': {
    'ㅉ': {
      name: '마찰음의 경음화',
      category: '대치',
      description: 'ㅈ을 더 강하게 경음(ㅉ)으로 발음하고 있어요.',
      parentHint: '혀와 입천장에 더 큰 힘을 주고 있어요.'
    },
    'ㅊ': {
      name: '마찰음 상호교환',
      category: '대치',
      description: 'ㅈ을 ㅊ으로 바꾸어 발음하고 있어요.',
      parentHint: '입술과 혀 위치의 미세한 차이를 아직 구분 못 하고 있어요.'
    },
    'ㅅ': {
      name: '마찰음 교환 (ㅈ→ㅅ)',
      category: '대치',
      description: 'ㅈ을 더 약한 마찰음(ㅅ)으로 바꾸어 발음하고 있어요.',
      parentHint: '혀 위치를 입천장 앞쪽에서 뒤쪽으로 옮기도록 도와주세요.'
    }
  },

  'ㅊ': {
    'ㅈ': {
      name: '마찰음 상호교환',
      category: '대치',
      description: 'ㅊ을 ㅈ으로 바꾸어 발음하고 있어요.',
      parentHint: '입술과 혀 위치의 미세한 차이를 아직 구분 못 하고 있어요.'
    },
    'ㅉ': {
      name: '마찰음의 경음화',
      category: '대치',
      description: 'ㅊ을 경음(ㅉ)으로 발음하고 있어요.',
      parentHint: '혀와 입천장에 더 큰 힘을 주고 있어요.'
    }
  },

  // [유음의 비음화] 혀를 굴려야 하는데 코로 내는 현상
  'ㄹ': {
    'ㄴ': {
      name: '유음의 비음화',
      category: '대치',
      description: '혀를 굴려야 하는 음(ㄹ)을 코로 내는 음(ㄴ)으로 바꾸고 있어요.',
      parentHint: '혀를 굴리는 방법을 아직 배우지 못했어요. 혀를 치아뒤에서 굴려보세요!'
    },
    'ㄷ': {
      name: '유음의 파열음화',
      category: '대치',
      description: '혀를 굴려야 하는 음(ㄹ)을 파열음(ㄷ)으로 바꾸고 있어요.',
      parentHint: '혀를 굴리지 못하고 한 번 튕기는 형태로 발음하고 있어요.'
    },
    'ㄲ': {
      name: '유음의 경음화',
      category: '대치',
      description: 'ㄹ을 경음(ㄲ)으로 더 강하게 발음하고 있어요.',
      parentHint: '혀를 굴릴 때 너무 많은 힘을 주고 있어요. 가볍게 굴려보세요.'
    },
    'ㅇ': {
      name: '유음의 초성탈락',
      category: '탈락',
      description: 'ㄹ 음소가 완전히 빠지고 있어요. (예: 라도 → 아도)',
      parentHint: '혀를 굴리는 움직임을 아직 습득하지 못했어요. 천천히 따라 해보세요.'
    }
  },

  // [파열음 상호교환] 혀 위치의 차이 구분 못 함
  'ㄱ': {
    'ㄲ': {
      name: '파열음의 경음화',
      category: '대치',
      description: 'ㄱ을 경음(ㄲ)으로 더 강하게 발음하고 있어요.',
      parentHint: '혀가 목 뒤쪽을 더 세게 막고 있어요.'
    },
    'ㅋ': {
      name: '파열음의 기음화',
      category: '대치',
      description: 'ㄱ을 기음(ㅋ)으로 바꾸어 발음하고 있어요.',
      parentHint: '숨을 더 세게 내보내고 있어요.'
    },
    'ㄷ': {
      name: '파열음의 치조음화',
      category: '대치',
      description: 'ㄱ을 치조음(ㄷ)으로 바꾸어 발음하고 있어요.',
      parentHint: '혀가 위 이빨 뒤쪽에 닿고 있어요. 목 뒤쪽에 닿도록 해야 해요.'
    }
  },

  'ㄷ': {
    'ㄸ': {
      name: '파열음의 경음화',
      category: '대치',
      description: 'ㄷ을 경음(ㄸ)으로 더 강하게 발음하고 있어요.',
      parentHint: '혀가 입천장을 더 강하게 막고 있어요.'
    },
    'ㅌ': {
      name: '파열음의 기음화',
      category: '대치',
      description: 'ㄷ을 기음(ㅌ)으로 바꾸어 발음하고 있어요.',
      parentHint: '숨을 더 세게 내보내고 있어요.'
    },
    'ㄱ': {
      name: '파열음의 연구개음화',
      category: '대치',
      description: 'ㄷ을 연구개음(ㄱ)으로 바꾸어 발음하고 있어요.',
      parentHint: '혀가 뒤로 물러나고 있어요. 앞니 뒤에 닿도록 도와주세요.'
    }
  },

  'ㅂ': {
    'ㅃ': {
      name: '파열음의 경음화',
      category: '대치',
      description: 'ㅂ을 경음(ㅃ)으로 더 강하게 발음하고 있어요.',
      parentHint: '입술에 더 큰 힘을 주고 있어요.'
    },
    'ㅍ': {
      name: '파열음의 기음화',
      category: '대치',
      description: 'ㅂ을 기음(ㅍ)으로 바꾸어 발음하고 있어요.',
      parentHint: '숨을 더 세게 내보내고 있어요.'
    },
    'ㅁ': {
      name: '양순동화 (파열음→비음)',
      category: '동화',
      description: 'ㅂ을 비음(ㅁ)으로 바꾸어 발음하고 있어요.',
      parentHint: '입술을 닫아서 코로 바람을 내보내고 있어요.'
    },
    'ㅇ': {
      name: '양순음의 초성탈락',
      category: '탈락',
      description: 'ㅂ이 완전히 빠지고 있어요. (예: 바나나 → 아나나)',
      parentHint: '입술 접촉 움직임을 배워야 해요. 손가락으로 입술을 터치하게 해보세요.'
    }
  },

  // [비음 시리즈]
  'ㅁ': {
    'ㅂ': {
      name: '비음의 파열음화',
      category: '대치',
      description: 'ㅁ을 파열음(ㅂ)으로 바꾸어 발음하고 있어요.',
      parentHint: '입술을 닫았다 열면서 발음해야 해요. 코로 내보내는 느낌을 빼야 합니다.'
    },
    'ㅇ': {
      name: '비음의 초성탈락',
      category: '탈락',
      description: 'ㅁ이 완전히 빠지고 있어요. (예: 마 → 아)',
      parentHint: '코로 내보내는 소리를 배우지 못했어요. 콧소리를 내도록 유도해보세요.'
    },
    'ㄱ': {
      name: '비음→파열음 치환 (ㅁ→ㄱ)',
      category: '대치',
      description: 'ㅁ을 뒤쪽 파열음(ㄱ)으로 바꾸어 발음하고 있어요.',
      parentHint: '입술을 닫는 것이 아니라 혀 뒤쪽을 막고 있어요. 입술 닫기 연습을 도와주세요.'
    }
  },

  'ㄴ': {
    'ㄷ': {
      name: '비음의 파열음화',
      category: '대치',
      description: 'ㄴ을 파열음(ㄷ)으로 바꾸어 발음하고 있어요.',
      parentHint: '혀를 코에서 입천장으로 옮겨서 발음해야 해요.'
    },
    'ㅁ': {
      name: '양순동화 (비음 상호교환)',
      category: '동화',
      description: 'ㄴ을 양순 비음(ㅁ)으로 바꾸어 발음하고 있어요.',
      parentHint: '코로 내보내되, 입술을 닫아야 해요.'
    },
    'ㅇ': {
      name: '비음의 초성탈락 (ㄴ탈락)',
      category: '탈락',
      description: 'ㄴ이 완전히 빠지고 있어요. (예: 나라 → 아라)',
      parentHint: '혀끝을 윗잇몸에 붙이면서 콧소리를 내는 연습이 필요해요.'
    }
  },

  // [ㅎ 시리즈 (중요한 누락 패턴)]
  'ㅎ': {
    'ㅇ': {
      name: 'ㅎ의 무성화/탈락',
      category: '탈락',
      description: 'ㅎ 소리를 내지 못하고 무성 모음으로 발음하고 있어요.',
      parentHint: '숨을 가늘게 내보내면서 "호" 소리를 내도록 도와주세요.'
    },
    'ㄱ': {
      name: 'ㅎ의 경음화',
      category: '대치',
      description: 'ㅎ을 ㄱ으로 발음하고 있어요.',
      parentHint: '혀가 뒤로 물러나고 있어요. 목 뒤쪽을 더 세게 막으려는 경향이 있습니다.'
    }
  },

  // ═══════════════════════════════════════════════════════════
  // 동화 (Assimilation) - 이웃한 음소의 영향으로 변함
  // ═══════════════════════════════════════════════════════════
  // (종성 변화는 주로 Gemini에서 처리하지만, 여기도 패턴 추가 가능)
};

/**
 * 대치/동화/탈락 카테고리별 설명 메타데이터
 */
export const ERROR_CATEGORY_INFO = {
  '대치': {
    label: '음소가 다른 음소로 바뀌었어요',
    example: '사과 → 따과 (ㅅ이 ㄷ으로 바뀜)',
  },
  '동화': {
    label: '이웃한 음소의 영향을 받았어요',
    example: '신발 → 심발 (뒤에 오는 ㅂ의 영향으로 ㄴ이 ㅁ으로 바뀜)',
  },
  '탈락': {
    label: '음소가 빠졌어요',
    example: '할머니 → 하니 (음절이 줄어듦)',
  },
  '첨가': {
    label: '음소가 추가되었어요',
    example: '개 → 개에 (음절이 늘어남)',
  },
  '개별습관': {
    label: '아이만의 독특한 발음 습관이에요',
    example: '일반적인 패턴으로 분류되지 않는 개인적인 발음 특성',
  },
};

/**
 * 오류 분석 - 대치 오류 탐지
 * fix: 초성 'ㅇ'(음가 없음) 특별 처리
 *   - target='ㅇ', heard=다른자음 → 첨가 (무음 자리에 소리가 생김)
 *   - target=다른자음, heard='ㅇ' → 탈락 (소리가 사라짐)
 * fix: 겹받침은 normalizeJongseong으로 단일 자음 변환 후 비교
 * feat: ERROR_PATTERNS 미등록 시 CONSONANT_INFO 기반 세부 패턴 판별
 */
export function analyzeSubstitutionError(targetWord: string, childWord: string) {
  const targetDecomposed = decomposeWord(targetWord);
  const childDecomposed = decomposeWord(childWord);

  // 음절 수가 다르면 대치 아님 (탈락 또는 첨가)
  if (targetDecomposed.length !== childDecomposed.length) {
    return null;
  }

  for (let i = 0; i < targetDecomposed.length; i++) {
    const target = targetDecomposed[i];
    const child = childDecomposed[i];

    if (!target || !child) continue;

    // ── 초성 비교 ──────────────────────────────────────────────────────────
    if (target.choseong !== child.choseong) {
      const tCho = target.choseong;
      const cCho = child.choseong;

      // [fix] 초성 'ㅇ'은 음가 없음 (placeholder)
      // target='ㅇ' → heard=실제자음: 없던 소리가 생긴 "첨가"
      if (tCho === 'ㅇ' && cCho !== 'ㅇ') {
        return {
          errorType: '초성첨가',
          errorCategory: '첨가' as const,
          errorPattern: `초성 첨가 (ㅇ→${cCho})`,
          affectedSyllable: i,
          targetJamo: '(없음)',
          childJamo: cCho,
          confidence: 90,
          requiresGemini: false,
          parentHint: `없어야 할 ${cCho} 소리가 앞에 생겼어요.`
        };
      }

      // target=실제자음 → heard='ㅇ': 소리가 사라진 "탈락"
      if (tCho !== 'ㅇ' && cCho === 'ㅇ') {
        const patternEntry = ERROR_PATTERNS[tCho]?.['ㅇ'];
        return {
          errorType: patternEntry?.name ?? '초성탈락',
          errorCategory: '탈락' as const,
          errorPattern: '초성 탈락',
          affectedSyllable: i,
          targetJamo: tCho,
          childJamo: '(없음)',
          confidence: 90,
          requiresGemini: false,
          parentHint: patternEntry?.parentHint ?? `${tCho} 소리가 빠졌어요.`,
          description: patternEntry?.description
        };
      }

      // 둘 다 실제 자음인 경우 — 대치
      // 1순위: ERROR_PATTERNS 테이블 조회
      const patternObj = ERROR_PATTERNS[tCho]?.[cCho];
      if (patternObj) {
        return {
          errorType: patternObj.name,
          errorCategory: patternObj.category,
          errorPattern: patternObj.name,
          affectedSyllable: i,
          targetJamo: tCho,
          childJamo: cCho,
          confidence: 95,
          requiresGemini: patternObj.category === '동화',
          parentHint: patternObj.parentHint,
          description: patternObj.description
        };
      }

      // 2순위: CONSONANT_INFO 기반 세부 패턴 판별
      const detailedPattern = getDetailedSubstitutionPattern(tCho, cCho);
      if (detailedPattern) {
        return {
          errorType: detailedPattern.name,
          errorCategory: '대치' as const,
          errorPattern: detailedPattern.name,
          affectedSyllable: i,
          targetJamo: tCho,
          childJamo: cCho,
          confidence: 75,
          requiresGemini: false,
          parentHint: detailedPattern.description,
          description: detailedPattern.description
        };
      }

      // 3순위: 미등록 패턴 → Gemini 위임
      return {
        errorType: '패턴미인식',
        errorCategory: '미판정' as const,
        errorPattern: `${tCho}→${cCho} (미등록 패턴)`,
        affectedSyllable: i,
        targetJamo: tCho,
        childJamo: cCho,
        confidence: 30,
        requiresGemini: true,
        isUnknownPattern: true,
        note: `[${tCho}→${cCho}] 패턴이 데이터베이스에 없습니다. AI 분석을 시도합니다.`
      };
    }

    // ── 중성(모음) 비교 ────────────────────────────────────────────────────
    if (target.jungseong !== child.jungseong) {
      const tV = VOWEL_INFO[target.jungseong];
      const cV = VOWEL_INFO[child.jungseong];
      let vowelDetail = '모음 대치';
      if (tV && cV) {
        if (tV.height !== cV.height) vowelDetail = `모음 높이 변화 (${tV.height}→${cV.height})`;
        else if (tV.backness !== cV.backness) vowelDetail = `모음 위치 변화 (${tV.backness}→${cV.backness})`;
        else if (tV.rounded !== cV.rounded) vowelDetail = `원순성 변화`;
      }
      return {
        errorType: '모음 오류',
        errorCategory: '대치' as const,
        errorPattern: vowelDetail,
        affectedSyllable: i,
        targetJamo: target.jungseong,
        childJamo: child.jungseong,
        confidence: 80,
        requiresGemini: false,
        parentHint: `모음 ${target.jungseong}를 ${child.jungseong}로 발음하고 있어요.`
      };
    }

    // ── 종성(받침) 비교 ────────────────────────────────────────────────────
    // [fix] 겹받침은 단일 자음으로 정규화해서 비교
    const tJong = normalizeJongseong(target.jongseong);
    const cJong = normalizeJongseong(child.jongseong);

    if (tJong !== cJong) {
      if (!cJong) {
        return {
          errorType: '종성탈락',
          errorCategory: '탈락' as const,
          errorPattern: '종성 탈락',
          affectedSyllable: i,
          targetJamo: target.jongseong,
          childJamo: '(없음)',
          confidence: 90,
          requiresGemini: false,
          parentHint: `받침 ${target.jongseong} 소리가 빠졌어요.`
        };
      }
      // 종성이 다른 자음으로 바뀐 경우 → 동화 가능성 → Gemini 위임
      return {
        errorType: '동화',
        errorCategory: '동화' as const,
        errorPattern: `종성 변화 (${target.jongseong}→${child.jongseong})`,
        affectedSyllable: i,
        targetJamo: target.jongseong,
        childJamo: child.jongseong,
        confidence: 60,
        requiresGemini: true,
        note: '종성 변화는 동화 오류 가능성 있음. Gemini 분석 필요'
      };
    }
  }

  return null;
}

/**
 * 오류 분석 - 탈락 오류 탐지
 * @param targetWord 목표 단어
 * @param childWord 아이 발음
 * @returns { errorType, errorCategory, errorPattern, confidence }
 */
export function analyzeOmissionError(targetWord: string, childWord: string) {
  const tLen = targetWord.length;
  const cLen = childWord.length;

  // 아이 발음이 목표보다 짧은 경우 탈락 (글자 수 비교로 음절 탈락 판정)
  if (cLen < tLen) {
    const omittedCount = tLen - cLen;
    return {
      errorType: omittedCount > 1 ? '음절축약' : '음절탈락',
      errorCategory: '탈락' as const,
      errorPattern: omittedCount > 1 ? '여러 음절이 생략됨' : '한 음절이 생략됨',
      confidence: 85
    };
  }

  return null;
}

/**
 * 오류 분석 - 첨가 오류 탐지
 * @param targetWord 목표 단어
 * @param childWord 아이 발음
 * @returns { errorType, errorCategory, errorPattern, confidence }
 */
export function analyzeAdditionError(targetWord: string, childWord: string) {
  // 아이 발음이 목표보다 긴 경우 첨가 (글자 수 비교로 음절 첨가 판정)
  if (childWord.length > targetWord.length) {
    return {
      errorType: '음절첨가',
      errorCategory: '첨가' as const,
      errorPattern: '없는 글자가 추가됨',
      confidence: 90
    };
  }

  return null;
}

/**
 * 통합 오류 분석 (우선순위: 대치 > 탈락 > 첨가)
 * @param targetWord 목표 단어
 * @param childWord 아이 발음
 * @returns 분석 결과
 */
export function analyzeError(targetWord: string, childWord: string) {
  // 정확히 같으면 오류 없음
  if (targetWord === childWord) {
    return { errorType: '정상', confidence: 100, requiresGemini: false };
  }

  // 1. 대치 오류 우선 확인
  // [fix] requiresGemini를 false로 덮어씌우지 않음 (동화 오류는 true 유지)
  const substitution = analyzeSubstitutionError(targetWord, childWord);
  if (substitution) {
    return substitution;
  }

  // 2. 탈락 오류 확인
  const omission = analyzeOmissionError(targetWord, childWord);
  if (omission) {
    return { ...omission, requiresGemini: false };
  }

  // 3. 첨가 오류 확인
  const addition = analyzeAdditionError(targetWord, childWord);
  if (addition) {
    return { ...addition, requiresGemini: false };
  }

  // 4. 동화 등 복잡한 오류는 Gemini로 위임
  return {
    errorType: '복합오류',
    errorCategory: '미판정',
    errorPattern: '맥락 필요',
    confidence: 40,
    requiresGemini: true,
    isUnknownPattern: true,
    note: '로컬 엔진으로 판정 불가. Gemini API 호출 필요'
  };
}

/**
 * 자모 정보 추출 (JSON 형식)
 * @param word 한글 단어
 * @returns JSON 문자열
 */
export function getJamoDetails(word: string) {
  const decomposed = decomposeWord(word);
  const details = decomposed.map((d, idx) => {
    if (!d) return { index: idx, char: word[idx], type: 'non-korean' };

    return {
      index: idx,
      char: word[idx],
      choseong: d.choseong,
      jungseong: d.jungseong,
      jongseong: d.jongseong
    };
  });

  return JSON.stringify(details);
}

/**
 * 오류 분석 결과를 JSON으로 반환
 * @param targetWord 목표 단어
 * @param childWord 아이 발음
 * @returns LocalAnalysis 저장용 JSON
 */
export function getLocalAnalysisResult(targetWord: string, childWord: string) {
  const analysis = analyzeError(targetWord, childWord);

  return {
    detectedPattern: analysis.errorType,
    jamoBreakdown: {
      target: getJamoDetails(targetWord),
      child: getJamoDetails(childWord)
    },
    confidence: analysis.confidence,
    requiresGemini: analysis.requiresGemini,
    analysis
  };
}
