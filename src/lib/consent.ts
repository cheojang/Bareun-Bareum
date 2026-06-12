import { prisma } from "./prisma";

/**
 * 약관·개인정보 동의 기록 헬퍼.
 *
 * UserConsent 테이블은 `npx prisma db push` 로 생성됩니다.
 * 테이블이 아직 없는 전환기에도 앱이 깨지지 않도록
 * 조회 실패 시 "동의함"으로 간주(차단 안 함)하고, 기록 실패는 경고만 남깁니다.
 */

/** 동의 기록이 있는지 확인. 게스트/조회 실패 시 true(차단 안 함). */
export async function hasConsent(userId: string): Promise<boolean> {
  if (userId.startsWith("guest:")) return true;
  try {
    const consent = await prisma.userConsent.findUnique({
      where: { userId },
      select: { id: true },
    });
    return consent !== null;
  } catch (e) {
    // 테이블 미생성(P2021) 등 — 동의 게이트로 앱 전체를 막지 않음
    console.warn("[consent] 조회 실패 (테이블 미생성?):", e instanceof Error ? e.message : e);
    return true;
  }
}

/** 동의 일시를 기록(upsert). 실패해도 throw하지 않음. */
export async function recordConsent(userId: string): Promise<boolean> {
  const now = new Date();
  try {
    await prisma.userConsent.upsert({
      where: { userId },
      create: { userId, termsAgreedAt: now, privacyAgreedAt: now },
      update: { termsAgreedAt: now, privacyAgreedAt: now },
    });
    return true;
  } catch (e) {
    console.warn("[consent] 기록 실패 (테이블 미생성?):", e instanceof Error ? e.message : e);
    return false;
  }
}
