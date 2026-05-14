"use client";

import { useState, useEffect, useCallback } from "react";

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

      {/* ── 시딩 바로가기 ────────────────────────────────────────── */}
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
          <SeedingButtons />
        </div>
      </Card>
    </div>
  );
}

// ─── 시딩 버튼 ───────────────────────────────────────────────────
function SeedingButtons() {
  const [tmplStatus, setTmplStatus] = useState<{ done: number; remaining: number } | null>(null);
  const [wordStatus, setWordStatus] = useState<{ seeded: number; remaining: number } | null>(null);
  const [running, setRunning] = useState<"tmpl" | "word" | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/seed-templates").then((r) => r.json()),
      fetch("/api/admin/seed-word-pairs").then((r) => r.json()),
    ]).then(([t, w]) => {
      setTmplStatus({ done: t.done, remaining: t.remaining });
      setWordStatus({ seeded: w.seeded, remaining: w.remaining });
    }).catch(() => {});
  }, []);

  async function runSeed(type: "tmpl" | "word") {
    setRunning(type);
    setMsg("");
    try {
      const url = type === "tmpl"
        ? "/api/admin/seed-templates"
        : "/api/admin/seed-word-pairs";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 20 }),
      });
      const data = await res.json();
      if (type === "tmpl") {
        setMsg(`음소 템플릿: ${data.success ?? 0}개 생성 완료 (남은 수: ${data.totalRemaining ?? "?"})`);
        setTmplStatus({ done: data.totalDone ?? 0, remaining: data.totalRemaining ?? 0 });
      } else {
        setMsg(`단어쌍: ${data.fromTemplate ?? 0}개 시딩 완료 (남은 수: ${data.totalRemaining ?? "?"})`);
        setWordStatus({ seeded: data.totalSeeded ?? 0, remaining: data.totalRemaining ?? 0 });
      }
    } catch {
      setMsg("실행 중 오류가 발생했어요.");
    } finally {
      setRunning(null);
    }
  }

  return (
    <>
      <button
        onClick={() => runSeed("tmpl")}
        disabled={running !== null}
        className="px-4 py-2 rounded-2xl text-sm font-bold text-[#8B7EFF] bg-[#F5F3FF] hover:bg-[#EDE9FE] transition-colors disabled:opacity-50"
      >
        {running === "tmpl" ? "생성 중..." : `🧬 음소 템플릿 시딩`}
        {tmplStatus && (
          <span className="ml-1 text-[10px] font-normal opacity-70">
            ({tmplStatus.done}/{tmplStatus.done + tmplStatus.remaining})
          </span>
        )}
      </button>
      <button
        onClick={() => runSeed("word")}
        disabled={running !== null}
        className="px-4 py-2 rounded-2xl text-sm font-bold text-[#0D9488] bg-[#F0FAF8] hover:bg-[#CCFBF1] transition-colors disabled:opacity-50"
      >
        {running === "word" ? "시딩 중..." : `📚 단어쌍 캐시 시딩`}
        {wordStatus && (
          <span className="ml-1 text-[10px] font-normal opacity-70">
            ({wordStatus.seeded}/{wordStatus.seeded + wordStatus.remaining})
          </span>
        )}
      </button>
      {msg && (
        <p className="w-full text-xs text-[#0D9488] font-semibold mt-1">{msg}</p>
      )}
    </>
  );
}
