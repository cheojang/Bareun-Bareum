const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const DEV_ADMIN_EMAILS = ["dev@test.com", "admin@test.com"];

// 서비스 소유자 — 구글/카카오 소셜 로그인 시 이 이메일이면 관리자 패널 접근 허용
const OWNER_ADMIN_EMAILS = ["cheojang@gmail.com"];

// ⚠️ 강제 등록된 관리자 계정 (seed-accounts 엔드포인트로 생성).
// 공용 약한 비밀번호(admin123!@#)를 쓰므로 관리자 패널이 노출될 수 있음 —
// 운영 안정화 후에는 이 목록을 비우고 강한 비밀번호 계정만 ADMIN_EMAILS(env)로 관리 권장.
const SEEDED_ADMIN_EMAILS = ["admin2@admin.com", "admin3@admin.com"];

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  if (process.env.ALLOW_DEV_LOGIN === "1" && DEV_ADMIN_EMAILS.includes(lower)) {
    return true;
  }
  if (OWNER_ADMIN_EMAILS.includes(lower)) return true;
  if (SEEDED_ADMIN_EMAILS.includes(lower)) return true;
  return ADMIN_EMAILS.includes(lower);
}
