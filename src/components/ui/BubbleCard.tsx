import { HTMLAttributes } from "react";

interface BubbleCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
  color?: "white" | "peach" | "mint" | "lavender" | "yellow";
}

const colorStyles = {
  white: "bg-white/85",
  peach: "bg-[#FFF5EE]",
  mint: "bg-[#F0FAF8]",
  lavender: "bg-[#F5F3FF]",
  yellow: "bg-[#FFFBEB]",
};

const paddingStyles = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
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
