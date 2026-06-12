// PWA 앱 아이콘 생성 — 소리새(파랑새) 마스코트 (SoriMascot.tsx와 동일 도형)
// 사용: node scripts/generate-app-icons.mjs → public/icons/*.png
import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public", "icons");
mkdirSync(OUT_DIR, { recursive: true });

// 소리새 본체 — src/components/ui/SoriMascot.tsx "full" 변형의 정적 사본
// (애니메이션 클래스·필터 제거, 그라디언트 id 고정. viewBox 0 0 120 142)
const BIRD = `
  <!-- 바닥 그림자 -->
  <ellipse cx="60" cy="139" rx="28" ry="5" fill="rgba(90,140,180,0.13)"/>
  <!-- 왼쪽 날개 -->
  <g>
    <ellipse cx="20" cy="95" rx="24" ry="15" fill="url(#wingGrad)" transform="rotate(-22 20 95)"/>
    <ellipse cx="14" cy="99" rx="11" ry="7" fill="#C8E8F8" opacity="0.55" transform="rotate(-22 14 99)"/>
    <path d="M8,102 Q14,88 24,86" stroke="#5AAAD8" stroke-width="1.2" fill="none" opacity="0.4" stroke-linecap="round"/>
    <path d="M10,107 Q16,95 26,93" stroke="#5AAAD8" stroke-width="1" fill="none" opacity="0.3" stroke-linecap="round"/>
  </g>
  <!-- 오른쪽 날개 -->
  <g>
    <ellipse cx="100" cy="95" rx="24" ry="15" fill="url(#wingGrad)" transform="rotate(22 100 95)"/>
    <ellipse cx="106" cy="99" rx="11" ry="7" fill="#C8E8F8" opacity="0.55" transform="rotate(22 106 99)"/>
    <path d="M112,102 Q106,88 96,86" stroke="#5AAAD8" stroke-width="1.2" fill="none" opacity="0.4" stroke-linecap="round"/>
    <path d="M110,107 Q104,95 94,93" stroke="#5AAAD8" stroke-width="1" fill="none" opacity="0.3" stroke-linecap="round"/>
  </g>
  <!-- 몸통 + 배 -->
  <ellipse cx="60" cy="102" rx="40" ry="34" fill="url(#bodyGrad)"/>
  <ellipse cx="60" cy="110" rx="26" ry="21" fill="#EEF8FE" opacity="0.65"/>
  <!-- 머리 -->
  <circle cx="60" cy="52" r="40" fill="url(#headGrad)"/>
  <ellipse cx="46" cy="32" rx="17" ry="13" fill="white" opacity="0.2" transform="rotate(-15 46 32)"/>
  <!-- 머리깃 -->
  <ellipse cx="40" cy="15" rx="5.5" ry="12" fill="#8DC8EC" transform="rotate(-28 40 15)"/>
  <ellipse cx="52" cy="10" rx="6" ry="14" fill="#A2D3F0" transform="rotate(-10 52 10)"/>
  <ellipse cx="60" cy="8" rx="6.5" ry="15" fill="#B8E0F7"/>
  <ellipse cx="68" cy="10" rx="6" ry="14" fill="#A2D3F0" transform="rotate(10 68 10)"/>
  <ellipse cx="80" cy="15" rx="5.5" ry="12" fill="#8DC8EC" transform="rotate(28 80 15)"/>
  <!-- 왼눈 -->
  <circle cx="43" cy="49" r="13.5" fill="white"/>
  <circle cx="45" cy="50" r="9.5" fill="url(#irisGrad)"/>
  <circle cx="40" cy="46" r="4" fill="white"/>
  <circle cx="49" cy="53" r="2" fill="white" opacity="0.5"/>
  <!-- 오른눈 -->
  <circle cx="77" cy="49" r="13.5" fill="white"/>
  <circle cx="79" cy="50" r="9.5" fill="url(#irisGrad)"/>
  <circle cx="74" cy="46" r="4" fill="white"/>
  <circle cx="83" cy="53" r="2" fill="white" opacity="0.5"/>
  <!-- 부리 -->
  <path d="M51,65 Q55,62 60,63 Q65,62 69,65 Q64,75 60,76 Q56,75 51,65Z" fill="#FFB38A"/>
  <path d="M51,65 Q60,68 69,65" stroke="#E8895A" stroke-width="1.2" fill="none" opacity="0.5" stroke-linecap="round"/>
  <ellipse cx="56" cy="66" rx="4" ry="2.5" fill="white" opacity="0.25" transform="rotate(-15 56 66)"/>
  <!-- 볼터치 -->
  <circle cx="26" cy="60" r="13" fill="#FFAAAA" opacity="0.28"/>
  <circle cx="94" cy="60" r="13" fill="#FFAAAA" opacity="0.28"/>
  <!-- 발 -->
  <line x1="48" y1="131" x2="48" y2="136" stroke="#FFB38A" stroke-width="4.5" stroke-linecap="round"/>
  <line x1="48" y1="136" x2="38" y2="140" stroke="#FFB38A" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="48" y1="136" x2="48" y2="141" stroke="#FFB38A" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="48" y1="136" x2="57" y2="140" stroke="#FFB38A" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="72" y1="131" x2="72" y2="136" stroke="#FFB38A" stroke-width="4.5" stroke-linecap="round"/>
  <line x1="72" y1="136" x2="63" y2="140" stroke="#FFB38A" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="72" y1="136" x2="72" y2="141" stroke="#FFB38A" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="72" y1="136" x2="82" y2="140" stroke="#FFB38A" stroke-width="3.5" stroke-linecap="round"/>
`;

const DEFS = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFF9F2"/>
      <stop offset="100%" stop-color="#FFE9D8"/>
    </linearGradient>
    <radialGradient id="bodyGrad" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#D5EEFB"/>
      <stop offset="100%" stop-color="#8DC8EC"/>
    </radialGradient>
    <radialGradient id="headGrad" cx="38%" cy="32%" r="62%">
      <stop offset="0%" stop-color="#E4F4FD"/>
      <stop offset="100%" stop-color="#A2D3F0"/>
    </radialGradient>
    <radialGradient id="wingGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#B8E0F7"/>
      <stop offset="100%" stop-color="#6EB8E2"/>
    </radialGradient>
    <radialGradient id="irisGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#2A5FA8"/>
      <stop offset="100%" stop-color="#0D2D5C"/>
    </radialGradient>
  </defs>`;

// 새 크기: 1024 캔버스에 높이 ~72% (마스커블 안전영역 80% 내) → scale 5.2, 중앙 배치
const SCALE = 5.2;
const TX = (1024 - 120 * SCALE) / 2;
const TY = (1024 - 142 * SCALE) / 2;

/** rounded=true → 모서리 둥근 배경(런처용), false → 풀블리드(iOS가 자체 라운딩) */
function iconSvg(rounded) {
  return `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${DEFS}
  <rect width="1024" height="1024" rx="${rounded ? 224 : 0}" fill="url(#bg)"/>
  <g transform="translate(${TX},${TY}) scale(${SCALE})">${BIRD}</g>
</svg>`;
}

// 알림 뱃지(Android 상태바용): 투명 배경 + 흰 단색 새 실루엣 (머리+깃)
const badgeSvg = `
<svg width="1024" height="1024" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <g fill="#FFFFFF" transform="translate(0,8)">
    <ellipse cx="40" cy="15" rx="5.5" ry="12" transform="rotate(-28 40 15)"/>
    <ellipse cx="52" cy="10" rx="6" ry="14" transform="rotate(-10 52 10)"/>
    <ellipse cx="60" cy="8" rx="6.5" ry="15"/>
    <ellipse cx="68" cy="10" rx="6" ry="14" transform="rotate(10 68 10)"/>
    <ellipse cx="80" cy="15" rx="5.5" ry="12" transform="rotate(28 80 15)"/>
    <circle cx="60" cy="60" r="44"/>
  </g>
</svg>`;

const jobs = [
  { svg: iconSvg(true), size: 512, name: "icon-512.png" },
  { svg: iconSvg(true), size: 192, name: "icon-192.png" },
  { svg: iconSvg(false), size: 180, name: "apple-touch-icon.png" },
  { svg: badgeSvg, size: 72, name: "badge-72.png" },
];

for (const { svg, size, name } of jobs) {
  await sharp(Buffer.from(svg), { density: 144 }).resize(size, size).png().toFile(join(OUT_DIR, name));
  console.log(`✓ ${name} (${size}×${size})`);
}
