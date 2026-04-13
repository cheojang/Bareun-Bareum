import Image from "next/image";

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
 * 없으면 회색 플레이스홀더를 표시합니다.
 *
 * 이미지 추가 방법:
 *   1. /public/images/words/ 폴더에 {slug}.webp 파일 저장
 *   2. word-database.ts 해당 단어에 imageSlug 필드 추가
 *      예) { word: "사과", imageSlug: "sagwa", ... }
 */
export function WordImage({ word, imageSlug, size = "md", className = "" }: Props) {
  const px = SIZE_PX[size];
  const rounded = size === "xl" || size === "lg" ? "rounded-2xl" : "rounded-xl";

  if (!imageSlug) {
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
      className={`object-contain flex-shrink-0 ${rounded} ${className}`}
    />
  );
}
