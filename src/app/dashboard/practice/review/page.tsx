import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSelectedChildId } from "@/lib/child-cookie";
import { getKSTEndOfDay } from "@/lib/kst-utils";
import { ReviewSection } from "@/app/dashboard/bookmarks/ReviewSection";
import { BubbleCard } from "@/components/ui/BubbleCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * 오늘의 복습 페이지 — 망각곡선(SM-2) 기준 오늘 복습할 단어를 모아
 * "잘 했어요 / 아직 어려워요" 평가를 받는다. 5회 성공 시 일반화 프로브(졸업 시험)로 이어짐.
 */
export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  if (children.length === 0) redirect("/dashboard");

  const savedId = await getSelectedChildId();
  const child = children.find((c) => c.id === savedId) ?? children[0];

  // 오늘 복습할(졸업 안 한 + 예정일 도래) 스케줄 + 훈련 가이드 로드
  const due = await prisma.reviewSchedule.findMany({
    where: {
      childId: child.id,
      isLearned: false,
      nextReviewAt: { lte: getKSTEndOfDay() },
    },
    orderBy: { nextReviewAt: "asc" },
    take: 20,
    include: {
      errorRecord: {
        select: {
          geminiFeedback: {
            select: { trainingStep1: true, trainingStep2: true, trainingStep3: true, trainingStep4: true },
          },
        },
      },
    },
  });

  const items = due.map((s) => ({
    id: s.id,
    targetWord: s.targetWord,
    childPronunciation: s.childPronunciation,
    phoneme: s.phoneme === "미분류" ? "전체" : s.phoneme,
    errorPattern: s.errorPattern,
    reviewCount: s.reviewCount,
    interval: s.interval,
    nextReviewAt: s.nextReviewAt.toISOString(),
    trainingStep1: s.errorRecord?.geminiFeedback?.trainingStep1 ?? null,
    trainingStep2: s.errorRecord?.geminiFeedback?.trainingStep2 ?? null,
    trainingStep3: s.errorRecord?.geminiFeedback?.trainingStep3 ?? null,
    trainingStep4: s.errorRecord?.geminiFeedback?.trainingStep4 ?? null,
  }));

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <h2 className="text-2xl font-black text-[#3D3530]">🔔 오늘의 복습</h2>
        <p className="text-sm text-[#8B7E74] mt-1">
          망각곡선에 맞춰 딱 필요한 단어만 다시 연습해요
        </p>
      </div>

      {items.length === 0 ? (
        <BubbleCard className="text-center py-12">
          <div className="text-5xl mb-4">✅</div>
          <p className="font-bold text-[#3D3530]">오늘 복습할 단어가 없어요</p>
          <p className="text-sm text-[#8B7E74] mt-2 mb-5 leading-relaxed">
            발음 분석으로 새 단어를 추가하거나<br />
            분석단어 훈련을 이어가 보세요
          </p>
          <Link href="/dashboard/practice">
            <span className="inline-block px-5 py-2.5 bg-[#FFB38A] text-white rounded-full text-sm font-bold">
              분석단어 훈련 시작하기 →
            </span>
          </Link>
        </BubbleCard>
      ) : (
        <ReviewSection initialItems={items} childName={child.name} />
      )}
    </div>
  );
}
