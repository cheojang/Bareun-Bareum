"use client";

import { useEffect, useState } from "react";
import { BubbleCard } from "@/components/ui/BubbleCard";

/** base64url → Uint8Array (PushManager.subscribe의 applicationServerKey 형식) */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type PushState =
  | "loading"        // 초기 상태 확인 중
  | "unsupported"    // 브라우저가 Web Push 미지원
  | "ios-install"    // iOS인데 홈 화면 추가 전 (추가해야 알림 가능)
  | "denied"         // 사용자가 알림 권한을 차단함
  | "off"            // 미구독
  | "on";            // 구독 중

export function PushNotificationCard() {
  const [state, setState] = useState<PushState>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        // iOS Safari는 홈 화면 추가(standalone) 전엔 PushManager가 없음
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        const standalone =
          window.matchMedia("(display-mode: standalone)").matches ||
          (navigator as { standalone?: boolean }).standalone === true;
        setState(isIOS && !standalone ? "ios-install" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ) as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("구독 저장 실패");
      setState("on");
    } catch {
      alert("알림 설정에 실패했어요. 잠시 후 다시 시도해주세요.");
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  return (
    <BubbleCard>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">🔔</span>
          <div className="min-w-0">
            <p className="font-bold text-[#3D3530]">연습 알림</p>
            <p className="text-xs text-[#8B7E74]">매일 저녁 7시, 오늘의 루틴을 알려드려요</p>
          </div>
        </div>

        {(state === "on" || state === "off") && (
          <button
            onClick={state === "on" ? disable : enable}
            disabled={busy}
            aria-label={state === "on" ? "알림 끄기" : "알림 켜기"}
            className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${
              state === "on" ? "bg-[#FFB38A]" : "bg-[#E5DDD4]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                state === "on" ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        )}
      </div>

      {state === "ios-install" && (
        <div className="mt-3 p-3 bg-[#FFF5EE] rounded-2xl">
          <p className="text-xs text-[#8B7E74] leading-relaxed">
            아이폰에서는 <span className="font-bold text-[#3D3530]">홈 화면에 추가</span>해야 알림을 받을 수 있어요.
            <br />
            Safari 하단 <span className="font-bold">공유 버튼 (□↑)</span> →{" "}
            <span className="font-bold">&ldquo;홈 화면에 추가&rdquo;</span> 후 추가된 앱에서 켜주세요.
          </p>
        </div>
      )}

      {state === "denied" && (
        <div className="mt-3 p-3 bg-[#FFF5EE] rounded-2xl">
          <p className="text-xs text-[#8B7E74] leading-relaxed">
            알림이 차단되어 있어요. 브라우저 설정에서{" "}
            <span className="font-bold text-[#3D3530]">알림 허용</span>으로 변경해주세요.
          </p>
        </div>
      )}

      {state === "unsupported" && (
        <p className="mt-3 text-xs text-[#A89B8E]">이 브라우저는 알림을 지원하지 않아요.</p>
      )}
    </BubbleCard>
  );
}
