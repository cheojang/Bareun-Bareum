import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { PhonemeError } from "@/types/phonetics";

export default async function BookmarksPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const bookmarks = await prisma.wordRecord.findMany({
    where: {
      isBookmarked: true,
      session: { userId },
    },
    orderBy: { practicedAt: "desc" },
    select: {
      id: true,
      targetWord: true,
      heardWord: true,
      errorPhonemes: true,
      isCorrect: true,
      practicedAt: true,
      session: { select: { child: { select: { name: true } } } },
    },
  });

  return (
    <div className="px-5 pt-6 max-w-lg mx-auto space-y-4">
      <h2 className="text-2xl font-black text-[#3D3530]">보관함 ⭐</h2>
      <p className="text-sm text-[#8B7E74]">저장한 단어와 문장을 다시 연습해보세요</p>

      {bookmarks.length === 0 ? (
        <BubbleCard className="text-center py-10">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-semibold text-[#3D3530]">아직 저장된 단어가 없어요</p>
          <p className="text-sm text-[#8B7E74] mt-2">
            연습 중에 ☆ 버튼을 눌러 단어를 저장해보세요
          </p>
        </BubbleCard>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b) => {
            const errors = (b.errorPhonemes as unknown as PhonemeError[]) ?? [];
            return (
              <BubbleCard key={b.id} padding="sm">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-black text-[#3D3530]">{b.targetWord}</span>
                      {b.isCorrect ? (
                        <PastelBadge color="mint">✅ 정확</PastelBadge>
                      ) : (
                        <PastelBadge color="pink">연습 필요</PastelBadge>
                      )}
                    </div>
                    {!b.isCorrect && b.heardWord && (
                      <p className="text-xs text-[#8B7E74] mb-2">
                        발음: {b.heardWord}
                      </p>
                    )}
                    {errors.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {errors.slice(0, 3).map((e, i) => (
                          <PastelBadge key={i} color="lavender" className="text-xs">
                            {e.targetPhoneme}→{e.heardPhoneme}
                          </PastelBadge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#C4B5A8]">
                      {b.session.child.name}
                    </p>
                    <p className="text-xs text-[#C4B5A8]">
                      {new Date(b.practicedAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </BubbleCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
