import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { centerJoinLimiter } from "@/lib/rate-limit";

/**
 * POST /api/therapist/join
 * body: { inviteCode, name, license?, phone? }
 * 치료사 가입 — 센터 초대코드로 치료사 등록
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
  }

  // 초대코드 브루트포스 방어 — 사용자당 시간당 10회
  if (!centerJoinLimiter.allow(session.user.id)) {
    return NextResponse.json(
      { error: "시도가 너무 많아요. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  const { inviteCode, name, license, phone } = await request.json();
  if (!inviteCode?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "초대코드와 이름은 필수입니다" }, { status: 400 });
  }

  // 초대코드로 센터 찾기
  const center = await prisma.center.findUnique({
    where: { inviteCode: inviteCode.trim() },
  });
  if (!center) {
    return NextResponse.json({ error: "유효하지 않은 초대코드입니다" }, { status: 404 });
  }

  // 이미 치료사 프로필이 있는지 확인
  const existing = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "이미 치료사로 등록되어 있습니다" }, { status: 409 });
  }

  // 해당 센터의 첫 번째 치료사면 owner, 아니면 staff
  const therapistCount = await prisma.therapist.count({
    where: { centerId: center.id },
  });
  const centerRole: "owner" | "staff" = therapistCount === 0 ? "owner" : "staff";

  // 트랜잭션: User.role=therapist 고정, Therapist 생성(+ role)
  const therapist = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: { role: "therapist" },
    });
    return tx.therapist.create({
      data: {
        userId: session.user.id!,
        centerId: center.id,
        name: name.trim(),
        role: centerRole,
        license: license?.trim() || null,
        phone: phone?.trim() || null,
      },
    });
  });

  return NextResponse.json({
    therapist,
    role: centerRole,
    centerName: center.name,
    isOwner: centerRole === "owner",
  });
}
