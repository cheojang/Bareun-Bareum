import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { SignOutButton } from "./SignOutButton";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [children, subscription] = await Promise.all([
    prisma.child.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  const isPremium = subscription?.status === "active" && subscription?.plan === "premium";

  return (
    <div className="px-5 pt-6 max-w-lg mx-auto space-y-5">
      <h2 className="text-2xl font-black text-[#3D3530]">설정 ⚙️</h2>

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
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-[#3D3530]">
              {isPremium ? "프리미엄 구독 중" : "무료 플랜"}
            </p>
            {isPremium && subscription?.currentPeriodEnd && (
              <p className="text-xs text-[#8B7E74]">
                다음 갱신:{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("ko-KR")}
              </p>
            )}
          </div>
          <PastelBadge color={isPremium ? "mint" : "yellow"}>
            {isPremium ? "✨ 프리미엄" : "무료"}
          </PastelBadge>
        </div>
        {!isPremium && (
          <Link href="/subscribe">
            <BubbleButton variant="peach" className="w-full">프리미엄 시작하기</BubbleButton>
          </Link>
        )}
      </BubbleCard>

      {/* Children */}
      <BubbleCard>
        <p className="font-bold text-[#3D3530] mb-3">아이 프로필</p>
        <div className="space-y-3">
          {children.map((child: { id: string; name: string; mascotLevel: number; totalWords: number }) => (
            <div key={child.id} className="flex items-center gap-3 p-3 bg-[#FFF5EE] rounded-2xl">
              <span className="text-2xl">👶</span>
              <div className="flex-1">
                <p className="font-semibold text-[#3D3530]">{child.name}</p>
                <p className="text-xs text-[#8B7E74]">Lv.{child.mascotLevel} · {child.totalWords}개 단어</p>
              </div>
            </div>
          ))}
          <Link href="/onboarding">
            <BubbleButton variant="white" className="w-full mt-2">
              + 아이 추가하기
            </BubbleButton>
          </Link>
        </div>
      </BubbleCard>

      {/* Sign out */}
      <BubbleCard>
        <SignOutButton />
      </BubbleCard>
    </div>
  );
}
