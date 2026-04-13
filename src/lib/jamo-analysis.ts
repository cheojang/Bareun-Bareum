/**
 * 한글 자모 분해 엔진
 * 유니코드를 이용하여 한글을 초성/중성/종성으로 분해하고,
 * 두 단어를 비교하여 조음 오류를 탐지합니다.
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
    }
  },

  // [비음 시리즈]
  'ㅁ': {
    'ㅂ': {
      name: '비음의 파열음화',
      category: '대치',
      description: 'ㅁ을 파열음(ㅂ)으로 바꾸어 발음하고 있어요.',
      parentHint: '입술을 닫았다 열면서 발음해야 해요. 코로 내보내는 느낌을 빼야 합니다.'
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
 * @param targetWord 목표 단어
 * @param childWord 아이 발음
 * @returns { errorType, errorCategory, errorPattern, confidence, requiresGemini, parentHint }
 */
export function analyzeSubstitutionError(targetWord: string, childWord: string) {
  const targetDecomposed = decomposeWord(targetWord);
  const childDecomposed = decomposeWord(childWord);

  // 음절 수가 다르면 대치 아님 (탈락 또는 첨가)
  if (targetDecomposed.length !== childDecomposed.length) {
    return null;
  }

  // 각 음절에서 자음 비교
  for (let i = 0; i < targetDecomposed.length; i++) {
    const target = targetDecomposed[i];
    const child = childDecomposed[i];

    if (!target || !child) continue;

    // 초성 비교 (가장 일반적)
    if (target.choseong !== child.choseong) {
      // ㅇ(무음)으로 변하면 초성탈락
      if (child.choseong === 'ㅇ') {
        return {
          errorType: '초성탈락',
          errorCategory: '탈락',
          errorPattern: '초성 탈락',
          affectedSyllable: i,
          targetJamo: target.choseong,
          childJamo: '(없음)',
          confidence: 90,
          requiresGemini: false,
          parentHint: '첫 자음이 빠졌어요.'
        };
      }

      const patternObj = ERROR_PATTERNS[target.choseong]?.[child.choseong];
      if (patternObj) {
        return {
          errorType: patternObj.name,
          errorCategory: patternObj.category,
          errorPattern: patternObj.name,
          affectedSyllable: i,
          targetJamo: target.choseong,
          childJamo: child.choseong,
          confidence: 95,
          requiresGemini: false,
          parentHint: patternObj.parentHint,
          description: patternObj.description
        };
      }

      // ERROR_PATTERNS에 없는 자음 조합 → 패턴미인식으로 명시 반환 후 Gemini 위임
      return {
        errorType: '패턴미인식',
        errorCategory: '미판정',
        errorPattern: `${target.choseong}→${child.choseong} (미등록 패턴)`,
        affectedSyllable: i,
        targetJamo: target.choseong,
        childJamo: child.choseong,
        confidence: 30,
        requiresGemini: true,
        isUnknownPattern: true,
        note: `[${target.choseong}→${child.choseong}] 패턴이 데이터베이스에 없습니다. AI 분석을 시도합니다.`
      };
    }

    // 중성 비교
    if (target.jungseong !== child.jungseong) {
      return {
        errorType: '모음 오류',
        errorCategory: '대치',
        errorPattern: '모음 대치',
        affectedSyllable: i,
        targetJamo: target.jungseong,
        childJamo: child.jungseong,
        confidence: 80,
        requiresGemini: false
      };
    }

    // 종성 비교 — 변화 원인이 동화일 수 있으므로 Gemini 위임
    if (target.jongseong !== child.jongseong) {
      if (!child.jongseong) {
        return {
          errorType: '종성탈락',
          errorCategory: '탈락',
          errorPattern: '종성 탈락',
          affectedSyllable: i,
          targetJamo: target.jongseong,
          childJamo: '(없음)',
          confidence: 90,
          requiresGemini: false
        };
      }
      // 종성이 다른 자음으로 바뀐 경우 → 동화 가능성 → Gemini 위임
      return {
        errorType: '동화',
        errorCategory: '동화',
        errorPattern: '동화',
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
  const targetDecomposed = decomposeWord(targetWord);
  const childDecomposed = decomposeWord(childWord);

  // 아이 발음이 목표보다 짧은 경우 탈락
  if (childDecomposed.length < targetDecomposed.length) {
    const omittedCount = targetDecomposed.length - childDecomposed.length;

    // 초성 탈락 확인
    if (omittedCount === 1) {
      for (let i = 0; i < childDecomposed.length; i++) {
        const target = targetDecomposed[i];
        const child = childDecomposed[i];

        if (target && child && target.choseong !== child.choseong) {
          // 이 경우는 대치, 탈락 아님
          return null;
        }
      }

      // 첫 번째 음절 초성 확인
      if (targetDecomposed[0]?.choseong) {
        return {
          errorType: '초성탈락',
          errorCategory: '탈락',
          errorPattern: '초성 탈락',
          confidence: 90
        };
      }
    }

    // 음절 축약 (예: 고양이 → 괭이)
    if (omittedCount > 1) {
      return {
        errorType: '음절축약',
        errorCategory: '탈락',
        errorPattern: '음절 축약',
        confidence: 85
      };
    }

    return {
      errorType: '탈락',
      errorCategory: '탈락',
      errorPattern: '음절 탈락',
      confidence: 80
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
  const targetDecomposed = decomposeWord(targetWord);
  const childDecomposed = decomposeWord(childWord);

  // 아이 발음이 목표보다 긴 경우 첨가
  if (childDecomposed.length > targetDecomposed.length) {
    return {
      errorType: '음소첨가',
      errorCategory: '첨가',
      errorPattern: '음소 첨가',
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
  const substitution = analyzeSubstitutionError(targetWord, childWord);
  if (substitution) {
    return { ...substitution, requiresGemini: false };
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
