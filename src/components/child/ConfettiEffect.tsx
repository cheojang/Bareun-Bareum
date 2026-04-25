"use client";

import { useEffect, useState } from "react";

const COLORS = ["#FFB38A", "#7EDFD0", "#C4B5FD", "#FDE68A", "#FCA5A5"];

/**
 * 끊김 없는 1회성 폭죽 효과 (CSS 기반)
 * canvas-confetti 대비 GPU 가속 + 단발 애니메이션이라 부담 적음
 */
export function ConfettiEffect({ trigger }: { trigger: boolean }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setActive(true);
    const t = setTimeout(() => setActive(false), 1100);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="relative w-0 h-0">
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i * (360 / 14)) * (Math.PI / 180);
          const distance = 160 + (i % 3) * 30;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          return (
            <span
              key={i}
              className="confetti-particle"
              style={{
                ["--tx" as string]: `${x}px`,
                ["--ty" as string]: `${y}px`,
                background: COLORS[i % COLORS.length],
                animationDelay: `${i * 15}ms`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
