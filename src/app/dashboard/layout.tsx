import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SoriLogo } from "@/components/ui/SoriMascot";
import { prisma } from "@/lib/prisma";
import { getSelectedChildId } from "@/lib/child-cookie";
import { hasConsent } from "@/lib/consent";
import { ChildSelector } from "@/components/dashboard/ChildSelector";
import { SidebarNavItems, BottomNavItems } from "@/components/dashboard/DashboardNav";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ServiceWorkerRegistrar } from "@/components/dashboard/ServiceWorkerRegistrar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isGuest = session.user.isGuest === true;

  // 네 쿼리를 병렬 실행 — 각각 독립적이므로 순차 await 불필요
  const [childList, savedId, unreadCount, consented] = await Promise.all([
    isGuest
      ? Promise.resolve<{ id: string; name: string; mascotLevel: number; image: string | null }[]>([])
      : prisma.child.findMany({
          where: { userId: session.user.id! },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, mascotLevel: true, image: true },
        }),
    isGuest ? Promise.resolve("") : getSelectedChildId(),
    isGuest
      ? Promise.resolve(0)
      : prisma.announcement.count({
          where: {
            isPublished: true,
            reads: { none: { userId: session.user.id! } },
          },
        }).catch(() => 0), // 테이블 미생성 시 0으로 폴백
    hasConsent(session.user.id!),
  ]);

  // 약관 동의 기록이 없으면 동의 페이지로 (최초 1회만 — 동의 일시는 DB에 보존)
  if (!consented) redirect("/consent");
  const validId =
    childList.find((c) => c.id === savedId)?.id ?? childList[0]?.id ?? "";

  // 상담소 기능 2단계에서 활성화 예정 — 현재 비활성화
  const hasTherapistLink = false;

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <ServiceWorkerRegistrar />
      {/* ── 모바일: 상단 헤더 (md 이상에서 숨김) ─────────────────── */}
      <header
        className="sticky top-0 z-40 md:hidden"
        style={{
          background: "rgba(253,250,245,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1.5px solid #F0E8E0",
          // 전체화면/translucent 상태바에서 크림 배경이 노치 영역까지 채워 시계와 겹치지 않게 함
          paddingTop: "env(safe-area-inset-top)",
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
      {/* flex-1 + flex-col(모바일)/flex-row(md)로 높이를 자식까지 전파 →
          페이지가 짧아도 콘텐츠 영역(및 그 배경)이 항상 뷰포트를 꽉 채움 */}
      <div className="flex-1 flex flex-col md:flex-row">

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

          {/* 내비게이션 아이템 */}
          <SidebarNavItems hasTherapistLink={hasTherapistLink} />

          {/* 하단 버전 표시 */}
          <div className="px-5 py-4 border-t border-[#F0E8E0]">
            <p className="text-[10px] text-[#C4B5A8]">바른발음 v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
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

          {/* 게스트 배너 */}
          {isGuest && (
            <div className="bg-[#FFF5EE] border-b border-[#FFE4D8] px-5 py-2.5 flex items-center justify-between">
              <p className="text-xs text-[#8B7E74]">
                <span className="font-bold text-[#FFB38A]">비회원 모드</span> — 기록이 저장되지 않아요
              </p>
              <Link href="/signup" className="text-xs font-bold text-[#FFB38A] hover:underline flex-shrink-0">
                회원가입
              </Link>
            </div>
          )}

          {/* 페이지 콘텐츠 */}
          <main className="flex-1 flex flex-col pb-28 md:pb-10">{children}</main>
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
            // 전체화면에서 하단 홈 인디케이터 영역만큼 여백 확보
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <BottomNavItems />
        </div>
      </nav>
    </div>
  );
}
