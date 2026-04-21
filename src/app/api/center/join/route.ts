import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * POST /api/center/join
 * body: { childId, inviteCode }
 * 부모가 초대코드로 자녀를 센터에 등록
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { childId, inviteCode } = await request.json();
  if (!childId || !inviteCode?.trim()) {
    return NextResponse.json({ error: "childId, inviteCode 필수" }, { status: 400 });
  }

  // 내 아이인지 확인
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "접근 권한 없음" }, { status: 403 });
  }

  // 초대코드로 센터 찾기
  const center = await prisma.center.findUnique({
    where: { inviteCode: inviteCode.trim() },
  });
  if (!center) {
    return NextResponse.json({ error: "유효하지 않은 초대코드입니다" }, { status: 404 });
  }

  // 이미 등록된 경우 성공 처리
  await prisma.centerChild.upsert({
    where: { centerId_childId: { centerId: center.id, childId } },
    create: { centerId: center.id, childId },
    update: {},
  });

  return NextResponse.json({ success: true, centerName: center.name });
}

/**
 * DELETE /api/center/join
 * body: { childId, centerId }
 * 부모가 자녀를 센터에서 탈퇴
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { childId, centerId } = await request.json();

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "접근 권한 없음" }, { status: 403 });
  }

  await prisma.centerChild.deleteMany({
    where: { centerId, childId },
  });

  return NextResponse.json({ success: true });
}
