import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { config } from "./config";
import { db } from "./db";
import { admins, type Admin } from "./db/schema";

/**
 * The website (Next.js on Vercel) is the only caller. It signs a short-lived HS256 token with the secret
 * both sides share:
 *   { role: "public", ip }        - anonymous visitor (ip is forwarded for rate limiting)
 *   { role: "admin", sub: email } - a signed-in admin; the allow-list is re-checked in the database here
 */
export type Claims = { role: "public" | "admin"; sub?: string; ip?: string };

declare module "express-serve-static-core" {
  interface Request {
    claims?: Claims;
    admin?: Admin;
  }
}

let key: Uint8Array | undefined;
const secret = () => (key ??= new TextEncoder().encode(config.apiJwtSecret));

export async function requireService(req: Request, res: Response, next: NextFunction) {
  const h = req.header("authorization") ?? "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"], issuer: "bec-client", audience: "bec-api" });
    req.claims = { role: payload.role === "admin" ? "admin" : "public", sub: payload.sub, ip: typeof payload.ip === "string" ? payload.ip : undefined };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export async function findAdmin(email: string | null | undefined): Promise<Admin | null> {
  if (!email) return null;
  const e = email.trim().toLowerCase();
  if (!e.endsWith(`@${config.adminEmailDomain}`)) return null;
  const [a] = await db.select().from(admins).where(eq(admins.email, e));
  return a ?? null;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.claims?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  const admin = await findAdmin(req.claims.sub);
  if (!admin) return res.status(403).json({ error: "Not an admin" });
  req.admin = admin;
  next();
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (req.admin?.role !== "owner") return res.status(403).json({ error: "Only the owner can do this" });
  next();
}
