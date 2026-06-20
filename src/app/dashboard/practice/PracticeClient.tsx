"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { ConfettiEffect } from "@/components/child/ConfettiEffect";
import { ListenPickGame } from "@/components/child/ListenPickGame";
import { ShadowMatchGame } from "@/components/child/ShadowMatchGame";
import { PuzzleGame } from "@/components/child/PuzzleGame";
import type { PickCard } from "@/lib/mini-game";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { stripEnglishParens } from "@/lib/strip-english";
import { postJson } from "@/lib/client-fetch";
import { useTTS } from "@/lib/useTTS";
import { usePracticeRecorder } from "@/lib/usePracticeRecorder";
import { DIFFICULTY_LABEL, type Difficulty } from "@/lib/adaptive-difficulty";
import { WordImage } from "@/components/ui/WordImage";
import { ArticulationDiagram } from "@/components/ui/ArticulationDiagram";
import { getArticulationSlug, phonemeFromPattern } from "@/lib/articulation-mapper";
import { useRecorder } from "@/lib/useRecorder";
import type { PracticeCycle } from "./page";
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
            <BubbleButton variant="peach" size="md" onClick={startPlaying}>
              ▶️ 듣기 시작
            </BubbleButton>
            <BubbleButton variant="gray" size="md" onClick={onDone}>
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
  wordInfos: Record<string, { imageSlug?: string; difficulty?: string; ageGroup?: string }>;
  errorPattern?: string;
  /** 오늘의 루틴 2단계로 진입 — 완료 화면이 루틴 피날레가 됨 */
  routineMode?: boolean;
  /** 적응형 난이도 — 최근 결과로 서버에서 계산 (3연속 성공 ↑, 2연속 실패 ↓) */
  difficulty?: Difficulty;
  /** 3사이클 구조 — 제공되면 사이클 모드로 동작 */
  cycles?: PracticeCycle[];
  /** 이미 저장된 단어 — 저장 버튼 초기 채움 상태 */
  initialSavedWords?: string[];
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

// 사이클 모드 아이템 (PracticeItem 확장)
interface CycleItem extends PracticeItem {
  cycleIdx: number;
  cycleEnd: boolean; // 사이클의 마지막 아이템(문장 또는 마지막 단어)
}

// 사이클 아이템 빌더
function buildCycleItems(cycles: PracticeCycle[]): CycleItem[] {
  const items: CycleItem[] = [];
  cycles.forEach((cycle, ci) => {
    const cycleItems: CycleItem[] = [];
    if (cycle.mainWord) {
      cycleItems.push({
        text: cycle.mainWord.word,
        kind: "word",
        badge: cycle.mainWord.errorPattern,
        trainingTip: cycle.mainWord.trainingTip,
        childPron: cycle.mainWord.childPronunciation,
        cycleIdx: ci,
        cycleEnd: false,
      });
    }
    cycle.similarWords.forEach((s) => {
      cycleItems.push({
        text: s.word,
        kind: "word",
        similarTo: s.sourceWord,
        cycleIdx: ci,
        cycleEnd: false,
      });
    });
    if (cycle.sentence) {
      cycleItems.push({ text: cycle.sentence, kind: "sentence", cycleIdx: ci, cycleEnd: true });
    } else if (cycleItems.length > 0) {
      cycleItems[cycleItems.length - 1].cycleEnd = true;
    }
    items.push(...cycleItems);
  });
  return items;
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

// 사이클 모드 카드 스타일
const CYCLE_META = {
  word: { label: "발음연습", color: "#FFB38A", bg: "#FFF5EE" },
  sentence: { label: "문장연습", color: "#0D9488", bg: "#F0FAF8" },
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
  cycles,
  initialSavedWords,
}: Props) {
  // 사이클 모드 여부
  const isCycleMode = !!(cycles && cycles.length > 0);

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

  // 사이클 모드: 모든 아이템을 한 번에 flat하게 구성
  const cycleItems = useMemo<CycleItem[]>(() => {
    if (!isCycleMode || !cycles) return [];
    return buildCycleItems(cycles);
  }, [isCycleMode, cycles]);

  const [items, setItems] = useState<PracticeItem[]>(() =>
    isCycleMode ? cycleItems : makeItems(startStage)
  );
  const [stage3Loading, setStage3Loading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dotSlots, setDotSlots] = useState<DotResult[][]>(
    () => {
      const len = isCycleMode ? cycleItems.length : Math.max(makeItems(startStage).length, 1);
      return Array.from({ length: Math.max(len, 1) }, () => Array(MAX_DOTS).fill(null));
    }
  );

  const [autoSavedItems, setAutoSavedItems] = useState<Map<string, MasteryLevel>>(new Map());
  // 수동 저장 — 부모가 카드의 저장 버튼을 누른 단어만 SavedWord에 보관
  const [savedWords, setSavedWords] = useState<Set<string>>(() => new Set(initialSavedWords ?? []));
  const [savingWord, setSavingWord] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [showTongue, setShowTongue] = useState(false);

  // ── 반복 카운터 (운동학습 원리: 음소당 50회 이상이 효과적) ─────────────────────
  const [totalReps, setTotalReps] = useState(0);
  const REP_TARGET = 50;

  // ── 청각 폭격 페이즈 ─────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<"bombardment" | "practice">(
    (isCycleMode ? cycleItems.length > 0 : stage1Words.length > 0) ? "bombardment" : "practice"
  );

  // 청각 폭격용 단어 목록 (사이클 모드: 사이클에서 추출, 기존: stage1+stage2)
  const bombardmentWords = useMemo(() => {
    if (isCycleMode && cycles) {
      return cycles
        .flatMap((c) => [c.mainWord?.word, ...c.similarWords.map((s) => s.word)])
        .filter(Boolean)
        .slice(0, 6) as string[];
    }
    return [
      ...stage1Words.map((e) => e.word),
      ...stage2Words.slice(0, Math.max(0, 6 - stage1Words.length)).map((w) => w.word),
    ].slice(0, 6);
  }, [isCycleMode, cycles, stage1Words, stage2Words]);

  // 3단계 사전 fetch — 2단계 마지막 단어에서 미리 문장 받아두기 (비-사이클 모드 전용)
  const [prefetchedS3, setPrefetchedS3] = useState<string[] | null>(null);
  const prefetchInFlightRef = useRef(false);

  // 3단계 완료 후 모든 문장 리뷰 화면 (비-사이클 모드 전용)
  const [showSentenceReview, setShowSentenceReview] = useState(false);
  const [allSentences, setAllSentences] = useState<string[]>([]);

  // ── 단계 사이 미니게임 ─────────────────────────────────────────────────────────
  const MINI_GAMES = ["listen", "shadow", "puzzle"] as const;
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [gameType, setGameType] = useState<(typeof MINI_GAMES)[number]>("listen");
  const interstitialCountRef = useRef(0);
  // 미니게임 후 복귀할 다음 인덱스 (사이클 모드에서 사용)
  const nextIndexAfterGameRef = useRef<number | null>(null);

  // 현재 사이클 인덱스 (사이클 모드에서 파생)
  const currentCycleIdx = isCycleMode
    ? (items[currentIndex] as CycleItem | undefined)?.cycleIdx ?? 0
    : 0;

  // 그림 있는 단어 후보 — 사이클 모드: 현재 사이클 단어 중 이미지 있는 것
  const gamePool = useMemo<PickCard[]>(() => {
    const seen = new Set<string>();
    const out: PickCard[]= [];
    if (isCycleMode) {
      const cycleWordItems = (items as CycleItem[]).filter(
        (it) => it.cycleIdx === currentCycleIdx && it.kind === "word"
      );
      for (const it of cycleWordItems) {
        const info = wordInfos[it.text];
        if (info?.imageSlug && !seen.has(it.text)) {
          seen.add(it.text);
          out.push({ word: it.text, imageSlug: info.imageSlug });
        }
      }
    } else {
      for (const w of [...stage1Words.map((e) => e.word), ...stage2Words.map((s) => s.word)]) {
        const info = wordInfos[w];
        if (!info?.imageSlug) continue;
        if (!seen.has(w)) {
          seen.add(w);
          out.push({ word: w, imageSlug: info.imageSlug });
        }
      }
    }
    return out;
  }, [isCycleMode, items, currentCycleIdx, wordInfos, stage1Words, stage2Words]);

  const totalGood = dotSlots.flat().filter((s) => s === "good").length;
  const currentSlots = dotSlots[currentIndex] ?? Array(MAX_DOTS).fill(null);
  const filledCount = currentSlots.filter((s) => s !== null).length;
  const isSlotsFull = filledCount >= MAX_DOTS;
  const currentMastery = isSlotsFull ? getMastery(currentSlots) : null;
  const currentItem = items[currentIndex];

  // ── 조음 단면도(혀 모양): 현재 단어의 목표 음소 추출 ──────────────────────────────
  const tonguePhoneme =
    currentItem?.kind === "sentence"
      ? null
      : phonemeFromPattern(currentItem?.badge) ?? phonemeFromPattern(errorPattern);
  const hasTongueDiagram = !!getArticulationSlug(tonguePhoneme);

  // ── 단어 자동 재생 + 다시 듣기 버튼용 TTS ──────────────────────────────────────
  const { play: playWord, stop: stopWord } = useTTS();

  useEffect(() => {
    const text = currentItem?.text;
    if (!text || stage3Loading) return;
    // 청각폭격(bombardment) 중에는 메인 UI가 안 보이므로 자동재생 안 함
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

  // ── 녹음 훅 ──────────────────────────────────────────────────────────────────
  const { recState, startRec, stopRec, playRec, resetRec } = useRecorder();

  // 카드 변경 시 녹음 초기화
  useEffect(() => {
    resetRec();
  }, [currentIndex, resetRec]);

  // ── 단계 전환 (비-사이클 모드 전용) ─────────────────────────────────────────────
  const transitionToStage = useCallback(
    async (target: Stage) => {
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

  // ── 3단계 사전 fetch — 비-사이클 모드 전용 ──────────────────────────────────────
  useEffect(() => {
    if (isCycleMode) return; // 사이클 모드는 DB 문장 사용
    if (prefetchedS3 || prefetchInFlightRef.current) return;
    if (stage1Words.length === 0) return;

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
  }, [isCycleMode, stage, currentIndex, items.length, prefetchedS3, stage1Words, stage2Words, errorPattern]);

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

  // ── 단어별 세션 기록: 5도트 완료 즉시 저장 (중간 이탈해도 그날 기록 보존) ──────
  const recordWord = usePracticeRecorder(childId);

  // ── 5개 채워졌을 때 처리: 저장 로직 ─────────────────────────────────────────────
  useEffect(() => {
    if (!isSlotsFull || !currentItem) return;

    const goodCount = currentSlots.filter((s) => s === "good").length;

    // 문장 제외 모든 단어를 세션에 기록 — 홈 최근연습·캘린더·streak 반영
    if (currentItem.kind !== "sentence") {
      recordWord(currentItem.text, goodCount >= 3);
    }

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

    // 문장 단계 — 기록하지 않음
    if (currentItem.kind === "sentence") return;

    // 완료 요약(잘함/더 연습)용 마스터리만 기록 — 실제 저장은 부모가 카드 저장 버튼으로 직접
    if (autoSavedItems.has(currentItem.text)) return;
    setAutoSavedItems((prev) => new Map(prev).set(currentItem.text, getMastery(currentSlots)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSlotsFull]);

  // ── 수동 저장 토글 (카드 우상단 저장 버튼) ───────────────────────────────────────
  const toggleSaveWord = useCallback(() => {
    const item = items[currentIndex] as CycleItem | undefined;
    if (!item || item.kind === "sentence") return;
    const word = item.text;
    if (savingWord === word) return;

    const alreadySaved = savedWords.has(word);
    setSavingWord(word);
    if (alreadySaved) {
      // 저장 해제 — 단일 단어 삭제
      fetch(`/api/saved-words?word=${encodeURIComponent(word)}&childId=${encodeURIComponent(childId)}`, {
        method: "DELETE",
      })
        .then((r) => {
          if (!r.ok) throw new Error();
          setSavedWords((prev) => {
            const next = new Set(prev);
            next.delete(word);
            return next;
          });
        })
        .catch(() => {})
        .finally(() => setSavingWord(null));
    } else {
      const mastery = getMastery(currentSlots);
      fetch("/api/saved-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          word,
          targetPhoneme: item.badge ?? errorPattern ?? "연습",
          difficulty: mastery === "mastered" ? "easy" : mastery === "medium" ? "medium" : "hard",
        }),
      })
        .then((r) => {
          if (!r.ok) throw new Error();
          setSavedWords((prev) => new Set(prev).add(word));
        })
        .catch(() => {})
        .finally(() => setSavingWord(null));
    }
  }, [items, currentIndex, savedWords, savingWord, childId, errorPattern, currentSlots]);

  // ── 현재 단계 기준으로 다음 단계로 전환 (비-사이클 모드, 미니게임 후 호출) ──────
  const proceedToNextStage = useCallback(() => {
    if (stage === 1 && stage2Words.length > 0) {
      transitionToStage(2);
    } else if (stage === 1 || stage === 2) {
      transitionToStage(3);
    } else {
      setShowSentenceReview(true);
    }
  }, [stage, stage2Words.length, transitionToStage]);

  // 미니게임 후 다음으로 진행 (사이클/비사이클 공통)
  const proceedAfterGame = useCallback(() => {
    setShowInterstitial(false);
    if (isCycleMode) {
      // 사이클 모드: 저장해둔 다음 인덱스로 이동 또는 완료
      const nextIdx = nextIndexAfterGameRef.current;
      if (nextIdx !== null && nextIdx < items.length) {
        setCurrentIndex(nextIdx);
        nextIndexAfterGameRef.current = null;
      } else {
        setAllDone(true);
      }
    } else {
      proceedToNextStage();
    }
  }, [isCycleMode, items.length, proceedToNextStage]);

  // ── 다음 아이템 ───────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (isCycleMode) {
      const ci = (items[currentIndex] as CycleItem | undefined);
      // 사이클 끝 아이템이고 더 아이템이 있으면 → 미니게임 (gamePool ≥ 2)
      if (ci?.cycleEnd && currentIndex + 1 < items.length) {
        if (gamePool.length >= 2) {
          const idx = interstitialCountRef.current++;
          setGameType(MINI_GAMES[idx % MINI_GAMES.length]);
          nextIndexAfterGameRef.current = currentIndex + 1;
          setShowInterstitial(true);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
        return;
      }
      // 마지막 아이템
      if (currentIndex + 1 >= items.length) {
        if (ci?.cycleEnd && gamePool.length >= 2) {
          const idx = interstitialCountRef.current++;
          setGameType(MINI_GAMES[idx % MINI_GAMES.length]);
          nextIndexAfterGameRef.current = null; // 게임 후 완료
          setShowInterstitial(true);
        } else {
          setAllDone(true);
        }
        return;
      }
      // 일반 다음
      setCurrentIndex((i) => i + 1);
      return;
    }

    // 비-사이클 모드 (기존 로직)
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    if (stage === 3) {
      setShowSentenceReview(true);
      return;
    }
    if (gamePool.length >= 2) {
      const idx = interstitialCountRef.current++;
      setGameType(MINI_GAMES[idx % MINI_GAMES.length]);
      setShowInterstitial(true);
    } else {
      proceedToNextStage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCycleMode, currentIndex, items, stage, gamePool.length, proceedToNextStage]);

  // ── 5개 채워졌을 때: 2.5초 후 자동으로 다음으로 이동 ────────────────────────────
  useEffect(() => {
    if (!isSlotsFull) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 2500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSlotsFull, currentIndex]);

  // ── 이전 아이템 ────────────────────────────────────────────────────────────────
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      return;
    }
    if (isCycleMode) return; // 사이클 모드에서 맨 처음이면 더 이상 뒤로 없음

    // 비-사이클 모드: 이전 단계의 마지막 아이템으로
    let prevStage: Stage | null = null;
    if (stage === 3) {
      prevStage = stage2Words.length > 0 ? 2 : 1;
    } else if (stage === 2) {
      prevStage = 1;
    } else if (stage === 1) {
      prevStage = null;
    }
    if (prevStage === null) return;

    const prevItems = makeItems(prevStage);
    setStage(prevStage);
    setItems(prevItems);
    setDotSlots((prev) => {
      if (prev.length === prevItems.length) return prev;
      return Array.from({ length: Math.max(prevItems.length, 1) }, () => Array(MAX_DOTS).fill(null));
    });
    setCurrentIndex(prevItems.length - 1);
  }, [currentIndex, isCycleMode, stage, stage2Words, makeItems]);

  // ── 빈 상태 ──────────────────────────────────────────────────────────────────
  const isEmpty = isCycleMode ? cycleItems.length === 0 : stage1Words.length === 0;
  if (isEmpty) {
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

  // ── 3단계 완료 후 모든 문장 다시 보기 (비-사이클 모드 전용) ──────────────────────
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
            onClick={() => {
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

  // ── 혀 모양 단면도 팝업 모달 ──────────────────────────────────────────────────
  const tongueModal = showTongue && tonguePhoneme ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={() => setShowTongue(false)}
    >
      <div
        className="bg-[#FFF9F2] rounded-3xl p-6 w-full max-w-xs shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-black text-[#3D3530]">👅 혀 위치</p>
          <button
            onClick={() => setShowTongue(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8E0] hover:bg-[#FFEAD9] text-[#8B7E74] font-bold text-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <ArticulationDiagram phoneme={tonguePhoneme} size="lg" className="w-full" />
      </div>
    </div>
  ) : null;

  // ── 전체 완료 화면 ────────────────────────────────────────────────────────────
  if (allDone) {
    const masteredCount = [...autoSavedItems.values()].filter((v) => v === "mastered").length;
    const needsWorkCount = [...autoSavedItems.values()].filter((v) => v === "hard").length;
    const practiceWords = isCycleMode && cycles
      ? cycles.flatMap((c) => [c.mainWord?.word, ...c.similarWords.map((s) => s.word)]).filter(Boolean) as string[]
      : [...stage1Words.map((e) => e.word), ...stage2Words.map((w) => w.word)];
    return (
      <CompletionScreen
        childName={childName}
        totalReps={totalReps}
        repTarget={REP_TARGET}
        totalGood={totalGood}
        masteredCount={masteredCount}
        needsWorkCount={needsWorkCount}
        practiceWords={practiceWords}
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

  // ── 단계 사이 미니게임 (전환마다 로테이션) ─────────────────────────────────────
  if (showInterstitial) {
    if (gameType === "shadow") return <ShadowMatchGame pool={gamePool} onDone={proceedAfterGame} />;
    if (gameType === "puzzle") return <PuzzleGame pool={gamePool} onDone={proceedAfterGame} />;
    return <ListenPickGame pool={gamePool} onDone={proceedAfterGame} />;
  }

  // ── 연습 화면 ─────────────────────────────────────────────────────────────────
  const masteryInfo = currentMastery ? getMasteryLabel(currentMastery) : null;

  // 사이클 모드: 카드 색상은 아이템 종류에 따라
  const cycleMeta = isCycleMode
    ? (currentItem?.kind === "sentence" ? CYCLE_META.sentence : CYCLE_META.word)
    : null;

  // 비-사이클 모드: 단계 인디케이터
  const meta = STAGE_META[String(stage)];
  const stageSteps = isCycleMode ? [] : (
    [
      { key: 1 as Stage, show: stage1Words.length > 0 },
      { key: 2 as Stage, show: stage2Words.length > 0 },
      { key: 3 as Stage, show: true },
    ] as { key: Stage; show: boolean }[]
  ).filter((s) => s.show);
  const stageIdx = stageSteps.findIndex((s) => s.key === stage);

  // 카드 테두리 색상
  const cardBorderColor = isCycleMode ? cycleMeta!.color : meta.color;

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 50%, #EDE9FE 100%)" }}
    >
      {tongueModal}
      <ConfettiEffect trigger={confetti} />

      {/* 진행 표시 바 */}
      <div className="max-w-lg mx-auto w-full px-5 py-2">
        <div className="flex items-center justify-between mb-1.5">
          {isCycleMode ? (
            /* 사이클 모드: 사이클 진행 표시 */
            <div className="flex items-center gap-2">
              {cycles!.map((_, ci) => (
                <div
                  key={ci}
                  className="rounded-full transition-all duration-300 flex items-center justify-center"
                  style={{
                    width: ci === currentCycleIdx ? 28 : 20,
                    height: ci === currentCycleIdx ? 28 : 20,
                    background: ci < currentCycleIdx ? "#7EDFD0" : ci === currentCycleIdx ? "#FFB38A" : "#F0E8E0",
                    fontSize: 11,
                    fontWeight: 900,
                    color: ci <= currentCycleIdx ? "white" : "#C4B5A8",
                  }}
                >
                  {ci < currentCycleIdx ? "✓" : ci + 1}
                </div>
              ))}
            </div>
          ) : (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
          )}
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
              backgroundColor: isCycleMode ? cycleMeta!.color : meta.color,
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      {/* 비-사이클 모드: 스텝 인디케이터 */}
      {!isCycleMode && (
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
      )}

      {/* 메인 영역 — 카드~버튼을 하나의 묶음으로 가운데 정렬 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2.5 py-4">
        <div className="max-w-lg mx-auto w-full flex flex-col items-center gap-2.5 px-6">

          {/* 연습 카드 + 카드 밖 버튼들을 감싸는 래퍼 */}
          <div className="relative w-full mt-12">

            {/* 카드 밖 상단 — 혀(좌) / 녹음+저장(우) */}
            <div className="absolute -top-11 left-0 right-0 flex items-center justify-between px-1 z-10">
              {/* 왼쪽: 혀 위치 버튼 */}
              <div>
                {hasTongueDiagram && !stage3Loading ? (
                  <button
                    onClick={() => setShowTongue(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#FFD4B8] shadow-sm transition-all active:scale-90 hover:bg-[#FFEAD9]"
                    title="혀 위치 보기"
                  >
                    <span className="text-lg leading-none">👅</span>
                  </button>
                ) : <span />}
              </div>

              {/* 오른쪽: 녹음 + 저장 */}
              <div className="flex items-center gap-1.5">
                {/* 녹음 버튼 상태 */}
                {!stage3Loading && (
                  <>
                    {recState === "idle" && (
                      <button
                        onClick={startRec}
                        className="flex items-center gap-1 h-9 px-3 rounded-full border shadow-sm transition-all active:scale-90 bg-white hover:bg-[#F0FAF8] border-[#7EDFD0] text-[#0D9488]"
                      >
                        <span className="text-sm leading-none">🎙</span>
                        <span className="text-xs font-bold leading-none">녹음</span>
                      </button>
                    )}
                    {recState === "recording" && (
                      <button
                        onClick={stopRec}
                        className="flex items-center gap-1 h-9 px-3 rounded-full border shadow-sm transition-all active:scale-90 animate-pulse bg-[#FEF2F2] border-[#FCA5A5] text-[#EF4444]"
                      >
                        <span className="text-sm leading-none">⏹</span>
                        <span className="text-xs font-bold leading-none">중지</span>
                      </button>
                    )}
                    {recState === "recorded" && (
                      <>
                        <button
                          onClick={playRec}
                          className="flex items-center gap-1 h-9 px-3 rounded-full border shadow-sm transition-all active:scale-90 bg-white hover:bg-[#F0FAF8] border-[#7EDFD0] text-[#0D9488]"
                        >
                          <span className="text-xs font-bold leading-none">▶ 듣기</span>
                        </button>
                        <button
                          onClick={resetRec}
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#F0E8E0] shadow-sm text-[#8B7E74] transition-all active:scale-90 hover:bg-[#FFF5EE]"
                          title="다시 녹음"
                        >
                          <span className="text-sm leading-none">🔄</span>
                        </button>
                      </>
                    )}
                  </>
                )}
                {/* 저장 버튼 */}
                {currentItem && currentItem.kind !== "sentence" && !stage3Loading && (
                  <button
                    onClick={toggleSaveWord}
                    disabled={savingWord === currentItem.text}
                    className={`flex items-center gap-1 h-9 px-3 rounded-full border shadow-sm transition-all active:scale-90 disabled:opacity-60 ${
                      savedWords.has(currentItem.text)
                        ? "bg-[#FFB38A] border-[#FF9B6A] text-white"
                        : "bg-white hover:bg-[#FFF5EE] border-[#F0E8E0] text-[#8B7E74]"
                    }`}
                    title={savedWords.has(currentItem.text) ? "저장됨 — 누르면 해제" : "단어장에 저장"}
                  >
                    {savedWords.has(currentItem.text)
                      ? <BookmarkCheck size={15} strokeWidth={2.5} />
                      : <Bookmark size={15} strokeWidth={2} />}
                    <span className="text-xs font-bold leading-none">
                      {savedWords.has(currentItem.text) ? "저장됨" : "저장"}
                    </span>
                  </button>
                )}
              </div>
            </div>

          {/* 연습 카드 */}
          <div
            className="relative w-full bg-white/90 rounded-[32px] shadow-lg text-center"
            style={{ border: `2px solid ${cardBorderColor}22` }}
          >
            {/* 2단계 유사 패턴 라벨 */}
            {currentItem?.similarTo && (
              <span className="block text-[11px] font-semibold text-[#8B7E74] pt-4 pb-1">
                🔗 <span className="text-[#FFB38A]">{currentItem.similarTo}</span>와 유사
              </span>
            )}

            {currentItem?.badge && (
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mt-4 mb-1"
                style={{
                  backgroundColor: isCycleMode ? cycleMeta!.bg : meta.bg,
                  color: isCycleMode ? cycleMeta!.color : meta.color,
                }}
              >
                {stripEnglishParens(currentItem.badge)}
              </span>
            )}

            {/* 단어 표시 영역 — 화살표를 콘텐츠와 같은 행에 배치(겹침 방지) */}
            <div className="flex items-center justify-center gap-1 px-2 py-6">

              {/* ← 이전 */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0 && (isCycleMode || stage === startStage)}
                aria-label="이전"
                className="group flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
              >
                <span className="w-10 h-10 rounded-full bg-white border-2 border-[#F0E8E0] flex items-center justify-center text-xl font-bold text-[#8B7E74] group-enabled:group-hover:bg-[#FFF5EE] group-enabled:group-hover:border-[#FFB38A] group-enabled:group-hover:text-[#FFB38A] transition-colors shadow-sm">
                  ←
                </span>
              </button>

              {/* 단어 / 문장 콘텐츠 */}
              <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden">
              {(() => {
                const text = currentItem?.text ?? "";
                const childPron = currentItem?.childPron ?? "";
                const maxLen = Math.max(text.length, childPron.length);
                const compareLeft  = maxLen <= 2 ? "2.75rem" : maxLen === 3 ? "2.25rem" : maxLen === 4 ? "1.875rem" : "1.5rem";
                const compareRight = maxLen <= 2 ? "3.5rem"  : maxLen === 3 ? "2.75rem" : maxLen === 4 ? "2.25rem" : "1.875rem";
                const singleSize = text.length <= 2 ? "4rem" : text.length === 3 ? "3.25rem" : text.length === 4 ? "2.5rem" : "2rem";

                if (currentItem?.childPron && currentItem?.kind !== "sentence") {
                  return (
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center min-w-0">
                        <p className="text-[10px] text-[#8B7E74] mb-0.5">아이 발음</p>
                        <p className="font-bold text-[#FCA5A5] whitespace-nowrap" style={{ fontSize: compareLeft }}>
                          {childPron}
                        </p>
                      </div>
                      <span className="text-2xl text-[#C4B5A8] flex-shrink-0">→</span>
                      <div className="text-center min-w-0">
                        <p className="text-[10px] text-[#8B7E74] mb-0.5">옳은 표현</p>
                        <p className="font-black text-[#3D3530] whitespace-nowrap" style={{ fontSize: compareRight }}>
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
                      <WordImage word={text} imageSlug={slug} size="2xl" />
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
              </div>

              {/* → 다음 */}
              <button
                onClick={handleNext}
                aria-label="다음"
                className="group flex-shrink-0 transition-all active:scale-90"
              >
                <span className="w-10 h-10 rounded-full bg-white border-2 border-[#F0E8E0] flex items-center justify-center text-xl font-bold text-[#8B7E74] group-hover:bg-[#FFF5EE] group-hover:border-[#FFB38A] group-hover:text-[#FFB38A] transition-colors shadow-sm">
                  →
                </span>
              </button>
            </div>

            {/* 훈련 팁 */}
            {currentItem?.trainingTip && !stage3Loading && currentItem?.kind !== "sentence" && (
              <p className="text-xs text-[#C4B5A8] px-6 pb-5 leading-relaxed">
                💡 {currentItem.trainingTip}
              </p>
            )}
          </div>
          </div>{/* /카드 래퍼 */}

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
              {!currentItem?.scheduleId && currentItem?.kind !== "sentence" && !savedWords.has(currentItem?.text ?? "") && (
                <p className="text-xs mt-1 opacity-70" style={{ color: masteryInfo.color }}>
                  🔖 저장 버튼을 누르면 단어장에 보관돼요
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

          {/* 평가 버튼 2개 */}
          {!isSlotsFull && !stage3Loading && (
            <div className="flex gap-3 w-full mt-1">
              <button
                onClick={() => {
                  fillDot("bad");
                  if (currentItem?.text && filledCount < MAX_DOTS - 1) {
                    playWord(currentItem.text).catch(() => {});
                  }
                }}
                className="flex-1 py-4 rounded-2xl font-black text-sm whitespace-nowrap transition-all active:scale-95"
                style={{ backgroundColor: "#FDF2F8", border: "2px solid #F9A8D4", color: "#EC4899" }}
              >
                아직 어려워요 🔄
              </button>
              <button
                onClick={() => {
                  fillDot("good");
                  if (currentItem?.text && filledCount < MAX_DOTS - 1) {
                    playWord(currentItem.text).catch(() => {});
                  }
                }}
                className="flex-1 py-4 rounded-2xl font-black text-sm whitespace-nowrap transition-all active:scale-95"
                style={{ backgroundColor: "#F0FAF8", border: "2px solid #7EDFD0", color: "#0D9488" }}
              >
                잘 됐어요 ✓
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
