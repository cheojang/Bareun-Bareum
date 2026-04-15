import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SoriLogo } from "@/components/ui/SoriMascot";
import { prisma } from "@/lib/prisma";
import { getSelectedChildId } from "@/lib/child-cookie";
import { ChildSelector } from "@/components/dashboard/ChildSelector";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const childList = await prisma.child.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, mascotLevel: true },
  });

  const savedId = await getSelectedChildId();
  const validId = childList.find((c) => c.id === savedId)?.id ?? childList[0]?.id ?? "";

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: "var(--color-bg-primary)" }}>

      {/* ── Top header ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(253,250,245,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1.5px solid #F0E8E0",
        }}
      >
        <div className="mx-auto max-w-lg flex items-center gap-3 px-5 py-3">
          {/* Logo */}
          <SoriLogo size={40} />

          {/* Brand name */}
          <Link href="/dashboard" className="flex-1">
            <p className="text-2xl font-black text-[#3D3530] leading-none">바른발음</p>
            <p className="text-[10px] text-[#C4B5A8] font-semibold tracking-wide leading-none mt-0.5">
              발음 홈케어
            </p>
          </Link>

          {/* 아이 선택 드롭다운 */}
          {childList.length > 0 && (
            <ChildSelector children={childList} selectedId={validId} />
          )}


        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-28">{children}</main>

      {/* ── Bottom navigation ───────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div
          className="mx-auto max-w-lg"
          style={{
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(18px)",
            borderTop: "1.5px solid #F0E8E0",
          }}
        >
          <div className="flex items-center justify-around px-2 py-3">
            <NavItem href="/dashboard" icon="🏠" label="홈" />
            <NavItem href="/dashboard/answer-note" icon="📝" label="오답노트" />
            <NavItem href="/dashboard/practice" icon="🎯" label="반복연습" />
            <NavItem href="/dashboard/bookmarks" icon="⭐" label="저장" />
            <NavItem href="/dashboard/settings" icon="⚙️" label="설정" />
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-4 py-1 rounded-2xl hover:bg-[#FFF5EE] transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold text-[#8B7E74]">{label}</span>
    </Link>
  );
}
