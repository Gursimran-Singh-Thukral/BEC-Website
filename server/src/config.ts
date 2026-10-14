/** All configuration comes from environment variables (see .env.example). */

const num = (v: string | undefined, d: number) => (v && Number.isFinite(Number(v)) ? Number(v) : d);

export const config = {
  port: num(process.env.PORT, 4000),
  isProd: process.env.NODE_ENV === "production",
  /** Postgres connection string. When unset, an embedded Postgres (PGlite) is used for local development. */
  databaseUrl: process.env.DATABASE_URL?.trim() || "",
  /** Max simultaneous Postgres connections (lower this on free tiers with small connection limits). */
  poolMax: num(process.env.DATABASE_POOL_MAX, 10),
  /** Where the embedded dev database keeps its files. */
  pgliteDir: process.env.PGLITE_DIR?.trim() || "./data/pglite",
  /** Shared with the client (Vercel): signs the short-lived tokens the website uses to call this API. */
  apiJwtSecret: process.env.API_JWT_SECRET?.trim() || "",
  /** Comma-separated @iitjammu.ac.in accounts; the first is the owner. Seeded on every start-up. */
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  adminEmailDomain: "iitjammu.ac.in",
};

export function assertConfig() {
  if (!config.apiJwtSecret || config.apiJwtSecret.length < 24) {
    throw new Error("API_JWT_SECRET must be set (at least 24 characters). Generate one with: openssl rand -base64 32");
  }
  if (config.isProd && !config.databaseUrl) {
    throw new Error("DATABASE_URL must be set in production (a Postgres connection string).");
  }
}
