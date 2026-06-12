"use client";

import { useState, useCallback, useEffect, useRef } from "react";

import { ConfettiEffect } from "@/components/child/ConfettiEffect";
import { MascotCharacter } from "@/components/child/MascotCharacter";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { stripEnglishParens } from "@/lib/strip-english";
import { postJson } from "@/lib/client-fetch";
import { useTTS } from "@/lib/useTTS";
import { DIFFICULTY_LABEL, type Difficulty } from "@/lib/adaptive-difficulty";
import { WordImage } from "@/components/ui/WordImage";
import Link from "next/link";

// ─── 완료 화면 컴포넌트 (코칭 카드 포함) ────────────────────────────────────────
function CompletionScreen({
  childName, totalReps, repTarget, totalGood,
  masteredCount, needsWorkCount, practiceWords, errorPattern, childId, routineMode,
}: {
  childName: string; totalReps: number; repTarget: number; totalGood: number;
  masteredCount: number; needsWorkCount: number;
  practiceWords: string[]; errorPattern?: string; childId: string; routineMode?: boolean;
}) {
  const [cards, setCards] = useState<{ context: string; phrases: string[] }[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    if (practiceWords.length === 0) { setLoadingCards(false); return; }
    postJson<{ cards: { context: string; phrases: string[] }[] }>(
      "/api/coaching-cards",
      { words: practiceWords, errorPattern, childName },
    )
      .then((d) => setCards(d?.cards ?? []))
      .finally(() => setLoadingCards(false));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-dvh flex flex-col items-center pb-12 text-center px-6"
      style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
    >
      <ConfettiEffect trigger />
      <div className="text-8xl mb-4 mt-12 animate-bounce-in">🎉</div>
      <h2 className="text-3xl font-black text-[#3D3530] mb-2">{childName} 최고야!</h2>
      <p className="text-[#8B7E74] mb-6">
        {routineMode ? "오늘의 루틴을 모두 완료했어요! 내일 또 만나요 🌞" : "오늘 연습을 모두 완료했어요!"}
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <span className="px-4 py-2 bg-[#FFF5EE] rounded-full text-sm font-bold text-[#FFB38A]">
          🔁 총 {totalReps}회 반복{totalReps >= repTarget ? " 🎯" : ""}
        </span>
        <span className="px-4 py-2 bg-[#7EDFD0]/20 rounded-full text-sm font-bold text-[#0D9488]">
          ⭐ {totalGood}번 성공
        </span>
        {masteredCount > 0 && (
          <span className="px-4 py-2 bg-[#F0FAF8] rounded-full text-sm font-bold text-[#0D9488]">
            🌟 {masteredCount}개 완벽 마스터
          </span>
        )}
        {needsWorkCount > 0 && (
          <span className="px-4 py-2 bg-[#FDF2F8] rounded-full text-sm font-bold text-[#EC4899]">
            💪 {needsWorkCount}개 내일 다시 연습해요
          </span>
        )}
      </div>

      {/* 부모 코칭 카드 */}
      <div className="w-full max-w-md text-left mb-8">
        <p className="text-sm font-black text-[#3D3530] mb-3 text-center">
          🌿 오늘 일상에서도 연습해보세요
        </p>
        {loadingCards ? (
          <div className="flex justify-center gap-1.5 py-4">
            {[0,1,2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#FFB38A] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : cards.map((card) => (
          <div key={card.context} className="mb-3 bg-white/80 rounded-2xl px-4 py-3 shadow-sm border border-[#F0E8E0]">
            <p className="text-sm font-black text-[#3D3530] mb-2">{card.context}</p>
            <ul className="space-y-1.5">
              {card.phrases.map((ph, i) => (
                <li key={i} className="text-xs text-[#8B7E74] leading-relaxed flex gap-1.5">
                  <span className="text-[#FFB38A] flex-shrink-0">•</span>
                  {ph}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Link href="/dashboard">
        <BubbleButton variant="peach" size="xl">홈으로 가기 🏠</BubbleButton>
      </Link>
    </div>
  );
}

// ─── 청각 폭격 컴포넌트 ────────────────────────────────────────────────────────
function AuditoryBombardment({
  words,
  onDone,
}: {
  words: string[];
  onDone: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // 재생 중인지
  const [hasStarted, setHasStarted] = useState(false); // 한 번이라도 시작했는지
  const [speechWorked, setSpeechWorked] = useState<boolean | null>(null);
  const cancelRef = useRef<AbortController | null>(null);
  const { play, stop } = useTTS();

  // 사용자 클릭으로 재생 시작 — 자동재생 차단(autoplay policy) 우회
  const startPlaying = useCallback(async () => {
    if (isPlaying || words.length === 0) return;
    setHasStarted(true);
    setIsPlaying(true);
    setDone(false);
    setActiveIdx(null);

    const controller = new AbortController();
    cancelRef.current = controller;
    let anyWorked = false;

    for (let i = 0; i < words.length; i++) {
      if (controller.signal.aborted) break;
      setActiveIdx(i);
      try {
        await play(words[i], { signal: controller.signal });
        anyWorked = true;
      } catch (err) {
        if ((err as any)?.name === "AbortError") break;
        // 한 단어 실패해도 다음 단어로 진행
      }
      if (controller.signal.aborted) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (!controller.signal.aborted) {
      setActiveIdx(null);
      setSpeechWorked(anyWorked);
      setDone(true);
    }
    setIsPlaying(false);
  }, [isPlaying, words, play]);

  // 언마운트 시 진행 중인 재생 정리
  useEffect(() => {
    return () => {
      cancelRef.current?.abort();
      stop();
    };
  }, [stop]);

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-6"
      style={{ background: "linear-gradient(135deg,#FFF5EE 0%,#F0FAF8 50%,#EDE9FE 100%)" }}
    >
      <div className="text-5xl animate-bounce">👂</div>
      <div>
        <h2 className="text-2xl font-black text-[#3D3530] mb-1">먼저 들어볼게요!</h2>
        <p className="text-sm text-[#8B7E74]">단어들을 귀 기울여 들어보세요</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-xs">
        {words.map((w, i) => (
          <span
            key={w}
            className="px-4 py-2 rounded-full text-base font-black transition-all duration-300"
            style={{
              backgroundColor: i === activeIdx ? "#FFB38A" : "#F5F0EB",
              color: i === activeIdx ? "#fff" : "#8B7E74",
              transform: i === activeIdx ? "scale(1.15)" : "scale(1)",
              boxShadow: i === activeIdx ? "0 4px 12px #FFB38A55" : "none",
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* 첫 진입 — 시작 / 넘어가기 버튼 나란히 (자동재생 정책 우회) */}
      {!hasStarted && (
        <div className="flex flex-col items-center gap-3 mt-2">
          <div className="flex items-center gap-3">
            <BubbleButton variant="peach" size="lg" onClick={startPlaying}>
              ▶️ 듣기 시작
            </BubbleButton>
            <BubbleButton variant="gray" size="lg" onClick={onDone}>
              넘어가기 →
            </BubbleButton>
          </div>
          <p className="text-[11px] text-[#C4B5A8] mt-1">듣기 시작을 누르면 단어를 차례로 들려줘요</p>
        </div>
      )}

      {/* 재생 중 */}
      {hasStarted && isPlaying && (
        <div className="flex flex-col items-center gap-3 mt-2">
          <p className="text-xs text-[#C4B5A8] animate-pulse">재생 중...</p>
          <BubbleButton variant="gray" size="lg" onClick={onDone}>
            건너뛰기 →
          </BubbleButton>
        </div>
      )}

      {/* 재생 완료 */}
      {done && !isPlaying && (
        <div className="flex flex-col items-center gap-3">
          {speechWorked === false && (
            <p className="text-xs text-[#C4B5A8] text-center max-w-xs leading-relaxed">
              💡 음성이 안 들렸어요. 다시 듣기를 눌러보거나 건너뛰기를 누르세요.
            </p>
          )}
          <div className="flex items-center gap-3">
            <BubbleButton variant="gray" size="lg" onClick={startPlaying}>
              🔊 다시 듣기
            </BubbleButton>
            <BubbleButton variant="peach" size="lg" onClick={onDone}>
              연습 시작하기 →
            </BubbleButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 타입 ──────────────────────────────────────────────────────────────────────

interface ErrorWord {
  word: string;
  errorPattern: string;
  trainingTip?: string;
  childPronunciation?: string;
}

interface SimilarWord {
  word: string;
  sourceWord: string; // 어떤 분석 단어와 유사 패턴인지
}

interface Props {
  childId: string;
  childName: string;
  childImage?: string | null;
  mascotLevel: number;
  stage1Words: ErrorWord[];
  stage2Words: SimilarWord[];
  wordInfos: Record<string, { imageSlug?: string }>;
  errorPattern?: string;
  /** 오늘의 루틴 2단계로 진입 — 완료 화면이 루틴 피날레가 됨 */
  routineMode?: boolean;
  /** 적응형 난이도 — 최근 결과로 서버에서 계산 (3연속 성공 ↑, 2연속 실패 ↓) */
  difficulty?: Difficulty;
}

type Stage = 1 | 2 | 3;
type DotResult = "good" | "bad" | null;
type MasteryLevel = "mastered" | "medium" | "hard";

interface PracticeItem {
  text: string;
  kind: "word" | "sentence";
  badge?: string;
  trainingTip?: string;      // 단어별 2단계 처방전 (오류 패턴과 매칭)
  similarTo?: string;        // 2단계: 어떤 원본 분석 단어와 유사 패턴인지
  childPron?: string;        // 1단계 오답 단어에서 아이 발음 표시용
  scheduleId?: string;       // 복습 아이템: SM-2 ReviewSchedule ID
}

const MAX_DOTS = 5;

// ─── 단계 메타 ─────────────────────────────────────────────────────────────────

const STAGE_META: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  1: {
    label: "1단계 · 오답 단어",
    desc: "틀렸던 단어부터 다시 연습해요",
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  2: {
    label: "2단계 · 유사 패턴 단어",
    desc: "같은 소리가 들어간 단어들이에요",
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
  3: {
    label: "3단계 · 문장으로 확장",
    desc: "연습한 단어가 들어간 짧은 문장이에요",
    color: "#0D9488",
    bg: "#F0FAF8",
  },
};

// ─── 숙달 레벨 판정 ────────────────────────────────────────────────────────────

function getMastery(slots: DotResult[]): MasteryLevel {
  const goodCount = slots.filter((s) => s === "good").length;
  if (goodCount === MAX_DOTS) return "mastered";
  if (goodCount >= 3) return "medium";
  return "hard";
}

function getMasteryLabel(level: MasteryLevel) {
  if (level === "mastered") return { emoji: "🌟", text: "완벽해요! 잘 훈련된 단어예요", color: "#0D9488", bg: "#F0FAF8", border: "#7EDFD0" };
  if (level === "medium")   return { emoji: "👍", text: "잘 하고 있어요! 조금 더 연습해봐요", color: "#7C3AED", bg: "#EDE9FE", border: "#A78BFA" };
  return { emoji: "💪", text: "더 연습이 필요한 단어예요", color: "#EC4899", bg: "#FDF2F8", border: "#F9A8D4" };
}

// quality 0~5 계산 (goodCount/5 기반)
function toQuality(goodCount: number): number {
  if (goodCount >= 5) return 5;
  if (goodCount >= 4) return 4;
  if (goodCount >= 3) return 3;
  if (goodCount >= 2) return 1;
  return 0;
}

// ─── 자동차 트랙 컴포넌트 ──────────────────────────────────────────────────────

function CarTrack({ progress, childImage }: { progress: number; childImage?: string | null }) {
  const pct = Math.max(0, Math.min(1, progress));
  const leftPct = 5 + pct * 88; // 5%~93% — 도로(inset-x-5) 범위에 맞춤
  const pctDisplay = Math.round(pct * 100);

  return (
    <div className="w-full select-none">
      {/* 라벨 — 무엇을 의미하는지 명확히 */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs font-bold text-[#8B7E74] flex items-center gap-1">
          🏁 오늘의 진도
        </span>
        <span className="text-xs font-black text-[#FFB38A]">{pctDisplay}%</span>
      </div>
      <div className="relative w-full h-12">
      {/* 도로 */}
      <div className="absolute inset-x-5 bottom-2 h-3 bg-[#F0E8E0] rounded-full overflow-hidden shadow-inner">
        {/* 차선 (점선) */}
        <div className="absolute inset-0 flex items-center justify-around px-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-3 h-0.5 bg-white/50 rounded-full" />
          ))}
        </div>
        {/* 진행 채우기 */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct * 100}%`,
            background: "linear-gradient(90deg, #FFD9B8, #FFB38A)",
          }}
        />
      </div>
      {/* 출발 */}
      <div className="absolute bottom-1.5 left-1 text-sm">🚦</div>
      {/* 결승 */}
      <div className="absolute bottom-1.5 right-1 text-sm">🏁</div>
      {/* 아이 사진 or 자동차 */}
      <div
        className="absolute transition-all duration-700 ease-out"
        style={{
          left: `${leftPct}%`,
          bottom: "10px",
          transform: "translateX(-50%)",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
        }}
      >
        {childImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={childImage}
            alt="아이"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #FFB38A",
            }}
          />
        ) : (
          <span style={{ fontSize: 24, display: "inline-block", transform: "scaleX(-1)" }}>
            🚗
          </span>
        )}
      </div>
      </div>
    </div>
  );
}

// ─── 결과 도트 컴포넌트 ────────────────────────────────────────────────────────

function ResultDots({ slots }: { slots: DotResult[] }) {
  return (
    <div className="flex items-center gap-2">
      {slots.map((result, i) => {
        const isGood = result === "good";
        const isBad = result === "bad";
        const isEmpty = result === null;
        const isLatest = !isEmpty && slots.findLastIndex((s) => s !== null) === i;

        return (
          <div
            key={i}
            className="transition-all duration-300"
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              backgroundColor: isGood ? "#7EDFD0" : isBad ? "#F9A8D4" : "#F0E8E0",
              transform: isLatest ? "scale(1.3)" : "scale(1)",
              boxShadow: isGood
                ? "0 0 0 3px rgba(126,223,208,0.3)"
                : isBad
                ? "0 0 0 3px rgba(249,168,212,0.3)"
                : "none",
              border: isEmpty ? "2px solid #E8DDD5" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function PracticeClient({
  childId,
  childName,
  childImage,
  mascotLevel,
  stage1Words,
  stage2Words,
  wordInfos,
  errorPattern,
  routineMode,
  difficulty,
}: Props) {
  // 항상 1단계부터 시작
  const startStage: Stage = 1;

  const [stage, setStage] = useState<Stage>(startStage);

  const makeItems = useCallback((s: Stage): PracticeItem[] => {
    if (s === 1) return stage1Words.map((e) => ({
      text: e.word,
      kind: "word" as const,
      badge: e.errorPattern,
      trainingTip: e.trainingTip,
      childPron: e.childPronunciation,
    }));
    if (s === 2) return stage2Words.map((w) => ({
      text: w.word,
      kind: "word" as const,
      similarTo: w.sourceWord,
    }));
    return [];
  }, [stage1Words, stage2Words]);

  const [items, setItems] = useState<PracticeItem[]>(() => makeItems(startStage));
  const [stage3Loading, setStage3Loading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dotSlots, setDotSlots] = useState<DotResult[][]>(
    () => Array.from({ length: Math.max(makeItems(startStage).length, 1) }, () => Array(MAX_DOTS).fill(null))
  );

  const [autoSavedItems, setAutoSavedItems] = useState<Map<string, MasteryLevel>>(new Map());
  const [saving, setSaving] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [allDone, setAllDone] = useState(false);

  // ── 반복 카운터 (운동학습 원리: 음소당 50회 이상이 효과적) ─────────────────────
  const [totalReps, setTotalReps] = useState(0);
  const REP_TARGET = 50;

  // ── 청각 폭격 페이즈 ─────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<"bombardment" | "practice">(
    stage1Words.length > 0 ? "bombardment" : "practice"
  );
  const bombardmentWords = [
    ...stage1Words.map((e) => e.word),
    ...stage2Words.map((w) => w.word),
  ];

  // 3단계 사전 fetch — 2단계 마지막 단어에서 미리 문장 받아두기
  const [prefetchedS3, setPrefetchedS3] = useState<string[] | null>(null);
  const prefetchInFlightRef = useRef(false);

  // 3단계 완료 후 모든 문장 리뷰 화면
  const [showSentenceReview, setShowSentenceReview] = useState(false);
  const [allSentences, setAllSentences] = useState<string[]>([]);

  const totalGood = dotSlots.flat().filter((s) => s === "good").length;
  const currentSlots = dotSlots[currentIndex] ?? Array(MAX_DOTS).fill(null);
  const filledCount = currentSlots.filter((s) => s !== null).length;
  const isSlotsFull = filledCount >= MAX_DOTS;
  const currentMastery = isSlotsFull ? getMastery(currentSlots) : null;
  const currentItem = items[currentIndex];

  // ── 단어 자동 재생 + 다시 듣기 버튼용 TTS ──────────────────────────────────────
  const { play: playWord, stop: stopWord } = useTTS();

  useEffect(() => {
    const text = currentItem?.text;
    if (!text || stage3Loading) return;
    // 문장(3단계)은 TTS 사용하지 않음 — 부모님이 읽어주는 영역
    if (currentItem?.kind === "sentence") return;
    // 청각폭격(bombardment) 중에는 메인 UI가 안 보이므로 자동재생 안 함
    // → phase가 "practice"로 바뀐 직후(사용자 클릭 이후)에 첫 단어 재생
    if (phase !== "practice") return;

    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) playWord(text).catch(() => {});
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
      stopWord();
    };
  }, [currentItem?.text, currentItem?.kind, stage3Loading, phase, playWord, stopWord]);

  const handleReplay = useCallback(() => {
    const text = currentItem?.text;
    if (text) playWord(text).catch(() => {});
  }, [currentItem?.text, playWord]);

  // ── 자동차 진행률: 전체 단계(복습+1+2+3단계) 통합 기준으로 계산 ─────────────────
  // 3단계는 AI 동적 생성이라, 진입 전엔 추정값(5개), 진입 후엔 실제 items.length 사용
  const STAGE3_ESTIMATED = 5;
  const stage3ItemCount = stage === 3 ? items.length : STAGE3_ESTIMATED;

  // 전체 아이템 수 (존재하는 단계만 합산)
  const totalAllItems =
    (stage1Words.length > 0 ? stage1Words.length : 0) +
    (stage2Words.length > 0 ? stage2Words.length : 0) +
    stage3ItemCount;

  // 현재 단계 이전까지 완료된 아이템 수
  const itemsBeforeCurrentStage = (() => {
    if (stage === 1) return 0;
    let count = stage1Words.length;
    if (stage === 2) return count;
    count += stage2Words.length;
    return count; // stage === 3
  })();

  // 전체 도트 기준 진행률 계산
  const totalAllDots = totalAllItems * MAX_DOTS;
  const globalFilledDots = itemsBeforeCurrentStage * MAX_DOTS + currentIndex * MAX_DOTS + filledCount;
  const carProgress = totalAllDots > 0 ? globalFilledDots / totalAllDots : 0;

  // ── 단계 전환 ─────────────────────────────────────────────────────────────────
  // 인트로 오버레이 없이 즉시 전환 — 버튼 한 번 누르면 바로 다음 단계
  const transitionToStage = useCallback(
    async (target: Stage) => {
      // 즉시 인덱스와 단계 상태 전환 (동기적)
      setCurrentIndex(0);
      setStage(target);

      if (target === 1) {
        const s1 = makeItems(1);
        setItems(s1);
        setDotSlots(Array.from({ length: s1.length }, () => Array(MAX_DOTS).fill(null)));
      } else if (target === 2) {
        const s2 = makeItems(2);
        setItems(s2);
        setDotSlots(Array.from({ length: s2.length }, () => Array(MAX_DOTS).fill(null)));
      } else if (target === 3) {
        // 3단계 진입 — 사전 fetch한 문장이 있으면 즉시 표시, 없으면 로딩
        if (prefetchedS3 && prefetchedS3.length > 0) {
          const s3Items: PracticeItem[] = prefetchedS3.map((s) => ({
            text: s,
            kind: "sentence",
          }));
          setItems(s3Items);
          setDotSlots(Array.from({ length: s3Items.length }, () => Array(MAX_DOTS).fill(null)));
          setAllSentences(prefetchedS3);
          return;
        }

        // 사전 fetch 못 했으면 기존처럼 로딩 → fetch
        const placeholder: PracticeItem[] = [{ text: "문장 준비 중...", kind: "sentence" }];
        setItems(placeholder);
        setDotSlots([Array(MAX_DOTS).fill(null)]);
        setStage3Loading(true);
        const allWords = [...stage1Words.map((e) => e.word), ...stage2Words.map((w) => w.word)];
        try {
          const res = await fetch("/api/practice-sentences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ words: allWords, errorPattern }),
          });
          const data = await res.json();
          const s3Items: PracticeItem[] = (data.sentences as string[]).map((s) => ({
            text: s,
            kind: "sentence",
          }));
          setItems(s3Items);
          setDotSlots(Array.from({ length: s3Items.length }, () => Array(MAX_DOTS).fill(null)));
          setAllSentences(data.sentences as string[]);
        } catch {
          const fallback: PracticeItem[] = allWords.slice(0, 5).map((w) => ({
            text: `${w}을 말해봐요!`,
            kind: "sentence",
          }));
          setItems(fallback);
          setDotSlots(Array.from({ length: fallback.length }, () => Array(MAX_DOTS).fill(null)));
          setAllSentences(fallback.map((f) => f.text));
        } finally {
          setStage3Loading(false);
        }
      }
    },
    [makeItems, stage1Words, stage2Words, errorPattern, prefetchedS3]
  );

  // ── 3단계 사전 fetch — 2단계 마지막 단어 또는 2단계 없을 때 1단계 마지막 ──
  useEffect(() => {
    if (prefetchedS3 || prefetchInFlightRef.current) return;
    if (stage1Words.length === 0) return;

    // 마지막에서 두 번째 단어 시점부터 미리 fetch
    // (단어가 1개뿐이면 0번째에서 시작 — 그래도 일부 시간 단축됨)
    const triggerIdx = Math.max(0, items.length - 2);
    const isStage1Trigger = stage === 1 && currentIndex >= triggerIdx && stage2Words.length === 0;
    const isStage2Trigger = stage === 2 && currentIndex >= triggerIdx;
    if (!isStage1Trigger && !isStage2Trigger) return;

    prefetchInFlightRef.current = true;
    const allWords = [...stage1Words.map((e) => e.word), ...stage2Words.map((w) => w.word)];
    postJson<{ sentences?: string[] }>("/api/practice-sentences", { words: allWords, errorPattern })
      .then((data) => {
        if (Array.isArray(data?.sentences) && data.sentences.length > 0) {
          setPrefetchedS3(data.sentences);
        }
      })
      .finally(() => {
        prefetchInFlightRef.current = false;
      });
  }, [stage, currentIndex, items.length, prefetchedS3, stage1Words, stage2Words, errorPattern]);

  // ── 도트 채우기 ───────────────────────────────────────────────────────────────
  const fillDot = useCallback(
    (result: "good" | "bad") => {
      if (isSlotsFull) return;
      setTotalReps((n) => n + 1);

      setDotSlots((prev) => {
        const next = prev.map((row) => [...row]);
        const slots = next[currentIndex];
        const emptyIdx = slots.findIndex((s) => s === null);
        if (emptyIdx === -1) return prev;
        slots[emptyIdx] = result;

        const filled = slots.filter((s) => s !== null).length;
        if (filled === MAX_DOTS && result === "good" && slots.every((s) => s === "good")) {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 2000);
        }
        return next;
      });
    },
    [currentIndex, isSlotsFull]
  );

  // ── 5개 채워졌을 때 처리: 저장 로직 ─────────────────────────────────────────────
  useEffect(() => {
    if (!isSlotsFull || !currentItem) return;

    const goodCount = currentSlots.filter((s) => s === "good").length;

    if (currentItem.scheduleId) {
      // 복습 아이템: SM-2 업데이트
      const quality = toQuality(goodCount);
      fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: currentItem.scheduleId, quality }),
      }).catch(() => {});
      return;
    }

    // 문장 단계 — 저장하지 않음
    if (currentItem.kind === "sentence") return;

    // 이미 저장됐거나 저장 중이면 스킵
    if (autoSavedItems.has(currentItem.text) || saving) return;

    const mastery = getMastery(currentSlots);
    setSaving(true);
    fetch("/api/saved-words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        word: currentItem.text,
        targetPhoneme: currentItem.badge ?? errorPattern ?? "연습",
        difficulty: mastery === "mastered" ? "easy" : mastery === "medium" ? "medium" : "hard",
        masteryLevel: mastery,
        goodCount,
      }),
    })
      .then(() => {
        setAutoSavedItems((prev) => new Map(prev).set(currentItem.text, mastery));
      })
      .catch(() => {})
      .finally(() => setSaving(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSlotsFull]);

  // ── 5개 채워졌을 때: 1.5초 후 자동으로 다음으로 이동 ────────────────────────────
  useEffect(() => {
    if (!isSlotsFull) return;

    // 1.5초 후 자동 이동 (컴포넌트 언마운트 또는 아이템 변경 시 타이머 취소)
    const timer = setTimeout(() => {
      handleNext();
    }, 2500);

    return () => clearTimeout(timer); // 클린업: 타이머 누수 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSlotsFull, currentIndex]);

  // ── 이전 아이템 (단계 역행 포함) ────────────────────────────────────────────────
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      // 같은 단계 안에서 이전으로
      setCurrentIndex((i) => i - 1);
      return;
    }

    // currentIndex === 0 → 이전 단계의 마지막 아이템으로 이동
    let prevStage: Stage | null = null;
    if (stage === 3) {
      prevStage = stage2Words.length > 0 ? 2 : 1;
    } else if (stage === 2) {
      prevStage = 1;
    } else if (stage === 1) {
      prevStage = null; // 1단계가 첫 단계
    }

    if (prevStage === null) return; // 이미 맨 처음

    const prevItems = makeItems(prevStage);
    setStage(prevStage);
    setItems(prevItems);
    setDotSlots((prev) => {
      // 이전 단계 아이템 수만큼 dotSlots 복원 (빈 슬롯으로)
      if (prev.length === prevItems.length) return prev;
      return Array.from({ length: Math.max(prevItems.length, 1) }, () => Array(MAX_DOTS).fill(null));
    });
    setCurrentIndex(prevItems.length - 1); // 마지막 아이템으로
  }, [currentIndex, stage, stage2Words, makeItems]);

  // ── 다음 아이템 ───────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    // 현재 단계 완료
    if (stage === 1 && stage2Words.length > 0) {
      transitionToStage(2);
    } else if (stage === 1 || stage === 2) {
      transitionToStage(3);
    } else {
      // 3단계 마지막 → 모든 문장 리뷰 화면 표시
      setShowSentenceReview(true);
    }
  }, [currentIndex, items.length, stage, stage2Words.length, transitionToStage]);

  // ── 빈 상태 ──────────────────────────────────────────────────────────────────
  if (stage1Words.length === 0) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6"
        style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
      >
        <div className="text-7xl mb-5 animate-float">📝</div>
        <h2 className="text-2xl font-black text-[#3D3530] mb-2">연습 단어가 없어요</h2>
        <p className="text-[#8B7E74] mb-6 leading-relaxed">
          발음 분석에서 발음을 먼저 입력하면<br />
          AI가 단계별 연습을 만들어드려요!
        </p>
        <Link href="/dashboard/answer-note">
          <BubbleButton variant="peach" size="lg">발음 분석 작성하기 →</BubbleButton>
        </Link>
      </div>
    );
  }

  // ── 3단계 완료 후 모든 문장 다시 보기 ─────────────────────────────────────────
  if (showSentenceReview) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center px-5 py-8"
        style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
      >
        <div className="max-w-lg w-full mx-auto flex-1 flex flex-col">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-bounce-in">📖</div>
            <h2 className="text-2xl font-black text-[#3D3530] mb-1">모두 완료했어요!</h2>
            <p className="text-sm text-[#8B7E74]">
              지금까지 연습한 문장이에요. 한 번 더 천천히 읽어볼까요?
            </p>
          </div>

          <div className="flex-1 space-y-3 mb-6">
            {allSentences.map((s, i) => (
              <div
                key={`${i}-${s}`}
                className="bg-white rounded-2xl px-5 py-4 shadow-sm border-2 border-[#F0E8E0] flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FFD4B8] text-[#3D3530] font-black text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="flex-1 text-lg font-bold text-[#3D3530] leading-relaxed pt-0.5">
                  {s}
                </p>
              </div>
            ))}
          </div>

          <BubbleButton
            variant="peach"
            size="xl"
            onClick={async () => {
              // 세션 저장 — 홈 "최근 연습"에 반영됨
              const completedWords = [
                ...stage1Words.map((e) => e.word),
                ...stage2Words.map((w) => w.word),
              ];
              try {
                await fetch("/api/sessions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ childId, words: completedWords }),
                });
              } catch {
                // 저장 실패해도 완료 화면은 정상 표시
              }
              setShowSentenceReview(false);
              setAllDone(true);
            }}
            className="w-full"
          >
            연습 마치기 🎉
          </BubbleButton>
        </div>
      </div>
    );
  }

  // ── 전체 완료 화면 ────────────────────────────────────────────────────────────
  if (allDone) {
    const masteredCount = [...autoSavedItems.values()].filter((v) => v === "mastered").length;
    const needsWorkCount = [...autoSavedItems.values()].filter((v) => v === "hard").length;
    return (
      <CompletionScreen
        childName={childName}
        totalReps={totalReps}
        repTarget={REP_TARGET}
        totalGood={totalGood}
        masteredCount={masteredCount}
        needsWorkCount={needsWorkCount}
        practiceWords={[
          ...stage1Words.map((e) => e.word),
          ...stage2Words.map((w) => w.word),
        ]}
        errorPattern={errorPattern}
        childId={childId}
        routineMode={routineMode}
      />
    );
  }


  // ── 청각 폭격 화면 ───────────────────────────────────────────────────────────
  if (phase === "bombardment") {
    return (
      <AuditoryBombardment
        words={bombardmentWords}
        onDone={() => setPhase("practice")}
      />
    );
  }

  // ── 연습 화면 ─────────────────────────────────────────────────────────────────
  const meta = STAGE_META[String(stage)];
  const masteryInfo = currentMastery ? getMasteryLabel(currentMastery) : null;
  const savedMastery = autoSavedItems.get(currentItem?.text ?? "");
  const goodCount = currentSlots.filter((s) => s === "good").length;

  // 단계 인디케이터 (3단계)
  const stageSteps = (
    [
      { key: 1 as Stage, show: stage1Words.length > 0 },
      { key: 2 as Stage, show: stage2Words.length > 0 },
      { key: 3 as Stage, show: true },
    ] as { key: Stage; show: boolean }[]
  ).filter((s) => s.show);

  const stageIdx = stageSteps.findIndex((s) => s.key === stage);

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
    >
      <ConfettiEffect trigger={confetti} />

      {/* 단계 표시 바 */}
      <div className="max-w-lg mx-auto w-full px-5 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
          <span className="text-xs text-[#8B7E74] font-semibold">
            {difficulty && (
              <span className="mr-2 text-[#A89B8E]">
                난이도 {DIFFICULTY_LABEL[difficulty]}
              </span>
            )}
            {currentIndex + 1} / {items.length}
          </span>
        </div>
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentIndex + 1) / items.length) * 100}%`,
              backgroundColor: meta.color,
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="max-w-lg mx-auto w-full flex justify-center gap-2 mb-1">
        {stageSteps.map((s, i) => {
          const sMeta = STAGE_META[String(s.key)];
          const isPast = i < stageIdx;
          const isCurrent = i === stageIdx;
          return (
            <div key={String(s.key)} className="flex items-center gap-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all"
                style={{
                  backgroundColor: isCurrent ? sMeta.color : isPast ? "#7EDFD0" : "#F0E8E0",
                  color: isCurrent || isPast ? "white" : "#C4B5A8",
                }}
              >
                {isPast ? "✓" : i + 1}
              </div>
              {i < stageSteps.length - 1 && (
                <div
                  className="w-6 h-0.5 rounded"
                  style={{ backgroundColor: isPast ? "#7EDFD0" : "#F0E8E0" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="max-w-lg mx-auto w-full flex flex-col items-center gap-3 px-6">

          {/* 연습 카드 */}
          <div
            className="w-full bg-white/90 rounded-[32px] shadow-lg text-center"
            style={{ border: `2px solid ${meta.color}22` }}
          >
            {/* 2단계 유사 패턴 라벨 — 좌상단에 작게 표시 */}
            {currentItem?.similarTo && (
              <span className="block text-[11px] font-semibold text-[#8B7E74] pt-4 pb-1">
                🔗 <span className="text-[#FFB38A]">{currentItem.similarTo}</span>와 유사
              </span>
            )}

            {currentItem?.badge && (
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mt-4 mb-1"
                style={{ backgroundColor: meta.bg, color: meta.color }}
              >
                {stripEnglishParens(currentItem.badge)}
              </span>
            )}

            {/* ── 단어 표시 영역: 버튼이 이 영역의 세로 중앙에 고정됨 ── */}
            {/* relative를 카드 전체가 아닌 이 영역에만 적용 → 처방전 길이에 영향 없음 */}
            <div className="relative flex items-center justify-center px-14 py-6">

              {/* ← 이전 (좌측 원형 화살표 버튼) */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0 && stage === startStage}
                aria-label="이전"
                className="group absolute left-3 top-1/2 -translate-y-1/2 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
              >
                <span className="w-10 h-10 rounded-full bg-white border-2 border-[#F0E8E0] flex items-center justify-center text-xl font-bold text-[#8B7E74] group-enabled:group-hover:bg-[#FFF5EE] group-enabled:group-hover:border-[#FFB38A] group-enabled:group-hover:text-[#FFB38A] transition-colors shadow-sm">
                  ←
                </span>
              </button>

              {/* 단어 / 문장 콘텐츠 — 글자 수에 따라 크기 자동 조정 */}
              {(() => {
                const text = currentItem?.text ?? "";
                const childPron = currentItem?.childPron ?? "";
                const maxLen = Math.max(text.length, childPron.length);
                // 비교 뷰용 크기 (좌: 아이 발음, 우: 옳은 표현)
                const compareLeft  = maxLen <= 2 ? "2.75rem" : maxLen === 3 ? "2.25rem" : maxLen === 4 ? "1.875rem" : "1.5rem";
                const compareRight = maxLen <= 2 ? "3.5rem"  : maxLen === 3 ? "2.75rem" : maxLen === 4 ? "2.25rem" : "1.875rem";
                // 단일 단어 뷰용 크기
                const singleSize = text.length <= 2 ? "4rem" : text.length === 3 ? "3.25rem" : text.length === 4 ? "2.5rem" : "2rem";

                if (currentItem?.childPron && currentItem?.kind !== "sentence") {
                  return (
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center min-w-0">
                        <p className="text-[10px] text-[#8B7E74] mb-0.5">아이 발음</p>
                        <p
                          className="font-bold text-[#FCA5A5] whitespace-nowrap"
                          style={{ fontSize: compareLeft }}
                        >
                          {childPron}
                        </p>
                      </div>
                      <span className="text-2xl text-[#C4B5A8] flex-shrink-0">→</span>
                      <div className="text-center min-w-0">
                        <p className="text-[10px] text-[#8B7E74] mb-0.5">옳은 표현</p>
                        <p
                          className="font-black text-[#3D3530] whitespace-nowrap"
                          style={{ fontSize: compareRight }}
                        >
                          {text}
                        </p>
                      </div>
                    </div>
                  );
                }
                if (stage3Loading) {
                  return (
                    <div className="py-6">
                      <div className="text-5xl mb-3 animate-bounce">🤖</div>
                      <p className="text-base font-bold text-[#3D3530]">AI가 문장을 만들고 있어요</p>
                      <p className="text-xs text-[#8B7E74] mt-1 animate-pulse">잠시만 기다려주세요...</p>
                    </div>
                  );
                }
                const slug = currentItem?.kind === "sentence" ? undefined : wordInfos[text]?.imageSlug;
                return (
                  <div className="flex flex-col items-center gap-2">
                    {slug && (
                      <WordImage word={text} imageSlug={slug} size="xl" />
                    )}
                    <p
                      className="font-black text-[#3D3530] tracking-wide leading-snug"
                      style={{ fontSize: currentItem?.kind === "sentence" ? "1.75rem" : singleSize }}
                    >
                      {text}
                    </p>
                  </div>
                );
              })()}

              {/* → 다음 (우측 원형 화살표 버튼 — 단계 전환도 가능) */}
              <button
                onClick={handleNext}
                aria-label="다음"
                className="group absolute right-3 top-1/2 -translate-y-1/2 transition-all active:scale-90"
              >
                <span className="w-10 h-10 rounded-full bg-white border-2 border-[#F0E8E0] flex items-center justify-center text-xl font-bold text-[#8B7E74] group-hover:bg-[#FFF5EE] group-hover:border-[#FFB38A] group-hover:text-[#FFB38A] transition-colors shadow-sm">
                  →
                </span>
              </button>
            </div>

            {!stage3Loading && currentItem?.kind === "sentence" && (
              <div className="flex justify-center pb-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDE9FE] border border-[#C4B5FD] text-[#7C3AED] font-bold text-sm">
                  <span className="text-base">📖</span>
                  부모님이 읽어주세요
                </div>
              </div>
            )}

            {/* 훈련 팁 (2단계 처방전) — 단어 영역 아래에 별도 배치 */}
            {currentItem?.trainingTip && !stage3Loading && currentItem?.kind !== "sentence" && (
              <p className="text-xs text-[#C4B5A8] px-6 pb-5 leading-relaxed">
                💡 {currentItem.trainingTip}
              </p>
            )}
          </div>

          {/* 🚗 자동차 트랙 */}
          <CarTrack progress={carProgress} childImage={childImage} />

          {/* 반복 카운터 — 학습 효과 측정 (50회 이상 반복해야 뇌가 자동화) */}
          <div className="w-full bg-[#FAF7F4] rounded-xl px-3 py-2.5 border border-[#F0E8E0]">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-[#8B7E74] flex-shrink-0 font-bold flex items-center gap-1">
                🔁 발음 연습 횟수
              </span>
              <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (totalReps / REP_TARGET) * 100)}%`,
                    background: totalReps >= REP_TARGET
                      ? "linear-gradient(90deg,#7EDFD0,#2ECC71)"
                      : "linear-gradient(90deg,#C4B5A8,#8B7E74)",
                  }}
                />
              </div>
              <span
                className="text-xs font-black flex-shrink-0 min-w-[44px] text-right"
                style={{ color: totalReps >= REP_TARGET ? "#0D9488" : "#8B7E74" }}
              >
                {totalReps >= REP_TARGET ? "🎯 " : ""}{totalReps}/{REP_TARGET}
              </span>
            </div>
            <p className="text-[10px] text-[#C4B5A8] mt-1.5 leading-tight pl-0.5">
              {totalReps >= REP_TARGET
                ? "✨ 목표 달성! 같은 음소를 충분히 연습했어요"
                : "같은 음소가 들어간 단어들이 모두 누적돼요 · 50회면 뇌가 발음을 자동화해요"}
            </p>
          </div>

          {/* 도트 (5개) */}
          <ResultDots slots={currentSlots} />

          {/* 5개 채워졌을 때 마스터리 카드 */}
          {masteryInfo && (
            <div
              className="w-full rounded-2xl px-5 py-3 text-center animate-bounce-in"
              style={{
                backgroundColor: masteryInfo.bg,
                border: `2px solid ${masteryInfo.border}`,
              }}
            >
              <p className="font-black" style={{ color: masteryInfo.color }}>
                {masteryInfo.emoji} {masteryInfo.text}
              </p>
              {!currentItem?.scheduleId && savedMastery && (
                <p className="text-xs mt-1 opacity-70" style={{ color: masteryInfo.color }}>
                  {savedMastery === "mastered"
                    ? "복습 주기가 길게 설정됐어요 🗓"
                    : "복습 목록에 추가됐어요 📌"}
                </p>
              )}
            </div>
          )}

          {/* 도트 안내 */}
          {!isSlotsFull && (
            <div className="text-center space-y-1">
              <p className="text-xs text-[#C4B5A8]">소리내어 읽으면 부모님이 판단해주세요</p>
              <p className="text-xs text-[#C4B5A8]">
                아이 발음을 듣고 버튼을 눌러주세요 ({filledCount}/{MAX_DOTS})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="max-w-lg mx-auto w-full px-6 pb-8 pt-5 space-y-3">
        {/* 평가 버튼 2개 — 로딩 중에는 비활성 */}
        {!isSlotsFull && !stage3Loading && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                fillDot("bad");
                // 마지막(5번째) 도트가 아닐 때만 TTS 재생 — 다음 단어로 넘어가기 전 마지막엔 안 들려줌
                if (currentItem?.kind !== "sentence" && currentItem?.text && filledCount < MAX_DOTS - 1) {
                  playWord(currentItem.text).catch(() => {});
                }
              }}
              className="flex-1 py-4 rounded-2xl font-black text-base transition-all active:scale-95"
              style={{
                backgroundColor: "#FDF2F8",
                border: "2px solid #F9A8D4",
                color: "#EC4899",
              }}
            >
              아직 어려워요 🔄
            </button>
            <button
              onClick={() => {
                fillDot("good");
                // 마지막(5번째) 도트가 아닐 때만 TTS 재생
                if (currentItem?.kind !== "sentence" && currentItem?.text && filledCount < MAX_DOTS - 1) {
                  playWord(currentItem.text).catch(() => {});
                }
              }}
              className="flex-1 py-4 rounded-2xl font-black text-base transition-all active:scale-95"
              style={{
                backgroundColor: "#F0FAF8",
                border: "2px solid #7EDFD0",
                color: "#0D9488",
              }}
            >
              잘 됐어요 ✓
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
