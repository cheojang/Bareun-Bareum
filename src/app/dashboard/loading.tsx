import { MascotLoader } from "@/components/ui/MascotLoader";

// Dashboard 전역 로딩 — 라우트 전환/데이터 로딩 시 즉시 표시되어
// "버튼 눌러도 멈춰있는" 체감을 없앤다. 하위 모든 dashboard 라우트에 적용됨.
// 소리새 마스코트가 좌우·상하로 날아다니며 기다리는 동안 지루하지 않게 한다.
export default function DashboardLoading() {
  return <MascotLoader message="소리새가 준비하고 있어요..." />;
}
