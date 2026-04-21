import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTherapistSession } from "@/lib/therapist-auth";

/**
 * GET /api/therapist/children
 * 치료사의 담당 아이 목록 + 각자 취약 음소 요약
 */
export async function GET() {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const mappings = await prisma.therapistChild.findMany({
    where: { therapistId: ts.therapistId },
    include: {
      child: {
        include: {
          weakPhonemes: { orderBy: { errorRate: "desc" }, take: 3 },
          homeworks: {
            where: { status: "pending" },
            orderBy: { dueDate: "asc" },
            take: 1,
          },
          therapyNotes: {
            orderBy: { sessionDate: "desc" },
            take: 1,
          },
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  const children = mappings.map(({ child, assignedAt }) => ({
    id: child.id,
    name: child.name,
    birthDate: child.birthDate,
    assignedAt,
    parentName: child.user.name,
    parentEmail: child.user.email,
    weakPhonemes: child.weakPhonemes.map((w) => ({
      phoneme: w.phoneme,
      level: w.weaknessLevel,
      errorRate: Math.round(w.errorRate),
    })),
    pendingHomework: child.homeworks[0] ?? null,
    lastSession: child.therapyNotes[0]
      ? {
          date: child.therapyNotes[0].sessionDate,
          performance: child.therapyNotes[0].performance,
        }
      : null,
  }));

  return NextResponse.json({ children });
}

/**
 * POST /api/therapist/children
 * body: { childId } — 아이 담당 배정
 */
export async function POST(request: Request) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { childId } = await request.json();
  if (!childId) return NextResponse.json({ error: "childId 필수" }, { status: 400 });

  // 센터에 등록된 아이인지 확인
  const inCenter = await prisma.centerChild.findUnique({
    where: { centerId_childId: { centerId: ts.centerId, childId } },
  });
  if (!inCenter) {
    return NextResponse.json({ error: "센터에 등록되지 않은 아이입니다" }, { status: 400 });
  }

  await prisma.therapistChild.upsert({
    where: { therapistId_childId: { therapistId: ts.therapistId, childId } },
    create: { therapistId: ts.therapistId, childId },
    update: {},
  });

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/therapist/children
 * body: { childId } — 담당 해제
 */
export async function DELETE(request: Request) {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { childId } = await request.json();
  await prisma.therapistChild.deleteMany({
    where: { therapistId: ts.therapistId, childId },
  });

  return NextResponse.json({ success: true });
}
