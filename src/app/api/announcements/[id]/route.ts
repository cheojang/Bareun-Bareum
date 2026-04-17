import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/announcements/[id]  (관리자 전용)
 * 공지사항 수정 (제목/내용/유형/발행 여부)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (
      !session?.user?.email ||
      !ADMIN_EMAILS.includes(session.user.email)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, content, type, isPublished } = await request.json();
    const validTypes = ["notice", "update", "event"];

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(content !== undefined && { content: String(content).trim() }),
        ...(type !== undefined && validTypes.includes(type) && { type }),
        ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Announcement PATCH Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/announcements/[id]  (관리자 전용)
 * 공지사항 삭제
 */
export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (
      !session?.user?.email ||
      !ADMIN_EMAILS.includes(session.user.email)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Announcement DELETE Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
