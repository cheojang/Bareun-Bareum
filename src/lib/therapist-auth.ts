/**
 * 치료사/센터 공통 권한 헬퍼
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type TherapistSession = {
  userId: string;
  therapistId: string;
  centerId: string;
  role: string;
};

/** 치료사 세션 확인 — 없으면 null */
export async function getTherapistSession(): Promise<TherapistSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!["therapist", "center_admin"].includes(session.user.role ?? "")) return null;

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true, centerId: true },
  });
  if (!therapist) return null;

  return {
    userId: session.user.id,
    therapistId: therapist.id,
    centerId: therapist.centerId,
    role: session.user.role ?? "therapist",
  };
}

/** 치료사가 해당 아이를 담당하는지 확인 */
export async function canAccessChild(therapistId: string, childId: string) {
  const mapping = await prisma.therapistChild.findUnique({
    where: { therapistId_childId: { therapistId, childId } },
  });
  return !!mapping;
}
