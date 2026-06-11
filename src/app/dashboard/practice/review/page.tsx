import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReviewClient, type ReviewSeqItem } from "./ReviewClient";
import { getSelectedChildId } from "@/lib/child-cookie";
import { getImagedWordsByPhoneme } from "@/lib/word-database";
import { getKSTEndOfDay } from "@/lib/kst-utils";

const SIMILAR_PER_WORD = 3; // 분석단어 1개당 따라오는 유사단어 수

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

  // ── 시퀀스 구성: 분석단어 1개 → 그림 있는 유사단어 3개 → 다음 분석단어 ... ──────
  // 유사단어는 같은 음소를 가진 "이미지 있는" DB 단어에서 선택(중복 제거)
  const usedSimilar = new Set<string>();
  const sequence: ReviewSeqItem[] = [];
  for (const r of reviewItems) {
    sequence.push({
      kind: "analysis",
      key: `a-${r.id}`,
      word: r.targetWord,
      phoneme: r.phoneme,
      scheduleId: r.id,
      childPronunciation: r.childPronunciation,
      reviewCount: r.reviewCount,
    });
    const sims = getImagedWordsByPhoneme(r.phoneme)
      .filter((w) => w.word !== r.targetWord && !usedSimilar.has(w.word))
      .slice(0, SIMILAR_PER_WORD);
    for (const s of sims) {
      usedSimilar.add(s.word);
      sequence.push({
        kind: "similar",
        key: `s-${s.word}`,
        word: s.word,
        phoneme: r.phoneme,
        imageSlug: s.imageSlug!,
        sourceWord: r.targetWord,
      });
    }
  }

  return (
    <ReviewClient
      childId={child.id}
      childName={child.name}
      childImage={child.image}
      mascotLevel={child.mascotLevel}
      sequence={sequence}
    />
  );
}
