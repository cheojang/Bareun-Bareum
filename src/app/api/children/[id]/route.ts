import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/children/[id] — 아이 프로필 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // 본인 소유 여부 확인 (다른 사람의 아이를 지우지 못하게)
  const child = await prisma.child.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!child) {
    return NextResponse.json({ error: "찾을 수 없습니다" }, { status: 404 });
  }

  // 아이 삭제 (schema에 cascade 설정되어 있으면 관련 데이터도 함께 삭제됨)
  await prisma.child.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
