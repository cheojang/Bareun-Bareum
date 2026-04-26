import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReviewClient } from "./ReviewClient";
import { getSelectedChildId } from "@/lib/child-cookie";

// KST 기준 오늘 자정 (UTC로 변환)
function getKstEndOfDay() {
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  kstNow.setUTCHours(23, 59, 59, 999);
  return new Date(kstNow.getTime() - 9 * 60 * 60 * 1000);
}

// 음소 다양성을 갖춘 5개 선별 (어려운 단어 우선)
function smartFilterReviews(
  items: { id: string; targetWord: string; childPronunciation: string; phoneme: string; errorPattern: string; reviewCount: number }[],
  maxCount: number
) {
  const phonemeCount: Record<string, number> = {};
  for (const item of items) {
    phonemeCount[item.phoneme] = (phonemeCount[item.phoneme] ?? 0) + 1;
  }
  const sorted = [...items].sort(
    (a, b) => (phonemeCount[b.phoneme] ?? 0) - (phonemeCount[a.phoneme] ?? 0)
  );
  const result: typeof items = [];
  const phonemeUsed: Record<string, number> = {};
  for (const item of sorted) {
    if (result.length >= maxCount) break;
    const used = phonemeUsed[item.phoneme] ?? 0;
    if (used >= 2) continue;
    phonemeUsed[item.phoneme] = used + 1;
    result.push(item);
  }
  return result;
}

export default async function ReviewPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (children.length === 0) redirect("/onboarding");

  const savedId = await getSelectedChildId();
  const child = children.find((c) => c.id === savedId) ?? children[0];

  const kstEndOfDay = getKstEndOfDay();

  // 망각곡선(SM-2) 기반 오늘 복습 필요 단어
  const allReviewsDue = await prisma.reviewSchedule.findMany({
    where: {
      childId: child.id,
      isLearned: false,
      nextReviewAt: { lte: kstEndOfDay },
    },
    orderBy: { easeFactor: "asc" }, // easeFactor 낮을수록 어려운 단어 우선
    take: 20,
  });

  const reviewItems = smartFilterReviews(
    allReviewsDue.map((r) => ({
      id: r.id,
      targetWord: r.targetWord,
      childPronunciation: r.childPronunciation,
      phoneme: r.phoneme === "미분류" ? "전체" : r.phoneme,
      errorPattern: r.errorPattern,
      reviewCount: r.reviewCount,
    })),
    5
  );

  return (
    <ReviewClient
      childId={child.id}
      childName={child.name}
      childImage={child.image}
      mascotLevel={child.mascotLevel}
      reviewItems={reviewItems}
    />
  );
}
