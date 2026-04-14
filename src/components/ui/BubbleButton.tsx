"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

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

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
  xl: "px-10 py-5 text-xl",
};

export const BubbleButton = forwardRef<HTMLButtonElement, BubbleButtonProps>(
  ({ variant = "peach", size = "md", className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          bubble-btn font-bold rounded-full
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
