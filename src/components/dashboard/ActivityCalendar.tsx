"use client";

import { useMemo, useState } from "react";

type Day = { date: string; count: number };

const TOTAL_DAYS = 14; // 2주

// 연습 여부만 표시: 안 함(연한 회색) / 함(주황)
function getColor(count: number): string {
  return count > 0 ? "#FFB38A" : "#F0E8E0";
}

export function ActivityCalendar({ data }: { data: Day[] }) {
  const [hover, setHover] = useState<Day | null>(null);

  // 최근 28일을 한 줄 배열로 (오래된 → 최신)
  const days = useMemo(() => {
    const map = new Map(data.map((d) => [d.date, d.count]));
    const today = new Date();
    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (TOTAL_DAYS - 1 - i));
      const date = d.toISOString().slice(0, 10);
      return { date, count: map.get(date) ?? 0 };
    });
  }, [data]);

  const firstLabel = new Date(days[0].date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  const lastLabel = new Date(days[days.length - 1].date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });

  return (
    <div>
      {/* 호버 정보 */}
      <div className="h-5 mb-2">
        {hover ? (
          <p className="text-xs text-[#8B7E74]">
            <span className="font-bold text-[#3D3530]">
              {new Date(hover.date).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
            </span>
            {" — "}
            {hover.count > 0 ? "출석" : "미출석"}
          </p>
        ) : (
          <p className="text-[11px] text-[#C4B5A8]">날짜를 눌러 확인해보세요</p>
        )}
      </div>

      {/* 셀 28개 가로 한 줄 (균등 분배, 스크롤 없음) */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${TOTAL_DAYS}, minmax(0, 1fr))` }}
      >
        {days.map((day) => (
          <div
            key={day.date}
            className="w-full aspect-square rounded transition-transform hover:scale-110 cursor-pointer"
            style={{ backgroundColor: getColor(day.count) }}
            onMouseEnter={() => setHover(day)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setHover(hover?.date === day.date ? null : day)}
          />
        ))}
      </div>

      {/* 시작·끝 날짜 라벨 */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-[#C4B5A8]">{firstLabel}</span>
        <span className="text-[10px] text-[#C4B5A8]">{lastLabel}</span>
      </div>
    </div>
  );
}
