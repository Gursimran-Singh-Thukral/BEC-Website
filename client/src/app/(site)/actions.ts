"use server";

import { pub, toFormState, type FormState } from "@/lib/api";

export type { FormState };

function toObject(fd: FormData): Record<string, string> {
  const o: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") o[k] = v;
  return o;
}

/** Validation, rate limiting and storage all happen in the API server; this just relays the form. */
export async function submitApplication(_prev: FormState, fd: FormData): Promise<FormState> {
  const raw = toObject(fd);
  try {
    const r = await pub<{ ok: boolean; name?: string }>("/public/applications", { method: "POST", json: raw });
    return { ok: true, name: r.name };
  } catch (e) {
    return toFormState(e, raw);
  }
}

export async function submitRsvp(_prev: FormState, fd: FormData): Promise<FormState> {
  const raw = toObject(fd);
  try {
    const r = await pub<{ ok: boolean; name?: string }>("/public/rsvps", { method: "POST", json: raw });
    return { ok: true, name: r.name };
  } catch (e) {
    return toFormState(e, raw);
  }
}
