import { handlers } from "@/lib/auth";

// OAuth 콜백은 매 요청마다 신선하게 처리해야 함 — Next.js 캐시 방지
export const dynamic = "force-dynamic";

// DB 콜드스타트 + 재시도 백오프가 겹치면 콜백 처리가 Vercel 기본 함수 제한을
// 넘겨 504로 죽는다 → 로그인 실패. 여유 있게 60초로 상향 (플랜 한도 초과 시 자동 클램프).
export const maxDuration = 60;

export const { GET, POST } = handlers;
