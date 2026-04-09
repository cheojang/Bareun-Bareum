import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (childId) where.childId = childId;

  const sessions = await prisma.practiceSession.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: limit,
    include: {
      child: { select: { name: true } },
      _count: { select: { wordRecords: true } },
    },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { childId } = await req.json();
  if (!childId) {
    return NextResponse.json({ error: "childId is required" }, { status: 400 });
  }

  // Verify ownership
  const child = await prisma.child.findFirst({
    where: { id: childId, userId: session.user.id },
  });
  if (!child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  const practiceSession = await prisma.practiceSession.create({
    data: { userId: session.user.id, childId },
  });

  return NextResponse.json(practiceSession, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, endedAt, durationMin } = await req.json();

  const practiceSession = await prisma.practiceSession.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!practiceSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.practiceSession.update({
    where: { id },
    data: {
      endedAt: endedAt ? new Date(endedAt) : new Date(),
      durationMin,
    },
  });

  // Update child stats
  if (durationMin) {
    await prisma.child.update({
      where: { id: practiceSession.childId },
      data: { totalMinutes: { increment: durationMin } },
    });
  }

  return NextResponse.json(updated);
}
