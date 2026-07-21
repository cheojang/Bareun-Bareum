// TossPayments server-side integration

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const TOSS_API_BASE = "https://api.tosspayments.com/v1";

function getBasicAuthHeader(): string {
  // 💣 Fast Fail: 환경변수 누락 시 명확한 에러 발생
  if (!TOSS_SECRET_KEY) {
    throw new Error("TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.");
  }
  const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64");
  return `Basic ${encoded}`;
}

export interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt: string;
}

export async function issueBillingKey(
  customerKey: string,
  authKey: string
): Promise<{ billingKey: string }> {
  const res = await fetch(`${TOSS_API_BASE}/billing/authorizations/issue`, {
    method: "POST",
    headers: {
      Authorization: getBasicAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customerKey, authKey }),
    cache: "no-store", // 🚨 Next.js 캐싱 방지
  });

  if (!res.ok) {
    const err = await res.json();
    // 🚨 에러 코드 포함
    throw new Error(`[${err.code}] ${err.message ?? "Failed to issue billing key"}`);
  }

  const data = await res.json();
  return { billingKey: data.billingKey };
}

export async function chargeSubscription(
  billingKey: string,
  customerKey: string,
  amount: number,
  orderId: string,
  orderName: string
): Promise<TossPaymentResponse> {
  const res = await fetch(`${TOSS_API_BASE}/billing/${billingKey}`, {
    method: "POST",
    headers: {
      Authorization: getBasicAuthHeader(),
      "Content-Type": "application/json",
      "Idempotency-Key": orderId, // 🚨 중복 결제(이중 출금) 방지용 멱등성 키!
    },
    body: JSON.stringify({ customerKey, amount, orderId, orderName }),
    cache: "no-store", // 🚨 Next.js 캐싱 방지
  });

  if (!res.ok) {
    const err = await res.json();
    // 🚨 에러 코드 포함
    throw new Error(`[${err.code}] ${err.message ?? "Subscription charge failed"}`);
  }

  return res.json();
}
