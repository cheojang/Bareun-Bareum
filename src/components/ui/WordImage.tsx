"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  word: string;
  imageSlug?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_PX: Record<NonNullable<Props["size"]>, number> = {
  xs: 32,
  sm: 48,
  md: 80,
  lg: 120,
  xl: 160,
};

/**
 * 단어 이미지 컴포넌트.
 *
 * imageSlug가 있으면 /images/words/{slug}.webp 를 표시하고,
 * 없거나(미지정) 파일 로드에 실패하면 회색 플레이스홀더를 표시합니다.
 * → 이미지가 아직 생성되지 않았어도 깨진 이미지 대신 회색으로 우아하게 폴백.
 *
 * 이미지 추가 방법:
 *   1. /public/images/words/ 폴더에 {slug}.webp 파일 저장
 *      (npm run generate:word-images 로 일괄 생성)
 *   2. src/lib/word-images.ts WORD_IMAGE_SLUGS 에 단어→슬러그 매핑 추가
 */
export function WordImage({ word, imageSlug, size = "md", className = "" }: Props) {
  const px = SIZE_PX[size];
  const rounded = size === "xl" || size === "lg" ? "rounded-2xl" : "rounded-xl";
  const [failed, setFailed] = useState(false);

  if (!imageSlug || failed) {
    return (
      <div
        className={`bg-gray-100 flex-shrink-0 ${rounded} ${className}`}
        style={{ width: px, height: px }}
        aria-label={word}
      />
    );
  }

  return (
    <Image
      src={`/images/words/${imageSlug}.webp`}
      alt={word}
      width={px}
      height={px}
      onError={() => setFailed(true)}
      className={`object-contain flex-shrink-0 ${rounded} ${className}`}
    />
  );
}
