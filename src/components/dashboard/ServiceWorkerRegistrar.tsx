"use client";

import { useEffect } from "react";

/**
 * Service Worker 자동 등록 — 푸시 구독자의 sw.js를 최신으로 유지.
 * 권한 요청 없음(조용히 등록만). 알림 켜기는 설정 페이지에서.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
