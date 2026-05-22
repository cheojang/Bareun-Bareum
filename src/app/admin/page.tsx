"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── 타입 ────────────────────────────────────────────────────────
interface AdminStats {
  users: {
    total: number;
    newThisMonth: number;
    premium: number;
    free: number;
    activeChildren7d: number;
  };
  analysis: {
    totalErrorRecords: number;
    totalGeminiCalls: number;
    cacheHitTotal: number;
    cacheItemCount: number;
    cacheHitRate: number;
  };
  children: {
    total: number;
    ageDistribution: { label: string; count: number }[];
    genderDistribution: { label: string; count: number }[];
  };
  hourlyUsage: { hour: number; count: number }[];
  weekdayUsage: { day: string; count: number }[];
  topCachedWords: {
    targetWord: string;
    childPronunciation: string;
    hitCount: number;
    errorType: string;
    errorCategory: string;
  }[];
  errorCategories: { category: string; count: number }[];
  errorTypes: { type: string; count: number }[];
  weakPhonemes: { phoneme: string; errorCount: number }[];
  dailySignups: { date: string; count: number }[];
  generatedAt: string;
}

// ─── 하위 컴포넌트 ───────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 border-2 border-[#F0E8E0] flex flex-col gap-1"
      style={{ background: "rgba(255,255,255,0.85)" }}
    >
      <span className="text-2xl">{icon}</span>
      <p
        className="text-2xl font-black mt-1"
        style={{ color: accent ?? "#3D3530" }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-sm font-bold text-[#3D3530]">{label}</p>
      {sub && <p className="text-xs text-[#8B7E74]">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-black text-[#3D3530] mb-3">{children}</h2>
  );
}

function BarRow({
  label,
  count,
  maxCount,
  color = "#FFB38A",
  labelWidth = "w-12",
}: {
  label: string;
  count: number;
  maxCount: number;
  color?: string;
  labelWidth?: string;
}) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs text-[#8B7E74] ${labelWidth} text-right shrink-0`}>
        {label}
      </span>
      <div className="flex-1 h-4 bg-[#F5F0EB] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-[#8B7E74] w-10 text-right shrink-0">
        {count.toLocaleString()}
      </span>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl p-5 border-2 border-[#F0E8E0] ${className}`}
      style={{ background: "rgba(255,255,255,0.85)" }}
    >
      {children}
    </div>
  );
}

// 일별 가입자 미니 스파크라인
function SignupSparkline({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        const isToday = i === data.length - 1;
        return (
          <div
            key={d.date}
            className="flex-1 rounded-t-sm transition-all"
            style={{
              height: `${Math.max(pct, 4)}%`,
              backgroundColor: isToday ? "#FFB38A" : d.count > 0 ? "#FDD5B5" : "#F5F0EB",
            }}
            title={`${d.date}: ${d.count}명`}
          />
        );
      })}
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("통계 조회 실패");
      setStats(await res.json());
    } catch {
      setError("데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-[#FFB38A] border-t-transparent animate-spin" />
        <p className="text-sm text-[#8B7E74] font-semibold">통계 불러오는 중...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-4xl">⚠️</p>
        <p className="text-sm text-[#EF4444] font-bold">{error}</p>
        <button
          onClick={() => fetchStats()}
          className="px-5 py-2 rounded-2xl text-sm font-bold bg-[#FFB38A] text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const { users, analysis, children, hourlyUsage, weekdayUsage, topCachedWords,
    errorCategories, errorTypes, weakPhonemes, dailySignups, generatedAt } = stats;

  const boyCount  = children.genderDistribution.find((g) => g.label === "남아")?.count ?? 0;
  const girlCount = children.genderDistribution.find((g) => g.label === "여아")?.count ?? 0;
  const unknownCount = children.genderDistribution.find((g) => g.label === "미입력")?.count ?? 0;
  const genderTotal = boyCount + girlCount + unknownCount;
  const boyPct  = genderTotal > 0 ? Math.round((boyCount  / genderTotal) * 100) : 0;
  const girlPct = genderTotal > 0 ? Math.round((girlCount / genderTotal) * 100) : 0;

  const maxHour = Math.max(...hourlyUsage.map((h) => h.count), 1);
  const maxDay  = Math.max(...weekdayUsage.map((d) => d.count), 1);
  const maxAge  = Math.max(...children.ageDistribution.map((a) => a.count), 1);
  const maxErr  = Math.max(...errorTypes.map((e) => e.count), 1);
  const maxPhon = Math.max(...weakPhonemes.map((p) => p.errorCount), 1);

  const conversionRate =
    users.total > 0 ? ((users.premium / users.total) * 100).toFixed(1) : "0.0";

  const updatedAt = new Date(generatedAt).toLocaleString("ko-KR", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="px-4 pt-6 pb-16 max-w-5xl mx-auto space-y-8">

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#3D3530]">📊 대시보드</h1>
          <p className="text-xs text-[#C4B5A8] mt-0.5">업데이트: {updatedAt} (KST)</p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold bg-[#F5F0EB] text-[#8B7E74] hover:bg-[#EDE5DC] transition-colors disabled:opacity-50"
        >
          <span className={refreshing ? "animate-spin" : ""}>↻</span>
          새로고침
        </button>
      </div>

      {/* ── KPI 카드 ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon="👥" label="총 회원수" value={users.total} sub={`이번 달 +${users.newThisMonth}명`} />
        <KpiCard icon="⭐" label="프리미엄 구독" value={users.premium} sub={`전환율 ${conversionRate}%`} accent="#FFB38A" />
        <KpiCard icon="🆓" label="무료 회원" value={users.free} />
        <KpiCard icon="🏃" label="활성 아이 (7일)" value={users.activeChildren7d} sub="오답 입력 기준" accent="#0D9488" />
      </div>

      {/* ── AI 분석 현황 ─────────────────────────────────────────── */}
      <Card>
        <SectionTitle>🤖 AI 분석 현황</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-[#3D3530]">
              {analysis.totalErrorRecords.toLocaleString()}
            </p>
            <p className="text-xs text-[#8B7E74] mt-1 font-semibold">총 오답 입력</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#8B7EFF]">
              {analysis.totalGeminiCalls.toLocaleString()}
            </p>
            <p className="text-xs text-[#8B7E74] mt-1 font-semibold">Gemini 호출</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#0D9488]">
              {analysis.cacheHitTotal.toLocaleString()}
            </p>
            <p className="text-xs text-[#8B7E74] mt-1 font-semibold">캐시 히트</p>
          </div>
          <div className="text-center">
            <p
              className="text-2xl font-black"
              style={{
                color: analysis.cacheHitRate >= 70 ? "#0D9488"
                     : analysis.cacheHitRate >= 40 ? "#FFB38A"
                     : "#EF4444",
              }}
            >
              {analysis.cacheHitRate}%
            </p>
            <p className="text-xs text-[#8B7E74] mt-1 font-semibold">캐시 히트율</p>
          </div>
        </div>
        {/* 히트율 게이지 */}
        <div className="mt-4">
          <div className="h-3 bg-[#F5F0EB] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${analysis.cacheHitRate}%`,
                backgroundColor: analysis.cacheHitRate >= 70 ? "#0D9488"
                               : analysis.cacheHitRate >= 40 ? "#FFB38A"
                               : "#EF4444",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#C4B5A8]">캐시 항목 {analysis.cacheItemCount.toLocaleString()}개 저장됨</span>
            <span className="text-[10px] text-[#C4B5A8]">
              절감된 Gemini 호출 {analysis.cacheHitTotal.toLocaleString()}회
            </span>
          </div>
        </div>
      </Card>

      {/* ── 신규 가입 추이 + 성별 분포 ───────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle>📈 신규 가입 추이 (최근 30일)</SectionTitle>
          <SignupSparkline data={dailySignups} />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-[#C4B5A8]">
              {dailySignups[0]?.date.slice(5)}
            </span>
            <span className="text-[10px] text-[#8B7E74] font-bold">
              총 {dailySignups.reduce((s, d) => s + d.count, 0)}명
            </span>
            <span className="text-[10px] text-[#C4B5A8]">
              {dailySignups[dailySignups.length - 1]?.date.slice(5)}
            </span>
          </div>
        </Card>

        <Card>
          <SectionTitle>👦👧 아이 성별 분포 (총 {children.total}명)</SectionTitle>
          {genderTotal === 0 ? (
            <p className="text-xs text-[#C4B5A8] py-4 text-center">데이터 없음</p>
          ) : (
            <div className="space-y-4">
              {/* 게이지 바 */}
              <div>
                <div className="flex h-8 rounded-2xl overflow-hidden">
                  {boyPct > 0 && (
                    <div
                      className="flex items-center justify-center text-xs font-black text-white transition-all"
                      style={{ width: `${boyPct}%`, backgroundColor: "#8B7EFF" }}
                    >
                      {boyPct >= 15 && `${boyPct}%`}
                    </div>
                  )}
                  {girlPct > 0 && (
                    <div
                      className="flex items-center justify-center text-xs font-black text-white transition-all"
                      style={{ width: `${girlPct}%`, backgroundColor: "#FF8AB0" }}
                    >
                      {girlPct >= 15 && `${girlPct}%`}
                    </div>
                  )}
                  {unknownCount > 0 && (
                    <div
                      className="flex-1 flex items-center justify-center text-xs font-bold text-[#8B7E74]"
                      style={{ backgroundColor: "#F5F0EB" }}
                    >
                      미입력
                    </div>
                  )}
                </div>
              </div>
              {/* 수치 */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#F5F3FF] rounded-2xl py-3">
                  <p className="text-lg font-black text-[#8B7EFF]">{boyCount.toLocaleString()}</p>
                  <p className="text-xs text-[#8B7E74] font-bold mt-0.5">👦 남아</p>
                </div>
                <div className="bg-[#FFF0F5] rounded-2xl py-3">
                  <p className="text-lg font-black text-[#FF8AB0]">{girlCount.toLocaleString()}</p>
                  <p className="text-xs text-[#8B7E74] font-bold mt-0.5">👧 여아</p>
                </div>
                <div className="bg-[#F5F0EB] rounded-2xl py-3">
                  <p className="text-lg font-black text-[#C4B5A8]">{unknownCount.toLocaleString()}</p>
                  <p className="text-xs text-[#8B7E74] font-bold mt-0.5">미입력</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── 아이 연령 분포 ────────────────────────────────────────── */}
      <Card>
        <SectionTitle>👶 아이 연령 분포 (총 {children.total}명)</SectionTitle>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-1.5">
          {children.ageDistribution.map(({ label, count }) => (
            <BarRow
              key={label}
              label={label}
              count={count}
              maxCount={maxAge}
              color="#FFD4A3"
              labelWidth="w-16"
            />
          ))}
        </div>
      </Card>

      {/* ── 시간대별 + 요일별 ────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle>🕐 시간대별 사용량 (최근 30일·KST)</SectionTitle>
          <div className="space-y-1">
            {hourlyUsage
              .filter((_, i) => i % 1 === 0)
              .map(({ hour, count }) => (
                <BarRow
                  key={hour}
                  label={`${String(hour).padStart(2, "0")}시`}
                  count={count}
                  maxCount={maxHour}
                  color="#FFB38A"
                  labelWidth="w-10"
                />
              ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle>📅 요일별 사용량 (최근 30일)</SectionTitle>
            <div className="space-y-1.5">
              {weekdayUsage.map(({ day, count }) => (
                <BarRow
                  key={day}
                  label={day}
                  count={count}
                  maxCount={maxDay}
                  color="#C4B5FD"
                  labelWidth="w-5"
                />
              ))}
            </div>
          </Card>

          {/* 오류 유형 분포 */}
          <Card>
            <SectionTitle>📂 오류 카테고리</SectionTitle>
            {errorCategories.length === 0 ? (
              <p className="text-xs text-[#C4B5A8]">데이터 없음</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {errorCategories.map(({ category, count }) => (
                  <div key={category} className="bg-[#F5F0EB] rounded-2xl p-3 text-center">
                    <p className="text-lg font-black text-[#3D3530]">
                      {count.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#8B7E74] font-bold mt-0.5">{category}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── 오류 유형 Top 10 + 약점 음소 ────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle>🔠 오류 유형 Top 10</SectionTitle>
          {errorTypes.length === 0 ? (
            <p className="text-xs text-[#C4B5A8]">데이터 없음</p>
          ) : (
            <div className="space-y-1.5">
              {errorTypes.map(({ type, count }) => (
                <BarRow
                  key={type}
                  label={type}
                  count={count}
                  maxCount={maxErr}
                  color="#FCA5A5"
                  labelWidth="w-16"
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>🔉 약점 음소 Top 10</SectionTitle>
          {weakPhonemes.length === 0 ? (
            <p className="text-xs text-[#C4B5A8]">데이터 없음</p>
          ) : (
            <div className="space-y-1.5">
              {weakPhonemes.map(({ phoneme, errorCount }) => (
                <BarRow
                  key={phoneme}
                  label={phoneme}
                  count={errorCount}
                  maxCount={maxPhon}
                  color="#7EDFD0"
                  labelWidth="w-6"
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── 단어쌍 캐시 Top 10 ──────────────────────────────────── */}
      <Card>
        <SectionTitle>💾 자주 조회된 단어쌍 캐시 Top 10</SectionTitle>
        {topCachedWords.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">🗂️</p>
            <p className="text-sm text-[#8B7E74] font-semibold">캐시 데이터가 없어요</p>
            <p className="text-xs text-[#C4B5A8] mt-1">
              오답이 입력되면 자동으로 누적됩니다
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0E8E0]">
                  <th className="text-left py-2 pr-4 text-xs font-bold text-[#8B7E74]">순위</th>
                  <th className="text-left py-2 pr-4 text-xs font-bold text-[#8B7E74]">목표 단어</th>
                  <th className="text-left py-2 pr-4 text-xs font-bold text-[#8B7E74]">아이 발음</th>
                  <th className="text-left py-2 pr-4 text-xs font-bold text-[#8B7E74]">오류 유형</th>
                  <th className="text-right py-2 text-xs font-bold text-[#8B7E74]">조회수</th>
                </tr>
              </thead>
              <tbody>
                {topCachedWords.map((w, i) => (
                  <tr key={i} className="border-b border-[#F5F0EB] hover:bg-[#FDFAF7]">
                    <td className="py-2 pr-4">
                      <span
                        className={`text-xs font-black ${
                          i === 0 ? "text-[#FFB38A]" : i === 1 ? "text-[#8B7E74]" : "text-[#C4B5A8]"
                        }`}
                      >
                        {i + 1}위
                      </span>
                    </td>
                    <td className="py-2 pr-4 font-bold text-[#3D3530]">{w.targetWord}</td>
                    <td className="py-2 pr-4 text-[#EF4444] font-semibold">{w.childPronunciation}</td>
                    <td className="py-2 pr-4">
                      <span className="text-[11px] bg-[#FFF5EE] text-[#FFB38A] px-2 py-0.5 rounded-full font-bold">
                        {w.errorType}
                      </span>
                    </td>
                    <td className="py-2 text-right font-black text-[#3D3530]">
                      {w.hitCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── DB 대량 시딩 ─────────────────────────────────────────── */}
      <BulkSeedPanel />

      {/* ── 관리 바로가기 ─────────────────────────────────────────── */}
      <Card className="border-dashed">
        <SectionTitle>⚙️ 관리 작업</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/admin/announcements", label: "📢 공지사항 관리" },
            { href: "/admin/centers",       label: "🏥 센터 관리" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-4 py-2 rounded-2xl text-sm font-bold text-[#8B7E74] bg-[#F5F0EB] hover:bg-[#EDE5DC] transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 대량 시딩 패널 ──────────────────────────────────────────────

interface BulkStatus {
  totalPatterns: number;
  donePatterns: number;
  remainingPatterns: number;
  totalWordPairs: number;
  targetWordPairs: number;
  nextBatch: { phoneme: string; position: string; errorType: string }[];
}

function BulkSeedPanel() {
  const [status, setStatus] = useState<BulkStatus | null>(null);
  const [running, setRunning] = useState(false);
  const [autoLoop, setAutoLoop] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const autoLoopRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/admin/bulk-seed");
    if (res.ok) setStatus(await res.json());
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const runOnce = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/admin/bulk-seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 3 }),
    });
    const data = await res.json();
    const ts = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    if (data.message) {
      setLog((prev) => [`[${ts}] ✅ 완료 — 전체 패턴 ${data.donePatterns}개, 단어쌍 ${data.totalWordPairs?.toLocaleString()}개`, ...prev]);
      await fetchStatus();
      return false; // 더 이상 할 것 없음
    }

    setLog((prev) => [
      `[${ts}] ✓ ${data.success}패턴 처리 · 단어쌍 +${data.wordPairsCreated}개 · 누적 ${data.totalWordPairs?.toLocaleString()}개 (남은 패턴: ${data.remainingPatterns})`,
      ...(data.errors?.length > 0 ? [`[${ts}] ⚠️ 오류: ${data.errors.join(" | ")}`] : []),
      ...prev,
    ].slice(0, 50));
    await fetchStatus();
    return data.remainingPatterns > 0;
  }, [fetchStatus]);

  const handleStart = useCallback(async () => {
    if (running) return;
    setRunning(true);
    autoLoopRef.current = autoLoop;

    try {
      let hasMore = await runOnce();
      while (hasMore && autoLoopRef.current) {
        await new Promise((r) => setTimeout(r, 1500)); // 서버 부하 방지 딜레이
        hasMore = await runOnce();
      }
    } finally {
      setRunning(false);
    }
  }, [running, autoLoop, runOnce]);

  const handleStop = () => { autoLoopRef.current = false; };

  if (!status) return null;

  const patternPct = status.totalPatterns > 0
    ? Math.round((status.donePatterns / status.totalPatterns) * 100) : 0;
  const pairPct = status.targetWordPairs > 0
    ? Math.round((status.totalWordPairs / status.targetWordPairs) * 100) : 0;
  const isDone = status.remainingPatterns === 0;

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <SectionTitle>🚀 단어쌍 + 발음교정 DB 대량 시딩</SectionTitle>
          <p className="text-xs text-[#8B7E74] -mt-2">
            패턴당 Gemini 1회 호출 → 훈련법 1개 + 단어쌍 100개 동시 생성
          </p>
        </div>
        {isDone && (
          <span className="text-xs font-black px-3 py-1 bg-[#F0FAF8] text-[#0D9488] rounded-full">
            ✅ 완료
          </span>
        )}
      </div>

      {/* 진행 현황 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#F5F3FF] rounded-2xl p-4">
          <p className="text-2xl font-black text-[#8B7EFF]">
            {status.donePatterns} <span className="text-base font-bold">/ {status.totalPatterns}</span>
          </p>
          <p className="text-xs text-[#8B7E74] font-bold mt-1">발음교정 패턴 완료</p>
          <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-[#8B7EFF] rounded-full transition-all" style={{ width: `${patternPct}%` }} />
          </div>
          <p className="text-[10px] text-[#C4B5A8] mt-1">{patternPct}% · 남은 패턴 {status.remainingPatterns}개</p>
        </div>
        <div className="bg-[#F0FAF8] rounded-2xl p-4">
          <p className="text-2xl font-black text-[#0D9488]">
            {status.totalWordPairs.toLocaleString()} <span className="text-base font-bold">/ {status.targetWordPairs.toLocaleString()}</span>
          </p>
          <p className="text-xs text-[#8B7E74] font-bold mt-1">단어쌍 캐시 생성</p>
          <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-[#0D9488] rounded-full transition-all" style={{ width: `${pairPct}%` }} />
          </div>
          <p className="text-[10px] text-[#C4B5A8] mt-1">{pairPct}% · 목표 {status.targetWordPairs.toLocaleString()}쌍</p>
        </div>
      </div>

      {/* 다음 배치 미리보기 */}
      {!isDone && status.nextBatch.length > 0 && (
        <div className="mb-4 bg-[#FFF5EE] rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-[#8B7E74] mb-1.5">다음 처리 배치 ({status.nextBatch.length}개 패턴)</p>
          <div className="flex flex-wrap gap-1.5">
            {status.nextBatch.map((b) => (
              <span key={`${b.phoneme}|${b.position}|${b.errorType}`}
                className="text-[11px] bg-white border border-[#FFD9B8] text-[#FFB38A] font-bold px-2 py-0.5 rounded-full">
                {b.phoneme} {b.position} {b.errorType}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 버튼 */}
      {!isDone && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={running ? handleStop : handleStart}
            className={`px-6 py-3 rounded-2xl font-black text-sm text-white transition-all ${
              running
                ? "bg-[#EF4444] hover:bg-[#DC2626]"
                : "bg-[#FFB38A] hover:bg-[#FF9A6C]"
            }`}
          >
            {running ? "⏹ 중지" : "▶ 시딩 실행 (3패턴)"}
          </button>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoLoop}
              onChange={(e) => setAutoLoop(e.target.checked)}
              disabled={running}
              className="w-4 h-4 accent-[#FFB38A]"
            />
            <span className="text-sm font-bold text-[#8B7E74]">자동 반복 ({status.remainingPatterns}패턴 끝까지)</span>
          </label>
          {running && (
            <div className="flex items-center gap-1.5 text-xs text-[#FFB38A] font-bold">
              <div className="w-3 h-3 rounded-full border-2 border-[#FFB38A] border-t-transparent animate-spin" />
              처리 중...
            </div>
          )}
        </div>
      )}

      {/* 실행 로그 */}
      {log.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-2xl p-3 max-h-36 overflow-y-auto">
          {log.map((line, i) => (
            <p key={i} className="text-[11px] font-mono text-[#7EDFD0] leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      )}

      {/* 예상 비용 안내 */}
      <p className="text-[10px] text-[#C4B5A8] mt-3 leading-relaxed">
        💡 패턴당 약 2,000~3,000 토큰 사용 · 296패턴 완료 시 약 70~90만 토큰 (Gemini Flash 기준 ~$0.10 이하)
      </p>
    </Card>
  );
}

