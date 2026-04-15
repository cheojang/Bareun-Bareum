import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

/**
 * GET /api/announcements/admin  (관리자 전용)
 * 발행/비발행 포함 전체 공지 조회 + 읽은 유저 수
 */
export async function GET() {
  try {
    const session = await auth();
    if (
      !session?.user?.email ||
      !ADMIN_EMAILS.includes(session.user.email)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { reads: true } } },
    });

    return NextResponse.json(
      announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        type: a.type,
        isPublished: a.isPublished,
        createdAt: a.createdAt.toISOString(),
        readCount: a._count.reads,
      }))
    );
  } catch (error) {
    console.error("[Announcements Admin GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
