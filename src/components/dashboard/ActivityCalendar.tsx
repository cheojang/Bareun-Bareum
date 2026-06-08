"use client";

import { useMemo, useState } from "react";

type Day = { date: string; count: number };

const TOTAL_DAYS = 14;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export function ActivityCalendar({ data }: { data: Day[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const { days, todayStr } = useMemo(() => {
    const map = new Map(data.map((d) => [d.date, d.count]));

    // 클라이언트 기준 오늘 날짜 (KST)
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const todayStr = kst.toISOString().slice(0, 10);

    const days = Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const d = new Date(kst);
      d.setDate(kst.getDate() - (TOTAL_DAYS - 1 - i));
      const date = d.toISOString().slice(0, 10);
      const [, m, dd] = date.split("-").map(Number);
      return {
        date,
        count: map.get(date) ?? 0,
        dow: d.getDay(),   // 0=일 ~ 6=토
        dayNum: dd,
        month: m,
      };
    });

    return { days, todayStr };
  }, [data]);

  const row1 = days.slice(0, 7);  // 지난주
  const row2 = days.slice(7);     // 이번주

  const selectedDay = selected ? days.find((d) => d.date === selected) : null;

  const renderCell = (day: (typeof days)[0]) => {
    const isToday = day.date === todayStr;
    const practiced = day.count > 0;
    const isSelected = selected === day.date;

    return (
      <button
        key={day.date}
        onClick={() => setSelected(isSelected ? null : day.date)}
        className="flex flex-col items-center gap-0.5 group"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <div
          className="w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-95"
          style={{
            backgroundColor: practiced ? "#FFB38A" : "#F0E8E0",
            color: practiced ? "#fff" : "#C4B5A8",
            fontWeight: 700,
            fontSize: "clamp(9px, 2.2vw, 12px)",
            boxShadow: practiced
              ? "0 2px 8px rgba(255,179,138,0.45)"
              : isToday
              ? "0 0 0 2px #FFB38A inset"
              : "none",
            outline: isToday && !practiced ? "2px solid #FFB38A" : isSelected ? "2px solid #FF8A50" : "none",
            outlineOffset: "1px",
          }}
        >
          {day.dayNum}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-1.5">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 px-0.5">
        {row1.map((day) => (
          <div
            key={day.date}
            className="text-center font-extrabold"
            style={{
              fontSize: "clamp(8px, 2vw, 11px)",
              color: day.dow === 0 ? "#FCA5A5" : day.dow === 6 ? "#93C5FD" : "#C4B5A8",
            }}
          >
            {DOW[day.dow]}
          </div>
        ))}
      </div>

      {/* 지난주 */}
      <div className="grid grid-cols-7 gap-1">
        {row1.map(renderCell)}
      </div>

      {/* 이번주 */}
      <div className="grid grid-cols-7 gap-1">
        {row2.map(renderCell)}
      </div>

      {/* 선택 툴팁 */}
      <div className="h-5 mt-0.5 px-0.5">
        {selectedDay ? (
          <p className="text-[11px] text-[#8B7E74] animate-fade-in">
            <span className="font-bold text-[#3D3530]">
              {selectedDay.month}월 {selectedDay.dayNum}일
            </span>
            {" — "}
            {selectedDay.count > 0
              ? <span className="text-[#FFB38A] font-semibold">{selectedDay.count}회 연습 ✅</span>
              : <span className="text-[#C4B5A8]">연습 안 했어요</span>}
          </p>
        ) : (
          <p className="text-[10px] text-[#C4B5A8]">날짜를 탭하면 자세히 볼 수 있어요</p>
        )}
      </div>
    </div>
  );
}
