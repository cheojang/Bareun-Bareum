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

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [children, subscription] = await Promise.all([
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  const isPremium = subscription?.status === "active" && subscription?.plan === "premium";
  const userIsAdmin = isAdmin(session?.user?.email);

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#3D3530]">설정 ⚙️</h2>
        <div className="text-right">
          <p className="text-xs font-semibold text-[#C4B5A8]">v1.2.0</p>
          <p className="text-[10px] text-[#D4C8C0]">2026.06.10 업데이트</p>
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
      <BubbleCard color={isPremium ? "mint" : "peach"}>
        <div className="mb-3">
          <p className="text-xs text-[#8B7E74] mb-0.5">현재 이용 중인 플랜</p>
          <p className="font-bold text-[#3D3530]">
            {isPremium ? "✨ 프리미엄 플랜" : "무료 플랜"}
          </p>
          {isPremium && subscription?.currentPeriodEnd && (
            <p className="text-xs text-[#8B7E74] mt-0.5">
              다음 갱신:{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("ko-KR")}
            </p>
          )}
        </div>
        {!isPremium && (
          <Link href="/subscribe">
            <BubbleButton variant="peach" className="w-full">프리미엄 시작하기</BubbleButton>
          </Link>
        )}
      </BubbleCard>

      {/* Children */}
      <BubbleCard>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-[#3D3530]">아이 프로필</p>
          <DeleteAccountButton compact />
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

      {/* Admin (관리자만 노출) */}
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

      {/* Sign out */}
      <BubbleCard>
        <SignOutButton />
      </BubbleCard>
    </div>
  );
}
