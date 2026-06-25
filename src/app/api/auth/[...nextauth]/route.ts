import { handlers } from "@/lib/auth";

// OAuth 콜백은 매 요청마다 신선하게 처리해야 함 — Next.js 캐시 방지
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
