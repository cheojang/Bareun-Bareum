import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BubbleCard } from "@/components/ui/BubbleCard";
import { PastelBadge } from "@/components/ui/PastelBadge";
import { getSelectedChildId } from "@/lib/child-cookie";
import { AiAdvice } from "./AiAdvice";

// ─── 오류 유형 메타 (부모 친화) ────────────────────────────────────────────────
// 실제 언어재활에서 정의하는 오류 유형을 부모가 바로 이해할 수 있는 표현으로
const CATEGORY_META: Record<string, {
  label: string;
  parentLabel: string;   // 제목 표시용
  example: string;       // "예: 사과 → 다과"처럼 구체적 예시
  tip: string;           // 왜 생기는지 한 줄 설명
  barColor: string;
}> = {
  대치: {
    label: "다른 소리로 바꿔요",
    parentLabel: "소리 바꿈",
    example: "예: '사과'를 '다과'처럼 말해요",
    tip: "특정 소리를 아직 정확히 만들지 못해 비슷한 소리로 대신해요. 가장 흔한 발음 오류예요.",
    barColor: "#FFB38A",
  },
  탈락: {
    label: "소리를 빠뜨려요",
    parentLabel: "소리 생략",
    example: "예: '기린'을 '이린'처럼 말해요",
    tip: "발음하기 어려운 소리를 아예 빼고 말해요. 혀나 입술 조절이 아직 발달 중이에요.",
    barColor: "#FFB38A",
  },
  동화: {
    label: "주변 소리를 따라가요",
    parentLabel: "소리 퍼짐",
    example: "예: '밥먹어'를 '맘먹어'처럼 말해요",
    tip: "앞뒤 소리가 서로 영향을 주어 같은 소리가 반복돼요. 말의 흐름을 조절하는 과정이에요.",
    barColor: "#FFB38A",
  },
  첨가: {
    label: "없는 소리를 끼워요",
    parentLabel: "소리 추가",
    example: "예: '그림'을 '그으림'처럼 말해요",
    tip: "단어 사이에 없는 소리가 들어가요. 소리를 연결하는 방법을 아직 익히는 중이에요.",
    barColor: "#FFB38A",
  },
};

// ─── 심각도 메타 ────────────────────────────────────────────────────────────────
const LEVEL_META: Record<string, {
  label: string;
  sublabel: string;
  color: "pink" | "yellow" | "mint" | "lavender";
  bgColor: string;
  barColor: string;
}> = {
  집중교정필요: {
    label: "집중 연습 필요",
    sublabel: "오류율 30% 이상 — 전문 상담도 권장해요",
    color: "pink",
    bgColor: "#FAFAF8",
    barColor: "#FCA5A5",
  },
  꾸준한연습필요: {
    label: "꾸준한 연습 필요",
    sublabel: "오류율 20~30% — 매일 조금씩 연습하면 좋아져요",
    color: "yellow",
    bgColor: "#FAFAF8",
    barColor: "#FCD34D",
  },
  관찰중: {
    label: "발달 중",
    sublabel: "오류율 10~20% — 정상 발달 범위 내에서 지켜봐요",
    color: "mint",
    bgColor: "#FAFAF8",
    barColor: "#86EFAC",
  },
  정상범위: {
    label: "잘 하고 있어요",
    sublabel: "오류율 10% 미만 — 또래 수준에서 잘 내는 소리예요",
    color: "lavender",
    bgColor: "#FAFAF8",
    barColor: "#7EDFD0",
  },
};

// ─── 음소별 조음 방법 설명 (언어재활사 관점, 부모 친화) ───────────────────────
// 음소를 어떻게 만드는지 부모가 이해할 수 있게 설명 → '집중 훈련 처방전'에서 활용
const PHONEME_HOW: Record<string, string> = {
  "ㄱ": "혀 뒤쪽을 입천장에 붙였다 떼며 내는 소리예요",
  "ㄴ": "혀끝을 윗니 뒤에 댄 채 코로 내보내는 소리예요",
  "ㄷ": "혀끝을 윗니 뒤에 붙였다 떼며 내는 소리예요",
  "ㄹ": "혀끝을 입천장에 가볍게 한 번 튕겨 내는 소리예요 — 아이들이 가장 늦게 완성하는 소리 중 하나예요",
  "ㅁ": "두 입술을 모은 채 코로 내보내는 소리예요",
  "ㅂ": "두 입술을 모았다 힘 있게 터뜨려 내는 소리예요",
  "ㅅ": "혀끝과 윗잇몸 사이의 좁은 틈으로 바람을 새어 내는 소리예요",
  "ㅈ": "혀 앞쪽을 입천장에 붙였다 떼며 바람을 내보내는 소리예요",
  "ㅊ": "ㅈ와 같은 위치에서 더 강한 바람을 내보내는 소리예요",
  "ㅋ": "ㄱ와 같은 위치에서 더 강한 바람을 내보내는 소리예요",
  "ㅌ": "ㄷ와 같은 위치에서 더 강한 바람을 내보내는 소리예요",
  "ㅍ": "ㅂ와 같은 위치에서 더 강한 바람을 내보내는 소리예요",
  "ㅎ": "목구멍에서 바람이 흘러나오는 소리예요",
  "ㄲ": "힘을 주어 혀 뒤쪽으로 내는 된소리예요",
  "ㄸ": "힘을 주어 혀끝으로 내는 된소리예요",
  "ㅃ": "두 입술을 힘 있게 터뜨리는 된소리예요",
  "ㅆ": "힘을 주어 내는 된마찰소리예요",
  "ㅉ": "힘을 주어 내는 된파찰소리예요",
};

// ─── 정상 발달 습득 연령 (한국어 조음 발달 기준) ──────────────────────────────
const PHONEME_AGE: Record<string, string> = {
  "ㅁ": "2~3세", "ㅂ": "2~3세", "ㄴ": "2~3세",
  "ㄷ": "3~4세", "ㄱ": "3~4세", "ㅋ": "3~4세",
  "ㅌ": "3~4세", "ㅍ": "3~4세", "ㅎ": "3~4세",
  "ㅅ": "4~5세", "ㅈ": "4~5세", "ㅊ": "4~5세",
  "ㄹ": "5~6세", "ㅆ": "5~6세", "ㅉ": "5~6세",
};

// ─── 처방전 합성 (서버 사이드) ──────────────────────────────────────────────────
function buildPrescriptionContext(
  childName: string,
  weakPhonemes: { phoneme: string; weaknessLevel: string; errorRate: number }[],
  topCategory: { parentLabel: string; pct: number; tip: string } | null,
) {
  const urgentPhonemes = weakPhonemes.filter((w) => w.weaknessLevel === "집중교정필요");
  const practicePhonemes = weakPhonemes.filter((w) => w.weaknessLevel === "꾸준한연습필요");

  const lines: string[] = [];

  if (topCategory) {
    lines.push(
      `${childName}의 발음 오류 중 가장 많은 유형은 **"${topCategory.parentLabel}"**(${topCategory.pct}%)이에요. ${topCategory.tip}`
    );
  }

  if (urgentPhonemes.length > 0) {
    lines.push(
      `특히 ${urgentPhonemes.map((p) => p.phoneme).join(", ")} 소리에서 집중 연습이 필요해요.`
    );
  } else if (practicePhonemes.length > 0) {
    lines.push(
      `${practicePhonemes.map((p) => p.phoneme).join(", ")} 소리를 꾸준히 연습하면 큰 효과를 기대할 수 있어요.`
    );
  }

  return lines.join(" ");
}

// ─── 페이지 ─────────────────────────────────────────────────────────────────────
export default async function ComprehensivePage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { childId: qChildId } = await searchParams;
  const savedId = await getSelectedChildId();
  const childId = qChildId ?? savedId ?? "";

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, name: true, userId: true },
  });
  if (!child || child.userId !== session.user.id) redirect("/dashboard/answer-note");

  // ── 병렬 DB 조회 ──────────────────────────────────────────────────────────────
  const [weakPhonemes, totalCount, daechi, tallak, donghwa, cheomga] = await Promise.all([
    prisma.weakPhoneme.findMany({
      where: { childId },
      orderBy: { errorRate: "desc" },
      take: 10,
    }),
    prisma.errorRecord.count({ where: { childId } }),
    prisma.errorRecord.count({ where: { childId, errorCategory: "대치" } }),
    prisma.errorRecord.count({ where: { childId, errorCategory: "탈락" } }),
    prisma.errorRecord.count({ where: { childId, errorCategory: "동화" } }),
    prisma.errorRecord.count({ where: { childId, errorCategory: "첨가" } }),
  ]);

  // ── 데이터 부족 처리 ──────────────────────────────────────────────────────────
  if (totalCount < 10) {
    return (
      <div className="px-5 pt-10 max-w-lg mx-auto text-center">
        <BubbleCard color="peach">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-bold text-[#3D3530] text-lg mb-2">데이터를 조금 더 모아봐요!</p>
          <p className="text-sm text-[#8B7E74] leading-relaxed">
            현재 <span className="font-bold text-[#FFB38A]">{totalCount}개</span> 기록이 있어요.
            <br />10개 이상 입력하면 종합 분석이 가능해요.
          </p>
          <div className="h-3 bg-[#F0E8E0] rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-[#FFB38A] rounded-full" style={{ width: `${(totalCount / 10) * 100}%` }} />
          </div>
          <p className="text-xs text-[#8B7E74] mt-2">{totalCount} / 10개</p>
          <Link href="/dashboard/answer-note" className="inline-block mt-5 px-6 py-2.5 bg-[#FFB38A] text-white rounded-full text-sm font-bold">
            발음 분석 하러 가기 →
          </Link>
        </BubbleCard>
      </div>
    );
  }

  // ── 오류 유형 분포 계산 ───────────────────────────────────────────────────────
  const rawCategories = [
    { key: "대치", count: daechi },
    { key: "탈락", count: tallak },
    { key: "동화", count: donghwa },
    { key: "첨가", count: cheomga },
  ];
  const categoryStats = rawCategories
    .map((c) => ({
      ...c,
      ...CATEGORY_META[c.key],
      pct: totalCount > 0 ? Math.round((c.count / totalCount) * 100) : 0,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // ── 심각도별 음소 그룹핑 ──────────────────────────────────────────────────────
  const grouped = {
    집중교정필요: weakPhonemes.filter((w) => w.weaknessLevel === "집중교정필요"),
    꾸준한연습필요: weakPhonemes.filter((w) => w.weaknessLevel === "꾸준한연습필요"),
    관찰중: weakPhonemes.filter((w) => w.weaknessLevel === "관찰중"),
    정상범위: weakPhonemes.filter((w) => w.weaknessLevel === "정상범위"),
  };
  const hasAnyPhoneme = weakPhonemes.length > 0;

  // ── PhonemeTemplate 캐시 조회 (집중교정필요 우선, 없으면 꾸준한연습필요) ─────
  const prescriptionPhonemes = [
    ...grouped["집중교정필요"],
    ...grouped["꾸준한연습필요"],
  ].slice(0, 3).map((w) => w.phoneme);

  const templates = (
    await Promise.all(
      prescriptionPhonemes.map((p) =>
        prisma.phonemeTemplate.findFirst({
          where: { phoneme: p },
          select: { phoneme: true, errorType: true, rootCause: true, trainingStep1: true, recommendedWords: true, parentHint: true },
        })
      )
    )
  ).filter(Boolean) as NonNullable<Awaited<ReturnType<typeof prisma.phonemeTemplate.findFirst>>>[];

  // 처방전 합성 문장
  const topCategory = categoryStats[0] ?? null;
  const prescriptionContext = buildPrescriptionContext(
    child.name,
    weakPhonemes,
    topCategory ? { parentLabel: topCategory.parentLabel, pct: topCategory.pct, tip: topCategory.tip } : null,
  );

  // AiAdvice 용 직렬화 데이터
  const weakPhonemesSafe = weakPhonemes.map((w) => ({
    phoneme: w.phoneme, errorRate: w.errorRate,
    totalAttempts: w.totalAttempts, weaknessLevel: w.weaknessLevel,
  }));
  const categoryStatsSafe = categoryStats.map((c) => ({ label: c.label, count: c.count, pct: c.pct }));

  const today = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-8">

      {/* ── 헤더 ── */}
      <div>
        <Link href="/dashboard/answer-note" className="inline-flex items-center gap-1 text-xs text-[#8B7E74] mb-3 hover:text-[#FFB38A] transition-colors">
          ← 발음 분석으로
        </Link>
        <h2 className="text-2xl font-black text-[#3D3530]">📊 종합 발음 리포트</h2>
        <p className="text-sm text-[#8B7E74] mt-1">{child.name} · {totalCount}개 기록 기준 · {today}</p>
      </div>

      {/* ── 섹션 1: 발음 분석 요약 ── */}
      <BubbleCard>
        <p className="font-bold text-[#3D3530] mb-4">📊 발음 분석 요약</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#FFF5EE] rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-[#FFB38A]">{weakPhonemes.length}</p>
            <p className="text-[11px] font-semibold text-[#3D3530] mt-1">분석한 소리</p>
            <p className="text-[10px] text-[#8B7E74]">종류</p>
          </div>
          <div className="bg-[#FEF2F2] rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-[#FCA5A5]">{grouped["집중교정필요"].length}</p>
            <p className="text-[11px] font-semibold text-[#3D3530] mt-1">집중 연습</p>
            <p className="text-[10px] text-[#8B7E74]">필요한 소리</p>
          </div>
          <div className="bg-[#F0FDFB] rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-[#7EDFD0]">{grouped["관찰중"].length + grouped["정상범위"].length}</p>
            <p className="text-[11px] font-semibold text-[#3D3530] mt-1">잘 따라오는</p>
            <p className="text-[10px] text-[#8B7E74]">소리</p>
          </div>
        </div>
        <p className="text-[11px] text-[#8B7E74] mt-3 text-center">총 {totalCount}개 기록 기준</p>
      </BubbleCard>

      {/* ── 섹션 2: 오류 유형 분석 ── */}
      {categoryStats.length > 0 && (
        <BubbleCard>
          <p className="font-bold text-[#3D3530] mb-1">🔎 발음 오류 유형 분석</p>
          <p className="text-xs text-[#8B7E74] mb-4 leading-relaxed">
            아이가 어떤 방식으로 소리를 틀리는지 분류한 결과예요.
            가장 많은 유형에 집중하면 효과적으로 도울 수 있어요.
          </p>
          <div className="space-y-4">
            {categoryStats.map((cat, i) => (
              <div key={cat.key} className={`rounded-2xl p-3 ${i === 0 ? "bg-[#FFF5EE] border border-[#FFE4D8]" : "bg-[#FAFAF8]"}`}>
                {/* 제목 행 */}
                <div className="flex items-start justify-between mb-1 gap-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {i === 0 && (
                        <span className="text-[10px] font-black bg-[#FFB38A] text-white px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                          가장 많아요
                        </span>
                      )}
                      <span className="text-sm font-bold text-[#3D3530] whitespace-nowrap">{cat.parentLabel}</span>
                    </div>
                    <span className="text-xs text-[#8B7E74] whitespace-nowrap">— {cat.label}</span>
                  </div>
                  <span className="text-sm font-black text-[#3D3530] flex-shrink-0 ml-1">{cat.pct}%</span>
                </div>
                {/* 바 */}
                <div className="h-2.5 bg-white/60 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, backgroundColor: cat.barColor }} />
                </div>
                {/* 예시 + 설명 */}
                <p className="text-[11px] font-semibold text-[#5B4E45] mb-0.5">{cat.example}</p>
                <p className="text-[11px] text-[#8B7E74] leading-relaxed">{cat.tip}</p>
              </div>
            ))}
          </div>
        </BubbleCard>
      )}

      {/* ── 섹션 3: 조음 발달 현황 ── */}
      {hasAnyPhoneme && (
        <BubbleCard>
          <p className="font-bold text-[#3D3530] mb-1">🗺️ 조음 발달 현황</p>
          <p className="text-xs text-[#8B7E74] mb-4 leading-relaxed">
            각 소리를 얼마나 정확히 내고 있는지 나타냈어요.
            언어재활사는 이 소리 목록을 보고 어디서부터 연습할지 판단해요.
          </p>
          <div className="space-y-3">
            {(["집중교정필요", "꾸준한연습필요", "관찰중", "정상범위"] as const).map((level) => {
              const group = grouped[level];
              if (group.length === 0) return null;
              const meta = LEVEL_META[level];
              return (
                <div key={level} className="rounded-2xl p-3" style={{ backgroundColor: meta.bgColor }}>
                  <div className="flex items-center gap-2 mb-2">
                    <PastelBadge color={meta.color}>{meta.label}</PastelBadge>
                    <span className="text-[10px] text-[#8B7E74]">{meta.sublabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.map((w) => {
                      const isTrainable = level === "집중교정필요" || level === "꾸준한연습필요";
                      const card = (
                        <div className="bg-white/80 rounded-xl px-3 py-2 shadow-sm h-full">
                          <p className="text-base font-black text-[#3D3530] leading-none mb-1">{w.phoneme}</p>
                          {PHONEME_AGE[w.phoneme] && (
                            <p className="text-[9px] text-[#8B7E74] font-semibold leading-none">
                              습득 {PHONEME_AGE[w.phoneme]}
                            </p>
                          )}
                          {PHONEME_HOW[w.phoneme] && (
                            <p className="text-[9px] text-[#C4B5A8] mt-0.5 leading-tight max-w-[10rem]">
                              {PHONEME_HOW[w.phoneme]}
                            </p>
                          )}
                          {isTrainable && (
                            <p className="text-[9px] font-bold text-[#FFB38A] mt-1 leading-none">
                              🎯 대립쌍 훈련 →
                            </p>
                          )}
                        </div>
                      );
                      return isTrainable ? (
                        <Link
                          key={w.phoneme}
                          href={`/dashboard/practice/minimal-pairs?phoneme=${encodeURIComponent(w.phoneme)}&childId=${child.id}`}
                          className="hover:scale-105 transition-transform active:scale-95"
                        >
                          {card}
                        </Link>
                      ) : (
                        <div key={w.phoneme}>{card}</div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[#C4B5A8] text-right mt-2">최근 {Math.min(totalCount, 300)}개 기록 기준</p>
        </BubbleCard>
      )}

      {/* ── 섹션 4: 집중 훈련 처방전 ── */}
      {(prescriptionContext || templates.length > 0) && (
        <BubbleCard color="lavender">
          <p className="font-bold text-[#3D3530] mb-2">📋 집중 훈련 처방전</p>

          {/* 종합 소견 — 오류 유형 + 약점 음소를 연결해서 설명 */}
          {prescriptionContext && (
            <div className="bg-white/60 rounded-2xl px-4 py-3 mb-4 border border-[#E8E0F0]">
              <p className="text-[10px] font-bold text-[#7C6BA0] mb-1">📌 종합 소견</p>
              <p className="text-xs text-[#3D3530] leading-relaxed">
                {prescriptionContext.split("**").map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </p>
            </div>
          )}

          {/* 음소별 처방 (PhonemeTemplate 캐시) */}
          {templates.length > 0 ? (
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-[#7C6BA0]">🎯 음소별 연습 처방</p>
              {templates.map((t, idx) => {
                let words: string[] = [];
                try { words = JSON.parse(t.recommendedWords).slice(0, 5); } catch {}
                const how = PHONEME_HOW[t.phoneme];
                return (
                  <div key={t.phoneme} className="border-b border-[#E8E0F0] pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-[#7C6BA0] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <PastelBadge color="peach">{t.phoneme} 소리</PastelBadge>
                    </div>
                    {/* 이 소리가 왜 어려운지 */}
                    {how && (
                      <p className="text-[11px] text-[#8B7E74] mb-2 pl-8">{how}</p>
                    )}
                    {t.parentHint && (
                      <p className="text-xs font-semibold text-[#5B4E9B] mb-2 pl-8">💡 {t.parentHint}</p>
                    )}
                    <p className="text-xs text-[#3D3530] leading-relaxed mb-2 pl-8">{t.rootCause}</p>
                    <div className="bg-white/60 rounded-xl px-3 py-2 ml-8">
                      <p className="text-[10px] font-bold text-[#FFB38A] mb-1">첫 번째 연습 단계</p>
                      <p className="text-xs text-[#3D3530] leading-relaxed">{t.trainingStep1?.replace(/^【[^】]*】\s*/, "")}</p>
                    </div>
                    {words.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-8">
                        {words.map((w) => (
                          <span key={w} className="text-xs bg-white/80 text-[#5B4E9B] font-semibold px-2.5 py-1 rounded-full">
                            {w}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[#8B7E74] text-center py-3">
              발음 분석을 더 많이 입력하면 맞춤 처방이 생성돼요
            </p>
          )}
        </BubbleCard>
      )}

      {/* ── 섹션 5: AI 언어재활사 종합 조언 ── */}
      <AiAdvice
        childId={child.id}
        childName={child.name}
        weakPhonemes={weakPhonemesSafe}
        categoryStats={categoryStatsSafe}
      />

    </div>
  );
}
