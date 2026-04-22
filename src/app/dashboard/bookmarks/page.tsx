import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";
import Link from "next/link";
import { ResetSavedWordsButton } from "./ResetSavedWordsButton";

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

  // 오늘 복습 필요 개수 (반복연습 CTA용)
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  kstNow.setUTCHours(23, 59, 59, 999);
  const kstEndOfDay = new Date(kstNow.getTime() - 9 * 60 * 60 * 1000);

  const [reviewCount, savedWords, recentErrors] = await Promise.all([
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
      take: 5,
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
            발음 분석 후 반복연습을 하면<br />
            틀린 단어가 자동으로 쌓여요
          </p>
          <Link href="/dashboard/practice">
            <span className="inline-block px-5 py-2.5 bg-[#FFB38A] text-white rounded-full text-sm font-bold">
              반복연습 시작하기 →
            </span>
          </Link>
        </BubbleCard>
      ) : (
        <>
          {/* ── 오늘 복습 안내 CTA ─────────────────────────────────────────── */}
          {reviewCount > 0 && (
            <Link href="/dashboard/practice">
              <BubbleCard className="border-2 border-[#FFD9B8] cursor-pointer hover:opacity-95 transition">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🔔</div>
                  <div className="flex-1">
                    <p className="font-black text-[#3D3530]">오늘 복습할 단어 {reviewCount}개</p>
                    <p className="text-xs text-[#8B7E74] mt-0.5">반복연습에서 바로 시작할 수 있어요</p>
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
                  <Link key={rec.id} href={`/dashboard/practice?errorRecordId=${rec.id}`}>
                    <div className={`flex items-center gap-2 py-3 px-1 hover:bg-[#FAFAF8] rounded-xl transition-colors cursor-pointer ${index < recentErrors.length - 1 ? "border-b border-[#F5F0EB]" : ""}`}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-base font-black text-[#3D3530] truncate">{rec.targetWord}</span>
                        <span className="text-[#C4B5A8] text-xs flex-shrink-0">→</span>
                        <span className="text-base font-bold text-[#FCA5A5] truncate">{rec.childPronunciation}</span>
                      </div>
                      <PastelBadge color="pink">{rec.errorPattern.length > 7 ? rec.errorPattern.slice(0, 7) + "…" : rec.errorPattern}</PastelBadge>
                      <p className="text-xs text-[#C4B5A8] flex-shrink-0">
                        {new Date(rec.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      </p>
                      <span className="text-[#C4B5A8] text-xs flex-shrink-0">▶</span>
                    </div>
                  </Link>
                ))}
              </BubbleCard>
            </section>
          )}

          {/* ── 저장한 단어 목록 ─────────────────────────────────────────── */}
          {savedWords.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-[#3D3530]">
                  저장한 단어
                  <span className="ml-2 text-sm font-normal text-[#8B7E74]">
                    {savedWords.length}개
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <ResetSavedWordsButton childId={child.id} />
                  <Link href="/dashboard/practice">
                    <span className="text-xs text-[#FFB38A] font-semibold">다시 연습하기 →</span>
                  </Link>
                </div>
              </div>
              <BubbleCard padding="sm">
                {savedWords.map((sw: any, index: number) => {
                  const diff = DIFFICULTY_META[sw.difficulty] ?? DIFFICULTY_META.medium;
                  return (
                    <div key={sw.id} className={`flex items-center gap-2 py-3 px-1 ${index < savedWords.length - 1 ? "border-b border-[#F5F0EB]" : ""}`}>
                      <span className="text-base font-black text-[#3D3530] flex-1 truncate">
                        {sw.word}
                      </span>
                      <PastelBadge color={diff.color}>{diff.label}</PastelBadge>
                      <p className="text-xs text-[#C4B5A8] flex-shrink-0">
                        {new Date(sw.savedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  );
                })}
              </BubbleCard>
            </section>
          )}

          {/* 반복연습 CTA */}
          <BubbleCard color="peach" className="text-center">
            <p className="font-bold text-[#3D3530] mb-1">저장한 단어로 연습할까요?</p>
            <p className="text-xs text-[#8B7E74] mb-3">
              발음 분석 단어 + AI 추천 단어 단계별 훈련
            </p>
            <Link href="/dashboard/practice">
              <span className="inline-block px-6 py-3 bg-white rounded-full text-sm font-black text-[#FFB38A] shadow-sm">
                반복연습 시작하기 🎮
              </span>
            </Link>
          </BubbleCard>
        </>
      )}
    </div>
  );
}
