// PWA 앱 아이콘 생성 — 말풍선 + 음파 모티프 (앱 peach 톤, 텍스트 없음)
// 사용: node scripts/generate-app-icons.mjs → public/icons/*.png
import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public", "icons");
mkdirSync(OUT_DIR, { recursive: true });

// 1024 기준 마스터 SVG: peach 라운드 배경 + 흰 말풍선 + 음파 점·호
const masterSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFC9A8"/>
      <stop offset="100%" stop-color="#FFA87A"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="224" fill="url(#bg)"/>
  <!-- 말풍선 본체 -->
  <rect x="192" y="256" width="640" height="448" rx="160" fill="#FFFDF9"/>
  <!-- 말풍선 꼬리 -->
  <path d="M 384 672 L 352 800 L 496 688 Z" fill="#FFFDF9"/>
  <!-- 입(점) + 음파 호 2개 -->
  <circle cx="400" cy="480" r="44" fill="#FF9B6A"/>
  <path d="M 510 400 A 110 110 0 0 1 510 560" stroke="#FF9B6A" stroke-width="40" stroke-linecap="round" fill="none"/>
  <path d="M 590 352 A 176 176 0 0 1 590 608" stroke="#FFC9A8" stroke-width="40" stroke-linecap="round" fill="none"/>
</svg>`;

// 알림 뱃지(Android 상태바용): 투명 배경 + 흰 단색 실루엣
const badgeSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect x="128" y="192" width="768" height="544" rx="192" fill="#FFFFFF"/>
  <path d="M 352 704 L 312 864 L 488 720 Z" fill="#FFFFFF"/>
</svg>`;

const jobs = [
  { svg: masterSvg, size: 512, name: "icon-512.png" },
  { svg: masterSvg, size: 192, name: "icon-192.png" },
  { svg: masterSvg, size: 180, name: "apple-touch-icon.png" },
  { svg: badgeSvg, size: 72, name: "badge-72.png" },
];

for (const { svg, size, name } of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(OUT_DIR, name));
  console.log(`✓ ${name} (${size}×${size})`);
}
