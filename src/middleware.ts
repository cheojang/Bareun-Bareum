import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 정식 도메인 — 로그인 흐름을 한 호스트에 고정하기 위한 canonical host.
//
// 배경: OAuth(카카오/구글)의 PKCE·state 값은 "로그인을 시작한 호스트"의 쿠키에 저장된다.
// AUTH_URL이 sori-care.com으로 고정돼 콜백(redirect_uri)은 항상 sori-care.com으로 오는데,
// 사용자가 vercel.app 배포 도메인에서 로그인을 시작하면 쿠키는 vercel.app에 저장되고
// 콜백 호스트(sori-care.com)와 달라 쿠키가 유실 → "pkceCodeVerifier value could not be
// parsed" 로 로그인이 실패한다(홈 화면 바로가기가 배포 URL을 가리키는 경우 등).
// → 프로덕션에서는 비정식 호스트로 들어온 요청을 정식 도메인으로 308 리다이렉트해
//    로그인 시작·콜백을 같은 호스트에 두어 이 문제를 근본 차단한다.
const CANONICAL_HOST = "sori-care.com";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");

  // 프로덕션 배포에서만 적용 (프리뷰·로컬은 각자의 호스트 유지)
  if (process.env.VERCEL_ENV === "production" && host && host !== CANONICAL_HOST) {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // 정적 자산·이미지·PWA 파일·크론(머신 호출, 리다이렉트 미추종)은 제외하고 나머지에 적용
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|manifest.json|sw.js|robots.txt|sitemap.xml|api/cron).*)",
  ],
};
