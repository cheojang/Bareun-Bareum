import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview } from "@/lib/sm2";
import { getKSTDayAfter, getKSTEndOfDay } from "@/lib/kst-utils";
import { getSimilarPatternWords, phonemePositionFromError } from "@/lib/word-database";

// 일반화 프로브: 졸업 직전, 한 번도 연습하지 않은 같은-음소 단어 몇 개로 전이 확인
const PROBE_WORD_COUNT = 3;
const GRADUATION_THRESHOLD = 5; // SM-2 성공 횟수 (sm2.ts와 일치)

/**
 * 졸업 프로브용 "새 단어" 선정 — 같은 음소인데 이 아이가 한 번도 다루지 않은 단어.
 * 연습 단어에서 성공했어도 새 단어로 전이(일반화)되는지 확인하기 위함.
 */
async function pickProbeWords(
  childId: string,
  phoneme: string,
  errorPattern: string,
  excludeWord: string,
): Promise<string[]> {
  // 이 아이가 이미 오답/복습으로 다룬 단어 = "연습한 단어" → 프로브에서 제외
  const seenRows = await prisma.reviewSchedule.findMany({
    where: { childId },
    select: { targetWord: true },
  });
  const seen = new Set<string>(seenRows.map((r) => r.targetWord));
  seen.add(excludeWord);

  const pos = phonemePositionFromError(errorPattern, "");
  const pool = getSimilarPatternWords(phoneme, pos)
    .filter((w) => !seen.has(w.word));
  // 쉬운→어려운 순으로 이미 정렬되어 옴(preferredDifficulty 미지정 시 원순서) — 앞에서 N개
  return pool.slice(0, PROBE_WORD_COUNT).map((w) => w.word);
}

/**
 * GET /api/review?childId=xxx
 * 오늘 복습이 필요한 단어 목록 반환
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

    if (!childId) {
      return NextResponse.json({ error: "childId 필수" }, { status: 400 });
    }

    // 소유권 확인
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.userId !== session.user.id) {
      return NextResponse.json({ error: "접근 권한 없음" }, { status: 403 });
    }

    // KST(한국 시간) 기준 오늘 날짜의 끝
    const kstEndOfDayInUTC = getKSTEndOfDay();

    // 오늘 복습이 필요한 단어 (졸업하지 않은 것) + 전체 미완료 개수 병렬 조회
    const [dueItems, totalPending] = await Promise.all([
      prisma.reviewSchedule.findMany({
        where: {
          childId,
          isLearned: false,
          nextReviewAt: { lte: kstEndOfDayInUTC },
        },
        orderBy: { nextReviewAt: "asc" },
      }),
      prisma.reviewSchedule.count({
        where: { childId, isLearned: false },
      }),
    ]);

    return NextResponse.json({
      dueToday: dueItems.length,
      totalPending,
      items: dueItems.map((item) => ({
        id: item.id,
        targetWord: item.targetWord,
        childPronunciation: item.childPronunciation,
        phoneme: item.phoneme === "미분류" ? "전체" : item.phoneme,
        errorPattern: item.errorPattern,
        reviewCount: item.reviewCount,
        interval: item.interval,
        nextReviewAt: item.nextReviewAt,
        lastReviewedAt: item.lastReviewedAt,
      })),
    });
  } catch (error) {
    console.error("[Review GET API Error]:", error);
    return NextResponse.json(
      { error: "복습 목록을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/review
 * 복습 결과 제출 → SM-2로 다음 복습일 계산
 * body: { scheduleId, quality }
 *   quality: 5 = "잘 했어요", 1 = "아직 어려워요"
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const body = await request.json();
    const { scheduleId, quality, probe } = body;

    if (!scheduleId) {
      return NextResponse.json({ error: "scheduleId 필수" }, { status: 400 });
    }

    const schedule = await prisma.reviewSchedule.findUnique({
      where: { id: scheduleId },
      include: { child: true },
    });

    if (!schedule) {
      return NextResponse.json({ error: "스케줄을 찾을 수 없습니다" }, { status: 404 });
    }

    if (schedule.child.userId !== session.user.id) {
      return NextResponse.json({ error: "접근 권한 없음" }, { status: 403 });
    }

    // ── 분기 1: 일반화 프로브 결과 제출 (졸업 최종 판정) ──────────────────────
    if (probe === "pass" || probe === "fail") {
      if (probe === "pass") {
        // 새 단어로도 전이 확인됨 → 진짜 졸업
        await prisma.reviewSchedule.update({
          where: { id: scheduleId },
          data: { isLearned: true, lastReviewedAt: new Date() },
        });
        return NextResponse.json({
          success: true,
          isLearned: true,
          graduated: true,
          message: "🎓 새 단어에서도 성공했어요! 완전히 익힌 소리로 졸업합니다.",
        });
      }
      // 프로브 실패 → 아직 일반화 안 됨. 임계 아래로 낮춰 계속 연습 (내일 재복습)
      await prisma.reviewSchedule.update({
        where: { id: scheduleId },
        data: {
          reviewCount: 3,
          interval: 1,
          nextReviewAt: getKSTDayAfter(1),
          lastReviewedAt: new Date(),
          isLearned: false,
        },
      });
      return NextResponse.json({
        success: true,
        isLearned: false,
        graduated: false,
        message: "💡 익숙한 단어는 잘하지만 새 단어는 조금 더예요. 며칠 더 연습하면 완성돼요!",
      });
    }

    // ── 분기 2: 일반 복습 결과 (SM-2) ────────────────────────────────────────
    if (quality === undefined) {
      return NextResponse.json({ error: "quality 또는 probe 필수" }, { status: 400 });
    }
    if (quality < 0 || quality > 5) {
      return NextResponse.json({ error: "quality는 0~5 사이여야 합니다" }, { status: 400 });
    }

    // SM-2 계산
    const result = calculateNextReview({
      reviewCount: schedule.reviewCount,
      interval: schedule.interval,
      easeFactor: schedule.easeFactor,
      quality,
    });

    // 🎓 일반화 게이트: 5회 성공(졸업 임계)에 도달해도 바로 졸업시키지 않는다.
    //    같은 단어만 반복 성공한 것일 수 있으므로, "한 번도 안 해본 같은-음소 단어"
    //    프로브를 통과해야 진짜 졸업. 여기선 isLearned를 보류(false)하고 프로브를 요청.
    const reachedThreshold = quality >= 3 && result.newReviewCount >= GRADUATION_THRESHOLD;

    // isLearned는 프로브 통과 시에만 true로. 임계 도달분은 count만 유지하고 보류.
    // 프로브 대기 상태에서 이탈해도 곧 다시 시험 볼 수 있게 nextReviewAt을 내일로 당긴다.
    await prisma.reviewSchedule.update({
      where: { id: scheduleId },
      data: {
        reviewCount: result.newReviewCount,
        interval: result.newInterval,
        easeFactor: result.newEaseFactor,
        nextReviewAt: reachedThreshold ? getKSTDayAfter(1) : result.nextReviewAt,
        lastReviewedAt: new Date(),
        lastQuality: quality,
        isLearned: false, // 프로브 통과 전까지 졸업 보류
      },
    });

    if (reachedThreshold) {
      const probeWords = await pickProbeWords(
        schedule.childId,
        schedule.phoneme === "미분류" ? (schedule.errorPattern.match(/[ㄱ-ㅎ]/)?.[0] ?? "전체") : schedule.phoneme,
        schedule.errorPattern,
        schedule.targetWord,
      );
      // 프로브에 쓸 새 단어가 없으면(희귀 음소 등) 게이트 없이 바로 졸업 처리
      if (probeWords.length === 0) {
        await prisma.reviewSchedule.update({
          where: { id: scheduleId },
          data: { isLearned: true },
        });
        return NextResponse.json({
          success: true,
          isLearned: true,
          graduated: true,
          message: "🎉 완전히 외웠어요! 복습 목록에서 졸업합니다.",
        });
      }
      return NextResponse.json({
        success: true,
        isLearned: false,
        needsProbe: true,
        probeWords,
        phoneme: schedule.phoneme === "미분류" ? "전체" : schedule.phoneme,
        message: "🎓 졸업 시험! 처음 보는 단어도 잘 말하는지 확인해요.",
      });
    }

    return NextResponse.json({
      success: true,
      isLearned: false,
      nextReviewAt: result.nextReviewAt,
      nextIntervalDays: result.newInterval,
      reviewCount: result.newReviewCount,
      message:
        quality >= 3
          ? `✅ 잘 했어요! 기억이 굳어지도록 ${result.newInterval}일 뒤에 다시 만나요.`
          : `💪 아직 어렵군요. 기초를 다지기 위해 내일 한 번 더 연습해요.`,
    });
  } catch (error) {
    console.error("[Review POST API Error]:", error);
    return NextResponse.json(
      { error: "복습 결과를 저장할 수 없습니다" },
      { status: 500 }
    );
  }
}
