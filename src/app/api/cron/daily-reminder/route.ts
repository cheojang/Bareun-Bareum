import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { getKSTStartOfDay } from "@/lib/kst-utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/daily-reminder — Vercel Cron이 매일 19:00 KST(10:00 UTC)에 호출.
 *
 * 푸시 구독자 중 "오늘 아직 연습 안 한" 사용자에게 루틴 리마인더 발송.
 * 만료된 구독(404/410)은 자동 정리.
 */
export async function GET(req: NextRequest) {
  // Vercel Cron은 CRON_SECRET 환경변수가 있으면 Bearer 토큰으로 보내줌
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: "VAPID 키 미설정" }, { status: 500 });
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:cheojang@gmail.com",
    publicKey,
    privateKey
  );

  const [subscriptions, practicedToday] = await Promise.all([
    prisma.pushSubscription.findMany({
      include: {
        user: {
          select: {
            children: {
              orderBy: { createdAt: "asc" },
              take: 1,
              select: { name: true },
            },
          },
        },
      },
    }),
    // 오늘(KST) 이미 연습한 사용자는 리마인더 불필요
    prisma.practiceSession.findMany({
      where: { startedAt: { gte: getKSTStartOfDay() } },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  const practicedUserIds = new Set(practicedToday.map((p) => p.userId));
  const targets = subscriptions.filter((s) => !practicedUserIds.has(s.userId));

  let sent = 0;
  let cleaned = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    targets.map(async (sub) => {
      const childName = sub.user.children[0]?.name;
      const payload = JSON.stringify({
        title: childName ? `${childName}의 발음 루틴 시간이에요 🌞` : "오늘의 발음 루틴 시간이에요 🌞",
        body: "딱 5분이면 충분해요. 오늘의 루틴을 시작해볼까요?",
        url: "/dashboard/routine",
        tag: "daily-reminder",
      });
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          // 브라우저에서 구독이 만료/해제됨 — DB에서 정리
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          cleaned++;
        } else {
          errors.push(`${status ?? "?"}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    })
  );

  return NextResponse.json({
    ok: true,
    subscriptions: subscriptions.length,
    skippedPracticed: subscriptions.length - targets.length,
    sent,
    cleaned,
    errors: errors.slice(0, 5),
  });
}
