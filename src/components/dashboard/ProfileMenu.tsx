"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Props {
  /** 표시용 이름 (없으면 이메일 앞부분) */
  name?: string | null;
  email?: string | null;
}

export function ProfileMenu({ name, email }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = name?.trim() || email?.split("@")[0] || "사용자";

  return (
    <div ref={ref} className="relative">
      {/* 프로필 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="내 메뉴"
        className="p-2 rounded-full hover:bg-[#FFF5EE] transition-colors"
      >
        <span className="text-xl leading-none">👤</span>
      </button>

      {/* 드롭다운 패널 */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-xl border border-[#F0E8E0] z-50 overflow-hidden"
          style={{
            background: "rgba(253,250,245,0.98)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* 사용자 정보 */}
          <div className="px-4 py-3 border-b border-[#F0E8E0]">
            <p className="text-sm font-black text-[#3D3530] truncate">{displayName}</p>
            {email && (
              <p className="text-[11px] text-[#C4B5A8] truncate mt-0.5">{email}</p>
            )}
          </div>

          {/* 메뉴 항목 */}
          <div className="py-1">
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#3D3530] hover:bg-[#FFF5EE] transition-colors"
            >
              <span className="text-base">⚙️</span>
              설정
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
            >
              <span className="text-base">🚪</span>
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
