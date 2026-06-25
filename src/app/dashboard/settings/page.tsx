import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { SignOutButton } from "./SignOutButton";
import { ChildDeleteButton } from "@/components/settings/ChildDeleteButton";
import { ChildImageUpload } from "@/components/settings/ChildImageUpload";
import { DeleteAccountButton } from "@/components/settings/DeleteAccountButton";
import { PushNotificationCard } from "@/components/settings/PushNotificationCard";
import { AppInstallCard } from "@/components/settings/AppInstallCard";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [children, subscription, user] = await Promise.all([
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.user
      .findUnique({ where: { id: userId }, select: { trialEndsAt: true } })
      .catch(() => null),
  ]);

  const isPremium = subscription?.status === "active" && subscription?.plan === "premium";
  const trialActive = !isPremium && !!user?.trialEndsAt && user.trialEndsAt.getTime() > Date.now();
  const trialDaysLeft = trialActive
    ? Math.max(1, Math.ceil((user!.trialEndsAt!.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;
  const userIsAdmin = isAdmin(session?.user?.email);

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#3D3530]">설정 ⚙️</h2>
        <div className="text-right">
          <p className="text-xs font-semibold text-[#A89B8E]">v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
          {process.env.NEXT_PUBLIC_BUILD_TIME && (
            <p className="text-[11px] text-[#B0A89E]">
              {new Date(process.env.NEXT_PUBLIC_BUILD_TIME).toLocaleString("ko-KR", {
                timeZone: "Asia/Seoul",
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", hour12: false,
              })}{" "}
              업데이트
            </p>
          )}
        </div>
      </div>

      {/* Profile */}
      <BubbleCard>
        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="프로필" className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#FFD4B8] flex items-center justify-center text-2xl">
              👤
            </div>
          )}
          <div>
            <p className="font-bold text-[#3D3530]">{session?.user?.name}</p>
            <p className="text-sm text-[#8B7E74]">{session?.user?.email}</p>
          </div>
        </div>
      </BubbleCard>

      {/* Subscription */}
      <BubbleCard color={isPremium || trialActive ? "mint" : "peach"}>
        <div className="mb-3">
          <p className="text-xs text-[#8B7E74] mb-0.5">현재 이용 중인 플랜</p>
          <p className="font-bold text-[#3D3530]">
            {isPremium ? "✨ 프리미엄 등급" : trialActive ? "🎁 프리미엄 체험 중" : "무료 등급"}
          </p>
          {isPremium && subscription?.currentPeriodEnd && (
            <p className="text-xs text-[#0D9488] font-semibold mt-0.5">
              다음 결제일 · {new Date(subscription.currentPeriodEnd).toLocaleDateString("ko-KR")}
            </p>
          )}
          {trialActive && (
            <p className="text-xs text-[#0D9488] font-semibold mt-0.5">
              체험 {trialDaysLeft}일 남음 · {new Date(user!.trialEndsAt!).toLocaleDateString("ko-KR")}까지 모든 기능 무료
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className={`rounded-2xl p-3.5 ${!isPremium && !trialActive ? "bg-white border-2 border-[#FFB38A]" : "bg-white/50 border-2 border-transparent"}`}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-bold text-[#3D3530] text-sm">무료</p>
              {!isPremium && !trialActive && <span className="text-[10px] font-bold text-[#FF9B6A]">내 등급 ✓</span>}
            </div>
            <ul className="space-y-0.5 text-[11px] text-[#8B7E74] leading-relaxed">
              <li>AI 조음 분석 월 10회</li>
              <li>단계별 반복 연습</li>
              <li>종합 진단 보고서</li>
            </ul>
            <p className="text-xs font-bold text-[#8B7E74] mt-2">0원</p>
          </div>

          <div className={`rounded-2xl p-3.5 ${isPremium || trialActive ? "bg-white border-2 border-[#5EC9B8]" : "bg-white/50 border-2 border-transparent"}`}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-bold text-[#3D3530] text-sm">프리미엄</p>
              {isPremium && <span className="text-[10px] font-bold text-[#0D9488]">내 등급 ✓</span>}
              {trialActive && <span className="text-[10px] font-bold text-[#0D9488]">체험 중 ✓</span>}
            </div>
            <ul className="space-y-0.5 text-[11px] text-[#8B7E74] leading-relaxed">
              <li className="font-semibold text-[#3D3530]">AI 조음 분석 무제한</li>
              <li>단계별 반복 연습</li>
              <li>종합 진단 보고서</li>
            </ul>
            <p className="text-xs font-bold text-[#FF9B6A] mt-2">월 5,000원</p>
          </div>
        </div>

        {!isPremium && (
          <Link href="/subscribe">
            <BubbleButton variant="peach" className="w-full">
              {trialActive ? "체험 끝나기 전에 프리미엄 등록하기" : "프리미엄 시작하기"}
            </BubbleButton>
          </Link>
        )}
      </BubbleCard>

      {/* 후기 인증 */}
      <BubbleCard color="mint">
        <div className="flex items-center gap-3">
          <span className="text-3xl flex-shrink-0">🎁</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#3D3530]">홍보글 쓰면 1주일 무료 연장!</p>
            <p className="text-xs text-[#8B7E74] mt-0.5 leading-relaxed">
              블로그·SNS·커뮤니티에 후기 남기고 링크 제출 → 인증 1건당 프리미엄 1주 연장 (최대 10주)
            </p>
          </div>
          <Link href="/dashboard/review-bonus" className="flex-shrink-0">
            <BubbleButton variant="mint" size="sm">참여하기 →</BubbleButton>
          </Link>
        </div>
      </BubbleCard>

      {/* Children */}
      <BubbleCard>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-[#3D3530]">아이 프로필</p>
        </div>
        <div className="space-y-3">
          {children.map((child: { id: string; name: string; mascotLevel: number; totalWords: number; image?: string | null }) => (
            <div key={child.id} className="flex items-center gap-3 p-3 bg-[#FFF5EE] rounded-2xl">
              <ChildImageUpload childId={child.id} currentImage={child.image} />
              <div className="flex-1">
                <p className="font-semibold text-[#3D3530]">{child.name}</p>
                <p className="text-xs text-[#8B7E74]">Lv.{child.mascotLevel} · {child.totalWords}개 단어</p>
              </div>
              <ChildDeleteButton childId={child.id} childName={child.name} />
            </div>
          ))}
          <Link href="/onboarding">
            <BubbleButton variant="white" className="w-full mt-2">
              + 아이 추가하기
            </BubbleButton>
          </Link>
        </div>
      </BubbleCard>

      <AppInstallCard />

      {!session?.user?.isGuest && <PushNotificationCard />}

      {userIsAdmin && (
        <BubbleCard>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="font-bold text-[#3D3530]">관리자 대시보드</p>
                <p className="text-xs text-[#8B7E74]">통계, 사용량, 시딩 등을 관리해요</p>
              </div>
            </div>
            <Link href="/admin">
              <BubbleButton variant="gray" size="sm">바로가기 →</BubbleButton>
            </Link>
          </div>
        </BubbleCard>
      )}

      {/* 로그아웃 / 회원 탈퇴 */}
      <BubbleCard>
        <div className="flex gap-3">
          <SignOutButton />
          {!session?.user?.isGuest && <DeleteAccountButton side />}
        </div>
      </BubbleCard>


    </div>
  );
}
