/* 바른발음 Service Worker — Web Push 수신 전용 (오프라인 캐싱 없음) */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "바른발음 🌞";
  const options = {
    body: data.body || "오늘의 5분 발음 루틴이 기다리고 있어요!",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    tag: data.tag || "daily-reminder", // 같은 tag는 중복 알림 대신 갱신
    data: { url: data.url || "/dashboard/routine" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard/routine";

  // 이미 열린 탭이 있으면 포커스 + 이동, 없으면 새 창
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(url);
          return;
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
