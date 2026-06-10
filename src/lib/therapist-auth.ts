/**
 * 치료사/센터 공통 권한 헬퍼
 *
 * 역할 계층:
 *  - User.role = "parent" | "therapist"
 *  - Therapist.role = "owner" (상담소장) | "staff" (일반 상담사)
 *
 * Owner는 센터 설정·상담사 관리 권한이 있고, Staff는 담당 아이 범위 내에서만 작업.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CenterRole = "owner" | "staff";

export type TherapistSession = {
  userId: string;
  therapistId: string;
  centerId: string;
  role: CenterRole;
};

/** 치료사 세션 확인 — 없으면 null */
export async function getTherapistSession(): Promise<TherapistSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  // role은 JWT에 캐시되어 가입 직후엔 구식일 수 있음 — Therapist 테이블 조회가 권위 있는 판정
  if (session.user.isGuest) return null;

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true, centerId: true, role: true },
  });
  if (!therapist) return null;

  return {
    userId: session.user.id,
    therapistId: therapist.id,
    centerId: therapist.centerId,
    role: (therapist.role === "owner" ? "owner" : "staff") as CenterRole,
  };
}

/** owner 세션만 허용 — 아니면 null */
export async function getOwnerSession(): Promise<TherapistSession | null> {
  const s = await getTherapistSession();
  return s && s.role === "owner" ? s : null;
}

export function isOwner(s: TherapistSession | null): boolean {
  return !!s && s.role === "owner";
}

/** 치료사가 해당 아이를 담당하는지 확인 */
export async function canAccessChild(therapistId: string, childId: string) {
  const mapping = await prisma.therapistChild.findUnique({
    where: { therapistId_childId: { therapistId, childId } },
  });
  return !!mapping;
}

/** 센터 전체 멤버십 기준으로 아이 접근 권한 체크 (owner는 센터 소속 아이 전체 접근) */
export async function canCenterAccessChild(centerId: string, childId: string) {
  const mapping = await prisma.centerChild.findUnique({
    where: { centerId_childId: { centerId, childId } },
  });
  return !!mapping;
}
