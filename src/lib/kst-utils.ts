/**
 * KST (한국 표준시, UTC+9) 유틸
 * Vercel은 UTC로 동작하므로 KST 기준 "오늘"을 계산하려면 +9h 보정 필요
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 주어진 시각의 KST 날짜 문자열 (YYYY-MM-DD) */
export function getKSTDateString(date: Date = new Date()): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return kst.toISOString().split("T")[0];
}

/** KST 기준 오늘의 23:59:59.999을 UTC Date로 반환 (쿼리 상한용) */
export function getKSTEndOfDay(date: Date = new Date()): Date {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  kst.setUTCHours(23, 59, 59, 999);
  return new Date(kst.getTime() - KST_OFFSET_MS);
}

/** KST 기준 오늘의 00:00:00.000을 UTC Date로 반환 (쿼리 하한용) */
export function getKSTStartOfDay(date: Date = new Date()): Date {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  kst.setUTCHours(0, 0, 0, 0);
  return new Date(kst.getTime() - KST_OFFSET_MS);
}

/** KST 기준으로 `days`일 뒤 자정 (00:00) UTC Date */
export function getKSTDayAfter(days: number, date: Date = new Date()): Date {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  kst.setUTCDate(kst.getUTCDate() + days);
  kst.setUTCHours(0, 0, 0, 0);
  return new Date(kst.getTime() - KST_OFFSET_MS);
}
