const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const DEV_ADMIN_EMAILS = ["dev@test.com", "admin@test.com"];

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  if (process.env.ALLOW_DEV_LOGIN === "1" && DEV_ADMIN_EMAILS.includes(lower)) {
    return true;
  }
  return ADMIN_EMAILS.includes(lower);
}
