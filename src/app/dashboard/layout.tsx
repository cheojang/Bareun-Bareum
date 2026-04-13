import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SoriLogo } from "@/components/ui/SoriMascot";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

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
          {/* Logo mark */}
          <SoriLogo size={40} />

          {/* Brand name */}
          <div className="flex-1">
            <p className="text-lg font-black text-[#3D3530] leading-none">소리</p>
            <p className="text-[10px] text-[#C4B5A8] font-semibold tracking-wide leading-none mt-0.5">
              발음 홈케어
            </p>
          </div>

          {/* Settings shortcut */}
          <Link
            href="/dashboard/settings"
            className="w-9 h-9 rounded-full bg-[#F0E8E0] flex items-center justify-center text-lg hover:bg-[#FFD4B8] transition-colors"
          >
            ⚙️
          </Link>
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
            <NavItem href="/dashboard/practice" icon="🎮" label="아이연습" />
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
