import { prisma } from "@/lib/prisma";

export const FREE_AI_MONTHLY_LIMIT = 10;
export const GUEST_AI_MONTHLY_LIMIT = 2;
export const GUEST_COOKIE_NAME = "ai_guest_usage";

export function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** 이번 달 실제 Gemini 호출 횟수 (캐시 히트 제외 — GeminiFeedback 생성 기준) */
export async function countMonthlyGeminiUsage(userId: string): Promise<number> {
  return prisma.geminiFeedback.count({
    where: {
      createdAt: { gte: getMonthStart() },
      errorRecord: { child: { userId } },
    },
  });
}

export async function isUserPremium(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true, plan: true },
  });
  return sub?.status === "active" && sub?.plan === "premium";
}

/** 게스트 쿠키에서 이번 달 사용 횟수 파싱 */
export function parseGuestCookie(cookieValue: string | undefined): number {
  if (!cookieValue) return 0;
  try {
    const { month, count } = JSON.parse(cookieValue);
    return month === getCurrentYearMonth() ? (Number(count) || 0) : 0;
  } catch {
    return 0;
  }
}

/** 게스트 쿠키 직렬화 */
export function makeGuestCookieValue(count: number): string {
  return JSON.stringify({ month: getCurrentYearMonth(), count });
}
