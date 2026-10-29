import "server-only";
import { SignJWT } from "jose";

export class ApiError extends Error {
  constructor(public status: number, public body: { error?: string; fieldErrors?: Record<string, string> }) {
    super(body?.error ?? `API error ${status}`);
  }
}

const DATE_KEYS = new Set(["startsAt", "endsAt", "createdAt", "updatedAt", "lastLoginAt"]);

/** JSON has no Date type, so turn the known timestamp fields back into Date objects. */
export function reviveDates<T>(v: unknown): T {
  if (Array.isArray(v)) return v.map((x) => reviveDates(x)) as T;
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) o[k] = DATE_KEYS.has(k) && typeof val === "string" ? new Date(val) : reviveDates(val);
    return o as T;
  }
  return v as T;
}

export type Claims = { role: "public"; ip?: string } | { role: "admin"; email: string };

function baseUrl() {
  const u = process.env.API_URL?.trim().replace(/\/+$/, "");
  if (!u) throw new Error("API_URL is not set (the address of the BEC API server, e.g. http://localhost:4000)");
  return u;
}

async function mint(c: Claims) {
  const secret = process.env.API_JWT_SECRET;
  if (!secret || secret.length < 24) throw new Error("API_JWT_SECRET is not set (it must match the API server)");
  const jwt = new SignJWT(c.role === "admin" ? { role: "admin" } : { role: "public", ip: c.ip ?? "unknown" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("bec-client")
    .setAudience("bec-api")
    .setIssuedAt()
    .setExpirationTime("60s");
  if (c.role === "admin") jwt.setSubject(c.email);
  return jwt.sign(new TextEncoder().encode(secret));
}

export type CallInit = { method?: string; json?: unknown; body?: BodyInit; headers?: Record<string, string> };

/** Low-level call to the API server. Returns the raw Response (the caller decides how to read it). */
export async function callRaw(c: Claims, path: string, init: CallInit = {}) {
  const extra: Record<string, string> = { ...init.headers };
  let body: BodyInit | undefined = init.body;
  if (init.json !== undefined) {
    extra["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }
  const method = init.method ?? "GET";
  // Free hosting puts the API to sleep when idle; the first request can take ~30-60s while it wakes.
  // Reads are retried (writes are not, to avoid duplicates) and each attempt has a generous timeout.
  const attempts = method === "GET" ? 4 : 1;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      // Fresh token per attempt (they only live 60s and retries can take longer).
      const headers = { ...extra, Authorization: `Bearer ${await mint(c)}` };
      const res = await fetch(`${baseUrl()}${path}`, { method, headers, body, cache: "no-store", signal: AbortSignal.timeout(25_000) });
      if (![502, 503, 504].includes(res.status) || i === attempts - 1) return res;
    } catch (e) {
      lastErr = e;
      if (i === attempts - 1) throw e;
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  throw lastErr;
}

export async function call<T>(c: Claims, path: string, init: CallInit = {}): Promise<T> {
  const res = await callRaw(c, path, init);
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }) ?? {});
  return reviveDates<T>(data);
}
