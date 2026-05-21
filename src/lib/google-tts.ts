/**
 * Google Cloud Text-to-Speech 클라이언트
 *
 * API 문서: https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
 *
 * 환경변수:
 * - GOOGLE_TTS_API_KEY (Google Cloud Console에서 발급)
 *
 * 무료 한도:
 * - Neural2 / Chirp3 HD: 월 100만 자 무료
 * - 그 이후 100만 자당 약 $16 (≈22,000원)
 */

const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";

// 아동 발음 학습에 적합한 자연스러운 한국어 음성들
export type GoogleVoice =
  | "ko-KR-Neural2-A"   // 여성, 따뜻하고 또렷 ⭐ 기본
  | "ko-KR-Neural2-B"   // 여성, 친근
  | "ko-KR-Neural2-C"   // 남성, 안정감
  | "ko-KR-Wavenet-A"   // 여성, 차분
  | "ko-KR-Wavenet-B"   // 여성, 밝음
  | "ko-KR-Wavenet-C"   // 남성, 또렷
  | "ko-KR-Wavenet-D"   // 남성, 부드러움
  | "ko-KR-Chirp3-HD-Aoede"     // 최신 HD 여성, 매우 자연스러움
  | "ko-KR-Chirp3-HD-Charon";   // 최신 HD 남성

export interface GoogleTTSOptions {
  voice?: GoogleVoice;
  speakingRate?: number; // 0.25 ~ 4.0 (기본 1.0). 아동용은 0.9 권장
  pitch?: number;        // -20.0 ~ 20.0 (기본 0)
}

/**
 * 텍스트를 음성으로 변환 — MP3 바이너리 반환
 */
export async function synthesizeGoogleTTS(
  text: string,
  options: GoogleTTSOptions = {}
): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_TTS_API_KEY 환경변수가 없어요. " +
      "Google Cloud Console에서 Text-to-Speech API를 활성화하고 API 키를 발급받으세요."
    );
  }

  const voice = options.voice ?? "ko-KR-Neural2-A";

  const body = {
    input: { text },
    voice: { languageCode: "ko-KR", name: voice },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: options.speakingRate ?? 0.7,
      pitch: options.pitch ?? 0,
    },
  };

  const response = await fetch(`${GOOGLE_TTS_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google TTS 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { audioContent?: string };
  if (!data.audioContent) {
    throw new Error("Google TTS 응답에 audioContent가 없어요");
  }

  return Buffer.from(data.audioContent, "base64");
}
