import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApiError, call, callRaw, type CallInit } from "./api-core";

export { ApiError };

export type FormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** echoed back so the form can keep what the user typed after a failed submit */
  values?: Record<string, string>;
  name?: string;
};

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Anonymous call for public pages and forms. */
export async function pub<T>(path: string, init?: CallInit): Promise<T> {
  return call<T>({ role: "public", ip: await clientIp() }, path, init);
}

async function adminEmail() {
  const email = (await auth())?.user?.email?.toLowerCase();
  if (!email) redirect("/admin/login");
  return email;
}

/** Call made on behalf of the signed-in admin. The API re-checks the allow-list on every request. */
export async function adm<T>(path: string, init?: CallInit): Promise<T> {
  const email = await adminEmail();
  try {
    return await call<T>({ role: "admin", email }, path, init);
  } catch (e) {
    if (e instanceof ApiError && e.status === 403) {
      // Signed in as an admin but this page is owner-only: back to the dashboard. Otherwise: not an admin.
      redirect(e.body.error === "Only the owner can do this" ? "/admin" : "/admin/login");
    }
    throw e;
  }
}

/** Raw (non-JSON) admin call for downloads. Returns a 401 Response instead of redirecting. */
export async function admRaw(path: string, init?: CallInit) {
  const email = (await auth())?.user?.email?.toLowerCase();
  if (!email) return new Response("Unauthorised", { status: 401 });
  return callRaw({ role: "admin", email }, path, init);
}

/** Turn an API error into the state object the forms understand. Redirects (thrown by Next) pass through. */
export function toFormState(e: unknown, values?: Record<string, string>): FormState {
  if (e instanceof ApiError) return { ok: false, error: e.body.error, fieldErrors: e.body.fieldErrors, values };
  if (typeof (e as { digest?: unknown })?.digest === "string" && (e as { digest: string }).digest.startsWith("NEXT_")) throw e;
  console.error(e);
  return { ok: false, error: "Could not reach the server. Please try again in a moment.", values };
}
