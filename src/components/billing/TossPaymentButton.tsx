"use client";

import { useEffect, useRef } from "react";
import { BubbleButton } from "@/components/ui/BubbleButton";

declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestPayment: (method: string, options: Record<string, unknown>) => Promise<void>;
    };
  }
}

interface Props {
  userId: string;
  amount: number;
  orderName: string;
}

export function TossPaymentButton({ userId, amount, orderName }: Props) {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;
    document.head.appendChild(script);
    scriptLoaded.current = true;
  }, []);

  async function handlePayment() {
    const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "test_ck_placeholder";

    if (!window.TossPayments) {
      alert("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const toss = window.TossPayments(tossClientKey);
    const orderId = `${userId}_${Date.now()}`;

    await toss.requestPayment("카드", {
      amount,
      orderId,
      orderName,
      customerName: "바름또박 사용자",
      successUrl: `${window.location.origin}/subscribe/success?orderId=${orderId}&amount=${amount}`,
      failUrl: `${window.location.origin}/subscribe?failed=1`,
    });
  }

  return (
    <BubbleButton variant="peach" size="lg" className="w-full" onClick={handlePayment}>
      🎉 첫 달 무료로 시작하기
    </BubbleButton>
  );
}
