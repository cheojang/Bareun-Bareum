import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PracticeClient } from "./PracticeClient";

export default async function PracticePage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (children.length === 0) {
    redirect("/onboarding");
  }

  const child = children[0];

  // 1. 최근 오답노트 단어 (최대 5개)
  const errorRecords = await prisma.errorRecord.findMany({
    where: { childId: child.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      geminiFeedback: {
        select: { recommendedWords: true },
      },
    },
  });

  // 2. 오답노트 단어 목록 (중복 제거)
  const errorWords: { word: string; errorPattern: string }[] = [];
  const seen = new Set<string>();
  for (const rec of errorRecords) {
    if (!seen.has(rec.targetWord)) {
      seen.add(rec.targetWord);
      errorWords.push({
        word: rec.targetWord,
        errorPattern: rec.errorPattern,
      });
    }
  }

  // 3. AI 추천 단어 (GeminiFeedback.recommendedWords 합산, 중복·오답 단어 제거)
  const recommendedWords: string[] = [];
  const recSeen = new Set<string>(seen);
  for (const rec of errorRecords) {
    if (!rec.geminiFeedback?.recommendedWords) continue;
    try {
      const words: string[] = JSON.parse(rec.geminiFeedback.recommendedWords);
      for (const w of words) {
        const clean = w.trim();
        if (clean && !recSeen.has(clean)) {
          recSeen.add(clean);
          recommendedWords.push(clean);
          if (recommendedWords.length >= 8) break;
        }
      }
    } catch {
      // JSON 파싱 실패 무시
    }
    if (recommendedWords.length >= 8) break;
  }

  return (
    <PracticeClient
      childId={child.id}
      childName={child.name}
      mascotLevel={child.mascotLevel}
      errorWords={errorWords}
      recommendedWords={recommendedWords}
    />
  );
}
