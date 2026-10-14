import clsx, { type ClassValue } from "clsx";

export const cn = (...v: ClassValue[]) => clsx(v);

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "B";
  const a = parts[0][0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

/** Only allow http(s) / mailto / site-relative links in user-provided URLs. */
export function safeUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  const t = u.trim();
  if (!t) return null;
  if (t.startsWith("/") && !t.startsWith("//")) return t;
  try {
    const p = new URL(t);
    return ["http:", "https:", "mailto:"].includes(p.protocol) ? t : null;
  } catch {
    return null;
  }
}

export const GRADIENTS = [
  "linear-gradient(140deg, #4DB6FF, #1E3A8A)",
  "linear-gradient(140deg, #1E3A8A, #111829)",
  "linear-gradient(140deg, #DBEFFF, #4DB6FF)",
  "linear-gradient(140deg, #2B7FE0, #16285F)",
];

export const CARD_BGS = [
  "radial-gradient(circle at 100% 0%, rgba(77,182,255,0.6), rgba(77,182,255,0) 55%), linear-gradient(160deg, #1E3A8A, #111829)",
  "radial-gradient(circle at 0% 100%, rgba(77,182,255,0.55), rgba(77,182,255,0) 55%), linear-gradient(160deg, #111829, #1E3A8A)",
  "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.4), rgba(255,255,255,0) 50%), linear-gradient(160deg, #4DB6FF, #1E3A8A)",
  "radial-gradient(circle at 50% 110%, rgba(77,182,255,0.6), rgba(77,182,255,0) 55%), linear-gradient(160deg, #16285F, #111829)",
];
