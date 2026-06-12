import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse } from "@/lib/api-auth";

/** 게스트 제외 로그인 사용자 ID (게스트는 User 행이 없어 FK 불가) */
async function requireMemberUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError(401, "Unauthorized");
  if (session.user.isGuest) throw new ApiError(403, "회원만 알림을 설정할 수 있어요");
  return session.user.id;
}

/**
 * POST /api/push/subscribe
 * 브라우저 PushSubscription 저장 (기기·브라우저당 1개, endpoint 기준 upsert)
 * body: { endpoint, keys: { p256dh, auth } }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireMemberUserId();
    const body = await request.json();
    const endpoint: unknown = body?.endpoint;
    const p256dh: unknown = body?.keys?.p256dh;
    const authKey: unknown = body?.keys?.auth;

    if (typeof endpoint !== "string" || typeof p256dh !== "string" || typeof authKey !== "string") {
      return NextResponse.json({ error: "endpoint, keys.p256dh, keys.auth 필수" }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh, auth: authKey },
      // 같은 기기를 다른 계정이 다시 구독하면 소유자 이전
      update: { userId, p256dh, auth: authKey },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

/**
 * DELETE /api/push/subscribe
 * 구독 해제 — body: { endpoint }
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireMemberUserId();
    const body = await request.json().catch(() => ({}));
    const endpoint: unknown = body?.endpoint;

    if (typeof endpoint !== "string") {
      return NextResponse.json({ error: "endpoint 필수" }, { status: 400 });
    }

    // 본인 구독만 삭제 (deleteMany — 없어도 에러 없이 통과)
    await prisma.pushSubscription.deleteMany({ where: { endpoint, userId } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
