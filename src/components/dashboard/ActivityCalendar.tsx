"use client";

import { useMemo, useState } from "react";

type Day = { date: string; count: number };

const WEEKS = 16;
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function getColor(count: number): string {
  if (count === 0) return "#F0E8E0";
  if (count <= 3) return "#FFDBC0";
  if (count <= 7) return "#FFB38A";
  if (count <= 12) return "#FF8A50";
  return "#D96B2D";
}

export function ActivityCalendar({ data }: { data: Day[] }) {
  const [hover, setHover] = useState<Day | null>(null);

  const { grid, months } = useMemo(() => {
    const map = new Map(data.map((d) => [d.date, d.count]));
    const today = new Date();

    const days: Day[] = Array.from({ length: WEEKS * 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (WEEKS * 7 - 1 - i));
      const date = d.toISOString().slice(0, 10);
      return { date, count: map.get(date) ?? 0 };
    });

    // 첫날 요일(일=0)에 맞춰 앞을 패딩
    const firstDow = new Date(days[0].date).getDay();
    const padded: (Day | null)[] = [...Array(firstDow).fill(null), ...days];

    // 7개씩 잘라 주(열) 배열로
    const grid: (Day | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      grid.push(padded.slice(i, i + 7));
    }

    // 월 레이블: 각 주에서 월이 바뀌는 지점
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;
    grid.forEach((week, col) => {
      const first = week.find(Boolean);
      if (!first) return;
      const m = new Date(first.date).getMonth();
      if (m !== lastMonth) {
        months.push({
          label: new Date(first.date).toLocaleDateString("ko-KR", { month: "short" }),
          col,
        });
        lastMonth = m;
      }
    });

    return { grid, months };
  }, [data]);

  const C = 13; // 셀 크기(px)
  const G = 2;  // 간격(px)

  return (
    <div>
      {/* 호버 정보 */}
      <div className="h-5 mb-1">
        {hover?.count ? (
          <p className="text-xs text-[#8B7E74]">
            <span className="font-bold text-[#3D3530]">
              {new Date(hover.date).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
            </span>
            {" "}— 단어 {hover.count}개 연습
          </p>
        ) : (
          <p className="text-[11px] text-[#C4B5A8]">날짜를 눌러 확인해보세요</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <div style={{ display: "inline-block" }}>

          {/* 월 레이블 행 */}
          <div style={{ display: "flex", paddingLeft: 20, gap: G, marginBottom: 3 }}>
            {grid.map((_, i) => {
              const m = months.find((m) => m.col === i);
              return (
                <div key={i} style={{ width: C, flexShrink: 0 }}>
                  {m && <span style={{ fontSize: 9, color: "#C4B5A8" }}>{m.label}</span>}
                </div>
              );
            })}
          </div>

          {/* 요일 레이블 + 셀 그리드 */}
          <div style={{ display: "flex", gap: G }}>

            {/* 요일 레이블 */}
            <div style={{ display: "flex", flexDirection: "column", gap: G, width: 16 }}>
              {DAY_LABELS.map((d, i) => (
                <div
                  key={i}
                  style={{ height: C, display: "flex", alignItems: "center", justifyContent: "flex-end" }}
                >
                  {(i === 1 || i === 3 || i === 5) && (
                    <span style={{ fontSize: 9, color: "#C4B5A8" }}>{d}</span>
                  )}
                </div>
              ))}
            </div>

            {/* 셀 */}
            {grid.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: G }}>
                {Array.from({ length: 7 }, (_, di) => {
                  const day = week[di] ?? null;
                  return (
                    <div
                      key={di}
                      style={{
                        width: C,
                        height: C,
                        borderRadius: 2,
                        backgroundColor: day ? getColor(day.count) : "transparent",
                        cursor: day && day.count > 0 ? "pointer" : "default",
                      }}
                      onMouseEnter={() => day && setHover(day)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => day && setHover(hover?.date === day.date ? null : day)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 6, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "#C4B5A8" }}>적음</span>
        {[0, 3, 7, 12, 15].map((n, i) => (
          <div
            key={i}
            style={{ width: C, height: C, borderRadius: 2, backgroundColor: getColor(n) }}
          />
        ))}
        <span style={{ fontSize: 10, color: "#C4B5A8" }}>많음</span>
      </div>
    </div>
  );
}
