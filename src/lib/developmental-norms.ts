/**
 * 발달 규준 게이트 — 아이의 나이(개월)와 목표 음소의 습득 시기를 비교해
 * "지금 이 소리를 못 하는 것이 발달상 정상인지"를 판정한다.
 *
 * 배경: 한국 아동 조음 발달 연구(습득 순서, korean-phonetics.ts의 ACQUISITION_ORDER)에
 * 따르면 ㅅ/ㅆ/ㅈ/ㅊ는 4~5세, ㄹ은 5~6세에야 습득된다. 3세 아이가 ㄹ을 못 하는 것은
 * 완전히 정상 발달인데, 이를 "오류율 85% · 집중 교정 필요"로 표시하면 부모 불안을
 * 조장하고 발달적으로 부적절한 조기 훈련을 유도한다. 이 모듈이 그 게이트 역할을 한다.
 */

import { ACQUISITION_ORDER } from "./korean-phonetics";

export type DevelopmentalStatus =
  | "developing" // 아직 습득 시기 이전 — 못 하는 게 정상 (지켜봐도 됨)
  | "emerging"   // 습득 진행 구간 — 배우는 중, 부드러운 놀이 연습 적합
  | "expected"   // 습득 시기 도래·경과 — 교정 연습이 적절
  | "unknown";   // 나이 미상(생일 미입력·게스트) 또는 규준 없는 음소

/** ACQUISITION_ORDER의 나이 라벨 → 개월 구간(습득 창) */
const STAGE_MONTHS: Record<string, { start: number; end: number }> = {
  "2-3세": { start: 24, end: 36 },
  "3-4세": { start: 36, end: 48 },
  "4-5세": { start: 48, end: 60 },
  "5-6세": { start: 60, end: 72 },
};

/** 생년월일 → 만 나이(개월). 미입력·오류 시 null. */
export function getChildAgeMonths(birthDate: Date | string | null | undefined): number | null {
  if (!birthDate) return null;
  const d = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  // 이번 달에 생일이 아직 안 지났으면 한 달 빼기
  if (now.getDate() < d.getDate()) months -= 1;
  return months < 0 ? 0 : months;
}

/**
 * 목표 음소 + 아이 나이(개월)로 발달 상태 판정.
 * 나이 미상이거나 규준에 없는 음소면 "unknown" (게이트 미적용 = 기존 동작 유지).
 */
export function getDevelopmentalStatus(
  phoneme: string | null | undefined,
  ageMonths: number | null | undefined,
): DevelopmentalStatus {
  if (!phoneme || ageMonths == null) return "unknown";
  const stage = ACQUISITION_ORDER.find((s) => s.phonemes.includes(phoneme));
  if (!stage) return "unknown";
  const range = STAGE_MONTHS[stage.age];
  if (!range) return "unknown";
  if (ageMonths < range.start) return "developing";
  if (ageMonths < range.end) return "emerging";
  return "expected";
}

/** 발달상 정상 범위(못 해도 괜찮은 시기)인지 — developing/emerging */
export function isDevelopmentallyNormal(status: DevelopmentalStatus): boolean {
  return status === "developing" || status === "emerging";
}

export interface DevelopmentalDisplay {
  status: DevelopmentalStatus;
  /** 이 음소가 정상 습득되는 나이 라벨 (예: "5-6세") — unknown이면 null */
  expectedAge: string | null;
  /** 배지 문구 (developing/emerging일 때만 노출) */
  badge: string | null;
  /** 부모용 안내 문구 (developing/emerging일 때만) */
  message: string | null;
  /** 배지 톤 — UI 색상 매핑용 */
  tone: "calm" | "gentle" | "none";
}

/**
 * 발달 상태 → 화면 표시용 메타데이터.
 * phoneme은 안내 문구에 소리 이름을 넣기 위한 것(선택).
 */
export function getDevelopmentalDisplay(
  status: DevelopmentalStatus,
  phoneme?: string | null,
): DevelopmentalDisplay {
  const expectedAge = phoneme
    ? ACQUISITION_ORDER.find((s) => s.phonemes.includes(phoneme))?.age ?? null
    : null;
  const soundLabel = phoneme ? `'${phoneme}'` : "이";

  if (status === "developing") {
    return {
      status,
      expectedAge,
      badge: "발달 과정",
      message:
        `${soundLabel} 소리는 보통 ${expectedAge ?? "더 큰 나이"}에 완성돼요. ` +
        `지금 잘 안 되는 건 자연스러운 발달 과정이니 편하게 지켜봐 주세요. ` +
        `아래 연습은 강한 교정이 아니라 놀이처럼 가볍게 시작하는 정도면 충분해요.`,
      tone: "calm",
    };
  }
  if (status === "emerging") {
    return {
      status,
      expectedAge,
      badge: "배우는 중",
      message:
        `${soundLabel} 소리는 지금이 한창 배우는 시기예요(${expectedAge ?? ""}). ` +
        `아직 서툴러도 괜찮으니, 아래 방법으로 즐겁게 함께 연습해 보세요.`,
      tone: "gentle",
    };
  }
  return { status, expectedAge, badge: null, message: null, tone: "none" };
}
