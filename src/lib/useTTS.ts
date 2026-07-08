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
  // 재생 요청 세대 — stop()·새 play()가 증가시킨다. TTS 합성(fetch)이 1~3초 걸리는
  // 문장의 경우, 그 사이 stop()이 불려도 멈출 오디오가 아직 없어서 뒤늦게 도착한
  // 오디오가 다음 카드 위에서 재생을 시작하던 문제를 세대 검사로 차단.
  const seqRef = useRef(0);

  useEffect(() => {
    return () => {
      seqRef.current++;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  /** 단어 재생. 재생이 끝나면 resolve. stop()·새 play() 이후 도착한 오디오는 시작하지 않음. */
  const play = useCallback(async (word: string, options: PlayOptions = {}) => {
    if (!word) return;
    const seq = ++seqRef.current;
    const alive = () => seqRef.current === seq;

    // 1. /api/tts 시도
    try {
      const params = new URLSearchParams({ word });
      if (options.speaker) params.set("speaker", options.speaker);
      if (options.rate) params.set("rate", String(options.rate));

      const res = await fetch(`/api/tts?${params.toString()}`, { signal: options.signal });
      if (!alive()) return; // 합성 대기 중 stop()/다른 재생으로 대체됨 — 시작하지 않음
      if (res.ok) {
        const data = (await res.json()) as { url?: string; error?: string };
        if (!alive()) return;
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
    if (!alive()) return;
    await playSpeechSynthesis(word, options.signal);
  }, []);

  /** 재생 중지 — 재생 중인 오디오뿐 아니라 합성 대기 중인(아직 시작 전) 재생도 무효화 */
  const stop = useCallback(() => {
    seqRef.current++;
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

    let safety: ReturnType<typeof setTimeout>;
    const cleanup = () => {
      clearTimeout(safety);
      audio.onended = null;
      audio.onerror = null;
      audio.onpause = null;
      if (signal) signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      cleanup();
      audio.pause();
      reject(new DOMException("aborted", "AbortError"));
    };

    audio.onended = () => { cleanup(); resolve(); };
    audio.onerror = () => { cleanup(); reject(new Error("audio play failed")); };
    // 외부 stop()·다른 단어 재생으로 pause되면 즉시 종료 처리 —
    // 안 그러면 아래 5초 안전 타임아웃까지 붙잡혀, 연속 재생 루프(음절 듣기 등)가
    // 카드 전환 후 뒤늦게 이어져 소리가 중첩됨. (자연 종료 시엔 pause 이벤트 없이 ended만 발생)
    // ⚠️ 이전 재생을 교체할 때 큐에 남은 stale pause 이벤트가 새 재생 직후 도착할 수 있어,
    //    그 시점에 이미 다시 재생 중(paused=false)이면 무시한다.
    audio.onpause = () => { if (audio.paused) { cleanup(); resolve(); } };
    if (signal) signal.addEventListener("abort", onAbort);

    // 안전 타임아웃 5초
    safety = setTimeout(() => { cleanup(); resolve(); }, 5000);

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
