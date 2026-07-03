import { prisma } from "@/lib/prisma";
import { getWordByText } from "@/lib/word-database";

/**
 * 음소별 "연습 정확도" — 진짜 성공률 지표 (§6-2).
 *
 * 기존 weakPhoneme.errorRate는 "전체 오답 중 이 음소의 점유율"이라, 부모가 오답만
 * 입력하는 구조상 분모에 성공이 없어 왜곡됨(실수 3번만 넣으면 100%처럼 보임).
 * 반면 연습·복습에서 쌓인 WordRecord(isCorrect)는 성공/실패가 모두 기록되므로,
 * 여기서 단어→음소 매핑으로 음소별 (성공 ÷ 전체 시도)를 계산하면 진짜 성공률이 나온다.
 */

export interface PhonemeAccuracy {
  attempts: number;   // 이 음소가 든 단어를 연습/복습한 총 횟수
  correct: number;    // 그중 "잘 됐어요"로 기록된 횟수
  accuracyPct: number;
}

export async function getPhonemePracticeStats(
  childId: string,
  limit = 500,
): Promise<Record<string, PhonemeAccuracy>> {
  const records = await prisma.wordRecord.findMany({
    where: { session: { childId } },
    orderBy: { practicedAt: "desc" },
    take: limit,
    select: { targetWord: true, isCorrect: true },
  });

  const acc: Record<string, { attempts: number; correct: number }> = {};
  for (const r of records) {
    const phonemes = getWordByText(r.targetWord)?.targetPhonemes ?? [];
    for (const p of phonemes) {
      const a = (acc[p] ??= { attempts: 0, correct: 0 });
      a.attempts++;
      if (r.isCorrect) a.correct++;
    }
  }

  const out: Record<string, PhonemeAccuracy> = {};
  for (const [p, v] of Object.entries(acc)) {
    out[p] = {
      attempts: v.attempts,
      correct: v.correct,
      accuracyPct: v.attempts ? Math.round((v.correct / v.attempts) * 100) : 0,
    };
  }
  return out;
}
