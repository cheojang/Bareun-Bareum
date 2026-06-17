/**
 * TTS Pre-warm 스크립트 — 저장된 단어·예문을 미리 Google Cloud TTS로 합성해
 * Supabase Storage `tts-cache` 버킷에 채워둔다 (실제 사용자 호출 시 캐시 히트).
 * 실행: npx tsx scripts/tts-prewarm.ts
 *
 * - WORD_DATABASE(src/lib/word-database.ts)의 word + sampleSentence를 대상으로 함
 * - 캐시 키/경로는 src/app/api/tts/route.ts 와 동일한 규칙: `${voice}/${base64(text)}.mp3`
 * - 이미 버킷에 있는 파일은 건너뜀 (idempotent) — 버킷 목록을 한 번에 불러와 로컬에서 대조
 * - 인증은 이미지 생성과 동일한 서비스계정(GOOGLE_APPLICATION_CREDENTIALS)의 OAuth 토큰 사용
 *   (.env.local에 GOOGLE_TTS_API_KEY가 없어도 동작)
 *
 * 사전조건 (.env.local 또는 환경변수):
 *   GOOGLE_APPLICATION_CREDENTIALS = 서비스 계정 JSON 키 파일 경로 (이미지 생성과 공용)
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY = Storage 업로드용
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GoogleAuth } from "google-auth-library";
import { createClient } from "@supabase/supabase-js";
import { WORD_DATABASE } from "../src/lib/word-database";

const BUCKET = "tts-cache";
const VOICE = process.env.TTS_VOICE || "ko-KR-Neural2-A";
const SPEAKING_RATE = Number(process.env.TTS_SPEAKING_RATE) || 0.7;
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 5;
const DELAY_MS = Number(process.env.DELAY_MS) || 300;
const MAX_RETRY = 3;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다. " +
    ".env.local에 추가하세요 (Storage 업로드 대상 — 프로덕션과 동일한 프로젝트여야 캐시가 공유됩니다)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });

function encodePath(text: string): string {
  const b64 = Buffer.from(text, "utf-8")
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=+$/, "");
  return `${VOICE}/${b64}.mp3`;
}

async function synthesize(text: string, token: string): Promise<Buffer> {
  const res = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "ko-KR", name: VOICE },
      audioConfig: { audioEncoding: "MP3", speakingRate: SPEAKING_RATE, pitch: 0 },
    }),
  });
  if (!res.ok) {
    throw new Error(`TTS 요청 실패 (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { audioContent?: string };
  if (!data.audioContent) throw new Error("응답에 audioContent 없음");
  return Buffer.from(data.audioContent, "base64");
}

async function withRetry(text: string, token: string): Promise<Buffer | null> {
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      return await synthesize(text, token);
    } catch (err) {
      console.error(`  ✗ "${text}" 시도 ${attempt}/${MAX_RETRY} 실패:`, (err as Error).message);
      if (attempt < MAX_RETRY) await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  return null;
}

async function listExistingPaths(): Promise<Set<string>> {
  const existing = new Set<string>();
  const { data: voiceDirs } = await supabase.storage.from(BUCKET).list(VOICE, { limit: 1000 });
  let offset = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(VOICE, { limit, offset });
    if (error) {
      console.warn("버킷 목록 조회 실패 (빈 버킷으로 간주):", error.message);
      break;
    }
    if (!data || data.length === 0) break;
    for (const f of data) existing.add(`${VOICE}/${f.name}`);
    if (data.length < limit) break;
    offset += limit;
  }
  void voiceDirs;
  return existing;
}

async function main() {
  const texts = new Set<string>();
  for (const w of WORD_DATABASE) {
    texts.add(w.word);
    if (w.sampleSentence) texts.add(w.sampleSentence);
  }
  const entries = Array.from(texts);
  console.log(`대상: ${entries.length}개 (단어+예문, 보이스 ${VOICE})`);

  console.log("기존 캐시 목록 조회 중...");
  const existing = await listExistingPaths();
  console.log(`기존 캐시: ${existing.size}개`);

  const client = await auth.getClient();
  let token = (await client.getAccessToken()).token!;
  let tokenIssuedAt = Date.now();

  let done = 0, skipped = 0, failed = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    // 액세스 토큰 50분 경과 시 재발급 (기본 만료 1시간)
    if (Date.now() - tokenIssuedAt > 50 * 60 * 1000) {
      token = (await client.getAccessToken()).token!;
      tokenIssuedAt = Date.now();
    }

    const batch = entries.slice(i, i + BATCH_SIZE);
    let anyGenerated = false;

    await Promise.all(
      batch.map(async (text) => {
        const path = encodePath(text);
        if (existing.has(path)) {
          skipped++;
          return;
        }
        const buf = await withRetry(text, token);
        if (!buf) {
          failed++;
          return;
        }
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, buf, { contentType: "audio/mpeg", upsert: true });
        if (uploadError) {
          console.error(`  ✗ "${text}" 업로드 실패:`, uploadError.message);
          failed++;
          return;
        }
        existing.add(path);
        done++;
        anyGenerated = true;
        console.log(`  ✓ "${text}" → ${path} (${(buf.length / 1024).toFixed(1)}KB)`);
      }),
    );

    if (anyGenerated && i + BATCH_SIZE < entries.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
    if (i % 200 === 0 || anyGenerated) {
      console.log(`진행: ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length} (신규:${done} 스킵:${skipped} 실패:${failed})`);
    }
  }

  console.log(`완료 — 신규:${done} 스킵:${skipped} 실패:${failed}`);
}

main().catch((err) => {
  console.error("치명적 오류:", err);
  process.exit(1);
});
