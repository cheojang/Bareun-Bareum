import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SoriLogo } from "@/components/ui/SoriMascot";
import { prisma } from "@/lib/prisma";
import { getSelectedChildId } from "@/lib/child-cookie";
import { ChildSelector } from "@/components/dashboard/ChildSelector";
import { SidebarNavItems, BottomNavItems } from "@/components/dashboard/DashboardNav";
import { NotificationBell } from "@/components/dashboard/NotificationBell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const childList = await prisma.child.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, mascotLevel: true },
  });

  const savedId = await getSelectedChildId();
  const validId =
    childList.find((c) => c.id === savedId)?.id ?? childList[0]?.id ?? "";

  // 안읽은 공지 수 (서버에서 계산 → 초기 배지에 활용)
  const unreadCount = await prisma.announcement.count({
    where: {
      isPublished: true,
      reads: { none: { userId: session.user.id! } },
    },
  });

  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      {/* ── 모바일: 상단 헤더 (md 이상에서 숨김) ─────────────────── */}
      <header
        className="sticky top-0 z-40 md:hidden"
        style={{
          background: "rgba(253,250,245,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1.5px solid #F0E8E0",
        }}
      >
        <div className="mx-auto max-w-lg flex items-center gap-3 px-5 py-3">
          <SoriLogo size={40} />
          <Link href="/dashboard" className="flex-1">
            <p className="text-2xl font-black text-[#3D3530] leading-none">
              바른발음
            </p>
            <p className="text-[10px] text-[#C4B5A8] font-semibold tracking-wide leading-none mt-0.5">
              발음 홈케어
            </p>
          </Link>
          {childList.length > 0 && (
            <ChildSelector children={childList} selectedId={validId} />
          )}
          <NotificationBell initialUnreadCount={unreadCount} />
        </div>
      </header>

      {/* ── 태블릿/데스크탑: 사이드바 + 콘텐츠 (md 이상) ──────────── */}
      <div className="md:flex md:min-h-dvh">

        {/* 사이드바 (md 이상에서 표시) */}
        <aside
          className="hidden md:flex flex-col w-60 lg:w-64 sticky top-0 h-dvh shrink-0 z-40"
          style={{
            background: "rgba(253,250,245,0.95)",
            backdropFilter: "blur(16px)",
            borderRight: "1.5px solid #F0E8E0",
          }}
        >
          {/* 로고 */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0E8E0]">
            <SoriLogo size={36} />
            <Link href="/dashboard">
              <p className="text-lg font-black text-[#3D3530] leading-none">
                바른발음
              </p>
              <p className="text-[10px] text-[#C4B5A8] font-semibold tracking-wide mt-0.5">
                발음 홈케어
              </p>
            </Link>
          </div>

          {/* 아이 선택 */}
          {childList.length > 0 && (
            <div className="px-4 py-3 border-b border-[#F0E8E0]">
              <ChildSelector children={childList} selectedId={validId} />
            </div>
          )}

          {/* 내비게이션 아이템 */}
          <SidebarNavItems />

          {/* 하단 버전 표시 */}
          <div className="px-5 py-4 border-t border-[#F0E8E0]">
            <p className="text-[10px] text-[#C4B5A8]">바른발음 v1.0</p>
          </div>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* 데스크탑 상단 바 (md 이상, 우측 상단 아이 선택기) */}
          <div
            className="hidden md:flex items-center justify-end gap-2 px-6 py-3 sticky top-0 z-30"
            style={{
              background: "rgba(253,250,245,0.88)",
              backdropFilter: "blur(16px)",
              borderBottom: "1.5px solid #F0E8E0",
            }}
          >
            {childList.length > 0 && (
              <ChildSelector children={childList} selectedId={validId} />
            )}
            <NotificationBell initialUnreadCount={unreadCount} />
          </div>

          {/* 페이지 콘텐츠 */}
          <main className="flex-1 pb-28 md:pb-10">{children}</main>
        </div>
      </div>

      {/* ── 모바일: 하단 탭바 (md 이상에서 숨김) ────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div
          className="mx-auto max-w-lg"
          style={{
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(18px)",
            borderTop: "1.5px solid #F0E8E0",
          }}
        >
          <BottomNavItems />
        </div>
      </nav>
    </div>
  );
}
