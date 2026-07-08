import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { approveSubmissions, rejectSubmission } from "@/lib/review-approval";

export const dynamic = "force-dynamic";

/**
 * 관리자 후기 심사 API.
 * GET  — 제출 목록 (제출자 정보 포함, 심사중 우선)
 * POST — { id, action: "approve" | "reject" }
 *   approve: 즉시 승인 + 체험 연장 (2일 자동 승인을 기다리지 않음)
 *   reject : 거절 — 사용자에게 완곡한 안내 팝업 (연장 없음)
 */

async function requireAdmin() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submissions: any[] = await (prisma as any).reviewBonus.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { email: true, name: true, reviewBonusCount: true } },
    },
  });

  // 심사중을 맨 위로
  submissions.sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({ submissions });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const id: unknown = body?.id;
  const action: unknown = body?.action;

  if (typeof id !== "string" || (action !== "approve" && action !== "reject")) {
    return NextResponse.json(
      { error: "id와 action(approve|reject)이 필요해요" },
      { status: 400 },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submission: any = await (prisma as any).reviewBonus.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true },
  });
  if (!submission) {
    return NextResponse.json({ error: "제출을 찾을 수 없어요" }, { status: 404 });
  }
  if (submission.status !== "pending") {
    return NextResponse.json(
      { error: `이미 처리된 제출이에요 (${submission.status})` },
      { status: 409 },
    );
  }

  if (action === "approve") {
    const result = await approveSubmissions(submission.userId, [submission.id]);
    return NextResponse.json({ ok: true, ...result });
  }

  const rejected = await rejectSubmission(submission.id);
  return NextResponse.json({ ok: rejected });
}
