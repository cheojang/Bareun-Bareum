import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export const FREE_AI_MONTHLY_LIMIT = 10;
export const GUEST_AI_MONTHLY_LIMIT = 5;
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

/**
 * 게스트 식별용 IP 해시 — 원본 IP는 저장하지 않음 (프라이버시).
 * AUTH_SECRET을 솔트로 사용해 동일 IP가 서로 다른 배포에서 다른 해시를 갖도록 함.
 */
export function hashGuestIp(ip: string): string {
  const salt = process.env.AUTH_SECRET ?? "fallback-salt";
  return createHash("sha256").update(`${salt}::${ip}`).digest("hex").slice(0, 32);
}

/**
 * NextRequest에서 클라이언트 IP 추출.
 * Vercel/Cloudflare 프록시 헤더 우선, fallback으로 unknown.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/** 서버측 게스트 사용량 조회 (DB 기반, 쿠키 우회 차단) */
export async function getGuestMonthlyUsage(ipHash: string): Promise<number> {
  const row = await prisma.guestUsage.findUnique({
    where: { ipHash_month: { ipHash, month: getCurrentYearMonth() } },
    select: { count: true },
  });
  return row?.count ?? 0;
}

/** 서버측 게스트 사용량 +1 (DB 기반, 원자적 upsert) */
export async function incrementGuestUsage(ipHash: string): Promise<number> {
  const month = getCurrentYearMonth();
  const row = await prisma.guestUsage.upsert({
    where: { ipHash_month: { ipHash, month } },
    create: { ipHash, month, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });
  return row.count;
}
