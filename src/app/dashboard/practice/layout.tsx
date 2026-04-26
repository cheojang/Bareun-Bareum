"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard/practice",        label: "🎯 분석단어 훈련", exact: true },
  { href: "/dashboard/practice/review", label: "🔁 복습하기",       exact: false },
];

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-dvh">
      {/* 탭 바 — 엑셀 스타일, 상단 고정 */}
      <div
        className="sticky top-0 z-30 flex border-b border-[#F0E8E0]"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}
      >
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 px-4 py-3 text-center text-sm font-bold transition-colors relative ${
                active
                  ? "text-[#FFB38A]"
                  : "text-[#8B7E74] hover:text-[#3D3530] hover:bg-[#FFF5EE]/50"
              }`}
            >
              {tab.label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB38A]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
