export function MascotCharacter({
  level,
  animated = false,
}: {
  level: number;
  animated?: boolean;
}) {
  const stages = [
    { emoji: "🥚", label: "알", color: "#FFD4B8" },
    { emoji: "🐣", label: "병아리", color: "#FFB38A" },
    { emoji: "🐥", label: "꼬마 새", color: "#FDE68A" },
    { emoji: "🐤", label: "새", color: "#7EDFD0" },
    { emoji: "🦅", label: "독수리", color: "#C4B5FD" },
  ];

  const stage = stages[Math.min(level - 1, 4)];

  return (
    <div className={`flex flex-col items-center gap-2 ${animated ? "animate-float" : ""}`}>
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
        style={{
          background: `radial-gradient(circle at 35% 35%, white, ${stage.color})`,
          boxShadow: `0 8px 32px ${stage.color}80`,
        }}
      >
        {stage.emoji}
      </div>
      <div
        className="px-3 py-1 rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: stage.color, color: "#3D3530" }}
      >
        Lv.{level} {stage.label}
      </div>
    </div>
  );
}
