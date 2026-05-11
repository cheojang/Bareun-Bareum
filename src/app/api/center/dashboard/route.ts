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

  // 1단계: 얕은 쿼리만 병렬 실행 (깊은 nested include 제거)
  const [center, therapists, centerChildren, homeworkTotal, homeworkDone] = await Promise.all([
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
      select: {
        enrolledAt: true,
        child: {
          select: {
            id: true,
            name: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.homework.count({ where: { therapist: { centerId: ts.centerId } } }),
    prisma.homework.count({ where: { therapist: { centerId: ts.centerId }, status: "done" } }),
  ]);

  // 2단계: child별 부가 정보를 일괄 쿼리 (N+1 회피)
  const childIds = centerChildren.map((cc) => cc.child.id);
  const [mappings, pendingByChild] = childIds.length === 0
    ? [[], []]
    : await Promise.all([
        prisma.therapistChild.findMany({
          where: { childId: { in: childIds } },
          select: { childId: true, therapist: { select: { name: true } } },
        }),
        prisma.homework.groupBy({
          by: ["childId"],
          where: { childId: { in: childIds }, status: "pending" },
          _count: { _all: true },
        }),
      ]);

  const firstTherapistByChild = new Map<string, string>();
  for (const m of mappings) {
    if (!firstTherapistByChild.has(m.childId)) firstTherapistByChild.set(m.childId, m.therapist.name);
  }
  const pendingMap = new Map<string, number>();
  for (const p of pendingByChild) pendingMap.set(p.childId, p._count._all);

  return NextResponse.json({
    center,
    stats: {
      therapistCount: therapists.length,
      childCount: centerChildren.length,
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
    children: centerChildren.map(({ child, enrolledAt }) => ({
      id: child.id,
      name: child.name,
      parentName: child.user.name,
      parentEmail: child.user.email,
      enrolledAt,
      therapistName: firstTherapistByChild.get(child.id) ?? null,
      pendingHomework: pendingMap.get(child.id) ?? 0,
    })),
  });
}
