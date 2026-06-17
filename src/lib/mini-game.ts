/**
 * 단계 사이 미니게임 공용 타입·유틸.
 * 여러 게임(소리 맞추기·그림자 맞추기 등)이 공유합니다.
 */

export interface PickCard {
  word: string;
  imageSlug: string;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 보기 카드(정답 1 + 오답들)로 구성된 라운드들을 생성.
 *  라운드마다 정답이 겹치지 않도록(풀이 충분할 때) 셔플된 순서로 정답을 돌려쓴다. */
export function buildRounds(pool: PickCard[], rounds: number, cardsPerRound: number) {
  const result: { target: PickCard; options: PickCard[] }[] = [];
  const targetOrder = shuffle(pool); // 라운드마다 다른 정답 (중복 방지)
  for (let i = 0; i < rounds; i++) {
    const target = targetOrder[i % targetOrder.length];
    // 정답 + 서로 다른 오답들로 보기 구성 (같은 단어 두 번 안 나오게)
    const distractors = shuffle(pool.filter((c) => c.word !== target.word)).slice(0, cardsPerRound - 1);
    const options = shuffle([target, ...distractors]);
    result.push({ target, options });
  }
  return result;
}
