import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { getSelectedChildId } from "@/lib/child-cookie";
import Link from "next/link";
import { SavedWordsList } from "./SavedWordsList";
import { getKSTEndOfDay } from "@/lib/kst-utils";

export default async function BookmarksPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  // 헤더에서 선택한 아이 쿠키 우선, 없으면 첫 번째 아이 (병렬 조회)
  const [children, savedId] = await Promise.all([
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
    getSelectedChildId(),
  ]);

  if (children.length === 0) {
    return (
      <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto">
        <p className="text-[#8B7E74]">아이 정보가 없어요.</p>
      </div>
    );
  }

  const child = children.find((c) => c.id === savedId) ?? children[0];

  // 오늘 복습 필요 개수 (복습하기 CTA용)
  const kstEndOfDay = getKSTEndOfDay();

  const [reviewCount, savedWords, recentErrorsRaw] = await Promise.all([
    prisma.reviewSchedule.count({
      where: { childId: child.id, isLearned: false, nextReviewAt: { lte: kstEndOfDay } },
    }),
    prisma.savedWord.findMany({
      where: { childId: child.id },
      orderBy: { savedAt: "desc" },
    }),
    prisma.errorRecord.findMany({
      where: { childId: child.id },
      orderBy: { createdAt: "desc" },
      take: 30, // 중복 제거 전 여유분 — 같은 단어를 여러 번 분석한 경우 대비
      select: {
        id: true,
        targetWord: true,
        childPronunciation: true,
        errorPattern: true,
        errorCategory: true,
        createdAt: true,
      },
    }),
  ]);

  // 같은 목표 단어는 가장 최근 기록 1개만 표시 (최대 5개)
  const seenWords = new Set<string>();
  const recentErrors = [] as typeof recentErrorsRaw;
  for (const rec of recentErrorsRaw) {
    if (seenWords.has(rec.targetWord)) continue;
    seenWords.add(rec.targetWord);
    recentErrors.push(rec);
    if (recentErrors.length >= 5) break;
  }

  const isEmpty = savedWords.length === 0 && recentErrors.length === 0 && reviewCount === 0;

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-8">

      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-black text-[#3D3530]">📌 복습 목록</h2>
        <p className="text-sm text-[#8B7E74] mt-1">
          저장된 단어와 복습 일정을 확인해요
        </p>
      </div>

      {isEmpty ? (
        <BubbleCard className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-bold text-[#3D3530]">아직 저장된 단어가 없어요</p>
          <p className="text-sm text-[#8B7E74] mt-2 mb-5 leading-relaxed">
            발음 분석 후 분석단어 훈련을 하면<br />
            틀린 단어가 자동으로 쌓여요
          </p>
          <Link href="/dashboard/practice">
            <span className="inline-block px-5 py-2.5 bg-[#FFB38A] text-white rounded-full text-sm font-bold">
              분석단어 훈련 시작하기 →
            </span>
          </Link>
        </BubbleCard>
      ) : (
        <>
          {/* ── 오늘 복습 안내 CTA ─────────────────────────────────────────── */}
          {reviewCount > 0 && (
            // block: 인라인 Link엔 space-y 세로 마진이 적용되지 않아 섹션 간격이 좁아짐
            <Link href="/dashboard/practice/review" className="block">
              <BubbleCard className="border-2 border-[#FFD9B8] cursor-pointer hover:opacity-95 transition">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🔔</div>
                  <div className="flex-1">
                    <p className="font-black text-[#3D3530]">오늘 복습할 단어 {reviewCount}개</p>
                    <p className="text-xs text-[#8B7E74] mt-0.5">복습하기에서 바로 시작할 수 있어요</p>
                  </div>
                  <span className="text-[#FFB38A] font-bold">→</span>
                </div>
              </BubbleCard>
            </Link>
          )}

          {/* ── 최근 발음 분석 ────────────────────────────────────────────── */}
          {recentErrors.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-[#3D3530]">최근 발음 분석</p>
                <Link href="/dashboard/answer-note">
                  <span className="text-xs text-[#FFB38A] font-semibold">발음 분석 추가 →</span>
                </Link>
              </div>
              <BubbleCard padding="sm">
                {recentErrors.map((rec: any, index: number) => (
                  <div
                    key={rec.id}
                    className={`flex items-center gap-2 py-3 px-1 ${index < recentErrors.length - 1 ? "border-b border-[#F5F0EB]" : ""}`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-base font-black text-[#3D3530] truncate">{rec.targetWord}</span>
                      <span className="text-[#C4B5A8] text-xs flex-shrink-0">→</span>
                      <span className="text-base font-bold text-[#FCA5A5] truncate">{rec.childPronunciation}</span>
                    </div>
                    <PastelBadge color="pink">{rec.errorPattern.length > 7 ? rec.errorPattern.slice(0, 7) + "…" : rec.errorPattern}</PastelBadge>
                  </div>
                ))}
              </BubbleCard>
            </section>
          )}

          {/* ── 저장한 단어 목록 (체크 후 선택 연습) ──────────────────────── */}
          {savedWords.length > 0 && (
            <SavedWordsList
              childId={child.id}
              savedWords={savedWords.map((sw) => ({
                id: sw.id,
                word: sw.word,
                difficulty: sw.difficulty,
                savedAt: sw.savedAt.toISOString(),
              }))}
            />
          )}

        </>
      )}
    </div>
  );
}
