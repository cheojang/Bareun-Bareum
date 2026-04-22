/**
 * SM-2 알고리즘 (SuperMemo 2)
 * Anki, 많은 플래시카드 앱이 사용하는 망각 곡선 기반 복습 스케줄링
 *
 * quality 점수:
 *   5 = 완벽히 기억 (즉시 정답)
 *   4 = 정답 (약간 고민)
 *   3 = 정답 (힘들게)    ← UI에서 "잘 했어요 ✅"는 quality=5로 처리
 *   2 = 오답 (아슬아슬)
 *   1 = 오답
 *   0 = 완전히 모름      ← UI에서 "아직 어려워요 ❌"는 quality=1로 처리
 *
 * 복습 간격 (첫 복습부터 체감되도록 기본 SM-2보다 약간 공격적):
 *   1회 성공 → 2일 후
 *   2회 성공 → 5일 후
 *   3회 이상 → interval × easeFactor 일 후  (최대 MAX_INTERVAL_DAYS)
 *   실패     → 1일 후로 리셋
 */

export interface SM2Input {
  reviewCount: number;   // 지금까지 복습 횟수
  interval: number;      // 현재 간격 (일수)
  easeFactor: number;    // 난이도 계수 (기본 2.5, 최소 1.3)
  quality: number;       // 이번 복습 품질 (0~5)
}

export interface SM2Result {
  newReviewCount: number;
  newInterval: number;
  newEaseFactor: number;
  nextReviewAt: Date;
  isLearned: boolean;    // 5회 이상 성공 시 true (졸업)
}

// 🧠 모터 러닝(근육 기억): 아이가 배운 입모양을 잊어버리기 전에 복습하도록 제한
const MAX_INTERVAL_DAYS = 14;

export function calculateNextReview(input: SM2Input): SM2Result {
  const { reviewCount, interval, easeFactor, quality } = input;

  let newInterval: number;
  let newEaseFactor = easeFactor;
  let newReviewCount = reviewCount;

  if (quality >= 3) {
    // 성공 — 간격 확장 (첫 복습부터 "아직 어려워요"(1일)와 체감 차이 나도록)
    if (reviewCount === 0) {
      newInterval = 2;
    } else if (reviewCount === 1) {
      newInterval = 5;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }

    // easeFactor 업데이트 (성공할수록 간격이 더 벌어짐)
    newEaseFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor);

    newReviewCount = reviewCount + 1;
  } else {
    // 실패 — 1일 후로 리셋, easeFactor 소폭 하락
    newInterval = 1;
    newReviewCount = 0;
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  }

  // 🧠 모터 러닝: 간격을 14일 이내로 제한 (근육 기억 손실 방지)
  newInterval = Math.min(newInterval, MAX_INTERVAL_DAYS);

  // 🌍 Vercel UTC → KST 변환 (한국 기준 자정)
  const now = new Date();
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(utcNow + kstOffset);

  const nextReviewAt = new Date(kstNow);
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);
  nextReviewAt.setHours(0, 0, 0, 0);

  // 5회 이상 성공 → 졸업
  const isLearned = newReviewCount >= 5;

  return {
    newReviewCount,
    newInterval,
    newEaseFactor,
    nextReviewAt,
    isLearned,
  };
}

/** 오늘 복습이 필요한지 확인 (KST 기준) */
export function isDueToday(nextReviewAt: Date): boolean {
  const now = new Date();
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstToday = new Date(utcNow + kstOffset);

  kstToday.setHours(23, 59, 59, 999);
  return nextReviewAt <= kstToday;
}
