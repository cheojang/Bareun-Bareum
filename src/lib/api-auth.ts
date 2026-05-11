import { NextResponse } from "next/server";
import { auth } from "./auth";
import { prisma } from "./prisma";

/**
 * API 라우트 인증/소유권 헬퍼 — 같은 패턴이 30곳 이상 반복되어 통합.
 *
 * 사용법:
 *   try {
 *     const userId = await requireUserId();
 *     const child = await requireChildOwner(childId, userId);
 *     // ... 로직
 *   } catch (e) { return apiErrorResponse(e); }
 */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** 로그인된 사용자 ID를 보장. 없으면 401 발생 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError(401, "Unauthorized");
  return session.user.id;
}

/**
 * childId가 해당 부모(userId) 소유인지 검증.
 * - childId 없거나 빈 문자열 → 400
 * - 존재하지 않거나 다른 부모 소유 → 403
 */
export async function requireChildOwner(
  childId: string | null | undefined,
  userId: string,
) {
  if (!childId) throw new ApiError(400, "childId 필수");
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.userId !== userId) {
    throw new ApiError(403, "권한 없음");
  }
  return child;
}

/** 예외를 적절한 NextResponse로 변환 */
export function apiErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[api]", err);
  return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
}
