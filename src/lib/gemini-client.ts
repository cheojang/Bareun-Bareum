/**
 * Gemini Flash API 클라이언트
 * 공식 @google/generative-ai SDK 사용
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini AI 인스턴스 (싱글톤)
let genai: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genai && process.env.GEMINI_API_KEY) {
    genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genai;
}

/**
 * Gemini Flash를 통한 오류 분석 및 훈련법 생성
 * @param targetWord 목표 단어 (예: "사과")
 * @param childPronunciation 아이 발음 (예: "따과")
 * @param errorType 로컬에서 판정한 오류 유형 (예: "경음화")
 * @param errorCategory 오류 카테고리 (예: "대치")
 * @param child Child 객체 (나이 등 메타데이터)
 * @returns 원인, 훈련법, 추천 단어
 */
export async function getGeminiFeedback(
  targetWord: string,
  childPronunciation: string,
  errorType: string,
  errorCategory: string,
  child: any
) {
  try {
    const ai = getGenAI();
    if (!ai) {
      console.warn('Gemini API 키가 설정되지 않았습니다');
      return null;
    }

    // 아이 나이 계산
    let childAge = 4; // 기본값
    if (child.birthDate) {
      const birthDate = new Date(child.birthDate);
      const today = new Date();
      childAge = Math.floor(
        (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
    }

    // 모델 선택 (gemini-1.5-flash 또는 gemini-2.0-flash)
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 사용자 프롬프트
    const userPrompt = `다음 조음 오류를 분석해주세요:

목표 단어: ${targetWord}
아이 발음: ${childPronunciation}
오류 카테고리: ${errorCategory}
판정된 패턴: ${errorType}
아이 나이: ${childAge}세

다음 형식으로 한국어 답변을 주세요:

1. 원인: (2~3문장, 부모가 이해할 수 있는 쉬운 말)

2. 1단계: (제목)
   방법: (구체적인 방법)
   포인트: (주의할 점)

3. 2단계: (제목)
   방법: (구체적인 방법)
   포인트: (주의할 점)

4. 3단계: (제목)
   방법: (구체적인 방법)
   포인트: (주의할 점)

5. 4단계: (제목)
   방법: (구체적인 방법)
   포인트: (주의할 점)

6. 추천 단어 (쉼표로 구분): 단어1, 단어2, 단어3, 단어4, 단어5`;

    // Gemini 호출
    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    // 응답 파싱
    const parsed = parseGeminiFeedback(responseText);
    return parsed;
  } catch (error) {
    console.error('Gemini API 오류:', error);
    return null;
  }
}

/**
 * Gemini 응답 파싱
 * 구조화된 형식으로 추출
 */
function parseGeminiFeedback(responseText: string) {
  try {
    // 1. 원인 추출
    const causeMatch = responseText.match(/1\.\s*원인:([\s\S]*?)(?=2\.|3\.)/);
    const rootCause = causeMatch
      ? causeMatch[1].trim()
      : '원인을 분석할 수 없습니다';

    // 2. 훈련 단계별 추출
    const step1Match = responseText.match(/2\.\s*1단계:([\s\S]*?)(?=3\.)/);
    const step2Match = responseText.match(/3\.\s*2단계:([\s\S]*?)(?=4\.)/);
    const step3Match = responseText.match(/4\.\s*3단계:([\s\S]*?)(?=5\.)/);
    const step4Match = responseText.match(/5\.\s*4단계:([\s\S]*?)(?=6\.)/);

    const trainingStep1 = step1Match ? step1Match[1].trim() : '단계 정보 없음';
    const trainingStep2 = step2Match ? step2Match[1].trim() : '단계 정보 없음';
    const trainingStep3 = step3Match ? step3Match[1].trim() : '단계 정보 없음';
    const trainingStep4 = step4Match ? step4Match[1].trim() : '단계 정보 없음';

    // 3. 추천 단어 추출
    const wordsMatch = responseText.match(/6\.\s*추천 단어[:\s]*([\s\S]*?)$/);
    const wordsText = wordsMatch ? wordsMatch[1].trim() : '';
    const recommendedWords = wordsText
      .split(/[,،、]/) // 쉼표와 다양한 구분 기호 지원
      .map((w) => w.trim())
      .filter((w) => w.length > 0)
      .slice(0, 5); // 최대 5개

    return {
      success: true,
      rootCause,
      trainingStep1,
      trainingStep2,
      trainingStep3,
      trainingStep4,
      recommendedWords,
    };
  } catch (error) {
    console.error('Gemini 응답 파싱 오류:', error);
    return {
      success: false,
      error: 'Gemini 응답 파싱 실패',
    };
  }
}

/**
 * 약점 음소 분석 리포트 생성 (향후 확장)
 * @param childName 아이 이름
 * @param weakPhonemes 약점 음소 배열
 * @returns 분석 리포트
 */
export async function generateWeakPhonemeReport(
  childName: string,
  weakPhonemes: Array<{
    phoneme: string;
    errorRate: number;
    totalAttempts: number;
  }>
) {
  try {
    const ai = getGenAI();
    if (!ai) return null;

    const phonemeList = weakPhonemes
      .map((p) => `${p.phoneme} (오류율 ${Math.round(p.errorRate)}%, ${p.totalAttempts}회 시도)`)
      .join('\n');

    const prompt = `${childName}의 발음 교정 약점 분석:

${phonemeList}

이 약점들을 종합하여 부모에게 도움이 될 만한 조언을 3~4문장으로 해주세요.`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error('약점 분석 리포트 생성 오류:', error);
    return null;
  }
}
