/**
 * Gemini AI 모델 - 세션 브리핑 및 가이던스 생성
 * 공식 @google/generative-ai SDK 사용
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PhonemeError } from '@/types/phonetics';

let genai: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genai && process.env.GEMINI_API_KEY) {
    genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genai;
}

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
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
    return buildFallbackGuidance(errors);
  }

  try {
    const ai = getGenAI();
    if (!ai) return buildFallbackGuidance(errors);

    const errorDescriptions = errors.map((e) => {
      if (e.errorType === 'omission') {
        return `'${e.syllableChar}'에서 '${e.targetPhoneme}' 소리가 생략됨 (${e.articulationPlace}, ${e.articulationManner})`;
      }
      if (e.errorType === 'addition') {
        return `'${e.syllableChar}'에서 음소가 첨가됨 (${e.articulationPlace}, ${e.articulationManner})`;
      }
      return `'${e.syllableChar}'에서 '${e.targetPhoneme}' 대신 '${e.heardPhoneme}' 발음 (${e.articulationPlace}, ${e.articulationManner})`;
    });

    const prompt = `
목표 단어: "${targetWord}"
아이가 발음한 것: "${heardWord}"
발견된 조음 오류:
${errorDescriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

이 오류를 부모에게 설명하고 집에서 연습하는 방법을 2-3문장으로 안내해주세요.`;

    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const result = await model.generateContent(prompt);
    return result.response.text() || buildFallbackGuidance(errors);
  } catch {
    return buildFallbackGuidance(errors);
  }
}

export async function generateWordRecommendationContext(errorPatterns: string[]): Promise<string> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
    return '';
  }

  try {
    const ai = getGenAI();
    if (!ai) return '';

    const prompt = `아이가 자주 어려워하는 발음: ${errorPatterns.join(', ')}
이 발음들을 연습하기 좋은 짧은 응원 메시지를 한 문장으로 써주세요.`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);

    return result.response.text() || '';
  } catch {
    return '';
  }
}

// ─── Session Briefing ─────────────────────────────────────────────────────────

const BRIEFING_SYSTEM_INSTRUCTION = `당신은 아동 언어치료 전문가입니다.
연습 세션을 시작하기 전에 부모에게 30초 안에 읽을 수 있는 짧고 격려하는 팁을 제공합니다.
- 2문장 이내로 간결하게
- 따뜻하고 자신감을 주는 말투
- 오늘 집중할 발음과 연습 팁 포함`;

export async function generateSessionBriefing(topErrorPhonemes: string[]): Promise<string> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
    return buildFallbackBriefing(topErrorPhonemes);
  }

  try {
    const ai = getGenAI();
    if (!ai) return buildFallbackBriefing(topErrorPhonemes);

    const prompt =
      topErrorPhonemes.length > 0
        ? `아이가 최근 자주 어려워하는 발음: ${topErrorPhonemes.slice(0, 3).join(', ')}
이번 연습 전에 부모에게 오늘 집중할 포인트와 격려 메시지를 2문장으로 주세요.`
        : `아이의 발음 연습 세션을 시작하기 전에 부모에게 격려와 연습 팁을 2문장으로 주세요.`;

    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: BRIEFING_SYSTEM_INSTRUCTION
    });

    const result = await model.generateContent(prompt);
    return result.response.text() || buildFallbackBriefing(topErrorPhonemes);
  } catch {
    return buildFallbackBriefing(topErrorPhonemes);
  }
}

function buildFallbackBriefing(topErrorPhonemes: string[]): string {
  if (topErrorPhonemes.length === 0) {
    return '오늘도 즐거운 연습 시간이 되길 바라요! 천천히, 정확하게 발음하는 게 가장 중요해요. 아이가 잘 할 수 있을 거예요 💪';
  }

  const phoneme = topErrorPhonemes[0];
  const tipMap: Record<string, string> = {
    'ㄹ': `오늘은 '${phoneme}' 소리에 집중해봐요! 혀 끝을 윗니 뒤쪽에 살짝 대고 '라라라' 노래를 불러보면 좋아요.`,
    'ㅅ': `'${phoneme}' 소리가 오늘의 목표예요! 이를 살짝 붙이고 바람을 조금씩 내보내는 연습을 해봐요.`,
    'ㅈ': `오늘은 '${phoneme}' 소리를 집중 연습해요! 혀를 윗잇몸에 댔다가 떼면서 '자' 소리를 내봐요.`,
    'ㅊ': `'${phoneme}' 소리가 오늘의 포인트예요! 강하게 바람을 내뱉으며 '차!' 라고 해봐요.`,
    'ㄱ': `'${phoneme}' 소리를 연습할게요! 목 뒤쪽에서 소리가 나도록 '꿀꺽' 삼키는 느낌으로 해봐요.`,
    'ㄴ': `'${phoneme}' 소리에 집중해요! 혀 끝을 윗잇몸에 붙이고 콧소리로 '은~' 해봐요.`,
    'ㅂ': `오늘은 '${phoneme}' 소리를 연습해요! 입술을 붙였다가 '팝!' 하고 터트려봐요.`,
  };

  const tip = tipMap[phoneme] ?? `'${phoneme}' 소리를 집중적으로 연습해볼게요! 천천히, 여러 번 반복하면 꼭 늘어나요.`;
  return tip + ' 아이가 정말 잘 할 수 있을 거예요, 응원해주세요! 🌟';
}

function buildFallbackGuidance(errors: PhonemeError[]): string {
  if (errors.length === 0) {
    return '완벽해요! 아이가 정확하게 발음했어요. 계속 연습하면 더 잘할 거예요! 🌟';
  }

  const primary = errors[0];
  const tips: Record<string, string> = {
    'ㄹ': "혀 끝을 윗니 뒤쪽에 살짝 대고 튕겨보세요. '라라라' 노래를 함께 불러보는 것도 좋아요!",
    'ㅅ': "이를 살짝 붙이고 바람을 조금씩 내보내보세요. '쉬~' 소리를 내보게 해보세요.",
    'ㅈ': "혀를 윗잇몸에 대었다가 '자' 하고 떼어보세요.",
    'ㅊ': "혀를 윗잇몸에 대었다가 바람과 함께 '차!' 하고 강하게 내보내세요.",
    'ㄱ': "목 뒤쪽에서 소리가 나도록 '꿀꺽' 삼키는 느낌으로 해보세요.",
    'ㄴ': "혀 끝을 윗잇몸에 붙이고 콧소리로 '은~' 해보세요.",
    'ㅂ': "입술을 붙였다가 '팝!' 하고 터트려보세요.",
  };

  const tip = tips[primary.targetPhoneme] ?? `'${primary.targetPhoneme}' 소리를 연습해보세요.`;
  return `'${primary.targetPhoneme}' 발음이 조금 어려웠어요. ${tip} 아이와 함께 거울 앞에서 입 모양을 보면서 연습해보세요!`;
}
