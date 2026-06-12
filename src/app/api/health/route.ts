import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 상시 헬스체크 — DB 연결 상태 확인용 (간헐 오류 발생 시 즉시 진단).
// 민감 정보 없음. /api/health 로 접속.
export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      db: "connected",
      latencyMs: Date.now() - startedAt,
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME ?? null,
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? null,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        db: "error",
        latencyMs: Date.now() - startedAt,
        message: e instanceof Error ? e.message : String(e),
      },
      { status: 503 },
    );
  }
}
