import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSelectedChildId } from "@/lib/child-cookie";
import { getMinimalPairsByPhoneme, type MinimalPair } from "@/lib/word-database";
import { BubbleCard } from "@/components/ui/BubbleCard";

/**
 * 최소대립쌍 훈련 진입 라우터.
 *
 * 쿼리:
 * - phoneme: 훈련할 음소 (옵션) — 없으면 약점 top 1로 자동 선택
 * - childId: 자녀 ID (옵션) — 없으면 selectedChildId 쿠키 사용
 *
 * 흐름:
 * 1) child + phoneme 결정
 * 2) MINIMAL_PAIRS에서 해당 음소 포함된 쌍 추출 (최대 5쌍)
 * 3) 쌍 0개 → 안내 화면
 * 4) 쌍 ≥1개 → PracticeSession 생성 → /dashboard/session/{id}?pairs=... 로 redirect
 */
export default async function MinimalPairsRouter({
  searchParams,
}: {
  searchParams: Promise<{ phoneme?: string; childId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { phoneme: qPhoneme, childId: qChildId } = await searchParams;
  const savedId = await getSelectedChildId();
  const childId = qChildId ?? savedId ?? "";

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, userId: true, name: true },
  });
  if (!child || child.userId !== session.user.id) redirect("/dashboard");

  // 음소 결정: 쿼리 → 없으면 약점 top 1 (집중교정필요 우선)
  let targetPhoneme = qPhoneme?.trim();
  if (!targetPhoneme) {
    const top = await prisma.weakPhoneme.findFirst({
      where: {
        childId: child.id,
        weaknessLevel: { in: ["집중교정필요", "꾸준한연습필요"] },
      },
      orderBy: [{ weaknessLevel: "asc" }, { errorRate: "desc" }],
      select: { phoneme: true },
    });
    targetPhoneme = top?.phoneme;
  }

  // 쌍 추출 — 음소가 정해졌으면 그 음소, 아니면 빈 배열
  const pairs: MinimalPair[] = targetPhoneme
    ? getMinimalPairsByPhoneme(targetPhoneme).slice(0, 5)
    : [];

  // 안내 화면: 음소가 없거나 해당 음소 쌍이 없을 때
  if (pairs.length === 0) {
    return (
      <div className="px-5 pt-10 max-w-lg mx-auto">
        <BubbleCard color="peach">
          <p className="text-4xl text-center mb-3">🎯</p>
          <p className="font-bold text-[#3D3530] text-lg text-center mb-2">
            최소대립쌍 훈련
          </p>
          <p className="text-sm text-[#8B7E74] leading-relaxed text-center mb-4">
            {targetPhoneme
              ? <>현재 <strong>{targetPhoneme}</strong> 소리에 해당하는 대립쌍이 준비되지 않았어요.</>
              : <>아직 약점 소리가 충분히 분석되지 않았어요. 발음 분석을 더 많이 해주세요.</>}
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/dashboard/answer-note"
              className="px-5 py-2.5 bg-[#FFB38A] text-white rounded-full text-sm font-bold"
            >
              발음 분석 →
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[#F0E8E0] text-[#3D3530] rounded-full text-sm font-bold"
            >
              홈으로
            </Link>
          </div>
        </BubbleCard>
      </div>
    );
  }

  // 세션 생성 + redirect — MinimalPairsPracticeClient가 pairs를 받아 실행
  const practiceSession = await prisma.practiceSession.create({
    data: { userId: session.user.id, childId: child.id },
  });
  const pairsParam = encodeURIComponent(JSON.stringify(pairs));
  redirect(`/dashboard/session/${practiceSession.id}?pairs=${pairsParam}`);
}
