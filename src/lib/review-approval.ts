import { prisma } from "@/lib/prisma";

/**
 * 후기 인증 심사 로직 (공용).
 *
 * 제출 → status "pending"(심사중)으로 저장되고, 여기서만 승인·연장이 일어난다.
 * - 자동 승인: 제출 후 2일이 지나면 승인 (크론 + 페이지 접근 시 lazy 실행)
 * - 관리자 승인: 즉시 승인
 * - 관리자 거절: 출처 불분명 안내와 함께 거절 (연장 없음)
 *
 * 보상 곡선: 누적 승인 1회=0 · 2회=1 · 3회=2 · 4회=3개월 (첫 1개월만 인증 2번 필요)
 */

export const REVIEW_AUTO_APPROVE_DAYS = 2;
export const MAX_APPROVED = 4;
export const TOTAL_MONTHS: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 };

/** 관리자 거절 시 사용자에게 보여줄 완곡한 안내 문구 */
export const REJECT_MESSAGE =
  "소중한 후기 감사합니다. 다만 제출해주신 자료만으로는 출처 확인이 어려워 이번에는 승인해 드리지 못했어요. 후기 URL을 함께 첨부해 다시 제출해주시면 빠르게 확인해 드릴게요 🙏";

/**
 * 특정 사용자의 승인 처리 — 지정된 pending 제출들을 승인하고 체험 기간을 연장한다.
 * @param submissionIds 승인할 제출 id 목록 (해당 사용자의 pending인 것만 처리됨)
 * @returns 승인된 개수와 연장 개월 수
 */
export async function approveSubmissions(
  userId: string,
  submissionIds: string[],
): Promise<{ approved: number; extensionMonths: number }> {
  if (submissionIds.length === 0) return { approved: 0, extensionMonths: 0 };

  const now = new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = await (prisma.user as any).findUnique({
    where: { id: userId },
    select: { trialEndsAt: true, reviewBonusCount: true },
  });
  if (!user) return { approved: 0, extensionMonths: 0 };

  const currentCount = (user.reviewBonusCount ?? 0) as number;
  if (currentCount >= MAX_APPROVED) return { approved: 0, extensionMonths: 0 };

  // 상한(4회)까지만 승인
  const room = MAX_APPROVED - currentCount;
  const ids = submissionIds.slice(0, room);

  // 승인 대상 갱신 (pending인 것만) — updateMany가 실제 처리 건수를 알려줌
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (prisma as any).reviewBonus.updateMany({
    where: { id: { in: ids }, userId, status: "pending" },
    data: { status: "approved", approvedAt: now },
  });
  const approved = updated.count as number;
  if (approved === 0) return { approved: 0, extensionMonths: 0 };

  const finalCount = Math.min(currentCount + approved, MAX_APPROVED);
  const extensionMonths =
    (TOTAL_MONTHS[finalCount] ?? 3) - (TOTAL_MONTHS[currentCount] ?? 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = { reviewBonusCount: finalCount };
  if (extensionMonths > 0) {
    const currentTrial = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const base = currentTrial && currentTrial.getTime() > now.getTime() ? currentTrial : now;
    const newTrialEndsAt = new Date(base);
    newTrialEndsAt.setMonth(newTrialEndsAt.getMonth() + extensionMonths);
    updateData.trialEndsAt = newTrialEndsAt;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma.user as any).update({ where: { id: userId }, data: updateData });

  return { approved, extensionMonths };
}

/** 특정 사용자의 "기한 도래(2일 경과)" pending 제출을 자동 승인 — 페이지 접근 시 lazy 실행용 */
export async function approveDueForUser(userId: string): Promise<{ approved: number; extensionMonths: number }> {
  const due = new Date(Date.now() - REVIEW_AUTO_APPROVE_DAYS * 24 * 60 * 60 * 1000);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendings: any[] = await (prisma as any).reviewBonus.findMany({
    where: { userId, status: "pending", createdAt: { lte: due } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return approveSubmissions(userId, pendings.map((p) => p.id));
}

/** 전체 사용자의 기한 도래 pending 자동 승인 — 크론용 */
export async function approveDueAll(): Promise<{ users: number; approved: number }> {
  const due = new Date(Date.now() - REVIEW_AUTO_APPROVE_DAYS * 24 * 60 * 60 * 1000);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendings: any[] = await (prisma as any).reviewBonus.findMany({
    where: { status: "pending", createdAt: { lte: due } },
    orderBy: { createdAt: "asc" },
    select: { id: true, userId: true },
  });

  const byUser = new Map<string, string[]>();
  for (const p of pendings) {
    if (!byUser.has(p.userId)) byUser.set(p.userId, []);
    byUser.get(p.userId)!.push(p.id);
  }

  let approved = 0;
  for (const [userId, ids] of byUser) {
    const r = await approveSubmissions(userId, ids);
    approved += r.approved;
  }
  return { users: byUser.size, approved };
}

/** 관리자 거절 — pending 상태일 때만. 완곡한 안내 문구와 함께 기록 */
export async function rejectSubmission(id: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (prisma as any).reviewBonus.updateMany({
    where: { id, status: "pending" },
    data: { status: "rejected", rejectReason: REJECT_MESSAGE },
  });
  return updated.count > 0;
}
