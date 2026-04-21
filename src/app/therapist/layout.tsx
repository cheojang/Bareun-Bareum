import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (!role || !["therapist", "center_admin"].includes(role)) {
    redirect("/dashboard");
  }

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    include: { center: { select: { name: true } } },
  });
  if (!therapist) redirect("/dashboard");

  const NAV = [
    { href: "/therapist/children", icon: "👦", label: "담당 아이" },
    { href: "/therapist/homework", icon: "📋", label: "숙제 배정" },
    { href: "/therapist/notes", icon: "📓", label: "치료 일지" },
    { href: "/therapist/messages", icon: "💬", label: "메시지" },
  ];

  return (
    <div className="min-h-dvh" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      {/* 헤더 */}
      <header
        className="sticky top-0 z-40 px-5 py-3 flex items-center gap-3"
        style={{
          background: "rgba(253,250,245,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1.5px solid #F0E8E0",
        }}
      >
        <span className="text-2xl">🩺</span>
        <div className="flex-1">
          <p className="font-black text-[#3D3530] text-base leading-none">{therapist.name}</p>
          <p className="text-[10px] text-[#C4B5A8] font-semibold leading-none mt-0.5">
            {therapist.center.name}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-[#8B7E74] bg-[#F5EDE5] rounded-full px-3 py-1.5 font-semibold"
        >
          부모 앱으로
        </Link>
      </header>

      <div className="md:flex md:min-h-[calc(100dvh-57px)]">
        {/* 사이드바 (md 이상) */}
        <aside
          className="hidden md:flex flex-col w-52 sticky top-[57px] h-[calc(100dvh-57px)] shrink-0"
          style={{
            background: "rgba(253,250,245,0.95)",
            borderRight: "1.5px solid #F0E8E0",
          }}
        >
          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-colors font-semibold text-[#3D3530] hover:bg-[#FFF5EE]"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* 메인 */}
        <main className="flex-1 pb-28 md:pb-10">{children}</main>
      </div>

      {/* 모바일 하단 탭 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div
          style={{
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(18px)",
            borderTop: "1.5px solid #F0E8E0",
          }}
        >
          <div className="flex items-center justify-around px-2 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl text-[#3D3530]"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[10px] font-semibold text-[#8B7E74]">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
