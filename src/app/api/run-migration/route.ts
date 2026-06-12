import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ⚠️ 일회용 마이그레이션 — prisma db push 대체 (모바일 환경). 실행 후 즉시 삭제.
// 토큰으로 보호. 멱등(IF NOT EXISTS / 중복 에러 무시)하게 작성.
const MIGRATION_TOKEN = "90a6440170088fa1c26adfd6d6c4e9e4";

const STATEMENTS: { label: string; sql: string; ignoreDup?: boolean }[] = [
  {
    label: "PushSubscription 테이블 생성",
    sql: `CREATE TABLE IF NOT EXISTS "PushSubscription" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "endpoint" TEXT NOT NULL,
      "p256dh" TEXT NOT NULL,
      "auth" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
    );`,
  },
  {
    label: "PushSubscription.endpoint 유니크 인덱스",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");`,
  },
  {
    label: "PushSubscription.userId 인덱스",
    sql: `CREATE INDEX IF NOT EXISTS "PushSubscription_userId_idx" ON "PushSubscription"("userId");`,
  },
  {
    label: "PushSubscription → User 외래키",
    sql: `ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    ignoreDup: true, // 제약은 IF NOT EXISTS 미지원 → 중복 에러 무시
  },
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== MIGRATION_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results: { label: string; ok: boolean; note?: string }[] = [];
  for (const stmt of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(stmt.sql);
      results.push({ label: stmt.label, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isDup = /already exists|duplicate/i.test(msg);
      if (stmt.ignoreDup && isDup) {
        results.push({ label: stmt.label, ok: true, note: "이미 존재 — 건너뜀" });
      } else {
        results.push({ label: stmt.label, ok: false, note: msg });
      }
    }
  }

  return NextResponse.json({ done: true, results });
}
