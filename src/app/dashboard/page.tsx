import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user!.id!;

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  const recentSessions = await prisma.practiceSession.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take: 3,
    include: {
      child: { select: { name: true } },
      _count: { select: { wordRecords: true } },
    },
  });

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <div className="text-7xl mb-4 animate-float">🐣</div>
        <h2 className="text-2xl font-black text-[#3D3530] mb-2">아이를 등록해주세요!</h2>
        <p className="text-[#8B7E74] mb-6">아이 정보를 입력하면 맞춤 연습을 시작할 수 있어요</p>
        <Link href="/onboarding">
          <BubbleButton variant="peach" size="lg">아이 등록하기</BubbleButton>
        </Link>
      </div>
    );
  }

  const child = children[0];

  return (
    <div className="px-5 pt-6 max-w-lg mx-auto space-y-5">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <MascotAvatar level={child.mascotLevel} />
        <div>
          <p className="text-sm text-[#8B7E74]">안녕하세요!</p>
          <h2 className="text-xl font-black text-[#3D3530]">{child.name} 성장 중 🌱</h2>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-[#FFF5EE] rounded-full px-3 py-1.5">
          <span className="text-lg">🔥</span>
          <span className="font-bold text-[#FFB38A] text-sm">{child.streakDays}일</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatMini value={child.totalWords} label="단어" emoji="📝" />
        <StatMini value={child.totalMinutes} label="분" emoji="⏱️" />
        <StatMini value={child.streakDays} label="연속" emoji="🔥" />
      </div>

      {/* Start session CTA */}
      <BubbleCard color="peach" className="text-center">
        <p className="text-lg font-black text-[#3D3530] mb-3">오늘도 연습해볼까요? 🎯</p>
        <Link href="/dashboard/session/new">
          <BubbleButton variant="peach" size="lg" className="w-full">
            발음 연습 시작!
          </BubbleButton>
        </Link>
      </BubbleCard>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="font-bold text-[#3D3530] mb-3">최근 연습</h3>
          <div className="space-y-3">
            {recentSessions.map((s) => (
              <BubbleCard key={s.id} padding="sm" className="flex items-center gap-4">
                <span className="text-2xl">📖</span>
                <div className="flex-1">
                  <p className="font-semibold text-[#3D3530] text-sm">{s.child.name}</p>
                  <p className="text-xs text-[#8B7E74]">
                    {s._count.wordRecords}개 단어 ·{" "}
                    {new Date(s.startedAt).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Link href={`/dashboard/session/${s.id}`}>
                  <span className="text-[#FFB38A] text-sm font-semibold">보기 →</span>
                </Link>
              </BubbleCard>
            ))}
          </div>
        </div>
      )}

      {/* Child play mode button */}
      <BubbleCard color="mint" className="text-center">
        <p className="font-bold text-[#3D3530] mb-2">🎮 아이에게 넘겨줄까요?</p>
        <p className="text-sm text-[#8B7E74] mb-3">아이 전용 놀이 화면으로 전환해요</p>
        <Link href="/dashboard/child">
          <BubbleButton variant="mint" className="w-full">아이 모드로!</BubbleButton>
        </Link>
      </BubbleCard>
    </div>
  );
}

function StatMini({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  return (
    <BubbleCard padding="sm" className="text-center">
      <span className="text-2xl">{emoji}</span>
      <p className="text-xl font-black text-[#3D3530]">{value}</p>
      <p className="text-xs text-[#8B7E74]">{label}</p>
    </BubbleCard>
  );
}

function MascotAvatar({ level }: { level: number }) {
  const emojis = ["🥚", "🐣", "🐥", "🐤", "🐦"];
  return (
    <div className="w-14 h-14 rounded-full bg-[#FFF5EE] flex items-center justify-center text-3xl border-2 border-[#FFD4B8]">
      {emojis[Math.min(level - 1, 4)]}
    </div>
  );
}
