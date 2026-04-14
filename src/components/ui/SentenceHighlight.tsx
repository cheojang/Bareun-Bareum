"use client";

import React from "react";

interface SentenceWithHighlights {
  text: string;
  highlights?: number[];
}

interface SentenceHighlightProps {
  sentence: SentenceWithHighlights | string;
  highlightColor?: "bg-yellow-200" | "bg-green-200" | "bg-blue-200" | "bg-pink-200";
  textSize?: "text-sm" | "text-base" | "text-lg" | "text-xl";
  bold?: boolean;
}

/**
 * 🎯 목표 발음을 하이라이팅하는 컴포넌트
 * 백엔드에서 제공하는 highlight positions를 이용해 UI에서 렌더링
 *
 * 예:
 * <SentenceHighlight
 *   sentence={{ text: "사과를 봐요", highlights: [0] }}
 *   highlightColor="bg-yellow-200"
 *   textSize="text-lg"
 * />
 *
 * 렌더링 결과:
 * [사](노란 배경) 과를 봐요
 */
export function SentenceHighlight({
  sentence,
  highlightColor = "bg-yellow-200",
  textSize = "text-base",
  bold = true,
}: SentenceHighlightProps) {
  // 문자열로 들어온 경우 처리
  if (typeof sentence === "string") {
    return <span className={textSize}>{sentence}</span>;
  }

  const { text, highlights = [] } = sentence;
  const highlightSet = new Set(highlights);

  return (
    <span className={`${textSize} ${bold ? "font-semibold" : ""}`}>
      {text.split("").map((char, idx) => (
        <span
          key={idx}
          className={
            highlightSet.has(idx)
              ? `${highlightColor} rounded px-0.5 transition-colors duration-200`
              : ""
          }
        >
          {char}
        </span>
      ))}
    </span>
  );
}

/**
 * 여러 문장을 한 번에 렌더링하는 유틸리티
 */
export function SentenceList({
  sentences,
  highlightColor = "bg-yellow-200",
  textSize = "text-lg",
  gap = "gap-2",
}: {
  sentences: (SentenceWithHighlights | string)[];
  highlightColor?: "bg-yellow-200" | "bg-green-200" | "bg-blue-200" | "bg-pink-200";
  textSize?: "text-sm" | "text-base" | "text-lg" | "text-xl";
  gap?: string;
}) {
  return (
    <div className={`flex flex-col ${gap}`}>
      {sentences.map((sentence, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">{idx + 1}.</span>
          <SentenceHighlight
            sentence={sentence}
            highlightColor={highlightColor}
            textSize={textSize}
            bold
          />
        </div>
      ))}
    </div>
  );
}
