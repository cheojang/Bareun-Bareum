"use client";

import { signOut } from "next-auth/react";
import { BubbleButton } from "@/components/ui/BubbleButton";

export function SignOutButton() {
  return (
    <BubbleButton
      variant="ghost"
      className="flex-1 text-red-400 hover:bg-red-50"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      로그아웃
    </BubbleButton>
  );
}
