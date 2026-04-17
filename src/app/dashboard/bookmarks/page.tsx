import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { ReviewSection } from "./ReviewSection";
import Link from "next/link";

const DIFFICULTY_META: Record<string, { label: string; color: "pink" | "yellow" | "mint" }> = {
  hard:   { label: "집중 연습", color: "pink" },
  medium: { label: "유사 패턴", color: "yellow" },
  easy:   { label: "쉬운 단어", color: "mint" },
};

export default async function BookmarksPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const child = await prisma.child.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (!child) {
    return (
      <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto">
        <p className="text-[#8B7E74]">아이 정보가 없어요.</p>
      </div>
    );
  }

  // ── 아이연습에서 저장한 복습 단어 (SavedWord) ─────────────────────────────────
  const savedWords = await prisma.savedWord.findMany({
    where: { childId: child.id },
    orderBy: { savedAt: "desc" },
  });

  // ── 오늘 복습이 필요한 단어 (SM-2 스케줄) ────────────────────────────────────
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const reviewItems = await prisma.reviewSchedule.findMany({
    where: {
      childId: child.id,
      isLearned: false,
      nextReviewAt: { lte: todayEnd },
    },
    orderBy: { nextReviewAt: "asc" },
  });

  // ── 발음 분석 최근 기록 (빠른 복습용) ─────────────────────────────────────────
  const recentErrors = await prisma.errorRecord.findMany({
    where: { childId: child.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      targetWord: true,
      childPronunciation: true,
      errorPattern: true,
      errorCategory: true,
      createdAt: true,
    },
  });

  const isEmpty = savedWords.length === 0 && recentErrors.length === 0 && reviewItems.length === 0;

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-8">

      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-black text-[#3D3530]">📌 복습 목록</h2>
        <p className="text-sm text-[#8B7E74] mt-1">
          아이연습에서 저장한 단어들을 다시 연습해요
        </p>
      </div>

      {isEmpty ? (
        /* 빈 상태 */
        <BubbleCard className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-bold text-[#3D3530]">아직 저장된 단어가 없어요</p>
          <p className="text-sm text-[#8B7E74] mt-2 mb-5 leading-relaxed">
            아이연습 중에 ☆ 버튼을 눌러<br />
            잘 안 되는 단어를 저장해보세요
          </p>
          <Link href="/dashboard/practice">
            <span className="inline-block px-5 py-2.5 bg-[#FFB38A] text-white rounded-full text-sm font-bold">
              아이연습 시작하기 →
            </span>
          </Link>
        </BubbleCard>
      ) : (
        <>
          {/* ── 오늘 복습 (SM-2 망각 곡선) ──────────────────────────────── */}
          {reviewItems.length > 0 && (
            <ReviewSection
              initialItems={reviewItems.map((item) => ({
                id: item.id,
                targetWord: item.targetWord,
                childPronunciation: item.childPronunciation,
                phoneme: item.phoneme,
                errorPattern: item.errorPattern,
                reviewCount: item.reviewCount,
                interval: item.interval,
                nextReviewAt: item.nextReviewAt.toISOString(),
              }))}
              childName={child.name}
            />
          )}

          {/* ── 복습 단어 목록 ───────────────────────────────────────────── */}
          {savedWords.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-[#3D3530]">
                  저장한 단어
                  <span className="ml-2 text-sm font-normal text-[#8B7E74]">
                    {savedWords.length}개
                  </span>
                </p>
                <Link href="/dashboard/practice">
                  <span className="text-xs text-[#FFB38A] font-semibold">다시 연습하기 →</span>
                </Link>
              </div>
              <div className="space-y-2.5">
                {savedWords.map((sw: any) => {
                  const diff = DIFFICULTY_META[sw.difficulty] ?? DIFFICULTY_META.medium;
                  return (
                    <BubbleCard key={sw.id} padding="sm">
                      <div className="flex items-center gap-3">
                        {/* 단어 */}
                        <span className="text-2xl font-black text-[#3D3530] min-w-[4rem]">
                          {sw.word}
                        </span>

                        {/* 오류 패턴 배지 */}
                        <div className="flex-1 flex flex-wrap gap-1.5">
                          <PastelBadge color={diff.color}>{diff.label}</PastelBadge>
                          {sw.targetPhoneme && sw.targetPhoneme !== "연습" && (
                            <PastelBadge color="lavender">{sw.targetPhoneme}</PastelBadge>
                          )}
                        </div>

                        {/* 저장일 */}
                        <p className="text-xs text-[#C4B5A8] flex-shrink-0">
                          {new Date(sw.savedAt).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </BubbleCard>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── 최근 발음 분석 (빠른 참고) ───────────────────────────────── */}
          {recentErrors.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-[#3D3530]">최근 발음 분석</p>
                <Link href="/dashboard/answer-note">
                  <span className="text-xs text-[#FFB38A] font-semibold">발음 분석 추가 →</span>
                </Link>
              </div>
              <div className="space-y-2.5">
                {recentErrors.map((rec: any) => (
                  <BubbleCard key={rec.id} padding="sm">
                    <div className="flex items-center gap-3">
                      {/* 목표 → 오답 */}
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg font-black text-[#3D3530]">
                          {rec.targetWord}
                        </span>
                        <span className="text-[#C4B5A8] text-sm">→</span>
                        <span className="text-lg font-bold text-[#FCA5A5]">
                          {rec.childPronunciation}
                        </span>
                      </div>

                      {/* 오류 패턴 */}
                      <PastelBadge color="pink">{rec.errorPattern}</PastelBadge>

                      {/* 날짜 */}
                      <p className="text-xs text-[#C4B5A8] flex-shrink-0">
                        {new Date(rec.createdAt).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </BubbleCard>
                ))}
              </div>
            </section>
          )}

          {/* 아이연습 CTA */}
          <BubbleCard color="peach" className="text-center">
            <p className="font-bold text-[#3D3530] mb-1">저장한 단어로 연습할까요?</p>
            <p className="text-xs text-[#8B7E74] mb-3">
              발음 분석 단어 + AI 추천 단어 3단계 훈련
            </p>
            <Link href="/dashboard/practice">
              <span className="inline-block px-6 py-3 bg-white rounded-full text-sm font-black text-[#FFB38A] shadow-sm">
                아이연습 시작하기 🎮
              </span>
            </Link>
          </BubbleCard>
        </>
      )}
    </div>
  );
}
