import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      {/* Main content */}
      <main className="flex-1 pb-24">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div
          className="mx-auto max-w-lg"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            borderTop: "1.5px solid #F0E8E0",
          }}
        >
          <div className="flex items-center justify-around px-4 py-3">
            <NavItem href="/dashboard" icon="🏠" label="홈" />
            <NavItem href="/dashboard/session/new" icon="🎯" label="연습" />
            <NavItem href="/dashboard/progress" icon="📈" label="성장" />
            <NavItem href="/dashboard/bookmarks" icon="⭐" label="보관함" />
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
      className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl hover:bg-[#FFF5EE] transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold text-[#8B7E74]">{label}</span>
    </Link>
  );
}
