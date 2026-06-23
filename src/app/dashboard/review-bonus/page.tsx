import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReviewBonusClient } from "./ReviewBonusClient";

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
  let canSubmit = true;
  let trialEndsAt: Date | null = null;
  let migrationNeeded = false;

  try {
    const [user, rawSubmissions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        // reviewBonusCount는 마이그레이션 후 존재
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        select: { trialEndsAt: true, reviewBonusCount: true } as any,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).reviewBonus.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bonusCount = (user as any)?.reviewBonusCount ?? 0;
    trialEndsAt = user?.trialEndsAt ?? null;
    submissions = rawSubmissions;

    const lastApproved = submissions.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.status === "approved",
    );
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const canSubmitByTime =
      !lastApproved ||
      new Date(lastApproved.createdAt).getTime() < sevenDaysAgo.getTime();
    canSubmit = bonusCount < 10 && canSubmitByTime;
  } catch {
    migrationNeeded = true;
  }

  return (
    <ReviewBonusClient
      initialSubmissions={submissions}
      initialBonusCount={bonusCount}
      initialCanSubmit={canSubmit}
      trialEndsAt={trialEndsAt ? trialEndsAt.toISOString() : null}
      migrationNeeded={migrationNeeded}
    />
  );
}
