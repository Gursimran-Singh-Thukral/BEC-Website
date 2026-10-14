"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adm, ApiError, toFormState } from "@/lib/api";
import type { AdminFormState } from "@/components/admin/forms";

/* Every action below just relays to the API server, which validates the input and re-checks
   that the caller is an admin. Redirects happen outside try/catch (Next implements them by throwing). */

function raw(fd: FormData): Record<string, string> {
  const o: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") o[k] = v;
  return o;
}
const bool = (fd: FormData, k: string) => fd.get(k) === "on";

async function save(path: string, method: "POST" | "PUT", json: unknown, values: Record<string, string>): Promise<AdminFormState | null> {
  try {
    await adm(path, { method, json });
    return null;
  } catch (e) {
    return toFormState(e, values);
  }
}

const refresh = () => revalidatePath("/", "layout");

/* ---------------------------- Events ---------------------------- */

export async function saveEvent(id: string | null, _prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const r = raw(fd);
  const err = await save(id ? `/admin/events/${id}` : "/admin/events", id ? "PUT" : "POST", { ...r, rsvpOpen: bool(fd, "rsvpOpen") }, r);
  if (err) return err;
  refresh();
  redirect("/admin/events?saved=1");
}

export async function deleteEvent(id: string) {
  await adm(`/admin/events/${id}`, { method: "DELETE" });
  refresh();
  redirect("/admin/events?deleted=1");
}

export async function deleteRsvp(eventId: string, rsvpId: string) {
  await adm(`/admin/events/${eventId}/rsvps/${rsvpId}`, { method: "DELETE" });
  revalidatePath(`/admin/events/${eventId}`);
}

/* ------------------------- Applications ------------------------- */

export async function updateApplication(id: string, _prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const r = raw(fd);
  try {
    await adm(`/admin/applications/${id}`, { method: "PATCH", json: { status: r.status, notes: r.notes ?? "" } });
  } catch (e) {
    return toFormState(e, r);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/applications/${id}?saved=1`);
}

export async function setApplicationStatus(id: string, status: string) {
  await adm(`/admin/applications/${id}`, { method: "PATCH", json: { status } });
  revalidatePath("/admin", "layout");
}

export async function deleteApplication(id: string) {
  await adm(`/admin/applications/${id}`, { method: "DELETE" });
  revalidatePath("/admin", "layout");
  redirect("/admin/applications?deleted=1");
}

/* ------------------------------ Team ----------------------------- */

export async function saveTeamMember(id: string | null, _prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const r = raw(fd);
  const err = await save(id ? `/admin/team/members/${id}` : "/admin/team/members", id ? "PUT" : "POST", { ...r, isLead: bool(fd, "isLead"), active: bool(fd, "active") }, r);
  if (err) return err;
  refresh();
  redirect("/admin/team?saved=1");
}

export async function deleteTeamMember(id: string) {
  await adm(`/admin/team/members/${id}`, { method: "DELETE" });
  refresh();
  redirect("/admin/team?deleted=1");
}

export async function saveVertical(id: string | null, _prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const r = raw(fd);
  const err = await save(id ? `/admin/team/verticals/${id}` : "/admin/team/verticals", id ? "PUT" : "POST", r, r);
  if (err) return err;
  refresh();
  redirect("/admin/team?saved=1");
}

export async function deleteVertical(id: string) {
  await adm(`/admin/team/verticals/${id}`, { method: "DELETE" });
  refresh();
  redirect("/admin/team?deleted=1");
}

/* ---------------------------- Handbooks -------------------------- */

export async function saveHandbook(id: string | null, _prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const r = raw(fd);
  const err = await save(id ? `/admin/handbooks/${id}` : "/admin/handbooks", id ? "PUT" : "POST", { ...r, published: bool(fd, "published") }, r);
  if (err) return err;
  refresh();
  redirect("/admin/handbooks?saved=1");
}

export async function deleteHandbook(id: string) {
  await adm(`/admin/handbooks/${id}`, { method: "DELETE" });
  refresh();
  redirect("/admin/handbooks?deleted=1");
}

/* ----------------------------- Settings -------------------------- */

export async function saveSiteSettings(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const r = raw(fd);
  // Unchecked checkboxes are absent from FormData, so send explicit booleans for the toggles.
  const err = await save("/admin/settings", "PUT", { ...r, coreRecruitment: bool(fd, "coreRecruitment"), cohortRecruitment: bool(fd, "cohortRecruitment") }, r);
  if (err) return err;
  refresh();
  redirect("/admin/settings?saved=1");
}

/* ------------------------------ Admins --------------------------- */

export async function addAdmin(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const r = raw(fd);
  const err = await save("/admin/admins", "POST", r, r);
  if (err) return err;
  revalidatePath("/admin/admins");
  redirect("/admin/admins?saved=1");
}

async function adminAction(path: string, init: Parameters<typeof adm>[1], done: string) {
  try {
    await adm(path, init);
  } catch (e) {
    if (e instanceof ApiError) redirect(`/admin/admins?error=${encodeURIComponent(e.body.error ?? "Failed")}`);
    throw e;
  }
  revalidatePath("/admin/admins");
  redirect(done);
}

export async function removeAdmin(id: string) {
  await adminAction(`/admin/admins/${id}`, { method: "DELETE" }, "/admin/admins?deleted=1");
}

export async function setAdminRole(id: string, role: "owner" | "admin") {
  await adminAction(`/admin/admins/${id}/role`, { method: "PUT", json: { role } }, "/admin/admins?saved=1");
}
