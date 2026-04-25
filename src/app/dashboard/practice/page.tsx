import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PracticeClient } from "./PracticeClient";

// KST 기준 오늘 자정 (UTC로 변환)
function getKstEndOfDay() {
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  kstNow.setUTCHours(23, 59, 59, 999);
  return new Date(kstNow.getTime() - 9 * 60 * 60 * 1000);
}

// 오늘 복습 아이템을 스마트하게 선별 — 많이 틀리는 음소 우선, 최대 5개
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

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ errorRecordId?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id!;

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (children.length === 0) redirect("/onboarding");

  const { getSelectedChildId } = await import("@/lib/child-cookie");
  const savedId = await getSelectedChildId();
  const child = children.find((c) => c.id === savedId) ?? children[0];

  const params = await searchParams;
  const errorRecordId = params.errorRecordId;

  const kstEndOfDay = getKstEndOfDay();

  // ── 오늘 복습이 필요한 단어 (ReviewSchedule) ─────────────────────────────
  const allReviewsDue = await prisma.reviewSchedule.findMany({
    where: {
      childId: child.id,
      isLearned: false,
      nextReviewAt: { lte: kstEndOfDay },
    },
    orderBy: { easeFactor: "asc" }, // easeFactor 낮을수록 어려운 단어
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

  // ── 1단계·2단계 단어 로딩 ────────────────────────────────────────────────
  // trainingTip을 단어별로 매칭하기 위해 stage1Words에 함께 저장
  // stage2Words는 sourceWord(원본 분석 단어)도 함께 저장
  let stage1Words: { word: string; errorPattern: string; trainingTip?: string; childPronunciation?: string }[] = [];
  let stage2Words: { word: string; sourceWord: string }[] = [];
  let errorPattern: string | undefined;

  if (errorRecordId) {
    // 분석 직후 연결: 해당 오류 기록 + 추천 단어
    const record = await prisma.errorRecord.findUnique({
      where: { id: errorRecordId },
      include: { geminiFeedback: { select: { recommendedWords: true, trainingStep2: true } } },
    });
    if (record && record.childId === child.id) {
      stage1Words = [{
        word: record.targetWord,
        errorPattern: record.errorPattern,
        trainingTip: record.geminiFeedback?.trainingStep2 ?? undefined,
        childPronunciation: record.childPronunciation,
      }];
      errorPattern = record.errorPattern;
      if (record.geminiFeedback?.recommendedWords) {
        try {
          const words: string[] = JSON.parse(record.geminiFeedback.recommendedWords);
          stage2Words = words
            .filter((w) => w.trim() && !w.includes(" "))
            .slice(0, 8)
            .map((w) => ({ word: w, sourceWord: record.targetWord }));
        } catch {}
      }
    }
  } else {
    // 일반 진입: 최근 오류 기록 중 ① 마스터 안 된 + ② 음소 다양성을 갖춘 5개 선정
    const errorRecords = await prisma.errorRecord.findMany({
      where: { childId: child.id },
      orderBy: { createdAt: "desc" },
      take: 30, // 다양성 확보용 풀
      include: {
        geminiFeedback: { select: { recommendedWords: true, trainingStep2: true } },
        reviewSchedule: { select: { phoneme: true, isLearned: true } },
      },
    });

    // 음소 추출: ReviewSchedule.phoneme 우선, 없으면 errorPattern 첫 자음 사용
    const getPhoneme = (rec: typeof errorRecords[number]): string => {
      if (rec.reviewSchedule?.phoneme && rec.reviewSchedule.phoneme !== "미분류") {
        return rec.reviewSchedule.phoneme;
      }
      const m = rec.errorPattern?.match(/^[ㄱ-ㅎ]/);
      return m ? m[0] : "전체";
    };

    // ① 마스터 완료(isLearned=true) 제외
    const notMastered = errorRecords.filter((r) => !r.reviewSchedule?.isLearned);

    const MAX_TOTAL = 5;
    const MAX_PER_PHONEME = 2;
    const stage1Seen = new Set<string>();
    const phonemeCount: Record<string, number> = {};

    const pushWord = (rec: typeof errorRecords[number]) => {
      stage1Seen.add(rec.targetWord);
      stage1Words.push({
        word: rec.targetWord,
        errorPattern: rec.errorPattern,
        trainingTip: rec.geminiFeedback?.trainingStep2 ?? undefined,
        childPronunciation: rec.childPronunciation,
      });
    };

    // ② 1차 패스: 음소 다양성 우선 (음소당 최대 2개)
    for (const rec of notMastered) {
      if (stage1Words.length >= MAX_TOTAL) break;
      if (stage1Seen.has(rec.targetWord)) continue;
      const ph = getPhoneme(rec);
      if ((phonemeCount[ph] ?? 0) >= MAX_PER_PHONEME) continue;
      phonemeCount[ph] = (phonemeCount[ph] ?? 0) + 1;
      pushWord(rec);
    }

    // ③ 2차 패스: 다양성으로 부족하면 음소 제한 풀고 채움
    if (stage1Words.length < MAX_TOTAL) {
      for (const rec of notMastered) {
        if (stage1Words.length >= MAX_TOTAL) break;
        if (stage1Seen.has(rec.targetWord)) continue;
        pushWord(rec);
      }
    }

    const stage2Seen = new Set<string>(stage1Seen);
    for (const rec of errorRecords) {
      if (!rec.geminiFeedback?.recommendedWords) continue;
      try {
        const words: string[] = JSON.parse(rec.geminiFeedback.recommendedWords);
        for (const w of words) {
          const clean = w.trim();
          if (clean && !clean.includes(" ") && !stage2Seen.has(clean)) {
            stage2Seen.add(clean);
            stage2Words.push({ word: clean, sourceWord: rec.targetWord });
            if (stage2Words.length >= 8) break;
          }
        }
      } catch {}
      if (stage2Words.length >= 8) break;
    }

    errorPattern = stage1Words[0]?.errorPattern;
  }

  return (
    <PracticeClient
      childId={child.id}
      childName={child.name}
      mascotLevel={child.mascotLevel}
      reviewItems={reviewItems}
      stage1Words={stage1Words}
      stage2Words={stage2Words}
      errorPattern={errorPattern}
    />
  );
}
