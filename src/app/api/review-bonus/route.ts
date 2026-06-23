import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse } from "@/lib/api-auth";

const ALLOWED_CHANNELS = ["blog", "sns", "community", "playstore"] as const;
type Channel = (typeof ALLOWED_CHANNELS)[number];

// ── URL 크롤링 & 검증 ──────────────────────────────────────────────────────────

async function verifyUrl(
  url: string,
  channel: string,
): Promise<{
  status: "approved" | "rejected";
  charCount?: number;
  rejectReason?: string;
  approvedAt?: Date;
}> {
  const now = new Date();

  // Play Store: 크롤링 불가 → 자동 승인
  if (channel === "playstore" || url.includes("play.google.com")) {
    return { status: "approved", approvedAt: now };
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      signal: AbortSignal.timeout(6000),
      redirect: "follow",
    });

    if (!res.ok) {
      // 403, 404 등 접근 불가 → 자동 승인
      return { status: "approved", approvedAt: now };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/plain")
    ) {
      return { status: "approved", approvedAt: now };
    }

    const html = await res.text();

    // HTML 태그 제거 → 가시 텍스트 추출
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

    const charCount = text.length;

    // 내용이 있으나 150자 미만이면 거절
    if (charCount > 0 && charCount < 150) {
      return {
        status: "rejected",
        charCount,
        rejectReason: `페이지 내용이 너무 짧아요 (${charCount}자). 200자 이상의 후기를 작성해주세요.`,
      };
    }

    return { status: "approved", charCount, approvedAt: now };
  } catch {
    // 네트워크 오류, 타임아웃 → 자동 승인
    return { status: "approved", approvedAt: now };
  }
}

// ── 공통: 세션 & 게스트 체크 ──────────────────────────────────────────────────

async function requireMemberSession() {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError(401, "로그인이 필요해요");
  if (session.user.isGuest)
    throw new ApiError(403, "회원만 이용할 수 있는 기능이에요");
  return session.user.id;
}

// ── GET /api/review-bonus ──────────────────────────────────────────────────────

export async function GET() {
  try {
    const userId = await requireMemberSession();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let submissions: any[] = [];
    let bonusCount = 0;

    try {
      const [user, rawSubmissions] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          // reviewBonusCount 컬럼은 마이그레이션 후에만 존재
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          select: { reviewBonusCount: true } as any,
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).reviewBonus.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bonusCount = (user as any)?.reviewBonusCount ?? 0;
      submissions = rawSubmissions;
    } catch {
      return NextResponse.json(
        {
          error:
            "DB 마이그레이션이 필요해요. /api/migrate-review-bonus를 먼저 실행해주세요.",
        },
        { status: 503 },
      );
    }

    // canSubmit: 10회 미만 AND (제출 이력 없거나 7일 이상 경과 또는 마지막이 거절)
    const canSubmitByCount = bonusCount < 10;
    const lastApproved = submissions.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.status === "approved",
    );
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const canSubmitByTime =
      !lastApproved ||
      new Date(lastApproved.createdAt).getTime() < sevenDaysAgo.getTime();
    const canSubmit = canSubmitByCount && canSubmitByTime;

    return NextResponse.json({ submissions, bonusCount, canSubmit });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

// ── POST /api/review-bonus ─────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const userId = await requireMemberSession();

    const body = await request.json().catch(() => ({}));
    const url: unknown = body?.url;
    const channel: unknown = body?.channel;

    // 입력 검증
    if (typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "올바른 URL을 입력해주세요 (http:// 또는 https://로 시작)" },
        { status: 400 },
      );
    }
    if (
      typeof channel !== "string" ||
      !ALLOWED_CHANNELS.includes(channel as Channel)
    ) {
      return NextResponse.json(
        {
          error:
            "채널을 선택해주세요 (blog, sns, community, playstore 중 하나)",
        },
        { status: 400 },
      );
    }

    const urlHash = createHash("sha256")
      .update(url.toLowerCase().trim())
      .digest("hex");

    // DB 접근 (마이그레이션 확인)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let existingByHash: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastApprovedSubmission: any;

    try {
      [user, existingByHash, lastApprovedSubmission] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          select: { trialEndsAt: true, reviewBonusCount: true } as any,
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).reviewBonus.findUnique({ where: { urlHash } }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).reviewBonus.findFirst({
          where: { userId, status: "approved" },
          orderBy: { createdAt: "desc" },
        }),
      ]);
    } catch {
      return NextResponse.json(
        {
          error:
            "DB 마이그레이션이 필요해요. /api/migrate-review-bonus를 먼저 실행해주세요.",
        },
        { status: 503 },
      );
    }

    // 최대 횟수 체크
    if ((user?.reviewBonusCount ?? 0) >= 10) {
      return NextResponse.json(
        { error: "최대 10회 혜택을 모두 사용하셨어요" },
        { status: 400 },
      );
    }

    // 중복 URL 체크
    if (existingByHash) {
      return NextResponse.json(
        { error: "이미 제출한 URL이에요" },
        { status: 400 },
      );
    }

    // 7일 간격 체크 (마지막 승인 기준)
    if (lastApprovedSubmission) {
      const lastAt = new Date(lastApprovedSubmission.createdAt).getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const diff = Date.now() - lastAt;
      if (diff < sevenDaysMs) {
        const daysLeft = Math.ceil((sevenDaysMs - diff) / (24 * 60 * 60 * 1000));
        return NextResponse.json(
          {
            error: `마지막 승인 후 7일이 지나야 새로 신청할 수 있어요 (${daysLeft}일 후 가능)`,
          },
          { status: 400 },
        );
      }
    }

    // URL 크롤링 & 검증
    const result = await verifyUrl(url, channel);

    const now = new Date();

    if (result.status === "approved") {
      // trialEndsAt 연장
      const currentTrial = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
      const base =
        currentTrial && currentTrial.getTime() > now.getTime()
          ? currentTrial
          : now;
      const newTrialEndsAt = new Date(
        base.getTime() + 7 * 24 * 60 * 60 * 1000,
      );

      await (prisma as any).$transaction([
        (prisma as any).reviewBonus.create({
          data: {
            userId,
            url,
            urlHash,
            channel,
            status: "approved",
            charCount: result.charCount ?? null,
            approvedAt: result.approvedAt ?? now,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            trialEndsAt: newTrialEndsAt,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reviewBonusCount: { increment: 1 } as any,
          },
        }),
      ]);

      return NextResponse.json({
        status: "approved",
        newTrialEndsAt,
        message: "후기가 확인되었어요! 무료 이용 기간이 1주일 연장되었어요 🎉",
      });
    } else {
      // 거절 — 기록만 저장 (trialEndsAt 변경 없음)
      await (prisma as any).reviewBonus.create({
        data: {
          userId,
          url,
          urlHash,
          channel,
          status: "rejected",
          charCount: result.charCount ?? null,
          rejectReason: result.rejectReason ?? null,
        },
      });

      return NextResponse.json(
        {
          status: "rejected",
          rejectReason: result.rejectReason,
          message: result.rejectReason ?? "후기 내용이 기준을 충족하지 못했어요",
        },
        { status: 422 },
      );
    }
  } catch (e) {
    return apiErrorResponse(e);
  }
}
