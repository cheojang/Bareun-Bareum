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
 *  - 입술 x≈22-56 (렌즈형 사이드 프로파일)
 *  - 윗니 x≈60-82 y=100→140, 아랫니 y=180→220
 *  - 치조(잇몸 융기) x≈85-115 y≈105
 *  - 경구개 아치 → 연구개(x≈270) → 목젖
 *  - 입 바닥 y≈238-258
 *
 * upperLipY / lowerLipY: 음소별 입모양(열린 정도) 제어
 *  - 두 값의 중간이 "입 코너(입꼬리)"
 *  - 격차가 클수록 입이 더 벌어진 모양
 */
function scaffold({ tongue, contact, airflow, upperLipY = 108, lowerLipY = 202 }) {
  return `<svg viewBox="0 0 360 320" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
  <!-- 카드 배경 -->
  <rect width="360" height="320" rx="28" fill="#FFF9F2"/>

  <!-- 얼굴 단면 살 (매끄러운 옆모습) -->
  <path d="M 28 40 Q 130 18 230 30 Q 320 42 330 110
           L 330 240 Q 320 290 240 296 Q 130 304 60 286
           Q 28 276 28 230 Q 25 180 28 130 Z"
        fill="#FFE3CC"/>

  <!-- 구강 내부 — 입술 사이 열린 공간까지 확장 -->
  <path d="M 23 ${upperLipY + 16}
           L 58 ${upperLipY + 12}
           Q 60 106 85 104
           Q 150 62 225 80 Q 272 92 282 122
           L 286 150 Q 290 162 280 168
           L 282 215 Q 270 252 200 256 Q 120 260 88 238 Q 62 224 58 202
           L 58 ${lowerLipY - 12}
           L 23 ${lowerLipY - 16} Z"
        fill="#FFF6F0"/>
  <!-- 입 열린 공간: 바깥(카드 배경)까지 완전히 뚫림 -->
  <path d="M 0 ${upperLipY + 17}
           Q 40 ${upperLipY + 15} 58 ${upperLipY + 13}
           L 58 ${lowerLipY - 13}
           Q 40 ${lowerLipY - 15} 0 ${lowerLipY - 17} Z"
        fill="#FFF9F2"/>

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

  <!-- 입술: 옆에서 본 렌즈형 사이드 프로파일 (발음별 열린 정도) -->
  <!-- 윗입술: 왼쪽(입술 끝)이 뾰족하고 오른쪽(입꼬리)이 연결됨 -->
  <path d="M 56 ${upperLipY + 4}
           Q 46 ${upperLipY - 6} 32 ${upperLipY - 13}
           Q 22 ${upperLipY - 5} 22 ${upperLipY + 2}
           Q 22 ${upperLipY + 9} 32 ${upperLipY + 15}
           Q 46 ${upperLipY + 12} 56 ${upperLipY + 4} Z"
        fill="#FFB59B" stroke="#E8947A" stroke-width="1.5" stroke-linejoin="round"/>
  <!-- 아랫입술 -->
  <path d="M 56 ${lowerLipY - 4}
           Q 46 ${lowerLipY - 12} 32 ${lowerLipY - 15}
           Q 22 ${lowerLipY - 9} 22 ${lowerLipY - 2}
           Q 22 ${lowerLipY + 5} 32 ${lowerLipY + 13}
           Q 46 ${lowerLipY + 6} 56 ${lowerLipY - 4} Z"
        fill="#FFB59B" stroke="#E8947A" stroke-width="1.5" stroke-linejoin="round"/>
  <!-- 혀 (음소별) — 입 바닥과 분리된 자연스러운 위치 -->
  ${tongue}

  <!-- 접촉/근접 포인트 표시 -->
  ${contact ?? ""}

  <!-- 공기 흐름 -->
  ${airflow ?? ""}

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
  // ㄹ (치조 탄설음): 혀끝이 치조에 톡 닿음 — 혀 앞부분만 올라가고 나머지는 중간 높이
  rieul: scaffold({
    label: "ㄹ",
    labelKo: "혀끝을 윗잇몸에 톡!",
    upperLipY: 108,   // 살짝 열린 입 (자연스런 발화 자세)
    lowerLipY: 198,
    tongue: `
      <!-- 혀몸통: 입 바닥(y≈238)보다 위에 떠 있어 혀 아래 공간이 보임 -->
      <path d="M 103 118
               Q 115 124 132 152
               Q 150 182 185 198
               Q 220 210 252 218
               Q 262 228 256 240
               Q 216 236 166 230
               Q 123 220 101 206
               Q 89 190 89 156
               Q 90 130 101 120 Z"
            fill="#FF9B8A" stroke="#E8705F" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- 혀 등면 하이라이트 -->
      <path d="M 108 150 Q 146 186 188 202" fill="none" stroke="#FFFFFF"
            stroke-width="2.5" opacity="0.4" stroke-linecap="round"/>`,
    contact: sparkle(106, 100),
  }),

  // ㅅ (치조 마찰음): 혀가 편평하게 올라와 좁은 틈으로 바람
  siot: scaffold({
    label: "ㅅ",
    labelKo: "살짝 틈으로 바람 스─",
    upperLipY: 108,
    lowerLipY: 205,   // ㄹ보다 약간 더 열린 입 (마찰음 발화 시)
    tongue: `
      <!-- 혀몸통: 편평하게 앞쪽이 높이 올라와 있고 입 바닥과 공간 유지 -->
      <path d="M 90 196
               Q 92 168 110 148
               Q 130 132 161 130
               Q 192 132 213 148
               Q 245 172 256 210
               Q 260 222 252 234
               Q 212 228 162 222
               Q 118 214 95 202
               Q 88 200 90 196 Z"
            fill="#FF9B8A" stroke="#E8705F" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- 혀 등면 하이라이트 -->
      <path d="M 114 166 Q 152 152 198 164" fill="none" stroke="#FFFFFF"
            stroke-width="2.5" opacity="0.4" stroke-linecap="round"/>`,
    // 혓날과 잇몸 사이 좁은 틈 표시 (노란 선)
    contact: `<g stroke="#FFC93D" stroke-width="3.5" stroke-linecap="round">
        <path d="M 126 114 L 133 125"/>
        <path d="M 142 110 L 148 122"/>
      </g>`,
    airflow: airflowOut(155),
  }),
};

for (const [slug, svg] of Object.entries(PHONEMES)) {
  writeFileSync(join(OUT_DIR, `${slug}.svg`), svg);
  // 미리보기 PNG (확인용)
  await sharp(Buffer.from(svg), { density: 160 }).resize(480, 427).png()
    .toFile(join(OUT_DIR, `_preview-${slug}.png`));
  console.log(`✓ ${slug}.svg`);
}
