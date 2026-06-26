import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/migrate-missing-tables?secret=<MIGRATE_SECRET>
 * 일회용 마이그레이션 — 누락된 테이블/컬럼 일괄 생성.
 * 실행 후 이 파일을 삭제하세요.
 *
 * 대상:
 *  - Announcement 테이블
 *  - AnnouncementRead 테이블
 *  - SavedWord.targetPhoneme 컬럼
 *  - SavedWord.difficulty 컬럼
 *  - ReviewSchedule.isLearned 컬럼
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expected = process.env.MIGRATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, string> = {};

  const run = async (label: string, sql: string) => {
    try {
      await prisma.$executeRawUnsafe(sql);
      results[label] = "ok";
    } catch (e) {
      results[label] = `error: ${String(e)}`;
    }
  };

  // ── Announcement 테이블 ──────────────────────────────────────────────────
  await run("Announcement table", `
    CREATE TABLE IF NOT EXISTS "Announcement" (
      "id"          TEXT NOT NULL,
      "title"       TEXT NOT NULL,
      "content"     TEXT NOT NULL,
      "type"        TEXT NOT NULL DEFAULT 'notice',
      "isPublished" BOOLEAN NOT NULL DEFAULT true,
      "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
    );
  `);
  await run("Announcement index", `
    CREATE INDEX IF NOT EXISTS "Announcement_isPublished_createdAt_idx"
      ON "Announcement"("isPublished", "createdAt");
  `);

  // ── AnnouncementRead 테이블 ──────────────────────────────────────────────
  await run("AnnouncementRead table", `
    CREATE TABLE IF NOT EXISTS "AnnouncementRead" (
      "id"             TEXT NOT NULL,
      "announcementId" TEXT NOT NULL,
      "userId"         TEXT NOT NULL,
      "readAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("id")
    );
  `);
  await run("AnnouncementRead unique", `
    CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementRead_announcementId_userId_key"
      ON "AnnouncementRead"("announcementId", "userId");
  `);
  await run("AnnouncementRead userId index", `
    CREATE INDEX IF NOT EXISTS "AnnouncementRead_userId_idx"
      ON "AnnouncementRead"("userId");
  `);
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_announcementId_fkey"
        FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    results["AnnouncementRead fk"] = "ok";
  } catch {
    results["AnnouncementRead fk"] = "skipped (already exists)";
  }

  // ── SavedWord 신규 컬럼 ──────────────────────────────────────────────────
  await run("SavedWord.targetPhoneme", `
    ALTER TABLE "SavedWord" ADD COLUMN IF NOT EXISTS "targetPhoneme" TEXT NOT NULL DEFAULT '';
  `);
  await run("SavedWord.difficulty", `
    ALTER TABLE "SavedWord" ADD COLUMN IF NOT EXISTS "difficulty" TEXT NOT NULL DEFAULT 'medium';
  `);

  // ── ReviewSchedule 신규 컬럼 ────────────────────────────────────────────
  await run("ReviewSchedule.isLearned", `
    ALTER TABLE "ReviewSchedule" ADD COLUMN IF NOT EXISTS "isLearned" BOOLEAN NOT NULL DEFAULT false;
  `);

  const hasError = Object.values(results).some((v) => v.startsWith("error"));

  return NextResponse.json({
    ok: !hasError,
    results,
    message: hasError
      ? "일부 실패. results 확인 후 재시도 또는 수동 처리하세요."
      : "마이그레이션 완료! 이 엔드포인트 파일을 삭제하세요.",
  });
}
