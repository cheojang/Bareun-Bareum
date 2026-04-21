import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTherapistSession } from "@/lib/therapist-auth";

/**
 * GET /api/center/dashboard
 * 센터 어드민 대시보드 통계
 */
export async function GET() {
  const ts = await getTherapistSession();
  if (!ts) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const [center, therapists, children] = await Promise.all([
    prisma.center.findUnique({ where: { id: ts.centerId } }),
    prisma.therapist.findMany({
      where: { centerId: ts.centerId },
      include: {
        user: { select: { email: true } },
        _count: { select: { children: true, homeworks: true, notes: true } },
      },
    }),
    prisma.centerChild.findMany({
      where: { centerId: ts.centerId },
      include: {
        child: {
          include: {
            user: { select: { name: true, email: true } },
            therapistMappings: {
              include: { therapist: { select: { name: true } } },
            },
            homeworks: { where: { status: "pending" }, select: { id: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
  ]);

  const homeworkTotal = await prisma.homework.count({ where: { therapist: { centerId: ts.centerId } } });
  const homeworkDone = await prisma.homework.count({ where: { therapist: { centerId: ts.centerId }, status: "done" } });

  return NextResponse.json({
    center,
    stats: {
      therapistCount: therapists.length,
      childCount: children.length,
      homeworkTotal,
      homeworkDone,
      completionRate: homeworkTotal > 0 ? Math.round((homeworkDone / homeworkTotal) * 100) : 0,
    },
    therapists: therapists.map((t) => ({
      id: t.id,
      name: t.name,
      email: t.user.email,
      license: t.license,
      childCount: t._count.children,
      homeworkCount: t._count.homeworks,
      noteCount: t._count.notes,
    })),
    children: children.map(({ child, enrolledAt }) => ({
      id: child.id,
      name: child.name,
      parentName: child.user.name,
      parentEmail: child.user.email,
      enrolledAt,
      therapistName: child.therapistMappings[0]?.therapist.name ?? null,
      pendingHomework: child.homeworks.length,
    })),
  });
}
