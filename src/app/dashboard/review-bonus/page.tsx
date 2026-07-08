import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReviewBonusClient } from "./ReviewBonusClient";
import { approveDueForUser, MAX_APPROVED } from "@/lib/review-approval";

export const metadata = {
  title: "후기 인증 무료 연장 | 바른발음",
};

export default async function ReviewBonusPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.isGuest) redirect("/dashboard");

  const userId = session.user.id!;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let submissions: any[] = [];
  let bonusCount = 0;
  let pendingCount = 0;
  let canSubmit = true;
  let trialEndsAt: Date | null = null;
  let migrationNeeded = false;

  try {
    // 기한(2일) 지난 심사중 제출을 이 시점에 자동 승인 — 방문만 해도 즉시 반영
    try { await approveDueForUser(userId); } catch { /* 다음 기회에 재시도 */ }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = prisma as any;
    const [user, rawSubmissions] = await Promise.all([
      p.user.findUnique({
        where: { id: userId },
        select: { trialEndsAt: true, reviewBonusCount: true },
      }) as Promise<{ trialEndsAt: Date | null; reviewBonusCount: number } | null>,
      p.reviewBonus.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as Promise<any[]>,
    ]);

    bonusCount = user?.reviewBonusCount ?? 0;
    trialEndsAt = user?.trialEndsAt ?? null;
    submissions = rawSubmissions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingCount = submissions.filter((s: any) => s.status === "pending").length;

    // 신청 간격 제한 없음 — 승인+심사중 합쳐 4회 미만이면 제출 가능
    canSubmit = bonusCount + pendingCount < MAX_APPROVED;
  } catch {
    migrationNeeded = true;
  }

  return (
    <ReviewBonusClient
      initialSubmissions={submissions}
      initialBonusCount={bonusCount}
      initialPendingCount={pendingCount}
      initialCanSubmit={canSubmit}
      trialEndsAt={trialEndsAt ? trialEndsAt.toISOString() : null}
      migrationNeeded={migrationNeeded}
    />
  );
}
