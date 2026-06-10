import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChildPlayClient } from "./ChildPlayClient";
import { getSelectedChildId } from "@/lib/child-cookie";
import { WORD_DATABASE } from "@/lib/word-database";

export default async function ChildPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  // 아이 목록 + 선택 ID 병렬 조회
  const [children, savedId] = await Promise.all([
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, mascotLevel: true },
    }),
    getSelectedChildId(),
  ]);

  if (children.length === 0) redirect("/onboarding");

  const child = children.find((c) => c.id === savedId) ?? children[0];

  // Get recommended words for this child
  const recentRecords = await prisma.wordRecord.findMany({
    where: { session: { childId: child.id } },
    orderBy: { practicedAt: "desc" },
    take: 20,
    select: { targetWord: true },
  });

  // 서버에서 8개 선정 — 단어 DB 전체(2000개)를 클라이언트 번들에 싣지 않음
  const recentWords = new Set(recentRecords.map((r) => r.targetWord));
  const playWords = WORD_DATABASE.filter((w) => !recentWords.has(w.word))
    .slice(0, 8)
    .map((w) => ({ word: w.word, imageSlug: w.imageSlug, sampleSentence: w.sampleSentence }));

  return (
    <ChildPlayClient
      childName={child.name}
      mascotLevel={child.mascotLevel}
      playWords={playWords}
    />
  );
}
