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

  if (children.length === 0) redirect("/onboarding");

  const child = children[0];

  // ── 1단계: 최근 오답노트 단어 (최대 5개, 중복 제거) ────────────────────────
  const errorRecords = await prisma.errorRecord.findMany({
    where: { childId: child.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      geminiFeedback: { select: { recommendedWords: true } },
    },
  });

  const stage1Words: { word: string; errorPattern: string }[] = [];
  const stage1Seen = new Set<string>();
  for (const rec of errorRecords) {
    if (!stage1Seen.has(rec.targetWord) && stage1Words.length < 5) {
      stage1Seen.add(rec.targetWord);
      stage1Words.push({ word: rec.targetWord, errorPattern: rec.errorPattern });
    }
  }

  // ── 2단계: AI 추천 유사 패턴 단어 (GeminiFeedback.recommendedWords 합산) ──
  const stage2Words: string[] = [];
  const stage2Seen = new Set<string>(stage1Seen); // 오답 단어 중복 방지
  for (const rec of errorRecords) {
    if (!rec.geminiFeedback?.recommendedWords) continue;
    try {
      const words: string[] = JSON.parse(rec.geminiFeedback.recommendedWords);
      for (const w of words) {
        const clean = w.trim();
        if (clean && !stage2Seen.has(clean)) {
          stage2Seen.add(clean);
          stage2Words.push(clean);
          if (stage2Words.length >= 8) break;
        }
      }
    } catch { /* JSON 파싱 실패 무시 */ }
    if (stage2Words.length >= 8) break;
  }

  // ── 주요 오류 패턴 (문장 생성 힌트용) ───────────────────────────────────────
  const errorPattern = stage1Words[0]?.errorPattern;

  return (
    <PracticeClient
      childId={child.id}
      childName={child.name}
      mascotLevel={child.mascotLevel}
      stage1Words={stage1Words}
      stage2Words={stage2Words}
      errorPattern={errorPattern}
    />
  );
}
