"use client";

import { useState } from "react";
import { ConfettiEffect } from "@/components/child/ConfettiEffect";
import { MascotCharacter } from "@/components/child/MascotCharacter";
import { WORD_DATABASE } from "@/lib/word-database";
import Link from "next/link";

interface Props {
  childName: string;
  mascotLevel: number;
  recentWords: string[];
}

export function ChildPlayClient({ childName, mascotLevel, recentWords }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [score, setScore] = useState(0);

  // Pick 8 words not recently practiced
  const playWords = WORD_DATABASE.filter((w) => !recentWords.includes(w.word))
    .slice(0, 8);

  const currentWord = playWords[currentIndex];

  function handleCorrect() {
    setShowSuccess(true);
    setConfetti(true);
    setScore((s) => s + 1);

    setTimeout(() => {
      setShowSuccess(false);
      setConfetti(false);
      if (currentIndex + 1 < playWords.length) {
        setCurrentIndex((i) => i + 1);
      }
    }, 2000);
  }

  function handleSkip() {
    if (currentIndex + 1 < playWords.length) {
      setCurrentIndex((i) => i + 1);
    }
  }

  if (!currentWord) {
    return (
      <div className="child-mode min-h-dvh flex flex-col items-center justify-center text-center px-6">
        <div className="text-8xl mb-6 animate-bounce-in">🎉</div>
        <h2 className="text-4xl font-black text-[#3D3530] mb-3">와! 다 했어요!</h2>
        <p className="text-xl text-[#8B7E74] mb-8">{score}개 잘했어요!</p>
        <Link href="/dashboard">
          <button className="bubble-btn bg-[#FFB38A] text-white px-10 py-5 text-xl font-black rounded-full">
            홈으로 가기 🏠
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="child-mode min-h-dvh flex flex-col">
      <ConfettiEffect trigger={confetti} />

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <Link href="/dashboard">
          <button className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-xl shadow-md">
            ←
          </button>
        </Link>
        <MascotCharacter level={mascotLevel} />
        <div className="bg-white/80 rounded-full px-4 py-2 font-black text-[#FFB38A] text-lg">
          ⭐ {score}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-4">
        {playWords.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i < currentIndex
                ? "w-3 h-3 bg-[#FFB38A]"
                : i === currentIndex
                ? "w-5 h-3 bg-[#FFB38A]"
                : "w-3 h-3 bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Word card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        {showSuccess ? (
          <div className="animate-bounce-in text-center">
            <div className="text-9xl mb-4">🌟</div>
            <p className="text-4xl font-black text-[#3D3530]">잘했어요!</p>
          </div>
        ) : (
          <div className="w-full max-w-xs">
            {/* Big word card */}
            <div
              className="bubble-card bg-white/90 p-8 text-center mb-6"
              style={{ borderRadius: "32px" }}
            >
              <div className="text-8xl mb-4">{currentWord.emoji}</div>
              <div className="text-5xl font-black text-[#3D3530] mb-2">
                {currentWord.word}
              </div>
              <p className="text-base text-[#8B7E74] leading-relaxed">
                {currentWord.sampleSentence}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCorrect}
                className="bubble-btn bg-[#FFB38A] text-white w-full py-5 text-2xl font-black rounded-full"
              >
                ⭕ 맞아요!
              </button>
              <button
                onClick={handleSkip}
                className="bubble-btn bg-white/80 text-[#8B7E74] w-full py-4 text-lg font-bold rounded-full border-2 border-[#F0E8E0]"
              >
                다음 →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Child name tag */}
      <div className="text-center pb-6">
        <span className="bg-white/60 rounded-full px-4 py-2 text-sm text-[#8B7E74] font-semibold">
          {childName} 연습 중 🎵
        </span>
      </div>
    </div>
  );
}
