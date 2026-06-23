"use client";

import { useEffect } from "react";
import Image from "next/image";
import { WORD_IMAGE_SLUGS } from "@/lib/word-images";

interface PrintData {
  childName: string;
  targetWord: string;
  childPronunciation: string;
  errorPattern: string;
  errorCategory: string;
  createdAt: string;
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

const STEP_ICONS = ["👄", "👂", "🗣️", "🌏"];
const STEP_LABELS = [
  "1단계: 조음 감각 깨우기",
  "2단계: 소리 느끼기",
  "3단계: 음절/단어로 연결하기",
  "4단계: 문장과 일상에서 적용",
];

export function PrintClient({ data }: { data: PrintData }) {
  useEffect(() => {
    // 약간의 딜레이 후 인쇄 대화상자 열기 (이미지 로딩 대기)
    const t = setTimeout(() => window.print(), 800);
    return () => clearTimeout(t);
  }, []);

  let recWords: string[] = [];
  try {
    recWords = data.geminiFeedback?.recommendedWords
      ? JSON.parse(data.geminiFeedback.recommendedWords)
      : [];
  } catch {}

  // 이미지 있는 단어만, 최대 10개
  const wordCards = recWords.filter((w) => WORD_IMAGE_SLUGS[w]).slice(0, 10);

  const steps = data.geminiFeedback
    ? [
        data.geminiFeedback.trainingStep1,
        data.geminiFeedback.trainingStep2,
        data.geminiFeedback.trainingStep3,
        data.geminiFeedback.trainingStep4,
      ]
    : [];

  const dateStr = new Date(data.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
        @media print {
          html, body { margin: 0; padding: 0; background: white !important; }
          .no-print { display: none !important; }
          .print-page { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      {/* 인쇄 전 미리보기 안내 (화면에만 표시) */}
      <div className="no-print fixed top-0 left-0 right-0 bg-[#3D3530] text-white text-center text-sm py-2 z-50 flex items-center justify-center gap-4">
        <span>📄 인쇄 대화상자가 열립니다. PDF로 저장하려면 대화상자에서 &apos;PDF로 저장&apos;을 선택하세요.</span>
        <button
          onClick={() => window.print()}
          className="px-3 py-1 bg-white text-[#3D3530] rounded-full text-xs font-bold hover:bg-[#FFF5EE] transition-colors"
        >
          지금 인쇄
        </button>
        <button
          onClick={() => window.close()}
          className="px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
        >
          닫기
        </button>
      </div>

      {/* A4 페이지 */}
      <div
        className="print-page bg-white mx-auto mt-10 mb-6"
        style={{ width: "210mm", minHeight: "297mm", padding: "0", fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}
      >
        {/* 헤더 */}
        <div style={{ background: "linear-gradient(135deg, #FFE4D4 0%, #D4F0EA 100%)", padding: "18px 24px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#8B7E74", marginBottom: "2px", letterSpacing: "0.05em" }}>
                바른발음 AI 발음 훈련지
              </div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "#3D3530" }}>
                {data.childName}의 발음 훈련 계획
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "11px", color: "#8B7E74" }}>
              <div>분석일: {dateStr}</div>
              <div style={{ marginTop: "4px" }}>바른발음 앱</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* 발음 분석 섹션 */}
          <section>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#8B7E74", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "4px", height: "16px", background: "#FFB38A", borderRadius: "2px", display: "inline-block" }} />
              📊 발음 분석 결과
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div style={{ background: "#FFF5EE", borderRadius: "12px", padding: "12px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#8B7E74", marginBottom: "4px" }}>목표 단어</div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#3D3530" }}>{data.targetWord}</div>
              </div>
              <div style={{ background: "#FEF2F2", borderRadius: "12px", padding: "12px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#8B7E74", marginBottom: "4px" }}>아이 발음</div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#EF4444" }}>{data.childPronunciation}</div>
              </div>
              <div style={{ background: "#EDE9FE", borderRadius: "12px", padding: "12px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#8B7E74", marginBottom: "4px" }}>오류 패턴</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#6D28D9" }}>{data.errorPattern}</div>
                <div style={{ fontSize: "10px", color: "#8B7E74", marginTop: "2px" }}>{data.errorCategory}</div>
              </div>
            </div>
            {data.geminiFeedback?.rootCause && (
              <div style={{ marginTop: "10px", background: "#F8FAFF", borderRadius: "12px", padding: "12px 16px", borderLeft: "3px solid #A8D8CF" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#8B7E74", marginBottom: "4px" }}>원인 분석</div>
                <div style={{ fontSize: "11px", color: "#3D3530", lineHeight: 1.6 }}>{data.geminiFeedback.rootCause}</div>
              </div>
            )}
          </section>

          {/* 4단계 훈련법 */}
          {steps.length > 0 && (
            <section>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#8B7E74", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "4px", height: "16px", background: "#A8D8CF", borderRadius: "2px", display: "inline-block" }} />
                📋 4단계 훈련법
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {steps.map((step, i) => (
                  <div
                    key={i}
                    style={{ background: "#FAFAF8", borderRadius: "12px", padding: "12px 14px", border: "1px solid #F0E8E0" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px" }}>{STEP_ICONS[i]}</span>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#6D8FAD" }}>{STEP_LABELS[i]}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#3D3530", lineHeight: 1.65 }}>{step}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 연관 단어 카드 */}
          {wordCards.length > 0 && (
            <section>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#8B7E74", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "4px", height: "16px", background: "#C4B5EE", borderRadius: "2px", display: "inline-block" }} />
                🎴 함께 연습할 단어 카드
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                {wordCards.map((word) => {
                  const slug = WORD_IMAGE_SLUGS[word];
                  return (
                    <div
                      key={word}
                      style={{
                        background: "#FAFAF8",
                        borderRadius: "12px",
                        border: "1.5px solid #F0E8E0",
                        padding: "8px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {slug ? (
                        <div style={{ width: "64px", height: "64px", position: "relative" }}>
                          <Image
                            src={`/images/words/${slug}.webp`}
                            alt={word}
                            fill
                            sizes="64px"
                            style={{ objectFit: "contain", borderRadius: "8px" }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: "64px", height: "64px", background: "#F0E8E0", borderRadius: "8px",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                        }}>
                          🔤
                        </div>
                      )}
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#3D3530" }}>{word}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 부모님께 한 마디 */}
          {data.geminiFeedback?.parentMessage && (
            <section>
              <div style={{
                background: "linear-gradient(135deg, #FFF5EE 0%, #F0FAF8 100%)",
                borderRadius: "12px",
                padding: "14px 16px",
                border: "1px dashed #FFB38A",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#FFB38A", marginBottom: "6px" }}>
                  💌 부모님께 드리는 한 마디
                </div>
                <div style={{ fontSize: "11px", color: "#3D3530", lineHeight: 1.7 }}>
                  {data.geminiFeedback.parentMessage}
                </div>
              </div>
            </section>
          )}

        </div>

        {/* 푸터 */}
        <div style={{ borderTop: "1px solid #F0E8E0", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "#C4B5A8" }}>바른발음 — AI 아동 조음 홈케어</span>
          <span style={{ fontSize: "10px", color: "#C4B5A8" }}>© 2026 바른발음</span>
        </div>
      </div>
    </>
  );
}
