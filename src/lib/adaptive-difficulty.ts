/**
 * 적응형 난이도 엔진 — 연습 결과 이력으로 아이의 현재 난이도를 결정.
 *
 * 규칙 (학습과학: 80% 성공률 유지가 최적 동기 구간):
 *  - 3연속 성공 → 한 단계 상향 (easy → medium → hard)
 *  - 2연속 실패 → 한 단계 하향
 *  - 레벨 변경 시 연속 카운터 리셋
 *
 * DB에 레벨을 저장하지 않고 최근 기록(oldest→newest)에서 매번 결정적으로
 * 재계산 — 스키마 변경 없이 동작하고, 기록이 곧 단일 진실 공급원.
 */

export type Difficulty = "easy" | "medium" | "hard";

const ORDER: Difficulty[] = ["easy", "medium", "hard"];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
};

/**
 * 연습 결과 배열(오래된 것 → 최신 순)로 현재 난이도 계산.
 * 기록이 없으면 "easy"에서 시작 (3~6세 기본).
 */
export function computeAdaptiveDifficulty(results: boolean[]): Difficulty {
  let level = 0; // easy
  let winStreak = 0;
  let loseStreak = 0;

  for (const correct of results) {
    if (correct) {
      winStreak++;
      loseStreak = 0;
      if (winStreak >= 3 && level < ORDER.length - 1) {
        level++;
        winStreak = 0;
      }
    } else {
      loseStreak++;
      winStreak = 0;
      if (loseStreak >= 2 && level > 0) {
        level--;
        loseStreak = 0;
      }
    }
  }
  return ORDER[level];
}

/**
 * 난이도 선호 정렬 키 — 목표 난이도와 같으면 0, 한 단계 차이 1, 두 단계 2.
 * 후보가 부족할 때 이웃 난이도로 자연스럽게 폴백하기 위한 거리 함수.
 */
export function difficultyDistance(a: Difficulty, b: Difficulty): number {
  return Math.abs(ORDER.indexOf(a) - ORDER.indexOf(b));
}
