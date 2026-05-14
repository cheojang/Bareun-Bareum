import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SEED_WORD_PAIRS } from "@/data/seed-word-pairs";
import { isAdmin } from "@/lib/admin-auth";

type WordPairKey = { targetWord: string; childPronunciation: string };
type TplSelect = {
  phoneme: string; position: string; errorType: string; errorCategory: string;
  rootCause: string; trainingStep1: string; trainingStep2: string;
  trainingStep3: string; trainingStep4: string; recommendedWords: string; parentHint: string;
};

/**
 * GET /api/admin/seed-word-pairs
 * WordPairCache 사전 시딩 진행 상황 조회
 */
export async function GET(_: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const seededPairs = await prisma.wordPairCache.findMany({
    select: { targetWord: true, childPronunciation: true },
  });
  const seededSet = new Set(
    seededPairs.map((p: WordPairKey) => `${p.targetWord}|${p.childPronunciation}`)
  );

  const remaining = SEED_WORD_PAIRS.filter(
    (p) => !seededSet.has(`${p.targetWord}|${p.childPronunciation}`)
  ).length;

  const templateCount = await prisma.phonemeTemplate.count();

  return NextResponse.json({
    totalSeedPairs: SEED_WORD_PAIRS.length,
    seeded: seededPairs.length,
    remaining,
    phonemeTemplates: templateCount,
  });
}

/**
 * POST /api/admin/seed-word-pairs
 * body: { limit?: number }  — 한 번 호출로 처리할 최대 항목 수 (기본 20, 최대 50)
 *
 * PhonemeTemplate에서 훈련법을 가져와 WordPairCache를 채웁니다.
 * Gemini 호출 없이 완전 무료로 동작합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const limit: number = Math.min(Number(body.limit) || 20, 50);

    // 이미 시딩된 단어쌍 조회
    const existing = await prisma.wordPairCache.findMany({
      select: { targetWord: true, childPronunciation: true },
    });
    const existingSet = new Set(
      existing.map((e: WordPairKey) => `${e.targetWord}|${e.childPronunciation}`)
    );

    // 미완료 항목 추출
    const pending = SEED_WORD_PAIRS.filter(
      (p) => !existingSet.has(`${p.targetWord}|${p.childPronunciation}`)
    ).slice(0, limit);

    if (pending.length === 0) {
      return NextResponse.json({
        message: "모든 단어쌍이 이미 시딩되어 있습니다",
        seeded: existing.length,
      });
    }

    // PhonemeTemplate 전체 로드 (배치 처리 중 반복 DB 조회 줄이기)
    const templates = await prisma.phonemeTemplate.findMany({
      select: {
        phoneme: true,
        position: true,
        errorType: true,
        errorCategory: true,
        rootCause: true,
        trainingStep1: true,
        trainingStep2: true,
        trainingStep3: true,
        trainingStep4: true,
        recommendedWords: true,
        parentHint: true,
      },
    });
    const templateMap = new Map<string, TplSelect>(
      templates.map((t: TplSelect) => [`${t.phoneme}|${t.position}|${t.errorType}`, t])
    );

    const stats = { fromTemplate: 0, skipped: 0, errors: [] as string[] };

    for (const pair of pending) {
      const key = `${pair.phoneme}|${pair.position}|${pair.errorType}`;
      const tpl = templateMap.get(key);

      if (!tpl) {
        stats.skipped++;
        continue;
      }

      try {
        await prisma.wordPairCache.upsert({
          where: {
            targetWord_childPronunciation: {
              targetWord: pair.targetWord,
              childPronunciation: pair.childPronunciation,
            },
          },
          create: {
            targetWord:         pair.targetWord,
            childPronunciation: pair.childPronunciation,
            errorType:          tpl.errorType,
            errorCategory:      tpl.errorCategory,
            rootCause:          tpl.rootCause,
            trainingStep1:      tpl.trainingStep1,
            trainingStep2:      tpl.trainingStep2,
            trainingStep3:      tpl.trainingStep3,
            trainingStep4:      tpl.trainingStep4,
            recommendedWords:   tpl.recommendedWords,
            parentMessage:      tpl.parentHint,
            hitCount:           0,
          },
          update: {},
        });
        stats.fromTemplate++;
      } catch (err) {
        stats.errors.push(
          `${pair.targetWord}/${pair.childPronunciation}: ${(err as Error).message}`
        );
      }
    }

    const totalSeeded = existing.length + stats.fromTemplate;
    const totalRemaining = SEED_WORD_PAIRS.filter(
      (p) => !existingSet.has(`${p.targetWord}|${p.childPronunciation}`)
    ).length - stats.fromTemplate - stats.skipped;

    return NextResponse.json({
      processed: pending.length,
      fromTemplate: stats.fromTemplate,
      skipped: stats.skipped,
      errors: stats.errors,
      totalSeeded,
      totalRemaining: Math.max(0, totalRemaining),
    });
  } catch (error) {
    console.error("[seed-word-pairs]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
