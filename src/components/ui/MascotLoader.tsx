"use client";

import { SoriMascot } from "./SoriMascot";

/**
 * 소리새 로딩 화면 — 화면 전환/데이터 로딩 시 표시.
 * 파란새 마스코트가 좌우로 왔다갔다 + 위아래로 날아다니고(mascot-fly),
 * 그 위로 빙글빙글 도는 점선 링 스피너(mascot-spin)가 함께 돈다.
 * 정적 스켈레톤보다 "살아있는" 느낌을 줘 체감 대기시간을 줄인다.
 */
export function MascotLoader({
  message = "불러오는 중...",
  fullScreen = true,
}: {
  message?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 ${
        fullScreen ? "min-h-[60vh]" : "py-16"
      }`}
    >
      {/* 비행 무대 — 마스코트가 이 안에서 좌우·상하로 날아다님 */}
      <div className="relative" style={{ width: 220, height: 150 }}>
        {/* 반짝이는 배경 점들 */}
        <span
          className="absolute left-3 top-4 text-lg"
          style={{ animation: "mascot-twinkle 2.2s ease-in-out infinite" }}
        >
          ✨
        </span>
        <span
          className="absolute right-4 top-8 text-base"
          style={{ animation: "mascot-twinkle 2.6s ease-in-out infinite 0.4s" }}
        >
          ⭐
        </span>
        <span
          className="absolute right-8 bottom-10 text-sm"
          style={{ animation: "mascot-twinkle 2.4s ease-in-out infinite 0.9s" }}
        >
          ✨
        </span>

        {/* 빙글빙글 도는 점선 링 — 중앙 고정 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="mascot-spin rounded-full"
            style={{
              width: 120,
              height: 120,
              border: "4px dashed #FFD9C0",
              borderTopColor: "#FFB38A",
            }}
          />
        </div>

        {/* 날아다니는 마스코트 — 링 위로 겹쳐서 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mascot-fly">
            <SoriMascot size={84} variant="full" animated />
          </div>
        </div>

        {/* 바닥 그림자 */}
        <div
          className="mascot-shadow absolute left-1/2 bottom-1"
          style={{
            width: 70,
            height: 12,
            marginLeft: -35,
            borderRadius: "50%",
            background: "#5A8CB4",
          }}
        />
      </div>

      <p className="text-sm font-bold text-[#8B7E74] animate-pulse">{message}</p>
    </div>
  );
}
