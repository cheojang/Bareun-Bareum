"use client";

import Image from "next/image";
import { useState } from "react";
import {
  getArticulationSlug,
  articulationHint,
  phonemeFromPattern,
} from "@/lib/articulation-mapper";

interface Props {
  /** 음소 한 글자("ㅅ") 또는 오류패턴("ㅅ→ㅌ 대치") — 둘 다 허용 */
  phoneme: string;
  size?: "sm" | "md" | "lg";
  /** 한 줄 조음 안내 캡션 표시 여부 */
  showHint?: boolean;
  className?: string;
}

const SIZE_PX: Record<NonNullable<Props["size"]>, number> = {
  sm: 140,
  md: 200,
  lg: 260,
};

/**
 * 조음 단면도(혀 모양) 컴포넌트.
 *
 * 음소를 슬러그로 매핑해 /images/articulation/{slug}.svg 를 표시.
 * 매핑되는 그림이 없거나(이중모음 등) 로드 실패 시 아무것도 렌더하지 않음(null).
 */
export function ArticulationDiagram({ phoneme, size = "md", showHint = true, className = "" }: Props) {
  const px = SIZE_PX[size];
  const [failed, setFailed] = useState(false);

  // "ㅅ" 단일 자모와 "ㅅ→ㅌ" 오류패턴 모두 지원
  const ph = phoneme.length === 1 ? phoneme : phonemeFromPattern(phoneme);
  const slug = getArticulationSlug(ph);
  if (!slug || failed) return null;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <Image
        src={`/images/articulation/${slug}.svg`}
        alt={`${ph} 발음 혀 모양`}
        width={px}
        height={px}
        onError={() => setFailed(true)}
        className="rounded-2xl"
      />
      {showHint && (
        <p className="text-xs font-semibold text-[#8B7E74] text-center leading-snug px-2">
          <span className="text-[#FFB38A] font-black">{ph}</span> {articulationHint(slug)}
        </p>
      )}
    </div>
  );
}
