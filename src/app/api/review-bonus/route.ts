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

    // canSubmit: 4회 미만 AND (제출 이력 없거나 30일 이상 경과 또는 마지막이 거절)
    const canSubmitByCount = bonusCount < 4;
    const lastApproved = submissions.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.status === "approved",
    );
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const canSubmitByTime =
      !lastApproved ||
      new Date(lastApproved.createdAt).getTime() < thirtyDaysAgo.getTime();
    const canSubmit = canSubmitByCount && canSubmitByTime;

    return NextResponse.json({ submissions, bonusCount, canSubmit });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

// ── POST /api/review-bonus ─────────────────────────────────────────────────────

// ── 일괄 제출 핸들러 ────────────────────────────────────────────────────────
// 30일 냉각 없음 — 여러 후기를 한꺼번에 제출해 누적 혜택 즉시 적용
async function handleBulkPost(
  userId: string,
  rawItems: unknown[],
): Promise<NextResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TOTAL_MONTHS: Record<number, number> = { 0: 0, 1: 1, 2: 1, 3: 2, 4: 3 };

  // 유효 항목 추출
  const validated: {
    url: string | null;
    screenshotUrl: string | null;
    channel: Channel;
  }[] = [];
  for (const item of rawItems) {
    if (!item || typeof item !== "object") continue;
    const { url, screenshotUrl, channel } = item as Record<string, unknown>;
    const hasUrl = typeof url === "string" && url.startsWith("http");
    const hasScreenshot =
      typeof screenshotUrl === "string" && screenshotUrl.startsWith("http");
    if (!hasUrl && !hasScreenshot) continue;
    if (!ALLOWED_CHANNELS.includes(channel as Channel)) continue;
    validated.push({
      url: hasUrl ? (url as string) : null,
      screenshotUrl: hasScreenshot ? (screenshotUrl as string) : null,
      channel: channel as Channel,
    });
  }

  if (validated.length === 0) {
    return NextResponse.json({ error: "유효한 후기가 없어요" }, { status: 400 });
  }

  // 사용자 현재 상태
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let user: any;
  try {
    user = await (prisma.user as any).findUnique({
      where: { id: userId },
      select: { trialEndsAt: true, reviewBonusCount: true },
    });
  } catch {
    return NextResponse.json(
      { error: "DB 마이그레이션이 필요해요. /api/migrate-review-bonus를 먼저 실행해주세요." },
      { status: 503 },
    );
  }

  const currentCount = (user?.reviewBonusCount ?? 0) as number;
  if (currentCount >= 4) {
    return NextResponse.json({ error: "최대 4회 혜택을 모두 사용하셨어요" }, { status: 400 });
  }

  const remaining = 4 - currentCount;
  const toProcess = validated.slice(0, remaining);
  const now = new Date();

  // 각 항목 검증 (URL 중복 + 내용 길이)
  const approvedItems: {
    url: string | null;
    urlHash: string | null;
    screenshotUrl: string | null;
    channel: string;
    charCount: number | null;
    approvedAt: Date;
  }[] = [];
  const rejectedItems: {
    url: string | null;
    urlHash: string | null;
    screenshotUrl: string | null;
    channel: string;
    charCount: number | null;
    rejectReason: string | null;
  }[] = [];

  for (const item of toProcess) {
    const urlHash = item.url
      ? createHash("sha256").update(item.url.toLowerCase().trim()).digest("hex")
      : null;

    if (urlHash) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = await (prisma as any).reviewBonus.findUnique({ where: { urlHash } });
      if (existing) {
        rejectedItems.push({
          ...item,
          urlHash,
          charCount: null,
          rejectReason: "이미 제출한 URL이에요",
        });
        continue;
      }
    }

    const result = item.screenshotUrl
      ? { status: "approved" as const, approvedAt: now }
      : await verifyUrl(item.url!, item.channel);

    if (result.status === "approved") {
      approvedItems.push({
        url: item.url,
        urlHash,
        screenshotUrl: item.screenshotUrl,
        channel: item.channel,
        charCount: result.charCount ?? null,
        approvedAt: result.approvedAt ?? now,
      });
    } else {
      rejectedItems.push({
        url: item.url,
        urlHash,
        screenshotUrl: item.screenshotUrl,
        channel: item.channel,
        charCount: result.charCount ?? null,
        rejectReason: result.rejectReason ?? null,
      });
    }
  }

  // 거절 항목 저장 (트랜잭션 밖)
  for (const r of rejectedItems) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).reviewBonus.create({
        data: { userId, ...r, status: "rejected" },
      });
    } catch { /* 비핵심, 무시 */ }
  }

  if (approvedItems.length === 0) {
    return NextResponse.json(
      { status: "allRejected", approved: 0, rejected: rejectedItems.length, message: "제출한 후기가 기준을 충족하지 못했어요" },
      { status: 422 },
    );
  }

  // 누적 연장 개월 계산
  const finalCount = Math.min(currentCount + approvedItems.length, 4);
  const extensionMonths = (TOTAL_MONTHS[finalCount] ?? 3) - (TOTAL_MONTHS[currentCount] ?? 0);

  let newTrialEndsAt: Date | null = null;
  if (extensionMonths > 0) {
    const currentTrial = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const base =
      currentTrial && currentTrial.getTime() > now.getTime() ? currentTrial : now;
    newTrialEndsAt = new Date(base);
    newTrialEndsAt.setMonth(newTrialEndsAt.getMonth() + extensionMonths);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = { reviewBonusCount: { increment: approvedItems.length } };
  if (newTrialEndsAt) updateData.trialEndsAt = newTrialEndsAt;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).$transaction([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...approvedItems.map((a) =>
      (prisma as any).reviewBonus.create({ data: { userId, ...a, status: "approved" } })
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.user as any).update({ where: { id: userId }, data: updateData }),
  ]);

  const totalMonths = TOTAL_MONTHS[finalCount] ?? 3;

  return NextResponse.json({
    status: "approved",
    approved: approvedItems.length,
    rejected: rejectedItems.length,
    newTrialEndsAt,
    extensionMonths,
    totalMonths,
    message:
      extensionMonths > 0
        ? `${approvedItems.length}개 후기가 확인되었어요! 무료 이용 기간이 ${extensionMonths}개월 연장되었어요 🎉 (총 ${totalMonths}개월)`
        : `${approvedItems.length}개 후기가 기록되었어요 📝`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireMemberSession();

    const body = await request.json().catch(() => ({}));

    // 일괄 제출 분기
    if (Array.isArray(body?.items)) {
      return handleBulkPost(userId, body.items);
    }

    const url: unknown = body?.url;
    const screenshotUrl: unknown = body?.screenshotUrl;
    const channel: unknown = body?.channel;

    // URL 또는 스크린샷 중 하나 필수
    const hasUrl = typeof url === "string" && url.startsWith("http");
    const hasScreenshot = typeof screenshotUrl === "string" && screenshotUrl.startsWith("http");
    if (!hasUrl && !hasScreenshot) {
      return NextResponse.json(
        { error: "후기 URL 또는 캡처본 이미지 중 하나를 제출해주세요" },
        { status: 400 },
      );
    }
    if (
      typeof channel !== "string" ||
      !ALLOWED_CHANNELS.includes(channel as Channel)
    ) {
      return NextResponse.json(
        { error: "채널을 선택해주세요 (blog, sns, community, playstore 중 하나)" },
        { status: 400 },
      );
    }

    const urlHash = hasUrl
      ? createHash("sha256").update((url as string).toLowerCase().trim()).digest("hex")
      : null;

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
        // 스크린샷만 제출하면 urlHash=null — unique where에 null을 넘기면 Prisma가
        // 던져서 "마이그레이션 필요" 503으로 오인되므로, URL 제출일 때만 중복 조회
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        urlHash ? (prisma as any).reviewBonus.findUnique({ where: { urlHash } }) : Promise.resolve(null),
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

    // 최대 횟수 체크 (4회 = 최대 3개월)
    if ((user?.reviewBonusCount ?? 0) >= 4) {
      return NextResponse.json(
        { error: "최대 4회 혜택을 모두 사용하셨어요" },
        { status: 400 },
      );
    }

    // 중복 URL 체크 (URL 제출 시만)
    if (existingByHash) {
      return NextResponse.json(
        { error: "이미 제출한 URL이에요" },
        { status: 400 },
      );
    }

    // 30일 간격 체크 (마지막 승인 기준)
    if (lastApprovedSubmission) {
      const lastAt = new Date(lastApprovedSubmission.createdAt).getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const diff = Date.now() - lastAt;
      if (diff < thirtyDaysMs) {
        const daysLeft = Math.ceil((thirtyDaysMs - diff) / (24 * 60 * 60 * 1000));
        return NextResponse.json(
          {
            error: `마지막 승인 후 30일이 지나야 새로 신청할 수 있어요 (${daysLeft}일 후 가능)`,
          },
          { status: 400 },
        );
      }
    }

    // 스크린샷 제출 시 자동 승인, URL 제출 시 크롤링 검증
    const result = hasScreenshot
      ? { status: "approved" as const, approvedAt: new Date() }
      : await verifyUrl(url as string, channel);

    const now = new Date();

    if (result.status === "approved") {
      // 누적 횟수별 이번 회차 연장 개월 수: 1회→+1, 2회→+0, 3회→+1, 4회→+1
      const currentCount = user?.reviewBonusCount ?? 0;
      const newCount = currentCount + 1;
      const MONTHLY_EXTENSION: Record<number, number> = { 1: 1, 2: 0, 3: 1, 4: 1 };
      const extensionMonths = MONTHLY_EXTENSION[newCount] ?? 0;

      let newTrialEndsAt: Date | null = null;
      if (extensionMonths > 0) {
        const currentTrial = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
        const base =
          currentTrial && currentTrial.getTime() > now.getTime()
            ? currentTrial
            : now;
        newTrialEndsAt = new Date(base);
        newTrialEndsAt.setMonth(newTrialEndsAt.getMonth() + extensionMonths);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = { reviewBonusCount: { increment: 1 } };
      if (newTrialEndsAt) updateData.trialEndsAt = newTrialEndsAt;

      await (prisma as any).$transaction([
        (prisma as any).reviewBonus.create({
          data: {
            userId,
            url: hasUrl ? url : null,
            urlHash,
            screenshotUrl: hasScreenshot ? screenshotUrl : null,
            channel,
            status: "approved",
            charCount: result.charCount ?? null,
            approvedAt: result.approvedAt ?? now,
          },
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma.user as any).update({
          where: { id: userId },
          data: updateData,
        }),
      ]);

      // 누적 횟수별 총 연장 개월: 1→1개월, 2→1개월(변화없음), 3→2개월, 4→3개월
      const TOTAL_MONTHS: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 3 };
      const totalMonths = TOTAL_MONTHS[newCount] ?? 0;

      if (extensionMonths > 0) {
        return NextResponse.json({
          status: "approved",
          newTrialEndsAt,
          message: `후기가 확인되었어요! 무료 이용 기간이 1개월 연장되었어요 🎉 (총 ${totalMonths}개월)`,
        });
      } else {
        return NextResponse.json({
          status: "approved",
          message: "후기가 기록되었어요! 한 번 더 작성하면 총 2개월 연장돼요 📝",
        });
      }
    } else {
      // 거절 — 기록만 저장 (trialEndsAt 변경 없음)
      await (prisma as any).reviewBonus.create({
        data: {
          userId,
          url: hasUrl ? url : null,
          urlHash,
          screenshotUrl: hasScreenshot ? screenshotUrl : null,
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
