import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/parent/children
 * 부모의 아이 목록 + 각 아이의 담당 치료사 정보
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const children = await prisma.child.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      therapistMappings: {
        include: {
          therapist: { select: { id: true, name: true } },
        },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    children: children.map((c) => ({
      id: c.id,
      name: c.name,
      therapist: c.therapistMappings[0]?.therapist ?? null,
    })),
  });
}
