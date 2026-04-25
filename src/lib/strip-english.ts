/**
 * 한글 라벨에 섞인 영문 괄호 부분을 제거
 * 예시:
 *  "마찰음 파찰음화 오류 (Fricative Affrication)" → "마찰음 파찰음화 오류"
 *  "ㅅ→ㅊ (마찰음 파찰음화 오류 (Fricative Affrication))" → "ㅅ→ㅊ (마찰음 파찰음화 오류)"
 */
export function stripEnglishParens(s: string | null | undefined): string {
  if (!s) return "";
  return s
    // 영문 라틴 문자가 들어간 (...) 부분 제거
    .replace(/\s*\([^()]*[A-Za-z][^()]*\)/g, "")
    // 닫는 괄호 직전 공백 정리
    .replace(/\s+\)/g, ")")
    .trim();
}
