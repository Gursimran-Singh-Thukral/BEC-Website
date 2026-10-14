/** Parse a `datetime-local` string (YYYY-MM-DDTHH:mm), interpreting it as IST (UTC+05:30). */
export function fromISTInput(s: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}:00+05:30`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** An event stays "upcoming" for 3 hours after it starts. */
export const GRACE_MS = 3 * 60 * 60 * 1000;
