import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReviewClient } from "./ReviewClient";
import { getSelectedChildId } from "@/lib/child-cookie";
import { getKSTEndOfDay } from "@/lib/kst-utils";

// 음소 다양성을 갖춘 5개 선별 (어려운 단어 우선, 같은 목표 단어 중복 제거)
function smartFilterReviews(
  items: { id: string; targetWord: string; childPronunciation: string; phoneme: string; errorPattern: string; reviewCount: number }[],
  maxCount: number
) {
  // 같은 목표 단어는 한 번만 — 입력 순서가 어려움 순(easeFactor asc)이므로 먼저 나온 것 유지
  const deduped: typeof items = [];
  const seenWord = new Set<string>();
  for (const item of items) {
    if (seenWord.has(item.targetWord)) continue;
    seenWord.add(item.targetWord);
    deduped.push(item);
  }

  const phonemeCount: Record<string, number> = {};
  for (const item of deduped) {
    phonemeCount[item.phoneme] = (phonemeCount[item.phoneme] ?? 0) + 1;
  }
  const sorted = [...deduped].sort(
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

  const [children, savedId] = await Promise.all([
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, image: true, mascotLevel: true },
    }),
    getSelectedChildId(),
  ]);

  if (children.length === 0) redirect("/onboarding");

  const child = children.find((c) => c.id === savedId) ?? children[0];

  const kstEndOfDay = getKSTEndOfDay();

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
