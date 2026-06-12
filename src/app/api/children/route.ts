import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const children = await prisma.child.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(children);
}

/** 계정당 등록 가능한 자녀 수 상한 (자원 고갈 방지) */
const MAX_CHILDREN_PER_USER = 5;
/** 자녀 이름 최대 길이 */
const MAX_NAME_LENGTH = 50;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // 게스트는 자녀 등록 불가 (체험 모드는 DB 저장 없이 동작)
  if (session.user.isGuest) {
    return NextResponse.json({ error: "게스트는 자녀를 등록할 수 없어요. 회원가입 후 이용해주세요." }, { status: 403 });
  }

  const { name, birthDate, gender } = await req.json();
  if (!name?.trim() || name.trim().length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "이름을 1~50자로 입력해주세요" }, { status: 400 });
  }

  const childCount = await prisma.child.count({
    where: { userId: session.user.id },
  });
  if (childCount >= MAX_CHILDREN_PER_USER) {
    return NextResponse.json(
      { error: `자녀는 최대 ${MAX_CHILDREN_PER_USER}명까지 등록할 수 있어요` },
      { status: 400 }
    );
  }

  const child = await prisma.child.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      birthDate: birthDate ? new Date(birthDate) : null,
      gender: gender === "남아" || gender === "여아" ? gender : null,
    },
  });

  return NextResponse.json(child, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, birthDate, gender } = await req.json();
  if (name !== undefined && (!name?.trim() || name.trim().length > MAX_NAME_LENGTH)) {
    return NextResponse.json({ error: "이름을 1~50자로 입력해주세요" }, { status: 400 });
  }

  const child = await prisma.child.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.child.update({
    where: { id },
    data: {
      name,
      birthDate: birthDate ? new Date(birthDate) : null,
      ...(gender !== undefined && {
        gender: gender === "남아" || gender === "여아" ? gender : null,
      }),
    },
  });

  return NextResponse.json(updated);
}
