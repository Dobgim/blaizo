/** Formatting helpers. Dates are rendered in a fixed locale so the server
 *  and the client never disagree during hydration. */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-06-14" → "14 Jun 2026". Mono rows, so no comma. */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "—";
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

/** "2026-06-14" → "Jun 2026". Used where the day is noise. */
export function formatMonth(iso: string | null): string {
  if (!iso) return "—";
  const [y, m] = iso.split("-").map(Number);
  if (!y || !m) return "—";
  return `${MONTHS[m - 1]} ${y}`;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US")}`;
}

/** Whole years between a date of birth and today. */
export function ageInYears(dob: string, now = new Date()): number {
  const born = new Date(`${dob}T00:00:00Z`);
  let age = now.getUTCFullYear() - born.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < born.getUTCMonth() ||
    (now.getUTCMonth() === born.getUTCMonth() &&
      now.getUTCDate() < born.getUTCDate());
  if (beforeBirthday) age -= 1;
  return Math.max(age, 0);
}
