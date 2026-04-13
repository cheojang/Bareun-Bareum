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
 * Gemini Flash를 통한 오류 분석 및 훈련법 생성 (언어치료학적 지식 기반)
 * @param targetWord 목표 단어 (예: "사과")
 * @param childPronunciation 아이 발음 (예: "따과")
 * @param errorType 로컬에서 판정한 오류 유형 (예: "마찰음의 파열음화")
 * @param errorCategory 오류 카테고리 (예: "대치")
 * @param child Child 객체 (나이 등 메타데이터)
 * @returns 원인, 훈련법(조음/언어/놀이), 추천 단어, 응원 메시지
 */
export async function getGeminiFeedback(
  targetWord: string,
  childPronunciation: string,
  errorType: string,
  errorCategory: string,
  child: any,
  isUnknownPattern = false
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

    // 모델 선택 (gemini-2.0-flash 권장)
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 시스템 프롬프트 (언어치료학적 전문성)
    const systemPrompt = `당신은 15년 경력의 아동 언어발달 전문가(언어재활사)이자 풀스택 개발자입니다.
부모가 아동의 '오답 발음'을 입력하면, 이를 음운학적으로 분석하고, 가정 내 훈련법(Home-T)을 제공합니다.

[핵심 원칙]
1. 모든 설명은 어려운 언어학 용어 대신 쉬운 비유와 신체감각을 사용합니다. (예: "마찰음의 파열음화" → "바람이 숨어버렸어요! 혀가 꽉 닫혀서 강한 소리가 나고 있어요.")
2. 훈련법은 조음(발음 기관 움직임), 언어(말소리 구분), 놀이(정서 및 상황) 3영역을 통합합니다.
3. 각 훈련 단계마다 "포인트"를 명시하여 부모가 실수하기 쉬운 부분을 미리 알립니다.
4. 마지막에는 부모에게 공감과 격려의 메시지를 꼭 포함합니다.

[훈련 4단계 구조]
- 1단계: 조음 감각 깨우기 (혀/입술의 기관 감각)
- 2단계: 소리 느끼기 (음소의 특징을 직접 체험)
- 3단계: 연결하고 반복하기 (음절/단어 결합)
- 4단계: 일상 대화에서 적용 (문장 및 자연스러운 상황)`;

    // 알 수 없는 패턴일 경우 추가 안내
    const unknownPatternNote = isUnknownPattern
      ? `\n⚠️ 참고: 이 발음은 일반적인 조음 오류 패턴 데이터베이스에 등록되지 않은 경우입니다. 최선을 다해 분석해주되, 분석이 불확실하다면 8번 신뢰도를 낮게 주세요.`
      : '';

    // 사용자 프롬프트
    const userPrompt = `다음 조음 오류를 분석해주세요:${unknownPatternNote}

【오류 정보】
- 목표 단어: ${targetWord}
- 아이 발음: ${childPronunciation}
- 오류 카테고리: ${errorCategory}
- 판정된 패턴: ${errorType}
- 아이 나이: ${childAge}세

【요청 형식】
다음 형식으로 정확히 한국어 답변해주세요. 마크다운 형식이 아닌 순수 텍스트로:

1. 원인: (2~3문장, 부모가 이해할 수 있는 쉬운 말과 신체감각. 혀/입술의 위치 설명 포함)

2. 1단계: (제목: 조음 감각 깨우기)
   방법: (구체적이고 따라하기 쉬운 방법. 도구나 인형 활용 가능)
   포인트: (주의할 점 - 부모가 놓치기 쉬운 것)

3. 2단계: (제목: 소리 느끼기)
   방법: (아이가 정상/오답을 구분하도록 하는 방법)
   포인트: (주의할 점)

4. 3단계: (제목: 음절/단어로 연결하기)
   방법: (목표 단어에 가까운 단어들로 연습)
   포인트: (주의할 점)

5. 4단계: (제목: 문장과 일상 상황에서)
   방법: (자연스러운 대화 속에서 반복 연습)
   포인트: (주의할 점)

6. 추천 단어 (쉼표로 구분): 이 발음 오류 패턴이 적용될 가능성이 높은 단어 5개 이상
   (예: 사자, 수박, 우산, 소리, 사진 - 같은 음소가 포함된 쉬운 단어들)

7. 부모님께: (공감과 격려의 메시지. 아이의 발달 속도는 개인차가 크며, 꾸준한 연습이 중요하다는 따뜻한 말씀)

8. 분석 신뢰도 (1~5): (숫자만. 5=확실한 패턴, 3=보통, 1=매우 불확실한 개별 습관)

9. 개별 습관 여부 (예/아니오): (일반적인 조음 발달 패턴으로 설명하기 어려운 아이만의 독특한 습관인지)`;

    // Gemini 호출
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      systemInstruction: systemPrompt
    });

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
 * Gemini 응답 파싱 (언어치료학적 형식)
 * 구조화된 형식으로 추출 + 부모님께 응원 메시지 포함
 */
function parseGeminiFeedback(responseText: string) {
  try {
    // 1. 원인 추출
    const causeMatch = responseText.match(/1\.\s*원인:([\s\S]*?)(?=2\.|3\.)/);
    const rootCause = causeMatch
      ? causeMatch[1].trim()
      : '원인을 분석할 수 없습니다';

    // 2. 훈련 단계별 추출 (정규식 패턴 개선)
    const step1Match = responseText.match(/2\.\s*1단계:([\s\S]*?)(?=3\.)/);
    const step2Match = responseText.match(/3\.\s*2단계:([\s\S]*?)(?=4\.)/);
    const step3Match = responseText.match(/4\.\s*3단계:([\s\S]*?)(?=5\.)/);
    const step4Match = responseText.match(/5\.\s*4단계:([\s\S]*?)(?=6\.)/);

    const trainingStep1 = step1Match ? step1Match[1].trim() : '단계 정보 없음';
    const trainingStep2 = step2Match ? step2Match[1].trim() : '단계 정보 없음';
    const trainingStep3 = step3Match ? step3Match[1].trim() : '단계 정보 없음';
    const trainingStep4 = step4Match ? step4Match[1].trim() : '단계 정보 없음';

    // 3. 추천 단어 추출
    const wordsMatch = responseText.match(/6\.\s*추천 단어[:\s]*([\s\S]*?)(?=7\.|부모님께|$)/);
    const wordsText = wordsMatch ? wordsMatch[1].trim() : '';
    const recommendedWords = wordsText
      .split(/[,،、]/) // 쉼표와 다양한 구분 기호 지원
      .map((w) => w.trim())
      .filter((w) => w.length > 0 && w !== '예:' && !w.includes('('))
      .slice(0, 10); // 최대 10개

    // 4. 부모님께 응원 메시지 추출
    const parentMessageMatch = responseText.match(/7\.\s*부모님께:([\s\S]*?)(?=8\.|$)|부모님께:([\s\S]*?)(?=8\.|$)/);
    const parentMessage = parentMessageMatch
      ? (parentMessageMatch[1] || parentMessageMatch[2]).trim()
      : '매일 조금씩 함께 연습하며 아이의 성장을 응원합니다. 모든 아이는 자신의 속도로 발달합니다!';

    // 5. 분석 신뢰도 추출 (1~5)
    const confidenceMatch = responseText.match(/8\.\s*분석 신뢰도[^:]*:\s*(\d)/);
    const geminiConfidence = confidenceMatch ? parseInt(confidenceMatch[1], 10) : 3;

    // 6. 개별 습관 여부 추출
    const individualHabitMatch = responseText.match(/9\.\s*개별 습관 여부[^:]*:\s*(예|아니오|네|yes|no)/i);
    const isIndividualHabit =
      geminiConfidence <= 2 ||
      (individualHabitMatch ? ['예', '네', 'yes'].includes(individualHabitMatch[1].toLowerCase()) : false);

    return {
      success: true,
      rootCause,
      trainingStep1,
      trainingStep2,
      trainingStep3,
      trainingStep4,
      recommendedWords,
      parentMessage,
      geminiConfidence,
      isIndividualHabit,
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
