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

/** 보기 카드(정답 1 + 오답들)로 구성된 라운드들을 생성 */
export function buildRounds(pool: PickCard[], rounds: number, cardsPerRound: number) {
  const result: { target: PickCard; options: PickCard[] }[] = [];
  for (let i = 0; i < rounds; i++) {
    const options = shuffle(pool).slice(0, cardsPerRound);
    const target = options[Math.floor(Math.random() * options.length)];
    result.push({ target, options: shuffle(options) });
  }
  return result;
}
