import { GoogleGenAI } from "@google/genai";
import { PhonemeError } from "@/types/phonetics";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

const SYSTEM_INSTRUCTION = `당신은 아동 언어치료 전문가입니다.
한국 아동의 조음(발음) 오류를 부모에게 쉽고 친근하게 설명하고, 집에서 연습할 수 있는 구체적이고 재미있는 방법을 안내합니다.
- 전문 용어 대신 쉬운 말을 사용하세요
- 짧고 따뜻한 말투로 2-3문장 이내로 답하세요
- 아이가 좌절하지 않도록 격려하는 표현을 섞어주세요
- 구체적인 혀/입술 위치나 놀이 방법을 제안하세요`;

export async function generateGuidance(
  targetWord: string,
  heardWord: string,
  errors: PhonemeError[]
): Promise<string> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key") {
    return buildFallbackGuidance(errors);
  }

  const errorDescriptions = errors.map((e) => {
    if (e.errorType === "omission") {
      return `'${e.syllableChar}'에서 '${e.targetPhoneme}' 소리가 생략됨 (${e.articulationPlace}, ${e.articulationManner})`;
    }
    return `'${e.syllableChar}'에서 '${e.targetPhoneme}' 대신 '${e.heardPhoneme}' 발음 (${e.articulationPlace}, ${e.articulationManner})`;
  });

  const prompt = `
목표 단어: "${targetWord}"
아이가 발음한 것: "${heardWord}"
발견된 조음 오류:
${errorDescriptions.map((d, i) => `${i + 1}. ${d}`).join("\n")}

이 오류를 부모에게 설명하고 집에서 연습하는 방법을 2-3문장으로 안내해주세요.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: { systemInstruction: SYSTEM_INSTRUCTION },
      contents: prompt,
    });
    return response.text ?? buildFallbackGuidance(errors);
  } catch {
    return buildFallbackGuidance(errors);
  }
}

export async function generateWordRecommendationContext(
  errorPatterns: string[]
): Promise<string> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key") {
    return "";
  }

  const prompt = `아이가 자주 어려워하는 발음: ${errorPatterns.join(", ")}
이 발음들을 연습하기 좋은 짧은 응원 메시지를 한 문장으로 써주세요.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text ?? "";
  } catch {
    return "";
  }
}

// Rule-based fallback when no API key
function buildFallbackGuidance(errors: PhonemeError[]): string {
  if (errors.length === 0) {
    return "완벽해요! 아이가 정확하게 발음했어요. 계속 연습하면 더 잘할 거예요! 🌟";
  }

  const primary = errors[0];
  const tips: Record<string, string> = {
    "ㄹ": "혀 끝을 윗니 뒤쪽에 살짝 대고 튕겨보세요. '라라라' 노래를 함께 불러보는 것도 좋아요!",
    "ㅅ": "이를 살짝 붙이고 바람을 조금씩 내보내보세요. '쉬~' 소리를 내보게 해보세요.",
    "ㅈ": "혀를 윗잇몸에 대었다가 '자' 하고 떼어보세요.",
    "ㅊ": "혀를 윗잇몸에 대었다가 바람과 함께 '차!' 하고 강하게 내보내세요.",
    "ㄱ": "목 뒤쪽에서 소리가 나도록 '꿀꺽' 삼키는 느낌으로 해보세요.",
    "ㄴ": "혀 끝을 윗잇몸에 붙이고 콧소리로 '은~' 해보세요.",
    "ㅂ": "입술을 붙였다가 '팝!' 하고 터트려보세요.",
  };

  const tip = tips[primary.targetPhoneme] ?? `'${primary.targetPhoneme}' 소리를 연습해보세요.`;
  return `'${primary.targetPhoneme}' 발음이 조금 어려웠어요. ${tip} 아이와 함께 거울 앞에서 입 모양을 보면서 연습해보세요!`;
}
