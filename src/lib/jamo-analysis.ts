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
 * 오류 패턴 매칭 테이블
 * 목표 자음 → 아이 자음 → 패턴명
 */
const ERROR_PATTERNS: Record<string, Record<string, string>> = {
  // 대치 (Substitution)
  'ㅅ': {
    'ㄷ': '경음화', // 사과 → 따과
    'ㄱ': '음화',
    'ㄹ': '유음의 비음화'
  },
  'ㄱ': {
    'ㄲ': '경음화',
    'ㅋ': '기음화'
  },
  'ㄴ': {
    'ㅁ': '양순동화 (순행)' // 신발 → 심발 (선택)
  },
  'ㄷ': {
    'ㄸ': '경음화',
    'ㅌ': '기음화',
    'ㄱ': '음화'
  },
  'ㄹ': {
    'ㄴ': '유음의 비음화', // 라디오 → 나디오
    'ㄷ': '음화'
  },
  'ㅂ': {
    'ㅃ': '경음화',
    'ㅍ': '기음화',
    'ㅁ': '양순동화'
  },
  'ㅈ': {
    'ㅉ': '경음화',
    'ㅊ': '기음화'
  },
  'ㅎ': {
    'ㅍ': '기음화',
    '∅': '탈락'
  }
};

/**
 * 오류 분석 - 대치 오류 탐지
 * @param targetWord 목표 단어
 * @param childWord 아이 발음
 * @returns { errorType, errorCategory, errorPattern, confidence, requiresGemini }
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
          requiresGemini: false
        };
      }

      const pattern = ERROR_PATTERNS[target.choseong]?.[child.choseong];
      if (pattern) {
        return {
          errorType: pattern,
          errorCategory: '대치',
          errorPattern: pattern,
          affectedSyllable: i,
          targetJamo: target.choseong,
          childJamo: child.choseong,
          confidence: 95,
          requiresGemini: false
        };
      }
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
    confidence: 50,
    requiresGemini: true,
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
