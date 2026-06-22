import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { getSelectedChildId } from "@/lib/child-cookie";
import Link from "next/link";
import { SavedWordsList } from "./SavedWordsList";
import { getKSTEndOfDay } from "@/lib/kst-utils";

export default async function BookmarksPage() {
  const session = await auth();
  const userId = session!.user!.id!;

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

  const kstEndOfDay = getKSTEndOfDay();

  const [reviewCount, savedWords] = await Promise.all([
    prisma.reviewSchedule.count({
      where: { childId: child.id, isLearned: false, nextReviewAt: { lte: kstEndOfDay } },
    }),
    prisma.savedWord.findMany({
      where: { childId: child.id },
      orderBy: { savedAt: "desc" },
    }),
  ]);

  const isEmpty = savedWords.length === 0 && reviewCount === 0;

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-8">

      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-black text-[#3D3530]">📌 저장한 단어</h2>
        <p className="text-sm text-[#8B7E74] mt-1">
          저장된 단어와 복습 일정을 확인해요
        </p>
      </div>

      {isEmpty ? (
        <BubbleCard className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-bold text-[#3D3530]">아직 저장된 단어가 없어요</p>
          <p className="text-sm text-[#8B7E74] mt-2 mb-5 leading-relaxed">
            발음 연습 중 카드의 저장 버튼을 누르면<br />
            단어가 여기에 쌓여요
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
