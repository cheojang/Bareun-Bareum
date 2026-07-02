// 결제 가격의 단일 소스 — 표시(랜딩·구독 페이지)와 검증(승인 API)이 모두 이 값을 참조한다.
// 값이 흩어져 있으면 표시 가격과 승인 검증 가격이 어긋나 결제가 전부 거절되는 사고가 난다.
export const PREMIUM_MONTHLY_PRICE = 4900;

/** 화면 표시용 — "4,900원" */
export const PREMIUM_MONTHLY_PRICE_LABEL = `${PREMIUM_MONTHLY_PRICE.toLocaleString("ko-KR")}원`;

/**
 * Toss 결제 승인 에러 중 "이미 승인된 결제" — 성공 페이지 새로고침/뒤로가기로
 * 같은 paymentKey를 다시 승인하려 할 때 발생한다. 첫 승인이 이미 성공했다는 뜻이므로
 * 사용자에게는 성공으로 처리해야 한다.
 */
export function isAlreadyProcessedError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("ALREADY_PROCESSED_PAYMENT");
}
