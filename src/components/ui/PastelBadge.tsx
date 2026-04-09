import { HTMLAttributes } from "react";

interface PastelBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: "peach" | "mint" | "lavender" | "yellow" | "pink";
}

const colorStyles = {
  peach: "bg-[#FFD4B8] text-[#B05020]",
  mint: "bg-[#B8EDE3] text-[#1A7060]",
  lavender: "bg-[#EDE9FE] text-[#6D28D9]",
  yellow: "bg-[#FDE68A] text-[#92400E]",
  pink: "bg-[#FECACA] text-[#991B1B]",
};

export function PastelBadge({
  color = "peach",
  className = "",
  children,
  ...props
}: PastelBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-3 py-1 rounded-full text-sm font-semibold
        ${colorStyles[color]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
