import { HTMLAttributes } from "react";

interface BubbleCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
  color?: "white" | "peach" | "mint" | "lavender" | "yellow";
}

const colorStyles = {
  white: "bg-white",
  peach: "bg-[#FFF5EE]",
  mint: "bg-[#F0FAF8]",
  lavender: "bg-[#F5F3FF]",
  yellow: "bg-[#FFFBEB]",
};

// 아이마음 톤: 카드 내부 여백을 살짝 정돈 (md 24→20, lg 32→24)
const paddingStyles = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function BubbleCard({
  padding = "md",
  color = "white",
  className = "",
  children,
  ...props
}: BubbleCardProps) {
  return (
    <div
      className={`
        bubble-card
        ${colorStyles[color]}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
