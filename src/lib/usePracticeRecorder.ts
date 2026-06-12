"use client";

import { useCallback, useRef } from "react";

/**
 * usePracticeRecorder — 단어 완료 시점마다 연습 세션에 즉시 기록.
 *
 * 기존엔 연습을 끝까지 마쳐야만 세션이 저장돼 중간 이탈 시 기록이 통째로
 * 사라졌다 (홈 최근연습·캘린더·streak 누락). 이 훅은 단어 하나가 끝날 때마다
 * 저장하므로 어디서 그만둬도 한 단어 이상 했다면 그날 기록이 남는다.
 *
 * - 첫 호출에서 세션 생성, 이후엔 sessionId로 같은 세션에 단어 추가
 * - 호출 순서 보장: promise 체인으로 직렬화 (세션 중복 생성 방지)
 * - 같은 단어 중복 기록 방지
 */
export function usePracticeRecorder(childId: string) {
  const sessionIdRef = useRef<string | null>(null);
  const savedRef = useRef<Set<string>>(new Set());
  const chainRef = useRef<Promise<void>>(Promise.resolve());

  return useCallback(
    (word: string, correct: boolean) => {
      if (!word || savedRef.current.has(word)) return;
      savedRef.current.add(word);

      chainRef.current = chainRef.current.then(async () => {
        try {
          const res = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId,
              sessionId: sessionIdRef.current,
              words: [{ word, correct }],
            }),
          });
          if (res.ok) {
            const data = (await res.json()) as { id?: string };
            if (data?.id) sessionIdRef.current = data.id;
          }
        } catch {
          // 기록 실패가 연습 진행을 막으면 안 됨 — 락을 풀어 재기록 가능하게만 함
          savedRef.current.delete(word);
        }
      });
    },
    [childId],
  );
}
