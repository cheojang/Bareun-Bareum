/**
 * 한글 발음 대상 입력 유효성 검사 (단어 + 짧은 어절)
 * 클라이언트·서버 모두에서 사용 가능한 순수 함수
 */
import { decomposeWord } from "./jamo-analysis";

const MAX_SYLLABLES = 5;

export function validateKoreanWord(text: string): string | null {
  const trimmed = text.trim();

  if (!trimmed) return "발음 대상을 입력해주세요.";

  if (/[0-9]/.test(text))
    return "숫자는 입력할 수 없어요. '사과', '합니다'처럼 한글로 입력해주세요.";

  if (/[a-zA-Z]/.test(text))
    return "영어는 입력할 수 없어요. 한글로 입력해주세요.";

  // 완성형 한글(가–힣), 단독 자모(ㄱ–ㅣ), 공백 외 문자 금지
  if (/[^가-힣ㄱ-ㅣ\s]/.test(text))
    return "특수문자나 외국어는 입력할 수 없어요. 한글만 입력해주세요.";

  // 공백은 최대 1개까지 (짧은 어절/구 허용: "우리 집")
  const spaceCount = (trimmed.match(/\s+/g) ?? []).length;
  if (spaceCount > 1)
    return "짧은 단어나 어절만 입력해주세요. (예: '사과', '합니다', '우리 집')";

  // 단독 자음·모음 차단
  if (/[ㄱ-ㅣ]/.test(trimmed))
    return "완전하지 않은 한글이에요. 예) 'ㄱ차' → '기차'로 입력해주세요.";

  // 완성 음절 개수 체크
  const syllables = trimmed.match(/[가-힣]/g) ?? [];
  if (syllables.length === 0) return "한글로 입력해주세요.";
  if (syllables.length > MAX_SYLLABLES)
    return `너무 길어요. ${MAX_SYLLABLES}글자 이하의 단어나 짧은 어절로 입력해주세요.`;

  return null;
}

/**
 * 두 단어의 자모 단위 유사도 계산 (0.0 ~ 1.0)
 * 공통 자모 개수 / 긴 쪽의 자모 개수
 * multiset 매칭 (같은 자모 중복 시 한 번만 카운트)
 */
export function computePhonemeSimilarity(a: string, b: string): number {
  const jamoA = extractJamo(a);
  const jamoB = extractJamo(b);
  if (jamoA.length === 0 || jamoB.length === 0) return 0;

  const remainB = [...jamoB];
  let common = 0;
  for (const j of jamoA) {
    const idx = remainB.indexOf(j);
    if (idx !== -1) {
      common++;
      remainB.splice(idx, 1);
    }
  }
  return common / Math.max(jamoA.length, jamoB.length);
}

/** 음절 수 차이 (절대값) */
export function syllableLengthDiff(a: string, b: string): number {
  const aLen = (a.trim().match(/[가-힣]/g) ?? []).length;
  const bLen = (b.trim().match(/[가-힣]/g) ?? []).length;
  return Math.abs(aLen - bLen);
}

function extractJamo(word: string): string[] {
  const decomposed = decomposeWord(word.replace(/\s+/g, ""));
  const result: string[] = [];
  for (const ch of decomposed) {
    if (!ch) continue;
    if (ch.choseong) result.push(ch.choseong);
    if (ch.jungseong) result.push(ch.jungseong);
    if (ch.jongseong) result.push(ch.jongseong);
  }
  return result;
}
