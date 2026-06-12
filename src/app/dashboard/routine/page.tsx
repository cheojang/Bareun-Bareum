import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSelectedChildId } from "@/lib/child-cookie";
import { getKSTEndOfDay } from "@/lib/kst-utils";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";

/**
 * 오늘의 루틴 오케스트레이터 — 홈 "오늘의 루틴 시작" 진입점.
 *
 * 학습과학 원칙: 복습 먼저(간격 반복) → 집중 연습(약점 1개) → 보상.
 * 한 번의 탭으로 시퀀스가 자동 연결되어 부모의 의사결정 피로를 없앤다.
 *
 *  1단계: SM-2 만기 복습이 있으면 복습부터 (routine=1로 체인 연결)
 *  2단계: 분석단어 집중 연습 (루틴 모드: 단어 수 상한 — 5~7분 세션)
 *  완료:  연습 완료 화면(콘페티+생활 코칭 카드)이 보상 역할
 */
export default async function RoutinePage() {
  const session = await auth();
  const userId = session!.user!.id!;
  if (session?.user?.isGuest) redirect("/dashboard/answer-note");

  const [children, savedId] = await Promise.all([
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
    getSelectedChildId(),
  ]);
  if (children.length === 0) redirect("/onboarding");
  const child = children.find((c) => c.id === savedId) ?? children[0];

  const [reviewDueCount, errorRecordCount] = await Promise.all([
    prisma.reviewSchedule.count({
      where: { childId: child.id, isLearned: false, nextReviewAt: { lte: getKSTEndOfDay() } },
    }),
    prisma.errorRecord.count({ where: { childId: child.id } }),
  ]);

  // 1단계: 복습이 있으면 복습부터
  if (reviewDueCount > 0) redirect("/dashboard/practice/review?routine=1");
  // 2단계: 복습이 없으면 바로 집중 연습
  if (errorRecordCount > 0) redirect("/dashboard/practice?routine=1");

  // 연습 재료가 없음 — 발음 분석부터 안내
  return (
    <div className="px-5 pt-10 max-w-lg mx-auto">
      <BubbleCard color="peach" className="text-center">
        <p className="text-4xl mb-3">🌱</p>
        <p className="font-bold text-[#3D3530] text-lg mb-2">먼저 발음 분석을 해주세요</p>
        <p className="text-sm text-[#8B7E74] leading-relaxed mb-5">
          {child.name}의 발음을 분석하면<br />
          매일 5분 맞춤 루틴이 자동으로 만들어져요
        </p>
        <Link href="/dashboard/answer-note">
          <BubbleButton variant="peach" size="lg" className="w-full">
            발음 분석 시작하기 →
          </BubbleButton>
        </Link>
      </BubbleCard>
    </div>
  );
}
