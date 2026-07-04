import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "바른발음 — 아이 발음 홈케어",
  description: "집에서 부모와 함께하는 아동 조음 교정 서비스. 놀이처럼 재미있게, 전문적으로.",
  manifest: "/manifest.json",
  // 홈 화면에서 실행 시 브라우저 크롬(상단 주소창/오렌지 바)을 숨기고 전체화면 앱처럼 뜨게 함 (iOS)
  appleWebApp: {
    capable: true,
    // black-translucent → iOS 상태바의 불투명 박스를 없애고 앱 배경이 시계 뒤까지 차오르게 함
    statusBarStyle: "black-translucent",
    title: "바른발음",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // viewportFit: cover → 노치/상태바 영역까지 콘텐츠 확장 + env(safe-area-inset) 사용 가능
  viewportFit: "cover",
  // 상단 시스템 바를 앱 배경(크림색)과 동일하게 → 홈 화면 실행 시 튀는 주황색 띠 제거
  themeColor: "#FDFAF5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
