import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { decomposeChar } from "@/lib/jamo-analysis";

// 🎯 목표 발음 하이라이팅: 문장에서 목표 발음이 있는 글자 위치 찾기
interface SentenceWithHighlights {
  text: string;
  highlights: number[]; // 목표 발음이 있는 글자의 위치 배열
}

function findTargetPhonemePositions(
  sentence: string,
  targetPhoneme: string
): number[] {
  const positions: number[] = [];
  for (let i = 0; i < sentence.length; i++) {
    const char = sentence[i];
    const decomposed = decomposeChar(char);
    // 초성, 중성, 종성 중 목표 발음이 포함되어 있는지 확인
    if (
      decomposed?.choseong === targetPhoneme ||
      decomposed?.jungseong === targetPhoneme ||
      decomposed?.jongseong === targetPhoneme
    ) {
      positions.push(i);
    }
  }
  return positions;
}

// 🇰🇷 한국어 조사 자동 변환 헬퍼 함수 (받침 유무 판별)
function appendJosa(
  word: string,
  josaType: "은는" | "이가" | "을를" | "와과"
): string {
  const lastChar = word.charCodeAt(word.length - 1);
  // 한글 범위가 아니면 기본(앞쪽) 조사 반환
  if (lastChar < 0xac00 || lastChar > 0xd7a3) {
    return word + josaType.charAt(0);
  }

  // 한글 유니코드: 0xAC00 ~ 0xD7A3
  // (charCode - 0xAC00) % 28로 받침(종성) 판별 (0이면 받침 없음)
  const hasJongseong = (lastChar - 0xac00) % 28 > 0;

  if (josaType === "은는") return word + (hasJongseong ? "은" : "는");
  if (josaType === "이가") return word + (hasJongseong ? "이" : "가");
  if (josaType === "을를") return word + (hasJongseong ? "을" : "를");
  if (josaType === "와과") return word + (hasJongseong ? "과" : "와");

  return word;
}

/**
 * POST /api/practice-sentences
 * 연습한 단어 목록을 받아 Gemini로 짧은 문장 생성
 * 3단계: 단어 → 문장으로 훈련 확장
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { words?: string[]; errorPattern?: string; targetPhoneme?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { words = [], errorPattern, targetPhoneme } = body;

  if (words.length === 0) {
    return NextResponse.json({ error: "words 필수" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const fallback = buildFallbackSentences(words);
    const response =
      targetPhoneme && fallback.length > 0
        ? {
            sentences: fallback.map((s) => ({
              text: s,
              highlights: findTargetPhonemePositions(s, targetPhoneme),
            })),
          }
        : { sentences: fallback };
    return NextResponse.json(response);
  }

  try {
    // ✨ ESM 방식 import로 Next.js 최적화 보장
    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const wordList = words.slice(0, 8).join(", ");
    const prompt = `아동 언어치료 발음 연습용 짧은 문장을 만들어주세요.

단어 목록: ${wordList}
${errorPattern ? `교정 중인 발음 패턴: ${errorPattern}` : ""}

요구사항:
- 만 4~6세 아이가 이해할 수 있는 쉬운 문장
- 각 문장에 위 단어 중 하나를 반드시 포함
- 문장 길이: 5~12글자 (한국어 기준)
- 자연스럽고 따라 말하기 쉬운 문장
- 문장만 줄바꿈으로 구분, 마크다운 없이, 6개 이상

예시:
사과를 먹어요.
사자가 뛰어요.
수박이 달아요.`;

    const result = await model.generateContent(prompt);
    const text: string = result.response.text();

    const sentences: string[] = text
      .split("\n")
      .map((s: string) => s.trim().replace(/^[-*•]\s*/, ""))
      .filter((s: string) => s.length >= 3 && s.length <= 20)
      .slice(0, 8);

    const finalSentences =
      sentences.length > 0 ? sentences : buildFallbackSentences(words);

    // 🎯 목표 발음이 있으면 하이라이트 정보 추가
    const response =
      targetPhoneme && finalSentences.length > 0
        ? {
            sentences: finalSentences.map((s) => ({
              text: s,
              highlights: findTargetPhonemePositions(s, targetPhoneme),
            })),
          }
        : { sentences: finalSentences };

    return NextResponse.json(response);
  } catch (error) {
    console.error("practice-sentences Gemini error:", error);
    const fallback = buildFallbackSentences(words);
    const response =
      targetPhoneme && fallback.length > 0
        ? {
            sentences: fallback.map((s) => ({
              text: s,
              highlights: findTargetPhonemePositions(s, targetPhoneme),
            })),
          }
        : { sentences: fallback };
    return NextResponse.json(response);
  }
}

/** Gemini 없거나 실패 시 로컬 템플릿 (✨ 한국어 조사 자동 변환) */
function buildFallbackSentences(words: string[]): string[] {
  const templates = [
    (w: string) => `${appendJosa(w, "을를")} 봐요.`, // 사과를 봐요 / 수박을 봐요
    (w: string) => `${appendJosa(w, "이가")} 있어요.`, // 사과가 있어요 / 수박이 있어요
    (w: string) => `${appendJosa(w, "을를")} 줘요.`, // 사과를 줘요 / 수박을 줘요
    (w: string) => `${appendJosa(w, "이가")} 좋아요.`, // 사과가 좋아요 / 수박이 좋아요
    (w: string) => `이건 ${w}야.`,
    (w: string) => `${appendJosa(w, "을를")} 먹어요.`, // 사과를 먹어요 / 수박을 먹어요
  ];
  return words
    .slice(0, 6)
    .map((w, i) => templates[i % templates.length](w));
}
