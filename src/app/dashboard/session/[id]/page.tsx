import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SessionPracticeClient } from "./SessionPracticeClient";
import { MinimalPairsPracticeClient } from "./MinimalPairsPracticeClient";
import { getWordByText } from "@/lib/word-database";

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
    const pairs: { word1: string; word2: string }[] = JSON.parse(decodeURIComponent(pairsParam));
    // 이미지 슬러그를 서버에서 매칭 — 단어 DB(2000개)를 클라이언트 번들에 싣지 않음
    const imageSlugs: Record<string, string> = {};
    for (const p of pairs) {
      for (const w of [p.word1, p.word2]) {
        const slug = getWordByText(w)?.imageSlug;
        if (slug) imageSlugs[w] = slug;
      }
    }
    return (
      <MinimalPairsPracticeClient
        pairs={pairs as Parameters<typeof MinimalPairsPracticeClient>[0]["pairs"]}
        imageSlugs={imageSlugs}
        childName={session.child.name}
      />
    );
  }

  // 일반 단어 연습 모드
  const words: string[] = wordsParam ? JSON.parse(decodeURIComponent(wordsParam)) : [];

  // 단어 부가정보(이미지·의성어·예문)를 서버에서 조회해 prop으로 전달
  const wordInfos: Record<string, { imageSlug?: string; soundEffect?: string; sampleSentence: string }> = {};
  for (const w of words) {
    const info = getWordByText(w);
    if (info) {
      wordInfos[w] = {
        imageSlug: info.imageSlug,
        soundEffect: info.soundEffect,
        sampleSentence: info.sampleSentence,
      };
    }
  }

  return (
    <SessionPracticeClient
      sessionId={id}
      childId={session.childId}
      childName={session.child.name}
      initialWords={words}
      wordInfos={wordInfos}
      wordRecords={session.wordRecords}
    />
  );
}
