/**
 * useTTS — 클라이언트용 음성 재생 훅
 *
 * /api/tts에서 음성 URL을 받아 audio 태그로 재생.
 * 실패 시(API 키 미설정 등) 자동으로 브라우저 speechSynthesis로 폴백.
 */
"use client";

import { useCallback, useEffect, useRef } from "react";

export interface PlayOptions {
  speaker?: string;
  signal?: AbortSignal;
  /** 재생 속도 배수 (0.25~1.5). 미지정 시 서버 기본 속도(0.7) 사용 — 특정 화면만 더 느리게/빠르게 할 때 지정 */
  rate?: number;
}

export function useTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  /** 단어 재생. 재생이 끝나면 resolve. */
  const play = useCallback(async (word: string, options: PlayOptions = {}) => {
    if (!word) return;

    // 1. /api/tts 시도
    try {
      const params = new URLSearchParams({ word });
      if (options.speaker) params.set("speaker", options.speaker);
      if (options.rate) params.set("rate", String(options.rate));

      const res = await fetch(`/api/tts?${params.toString()}`, { signal: options.signal });
      if (res.ok) {
        const data = (await res.json()) as { url?: string; error?: string };
        if (data.url) {
          await playAudioUrl(data.url, audioRef, options.signal);
          return;
        }
      }
    } catch (err) {
      if ((err as any)?.name === "AbortError") throw err;
      console.warn("[useTTS] /api/tts 실패, 브라우저 폴백 사용:", err);
    }

    // 2. 폴백 — 브라우저 speechSynthesis
    await playSpeechSynthesis(word, options.signal);
  }, []);

  /** 재생 중지 */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { play, stop };
}

async function playAudioUrl(
  url: string,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 같은 Audio 엘리먼트 재사용 — iOS는 사용자 제스처로 한 번 재생된 엘리먼트만
    // 이후 제스처 없이(예: fetch 후) 재생을 허용한다. 매번 new Audio()를 만들면
    // 첫 단어 이후 버튼 평가 시 재생이 조용히 거부됨.
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.pause();
    audio.src = url;
    audio.currentTime = 0;

    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      if (signal) signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      cleanup();
      audio.pause();
      reject(new DOMException("aborted", "AbortError"));
    };

    audio.onended = () => { cleanup(); resolve(); };
    audio.onerror = () => { cleanup(); reject(new Error("audio play failed")); };
    if (signal) signal.addEventListener("abort", onAbort);

    // 안전 타임아웃 5초
    const safety = setTimeout(() => { cleanup(); resolve(); }, 5000);
    audio.addEventListener("ended", () => clearTimeout(safety), { once: true });

    audio.play().catch((err) => { cleanup(); reject(err); });
  });
}

async function playSpeechSynthesis(text: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 0.82;
    u.pitch = 1.05;

    let resolved = false;
    const finish = () => { if (!resolved) { resolved = true; resolve(); } };
    u.onend = finish;
    u.onerror = finish;

    if (signal) signal.addEventListener("abort", finish);
    const safety = setTimeout(finish, 3000);
    u.addEventListener("end", () => clearTimeout(safety));

    // Android Chrome: cancel() 직후 speak()하면 무음이 되는 엔진 버그 — 한 틱 띄움
    setTimeout(() => window.speechSynthesis.speak(u), 60);
  });
}
