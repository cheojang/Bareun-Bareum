/**
 * Gemini Flash API 클라이언트 (서버 전용 라이브러리)
 * 공식 @google/generative-ai SDK 사용
 * 주의: 이 파일은 서버 사이드에서만 import해야 합니다
 * ('use server' 지시어 미사용 - API Route에서 import 시 충돌 발생)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// 503 과부하 시 Flash → Pro 순서로 폴백
// Flash가 바쁠 때 Pro는 사용자 수가 적어 여유롭고 품질도 더 높음
const MODEL_FALLBACK = ['gemini-2.5-flash', 'gemini-1.5-pro'];

// Gemini AI 인스턴스 (싱글톤)
let genai: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genai && process.env.GEMINI_API_KEY) {
    genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genai;
}

function is503(e: any) {
  return e?.message?.includes('503') || e?.message?.includes('Service Unavailable');
}

function buildSystemInstruction() {
  return `당신은 15년 경력의 아동 언어발달 전문가(언어재활사)입니다.
부모가 아동의 '오답 발음'을 입력하면, 이를 음운학적으로 분석하고, 가정 내 훈련법(Home-T)을 제공합니다.
친절하고 구체적인 2~4문장 상세 가이드를 제공하세요. 'X세 아이에게는~'과 같은 상투적인 나이 언급 서두는 생략하고 바로 핵심 원인과 분석을 설명하세요.`;
}

function buildUserPrompt(
  targetWord: string,
  childPronunciation: string,
  errorType: string,
  errorCategory: string,
  childAge: number
) {
  return `오류 정보:
- 목표 단어: ${targetWord}
- 아이 발음: ${childPronunciation}
- 오류 패턴: ${errorType} (${errorCategory})
- 아이 나이: ${childAge}세

JSON으로 응답하세요:
{
  "patternName": "오류 패턴 이름 (간결하게)",
  "rootCause": "상세 원인 분석",
  "trainingStep1": "1단계 조음 감각 깨우기",
  "trainingStep2": "2단계 소리 느끼기",
  "trainingStep3": "3단계 음절/단어 연결",
  "trainingStep4": "4단계 일상 적용",
  "recommendedWords": ["추천단어1", "추천단어2", "추천단어3", "추천단어4", "추천단어5"],
  "parentMessage": "따뜻한 격려 메시지",
  "geminiConfidence": 5
}`;
}

function calcChildAge(child: any): number {
  try {
    if (child?.birthDate) {
      const birthDate = new Date(child.birthDate);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        return Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
    }
  } catch {}
  return 4;
}

/**
 * Gemini 모델을 통한 오류 분석 및 훈련법 생성 (비스트리밍)
 */
export async function getGeminiFeedback(
  targetWord: string,
  childPronunciation: string,
  errorType: string,
  errorCategory: string,
  child: any,
  isUnknownPattern = false,
  localParentHint = "",
  localDescription = ""
) {
  const ai = getGenAI();
  if (!ai) {
    console.warn('Gemini API 키가 설정되지 않았습니다');
    return null;
  }

  const childAge = calcChildAge(child);
  const userPrompt = buildUserPrompt(targetWord, childPronunciation, errorType, errorCategory, childAge);

  for (let i = 0; i < MODEL_FALLBACK.length; i++) {
    const modelName = MODEL_FALLBACK[i];
    try {
      if (i > 0) console.log(`[Gemini] 폴백 모델 사용: ${modelName}`);
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemInstruction(),
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });

      const responseText = result.response.text()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      try {
        let parsed = JSON.parse(responseText);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);

        return {
          success: true,
          patternName: parsed.patternName,
          rootCause: parsed.rootCause,
          trainingStep1: parsed.trainingStep1,
          trainingStep2: parsed.trainingStep2,
          trainingStep3: parsed.trainingStep3,
          trainingStep4: parsed.trainingStep4,
          recommendedWords: parsed.recommendedWords || [],
          parentMessage: parsed.parentMessage,
          geminiConfidence: parsed.geminiConfidence || 5,
          isIndividualHabit: false,
        };
      } catch {
        return buildFallbackGuidance([], childPronunciation, "응답 파싱 에러");
      }
    } catch (error: any) {
      if (is503(error) && i < MODEL_FALLBACK.length - 1) {
        console.warn(`[Gemini] ${modelName} 503 과부하, ${MODEL_FALLBACK[i + 1]}로 폴백`);
        continue;
      }
      return buildFallbackGuidance([], childPronunciation, error.message);
    }
  }

  return buildFallbackGuidance([], childPronunciation, "모든 모델 503");
}

/**
 * Gemini 스트리밍 분석 (503 시 Pro 모델로 자동 폴백)
 */
export async function getGeminiFeedbackStream(
  targetWord: string,
  childPronunciation: string,
  errorType: string,
  errorCategory: string,
  child: any,
  isUnknownPattern = false,
  localParentHint = "",
  localDescription = ""
) {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API 키가 설정되지 않았습니다');

  const childAge = calcChildAge(child);
  const userPrompt = buildUserPrompt(targetWord, childPronunciation, errorType, errorCategory, childAge);

  for (let i = 0; i < MODEL_FALLBACK.length; i++) {
    const modelName = MODEL_FALLBACK[i];
    try {
      if (i > 0) console.log(`[Gemini Stream] 폴백 모델 사용: ${modelName}`);
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemInstruction(),
      });

      return await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });
    } catch (e: any) {
      if (is503(e) && i < MODEL_FALLBACK.length - 1) {
        console.warn(`[Gemini Stream] ${modelName} 503 과부하, ${MODEL_FALLBACK[i + 1]}로 폴백`);
        continue;
      }
      throw e;
    }
  }

  throw new Error('모든 Gemini 모델이 503 상태입니다');
}

/**
 * Fallback 가이드 생성
 */
function buildFallbackGuidance(errors: any[], childPronunciation: string, actualError?: string) {
  return {
    success: false,
    errorMessage: actualError,
    rootCause: actualError || "분석 중 오류가 발생했습니다.",
    trainingStep1: "AI 분석 실패",
    trainingStep2: "AI 분석 실패",
    trainingStep3: "AI 분석 실패",
    trainingStep4: "AI 분석 실패",
    recommendedWords: [],
    parentMessage: "잠시 후 다시 시도해주세요.",
    geminiConfidence: 1,
    isIndividualHabit: false,
  };
}

/**
 * 약점 음소 분석 리포트 생성 (503 시 Pro 모델로 자동 폴백)
 */
export async function generateWeakPhonemeReport(
  childName: string,
  weakPhonemes: Array<{
    phoneme: string;
    errorRate: number;
    totalAttempts: number;
  }>
) {
  const ai = getGenAI();
  if (!ai) return null;

  const phonemeList = weakPhonemes
    .map((p) => `${p.phoneme} (오류율 ${Math.round(p.errorRate)}%, ${p.totalAttempts}회 시도)`)
    .join('\n');

  const prompt = `${childName}의 발음 교정 약점 분석:\n\n${phonemeList}\n\n이 약점들을 종합하여 부모에게 도움이 될 만한 조언을 3~4문장으로 해주세요.`;

  for (let i = 0; i < MODEL_FALLBACK.length; i++) {
    const modelName = MODEL_FALLBACK[i];
    try {
      if (i > 0) console.log(`[Gemini Report] 폴백 모델 사용: ${modelName}`);
      const model = ai.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      if (is503(error) && i < MODEL_FALLBACK.length - 1) {
        console.warn(`[Gemini Report] ${modelName} 503 과부하, ${MODEL_FALLBACK[i + 1]}로 폴백`);
        continue;
      }
      console.error('[Gemini API Error]', error);
      return null;
    }
  }

  return null;
}
