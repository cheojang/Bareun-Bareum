/**
 * 단어 이미지 생성 스크립트 — Vertex AI Imagen (아동용 귀여운 일러스트)
 * 실행: npx tsx scripts/generate-word-images.ts
 *
 * - WORD_IMAGE_SLUGS(src/lib/word-images.ts)를 순회
 * - 이미 /public/images/words/{slug}.webp 있으면 건너뜀 (idempotent)
 * - Vertex AI Imagen 이미지 생성 → sharp로 webp(흰배경) 변환 후 저장
 * - 배치 + 딜레이로 Rate Limit 회피, 안전필터 차단 시 마스코트 프롬프트로 재시도
 *
 * 사전조건 (.env.local 또는 환경변수):
 *   GOOGLE_APPLICATION_CREDENTIALS = 서비스 계정 JSON 키 파일 경로
 *   GOOGLE_CLOUD_PROJECT           = GCP 프로젝트 ID (키에 있으면 생략 가능)
 *   GOOGLE_CLOUD_LOCATION          = 리전 (기본 us-central1)
 *   IMAGE_MODEL                    = Imagen 모델 ID (기본 imagen-4.0-generate-001)
 *   npm install (@google/genai, sharp 포함)
 *
 * 비용은 GCP 결제 계정/무료 크레딧에서 차감됨 (AI Studio 키와 별도).
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WORD_IMAGE_SLUGS } from "../src/lib/word-images";

// 영어 시각 설명(글로스) — 있으면 한글 대신 사용해 정확도 향상.
// 파일이 아직 없을 수 있으므로(선행: generate-word-glosses.ts) 안전하게 로드.
let WORD_GLOSS: Record<string, string> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WORD_GLOSS = require("../src/lib/word-image-glosses").WORD_GLOSS ?? {};
} catch { /* 글로스 파일 없으면 한글 폴백 */ }

// ── 설정 ─────────────────────────────────────────────────────────────────────
export const IMAGE_MODEL = process.env.IMAGE_MODEL || "imagen-4.0-generate-001";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
const OUT_DIR = join(process.cwd(), "public", "images", "words");
const STORE_SIZE = 1024;    // 저장 해상도(정사각) — 화질 우선
const WEBP_QUALITY = 90;    // webp 품질 (화질 우선)
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 2;   // 동시 호출 수 (quota 회피 위해 낮춤)
const DELAY_MS = Number(process.env.DELAY_MS) || 3000;    // 배치 간 대기
const MAX_RETRY = 2;        // 콘텐츠(안전필터) 재시도 횟수
const QUOTA_RETRY = 8;      // 429(quota) 재시도 횟수
const QUOTA_WAIT_MS = 30000; // 429 시 대기 (지수 증가)

// 프로젝트 ID: 환경변수 우선, 없으면 서비스 계정 키 JSON에서 추출
function resolveProject(): string {
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath && existsSync(keyPath)) {
    try {
      const key = JSON.parse(readFileSync(keyPath, "utf8"));
      if (key.project_id) return key.project_id;
    } catch { /* skip */ }
  }
  return "";
}

const PROJECT = resolveProject();
if (!PROJECT) {
  console.error("GCP 프로젝트 ID를 찾을 수 없습니다. GOOGLE_CLOUD_PROJECT 또는 서비스 계정 키를 설정하세요.");
  process.exit(1);
}

export const ai = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });

// ── 단어 종류별 시각적 맥락 (Imagen이 올바른 장면을 생성하도록) ──────────────
// 추상적일 수 있는 단어는 "무엇을 그려야 하는지" 영어 힌트를 명시.
// ⚠️ 사람(특히 아동) 생성은 Imagen 안전필터에 막힐 수 있어 동물 마스코트로 표현.
export const WORD_CONTEXT: Record<string, string> = {
  // 색깔 → 대표 오브젝트 (동물/캐릭터 얼굴 허용, 무생물은 얼굴 없는 형태로)
  "빨강": "a cute red apple",
  "파랑": "a cute baby blue whale with a big smile, blue is the dominant color",
  "노랑": "a cute yellow baby chick",
  "초록": "a cute green frog",
  "보라": "a cute purple cartoon bunny, purple-violet is the dominant color",
  "분홍": "a cute pink cartoon pig, pink is the dominant color",
  "하양": "a cute fluffy white polar bear cub, white is the dominant color",
  "검정": "a cute black cat",
  "주황": "a cute little orange tiger cub, orange is the dominant color",
  "회색": "a cute gray elephant",
  "갈색": "a simple cute brown grizzly bear with no clothes, plain brown fur only, brown is the single dominant color",
  "금색": "a simple five-pointed star shape in solid shining gold color, no face, no eyes, just the gleaming gold metallic star",
  "은색": "a simple crescent moon shape in solid shining silver color, no face, no eyes, just the silver metallic moon",
  // 계절
  "봄": "a cheerful spring scene with pink cherry blossom flowers",
  "여름": "a bright summer scene with a glowing yellow sun (no face, no eyes, no smile) and a juicy red watermelon slice",
  "가을": "an autumn scene with red and orange maple leaves falling",
  "겨울": "a winter scene with a smiling snowman and snowflakes",
  // 동사 → 동물 마스코트가 동작 (아동 대신 토끼 캐릭터)
  "웃다": "a cute cartoon bunny laughing with a big bright smile",
  "울다": "a cute cartoon bunny crying with a teardrop",
  "눈물": "a close-up of a cute cartoon bunny face with big sparkling teardrops streaming down both cheeks",
  "먹다": "a cute cartoon bunny eating from a bowl",
  "자다": "a cute cartoon bunny curled up on a soft cloud sleeping peacefully with eyes closed and a calm smile, zzz symbols are welcome to show sleep",
  "걷다": "a cute cartoon bunny walking forward",
  "뛰다": "a cute cartoon bunny running fast with motion lines",
  "앉다": "a cute cartoon bunny sitting down",
  "읽다": "a cute cartoon bunny reading an open picture book",
  "그리다": "a cute cartoon bunny drawing a picture on paper",
  "숨다": "a cute cartoon bunny hiding behind a big tree",
  "보다": "a cute cartoon bunny looking through toy binoculars",
  "듣다": "a cute cartoon bunny listening with a hand behind its ear",
  "쓰다": "a cute cartoon bunny writing with a crayon",
  "잡다": "a cute cartoon bunny catching a butterfly with a net",
  "놀다": "a cute cartoon bunny playing happily with toys",
  "타다": "a cute cartoon bunny riding a bicycle",
  "던지다": "a cute cartoon bunny throwing a ball",
  "받다": "a cute cartoon bunny catching a ball",
  "씻다": "a cute cartoon bunny washing at a sink with bubbles",
  "입다": "a cute cartoon bunny putting on colorful clothes",
  "신다": "a cute cartoon bunny putting on shoes",
  "올라가다": "a cute cartoon bunny climbing up stairs",
  "내려가다": "a cute cartoon bunny sliding down a slide",
  // 동작명사
  "수영": "a cute cartoon bunny swimming with floaties in water",
  "춤": "a cute cartoon bunny dancing with arms raised joyfully",
  "노래": "a cute cartoon bunny singing with musical notes around",
  "세수": "a cute cartoon bunny washing its face with bubbles",
  "달리기": "a cute cartoon bunny sprinting on a race track",
  "요리": "a cute cartoon bunny in a tiny apron stirring a pot",
  "청소": "a cute cartoon bunny sweeping the floor with a broom",
  // 감정 → 표정 (동물 얼굴)
  "행복": "a cute cartoon animal face with a big happy smile and rosy cheeks",
  "슬픔": "a cute cartoon animal face looking sad with a single teardrop",
  "화남": "a cute cartoon animal face with an angry frown",
  "무서움": "a cute cartoon animal face looking scared with wide eyes",
  "신남": "a cute cartoon animal face excited with star-shaped eyes",
  "졸음": "a cute cartoon bunny face with heavy drooping half-closed eyelids looking very drowsy and sleepy, no ZZZ letters, no z symbols, just the sleepy squinting eyes",
  "놀람": "a cute cartoon animal face surprised with wide round eyes",
  "부끄러움": "a cute cartoon animal face blushing shyly with rosy cheeks",
  // 날씨
  "비": "a soft blue-gray cloud with small teardrop-shaped raindrops falling below, a small colorful umbrella below the drops, no face on the cloud, no expressions, no eyes",
  "맑음": "a wide bright clear blue sky filling the entire image, with a few small plain white clouds and a golden glowing sun, no face on sun or clouds, no cars, no vehicles, no people, no animals — just beautiful clear sky",
  "바람": "cute wind swirls with leaves blowing and a spinning pinwheel",
  "햇빛": "a cute bright yellow sun with rays and a smiley face",
  "천둥": "a cute storm cloud with a lightning bolt",
  "무지개": "a colorful rainbow arc over fluffy white clouds",
  // 추상어 → 시각 상징
  "사랑": "a big cute red heart with sparkles on a white background",
  "꿈": "magical floating glowing stars of different sizes and pastel colors (pink purple yellow) drifting on a soft dark lavender night background, dreamy and sparkly, absolutely no faces, no characters, no letters, no Z",
  "재미": "cute colorful balloons and confetti on a white background",
  "소리": "a cute cartoon speaker emitting colorful musical notes",
  "단맛": "a simple colorful round lollipop candy on a stick with sparkles around it, no face, no eyes, no smile on the candy",
  "젤리": "several colorful square and round fruit jelly pieces (not animal shaped, just simple geometric candy shapes) in red yellow and green, no faces, no eyes, no expressions",
  "치약": "a tube of toothpaste with a stripe of white toothpaste squeezed out, all surfaces blank with no text or labels, no face",
  "치즈": "a wedge of yellow cheese with small holes, no face, no eyes, no smile",
  // 기타
  "초": "a single bright red needle pointer isolated on a plain white background — a simple thin elongated teardrop-shaped pointer like a clock second hand, pointing straight UP at 12 o'clock, red colored — no clock body, no numbers, no face, just the red pointer itself representing a second-hand",
  "하트": "a big cute pink heart with a happy smiley face",
  // 반복 실패 단어 — 의인화·텍스트 방지
  "바다": "a wide endless blue ocean with gentle waves stretching all the way to the horizon, seen from a sandy shore, bright blue water, clear sky, NO people, NO animals, NO vehicles, NO cars, NO boats, NO text",
  "빵": "two warm golden-brown round bread rolls on a plain white surface, no face, no eyes, no mouth, no limbs, no expressions",
  "감자": "two plain oval brown potatoes on a white surface, no face, no eyes, no mouth, no limbs",
  "마트": "a cheerful colorful grocery store building exterior, all signs completely blank with no text or letters, bright colors, no people inside",
  "학교": "a bright yellow school building with a playground in front, all walls and signs completely blank with no letters or text",
  "흙": "a small neat mound of dark brown garden soil with a tiny green sprout emerging, no face, no expressions on the sprout or soil",
  "계란": "two plain smooth oval eggs, natural white-cream colored, one whole and one cracked open showing the yellow yolk, no face, no eyes, no smile on the eggs",
  "간장": "a small dark glass bottle of Korean soy sauce, all surfaces completely blank with no text, no labels, no logos, no face, no eyes on the bottle",
  "풀": "a simple blue glue stick standing upright with a smooth plain surface, no face, no eyes, no smile, no text on the glue stick",
  "스템프": "a wooden rubber stamp handle with a circular rubber base, next to a small square ink pad, no face on the stamp, no text or letters on the stamp face",
  "휴지": "a single roll of white toilet paper or a small white tissue box, plain clean white, no face, no eyes, no smile, no text on the packaging",
  "아니오": "a large bold bright red X symbol on a plain white background, representing 'no', no text, no face, just the red X mark",
  "시간": "a simple cute round analog clock with two clock hands showing 3 o'clock, clock face has only small simple dot markers (absolutely NO numbers on clock face), no face on the clock, no text",
  "분": "a small cute hourglass timer with sand slowly falling through, representing the passage of minutes, no face, no text, no numbers on the hourglass",
  "오른쪽": "a single large bold thick directional arrow shape pointing to the RIGHT, like a road sign directional arrow, filled in solid bright orange color, flat design centered on plain white background, absolutely zero text, zero Korean characters, zero letters, just the arrow shape",
  "왼쪽": "a thick solid sky-blue flat arrow shape with its POINTED TIP on the LEFT side of the image and its flat rectangular tail end on the RIGHT side — the arrow tip faces LEFT — bright blue fill, no text, no labels, no characters, centered on plain white background",
  "턱": "a very close-up cartoon illustration of ONLY the rounded chin and lower jaw area — cropped tightly to show just the smooth rounded chin and jawline below the lower lip, no eyes, no nose, no ears visible, just the chin protruding forward, isolated on white",
  "어깨": "a simple cartoon illustration of a rounded shoulder and upper arm area isolated on white, NO head or face visible, just the shoulder region from the front",
  "튀김": "a plate of crispy golden fried tempura with shrimp and vegetables, flat illustration, no face on food, no limbs, no vehicles, no cars",
  "딸기잼": "a glass jar filled with glossy bright-red strawberry jam, a fresh strawberry on top, all surfaces of the jar completely blank with no text or labels",
  "흑": "a mound of dark rich soil, no face, no expressions",
  "과자": "a stack of plain round golden crackers on a white surface, no face, no eyes, no smile, no limbs on the crackers",
  "라임": "two fresh bright green lime citrus fruits, one whole and one sliced in half to show the inside, no face, no eyes, no smile on the lime",
  "귀리": "a small bowl of natural beige-colored rolled oats, the oats are their natural light tan-beige color, no face, no eyes, no cartoon character, just the plain natural-colored oatmeal",
  "현관": "a simple front door of a house, the door is plain colored with a door knob, NO house numbers, NO address numbers, NO welcome mat, NO doormat, NO signs, NO text anywhere, clean simple entryway",
  "아저씨": "a friendly smiling ADULT man with short dark hair, clearly a grown-up in his 30s-40s, simple cartoon illustration, warm friendly expression",
  "마라카스": "a pair of colorful maracas musical instruments, oval-shaped rattles with handles in bright colors, no face, no eyes, no smile on the maracas",
  "카드": "three simple flat rectangular card shapes fanned out in red, yellow, and blue solid colors, completely blank with no text, no numbers, no symbols, no face — just clean colorful rectangle cards",
  "연": "a single colorful diamond-shaped kite with a long tail flying against a clear blue sky background, no person, NO car, NO vehicle, just the kite itself",
  "그림책": "a small neat stack of colorful closed children's books in bright colors (red, yellow, blue), seen from slightly above at an angle, all book covers are plain solid colors with no face, no characters, no illustrations on any cover",
  "그림": "a single piece of white paper with a simple child's crayon drawing of a cute sun and a little house on it, the drawing is centered on the paper, no text",
  "표지": "the front cover of a simple hardcover book seen straight on, the cover is plain solid red or blue with just a small star or simple shape illustration, no text on the cover, no face",
  "꽃잎": "a single delicate soft pink flower petal lying flat on a white surface, just one isolated petal alone, no full flower, no stem, no other petals",
  "퍼즐": "four colorful interlocking jigsaw puzzle pieces fitting together on white, simple geometric shapes, no face, no eyes, no expressions on any piece",
  "케이크": "a colorful three-layered birthday cake with pink frosting and three lit candles on top, no face, no eyes, no smile on the cake body",
  "아이스크림": "a soft-serve ice cream cone with a two-tone swirled top in pink and white, no face, no eyes, no smile on the ice cream or cone",
  "턱": "a cute cartoon close-up of a round baby chin seen from directly below looking upward — just the smooth rounded chin and lower jawline filling the frame, no nose, no eyes, no ears, no food, no gum, mouth closed, simple clean illustration",
  // 식품 용기 — 의인화·텍스트 방지
  "비빔밥": "a top-down aerial view of Korean bibimbap dish, showing colorful arranged vegetables (spinach, carrots, bean sprouts, egg yolk) on white rice seen from directly above, no bowl face, no expressions, just the vibrant colorful food",
  "마요네즈": "a white squeeze bottle of mayonnaise, all surfaces completely blank with no text, no labels, no face, no eyes, smooth clean bottle",
  "요구르트": "a small round yogurt drink bottle, smooth clean surface with no text, no labels, no face, no eyes, no expressions",
  "버터": "a rectangular golden-yellow butter block on a small white dish, no face, no eyes, no smile, no wrapper, no text",
  "잼": "a glass jar of glossy red fruit jam with a plain lid, all surfaces blank with no text, no labels, no face, no eyes",
  "뇌": "a simple stylized pink brain shape with visible folds and ridges, isolated on white, no face, no eyes, no smile, no limbs — just the anatomical shape",
  "내복": "a simple set of light pink thermal long underwear laid flat on white background — a long-sleeved top and long pants, no face, no expressions, no character wearing it",
  "스웨터": "a cozy knitted sweater with a ribbed pattern laid flat on white, no face, no eyes, no smile, no character wearing it, just the sweater garment",
  "뜨겁다": "a bright orange-red flame or steam waves rising from heat, no face, no eyes, no mouth, no expressions, just the visual of heat and fire",
  "차갑다": "clear blue ice cubes with a frosty sparkle effect, no face, no eyes, no expressions, just the cold icy visual",
  "깨끗하다": "a sparkling clean shiny white bathtub or sink with gleaming star highlights indicating cleanliness, no car, no vehicle, no face, no text",
  "두유": "a small rectangular soy milk carton box standing upright, all surfaces clean and blank with NO text, no labels, no logos, no face, no eyes, no decorations at all on the carton",
  "이마": "a cute cartoon bunny touching its own forehead with one paw, looking forward, the forehead area between the ears and eyes clearly in focus as the featured region",
  "이빨": "a cute cartoon bunny opening its mouth wide showing its white teeth clearly, the teeth are the main featured subject, simple cute illustration",
  "어깨": "a cute cartoon bunny pointing to its own shoulder with one paw, the rounded shoulder area is the main featured region",
  "목": "a cute cartoon giraffe with its signature long graceful neck as the most prominent feature, the long neck is the main centered subject, simple flat illustration",
  "손가락": "a single pointing index finger extended and isolated on a white background, simple clean flat cartoon illustration, no anthropomorphism",
  "엉덩이": "a cute cartoon baby animal (chick or bunny) sitting down viewed from behind, its round padded bottom clearly visible as the main centered feature",
  // 반복 실패 단어 — 10차 추가
  "장구": "a traditional Korean janggu hourglass-shaped drum — the drum has two circular drumheads on both ends (one larger, one smaller), connected by a narrow waist laced with colorful cords, positioned horizontally, no face, no text",
  "칼국수": "a bowl of Korean knife-cut noodles (칼국수) — thick flat white wheat noodles in golden clear broth, seen from slightly above, with green onion garnish on top, no face on the bowl, no cartoon character, no person in the image, just the bowl of noodles",
  "약사": "a friendly cartoon pharmacist — a smiling figure wearing a white lab coat with a green medical cross symbol on the pocket, standing behind a counter with small medicine bottles on a shelf behind, simple flat illustration",
  // 반복 실패 단어 — 9차 추가
  "반창고": "a simple rectangular adhesive bandage (band-aid), beige/flesh-colored with a white gauze pad in the center, no face, no eyes, no smile, no limbs on the bandage, plain and clean",
  "거인": "a very large cartoon giant towering above tiny trees and tiny houses — the giant is clearly enormous compared to the small surrounding objects, showing the concept of being huge, friendly simple flat illustration",
  // 반복 실패 단어 — 8차 추가
  "당겨": "a cute cartoon bunny firmly pulling a thick rope toward itself with both front paws, leaning backward as it pulls — the pulling action is clear and simple",
  "비누": "a smooth rectangular bar of light blue or white soap sitting on a small soap dish, with a few round soap bubbles near it — no face, no eyes, no smile on the soap bar, plain and clean",
  "체온계": "a simple clinical glass mercury thermometer lying flat, showing the silver mercury column inside the thin glass tube — no face, no eyes, no expressions, just the plain thermometer instrument",
  // 반복 실패 단어 — 7차 추가
  "두드려": "a cute cartoon bunny using its fist to knock or tap on a large wooden door — the bunny is shown in mid-knock action, its paw touching the door, simple flat illustration",
  // 반복 실패 단어 — 6차 추가
  "하늘색": "a simple clear bright sky-blue sky with a few small fluffy white clouds — the entire image is filled with the bright SKY BLUE (하늘색) color, like looking up at a clear blue sky, no characters, no people, no face, no animals",
  "주황색": "a beautiful warm orange sunset — the entire image is filled with vivid orange and golden-orange sunset sky colors (주황색), a large bright orange sun low on the horizon, the whole image glowing with warm orange tones, NO face on the sun, NO characters, NO cars, NO text, the orange color fills the ENTIRE frame",
  "자주색": "a cluster of plump deep reddish-purple plums (자두) in 자주색 (deep reddish-purple/magenta) color, their round smooth skin in rich purple-red tone — no face, no eyes, no expressions on any plum",
  "놀이공원": "a colorful amusement park scene with a big multicolored Ferris wheel and a looping roller coaster — all structures, buildings, and surfaces are completely blank with NO text, NO numbers, NO letters, NO signs with writing anywhere, just bright colorful rides",
  "눈보라": "a fierce winter blizzard — strong diagonal winds driving thick white SNOW across the image, heavy snowfall with many white snowflakes streaming diagonally in the same direction against a dark gray stormy sky, a white snow-covered ground at the bottom, NO people, NO animals, NO characters, NO face, just the snowy blizzard wind and snow",
  // 반복 실패 단어 — 5차 추가
  "손톱": "a close-up illustration of a single fingertip and its smooth oval FINGERNAIL seen from directly above — just the fingertip with the pink nail clearly visible as the main subject, no face, no expression, no eyes, simple clean flat illustration",
  "발뒤꿈치": "a cute cartoon bunny sitting and showing the sole of its back foot, the HEEL (the round padded back portion of the foot sole) prominently featured and highlighted as the main subject",
  "분홍색": "a cute large cartoon pink pig whose entire soft PINK body fills the whole square image from edge to edge — the pig is big and centered, its bubblegum PINK color occupies virtually the ENTIRE image space, simple flat style, no face on any background object",
  // 반복 실패 단어 — 4차 추가
  "안개": "a quiet forest or meadow path in early morning where thick white fog fills the air close to the ground — the path ahead disappears into dense atmospheric white mist, trees are soft blurry silhouettes, the fog is clearly at ground level, NO people, NO animals, NO characters, NO face, just the misty atmospheric fog scene",
  "불가사리": "a bright orange-red starfish lying on sandy beige beach ground, seen from directly above — the five arms spread out naturally on the sand, no face, no eyes, no expressions, natural orange starfish on sandy background",
  "볼": "a cute cartoon bunny face showing its BIG ROUND PUFFY CHEEKS prominently — the chubby rosy cheeks are the main featured subject, puffed out and round, the cheeks are highlighted as the main element",
  // 반복 실패 단어 — 3차 추가
  "풍선껌": "a large round glossy pink bubble blown from bubblegum — just the spherical shiny pink bubble shape centered on white background, NO face, NO eyes, NO mouth, NO nose on the bubble, no character, just the clean round pink bubble",
  "찰흙": "a smooth rounded lump of gray-brown natural modeling clay sitting on a white surface, with a simple star or heart shape pressed into its surface to show it is sculpting clay — no face, no eyes, no smile, no limbs on the clay, just the plain clay lump with a simple pressed shape",
  // 반복 실패 단어 — 2차 추가
  "초코": "a small rectangular piece of dark brown chocolate bar broken off, or a small square dark chocolate truffle on a white surface — no face, no eyes, no mouth, no limbs on the chocolate, plain inanimate confectionery",
  "기차역": "a simple cute train station platform with a curved roof covering — a simple arch-shaped station shelter with a concrete platform, all walls and signs are COMPLETELY BLANK with zero text, zero numbers, zero letters, NO signage, just the clean station structure",
  "강낭콩": "several plump red kidney beans with their natural deep red color, scattered on a plain white surface — plain oval bean shapes, no face, no eyes, no expressions, no limbs on any bean",
  "달력": "a cute wall calendar page with a simple rainbow drawing at the top as decoration, and a neat grid of blank white empty squares below — the squares are completely empty with NO numbers, NO letters, NO text in any square at all, just a clean blank calendar grid pattern with a decorative picture on top",
  "도시락": "a rectangular Japanese-style bento lunchbox with its lid off showing colorful food arranged inside — white rice, bright green broccoli, an orange carrot slice, and a yellow egg — all surfaces of the box are completely blank with NO face, NO eyes, NO expressions, NO text, NO logos anywhere on the box",
  "번데기": "several brown elongated oval silkworm pupae/chrysalises — the Korean street food beondegi — small plump brown oval shapes arranged together, no face, no eyes, no expressions, no smiles on any pupa, just the natural brown oval forms",
  // 새로 발견된 반복 실패 단어
  "중간": "three identical plain geometric circles in a horizontal row — a small light gray circle on the far left, a medium bright red circle exactly in the CENTER, and a small light gray circle on the far right — flat solid shapes, no face, no eyes, no expressions on any circle",
  "물건": "three simple everyday objects arranged side by side: a plain blue cup, a round yellow ball, and a silver spoon — each a single solid color, no face, no eyes, no expression on any object, no text",
  "먼지": "a small wispy swirling cloud of fine gray dust powder floating in the air — a soft puffy gray dust cloud shape with loose wispy edges, light translucent gray color, no sunbeam, no triangle shape, no food, no character, no face, no eyes — just the soft gray floating dust cloud",
  "초대": "a colorful closed envelope with a festive heart sticker seal on the flap, decorated with tiny colorful confetti dots around it and a small star accent, plain solid background — all envelope surfaces completely blank with zero text, zero writing, zero numbers",
  "운동회": "a row of colorful triangular pennant bunting flags strung on a rope — alternating red, yellow, blue, and green solid-colored triangles hanging in a cheerful line against a white background, all flags completely plain with NO text, no letters, no markings on any flag",
  "게임": "a simple handheld video game controller in bright primary colors — smooth oval body in red or purple, four round colored buttons (red, yellow, blue, green), a cross direction pad — absolutely zero text, zero letters, zero numbers on any button or surface",
  "껌": "a single rectangular stick of light-colored chewing gum or a small pack of three parallel gum sticks in pastel colors, unwrapped and plain — no face, no eyes, no expression, no text, no logos, no wrapper markings",
  "꼬치": "a wooden bamboo skewer with alternating colorful food pieces threaded on it — a piece of golden grilled chicken, a red bell pepper chunk, a green zucchini slice, and a mushroom — no face, no eyes, no expressions on any of the food pieces",
  "똥": "a simple brown oval mound shape with three wavy yellow-green stink lines rising above it — the small brown rounded heap has NO face, NO eyes, NO mouth, NO nose, NO smile — just a plain brown mound with stinky smell-wave lines above it, representing poop, clean flat illustration",
  "빵집": "a cute small bakery shop building front — a cheerful warm-colored pastel exterior with one large glass window displaying round golden bread rolls inside, a simple painted bread-loaf silhouette on the wall as the only decoration, plain colored awning with NO text, NO sign with letters, NO numbers anywhere, just the charming small bakery building facade",
  "쌀": "a neat small mound of individual uncooked white rice grains poured out on a white surface, showing the individual oval grain shapes clearly, simple clean composition, no face, no eyes, no expressions",
  "꿀": "a clear glass honey jar filled with warm golden amber honey, with a classic wooden honey dipper resting across the top of the open jar, a small golden honeycomb piece beside the jar — no face, no eyes on the jar or dipper, no text, no labels on the jar",
};

// ── 일관된 귀여운 스타일 프롬프트 ───────────────────────────────────────────
export const STYLE = [
  "Style: flat vector illustration, thick rounded outlines, soft pastel colors (peach, mint, cream),",
  "friendly and simple, one single centered subject only, plain solid white background.",
  "ABSOLUTELY NO text, no letters, no words, no numbers, no labels, no captions, no writing on any surface;",
  "keep all surfaces blank. No border, no watermark, no signature.",
  "ABSOLUTELY NO cars, NO vehicles, NO automobiles unless the word specifically depicts a vehicle.",
  "Square 1:1 composition, high quality, crisp, clean.",
].join(" ");

// 프롬프트 주제 우선순위: 손튜닝 맥락(WORD_CONTEXT) > 영어 글로스 > 한글 폴백
export function buildPrompt(word: string): string {
  const subject =
    WORD_CONTEXT[word] ??
    (WORD_GLOSS[word] ? `${WORD_GLOSS[word]}` : `a cute illustration representing "${word}"`);
  return `Create a single cute illustration of ${subject} for a Korean toddler (age 3-5). ${STYLE}`;
}

// 안전필터 차단 시: 사람 표현을 동물 마스코트로 치환해 재시도
function sanitizePrompt(prompt: string): string {
  return prompt
    .replace(/cartoon child(ren)?/gi, "cute cartoon bunny character")
    .replace(/\bchild(ren)?\b/gi, "bunny character")
    .replace(/\bkid(s)?\b/gi, "bunny character")
    .replace(/\bbaby\b/gi, "baby animal");
}

// ── Imagen 이미지 1장 생성 → Buffer(webp) ───────────────────────────────────
export async function generateImage(prompt: string): Promise<Buffer | null> {
  const res = await ai.models.generateImages({
    model: IMAGE_MODEL,
    prompt,
    config: { numberOfImages: 1, aspectRatio: "1:1" },
  });
  const b64 = res.generatedImages?.[0]?.image?.imageBytes;
  if (!b64) return null;
  const raw = Buffer.from(b64, "base64");
  return await sharp(raw)
    .resize(STORE_SIZE, STORE_SIZE, { fit: "cover" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

function isQuotaError(msg: string): boolean {
  return /RESOURCE_EXHAUSTED|quota|429/i.test(msg);
}

// 일시적 네트워크 오류 — 영구 실패로 처리하면 안 됨(블랙리스트 오염 방지)
function isNetworkError(msg: string): boolean {
  return /fetch failed|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|socket hang up|network|503|502|504|timeout/i.test(msg);
}

// 생성 결과: 성공(buf) / 안전필터 영구차단(blocked) / 일시적 실패(transient)
type GenResult =
  | { status: "ok"; buf: Buffer }
  | { status: "blocked" }   // 안전필터 — 다음 실행에서도 막힘 → 영구 스킵 대상
  | { status: "transient" }; // 네트워크/quota — 이번엔 실패했어도 다음 실행에 재시도

async function withRetry(word: string): Promise<GenResult> {
  const base = buildPrompt(word);
  let contentAttempt = 0;  // 안전필터(이미지 null) 재시도
  let transientAttempt = 0; // 네트워크/quota 재시도

  while (contentAttempt <= MAX_RETRY) {
    // 1차는 원본, 안전필터 차단 시 마스코트 프롬프트로 재시도
    const prompt = contentAttempt === 0 ? base : sanitizePrompt(base);
    try {
      const buf = await generateImage(prompt);
      if (buf) return { status: "ok", buf };
      // 이미지가 null = 안전필터 차단(영구). 프롬프트 바꿔 재시도
      console.warn(`  ⚠ ${word} 시도 ${contentAttempt + 1}: 이미지 없음(안전필터 가능)`);
      contentAttempt++;
      await new Promise((r) => setTimeout(r, 1500 * contentAttempt));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // 네트워크/quota = 일시적. 대기 후 재시도하되 영구 실패로 카운트하지 않음
      if (isQuotaError(msg) || isNetworkError(msg)) {
        transientAttempt++;
        if (transientAttempt > QUOTA_RETRY) {
          console.warn(`  ⏭ ${word} 일시적 오류 재시도 소진 — 이번엔 건너뜀(다음 실행에 재시도)`);
          return { status: "transient" };
        }
        const wait = QUOTA_WAIT_MS * Math.min(transientAttempt, 4); // 30s→120s 상한
        const kind = isQuotaError(msg) ? "quota" : "네트워크";
        console.warn(`  ⏳ ${word} ${kind} 대기 ${(wait / 1000)}s (${transientAttempt}/${QUOTA_RETRY})`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      // 그 외 알 수 없는 오류 — 안전하게 일시적 취급(영구 블랙리스트 안 함)
      console.warn(`  ⚠ ${word} 알 수 없는 오류: ${msg}`);
      contentAttempt++;
      await new Promise((r) => setTimeout(r, 1500 * contentAttempt));
    }
  }
  // contentAttempt 소진 = 안전필터로 끝까지 막힘 → 영구 스킵 대상
  return { status: "blocked" };
}

// 안전필터 등으로 영구 실패한 단어 — 재시작마다 또 재시도하지 않도록 기록
const FAILED_LIST_PATH = join(process.cwd(), "public", "images", ".word-images-failed.json");

function loadFailedWords(): Set<string> {
  if (!existsSync(FAILED_LIST_PATH)) return new Set();
  try {
    return new Set(JSON.parse(readFileSync(FAILED_LIST_PATH, "utf8")));
  } catch {
    return new Set();
  }
}

function saveFailedWords(words: Set<string>) {
  writeFileSync(FAILED_LIST_PATH, JSON.stringify([...words], null, 2));
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Imagen 모델: ${IMAGE_MODEL} · 프로젝트: ${PROJECT} · 리전: ${LOCATION}`);

  // LIMIT 환경변수로 부분 실행 가능 (스모크 테스트용): LIMIT=5
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
  const entries = Object.entries(WORD_IMAGE_SLUGS).slice(0, limit);
  const failedWords = loadFailedWords();
  let done = 0, skipped = 0, failed = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    let anyGenerated = false;
    await Promise.all(
      batch.map(async ([word, slug]) => {
        const outPath = join(OUT_DIR, `${slug}.webp`);
        if (existsSync(outPath) || failedWords.has(word)) { skipped++; return; }

        const res = await withRetry(word);
        if (res.status === "ok") {
          writeFileSync(outPath, res.buf);
          done++;
          anyGenerated = true;
          console.log(`  ✓ ${word} → ${slug}.webp (${(res.buf.length / 1024).toFixed(1)}KB)`);
        } else if (res.status === "blocked") {
          // 안전필터로 영구 차단된 단어만 스킵 목록에 추가
          failed++;
          failedWords.add(word);
          saveFailedWords(failedWords);
          console.error(`  ✗ ${word} 안전필터 차단 (영구 스킵 목록에 추가)`);
        } else {
          // transient(네트워크/quota): 영구 처리 안 함 — 다음 실행에 재시도
          failed++;
          console.warn(`  ↻ ${word} 일시적 실패 (다음 실행에 재시도)`);
        }
      }),
    );
    // 스킵만 했다면 딜레이 없이 즉시 다음 배치 (빠른 탐색)
    if (anyGenerated && i + BATCH_SIZE < entries.length) await new Promise((r) => setTimeout(r, DELAY_MS));
    if (i % 200 === 0 || anyGenerated) console.log(`진행: ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length} (신규:${done} 스킵:${skipped})`);
  }

  console.log(`\n완료 — 생성 ${done} · 건너뜀 ${skipped} · 실패 ${failed}`);
}

// 직접 실행(npx tsx scripts/generate-word-images.ts)일 때만 생성을 시작.
// verify-word-images.ts 등에서 import 시엔 main()이 자동 실행되지 않음.
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
const isDirectRun = (() => {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();
if (isDirectRun) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
