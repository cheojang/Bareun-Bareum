"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  word: string;
  imageSlug?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  /**
   * 0~1 색칠 진행도. 지정하면 흑백 그림 위로 컬러가 아래에서 위로 차오릅니다
   * (복습 "그림 색칠하기" 효과). undefined면 평소처럼 항상 풀컬러로 표시.
   */
  reveal?: number;
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
 * 없거나(미지정) 파일 로드에 실패하면 아무것도 렌더하지 않습니다(null).
 * → 회색 빈 박스를 띄우지 않음. 이미지가 보장된 유사패턴 단어에서만 그림이 보임.
 *
 * 이미지 추가 방법:
 *   1. /public/images/words/ 폴더에 {slug}.webp 파일 저장
 *      (npm run generate:word-images 로 일괄 생성)
 *   2. src/lib/word-images.ts WORD_IMAGE_SLUGS 에 단어→슬러그 매핑 추가
 */
export function WordImage({ word, imageSlug, size = "md", className = "", reveal }: Props) {
  const px = SIZE_PX[size];
  const rounded = size === "xl" || size === "lg" ? "rounded-2xl" : "rounded-xl";
  const [failed, setFailed] = useState(false);
  const src = `/images/words/${imageSlug}.webp`;

  // 이미지가 없거나 로드 실패 시 회색 박스 대신 아무것도 안 그림
  if (!imageSlug || failed) return null;

  // ── 색칠 모드 ─────────────────────────────────────────────────────────────
  // 흑백 베이스 위에 같은 그림(컬러)을 겹쳐, 아래에서 위로 차오르도록 clip.
  // 같은 URL이라 네트워크 요청은 1번(브라우저 캐시).
  if (reveal !== undefined) {
    const r = Math.max(0, Math.min(1, reveal));
    const filled = r >= 0.999;
    return (
      <div
        className={`relative flex-shrink-0 ${rounded} ${filled ? "wordimg-pop" : ""} ${className}`}
        style={{ width: px, height: px }}
      >
        {/* 베이스: 흑백·흐림 (아직 못 채운 부분) */}
        <Image
          src={src}
          alt={word}
          width={px}
          height={px}
          onError={() => setFailed(true)}
          className={`object-contain ${rounded}`}
          style={{ filter: "grayscale(1) opacity(0.4)" }}
        />
        {/* 오버레이: 컬러 — 아래에서 위로 차오름 */}
        <div
          className="absolute inset-0 transition-[clip-path] duration-500 ease-out"
          style={{ clipPath: `inset(${(1 - r) * 100}% 0 0 0)` }}
        >
          <Image
            src={src}
            alt=""
            aria-hidden
            width={px}
            height={px}
            className={`object-contain ${rounded}`}
          />
          {/* 채워지는 경계선 반짝임 */}
          {r > 0 && r < 1 && (
            <div
              className="absolute left-0 right-0 h-1.5 bg-white/70 blur-[2px]"
              style={{ top: `${(1 - r) * 100}%` }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={word}
      width={px}
      height={px}
      onError={() => setFailed(true)}
      className={`object-contain flex-shrink-0 ${rounded} ${className}`}
    />
  );
}
