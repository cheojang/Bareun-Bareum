"use client";

import { SoriMascot } from "@/components/ui/SoriMascot";

interface Props {
  level: number;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

const LEVEL_CONFIG = [
  { label: "아기 소리새",   badgeColor: "#FFD4B8", glowColor: "rgba(255,212,184,0.4)", extra: null },
  { label: "꼬마 소리새",   badgeColor: "#FFB38A", glowColor: "rgba(255,179,138,0.4)", extra: null },
  { label: "소리새",        badgeColor: "#7EDFD0", glowColor: "rgba(126,223,208,0.45)", extra: null },
  { label: "빛나는 소리새", badgeColor: "#C4B5FD", glowColor: "rgba(196,181,253,0.5)",  extra: "✨" },
  { label: "전설의 소리새", badgeColor: "#FDE68A", glowColor: "rgba(253,230,138,0.55)", extra: "👑" },
];

const SIZE_PX = { sm: 72, md: 96, lg: 140 };

export function MascotCharacter({ level, animated = false, size = "md" }: Props) {
  const cfg = LEVEL_CONFIG[Math.min(level - 1, 4)];
  const px = SIZE_PX[size];

  return (
    <div className={`flex flex-col items-center gap-2 ${animated ? "animate-float" : ""}`}>
      {/* Glow ring behind bird */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute rounded-full"
          style={{
            width: px + 20,
            height: px + 20,
            background: `radial-gradient(circle, ${cfg.glowColor} 0%, transparent 70%)`,
          }}
        />

        {/* Level-5 crown above */}
        {cfg.extra === "👑" && (
          <span
            className="absolute text-2xl animate-float"
            style={{ top: -28, zIndex: 1 }}
          >
            👑
          </span>
        )}

        {/* Level-4 sparkle */}
        {cfg.extra === "✨" && (
          <>
            <span className="absolute text-lg animate-float" style={{ top: -6, left: -8, animationDelay: "0s" }}>✨</span>
            <span className="absolute text-sm animate-float" style={{ bottom: 0, right: -10, animationDelay: "0.6s" }}>✨</span>
          </>
        )}

        {/* The bird */}
        <SoriMascot size={px} variant="full" animated={animated} />
      </div>

      {/* Level badge */}
      <div
        className="px-3 py-1 rounded-full text-xs font-black"
        style={{
          backgroundColor: cfg.badgeColor,
          color: "#3D3530",
          boxShadow: `0 2px 8px ${cfg.glowColor}`,
        }}
      >
        Lv.{level} {cfg.label}
      </div>
    </div>
  );
}
