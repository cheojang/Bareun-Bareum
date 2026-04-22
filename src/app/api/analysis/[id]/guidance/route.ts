import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGuidance } from "@/lib/gemini-ai";
import { PhonemeError } from "@/types/phonetics";
import { LRUCache } from "@/lib/lru-cache";

// ── 1단계 캐시: 서버 메모리 (프로세스 재시작 전까지 유지) ──────────────────
// LRU로 500개 상한 — 메모리 무한 성장 방지
// 키: userId + 오류 패턴 문자열 (사용자 간 격리)
const memoryCache = new LRUCache<string, string>(500);

function buildCacheKey(userId: string, errors: PhonemeError[]): string {
  if (errors.length === 0) return `${userId}:__correct__`;
  const pattern = errors
    .map((e) => `${e.targetPhoneme}>${e.heardPhoneme}:${e.position}:${e.errorType}`)
    .sort()
    .join("|");
  return `${userId}:${pattern}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  const wordRecord = await prisma.wordRecord.findFirst({
    where: { id, session: { userId } },
  });
  if (!wordRecord) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ── 이미 이 레코드에 저장된 처방전이 있으면 즉시 반환 ────────────────────
  if (wordRecord.guidanceText) {
    return NextResponse.json({ guidanceText: wordRecord.guidanceText });
  }

  const errors = (wordRecord.errorPhonemes as unknown as PhonemeError[]) ?? [];
  const cacheKey = buildCacheKey(userId, errors);

  // ── 1단계: 메모리 캐시 확인 (0ms) ─────────────────────────────────────────
  const cached = memoryCache.get(cacheKey);
  if (cached) {
    prisma.wordRecord.update({ where: { id }, data: { guidanceText: cached } }).catch(() => {});
    return NextResponse.json({ guidanceText: cached });
  }

  // ── 2단계: DB에서 같은 오류 패턴을 가진 기존 레코드 찾기 (~10ms) ──────────
  if (errors.length > 0) {
    const primaryError = errors[0];
    const existing = await prisma.wordRecord.findFirst({
      where: {
        id: { not: id },
        guidanceText: { not: null },
        session: { userId },
      },
      orderBy: { practicedAt: "desc" },
    });

    if (existing?.guidanceText) {
      const existingErrors = (existing.errorPhonemes as unknown as PhonemeError[]) ?? [];
      const existingKey = buildCacheKey(userId, existingErrors);
      const existingPrimary = existingErrors[0];
      if (
        existingKey === cacheKey ||
        (existingPrimary &&
          existingPrimary.targetPhoneme === primaryError.targetPhoneme &&
          existingPrimary.errorType === primaryError.errorType)
      ) {
        const guidanceText = existing.guidanceText;
        memoryCache.set(cacheKey, guidanceText);
        prisma.wordRecord.update({ where: { id }, data: { guidanceText } }).catch(() => {});
        return NextResponse.json({ guidanceText });
      }
    }
  }

  // ── 3단계: Gemini AI 호출 (첫 번째 요청, ~1초) ────────────────────────────
  const guidanceRaw = await generateGuidance(
    wordRecord.targetWord,
    wordRecord.heardWord,
    errors
  );
  const guidanceText = [
    guidanceRaw.rootCause,
    guidanceRaw.trainingStep1,
    guidanceRaw.trainingStep2,
  ]
    .filter(Boolean)
    .join("\n\n");

  memoryCache.set(cacheKey, guidanceText);
  prisma.wordRecord.update({ where: { id }, data: { guidanceText } }).catch(() => {});

  return NextResponse.json({ guidanceText });
}
