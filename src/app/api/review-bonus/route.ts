import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse } from "@/lib/api-auth";
import {
  approveDueForUser,
  MAX_APPROVED,
  REVIEW_AUTO_APPROVE_DAYS,
} from "@/lib/review-approval";

/**
 * 후기 인증 혜택 API — 심사(pending) 흐름.
 *
 * 제출: 캡처본 이미지 필수 + URL 선택 → status "pending"으로 저장 (즉시 연장 없음)
 * 승인: 2일 후 자동(크론 + GET 시 lazy) 또는 관리자 수동. 승인 시점에 연장 적용.
 * 거절: 관리자만 — 사용자에게 완곡한 안내 팝업 (rejectSeenAt으로 1회 노출)
 */

const ALLOWED_CHANNELS = ["blog", "sns", "community", "playstore"] as const;
type Channel = (typeof ALLOWED_CHANNELS)[number];

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

    // 기한(2일) 지난 심사중 제출을 이 시점에 자동 승인 — 크론을 기다리지 않고 즉시 반영
    try {
      await approveDueForUser(userId);
    } catch { /* 승인 실패는 조회를 막지 않음 (다음 기회에 재시도) */ }

    const [user, submissions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        select: { reviewBonusCount: true, trialEndsAt: true } as any,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).reviewBonus.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bonusCount = ((user as any)?.reviewBonusCount ?? 0) as number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pendingCount = submissions.filter((s: any) => s.status === "pending").length;

    // 확인 안 한 거절 안내 (팝업용)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unseenRejects = submissions.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.status === "rejected" && !s.rejectSeenAt && s.rejectReason,
    );

    // canSubmit: 승인+심사중 합쳐 4회 미만 (신청 간격 제한 없음 — 텀이 짧아도 가능)
    const canSubmit = bonusCount + pendingCount < MAX_APPROVED;

    return NextResponse.json({
      submissions,
      bonusCount,
      pendingCount,
      canSubmit,
      unseenRejects,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      trialEndsAt: (user as any)?.trialEndsAt ?? null,
    });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

// ── POST /api/review-bonus — 제출 (캡처본 필수, 심사중으로 저장) ────────────────

interface SubmitItem {
  screenshotUrl: string;
  url: string | null;
  channel: Channel;
}

function parseItem(raw: unknown): SubmitItem | null {
  if (!raw || typeof raw !== "object") return null;
  const { url, screenshotUrl, channel } = raw as Record<string, unknown>;
  // 캡처본 이미지 필수
  if (typeof screenshotUrl !== "string" || !screenshotUrl.startsWith("http")) return null;
  if (!ALLOWED_CHANNELS.includes(channel as Channel)) return null;
  const hasUrl = typeof url === "string" && url.startsWith("http");
  return {
    screenshotUrl,
    url: hasUrl ? (url as string) : null,
    channel: channel as Channel,
  };
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireMemberSession();
    const body = await request.json().catch(() => ({}));

    // 단일/일괄 공통 처리 — 단일 제출도 항목 1개짜리 일괄로 취급
    const rawItems: unknown[] = Array.isArray(body?.items) ? body.items : [body];
    const items = rawItems.map(parseItem).filter(Boolean) as SubmitItem[];

    if (items.length === 0) {
      // 원인별 명확한 에러 (캡처본 누락이 가장 흔한 실수)
      const first = rawItems[0] as Record<string, unknown> | undefined;
      const hasShot =
        typeof first?.screenshotUrl === "string" &&
        (first.screenshotUrl as string).startsWith("http");
      return NextResponse.json(
        {
          error: hasShot
            ? "채널을 선택해주세요 (블로그, SNS, 커뮤니티, 플레이스토어 중 하나)"
            : "후기 캡처본 이미지를 첨부해주세요 (필수)",
        },
        { status: 400 },
      );
    }

    // 현재 상태 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, pendingCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        select: { reviewBonusCount: true } as any,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).reviewBonus.count({ where: { userId, status: "pending" } }),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const approvedCount = ((user as any)?.reviewBonusCount ?? 0) as number;

    const room = MAX_APPROVED - approvedCount - pendingCount;
    if (room <= 0) {
      return NextResponse.json(
        { error: "이미 최대 횟수만큼 제출하셨어요 (심사중 포함 최대 4회)" },
        { status: 400 },
      );
    }

    const toProcess = items.slice(0, room);
    let created = 0;
    let duplicated = 0;

    for (const item of toProcess) {
      const urlHash = item.url
        ? createHash("sha256").update(item.url.toLowerCase().trim()).digest("hex")
        : null;

      if (urlHash) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existing = await (prisma as any).reviewBonus.findUnique({ where: { urlHash } });
        if (existing) {
          duplicated++;
          continue;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).reviewBonus.create({
        data: {
          userId,
          url: item.url,
          urlHash,
          screenshotUrl: item.screenshotUrl,
          channel: item.channel,
          status: "pending",
        },
      });
      created++;
    }

    if (created === 0) {
      return NextResponse.json(
        { error: "이미 제출한 URL이에요. 다른 후기를 제출해주세요." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      status: "pending",
      created,
      duplicated,
      message: `제출 완료! 심사는 약 ${REVIEW_AUTO_APPROVE_DAYS}일 정도 걸려요. 승인되면 무료 이용 기간이 자동으로 연장돼요 🕐`,
    });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

// ── PATCH /api/review-bonus — 거절 안내 팝업 확인 처리 ─────────────────────────

export async function PATCH() {
  try {
    const userId = await requireMemberSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).reviewBonus.updateMany({
      where: { userId, status: "rejected", rejectSeenAt: null },
      data: { rejectSeenAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
