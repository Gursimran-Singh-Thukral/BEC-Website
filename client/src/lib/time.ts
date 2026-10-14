const TZ = "Asia/Kolkata";

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: TZ, ...o }).format(d);

export const dayOf = (d: Date) => fmt(d, { day: "2-digit" });
export const monthShort = (d: Date) => fmt(d, { month: "short" }).toUpperCase();
export const timeOf = (d: Date) =>
  fmt(d, { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
export const weekdayDate = (d: Date) =>
  fmt(d, { weekday: "short", day: "numeric", month: "short" });
export const monthYear = (d: Date) => fmt(d, { month: "short", year: "numeric" });
export const fullDateTime = (d: Date) =>
  fmt(d, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
export const shortDateTime = (d: Date) =>
  fmt(d, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });

/** `datetime-local` value (YYYY-MM-DDTHH:mm) in IST for an existing Date. */
export function toISTInput(d: Date | null | undefined): string {
  if (!d) return "";
  const p = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
  return p.replace(" ", "T");
}

/** Parse a `datetime-local` string, interpreting it as IST (UTC+05:30). */
export function fromISTInput(s: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}:00+05:30`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function relativeTime(d: Date, now = new Date()): string {
  const diff = now.getTime() - d.getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days}d ago`;
  return shortDateTime(d);
}

/** Wrapper so server components can read the clock without tripping the render-purity lint. */
export const nowMs = () => Date.now();
