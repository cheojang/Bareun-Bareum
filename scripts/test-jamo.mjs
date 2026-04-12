/**
 * 자모 분해 엔진 테스트 스크립트
 * 실행: node scripts/test-jamo.mjs
 */

// ─── 자모 분해 엔진 (jamo-analysis.ts 직접 포함) ─────────────────────────────

const CHOSEONG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];
const JUNGSEONG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ', 'ㅤ', 'ㅥ', 'ㅦ', 'ㅧ', 'ㅨ'
];
const JONGSEONG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const ERROR_PATTERNS = {
  'ㅅ': { 'ㄷ': '경음화', 'ㄸ': '경음화', 'ㅆ': '경음화' },
  'ㄱ': { 'ㄲ': '경음화', 'ㅋ': '기음화', 'ㄷ': '치조음화' },
  'ㄷ': { 'ㄸ': '경음화', 'ㅌ': '기음화', 'ㄱ': '연구개음화' },
  'ㄹ': { 'ㄴ': '유음의 비음화' },
  'ㅂ': { 'ㅃ': '경음화', 'ㅍ': '기음화', 'ㅁ': '양순동화' },
  'ㅈ': { 'ㅉ': '경음화', 'ㅊ': '기음화' },
};

function decomposeChar(char) {
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;
  const temp = code - 0xac00;
  return {
    choseong: CHOSEONG[Math.floor(temp / 588)],
    jungseong: JUNGSEONG[Math.floor((temp % 588) / 28)],
    jongseong: JONGSEONG[temp % 28],
  };
}

function analyzeError(targetWord, childWord) {
  if (targetWord === childWord) return { errorType: '정상', confidence: 100, requiresGemini: false };

  const tArr = [...targetWord].map(decomposeChar);
  const cArr = [...childWord].map(decomposeChar);

  // 음절 수 다름 → 탈락 or 첨가
  if (tArr.length !== cArr.length) {
    if (cArr.length < tArr.length) {
      return { errorType: cArr.length === tArr.length - 1 ? '음절탈락' : '음절축약', errorCategory: '탈락', confidence: 85, requiresGemini: false };
    }
    return { errorType: '음절첨가', errorCategory: '첨가', confidence: 85, requiresGemini: false };
  }

  // 각 음절 비교
  for (let i = 0; i < tArr.length; i++) {
    const t = tArr[i], c = cArr[i];
    if (!t || !c) continue;

    if (t.choseong !== c.choseong) {
      // ㅇ(무음)으로 변하면 초성탈락
      if (c.choseong === 'ㅇ') {
        return { errorType: '초성탈락', errorCategory: '탈락', affectedSyllable: i, targetJamo: t.choseong, childJamo: '(없음)', confidence: 90, requiresGemini: false };
      }
      const pattern = ERROR_PATTERNS[t.choseong]?.[c.choseong];
      if (pattern) {
        return { errorType: pattern, errorCategory: '대치', affectedSyllable: i, targetJamo: t.choseong, childJamo: c.choseong, confidence: 95, requiresGemini: false };
      }
      return { errorType: '복합오류', errorCategory: '동화', affectedSyllable: i, targetJamo: t.choseong, childJamo: c.choseong, confidence: 50, requiresGemini: true };
    }
    if (t.jongseong !== c.jongseong) {
      if (!c.jongseong) return { errorType: '종성탈락', errorCategory: '탈락', confidence: 90, requiresGemini: false };
      // 종성 변화 → 동화 가능성 → Gemini 위임
      return { errorType: '동화', errorCategory: '동화', confidence: 60, requiresGemini: true };
    }
  }

  return { errorType: '미판정', confidence: 40, requiresGemini: true };
}

// ─── 테스트 케이스 ─────────────────────────────────────────────────────────────

const TEST_CASES = [
  {
    id: 1,
    name: '경음화 (대치)',
    targetWord: '사과',
    childWord: '따과',
    expected: '경음화',
    expectGemini: false,
  },
  {
    id: 2,
    name: '역행동화 (동화) — Gemini 위임 확인',
    targetWord: '손님',
    childWord: '솜님',
    expected: '동화',
    expectGemini: true, // 동화 오류는 Gemini로 최종 판정
  },
  {
    id: 3,
    name: '음절탈락 (탈락)',
    targetWord: '고양이',
    childWord: '괭이',
    expected: '음절탈락',
    expectGemini: false,
  },
  {
    id: 4,
    name: '유음의 비음화 (대치)',
    targetWord: '라디오',
    childWord: '나디오',
    expected: '유음의 비음화',
    expectGemini: false,
  },
  {
    id: 5,
    name: '초성탈락 (탈락)',
    targetWord: '사자',
    childWord: '아자',
    expected: '초성탈락',
    expectGemini: false,
  },
];

// ─── 테스트 실행 ───────────────────────────────────────────────────────────────

console.log('');
console.log('====== 자모 분해 엔진 테스트 ======');
console.log('');

let passed = 0;
let failed = 0;

for (const tc of TEST_CASES) {
  const result = analyzeError(tc.targetWord, tc.childWord);
  const typeOk = result.errorType === tc.expected;
  const geminiOk = tc.expectGemini === undefined || result.requiresGemini === tc.expectGemini;
  const ok = typeOk && geminiOk;

  const icon = ok ? '✅' : '❌';
  const status = ok ? 'PASS' : `FAIL (${!typeOk ? '오류유형 불일치' : 'Gemini 위임 불일치'})`;

  console.log(`${icon} [${tc.id}] ${tc.name}`);
  console.log(`   입력:  ${tc.targetWord} → ${tc.childWord}`);
  console.log(`   예상:  ${tc.expected}  (Gemini: ${tc.expectGemini ?? '무관'})`);
  console.log(`   결과:  ${result.errorType}  (신뢰도: ${result.confidence}%, Gemini: ${result.requiresGemini})`);
  if (result.targetJamo) console.log(`   자모:  ${result.targetJamo} → ${result.childJamo}  (${result.affectedSyllable + 1}번째 음절)`);
  console.log(`   상태:  ${status}`);
  console.log('');

  ok ? passed++ : failed++;
}

console.log(`==============================`);
console.log(`결과: ${passed}/${TEST_CASES.length} 통과  (실패: ${failed}개)`);
console.log('');
if (failed > 0) {
  console.log('※ 실패 항목은 로컬 패턴 테이블에 추가하거나, Gemini 위임 확인 필요');
}
