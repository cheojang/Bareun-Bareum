"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin",               label: "📊 대시보드" },
  { href: "/admin/users",         label: "👥 회원 관리" },
  { href: "/admin/announcements", label: "📢 공지사항" },
  { href: "/admin/centers",       label: "🏥 센터 관리" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 px-4 py-2.5 border-b border-[#F0E8E0] overflow-x-auto">
      {NAV_ITEMS.map(({ href, label }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
              active
                ? "bg-[#FFB38A] text-white"
                : "text-[#8B7E74] hover:bg-[#F5F0EB]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
