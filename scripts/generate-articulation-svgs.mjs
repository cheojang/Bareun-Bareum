// 조음 위치 단면도 생성 — 옆모습 구강 단면 (아동용 파스텔 스타일)
// 사용: node scripts/generate-articulation-svgs.mjs → public/images/articulation/*.svg + 미리보기 PNG
//
// 한국어 자음 19개를 "조음 위치 × 방법"으로 묶어 표현:
//   양순음(ㅂㅍㅃ/ㅁ) · 치조음(ㄷㅌㄸ/ㄴ/ㅅㅆ/ㄹ) · 경구개음(ㅈㅊㅉ) · 연구개음(ㄱㅋㄲ/ㅇ) · 성문음(ㅎ)
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public", "images", "articulation");
mkdirSync(OUT_DIR, { recursive: true });

/**
 * 공통 골격: 왼쪽을 보는 옆모습 구강 단면.
 * 좌표계 (viewBox 0 0 360 320):
 *  - 입술 x≈22-58 (렌즈형 사이드 프로파일)
 *  - 윗니 x≈60-82 y=100→140, 아랫니 y=180→220
 *  - 치조(잇몸 융기) x≈85-115 y≈105
 *  - 경구개 아치 x≈126-225 (y≈72-84) → 연구개 x≈225-278 → 목젖 x≈280
 *  - 입 바닥 y≈238-258
 *
 * lipState: "open"(벌린 입) | "closed"(다문 입 — 양순음)
 * upperLipY / lowerLipY: open일 때 입 열린 정도 제어
 */
function scaffold({ tongue, contact, airflow, upperLipY = 108, lowerLipY = 202, lipState = "open" }) {
  const cy = Math.round((upperLipY + lowerLipY) / 2); // 입 중심 (원순/다문용)

  // 입 열린 빈 공간(바깥까지 뚫림)
  let gapFill = "";
  if (lipState === "open") {
    gapFill = `<path d="M 0 ${upperLipY + 17}
               Q 40 ${upperLipY + 15} 58 ${upperLipY + 13}
               L 58 ${lowerLipY - 13}
               Q 40 ${lowerLipY - 15} 0 ${lowerLipY - 17} Z"
            fill="#FFF9F2"/>`;
  } else if (lipState === "rounded") {
    // 오므린 입은 앞쪽 작은 구멍만 뚫림
    gapFill = `<path d="M 0 ${cy - 8} L 58 ${cy - 6} L 58 ${cy + 6} L 0 ${cy + 8} Z" fill="#FFF9F2"/>`;
  }

  let lips;
  if (lipState === "open") {
    lips = `<!-- 윗입술 -->
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
             fill="#FFB59B" stroke="#E8947A" stroke-width="1.5" stroke-linejoin="round"/>`;
  } else if (lipState === "rounded") {
    // 오므린 입술 (원순모음 ㅗㅜ) — 앞으로 쭉 나와 작은 구멍
    lips = `<!-- 윗입술 (오므림) -->
       <path d="M 58 ${cy - 13} Q 40 ${cy - 20} 22 ${cy - 17}
                Q 9 ${cy - 12} 12 ${cy - 5} Q 26 ${cy - 8} 58 ${cy - 7} Z"
             fill="#FFB59B" stroke="#E8947A" stroke-width="1.5" stroke-linejoin="round"/>
       <!-- 아랫입술 (오므림) -->
       <path d="M 58 ${cy + 13} Q 40 ${cy + 20} 22 ${cy + 17}
                Q 9 ${cy + 12} 12 ${cy + 5} Q 26 ${cy + 8} 58 ${cy + 7} Z"
             fill="#FFB59B" stroke="#E8947A" stroke-width="1.5" stroke-linejoin="round"/>`;
  } else {
    lips = `<!-- 다문 입술 (양순음 — 위아래 입술이 y≈155에서 맞붙음) -->
       <path d="M 58 155 Q 46 142 31 136 Q 20 145 21 155 Q 34 155 58 155 Z"
             fill="#FFB59B" stroke="#E8947A" stroke-width="1.5" stroke-linejoin="round"/>
       <path d="M 58 155 Q 46 168 31 174 Q 20 165 21 155 Q 34 155 58 155 Z"
             fill="#FFB59B" stroke="#E8947A" stroke-width="1.5" stroke-linejoin="round"/>
       <path d="M 22 155 L 56 155" stroke="#E8947A" stroke-width="2.5" stroke-linecap="round"/>`;
  }

  return `<svg viewBox="0 0 360 320" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
  <!-- 카드 배경 -->
  <rect width="360" height="320" rx="28" fill="#FFF9F2"/>

  <!-- 얼굴 단면 살 (매끄러운 옆모습) -->
  <path d="M 28 40 Q 130 18 230 30 Q 320 42 330 110
           L 330 240 Q 320 290 240 296 Q 130 304 60 286
           Q 28 276 28 230 Q 25 180 28 130 Z"
        fill="#FFE3CC"/>

  <!-- 구강 내부 -->
  <path d="M 23 ${upperLipY + 16}
           L 58 ${upperLipY + 12}
           Q 60 106 85 104
           Q 150 62 225 80 Q 272 92 282 122
           L 286 150 Q 290 162 280 168
           L 282 215 Q 270 252 200 256 Q 120 260 88 238 Q 62 224 58 202
           L 58 ${lowerLipY - 12}
           L 23 ${lowerLipY - 16} Z"
        fill="#FFF6F0"/>
  ${gapFill}

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
  ${lips}

  <!-- 혀 (음소별) -->
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

// 파란 바람 화살표 (마찰음 기류 — 입 밖으로)
const airflowOut = (y) => `
  <g stroke="#6FBDE8" stroke-width="5" fill="none" stroke-linecap="round">
    <path d="M 92 ${y} Q 78 ${y - 6} 64 ${y} Q 50 ${y + 6} 36 ${y}"/>
  </g>
  <path d="M 38 ${y - 9} L 20 ${y} L 38 ${y + 9} Z" fill="#6FBDE8"/>`;

// 비음 화살표 (공기가 코로 — 연구개 뒤에서 위로)
const nasalUp = `
  <g stroke="#6FBDE8" stroke-width="4.5" fill="none" stroke-linecap="round">
    <path d="M 252 80 Q 250 58 250 42"/>
  </g>
  <path d="M 241 50 L 250 32 L 259 50 Z" fill="#6FBDE8"/>
  <text x="250" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#6FBDE8">코로</text>`;

// 목에서 나오는 숨 (성문음 ㅎ — 깊은 목구멍에서 입 밖으로)
const breathOut = `
  <g stroke="#9BD4F0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9">
    <path d="M 268 150 Q 190 148 110 150 Q 70 151 40 150"/>
  </g>
  <path d="M 42 141 L 22 150 L 42 159 Z" fill="#9BD4F0"/>`;

// 혀 등면 흰 하이라이트 (입체감)
const gloss = (d) => `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.4" stroke-linecap="round"/>`;

// 혀 채움 스타일 (공통)
const TONGUE = `fill="#FF9B8A" stroke="#E8705F" stroke-width="3.5" stroke-linejoin="round"`;

// ─── 혀 모양 (조음 위치별) ─────────────────────────────────────
// 낮고 평평한 중립 혀 (양순음·성문음: 혀는 관여 안 함)
const tongueNeutral = `
  <path d="M 96 206
           Q 100 186 132 176 Q 178 166 216 176 Q 250 186 258 212
           Q 262 226 252 236 Q 210 240 160 234 Q 116 228 98 218 Q 90 212 96 206 Z"
        ${TONGUE}/>
  ${gloss("M 116 196 Q 165 184 210 194")}`;

// 혀끝이 치조(윗잇몸)에 닿음 — 치조 파열/비음 (ㄷㅌㄴ)
const tongueTipRidge = `
  <path d="M 100 116
           Q 116 120 134 150 Q 152 180 186 196 Q 220 208 252 216
           Q 262 226 256 238 Q 214 234 164 228 Q 120 220 100 206
           Q 88 188 88 154 Q 89 128 100 118 Z"
        ${TONGUE}/>
  ${gloss("M 108 150 Q 146 186 188 202")}`;

// 혓날(앞)이 경구개(딱딱한 입천장)에 닿음 — 경구개 파찰 (ㅈㅊ)
const tongueBladePalate = `
  <path d="M 112 152
           Q 122 110 162 96 Q 196 88 212 106 Q 238 150 258 214
           Q 262 226 252 236 Q 210 232 160 226 Q 116 218 100 198
           Q 94 174 112 152 Z"
        ${TONGUE}/>
  ${gloss("M 130 140 Q 170 118 200 128")}`;

// 혀 뒤(혀뿌리)가 연구개(물렁입천장)에 닿음 — 연구개 파열/비음 (ㄱㅋㅇ)
const tongueBackVelum = `
  <path d="M 96 212
           Q 100 192 134 184 Q 175 176 206 162 Q 234 148 246 118
           Q 252 106 262 116 Q 272 142 268 182 Q 262 216 230 228
           Q 188 238 150 234 Q 116 230 98 220 Q 90 216 96 212 Z"
        ${TONGUE}/>
  ${gloss("M 120 202 Q 170 190 212 178")}`;

// ─── 모음 혀 모양 (입천장에 닿지 않는 부드러운 언덕) ───────────
// 낮은 혀 (ㅏㅐ): 입 크게 벌리고 혀 낮음
const tongueLow = `
  <path d="M 98 208 Q 110 192 145 186 Q 190 180 224 190 Q 252 198 258 216
           Q 262 226 252 236 Q 210 240 160 234 Q 116 228 100 218 Q 92 212 98 208 Z"
        ${TONGUE}/>
  ${gloss("M 118 200 Q 170 188 214 196")}`;
// 앞 혀 높음 (ㅣㅔ): 혀 앞부분이 경구개 가까이
const tongueFrontHigh = `
  <path d="M 100 202 Q 108 150 140 130 Q 168 116 188 132 Q 200 148 206 178
           Q 230 198 256 214 Q 262 226 252 236 Q 210 232 160 226
           Q 116 218 100 206 Q 94 204 100 202 Z"
        ${TONGUE}/>
  ${gloss("M 124 156 Q 152 134 182 142")}`;
// 뒤 혀 높음 (ㅡㅜ): 혀 뒷부분이 연구개 가까이 (닿지는 않음)
const tongueBackHigh = `
  <path d="M 96 210 Q 102 196 134 188 Q 172 180 200 158 Q 222 140 234 124
           Q 244 116 252 128 Q 258 152 252 186 Q 244 214 220 226
           Q 184 236 150 232 Q 116 228 98 218 Q 90 214 96 210 Z"
        ${TONGUE}/>
  ${gloss("M 150 178 Q 196 158 226 140")}`;
// 뒤 혀 중간 (ㅗㅓ): 혀 뒷부분이 중간 높이
const tongueBackMid = `
  <path d="M 96 214 Q 102 200 136 192 Q 176 184 204 170 Q 226 158 236 144
           Q 244 136 250 148 Q 254 174 248 200 Q 240 220 214 228
           Q 180 236 148 232 Q 116 228 98 220 Q 90 216 96 214 Z"
        ${TONGUE}/>
  ${gloss("M 150 190 Q 198 172 228 156")}`;

const PHONEMES = {
  // ── 양순음 (입술) ──────────────────────────────────────────
  // ㅂㅍ(ㅃ): 두 입술 다물었다 터뜨림
  bilabial: scaffold({
    lipState: "closed",
    tongue: tongueNeutral,
  }),
  // ㅁ: 입술 다물고 공기는 코로 (비음)
  mieum: scaffold({
    lipState: "closed",
    tongue: tongueNeutral,
    airflow: nasalUp,
  }),

  // ── 치조음 (윗잇몸) ────────────────────────────────────────
  // ㄷㅌ(ㄸ): 혀끝을 윗잇몸에 딱 붙였다 터뜨림
  dieut: scaffold({
    upperLipY: 108, lowerLipY: 200,
    tongue: tongueTipRidge,
    contact: sparkle(106, 100),
  }),
  // ㄴ: 혀끝 윗잇몸 + 공기는 코로 (비음)
  nieun: scaffold({
    upperLipY: 108, lowerLipY: 200,
    tongue: tongueTipRidge,
    contact: sparkle(106, 100),
    airflow: nasalUp,
  }),
  // ㅅㅆ (치조 마찰음): 혀가 편평하게 올라와 좁은 틈으로 바람
  siot: scaffold({
    upperLipY: 108, lowerLipY: 205,
    tongue: `
      <path d="M 90 196
               Q 92 168 110 148 Q 130 132 161 130 Q 192 132 213 148
               Q 245 172 256 210 Q 260 222 252 234 Q 212 228 162 222
               Q 118 214 95 202 Q 88 200 90 196 Z"
            ${TONGUE}/>
      ${gloss("M 114 166 Q 152 152 198 164")}`,
    contact: `<g stroke="#FFC93D" stroke-width="3.5" stroke-linecap="round">
        <path d="M 126 114 L 133 125"/>
        <path d="M 142 110 L 148 122"/>
      </g>`,
    airflow: airflowOut(155),
  }),
  // ㄹ (치조 탄설음): 혀끝이 치조에 톡
  rieul: scaffold({
    upperLipY: 108, lowerLipY: 198,
    tongue: `
      <path d="M 103 118
               Q 115 124 132 152 Q 150 182 185 198 Q 220 210 252 218
               Q 262 228 256 240 Q 216 236 166 230 Q 123 220 101 206
               Q 89 190 89 156 Q 90 130 101 120 Z"
            ${TONGUE}/>
      ${gloss("M 108 150 Q 146 186 188 202")}`,
    contact: sparkle(106, 100),
  }),

  // ── 경구개음 (딱딱한 입천장) ───────────────────────────────
  // ㅈㅊ(ㅉ): 혓날을 경구개에 붙였다 좁게 터뜨림
  jieut: scaffold({
    upperLipY: 108, lowerLipY: 202,
    tongue: tongueBladePalate,
    contact: sparkle(168, 86),
  }),

  // ── 연구개음 (물렁한 입천장) ───────────────────────────────
  // ㄱㅋ(ㄲ): 혀 뒤를 연구개에 붙였다 터뜨림
  giyeok: scaffold({
    upperLipY: 108, lowerLipY: 202,
    tongue: tongueBackVelum,
    contact: sparkle(248, 102),
  }),
  // ㅇ (받침): 혀 뒤 연구개 + 공기는 코로 (비음)
  ieung: scaffold({
    upperLipY: 108, lowerLipY: 202,
    tongue: tongueBackVelum,
    contact: sparkle(248, 102),
    airflow: nasalUp,
  }),

  // ── 성문음 (목구멍) ────────────────────────────────────────
  // ㅎ: 입은 열고 목구멍에서 숨을 후—
  hieut: scaffold({
    upperLipY: 104, lowerLipY: 210,
    tongue: tongueNeutral,
    airflow: breathOut,
  }),

  // ═══ 모음 (단모음 8개) ═══════════════════════════════════════
  // ㅏ: 입 크게 벌리고 혀 낮게
  vowel_a: scaffold({ upperLipY: 96, lowerLipY: 216, tongue: tongueLow }),
  // ㅐ: ㅏ보다 살짝 덜 벌림, 혀 앞쪽
  vowel_ae: scaffold({ upperLipY: 102, lowerLipY: 206, tongue: tongueFrontHigh }),
  // ㅓ: 중간 벌림, 혀 뒤 중간
  vowel_eo: scaffold({ upperLipY: 104, lowerLipY: 204, tongue: tongueBackMid }),
  // ㅔ: 중간 벌림, 혀 앞 중간
  vowel_e: scaffold({ upperLipY: 108, lowerLipY: 198, tongue: tongueFrontHigh }),
  // ㅗ: 입술 동그랗게 오므림, 혀 뒤 중간
  vowel_o: scaffold({ upperLipY: 120, lowerLipY: 184, lipState: "rounded", tongue: tongueBackMid }),
  // ㅜ: 입술 더 작게 오므림, 혀 뒤 높게
  vowel_u: scaffold({ upperLipY: 128, lowerLipY: 176, lipState: "rounded", tongue: tongueBackHigh }),
  // ㅡ: 입술 옆으로 좁게(안 오므림), 혀 뒤 높게
  vowel_eu: scaffold({ upperLipY: 118, lowerLipY: 186, tongue: tongueBackHigh }),
  // ㅣ: 입술 옆으로 좁게, 혀 앞 높게
  vowel_i: scaffold({ upperLipY: 116, lowerLipY: 188, tongue: tongueFrontHigh }),
};

for (const [slug, svg] of Object.entries(PHONEMES)) {
  writeFileSync(join(OUT_DIR, `${slug}.svg`), svg);
  // 미리보기 PNG (확인용)
  await sharp(Buffer.from(svg), { density: 160 }).resize(480, 427).png()
    .toFile(join(OUT_DIR, `_preview-${slug}.png`));
  console.log(`✓ ${slug}.svg`);
}
