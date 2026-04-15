import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
