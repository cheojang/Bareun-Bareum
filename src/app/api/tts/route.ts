import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { synthesizeGoogleTTS, type GoogleVoice } from "@/lib/google-tts";

/**
 * GET /api/tts?word=사과&voice=ko-KR-Neural2-A
 *
 * 동작:
 * 1. Supabase Storage의 `tts-cache` 버킷에서 캐시 확인
 * 2. 있으면 → public URL 즉시 반환 (Google API 호출 0회)
 * 3. 없으면 → Google TTS 호출 → 업로드 → URL 반환
 *
 * 동일 단어는 영구 캐시 — 무료 한도 거의 소모 안 됨
 */

const BUCKET = "tts-cache";
const DEFAULT_VOICE: GoogleVoice = "ko-KR-Neural2-A";
const VALID_VOICES: GoogleVoice[] = [
  "ko-KR-Neural2-A", "ko-KR-Neural2-B", "ko-KR-Neural2-C",
  "ko-KR-Wavenet-A", "ko-KR-Wavenet-B", "ko-KR-Wavenet-C", "ko-KR-Wavenet-D",
  "ko-KR-Chirp3-HD-Aoede", "ko-KR-Chirp3-HD-Charon",
];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const word = url.searchParams.get("word")?.trim();
  const voiceParam = url.searchParams.get("voice");
  const voice: GoogleVoice =
    voiceParam && (VALID_VOICES as string[]).includes(voiceParam)
      ? (voiceParam as GoogleVoice)
      : DEFAULT_VOICE;

  if (!word) {
    return NextResponse.json({ error: "word 파라미터 필수" }, { status: 400 });
  }
  if (word.length > 200) {
    return NextResponse.json({ error: "200자 이내로 입력해주세요" }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase Storage가 설정되지 않았어요. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 확인" },
      { status: 500 }
    );
  }

  // 캐시 키 — 한글 단어를 URL-안전 base64로 변환
  const encodedWord = Buffer.from(word, "utf-8")
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=+$/, "");
  const path = `${voice}/${encodedWord}.mp3`;

  // 1. 캐시 존재 확인
  try {
    const { data: files } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(voice, { search: `${encodedWord}.mp3`, limit: 1 });

    if (files && files.length > 0) {
      const { data: publicData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
      return NextResponse.json({ url: publicData.publicUrl, cached: true });
    }
  } catch (err) {
    console.warn("[TTS] 캐시 조회 실패 (계속 진행):", err);
  }

  // 2. 캐시 미스 — Google TTS 호출
  let audioBuffer: Buffer;
  try {
    audioBuffer = await synthesizeGoogleTTS(word, { voice });
  } catch (err: any) {
    console.error("[TTS] Google 호출 실패:", err);
    return NextResponse.json(
      { error: err?.message ?? "음성 생성 실패" },
      { status: 502 }
    );
  }

  // 3. Storage에 업로드
  try {
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("[TTS] Storage 업로드 실패:", uploadError);
      // 업로드 실패해도 오디오 자체는 생성됐으니 data URL로 반환
      const base64 = audioBuffer.toString("base64");
      return NextResponse.json({
        url: `data:audio/mpeg;base64,${base64}`,
        cached: false,
        cacheError: uploadError.message,
      });
    }

    const { data: publicData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: publicData.publicUrl, cached: false });
  } catch (err: any) {
    console.error("[TTS] 캐시 저장 중 예외:", err);
    return NextResponse.json({ error: err?.message ?? "캐시 저장 실패" }, { status: 500 });
  }
}
