import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

  let body: { words?: string[]; errorPattern?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { words = [], errorPattern } = body;

  if (words.length === 0) {
    return NextResponse.json({ error: "words 필수" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ sentences: buildFallbackSentences(words) });
  }

  try {
    // dynamic import으로 @google/generative-ai 타입 오류 우회
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GoogleGenerativeAI } = require("@google/generative-ai");
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

    return NextResponse.json({
      sentences: sentences.length > 0 ? sentences : buildFallbackSentences(words),
    });
  } catch (error) {
    console.error("practice-sentences Gemini error:", error);
    return NextResponse.json({ sentences: buildFallbackSentences(words) });
  }
}

/** Gemini 없거나 실패 시 로컬 템플릿 */
function buildFallbackSentences(words: string[]): string[] {
  const templates = [
    (w: string) => `${w}을 봐요.`,
    (w: string) => `${w}이 있어요.`,
    (w: string) => `${w}를 줘요.`,
    (w: string) => `${w}가 좋아요.`,
    (w: string) => `이건 ${w}야.`,
    (w: string) => `${w} 먹어요.`,
  ];
  return words
    .slice(0, 6)
    .map((w, i) => templates[i % templates.length](w));
}
