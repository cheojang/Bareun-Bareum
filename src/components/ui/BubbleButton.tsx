"use client";

import { ButtonHTMLAttributes, CSSProperties, forwardRef } from "react";

interface BubbleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "peach" | "mint" | "lavender" | "white" | "ghost" | "gray";
  size?: "sm" | "md" | "lg" | "xl";
}

const variantStyles = {
  peach: "bg-[#FFB38A] hover:bg-[#FFA070] text-white",
  mint: "bg-[#7EDFD0] hover:bg-[#5CCFC0] text-white",
  lavender: "bg-[#C4B5FD] hover:bg-[#A899FB] text-white",
  white: "bg-white hover:bg-gray-50 text-[#3D3530] border-2 border-[#F0E8E0]",
  ghost: "bg-transparent hover:bg-[#FFF5EE] text-[#8B7E74]",
  gray: "bg-[#F0E8E0] hover:bg-[#E0D8D0] text-[#8B7E74]",
};

// 색이 있는 variant는 자기 색으로 은은하게 빛나는 그림자를 갖는다 (버튼마다 다른 회색 그림자 대신)
const glowShadow: Partial<Record<keyof typeof variantStyles, { base: string; hover: string }>> = {
  peach: { base: "var(--shadow-glow-peach)", hover: "var(--shadow-glow-peach-hover)" },
  mint: { base: "var(--shadow-glow-mint)", hover: "var(--shadow-glow-mint-hover)" },
  lavender: { base: "var(--shadow-glow-lavender)", hover: "var(--shadow-glow-lavender-hover)" },
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
  xl: "px-10 py-5 text-xl",
};

export const BubbleButton = forwardRef<HTMLButtonElement, BubbleButtonProps>(
  ({ variant = "peach", size = "md", className = "", children, disabled, style, ...props }, ref) => {
    const glow = glowShadow[variant];
    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{
          ...(glow
            ? ({ "--btn-shadow": glow.base, "--btn-shadow-hover": glow.hover } as CSSProperties)
            : {}),
          ...style,
        }}
        className={`
          bubble-btn font-bold rounded-full whitespace-nowrap
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

BubbleButton.displayName = "BubbleButton";
