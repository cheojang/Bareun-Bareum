import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/migrate-review-bonus?secret=<MIGRATE_SECRET>
 * 일회용 마이그레이션 — ReviewBonus 테이블 생성 및 reviewBonusCount 컬럼 추가.
 * 실행 후 이 파일을 삭제하세요.
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expected = process.env.MIGRATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "reviewBonusCount" INTEGER NOT NULL DEFAULT 0;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ReviewBonus" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "urlHash" TEXT NOT NULL,
        "channel" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'approved',
        "charCount" INTEGER,
        "rejectReason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "approvedAt" TIMESTAMP(3),
        CONSTRAINT "ReviewBonus_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ReviewBonus_urlHash_key" ON "ReviewBonus"("urlHash");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ReviewBonus_userId_idx" ON "ReviewBonus"("userId");
    `);

    // 외래 키 제약은 이미 존재하면 에러가 나므로 별도 처리
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "ReviewBonus" ADD CONSTRAINT "ReviewBonus_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch {
      // 이미 존재하면 무시
    }

    return NextResponse.json({
      ok: true,
      message:
        "마이그레이션 완료! reviewBonusCount 컬럼 추가 및 ReviewBonus 테이블 생성됨. 이 엔드포인트 파일을 삭제하세요.",
    });
  } catch (err) {
    console.error("[migrate-review-bonus]", err);
    return NextResponse.json(
      { error: "마이그레이션 실패", detail: String(err) },
      { status: 500 },
    );
  }
}
