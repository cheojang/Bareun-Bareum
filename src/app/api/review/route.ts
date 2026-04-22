import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview } from "@/lib/sm2";

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

    // ✨ KST(한국 시간) 기준 오늘 날짜의 끝 구하기
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kstNow = new Date(utc + (9 * 60 * 60 * 1000));
    kstNow.setUTCHours(23, 59, 59, 999);
    const kstEndOfDayInUTC = new Date(kstNow.getTime() - (9 * 60 * 60 * 1000));

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
    const { scheduleId, quality } = body;

    if (!scheduleId || quality === undefined) {
      return NextResponse.json({ error: "scheduleId, quality 필수" }, { status: 400 });
    }

    if (quality < 0 || quality > 5) {
      return NextResponse.json({ error: "quality는 0~5 사이여야 합니다" }, { status: 400 });
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

    // SM-2 계산
    const result = calculateNextReview({
      reviewCount: schedule.reviewCount,
      interval: schedule.interval,
      easeFactor: schedule.easeFactor,
      quality,
    });

    // ✨ DB 업데이트 시 필요한 필드만 선택 반환 (민감한 정보 노출 방지)
    const updated = await prisma.reviewSchedule.update({
      where: { id: scheduleId },
      data: {
        reviewCount: result.newReviewCount,
        interval: result.newInterval,
        easeFactor: result.newEaseFactor,
        nextReviewAt: result.nextReviewAt,
        lastReviewedAt: new Date(),
        lastQuality: quality,
        isLearned: result.isLearned,
      },
      select: {
        id: true,
        nextReviewAt: true,
        isLearned: true,
      },
    });

    return NextResponse.json({
      success: true,
      isLearned: result.isLearned,
      nextReviewAt: result.nextReviewAt,
      nextIntervalDays: result.newInterval,
      reviewCount: result.newReviewCount,
      message: result.isLearned
        ? "🎉 완전히 외웠어요! 다음 복습 목록에서 졸업합니다."
        : quality >= 3
        ? `✅ 잘 했어요! 기억이 굳어지도록 ${result.newInterval}일 뒤에 다시 만나요.`
        : `💪 아직 어렵군요. 기초를 다지기 위해 내일 한 번 더 연습해요.`,
      schedule: updated,
    });
  } catch (error) {
    console.error("[Review POST API Error]:", error);
    return NextResponse.json(
      { error: "복습 결과를 저장할 수 없습니다" },
      { status: 500 }
    );
  }
}
