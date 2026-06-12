const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

// 개발 로그인 계정 — ALLOW_DEV_LOGIN=1 환경에서만 관리자 권한 부여
const DEV_ADMIN_EMAILS = ["dev@test.com", "admin@test.com"];

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  if (process.env.ALLOW_DEV_LOGIN === "1" && DEV_ADMIN_EMAILS.includes(email)) {
    return true;
  }
  return ADMIN_EMAILS.includes(email);
}
