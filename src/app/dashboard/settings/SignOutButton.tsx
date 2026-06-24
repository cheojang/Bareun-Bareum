"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      className="flex-1 py-3 rounded-2xl text-sm font-bold text-[#8B7E74] border border-[#E8DDD5] hover:bg-[#F5F0EA] transition-colors"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      로그아웃
    </button>
  );
}
