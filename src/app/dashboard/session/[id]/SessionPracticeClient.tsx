"use client";

import { useState } from "react";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { AnalysisResult } from "@/types/analysis";
import { PhonemeError } from "@/types/phonetics";
import { getWordByText } from "@/lib/word-database";

interface WordRecord {
  id: string;
  targetWord: string;
  heardWord: string;
  isCorrect: boolean;
  errorPhonemes: unknown;
}

interface Props {
  sessionId: string;
  childId: string;
  childName: string;
  mascotLevel: number;
  initialWords: string[];
  wordRecords: WordRecord[];
}

const MASCOT_EMOJIS = ["🥚", "🐣", "🐥", "🐤", "🐦"];

export function SessionPracticeClient({
  sessionId,
  childId,
  childName,
  mascotLevel,
  initialWords,
}: Props) {
  const [wordQueue] = useState<string[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heardWord, setHeardWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const currentWord = wordQueue[currentIndex];
  const wordInfo = currentWord ? getWordByText(currentWord) : null;
  const mascotEmoji = MASCOT_EMOJIS[Math.min(mascotLevel - 1, 4)];

  async function analyze() {
    if (!heardWord.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetWord: currentWord,
          heardWord: heardWord.trim(),
          childId,
          sessionId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (data.isCorrect) setCorrectCount((c) => c + 1);
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleBookmark() {
    if (!result) return;
    const newVal = !isBookmarked;
    setIsBookmarked(newVal);
    await fetch("/api/bookmarks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordRecordId: result.wordRecordId, isBookmarked: newVal }),
    });
  }

  function nextWord() {
    if (currentIndex + 1 >= wordQueue.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setHeardWord("");
      setResult(null);
      setIsBookmarked(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="text-8xl mb-4 animate-bounce-in">{mascotEmoji}</div>
        <h2 className="text-3xl font-black text-[#3D3530] mb-2">연습 완료! 🎉</h2>
        <p className="text-[#8B7E74] mb-2">
          {wordQueue.length}개 중 {correctCount}개 정확하게 발음했어요!
        </p>
        <div className="text-4xl font-black text-[#FFB38A] mb-8">
          {Math.round((correctCount / wordQueue.length) * 100)}점
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <BubbleButton variant="peach" size="lg" onClick={() => window.location.href = "/dashboard/child"}>
            🎮 아이 모드로!
          </BubbleButton>
          <BubbleButton variant="white" onClick={() => window.location.href = "/dashboard"}>
            홈으로 돌아가기
          </BubbleButton>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 max-w-lg mx-auto space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#8B7E74]">{childName} 연습 중</span>
          <span className="text-sm font-semibold text-[#3D3530]">
            {currentIndex + 1} / {wordQueue.length}
          </span>
        </div>
        <div className="w-full h-3 bg-[#F0E8E0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFB38A] rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / wordQueue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Target word display */}
      <BubbleCard color="peach" className="text-center">
        <p className="text-sm text-[#8B7E74] mb-2">아이에게 이 단어를 말하게 해보세요</p>
        {wordInfo && <div className="text-6xl mb-3">{wordInfo.emoji}</div>}
        <div className="text-5xl font-black text-[#3D3530] mb-2">{currentWord}</div>
        {wordInfo && (
          <p className="text-sm text-[#8B7E74] bg-white/60 rounded-2xl px-4 py-2 inline-block">
            {wordInfo.sampleSentence}
          </p>
        )}
      </BubbleCard>

      {/* Parent input */}
      {!result ? (
        <BubbleCard>
          <p className="text-sm font-semibold text-[#3D3530] mb-3">
            👂 아이가 어떻게 발음했나요?
          </p>
          <p className="text-xs text-[#8B7E74] mb-3">
            귀로 들은 대로 한글로 입력해주세요
          </p>
          <input
            type="text"
            value={heardWord}
            onChange={(e) => setHeardWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder={`예: ${currentWord}`}
            className="w-full rounded-[16px] border-2 border-[#F0E8E0] bg-[#FDFAF5] px-4 py-3 text-[#3D3530] text-lg font-semibold placeholder-[#C4B5A8] focus:border-[#FFB38A] focus:outline-none mb-3"
          />
          <BubbleButton
            onClick={analyze}
            disabled={loading || !heardWord.trim()}
            variant="mint"
            size="md"
            className="w-full"
          >
            {loading ? <LoadingSpinner size="sm" /> : "분석하기 🔍"}
          </BubbleButton>
        </BubbleCard>
      ) : (
        /* Analysis result */
        <div className="space-y-4 animate-bounce-in">
          {/* Correct / Wrong */}
          <BubbleCard color={result.isCorrect ? "mint" : "peach"} className="text-center">
            <div className="text-4xl mb-2">{result.isCorrect ? "🌟" : "💪"}</div>
            <h3 className="text-xl font-black text-[#3D3530] mb-1">
              {result.isCorrect ? "정확해요!" : "다시 연습해봐요"}
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm text-[#8B7E74]">
              <span>목표: <strong className="text-[#3D3530]">{result.targetWord}</strong></span>
              <span>→</span>
              <span>들은 것: <strong className="text-[#3D3530]">{result.heardWord}</strong></span>
            </div>
          </BubbleCard>

          {/* Errors */}
          {result.errors.length > 0 && (
            <BubbleCard>
              <p className="font-semibold text-[#3D3530] mb-3">발음 오류 분석</p>
              <div className="space-y-2">
                {result.errors.map((err: PhonemeError, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#FFF5EE] rounded-2xl">
                    <div className="flex gap-1">
                      <PastelBadge color="pink">{err.targetPhoneme}</PastelBadge>
                      <span className="text-[#8B7E74]">→</span>
                      <PastelBadge color="lavender">{err.heardPhoneme}</PastelBadge>
                    </div>
                    <div className="flex-1 text-xs text-[#8B7E74]">
                      {err.articulationPlace} · {err.articulationManner}
                    </div>
                  </div>
                ))}
              </div>
            </BubbleCard>
          )}

          {/* AI Guidance */}
          <BubbleCard color="lavender">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-semibold text-[#3D3530] mb-1 text-sm">AI 선생님 가이드</p>
                <p className="text-sm text-[#3D3530] leading-relaxed">{result.guidanceText}</p>
              </div>
            </div>
          </BubbleCard>

          {/* Articulation guides */}
          {result.articulationGuides.length > 0 && (
            <BubbleCard>
              <p className="font-semibold text-[#3D3530] mb-3">💋 입 모양 가이드</p>
              <div className="space-y-2">
                {result.articulationGuides.map((guide, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#F0FAF8] rounded-2xl">
                    <PastelBadge color="mint" className="flex-shrink-0">{guide.phoneme}</PastelBadge>
                    <p className="text-sm text-[#3D3530]">{guide.tipText}</p>
                  </div>
                ))}
              </div>
            </BubbleCard>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <BubbleButton
              variant="white"
              onClick={toggleBookmark}
              className="flex-1"
            >
              {isBookmarked ? "⭐ 저장됨" : "☆ 보관함"}
            </BubbleButton>
            <BubbleButton
              variant="peach"
              onClick={nextWord}
              className="flex-1"
            >
              다음 단어 →
            </BubbleButton>
          </div>
        </div>
      )}
    </div>
  );
}
