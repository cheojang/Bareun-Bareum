// 조음 위치 단면도 생성 — 옆모습 구강 단면 (아동용 파스텔 스타일)
// 사용: node scripts/generate-articulation-svgs.mjs → public/images/articulation/*.svg + 미리보기 PNG
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public", "images", "articulation");
mkdirSync(OUT_DIR, { recursive: true });

/**
 * 공통 골격: 왼쪽을 보는 옆모습 구강 단면.
 * 좌표계 (viewBox 0 0 360 320):
 *  - 입술 x≈40, 윗니 x≈62-82 (y105→140), 아랫니 (y185→215)
 *  - 치조(잇몸 융기) x≈85-115 y≈105
 *  - 경구개 아치 → 연구개(x≈270) → 목젖
 *  - 입 바닥 y≈215-245
 */
function scaffold({ tongue, contact, airflow, label, labelKo }) {
  return `<svg viewBox="0 0 360 320" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
  <!-- 카드 배경 -->
  <rect width="360" height="320" rx="28" fill="#FFF9F2"/>

  <!-- 얼굴 단면 살 (입 주변) -->
  <path d="M 30 40
           Q 130 18 230 30 Q 320 42 330 110
           L 330 240 Q 320 290 240 296 Q 130 304 60 286
           Q 28 276 30 230
           L 42 218 Q 30 205 32 190 L 44 165 Q 30 150 32 132 L 30 40 Z"
        fill="#FFE3CC"/>

  <!-- 구강 내부 (입 안 공간) -->
  <path d="M 50 122
           Q 60 106 85 104
           Q 150 62 225 80 Q 272 92 282 122
           L 286 150 Q 290 162 280 168
           L 282 215 Q 270 252 200 256 Q 120 260 88 238 Q 62 224 58 202 Z"
        fill="#FFF6F0"/>

  <!-- 입천장: 치조 융기 + 경구개 + 연구개/목젖 -->
  <path d="M 85 104 Q 96 96 108 104 Q 116 110 126 104
           Q 170 72 225 84 Q 266 94 278 120"
        fill="none" stroke="#E8A988" stroke-width="7" stroke-linecap="round"/>
  <!-- 목젖 -->
  <path d="M 278 120 Q 288 138 280 156 Q 276 166 282 174"
        fill="none" stroke="#E8A988" stroke-width="7" stroke-linecap="round"/>

  <!-- 입 바닥/아래턱 -->
  <path d="M 88 238 Q 150 258 230 250 Q 268 244 280 218"
        fill="none" stroke="#E8A988" stroke-width="7" stroke-linecap="round"/>

  <!-- 윗니 / 아랫니 -->
  <rect x="60" y="100" width="22" height="40" rx="9" fill="#FFFFFF" stroke="#E5D8CC" stroke-width="2.5"/>
  <rect x="60" y="180" width="22" height="40" rx="9" fill="#FFFFFF" stroke="#E5D8CC" stroke-width="2.5"/>

  <!-- 입술 -->
  <ellipse cx="48" cy="103" rx="14" ry="13" fill="#FFB59B"/>
  <ellipse cx="48" cy="218" rx="14" ry="13" fill="#FFB59B"/>

  <!-- 혀 (음소별) -->
  ${tongue}

  <!-- 접촉/근접 포인트 표시 -->
  ${contact ?? ""}

  <!-- 공기 흐름 -->
  ${airflow ?? ""}

  <!-- 라벨 -->
  <g>
    <rect x="252" y="244" width="84" height="56" rx="18" fill="#FFFFFF" stroke="#F0E2D6" stroke-width="2"/>
    <text x="294" y="274" text-anchor="middle" font-size="26" font-weight="900" fill="#3D3530">${label}</text>
    <text x="294" y="292" text-anchor="middle" font-size="11" font-weight="700" fill="#A89B8E">${labelKo}</text>
  </g>
</svg>`;
}

// 반짝이 접촉 포인트 (혀가 닿는 곳)
const sparkle = (x, y) => `
  <circle cx="${x}" cy="${y}" r="13" fill="#FFD93D" opacity="0.35"/>
  <circle cx="${x}" cy="${y}" r="6" fill="#FFC93D"/>
  <path d="M ${x} ${y - 22} l 2.6 6.5 6.9 0.6 -5.2 4.6 1.6 6.8 -5.9 -3.7 -5.9 3.7 1.6 -6.8 -5.2 -4.6 6.9 -0.6 Z"
        fill="#FFB38A" transform="translate(0,-6)"/>`;

// 파란 바람 화살표 (마찰음 기류)
const airflowOut = (y) => `
  <g stroke="#6FBDE8" stroke-width="5" fill="none" stroke-linecap="round">
    <path d="M 92 ${y} Q 78 ${y - 6} 64 ${y} Q 50 ${y + 6} 36 ${y}"/>
  </g>
  <path d="M 38 ${y - 9} L 20 ${y} L 38 ${y + 9} Z" fill="#6FBDE8"/>`;

const PHONEMES = {
  // ㄹ (초성·치조 탄설음): 혀끝이 윗잇몸(치조)을 가볍게 톡 — 끝이 올라간 혀
  rieul: scaffold({
    label: "ㄹ",
    labelKo: "혀끝을 윗잇몸에 톡!",
    tongue: `
      <path d="M 118 232
               Q 96 196 98 150
               Q 99 124 108 112
               Q 114 104 122 110
               Q 128 116 126 132
               Q 138 178 188 196
               Q 238 210 258 234
               Q 230 252 178 252
               Q 136 250 118 232 Z"
            fill="#FF9B8A" stroke="#E8705F" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 112 150 Q 120 190 165 206" fill="none" stroke="#E8705F"
            stroke-width="3" opacity="0.45" stroke-linecap="round"/>`,
    contact: sparkle(112, 100),
  }),

  // ㅅ (치조 마찰음): 혀끝은 아랫니 뒤, 혓날이 잇몸에 가까이 — 좁은 틈으로 바람
  siot: scaffold({
    label: "ㅅ",
    labelKo: "살짝 틈으로 바람 스─",
    tongue: `
      <path d="M 92 196
               Q 96 172 116 152
               Q 138 134 162 134
               Q 186 136 206 152
               Q 240 176 258 232
               Q 226 252 174 252
               Q 120 250 100 228
               Q 90 214 92 196 Z"
            fill="#FF9B8A" stroke="#E8705F" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 116 170 Q 150 156 192 166" fill="none" stroke="#E8705F"
            stroke-width="3" opacity="0.45" stroke-linecap="round"/>`,
    // 혓날과 잇몸 사이 좁은 틈 표시
    contact: `<g stroke="#FFC93D" stroke-width="4" stroke-linecap="round">
        <path d="M 128 116 L 136 126"/>
        <path d="M 144 112 L 150 124"/>
      </g>`,
    airflow: airflowOut(150),
  }),
};

for (const [slug, svg] of Object.entries(PHONEMES)) {
  writeFileSync(join(OUT_DIR, `${slug}.svg`), svg);
  // 미리보기 PNG (확인용)
  await sharp(Buffer.from(svg), { density: 160 }).resize(480, 427).png()
    .toFile(join(OUT_DIR, `_preview-${slug}.png`));
  console.log(`✓ ${slug}.svg`);
}
