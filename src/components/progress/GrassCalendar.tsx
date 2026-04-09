"use client";

interface GrassCalendarProps {
  data: Record<string, number>; // "2024-01-15" -> count
  weeks?: number;
}

export function GrassCalendar({ data, weeks = 12 }: GrassCalendarProps) {
  const today = new Date();
  const days: { date: string; count: number }[] = [];

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, count: data[key] ?? 0 });
  }

  // Group into weeks (columns)
  const grid: { date: string; count: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    grid.push(days.slice(i, i + 7));
  }

  function getColor(count: number): string {
    if (count === 0) return "#F0E8E0";
    if (count <= 2) return "#FFD4B8";
    if (count <= 5) return "#FFB38A";
    return "#FF8A50";
  }

  function getLabel(count: number): string {
    if (count === 0) return "연습 없음";
    return `${count}개 단어`;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${getLabel(day.count)}`}
                className="grass-cell w-4 h-4"
                style={{ backgroundColor: getColor(day.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-[#8B7E74]">
        <span>적음</span>
        {["#F0E8E0", "#FFD4B8", "#FFB38A", "#FF8A50"].map((c) => (
          <div key={c} className="grass-cell w-4 h-4" style={{ backgroundColor: c }} />
        ))}
        <span>많음</span>
      </div>
    </div>
  );
}
