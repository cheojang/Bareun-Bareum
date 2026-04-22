import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

/**
 * GET /api/announcements
 * 발행된 공지사항 목록 조회 (현재 유저의 읽음 여부 포함)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const announcements = await prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        reads: {
          where: { userId: session.user.id },
          select: { readAt: true },
        },
      },
    });

    return NextResponse.json(
      announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        type: a.type,
        createdAt: a.createdAt.toISOString(),
        isRead: a.reads.length > 0,
      }))
    );
  } catch (error) {
    console.error("[Announcements GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/announcements  (관리자 전용)
 * 새 공지사항 작성
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, content, type } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "title과 content는 필수입니다" },
        { status: 400 }
      );
    }

    const validTypes = ["notice", "update", "event"];
    const safeType = validTypes.includes(type) ? type : "notice";

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type: safeType,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("[Announcements POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
