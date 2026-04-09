// TossPayments server-side integration

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY ?? "";
const TOSS_API_BASE = "https://api.tosspayments.com/v1";

function getBasicAuthHeader(): string {
  const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64");
  return `Basic ${encoded}`;
}

export interface TossConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt: string;
}

export async function confirmPayment(
  req: TossConfirmRequest
): Promise<TossPaymentResponse> {
  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: getBasicAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "TossPayments confirmation failed");
  }

  return res.json();
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
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to issue billing key");
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
    },
    body: JSON.stringify({ customerKey, amount, orderId, orderName }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Subscription charge failed");
  }

  return res.json();
}
