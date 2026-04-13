import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SessionPracticeClient } from "./SessionPracticeClient";
import { MinimalPairsPracticeClient } from "./MinimalPairsPracticeClient";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ words?: string; pairs?: string; childId?: string }>;
}

export default async function SessionPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { words: wordsParam, pairs: pairsParam } = await searchParams;
  const authSession = await auth();
  const userId = authSession!.user!.id!;

  const session = await prisma.practiceSession.findFirst({
    where: { id, userId },
    include: {
      child: true,
      wordRecords: { orderBy: { practicedAt: "desc" } },
    },
  });

  if (!session) notFound();

  // 최소대립쌍 모드
  if (pairsParam) {
    const pairs = JSON.parse(decodeURIComponent(pairsParam));
    return (
      <MinimalPairsPracticeClient
        pairs={pairs}
        childName={session.child.name}
      />
    );
  }

  // 일반 단어 연습 모드
  const words = wordsParam ? JSON.parse(decodeURIComponent(wordsParam)) : [];

  return (
    <SessionPracticeClient
      sessionId={id}
      childId={session.childId}
      childName={session.child.name}
      initialWords={words}
      wordRecords={session.wordRecords}
    />
  );
}
