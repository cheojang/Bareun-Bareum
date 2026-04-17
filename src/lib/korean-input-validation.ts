/**
 * 한글 단어 입력 유효성 검사
 * 클라이언트·서버 모두에서 사용 가능한 순수 함수
 */

export function validateKoreanWord(text: string): string | null {
  const trimmed = text.trim();

  if (!trimmed) return "단어를 입력해주세요.";

  if (/[0-9]/.test(text))
    return "숫자는 입력할 수 없어요. '사과', '기차'처럼 한글 단어를 입력해주세요.";

  if (/[a-zA-Z]/.test(text))
    return "영어는 입력할 수 없어요. 한글로 입력해주세요.";

  // 완성형 한글(가–힣), 단독 자모(ㄱ–ㅣ), 공백 외 문자
  if (/[^\uAC00-\uD7A3\u3131-\u3163\s]/.test(text))
    return "특수문자나 외국어는 입력할 수 없어요. 한글 단어만 입력해주세요.";

  // 단독 자음·모음 (ㄱ–ㅎ: U+3131–U+314E, ㅏ–ㅣ: U+314F–U+3163)
  if (/[\u3131-\u3163]/.test(trimmed))
    return "완전하지 않은 한글이에요. 예) 'ㄱ차' → '기차'로 입력해주세요.";

  // 완성 음절 하나도 없음
  if (!/[\uAC00-\uD7A3]/.test(trimmed))
    return "한글 단어를 입력해주세요.";

  return null;
}
