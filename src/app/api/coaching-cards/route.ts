export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// POST body: { words: string[], errorPattern: string, childName: string }
// 응답: { cards: { context: string; emoji: string; phrases: string[] }[] }
export async function POST(req: NextRequest) {
  try {
    const { words, errorPattern, childName } = await req.json();
    if (!words?.length) return NextResponse.json({ cards: [] });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ cards: [] });

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `당신은 10년 경력의 아동 언어재활사입니다.
아이(이름: ${childName ?? "아이"})가 오늘 아래 단어들을 발음 연습했어요.
오류 패턴: ${errorPattern ?? "발음 오류"}
연습 단어: ${words.join(", ")}

부모가 하루 중 자연스러운 상황에서 아이와 짧게 연습할 수 있도록
3가지 상황별 연습 문구를 만들어주세요.

규칙:
- 각 상황마다 짧은 연습 문구 3개 (아이에게 말할 것처럼)
- 연습한 단어나 같은 음소가 들어간 단어 포함
- 쉽고 자연스러운 말투, 따뜻하게
- 영어/전문용어 사용 금지

JSON으로만 응답:
{
  "cards": [
    {
      "context": "🍽 식사 시간",
      "phrases": ["밥 먹을 때 '사과 주스 마실까?'라고 말해봐요", "..."]
    },
    {
      "context": "🛁 씻는 시간",
      "phrases": ["목욕할 때 '비누로 손 씻어봐'라고 해봐요", "..."]
    },
    {
      "context": "🚗 이동 중",
      "phrases": ["차 타고 갈 때 '신호등이 빨간색이다'라고 해봐요", "..."]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ cards: [] });
  }
}
