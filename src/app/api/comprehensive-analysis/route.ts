export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface WeakPhonemeInput {
  phoneme: string;
  errorRate: number;
  totalAttempts: number;
  weaknessLevel: string;
}

interface CategoryStatInput {
  label: string;
  count: number;
  pct: number;
}

// ── 메모리 캐시 (childId별 1시간 TTL) ───────────────────────────────────────
interface CacheEntry {
  text: string;
  signature: string;
  expiresAt: number;
}
const adviceCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1시간

function buildSignature(
  weakPhonemes: WeakPhonemeInput[],
  categoryStats: CategoryStatInput[]
): string {
  const w = weakPhonemes
    .filter((p) => p.weaknessLevel !== "정상범위")
    .slice(0, 5)
    .map((p) => `${p.phoneme}:${Math.round(p.errorRate)}:${p.totalAttempts}:${p.weaknessLevel}`)
    .sort()
    .join("|");
  const c = categoryStats
    .filter((s) => s.count > 0)
    .map((s) => `${s.label}:${s.pct}`)
    .sort()
    .join(",");
  return `${w}#${c}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { childId, childName, weakPhonemes, categoryStats } = (await request.json()) as {
      childId: string;
      childName: string;
      weakPhonemes: WeakPhonemeInput[];
      categoryStats: CategoryStatInput[];
    };

    // 소유권 검증
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { userId: true },
    });
    if (!child || child.userId !== session.user.id) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    // ── 캐시 HIT: 동일 데이터로 이미 분석된 경우 즉시 반환 ────────────────
    const signature = buildSignature(weakPhonemes, categoryStats);
    const cacheKey = `${session.user.id}:${childId}`;
    const cached = adviceCache.get(cacheKey);
    if (cached && cached.signature === signature && cached.expiresAt > Date.now()) {
      return NextResponse.json({ report: cached.text, fromCache: true });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "dummy") {
      return NextResponse.json(
        { error: "AI 서비스를 사용할 수 없어요" },
        { status: 503 }
      );
    }

    const phonemeSummary = weakPhonemes
      .filter((w) => w.weaknessLevel !== "정상범위")
      .slice(0, 5)
      .map((w) => {
        const levelText =
          w.weaknessLevel === "집중교정필요"
            ? "지금 바로 연습이 필요한"
            : w.weaknessLevel === "꾸준한연습필요"
            ? "꾸준히 연습하면 좋아질"
            : "지켜보고 있는";
        return `/${w.phoneme}/ 소리 (${levelText} 수준, 오류율 ${Math.round(w.errorRate)}%, ${w.totalAttempts}회 시도)`;
      })
      .join("\n");

    const categorySummary = categoryStats
      .filter((c) => c.count > 0)
      .map((c) => `${c.label} (${c.pct}%)`)
      .join(", ");

    const prompt = `당신은 경력 10년의 언어재활사입니다. 아래는 ${childName} 아이의 발음 분석 데이터입니다.

[약점 소리]
${phonemeSummary || "특별한 약점이 발견되지 않았습니다"}

[발음 습관 분포]
${categorySummary || "데이터 없음"}

위 데이터를 바탕으로 부모에게 따뜻하고 격려가 되는 종합 조언을 작성해주세요.

조건:
- 전문용어(대치, 탈락, 동화, 음소 등) 사용 금지 — 부모가 쉽게 이해할 수 있는 말로
- 3~5문장 분량
- 집에서 바로 실천할 수 있는 구체적 활동 1~2개 포함
- 긍정적이고 따뜻한 어조
- "선생님으로서 보면" 같은 전문가적 시각에서 작성
- 아이 이름(${childName})을 자연스럽게 1~2번 포함`;

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const report = result.response.text();

    if (!report) {
      return NextResponse.json({ error: "분석 결과를 생성하지 못했어요" }, { status: 500 });
    }

    // 캐시에 저장
    adviceCache.set(cacheKey, {
      text: report,
      signature,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json({ report });
  } catch (error: unknown) {
    console.error("[ComprehensiveAnalysis Error]:", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("429") || msg.includes("quota") || msg.includes("Resource")) {
      return NextResponse.json(
        { error: "오늘 AI 분석 한도를 모두 사용했어요", isQuotaError: true },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
