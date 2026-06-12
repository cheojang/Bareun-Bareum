import type { NextConfig } from "next";
import packageJson from "./package.json";

const nextConfig: NextConfig = {
  // 버전·빌드 시각 자동 주입 — 배포(빌드)마다 갱신됨. 표시: 설정 페이지·사이드바
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },  // Google profile images
      { protocol: "http",  hostname: "k.kakaocdn.net" },              // Kakao profile images
      { protocol: "https", hostname: "k.kakaocdn.net" },
    ],
  },
  // Allow Prisma edge runtime
  serverExternalPackages: ["@prisma/client", "prisma"],
  // 구 URL 호환성: /therapist/{children,homework,notes} → /center/{...}
  async redirects() {
    return [
      { source: "/therapist/children", destination: "/center/children", permanent: true },
      { source: "/therapist/homework", destination: "/center/homework", permanent: true },
      { source: "/therapist/notes",    destination: "/center/notes",    permanent: true },
      // API도 호환성 유지 (북마크/외부 스크립트 대비)
      { source: "/api/therapist/children", destination: "/api/center/children", permanent: true },
      { source: "/api/therapist/homework", destination: "/api/center/homework", permanent: true },
      { source: "/api/therapist/notes",    destination: "/api/center/notes",    permanent: true },
    ];
  },
};

export default nextConfig;
