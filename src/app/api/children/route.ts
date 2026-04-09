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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, birthDate } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "이름을 입력해주세요" }, { status: 400 });
  }

  const child = await prisma.child.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      birthDate: birthDate ? new Date(birthDate) : null,
    },
  });

  return NextResponse.json(child, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, birthDate } = await req.json();

  const child = await prisma.child.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.child.update({
    where: { id },
    data: { name, birthDate: birthDate ? new Date(birthDate) : null },
  });

  return NextResponse.json(updated);
}
