"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { validateKoreanWord } from "@/lib/korean-input-validation";
import { stripEnglishParens } from "@/lib/strip-english";
import { ArticulationDiagram } from "@/components/ui/ArticulationDiagram";
import { getArticulationSlug, phonemeFromPattern } from "@/lib/articulation-mapper";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface LocalResult {
  errorRecordId: string;
  errorCategory: string;
  errorPattern: string;
  localAnalysis: {
    detectedPattern: string;
    confidence: number;
    requiresGemini: boolean;
    parentHint?: string;
    description?: string;
  };
}

interface GeminiResult {
  rootCause: string;
  trainingSteps: string[];
  recommendedWords: string[];
  parentMessage?: string;
  patternName?: string;
}

// 누적 표시용 과거 기록 타입
interface PastRecord {
  id: string;
  targetWord: string;
  childPronunciation: string;
  errorPattern: string;
  errorCategory: string;
  createdAt: Date | string;
  /** 혀 모양 단면도용 목표 음소 (서버에서 추출, 없으면 null) */
  phoneme?: string | null;
  localAnalysis: { confidence: number } | null;
  geminiFeedback: {
    rootCause: string;
    trainingStep1: string;
    trainingStep2: string;
    trainingStep3: string;
    trainingStep4: string;
    recommendedWords: string;
    parentMessage: string;
  } | null;
}

interface Props {
  childId: string;
  childName: string;
  pastRecords: PastRecord[];
  isGuest?: boolean;
  /** 게스트 전용: 이번 달 남은 무료 AI 분석 횟수 */
  guestRemaining?: number;
  /** 게스트 전용: 월간 무료 한도 */
  guestLimit?: number;
  /** 회원 전용: 프리미엄 체험 남은 일수 (체험 중일 때만 전달) */
  trialDaysLeft?: number;
}

// ─── 카테고리 색상 매핑 ────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { bg: string; text: string }> = {
  대치:     { bg: "bg-[#FFF5EE]", text: "text-[#FFB38A]" },
  동화:     { bg: "bg-[#F5F3FF]", text: "text-[#C4B5FD]" },
  탈락:     { bg: "bg-[#FFF8DC]", text: "text-[#D97706]" },
  첨가:     { bg: "bg-[#F0FAF8]", text: "text-[#7EDFD0]" },
  미판정:   { bg: "bg-[#F5F5F5]", text: "text-[#8B7E74]" },
  개별습관: { bg: "bg-[#F0FDF4]", text: "text-[#4ADE80]" },
};
const DEFAULT_STYLE = { bg: "bg-[#F5F5F5]", text: "text-[#8B7E74]" };

const STEP_LABELS = [
  { label: "조음 감각", color: "bg-[#FFB38A]", textColor: "text-[#FFB38A]" },
  { label: "소리 느끼기", color: "bg-[#C4B5FD]", textColor: "text-[#C4B5FD]" },
  { label: "연결하기", color: "bg-[#7EDFD0]", textColor: "text-[#7EDFD0]" },
  { label: "일상 적용", color: "bg-[#FDE68A]", textColor: "text-[#D97706]" },
];

function parsePartialJson(jsonString: string): any {
  let str = jsonString.trim();
  str = str.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  if (str.endsWith("}")) {
    try {
      const parsed = JSON.parse(str);
      if (parsed.trainingStep1 !== undefined && !parsed.trainingSteps) {
        parsed.trainingSteps = [
          parsed.trainingStep1 || "",
          parsed.trainingStep2 || "",
          parsed.trainingStep3 || "",
          parsed.trainingStep4 || ""
        ];
      }
      if (!parsed.recommendedWords) parsed.recommendedWords = [];
      return parsed;
    } catch {}
  }
  const extractString = (key: string) => {
    const match = str.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*)`));
    return match ? match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : "";
  };
  let words: string[] = [];
  const openArr = str.match(/"recommendedWords"\s*:\s*\[([ \s\S]*)/);
  if (openArr && openArr[1]) {
    const wMatches = [...openArr[1].matchAll(/"([^"]*)/g)];
    words = wMatches.map((m) => m[1]);
  }
  return {
    patternName: extractString("patternName"),
    rootCause: extractString("rootCause"),
    trainingSteps: [
      extractString("trainingStep1"),
      extractString("trainingStep2"),
      extractString("trainingStep3"),
      extractString("trainingStep4"),
    ],
    recommendedWords: words,
    parentMessage: extractString("parentMessage"),
  };
}

// ─── 누적 기록 행 컴포넌트 (단일 카드 내 행으로 표시) ─────────────────────────

function RecordRow({
  record,
  onDelete,
  isLast,
}: {
  record: PastRecord;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const categoryStyle = CATEGORY_STYLE[record.errorCategory] ?? DEFAULT_STYLE;
  const gemini = record.geminiFeedback;
  const steps = gemini
    ? [gemini.trainingStep1, gemini.trainingStep2, gemini.trainingStep3, gemini.trainingStep4]
    : [];
  let recWords: string[] = [];
  try {
    recWords = gemini?.recommendedWords ? JSON.parse(gemini.recommendedWords) : [];
  } catch {}

  return (
    <div className={!isLast ? "border-b border-[#F5F0EB]" : ""}>
      {/* 요약 행 */}
      <div
        className="flex items-center gap-2 py-3 px-1 cursor-pointer hover:bg-[#FAFAF8] rounded-xl transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* 단어 비교 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-base font-black text-[#3D3530] truncate">{record.targetWord}</span>
          <span className="text-[#C4B5A8] text-xs flex-shrink-0">→</span>
          <span className="text-base font-bold text-[#FCA5A5] truncate">{record.childPronunciation}</span>
        </div>

        {/* AI 완료 여부 */}
        <span className="text-xs flex-shrink-0">{gemini ? "✅" : "⏳"}</span>

        {/* 삭제 버튼 */}
        <button
          onClick={(e) => onDelete(record.id, e)}
          className="text-[#D9CFC9] hover:text-[#EF4444] transition-colors p-1 flex-shrink-0"
          title="삭제하기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>

        {/* 펼치기 화살표 */}
        <span className={`text-[#C4B5A8] text-xs flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▾</span>
      </div>

      {/* 펼친 상세 내용 */}
      {expanded && (
        <div className="mx-1 mb-3 rounded-2xl bg-[#FAFAF8] px-4 py-3 space-y-3">
          {gemini ? (
            <>
              <div>
                <p className="text-[11px] font-bold text-[#8B7E74] mb-1">💡 왜 이런 발음이 나올까요?</p>
                <p className="text-xs text-[#5B4E9B] leading-relaxed">{gemini.rootCause}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#8B7E74] mb-2">📚 선생님의 처방전</p>
                {(() => {
                  const ph = record.phoneme ?? phonemeFromPattern(record.errorPattern);
                  return ph && getArticulationSlug(ph) ? (
                    <div className="flex justify-center py-2">
                      <ArticulationDiagram phoneme={ph} size="sm" />
                    </div>
                  ) : null;
                })()}
                <div className="space-y-1.5">
                  {steps.filter(Boolean).map((step, i) => {
                    const meta = STEP_LABELS[i] ?? STEP_LABELS[0];
                    return (
                      <div key={i} className="flex gap-2">
                        <span className={`w-4 h-4 rounded-full ${meta.color} text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          {i + 1}
                        </span>
                        <p className="text-xs text-[#3D3530] leading-relaxed">{step}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {recWords.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#8B7E74] mb-2">🌟 유사 패턴 연습 단어</p>
                  <div className="flex flex-wrap gap-1.5">
                    {recWords.map((word, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-white rounded-full text-[11px] font-bold text-[#3D3530] border border-[#7EDFD0]/40">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-[#8B7E74]">⏳ AI 처방전이 저장되지 않았어요. 위 입력창에 같은 단어를 다시 입력하면 분석됩니다.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 현재 분석 결과 카드 ──────────────────────────────────────────────────────

function CurrentAnalysisCard({
  targetWord,
  childPronunciation,
  childName,
  localResult,
  geminiLoading,
  geminiResult,
  geminiError,
  fromGlobalCache,
  isGuest,
}: {
  targetWord: string;
  childPronunciation: string;
  childName: string;
  localResult: LocalResult;
  geminiLoading: boolean;
  geminiResult: GeminiResult | null;
  geminiError: string;
  fromGlobalCache: boolean;
  isGuest?: boolean;
}) {
  const categoryStyle = CATEGORY_STYLE[localResult.errorCategory] ?? DEFAULT_STYLE;

  return (
    <div className="space-y-4">
      {/* 오류 유형 카드 */}
      <BubbleCard className={`${categoryStyle.bg} border-2 border-[#F0E8E0]`}>
        <div className="flex items-center gap-3 mb-3">
          <div>
            <p className="text-xs font-semibold text-[#8B7E74]">오류 유형</p>
            <p className="text-xl font-black text-[#3D3530]">
              {(geminiResult as any)?.patternName ? (
                stripEnglishParens((geminiResult as any).patternName)
              ) : (
                <>
                  {stripEnglishParens(localResult.errorPattern)}
                  {geminiLoading && <span className="text-sm font-semibold text-[#8B7E74] ml-2 animate-pulse">(상세 분석중...)</span>}
                </>
              )}
            </p>
          </div>
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full bg-white/70 ${categoryStyle.text}`}>
            {localResult.errorCategory}
          </span>
        </div>

        {/* 단어 비교 */}
        <div className="flex items-center gap-3 bg-white/50 rounded-2xl px-4 py-3 mb-3">
          <div className="text-center">
            <p className="text-xs text-[#8B7E74]">목표</p>
            <p className="text-xl font-black text-[#3D3530]">{targetWord}</p>
          </div>
          <span className="text-2xl flex-1 text-center">→</span>
          <div className="text-center">
            <p className="text-xs text-[#8B7E74]">{childName} 발음</p>
            <p className="text-xl font-black text-[#FCA5A5]">{childPronunciation}</p>
          </div>
        </div>

      </BubbleCard>

      {/* 글로벌 캐시 HIT 배지 */}
      {fromGlobalCache && geminiResult?.rootCause && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs bg-[#E8F8F5] text-[#2ECC71] font-semibold px-2.5 py-1 rounded-full">
            ⚡ 저장된 분석 결과
          </span>
        </div>
      )}

      {/* Gemini 로딩 스켈레톤 - 어떤 필드도 아직 안 왔을 때만 */}
      {geminiLoading && !geminiResult?.rootCause && (geminiResult?.trainingSteps.length ?? 0) === 0 && (
        <BubbleCard color="lavender" className="py-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl animate-spin">🤖</div>
            <div>
              <p className="font-bold text-[#3D3530] text-sm">AI 선생님이 처방전을 작성 중이에요</p>
              <p className="text-xs text-[#8B7E74]">원인 분석부터 순서대로 보여드릴게요...</p>
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-[#E0D9F5] animate-pulse flex-shrink-0" />
                <div className="flex-1 h-4 bg-[#E0D9F5] rounded-full animate-pulse" style={{ width: `${70 + i * 5}%` }} />
              </div>
            ))}
          </div>
        </BubbleCard>
      )}

      {/* Gemini 에러 */}
      {geminiError && !geminiLoading && (
        <BubbleCard color="peach">
          <p className="text-sm text-[#EF4444] whitespace-pre-line">⚠️ {geminiError}</p>
        </BubbleCard>
      )}

      {/* 원인 카드 - rootCause가 있을 때 */}
      {geminiResult?.rootCause && (
        <BubbleCard color="lavender">
          <p className="text-sm font-bold text-[#3D3530] mb-2">💡 왜 이런 발음이 나올까요?</p>
          <p className="text-sm text-[#5B4E9B] leading-relaxed">{geminiResult.rootCause}</p>
        </BubbleCard>
      )}

      {/* 4단계 훈련법 - 단계가 1개 이상 도착했거나 원인이 끝났고 다음을 기다리는 중일 때 */}
      {geminiResult && (geminiResult.trainingSteps.length > 0 || (geminiResult.rootCause && geminiLoading)) && (
        <BubbleCard>
          <p className="text-sm font-bold text-[#3D3530] mb-3">📚 선생님의 처방전</p>
          {(() => {
            const ph = phonemeFromPattern(localResult.errorPattern);
            return ph && getArticulationSlug(ph) ? (
              <div className="flex justify-center mb-4">
                <ArticulationDiagram phoneme={ph} size="md" />
              </div>
            ) : null;
          })()}
          <div className="space-y-4">
            {geminiResult.trainingSteps.map((step, i) => {
              const meta = STEP_LABELS[i] ?? STEP_LABELS[0];
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span className={`w-7 h-7 rounded-full ${meta.color} text-white text-xs font-black flex items-center justify-center`}>
                      {i + 1}
                    </span>
                    {i < 3 && <div className="w-0.5 h-4 bg-[#F0E8E0]" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <span className={`text-xs font-bold ${meta.textColor} mb-1 block`}>{meta.label}</span>
                    <p className="text-sm text-[#3D3530] leading-relaxed whitespace-pre-line">{step.replace(/^【[^】]*】\s*/, "")}</p>
                  </div>
                </div>
              );
            })}
            {/* 다음 단계 기다리는 중: 타이핑 커서 */}
            {geminiLoading && geminiResult.trainingSteps.length < 4 && (
              <div className="flex gap-3 items-center pl-10">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B5A6E3] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B5A6E3] animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B5A6E3] animate-bounce [animation-delay:0.3s]" />
                </div>
                <span className="text-xs text-[#8B7E74]">다음 단계 작성 중...</span>
              </div>
            )}
          </div>
        </BubbleCard>
      )}

      {/* 추천 단어 */}
      {geminiResult && geminiResult.recommendedWords.length > 0 && (
        <BubbleCard color="mint">
          <p className="text-sm font-bold text-[#3D3530] mb-1">🌟 유사 패턴 연습 단어</p>
          <p className="text-xs text-[#8B7E74] mb-3">이 발음도 비슷하게 틀릴 수 있어요 — 함께 연습해보세요!</p>
          <div className="flex flex-wrap gap-2">
            {geminiResult.recommendedWords.map((word, i) => (
              <span key={i} className="px-4 py-2 bg-white/70 rounded-full text-sm font-bold text-[#3D3530] border border-[#7EDFD0]/40">
                {word}
              </span>
            ))}
          </div>
        </BubbleCard>
      )}

      {/* 아이와 연습하기 버튼 — 게스트는 가입 유도 CTA로 대체 */}
      {isGuest ? (
        <BubbleCard className="border-2 border-dashed border-[#FFB38A]/50 bg-[#FFF9F4]">
          <p className="text-sm font-bold text-[#3D3530] mb-1">💾 이 분석은 저장되지 않아요</p>
          <p className="text-xs text-[#8B7E74] mb-3 leading-relaxed">
            회원가입하면 분석 기록이 차곡차곡 쌓이고, 단계별 연습·복습·종합 리포트까지 모두 이용할 수 있어요.
          </p>
          <Link href="/signup">
            <BubbleButton variant="peach" size="lg" className="w-full">
              회원가입하고 기록 저장하기 →
            </BubbleButton>
          </Link>
        </BubbleCard>
      ) : (
        <BubbleButton
          variant="peach"
          size="lg"
          onClick={() => {
            window.location.href = `/dashboard/practice?errorRecordId=${localResult.errorRecordId}`;
          }}
          className="w-full"
        >
          🎮 바로 연습 시작하기 →
        </BubbleButton>
      )}
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function AnswerNoteClient({ childId, childName, pastRecords, isGuest, guestRemaining, guestLimit, trialDaysLeft }: Props) {
  // 누적 기록 상태 (새 분석 완료 시 맨 앞에 추가)
  const [records, setRecords] = useState<PastRecord[]>(pastRecords);

  // 게스트 남은 무료 분석 횟수 (성공 시 클라이언트에서 감소 — 서버가 최종 권위)
  const [remaining, setRemaining] = useState<number | undefined>(guestRemaining);

  const [targetWord, setTargetWord] = useState("");
  const [childPronunciation, setChildPronunciation] = useState("");

  // 로컬 분석 상태
  const [localLoading, setLocalLoading] = useState(false);
  const [localResult, setLocalResult] = useState<LocalResult | null>(null);
  const [currentTargetWord, setCurrentTargetWord] = useState("");
  const [currentPronunciation, setCurrentPronunciation] = useState("");

  // Gemini 분석 상태
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiResult, setGeminiResult] = useState<GeminiResult | null>(null);
  const [geminiError, setGeminiError] = useState("");
  const [fromGlobalCache, setFromGlobalCache] = useState(false);

  const [error, setError] = useState("");
  const [targetWordError, setTargetWordError] = useState("");
  const [pronunciationError, setPronunciationError] = useState("");

  // 삭제 관련 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(false);
  const [tempSkipCheck, setTempSkipCheck] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sori_skip_delete_confirm");
    if (saved === "true") setSkipDeleteConfirm(true);
  }, []);

  // 아이 변경 시 props로 받은 새 pastRecords로 state 동기화 + 진행중 분석 초기화
  useEffect(() => {
    setRecords(pastRecords);
    setLocalResult(null);
    setGeminiResult(null);
    setGeminiError("");
    setError("");
    setFromGlobalCache(false);
  }, [childId, pastRecords]);

  async function handleAnalyze() {
    const targetErr = validateKoreanWord(targetWord);
    const pronunciationErr = validateKoreanWord(childPronunciation);

    setTargetWordError(targetErr ?? "");
    setPronunciationError(pronunciationErr ?? "");
    setError("");

    if (targetErr || pronunciationErr) return;

    if (targetWord.trim() === childPronunciation.trim()) {
      setError("목표 단어와 아이 발음이 같아요. 오류가 있는 발음을 입력해주세요!");
      return;
    }
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

    setError("");
    setLocalLoading(true);
    setLocalResult(null);
    setGeminiResult(null);
    setGeminiError("");
    setFromGlobalCache(false);

    // 현재 분석 단어 저장 (결과 카드에서 참조용)
    const tw = targetWord.trim();
    const cp = childPronunciation.trim();
    setCurrentTargetWord(tw);
    setCurrentPronunciation(cp);

    try {
      // ── 1단계: 로컬 분석 ──────────────────────────────────────────────────
      const res = await fetch("/api/error-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, targetWord: tw, childPronunciation: cp }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        // 완전히 다른 단어 입력 — 친절한 안내
        if (err?.tooDifferent) {
          setError(`${err.error}\n${err.hint ?? ""}`.trim());
          setLocalLoading(false);
          return;
        }
        throw new Error(err?.error || "분석 중 오류가 발생했습니다");
      }

      const local: LocalResult = await res.json();
      setLocalResult(local);
      setLocalLoading(false);

      // ── 회원은 errorRecordId 필요. 게스트는 단어쌍을 직접 전달(저장 안 함) ──────
      if (!isGuest && !local.errorRecordId) {
        setGeminiLoading(false);
        return;
      }

      // ── 2단계: Gemini 처방전 ──────────────────────────────────────────────
      setGeminiLoading(true);
      const geminiBody = isGuest
        ? {
            targetWord: tw,
            childPronunciation: cp,
            errorType: local.localAnalysis.detectedPattern,
            errorCategory: local.errorCategory,
            errorPattern: local.errorPattern,
          }
        : { errorRecordId: local.errorRecordId };
      const geminiRes = await fetch("/api/gemini-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      if (!geminiRes.ok) {
        const err = await geminiRes.json().catch(() => null);
        if (err?.isMonthlyLimitReached && err?.isGuest) {
          setRemaining(0);
          setGeminiError(`이번 달 비회원 AI 분석 횟수(${err.limit ?? guestLimit ?? 5}회)를 모두 사용했어요.\n회원가입하면 매달 10회 무료로 이용할 수 있고, 분석 기록도 쌓을 수 있어요!`);
        } else if (err?.isDailyLimitReached) {
          setGeminiError(`프리미엄 체험 중에는 하루 ${err.limit ?? 30}회까지 분석할 수 있어요.\n내일 다시 이용해 주세요!`);
        } else if (err?.isMonthlyLimitReached) {
          setGeminiError("이번 달 AI 분석 횟수(10회)를 모두 사용했어요.\n다음 달 1일에 자동 초기화돼요.\n프리미엄으로 업그레이드하면 무제한으로 이용할 수 있어요!");
        } else if (err?.isQuotaError) {
          setGeminiError("⏳ AI 서버 일일 사용량이 가득 찼어요.\n내일 오전에 자동으로 초기화돼요.\n발음 오류 유형은 이미 분석됐으니 바로 연습을 시작할 수 있어요!");
        } else if (err?.isServiceBusy || geminiRes.status === 503) {
          setGeminiError("🕐 AI 서버가 잠시 바빠요. '분석하기'를 다시 눌러주세요.");
        } else if (geminiRes.status === 429) {
          setGeminiError(err?.error || "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.");
        } else {
          setGeminiError(err?.error || "AI 처방전을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        }
        setGeminiLoading(false);
        return;
      }

      const contentType = geminiRes.headers.get("Content-Type") ?? "";
      // JSON 응답 = 글로벌 캐시 HIT(게스트 할당량 미차감), 스트림 = 신규 Gemini 호출(차감)
      const servedFromCache = contentType.includes("application/json");
      const stepBuffer: (string | undefined)[] = [undefined, undefined, undefined, undefined];
      let acc: GeminiResult = {
        rootCause: "",
        trainingSteps: [],
        recommendedWords: [],
      };
      let streamError: { message: string; quota: boolean; serviceBusy: boolean } | null = null;

      // ── 캐시 HIT: JSON 즉시 반환 ────────────────────────────────────────
      if (contentType.includes("application/json")) {
        const raw = await geminiRes.json();
        acc = {
          patternName:      raw.patternName,
          rootCause:        raw.rootCause ?? "",
          trainingSteps:    [raw.trainingStep1, raw.trainingStep2, raw.trainingStep3, raw.trainingStep4].filter(Boolean),
          recommendedWords: Array.isArray(raw.recommendedWords) ? raw.recommendedWords : [],
          parentMessage:    raw.parentMessage,
        };
        setGeminiResult(acc);
        setGeminiLoading(false);
        if (raw.fromGlobalCache) setFromGlobalCache(true);
      }
      // ── 캐시 MISS: NDJSON 스트림 파싱 ───────────────────────────────────
      else if (geminiRes.body) {
        const reader = geminiRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let firstFieldArrived = false;

        const commitStepBuffer = () => {
          acc = { ...acc, trainingSteps: stepBuffer.filter((s): s is string => !!s) };
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // 줄 단위로 분리, 마지막 줄은 아직 미완성일 수 있으므로 버퍼에 남겨둠
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            let msg: any;
            try { msg = JSON.parse(line); } catch { continue; }

            if (msg.type === "error") {
              streamError = {
                message: msg.error ?? "AI 분석 중 오류가 발생했습니다",
                quota: !!msg.isQuotaError,
                serviceBusy: !!msg.isServiceBusy,
              };
              continue;
            }

            if (msg.type === "field") {
              if (!firstFieldArrived) {
                firstFieldArrived = true;
                setGeminiLoading(false);
              }
              if (msg.field === "rootCause") {
                acc = { ...acc, rootCause: msg.value };
              } else if (msg.field === "patternName") {
                acc = { ...acc, patternName: msg.value };
              } else if (msg.field === "parentMessage") {
                acc = { ...acc, parentMessage: msg.value };
              } else if (typeof msg.field === "string" && msg.field.startsWith("trainingStep")) {
                const idx = Number(msg.field.slice("trainingStep".length)) - 1;
                if (idx >= 0 && idx < 4) {
                  stepBuffer[idx] = msg.value;
                  commitStepBuffer();
                }
              }
              setGeminiResult({ ...acc });
            } else if (msg.type === "array" && msg.field === "recommendedWords") {
              acc = { ...acc, recommendedWords: Array.isArray(msg.value) ? msg.value : [] };
              setGeminiResult({ ...acc });
            }
          }
        }
      }

      if (streamError) {
        if (streamError.quota) {
          setGeminiError("⏳ AI 서버 일일 사용량이 가득 찼어요.\n내일 오전에 자동으로 초기화돼요.\n발음 오류 유형은 이미 분석됐으니 바로 연습을 시작할 수 있어요!");
        } else if (streamError.serviceBusy) {
          setGeminiError("🕐 AI 서버가 잠시 바빠요. '분석하기'를 다시 눌러주세요.");
        } else {
          setGeminiError(streamError.message);
        }
        setGeminiLoading(false);
        return;
      }
      setGeminiLoading(false);
      const finalGemini: GeminiResult = acc;

      // ── 게스트: 저장·누적 안 함. 남은 횟수만 차감하고 현재 결과 카드로 보여줌 ──────
      if (isGuest) {
        // 캐시 HIT은 서버가 할당량을 차감하지 않으므로 카운터도 유지
        if (!servedFromCache) {
          setRemaining((r) => (typeof r === "number" ? Math.max(0, r - 1) : r));
        }
        setTargetWord("");
        setChildPronunciation("");
        return;
      }

      // ── 회원: 완료 후 누적 기록 맨 앞에 추가 ───────────────────────────────────
      const newRecord: PastRecord = {
        id: local.errorRecordId,
        targetWord: tw,
        childPronunciation: cp,
        errorPattern: local.errorPattern,
        errorCategory: local.errorCategory,
        createdAt: new Date().toISOString(),
        phoneme: phonemeFromPattern(local.errorPattern),
        localAnalysis: { confidence: local.localAnalysis.confidence },
        geminiFeedback: finalGemini ? {
          rootCause: finalGemini.rootCause ?? "",
          trainingStep1: finalGemini.trainingSteps?.[0] ?? "",
          trainingStep2: finalGemini.trainingSteps?.[1] ?? "",
          trainingStep3: finalGemini.trainingSteps?.[2] ?? "",
          trainingStep4: finalGemini.trainingSteps?.[3] ?? "",
          recommendedWords: JSON.stringify(finalGemini.recommendedWords ?? []),
          parentMessage: finalGemini.parentMessage ?? "",
        } : null,
      };
      setRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== local.errorRecordId)]);

      // 입력 폼 초기화
      setTargetWord("");
      setChildPronunciation("");

    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.");
      setLocalLoading(false);
    } finally {
      setGeminiLoading(false);
    }
  }

  // 삭제 요청 인입
  function handleDeleteClick(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (skipDeleteConfirm) {
      executeDelete(id);
    } else {
      setPendingDeleteId(id);
      setShowConfirmModal(true);
    }
  }

  // 모달 내 최종 확인
  async function handleModalConfirm() {
    if (!pendingDeleteId) return;
    
    // '다시 보지 않기' 체크했다면 설정 저장
    if (tempSkipCheck) {
      setSkipDeleteConfirm(true);
      localStorage.setItem("sori_skip_delete_confirm", "true");
    }

    await executeDelete(pendingDeleteId);
    setShowConfirmModal(false);
    setPendingDeleteId(null);
  }

  // 전체 초기화 요청
  async function handleResetAll() {
    if (!confirm("분석 기록을 전부 삭제할까요?\n복습 스케줄도 함께 삭제돼요.")) return;
    try {
      const res = await fetch("/api/error-analysis", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });
      if (res.ok) {
        setRecords([]);
        setLocalResult(null);
      } else {
        alert("초기화에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    }
  }

  // 실제 삭제 로직
  async function executeDelete(id: string) {
    try {
      const res = await fetch("/api/error-analysis", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorRecordId: id }),
      });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        if (localResult?.errorRecordId === id) setLocalResult(null);
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("네트워크 오류가 발생했습니다.");
    }
  }

  return (
    <div className="px-5 pt-6 pb-8 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5">

      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-black text-[#3D3530]">📝 발음 분석</h1>
        <p className="text-sm text-[#8B7E74] mt-1">
          {childName}의 발음을 입력하면 AI가 원인을 분석해드려요
        </p>
      </div>

      {/* 회원 체험 중: 프리미엄 체험 잔여일 배지 (가치 환기) */}
      {!isGuest && typeof trialDaysLeft === "number" && trialDaysLeft > 0 && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3 bg-[#F0FAF8] border border-[#7EDFD0]/50">
          <span className="text-2xl flex-shrink-0">🎁</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#3D3530]">
              프리미엄 체험 중 · <span className="text-[#0D9488]">{trialDaysLeft}일 남음</span>
            </p>
            <p className="text-xs text-[#8B7E74]">지금은 모든 기능을 무제한에 가깝게 쓸 수 있어요</p>
          </div>
          <Link href="/subscribe" className="flex-shrink-0">
            <span className="text-xs font-bold text-white bg-[#FFB38A] rounded-full px-3 py-1.5">계속 쓰기</span>
          </Link>
        </div>
      )}

      {/* 게스트: 남은 무료 AI 분석 횟수 배너 (손실 회피 — 가입 유도) */}
      {isGuest && typeof remaining === "number" && (
        <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${remaining > 0 ? "bg-[#F0FAF8] border border-[#7EDFD0]/50" : "bg-[#FFF5EE] border border-[#FFB38A]/50"}`}>
          <span className="text-2xl flex-shrink-0">{remaining > 0 ? "🎁" : "🔒"}</span>
          <div className="flex-1 min-w-0">
            {remaining > 0 ? (
              <p className="text-sm font-bold text-[#3D3530]">
                무료 AI 분석 <span className="text-[#0D9488]">{remaining}회</span> 남았어요
                <span className="font-normal text-[#8B7E74]"> · 회원가입하면 매달 10회</span>
              </p>
            ) : (
              <p className="text-sm font-bold text-[#3D3530]">
                이번 달 무료 분석을 다 썼어요 · <span className="text-[#FFB38A]">회원가입하면 매달 10회</span>
              </p>
            )}
          </div>
          <Link href="/signup" className="flex-shrink-0">
            <span className="text-xs font-bold text-white bg-[#FFB38A] rounded-full px-3 py-1.5">가입</span>
          </Link>
        </div>
      )}

      {/* 입력 폼 */}
      <BubbleCard>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-[#3D3530]">🎯 목표 발음</label>
              {(targetWord || childPronunciation) && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetWord("");
                    setChildPronunciation("");
                    setTargetWordError("");
                    setPronunciationError("");
                    setError("");
                  }}
                  className="text-[10px] font-bold text-[#C4B5A8] hover:text-[#FFB38A] flex items-center gap-1 transition-colors"
                >
                  <span className="text-xs">↺</span> 내용 지우기
                </button>
              )}
            </div>
            <input
              type="text"
              value={targetWord}
              onChange={(e) => { setTargetWord(e.target.value); setTargetWordError(""); }}
              placeholder="예) 사과"
              disabled={localLoading}
              className={`w-full px-4 py-3 rounded-2xl border-2 ${targetWordError ? "border-[#FCA5A5]" : "border-[#F0E8E0]"} text-[#3D3530] text-lg font-semibold placeholder:text-[#C4B5A8] focus:outline-none focus:border-[#FFB38A] transition-colors disabled:opacity-50`}
            />
            <p className="text-[10px] text-[#C4B5A8] mt-1 ml-1">단어나 짧은 어절을 입력하세요 (최대 5글자)</p>
            {targetWordError && (
              <p className="text-xs text-[#EF4444] mt-1.5 ml-1 flex items-start gap-1">
                <span className="flex-shrink-0">⚠️</span>
                <span>{targetWordError}</span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#3D3530] mb-2">🎤 {childName}의 발음</label>
            <input
              type="text"
              value={childPronunciation}
              onChange={(e) => { setChildPronunciation(e.target.value); setPronunciationError(""); }}
              placeholder="예) 따과"
              disabled={localLoading}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              className={`w-full px-4 py-3 rounded-2xl border-2 ${pronunciationError ? "border-[#FCA5A5]" : "border-[#F0E8E0]"} text-[#3D3530] text-lg font-semibold placeholder:text-[#C4B5A8] focus:outline-none focus:border-[#FFB38A] transition-colors disabled:opacity-50`}
            />
            {pronunciationError && (
              <p className="text-xs text-[#EF4444] mt-1.5 ml-1 flex items-start gap-1">
                <span className="flex-shrink-0">⚠️</span>
                <span>{pronunciationError}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl px-4 py-3">
              <p className="text-sm text-[#EF4444] font-semibold text-left whitespace-pre-line">🚨 {error}</p>
            </div>
          )}

          <BubbleButton
            variant="peach"
            size="lg"
            onClick={handleAnalyze}
            disabled={localLoading || !targetWord.trim() || !childPronunciation.trim()}
            className="w-full"
          >
            {localLoading ? "🔍 분석 중..." : "🔍 AI 분석하기"}
          </BubbleButton>
        </div>
      </BubbleCard>

      {/* 1단계 로딩 */}
      {localLoading && (
        <BubbleCard color="peach" className="text-center py-6">
          <div className="text-3xl animate-bounce mb-2">🔍</div>
          <p className="font-bold text-[#3D3530]">발음 오류 분석 중...</p>
          <p className="text-xs text-[#8B7E74] mt-1">금방 끝나요!</p>
        </BubbleCard>
      )}

      {/* 현재 분석 결과 */}
      {localResult && !localLoading && (
        <CurrentAnalysisCard
          targetWord={currentTargetWord}
          childPronunciation={currentPronunciation}
          childName={childName}
          localResult={localResult}
          geminiLoading={geminiLoading}
          geminiResult={geminiResult}
          geminiError={geminiError}
          fromGlobalCache={fromGlobalCache}
          isGuest={isGuest}
        />
      )}

      {/* ── 누적 분석 기록 ──────────────────────────────────────────────────── */}
      {records.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#3D3530]">📋 분석 기록</p>
            <span className="text-xs text-[#8B7E74] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
              총 {records.length}개
            </span>
            <Link
              href={`/dashboard/answer-note/comprehensive?childId=${childId}`}
              className="ml-auto text-xs font-semibold text-[#C4B5A8] hover:text-[#0D9488] transition-colors leading-none"
            >
              📊 종합 분석하기
            </Link>
            <button
              onClick={handleResetAll}
              className="text-xs font-semibold text-[#C4B5A8] hover:text-[#EF4444] transition-colors leading-none"
            >
              🗑 전체 초기화
            </button>
          </div>
          
          <BubbleCard padding="sm">
            {records.map((record, index) => {
              const curDateObj = new Date(record.createdAt);
              const curDateStr = `${curDateObj.getMonth() + 1}월 ${curDateObj.getDate()}일`;

              const prevDateObj = index > 0 ? new Date(records[index - 1].createdAt) : null;
              const prevDateStr = prevDateObj ? `${prevDateObj.getMonth() + 1}월 ${prevDateObj.getDate()}일` : null;

              const isNewDay = curDateStr !== prevDateStr;

              return (
                <div key={record.id}>
                  {isNewDay && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="h-[1px] flex-1 bg-[#F0E8E0]" />
                      <span className="text-[11px] font-black text-[#C4B5A8] tracking-wider">
                        {curDateStr}
                      </span>
                      <div className="h-[1px] flex-1 bg-[#F0E8E0]" />
                    </div>
                  )}
                  <RecordRow
                    record={record}
                    onDelete={handleDeleteClick}
                    isLast={index === records.length - 1}
                  />
                </div>
              );
            })}
          </BubbleCard>
        </div>
      )}

      {/* 기록 없는 경우 */}
      {records.length === 0 && !localResult && (
        <BubbleCard className="text-center py-8">
          <div className="text-4xl mb-3">📝</div>
          <p className="font-bold text-[#3D3530]">아직 분석 기록이 없어요</p>
          <p className="text-sm text-[#8B7E74] mt-2">위에서 목표 단어와 {childName}의 발음을 입력해보세요!</p>
        </BubbleCard>
      )}

      {/* 🛠️ 커스텀 삭제 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center mb-5">
              <div className="bg-[#FEF2F2] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🗑️</span>
              </div>
              <h3 className="text-lg font-black text-[#3D3530]">분석 기록 삭제</h3>
              <p className="text-sm text-[#8B7E74] mt-1">이 분석 기록을 정말 삭제할까요?</p>
            </div>

            <label className="flex items-center gap-2 mb-6 cursor-pointer group justify-center">
              <input 
                type="checkbox" 
                checked={tempSkipCheck}
                onChange={(e) => setTempSkipCheck(e.target.checked)}
                className="w-4 h-4 rounded border-[#F0E8E0] text-[#FFB38A] focus:ring-[#FFB38A]"
              />
              <span className="text-xs text-[#8B7E74] group-hover:text-[#3D3530]">다시는 이 메시지를 보지 않기</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowConfirmModal(false); setPendingDeleteId(null); }}
                className="flex-1 py-3 rounded-2xl bg-[#F0E8E0] text-[#8B7E74] font-bold text-sm hover:bg-[#E5DCD4] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleModalConfirm}
                className="flex-1 py-3 rounded-2xl bg-[#EF4444] text-white font-bold text-sm hover:bg-[#DC2626] shadow-md shadow-red-200 transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
