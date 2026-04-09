"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiEffect({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ["#FFB38A", "#7EDFD0", "#C4B5FD", "#FDE68A", "#FCA5A5"];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        shapes: ["star", "circle"],
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        shapes: ["star", "circle"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [trigger]);

  return null;
}
