import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SessionPracticeClient } from "./SessionPracticeClient";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ words?: string; childId?: string }>;
}

export default async function SessionPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { words: wordsParam } = await searchParams;
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
