import { PhonemeError } from "@/types/phonetics";
import { ArticulationGuide } from "@/types/analysis";

// Map of phoneme → visual articulation guide
const ARTICULATION_GUIDES: Record<string, Omit<ArticulationGuide, "phoneme">> = {
  "ㄹ": {
    place: "치조음",
    manner: "탄설음",
    imageKey: "tongue-alveolar-lateral",
    tipText: "혀 끝을 윗니 뒤쪽 볼록한 부분에 살짝 대고 튕겨보세요",
  },
  "ㅅ": {
    place: "치조음",
    manner: "마찰음",
    imageKey: "tongue-alveolar-fricative",
    tipText: "윗니와 아랫니를 가깝게 하고 혀를 평평하게 펴서 바람을 내보내세요",
  },
  "ㅆ": {
    place: "치조음",
    manner: "마찰음",
    imageKey: "tongue-alveolar-fricative-tense",
    tipText: "혀에 힘을 주고 'ㅅ'보다 강하게 바람을 내보내세요",
  },
  "ㅈ": {
    place: "치조구개음",
    manner: "파찰음",
    imageKey: "tongue-palato-affricate",
    tipText: "혀를 윗잇몸에 댔다가 바람과 함께 떼세요",
  },
  "ㅊ": {
    place: "치조구개음",
    manner: "파찰음",
    imageKey: "tongue-palato-affricate-aspirated",
    tipText: "혀를 윗잇몸에 댔다가 바람을 강하게 내보내며 떼세요",
  },
  "ㄱ": {
    place: "연구개음",
    manner: "파열음",
    imageKey: "tongue-velar",
    tipText: "혀의 뒷부분을 목 안쪽 연한 부분에 대었다가 떼세요",
  },
  "ㅋ": {
    place: "연구개음",
    manner: "파열음",
    imageKey: "tongue-velar-aspirated",
    tipText: "혀 뒤를 목 안쪽에 대었다가 바람과 함께 떼세요",
  },
  "ㅂ": {
    place: "양순음",
    manner: "파열음",
    imageKey: "lips-bilabial",
    tipText: "두 입술을 붙였다가 '팝' 하고 떼세요",
  },
  "ㅍ": {
    place: "양순음",
    manner: "파열음",
    imageKey: "lips-bilabial-aspirated",
    tipText: "입술을 붙였다가 바람과 함께 강하게 떼세요",
  },
  "ㄴ": {
    place: "치조음",
    manner: "비음",
    imageKey: "tongue-alveolar-nasal",
    tipText: "혀를 윗잇몸에 대고 코로 소리를 내보내세요",
  },
  "ㅁ": {
    place: "양순음",
    manner: "비음",
    imageKey: "lips-bilabial-nasal",
    tipText: "입술을 붙이고 코로 '음~' 하고 소리를 내보내세요",
  },
  "ㄷ": {
    place: "치조음",
    manner: "파열음",
    imageKey: "tongue-alveolar-stop",
    tipText: "혀 끝을 윗잇몸에 대었다가 '다' 하고 떼세요",
  },
  "ㅎ": {
    place: "성문음",
    manner: "마찰음",
    imageKey: "glottal-fricative",
    tipText: "목 안에서 바람을 내보내듯이 '하~' 하세요",
  },
  "ㅌ": {
    place: "치조음",
    manner: "파열음",
    imageKey: "tongue-alveolar-stop-aspirated",
    tipText: "혀 끝을 윗잇몸에 대었다가 바람을 강하게 내뱉으며 떼세요",
  },
  "ㄸ": {
    place: "치조음",
    manner: "파열음",
    imageKey: "tongue-alveolar-stop-tense",
    tipText: "혀 끝에 힘을 주고 윗잇몸에 대었다가 강하게 떼세요",
  },
  "ㅃ": {
    place: "양순음",
    manner: "파열음",
    imageKey: "lips-bilabial-tense",
    tipText: "입술을 꽉 다물었다가 힘주어 강하게 떼세요",
  },
  "ㅉ": {
    place: "치조구개음",
    manner: "파찰음",
    imageKey: "tongue-palato-affricate-tense",
    tipText: "혀를 윗잇몸에 강하게 댔다가 떼세요",
  },
  "ㄲ": {
    place: "연구개음",
    manner: "파열음",
    imageKey: "tongue-velar-tense",
    tipText: "혀 뒤쪽에 힘을 주고 목 안쪽에 대었다가 강하게 떼세요",
  },
  "ㅇ": {
    place: "연구개음",
    manner: "비음",
    imageKey: "tongue-velar-nasal",
    tipText: "혀 뒤쪽을 목 안쪽에 대고 코로 '응~' 소리를 내보내세요",
  },
};

export function buildArticulationGuides(errors: PhonemeError[]): ArticulationGuide[] {
  const seen = new Set<string>();
  const guides: ArticulationGuide[] = [];

  for (const error of errors) {
    // 첨가 오류로 인한 빈 문자열 필터링
    if (!error.targetPhoneme) continue;

    if (seen.has(error.targetPhoneme)) continue;
    seen.add(error.targetPhoneme);

    const guide = ARTICULATION_GUIDES[error.targetPhoneme];
    if (guide) {
      guides.push({ phoneme: error.targetPhoneme, ...guide });
    }
  }

  return guides;
}

export function getMostFrequentErrors(
  errorHistory: PhonemeError[][]
): { phoneme: string; count: number }[] {
  const counts: Record<string, number> = {};

  for (const errors of errorHistory) {
    for (const error of errors) {
      // 첨가 오류로 인한 빈 문자열 통계 집계 방지
      if (!error.targetPhoneme) continue;

      counts[error.targetPhoneme] = (counts[error.targetPhoneme] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([phoneme, count]) => ({ phoneme, count }))
    .sort((a, b) => b.count - a.count);
}
