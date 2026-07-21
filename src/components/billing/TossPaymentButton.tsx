"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BubbleButton } from "@/components/ui/BubbleButton";

declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestBillingAuth: (method: string, options: Record<string, unknown>) => Promise<void>;
    };
  }
}

interface Props {
  userId: string;
}

export function TossPaymentButton({ userId }: Props) {
  const scriptLoaded = useRef(false);
  const [loading, setLoading] = useState(false);
  const [isTWA, setIsTWA] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // TWA 감지: 안드로이드 앱 내에서 열리면 referrer가 android-app:// 로 시작
    setIsTWA(document.referrer.startsWith("android-app://"));

    if (scriptLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;
    document.head.appendChild(script);
    scriptLoaded.current = true;
  }, []);

  // TWA(플레이스토어 앱) 환경: 외부 브라우저로 유도
  // ⚠️ 구글 플레이 심사 중 리스크 스위치: 인앱결제 우회로 보일 수 있는 이 버튼을
  //    NEXT_PUBLIC_TWA_PAYMENT_ENABLED="true" 가 아니면 완전히 숨긴다(기본값=숨김,
  //    안전한 상태가 기본). TWA는 앱 재빌드 없이 웹 배포만으로 내용이 바뀌므로,
  //    심사 제출 시엔 끄고, 승인 후 이 값만 켜서 재배포하면 앱 재심사 없이 노출된다.
  if (isTWA) {
    const twaPaymentEnabled = process.env.NEXT_PUBLIC_TWA_PAYMENT_ENABLED === "true";
    if (!twaPaymentEnabled) {
      return (
        <div className="text-center py-4 px-2">
          <p className="text-sm font-semibold text-[#8B7E74]">구독 기능을 준비하고 있어요</p>
          <p className="text-xs text-[#B0A89E] mt-1">곧 이용하실 수 있어요. 조금만 기다려주세요!</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <BubbleButton
          variant="mint"
          size="lg"
          className="w-full"
          onClick={() => {
            // _blank로 열면 TWA에서 Chrome 외부 브라우저로 열림
            window.open(window.location.href, "_blank", "noopener");
          }}
        >
          🌐 브라우저에서 구독하기
        </BubbleButton>
        <p className="text-[11px] text-center text-[#A89B8E]">
          앱 결제는 웹 브라우저에서 진행돼요
        </p>
      </div>
    );
  }

  // 정기결제(빌링): 카드를 한 번 등록하면 매달 자동으로 결제된다.
  // customerKey는 사용자당 고정값 — 이 값으로 등록된 카드(billingKey)를 나중에 서버가
  // 매달 자동 청구할 때 다시 사용한다 (issueBillingKey → chargeSubscription).
  async function handleRegisterCard() {
    if (!userId || userId.startsWith("guest:")) {
      router.push("/login?callbackUrl=/subscribe");
      return;
    }

    const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

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
      const customerKey = `cus_${userId}`;

      await toss.requestBillingAuth("카드", {
        customerKey,
        successUrl: `${window.location.origin}/subscribe/success`,
        failUrl: `${window.location.origin}/subscribe?failed=1`,
      });
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err?.code === "USER_CANCEL") return;
      console.error("[TossPaymentButton]", e);
      alert("카드 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BubbleButton
      variant="peach"
      size="lg"
      className="w-full"
      onClick={handleRegisterCard}
      disabled={loading}
    >
      {loading ? "카드 등록 창 여는 중..." : "🎉 카드 등록하고 시작하기"}
    </BubbleButton>
  );
}
