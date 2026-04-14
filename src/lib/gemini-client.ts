'use server';

/**
 * Gemini Flash API 클라이언트
 * 공식 @google/generative-ai SDK 사용
 * 서버 환경에서만 실행 (API Key 보안)
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

    // 사용자 프롬프트 (JSON 응답 요청)
    const userPrompt = `다음 조음 오류를 분석해주세요:${unknownPatternNote}

【오류 정보】
- 목표 단어: ${targetWord}
- 아이 발음: ${childPronunciation}
- 오류 카테고리: ${errorCategory}
- 판정된 패턴: ${errorType}
- 아이 나이: ${childAge}세

【응답 형식】
아래의 JSON 형식으로 정확히 응답해주세요. (Markdown 코드 블록 없이 순수 JSON만 출력):

{
  "rootCause": "아이가 왜 이런 발음을 했는지 부모가 이해하기 쉬운 1-2문장 설명 (혀/입술 위치 포함)",
  "trainingStep1": "1단계 조음 감각 깨우기: 구체적이고 따라하기 쉬운 방법과 주의점 (1문장)",
  "trainingStep2": "2단계 소리 느끼기: 아이가 정상/오답을 구분하도록 하는 방법과 주의점 (1문장)",
  "trainingStep3": "3단계 음절/단어로 연결하기: 목표 단어에 가까운 단어들로 연습하는 방법과 주의점 (1문장)",
  "trainingStep4": "4단계 문장과 일상 상황에서: 자연스러운 대화 속 반복 연습 방법과 주의점 (1문장)",
  "recommendedWords": ["사자", "수박", "우산", "소리", "사진"],
  "parentMessage": "아이의 발달 속도는 개인차가 크며, 꾸준한 연습이 중요합니다. 따뜻한 격려 메시지 (1문장)",
  "geminiConfidence": 4,
  "isIndividualHabit": false
}`;

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

    // JSON 응답 파싱
    try {
      const parsed = JSON.parse(responseText);

      // 필수 필드 검증
      if (!parsed.rootCause || !parsed.trainingStep1) {
        console.error('[Gemini Response Validation] 필수 필드 누락:', parsed);
        return buildFallbackGuidance(
          [{ targetPhoneme: '', heardPhoneme: childPronunciation, errorType, errorCategory }],
          childPronunciation
        );
      }

      return {
        success: true,
        rootCause: parsed.rootCause,
        trainingStep1: parsed.trainingStep1,
        trainingStep2: parsed.trainingStep2 || '2단계 정보 없음',
        trainingStep3: parsed.trainingStep3 || '3단계 정보 없음',
        trainingStep4: parsed.trainingStep4 || '4단계 정보 없음',
        recommendedWords: Array.isArray(parsed.recommendedWords)
          ? parsed.recommendedWords.filter((w: string) => w && w.length > 0).slice(0, 10)
          : [],
        parentMessage: parsed.parentMessage || '매일 조금씩 함께 연습하며 아이의 성장을 응원합니다.',
        geminiConfidence: Math.min(Math.max(parsed.geminiConfidence || 3, 1), 5),
        isIndividualHabit: Boolean(parsed.isIndividualHabit),
      };
    } catch (parseError) {
      console.error('[Gemini JSON Parsing Error]', {
        rawResponse: responseText,
        error: parseError,
      });
      return buildFallbackGuidance(
        [{ targetPhoneme: '', heardPhoneme: childPronunciation, errorType, errorCategory }],
        childPronunciation
      );
    }
  } catch (error) {
    console.error('[Gemini API Error in getGeminiFeedback]', {
      targetWord,
      childPronunciation,
      errorType,
      errorCategory,
      error,
    });
    return buildFallbackGuidance(
      [{ targetPhoneme: '', heardPhoneme: childPronunciation, errorType, errorCategory }],
      childPronunciation
    );
  }
}

/**
 * Gemini API 오류 또는 파싱 실패 시 fallback 훈련법 생성
 * 첨가 오류(Addition)처럼 targetPhoneme이 없는 경우도 대비
 */
function buildFallbackGuidance(
  errors: Array<{ targetPhoneme?: string; heardPhoneme?: string; errorType?: string; errorCategory?: string }>,
  childPronunciation: string
) {
  const primary = errors?.[0] || {};
  const phonemeKey = primary.targetPhoneme || primary.heardPhoneme || '';

  // 음소별 팁 (첨가 오류 포함) - 언어치료학적으로 정확한 조음 위치
  const tips: Record<string, string> = {
    'ㄹ': '혀 끝을 윗니 바로 뒤쪽(입천장)에 살짝 대고 튕겨보세요.',
    'ㅅ': '윗니와 아랫니를 가깝게 모으고, 혀가 이빨 밖으로 나오지 않게 바람을 "스~" 하고 내보내세요.',
    'ㅈ': '혀를 윗잇몸에 붙였다가 떼어내며 가볍게 "자" 소리를 내보세요.',
    'ㅊ': '"ㅈ" 소리보다 훨씬 더 바람을 세게, "차!" 하고 강하게 터뜨리듯 내보내세요.',
    'ㄱ': '혀뿌리를 들어올려 목구멍 쪽을 막았다가 떼면서 소리를 내보세요.',
    'ㄲ': '일반적인 "ㄱ"보다 목에 힘을 꽉 주고 단단하게 터뜨리는 소리예요.',
  };

  const tip = tips[phonemeKey] ?? '정확한 입모양에 주의하며 천천히 연습해보세요.';

  return {
    success: true,
    rootCause:
      `"${childPronunciation}"은 발달 과정에서 자주 나타나는 패턴입니다. ` +
      `정확한 소리 구조를 귀와 입으로 천천히 느껴가며 연습하세요.`,

    trainingStep1:
      `1단계 조음 감각 깨우기: 아이의 혀와 입술이 어떻게 움직이는지 거울 앞에서 함께 관찰해보세요. ` +
      `손가락으로 아이의 턱이나 뺨을 만지며 진동을 느껴보는 것도 좋습니다.`,

    trainingStep2:
      `2단계 소리 느끼기: "${tip}" ` +
      `부모님이 먼저 천천히 정확한 소리를 들려주고, 아이가 따라 해보도록 격려하세요.`,

    trainingStep3:
      `3단계 음절/단어로 연결하기: 목표 음소가 들어간 쉬운 단어부터 시작해서 ` +
      `"ㄱ→가→고양이" 처럼 단계적으로 확장하며 연습하세요.`,

    trainingStep4:
      `4단계 문장과 일상 상황에서: 평소 대화 중에 자연스럽게 그 소리를 의도적으로 써 보면서 ` +
      `"밥 먹을 때", "산책할 때" 같은 구체적 상황에서 반복하세요.`,

    recommendedWords: [],
    parentMessage:
      `모든 아이는 자신의 속도로 발달합니다. ` +
      `매일 5-10분 정도 즐겁게 함께 연습하는 것이 가장 효과적입니다!`,

    geminiConfidence: 2,
    isIndividualHabit: false,
  };
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
    console.error('[Gemini API Error in generateWeakPhonemeReport]', {
      childName,
      weakPhonemeCount: weakPhonemes?.length || 0,
      error,
    });
    return null;
  }
}
