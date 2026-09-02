/**
 * Recognized admin emails.
 * Supports pivon.agency@gmail.com, admin@pivon.ai, and any custom ADMIN_EMAIL environment variable.
 */
export const ADMIN_EMAILS: string[] = [
  "pivon.agency@gmail.com",
  "admin@pivon.ai",
  process.env.ADMIN_EMAIL,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
]
  .filter((e): e is string => typeof e === "string" && e.trim().length > 0)
  .map((e) => e.toLowerCase().trim());

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(normalized);
}
