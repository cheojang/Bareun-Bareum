import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ReviewBonus"
        ALTER COLUMN "url" DROP NOT NULL,
        ALTER COLUMN "urlHash" DROP NOT NULL,
        ADD COLUMN IF NOT EXISTS "screenshotUrl" TEXT;
    `);
    return NextResponse.json({ ok: true, message: "ReviewBonus 스키마 업데이트 완료!" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
