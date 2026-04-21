"use client";

import { useId } from "react";

/**
 * 소리새 (Sori-sae) — 바른발음 마스코트
 * 몽글몽글 파랑새: round, fluffy, pastel blue bird
 * Animations: floating, blinking, wing flutter
 */

interface Props {
  /** Width in px — height scales proportionally */
  size?: number;
  /** "full" = whole bird  |  "logo" = head crop (tighter, for nav) */
  variant?: "full" | "logo";
  /** Enable float / blink / wing animations */
  animated?: boolean;
  className?: string;
}

// ViewBox for each variant
const VIEWBOXES = {
  full: "0 0 120 142",
  logo: "-4 2 128 100",   // crops to head + tuft, no feet
};

const ASPECT = {
  full: 142 / 120,
  logo: 100 / 128,
};

export function SoriMascot({
  size = 80,
  variant = "full",
  animated = true,
  className = "",
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const height = Math.round(size * ASPECT[variant]);
  const animClass = animated ? "bird-animated" : "";

  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{ width: size, height, flexShrink: 0 }}
    >
      <svg
        viewBox={VIEWBOXES[variant]}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={height}
        style={{ overflow: "visible", display: "block" }}
        aria-label="소리새 마스코트"
        role="img"
      >
        {/* ── Embedded animation styles ─────────────────────────── */}
        <defs>
          <style>{`
            @keyframes birdblink {
              0%, 87%, 100% { transform: scaleY(1); }
              93%            { transform: scaleY(0.05); }
              96%            { transform: scaleY(1); }
            }
            @keyframes wingL {
              0%, 100% { transform: rotate(-7deg); }
              50%      { transform: rotate(14deg); }
            }
            @keyframes wingR {
              0%, 100% { transform: rotate(7deg); }
              50%      { transform: rotate(-14deg); }
            }
            .bird-animated .bird-eye-l {
              transform-box: fill-box;
              transform-origin: 50% 50%;
              animation: birdblink 4.2s ease-in-out infinite;
            }
            .bird-animated .bird-eye-r {
              transform-box: fill-box;
              transform-origin: 50% 50%;
              animation: birdblink 4.2s ease-in-out infinite 0.05s;
            }
            .bird-animated .wing-l {
              transform-box: fill-box;
              transform-origin: 95% 40%;
              animation: wingL 1.9s ease-in-out infinite;
            }
            .bird-animated .wing-r {
              transform-box: fill-box;
              transform-origin: 5% 40%;
              animation: wingR 1.9s ease-in-out infinite;
            }
          `}</style>

          {/* Soft radial gradient for body */}
          <radialGradient id={`bodyGrad-${uid}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#D5EEFB" />
            <stop offset="100%" stopColor="#8DC8EC" />
          </radialGradient>
          <radialGradient id={`headGrad-${uid}`} cx="38%" cy="32%" r="62%">
            <stop offset="0%" stopColor="#E4F4FD" />
            <stop offset="100%" stopColor="#A2D3F0" />
          </radialGradient>
          <radialGradient id={`wingGrad-${uid}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#B8E0F7" />
            <stop offset="100%" stopColor="#6EB8E2" />
          </radialGradient>
          <radialGradient id={`irisL-${uid}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#2A5FA8" />
            <stop offset="100%" stopColor="#0D2D5C" />
          </radialGradient>
          <radialGradient id={`irisR-${uid}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#2A5FA8" />
            <stop offset="100%" stopColor="#0D2D5C" />
          </radialGradient>

          {/* Drop shadow filter */}
          <filter id={`softShadow-${uid}`} x="-20%" y="-10%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#7AACCC" floodOpacity="0.22" />
          </filter>
        </defs>

        <g className={animClass}>

          {/* ── Ground shadow ─────────────────────────────────────── */}
          {variant === "full" && (
            <ellipse cx="60" cy="139" rx="28" ry="5"
              fill="rgba(90,140,180,0.13)" />
          )}

          {/* ── Left wing (behind body) ───────────────────────────── */}
          {variant === "full" && (
            <g className="wing-l">
              <ellipse cx="20" cy="95" rx="24" ry="15" fill={`url(#wingGrad-${uid})`}
                transform="rotate(-22 20 95)" />
              {/* Wing tip highlight */}
              <ellipse cx="14" cy="99" rx="11" ry="7" fill="#C8E8F8" opacity="0.55"
                transform="rotate(-22 14 99)" />
              {/* Wing feather lines */}
              <path d="M8,102 Q14,88 24,86" stroke="#5AAAD8" strokeWidth="1.2"
                fill="none" opacity="0.4" strokeLinecap="round" />
              <path d="M10,107 Q16,95 26,93" stroke="#5AAAD8" strokeWidth="1"
                fill="none" opacity="0.3" strokeLinecap="round" />
            </g>
          )}

          {/* ── Right wing (behind body) ──────────────────────────── */}
          {variant === "full" && (
            <g className="wing-r">
              <ellipse cx="100" cy="95" rx="24" ry="15" fill={`url(#wingGrad-${uid})`}
                transform="rotate(22 100 95)" />
              <ellipse cx="106" cy="99" rx="11" ry="7" fill="#C8E8F8" opacity="0.55"
                transform="rotate(22 106 99)" />
              <path d="M112,102 Q106,88 96,86" stroke="#5AAAD8" strokeWidth="1.2"
                fill="none" opacity="0.4" strokeLinecap="round" />
              <path d="M110,107 Q104,95 94,93" stroke="#5AAAD8" strokeWidth="1"
                fill="none" opacity="0.3" strokeLinecap="round" />
            </g>
          )}

          {/* ── Body ──────────────────────────────────────────────── */}
          {variant === "full" && (
            <>
              <ellipse cx="60" cy="102" rx="40" ry="34"
                fill={`url(#bodyGrad-${uid})`} filter={`url(#softShadow-${uid})`} />
              {/* Belly (soft white area) */}
              <ellipse cx="60" cy="110" rx="26" ry="21" fill="#EEF8FE" opacity="0.65" />
            </>
          )}

          {/* ── Head ──────────────────────────────────────────────── */}
          <circle cx="60" cy="52" r="40"
            fill={`url(#headGrad-${uid})`}
            filter={variant === "logo" ? `url(#softShadow-${uid})` : undefined}
          />

          {/* Head gloss highlight */}
          <ellipse cx="46" cy="32" rx="17" ry="13" fill="white" opacity="0.2"
            transform="rotate(-15 46 32)" />

          {/* ── Crown feathers ─────────────────────────────────────── */}
          {/* Far-left tuft */}
          <ellipse cx="40" cy="15" rx="5.5" ry="12" fill="#8DC8EC"
            transform="rotate(-28 40 15)" />
          {/* Left-center tuft */}
          <ellipse cx="52" cy="10" rx="6" ry="14" fill="#A2D3F0"
            transform="rotate(-10 52 10)" />
          {/* Center tuft (tallest) */}
          <ellipse cx="60" cy="8" rx="6.5" ry="15" fill="#B8E0F7" />
          {/* Right-center tuft */}
          <ellipse cx="68" cy="10" rx="6" ry="14" fill="#A2D3F0"
            transform="rotate(10 68 10)" />
          {/* Far-right tuft */}
          <ellipse cx="80" cy="15" rx="5.5" ry="12" fill="#8DC8EC"
            transform="rotate(28 80 15)" />

          {/* ── Left eye ──────────────────────────────────────────── */}
          <g className="bird-eye-l">
            {/* Sclera (white) */}
            <circle cx="43" cy="49" r="13.5" fill="white" />
            {/* Iris */}
            <circle cx="45" cy="50" r="9.5" fill={`url(#irisL-${uid})`} />
            {/* Main highlight (big) */}
            <circle cx="40" cy="46" r="4" fill="white" />
            {/* Secondary highlight */}
            <circle cx="49" cy="53" r="2" fill="white" opacity="0.5" />
          </g>

          {/* ── Right eye ─────────────────────────────────────────── */}
          <g className="bird-eye-r">
            <circle cx="77" cy="49" r="13.5" fill="white" />
            <circle cx="79" cy="50" r="9.5" fill={`url(#irisR-${uid})`} />
            <circle cx="74" cy="46" r="4" fill="white" />
            <circle cx="83" cy="53" r="2" fill="white" opacity="0.5" />
          </g>

          {/* ── Beak ──────────────────────────────────────────────── */}
          {/* Main beak shape — small rounded triangle */}
          <path
            d="M51,65 Q55,62 60,63 Q65,62 69,65 Q64,75 60,76 Q56,75 51,65Z"
            fill="#FFB38A"
          />
          {/* Beak groove line */}
          <path d="M51,65 Q60,68 69,65" stroke="#E8895A" strokeWidth="1.2"
            fill="none" opacity="0.5" strokeLinecap="round" />
          {/* Beak shine */}
          <ellipse cx="56" cy="66" rx="4" ry="2.5" fill="white" opacity="0.25"
            transform="rotate(-15 56 66)" />

          {/* ── Cheek blushes ──────────────────────────────────────── */}
          <circle cx="26" cy="60" r="13" fill="#FFAAAA" opacity="0.28" />
          <circle cx="94" cy="60" r="13" fill="#FFAAAA" opacity="0.28" />

          {/* ── Feet ──────────────────────────────────────────────── */}
          {variant === "full" && (
            <>
              {/* Left leg */}
              <line x1="48" y1="131" x2="48" y2="136"
                stroke="#FFB38A" strokeWidth="4.5" strokeLinecap="round" />
              {/* Left toes */}
              <line x1="48" y1="136" x2="38" y2="140"
                stroke="#FFB38A" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="48" y1="136" x2="48" y2="141"
                stroke="#FFB38A" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="48" y1="136" x2="57" y2="140"
                stroke="#FFB38A" strokeWidth="3.5" strokeLinecap="round" />

              {/* Right leg */}
              <line x1="72" y1="131" x2="72" y2="136"
                stroke="#FFB38A" strokeWidth="4.5" strokeLinecap="round" />
              {/* Right toes */}
              <line x1="72" y1="136" x2="63" y2="140"
                stroke="#FFB38A" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="72" y1="136" x2="72" y2="141"
                stroke="#FFB38A" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="72" y1="136" x2="82" y2="140"
                stroke="#FFB38A" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

        </g>
      </svg>
    </div>
  );
}

/** Compact inline logo — head only, no animation, tight crop */
export function SoriLogo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <SoriMascot
      size={size}
      variant="logo"
      animated={false}
      className={className}
    />
  );
}
