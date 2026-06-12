/**
 * 음소(한글 자모) → 조음 단면도 슬러그 매핑.
 *
 * /public/images/articulation/{slug}.svg 와 연결.
 * 같은 조음 위치·방법을 공유하는 음소는 같은 그림을 쓴다
 * (예: ㄱㄲㅋ → giyeok, ㅂㅃㅍ → bilabial).
 *
 * 매핑에 없는 음소(이중모음 ㅘㅚ 등)는 null → 단면도 미표시(그레이스풀).
 */

export type ArticulationSlug =
  | "bilabial" | "mieum" | "dieut" | "nieun" | "siot" | "rieul"
  | "jieut" | "giyeok" | "ieung" | "hieut"
  | "vowel_a" | "vowel_ae" | "vowel_eo" | "vowel_e"
  | "vowel_o" | "vowel_u" | "vowel_eu" | "vowel_i";

const CONSONANT_SLUG: Record<string, ArticulationSlug> = {
  ㄱ: "giyeok", ㄲ: "giyeok", ㅋ: "giyeok",
  ㄴ: "nieun",
  ㄷ: "dieut", ㄸ: "dieut", ㅌ: "dieut",
  ㄹ: "rieul",
  ㅁ: "mieum",
  ㅂ: "bilabial", ㅃ: "bilabial", ㅍ: "bilabial",
  ㅅ: "siot", ㅆ: "siot",
  ㅇ: "ieung",
  ㅈ: "jieut", ㅉ: "jieut", ㅊ: "jieut",
  ㅎ: "hieut",
};

const VOWEL_SLUG: Record<string, ArticulationSlug> = {
  ㅏ: "vowel_a", ㅑ: "vowel_a",
  ㅐ: "vowel_ae", ㅒ: "vowel_ae",
  ㅓ: "vowel_eo", ㅕ: "vowel_eo",
  ㅔ: "vowel_e", ㅖ: "vowel_e",
  ㅗ: "vowel_o", ㅛ: "vowel_o",
  ㅜ: "vowel_u", ㅠ: "vowel_u",
  ㅡ: "vowel_eu",
  ㅣ: "vowel_i",
};

// 아동·부모용 한 줄 조음 안내 (단면도 캡션)
const HINT: Record<ArticulationSlug, string> = {
  bilabial: "두 입술을 다물었다 톡 떼며 소리내요",
  mieum: "입술을 다물고 콧소리로 음~",
  dieut: "혀끝을 윗니 뒤 잇몸에 댔다 떼요",
  nieun: "혀끝을 윗잇몸에 대고 콧소리로 느~",
  siot: "혀를 잇몸 가까이, 좁은 틈으로 바람 스─",
  rieul: "혀끝을 윗잇몸에 살짝 톡 대요",
  jieut: "혓바닥을 입천장에 붙였다 떼요",
  giyeok: "혀 뒤를 목천장에 붙였다 떼요",
  ieung: "혀 뒤를 올리고 콧소리로 응~",
  hieut: "입을 열고 목에서 바람을 후~",
  vowel_a: "입을 크게 아— 벌려요",
  vowel_ae: "입을 적당히 벌려 애—",
  vowel_eo: "입을 덜 벌리고 어—",
  vowel_e: "입을 옆으로 에—",
  vowel_o: "입술을 동그랗게 오—",
  vowel_u: "입술을 작게 모아 우—",
  vowel_eu: "입술을 옆으로 으—",
  vowel_i: "입술을 옆으로 길게 이—",
};

/** 음소 한 글자 → 조음 단면도 슬러그 (없으면 null) */
export function getArticulationSlug(phoneme: string | null | undefined): ArticulationSlug | null {
  if (!phoneme) return null;
  const ch = phoneme.trim().charAt(0);
  return CONSONANT_SLUG[ch] ?? VOWEL_SLUG[ch] ?? null;
}

/** 오류패턴/배지 문자열(예: "ㅅ→ㅌ 대치")에서 첫 자모 음소 추출 */
export function phonemeFromPattern(pattern: string | null | undefined): string | null {
  if (!pattern) return null;
  const m = pattern.match(/[ㄱ-ㅎㅏ-ㅣ]/);
  return m ? m[0] : null;
}

/** 슬러그의 한 줄 조음 안내 */
export function articulationHint(slug: ArticulationSlug): string {
  return HINT[slug];
}
