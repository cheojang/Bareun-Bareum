"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (scriptLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;
    document.head.appendChild(script);
    scriptLoaded.current = true;
  }, []);

  async function handlePayment() {
    // 비로그인 상태
    if (!userId || userId.startsWith("guest:")) {
      router.push("/login?callbackUrl=/subscribe");
      return;
    }

    const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    // 키 미설정 (개발 환경 안내)
    if (!tossClientKey) {
      alert(
        "결제 키가 설정되지 않았습니다.\n" +
          "developers.tosspayments.com 에서 테스트 키를 발급 후\n" +
          "NEXT_PUBLIC_TOSS_CLIENT_KEY 환경변수를 설정해 주세요."
      );
      return;
    }

    if (!window.TossPayments) {
      alert("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setLoading(true);
    try {
      const toss = window.TossPayments(tossClientKey);
      const orderId = `${userId}_${Date.now()}`;

      await toss.requestPayment("카드", {
        amount,
        orderId,
        orderName,
        customerName: "바른발음 사용자",
        successUrl: `${window.location.origin}/subscribe/success`,
        failUrl: `${window.location.origin}/subscribe?failed=1`,
      });
    } catch (e: unknown) {
      // 사용자가 직접 결제창을 닫은 경우 — 조용히 무시
      const err = e as { code?: string; message?: string };
      if (err?.code === "PAY_PROCESS_CANCELED") return;
      console.error("[TossPaymentButton]", e);
      alert("결제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BubbleButton
      variant="peach"
      size="lg"
      className="w-full"
      onClick={handlePayment}
      disabled={loading}
    >
      {loading ? "결제 창 여는 중..." : "🎉 프리미엄 가입하기"}
    </BubbleButton>
  );
}
