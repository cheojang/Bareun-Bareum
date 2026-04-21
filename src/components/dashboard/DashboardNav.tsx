"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "홈" },
  { href: "/dashboard/answer-note", icon: "📝", label: "발음 분석" },
  { href: "/dashboard/practice", icon: "🎯", label: "반복 연습" },
  { href: "/dashboard/bookmarks", icon: "⭐", label: "저장 단어" },
  { href: "/dashboard/settings", icon: "⚙️", label: "설정" },
];

const B2B_NAV_ITEMS = [
  { href: "/dashboard/homework", icon: "📋", label: "숙제" },
  { href: "/dashboard/therapy-notes", icon: "📓", label: "치료 일지" },
  { href: "/dashboard/messages", icon: "💬", label: "메시지" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

/** 태블릿/데스크탑 사이드바 내비게이션 */
export function SidebarNavItems() {
  const pathname = usePathname();

  const renderItem = (item: { href: string; icon: string; label: string }) => {
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-colors font-semibold ${
          active
            ? "bg-[#FFF5EE] text-[#FFB38A]"
            : "text-[#3D3530] hover:bg-[#FFF5EE]"
        }`}
      >
        <span className="text-xl w-7 text-center">{item.icon}</span>
        <span className="text-sm">{item.label}</span>
        {active && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFB38A]" />
        )}
      </Link>
    );
  };

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map(renderItem)}
      <div className="pt-3 border-t border-[#F0E8E0] mt-3 space-y-1">
        <p className="text-[10px] font-bold text-[#C4B5A8] px-4 pb-1 uppercase tracking-wide">
          치료사 연계
        </p>
        {B2B_NAV_ITEMS.map(renderItem)}
      </div>
    </nav>
  );
}

/** 모바일 하단 탭바 내비게이션 */
export function BottomNavItems() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-around px-2 py-3">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-colors ${
              active ? "bg-[#FFF5EE]" : "hover:bg-[#FFF5EE]"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span
              className={`text-xs font-semibold ${
                active ? "text-[#FFB38A]" : "text-[#8B7E74]"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
