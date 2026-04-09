"use client";

import { signIn } from "next-auth/react";

interface SocialLoginButtonProps {
  provider: "google" | "kakao";
}

export function SocialLoginButton({ provider }: SocialLoginButtonProps) {
  const configs = {
    google: {
      label: "Google로 계속하기",
      bg: "bg-white hover:bg-gray-50",
      border: "border-2 border-[#F0E8E0]",
      text: "text-[#3D3530]",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      ),
    },
    kakao: {
      label: "카카오로 계속하기",
      bg: "bg-[#FEE500] hover:bg-[#F5DC00]",
      border: "border-2 border-[#FEE500]",
      text: "text-[#191919]",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
          <path d="M12 3C6.48 3 2 6.58 2 11c0 2.78 1.56 5.22 3.9 6.73-.15.55-.97 3.63-.97 3.63-.02.09.03.18.11.22.08.04.17.02.23-.04l4.24-2.81c.82.13 1.66.2 2.49.2 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
        </svg>
      ),
    },
  };

  const config = configs[provider];

  return (
    <button
      onClick={() => signIn(provider, { callbackUrl: "/dashboard" })}
      className={`
        w-full flex items-center justify-center gap-3
        ${config.bg} ${config.border} ${config.text}
        rounded-full px-6 py-4 font-bold text-base
        bubble-btn transition-all
      `}
    >
      {config.icon}
      {config.label}
    </button>
  );
}
