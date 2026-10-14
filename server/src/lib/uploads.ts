import crypto from "node:crypto";
import { db } from "../db";
import { files } from "../db/schema";

export const ALLOWED_UPLOADS: Record<string, { ext: string; max: number }> = {
  "image/jpeg": { ext: "jpg", max: 6 * 1024 * 1024 },
  "image/png": { ext: "png", max: 6 * 1024 * 1024 },
  "image/webp": { ext: "webp", max: 6 * 1024 * 1024 },
  "application/pdf": { ext: "pdf", max: 25 * 1024 * 1024 },
};

/** Check the file's magic bytes so a renamed .exe can't masquerade as an image. */
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (buf.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  return null;
}

export async function saveUpload(buf: Buffer): Promise<{ url: string } | { error: string }> {
  const mime = sniff(buf);
  if (!mime) return { error: "Unsupported file. Use JPG, PNG, WebP or PDF." };
  const rule = ALLOWED_UPLOADS[mime];
  if (buf.length > rule.max) return { error: `File is too large (max ${Math.round(rule.max / 1024 / 1024)} MB).` };
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.${rule.ext}`;
  await db.insert(files).values({ name, mime, size: buf.length, data: buf });
  // Served by the website at /uploads/<name> (it proxies to this API).
  return { url: `/uploads/${name}` };
}
