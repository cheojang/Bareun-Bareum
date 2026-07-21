// 결제 가격의 단일 소스 — 표시(랜딩·구독 페이지)와 검증(승인 API)이 모두 이 값을 참조한다.
// 값이 흩어져 있으면 표시 가격과 승인 검증 가격이 어긋나 결제가 전부 거절되는 사고가 난다.
export const PREMIUM_MONTHLY_PRICE = 4900;

/** 화면 표시용 — "4,900원" */
export const PREMIUM_MONTHLY_PRICE_LABEL = `${PREMIUM_MONTHLY_PRICE.toLocaleString("ko-KR")}원`;
