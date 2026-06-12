"use client";

import { useEffect, useState } from "react";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

/** Chrome 계열의 beforeinstallprompt 이벤트 (표준 타입 미정의) */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallState =
  | "loading"     // 판별 중
  | "installed"   // 이미 홈 화면 앱으로 실행 중
  | "promptable"  // 설치 버튼 한 번으로 설치 가능 (Android Chrome 등)
  | "ios"         // iOS Safari — 수동 추가 안내
  | "manual";     // 그 외 브라우저 — 일반 안내

export function AppInstallCard() {
  const [state, setState] = useState<InstallState>("loading");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setState("installed");
      return;
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setState(isIOS ? "ios" : "manual");

    // Android Chrome 등: 설치 가능해지면 브라우저가 이 이벤트를 발생시킴
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState("promptable");
    };
    const onInstalled = () => setState("installed");

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setState("installed");
    setDeferredPrompt(null);
  }

  if (state === "loading") return null;

  return (
    <BubbleCard>
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">📲</span>
        <div>
          <p className="font-bold text-[#3D3530]">
            앱으로 설치 {state === "installed" && <span className="text-[#0D9488]">✓ 설치됨</span>}
          </p>
          <p className="text-xs text-[#8B7E74]">홈 화면에서 바로 열고, 알림도 받아요</p>
        </div>
      </div>

      {state === "installed" && (
        <p className="mt-2 text-xs text-[#8B7E74]">
          지금 홈 화면 앱으로 사용 중이에요. 업데이트는 앱을 다시 열 때 자동 적용돼요.
        </p>
      )}

      {state === "promptable" && (
        <BubbleButton variant="peach" className="w-full mt-3" onClick={install}>
          홈 화면에 설치하기
        </BubbleButton>
      )}

      {state === "ios" && (
        <div className="mt-3 p-3 bg-[#FFF5EE] rounded-2xl">
          <p className="text-xs text-[#8B7E74] leading-relaxed">
            <span className="font-bold text-[#3D3530]">1.</span> Safari 하단의{" "}
            <span className="font-bold text-[#3D3530]">공유 버튼 (□↑)</span>을 누르고
            <br />
            <span className="font-bold text-[#3D3530]">2.</span>{" "}
            <span className="font-bold text-[#3D3530]">&ldquo;홈 화면에 추가&rdquo;</span>를 선택하면 끝!
            <br />
            <span className="text-[#A89B8E]">추가된 앱에서 알림도 켤 수 있어요 (iOS 16.4+)</span>
          </p>
        </div>
      )}

      {state === "manual" && (
        <div className="mt-3 p-3 bg-[#FFF5EE] rounded-2xl">
          <p className="text-xs text-[#8B7E74] leading-relaxed">
            브라우저 메뉴(⋮ 또는 ⋯)에서{" "}
            <span className="font-bold text-[#3D3530]">&ldquo;홈 화면에 추가&rdquo;</span> 또는{" "}
            <span className="font-bold text-[#3D3530]">&ldquo;앱 설치&rdquo;</span>를 선택해주세요.
          </p>
        </div>
      )}
    </BubbleCard>
  );
}
