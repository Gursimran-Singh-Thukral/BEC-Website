import express, { Router, type Request, type Response } from "express";
import { and, asc, count, desc, eq, gte, ilike, ne, or, sql, max } from "drizzle-orm";
import { db } from "../db";
import { admins, applications, eventRsvps, events, handbooks, teamMembers, verticals } from "../db/schema";
import { requireOwner } from "../auth";
import { ADMIN_EMAIL_DOMAIN, APPLICATION_KINDS, APPLICATION_STATUSES, kindLabel, statusLabel } from "../lib/constants";
import { csvResponse, toCsv } from "../lib/csv";
import { saveSettings, getSettings, SETTING_FIELDS, type SettingKey } from "../lib/settings";
import { fromISTInput } from "../lib/time";
import { saveUpload } from "../lib/uploads";
import { eventSchema, flattenErrors, handbookSchema, teamSchema, verticalSchema } from "../lib/validation";

export const adminRouter = Router();

const PAGE = 25;
const nullIfEmpty = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);
const q1 = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const bad = (res: Response, fieldErrors: Record<string, string>, error?: string) => res.status(400).json({ fieldErrors, error });

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
async function uniqueSlug(title: string, ignoreId?: string) {
  const base = slugify(title) || "event";
  let slug = base;
  for (let i = 2; ; i++) {
    const [hit] = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug));
    if (!hit || hit.id === ignoreId) return slug;
    slug = `${base}-${i}`;
  }
}
const num = (r: { n: number | string }[] | undefined) => Number(r?.[0]?.n ?? 0);

adminRouter.get("/me", (req, res) => {
  const a = req.admin!;
  res.json({ id: a.id, email: a.email, name: a.name, role: a.role });
});

/* ------------------------------ overview ------------------------------ */

adminRouter.get("/overview", async (req, res) => {
  const now = new Date();
  const [newApps, totalApps, upcomingCount, rsvps, team] = await Promise.all([
    db.select({ n: count() }).from(applications).where(eq(applications.status, "new")),
    db.select({ n: count() }).from(applications),
    db.select({ n: count() }).from(events).where(and(gte(events.startsAt, now), eq(events.status, "published"))),
    db.select({ n: count() }).from(eventRsvps),
    db.select({ n: count() }).from(teamMembers).where(eq(teamMembers.active, true)),
  ]);
  const [upcoming, recent, byKind] = await Promise.all([
    db.select().from(events).where(gte(events.startsAt, now)).orderBy(asc(events.startsAt)).limit(5),
    db.select().from(applications).orderBy(desc(applications.createdAt)).limit(6),
    db.select({ kind: applications.kind, n: count() }).from(applications).where(eq(applications.status, "new")).groupBy(applications.kind),
  ]);
  res.json({
    me: { name: req.admin!.name, email: req.admin!.email },
    newApps: num(newApps), totalApps: num(totalApps), upcomingCount: num(upcomingCount), rsvps: num(rsvps), team: num(team),
    upcoming, recent, byKind: byKind.map((k) => ({ kind: k.kind, n: Number(k.n) })),
  });
});

adminRouter.get("/badge", async (_req, res) => {
  const r = await db.select({ n: count() }).from(applications).where(eq(applications.status, "new"));
  res.json({ newApplications: num(r) });
});

/* ------------------------------- events ------------------------------- */

adminRouter.get("/events", async (req, res) => {
  const conds = [];
  const q = q1(req.query.q);
  if (q) conds.push(or(ilike(events.title, `%${q}%`), ilike(events.venue, `%${q}%`)));
  const status = q1(req.query.status);
  if (status === "draft" || status === "published") conds.push(eq(events.status, status));
  const when = q1(req.query.when);
  if (when === "upcoming") conds.push(sql`${events.startsAt} >= now()`);
  if (when === "past") conds.push(sql`${events.startsAt} < now()`);
  const rows = await db
    .select({ e: events, rsvps: count(eventRsvps.id) })
    .from(events)
    .leftJoin(eventRsvps, eq(eventRsvps.eventId, events.id))
    .where(conds.length ? and(...conds) : undefined)
    .groupBy(events.id)
    .orderBy(desc(events.startsAt));
  res.json({ events: rows.map((r) => ({ ...r.e, rsvps: Number(r.rsvps) })) });
});

adminRouter.get("/events/:id", async (req, res) => {
  const [event] = await db.select().from(events).where(eq(events.id, req.params.id));
  if (!event) return res.status(404).json({ error: "Not found" });
  const rsvps = await db.select().from(eventRsvps).where(eq(eventRsvps.eventId, event.id)).orderBy(asc(eventRsvps.createdAt));
  res.json({ event, rsvps });
});

function parseEvent(body: unknown) {
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return { errors: flattenErrors(parsed.error) };
  const d = parsed.data;
  const startsAt = fromISTInput(d.startsAt);
  if (!startsAt) return { errors: { startsAt: "Enter a valid date and time" } };
  const endsAt = d.endsAt ? fromISTInput(d.endsAt) : null;
  if (endsAt && endsAt < startsAt) return { errors: { endsAt: "End must be after the start" } };
  return {
    d,
    values: {
      title: d.title, type: d.type, summary: d.summary, startsAt, endsAt, venue: d.venue, audience: d.audience,
      posterUrl: nullIfEmpty(d.posterUrl), capacity: d.capacity, rsvpOpen: d.rsvpOpen, status: d.status,
      attendeeCount: d.attendeeCount, highlight: d.highlight,
    },
  };
}

adminRouter.post("/events", async (req, res) => {
  const r = parseEvent(req.body);
  if (!r.values) return bad(res, r.errors!, "Please fix the highlighted fields.");
  const [row] = await db.insert(events).values({ ...r.values, slug: await uniqueSlug(r.d!.title) }).returning();
  res.json({ ok: true, id: row.id });
});

adminRouter.put("/events/:id", async (req, res) => {
  const r = parseEvent(req.body);
  if (!r.values) return bad(res, r.errors!, "Please fix the highlighted fields.");
  await db.update(events).set({ ...r.values, slug: await uniqueSlug(r.d!.title, req.params.id) }).where(eq(events.id, req.params.id));
  res.json({ ok: true });
});

adminRouter.delete("/events/:id", async (req, res) => {
  await db.delete(events).where(eq(events.id, req.params.id));
  res.json({ ok: true });
});

adminRouter.delete("/events/:id/rsvps/:rid", async (req, res) => {
  await db.delete(eventRsvps).where(and(eq(eventRsvps.id, req.params.rid), eq(eventRsvps.eventId, req.params.id)));
  res.json({ ok: true });
});

adminRouter.get("/events/:id/rsvps.csv", async (req, res) => {
  const [ev] = await db.select().from(events).where(eq(events.id, req.params.id));
  if (!ev) return res.status(404).json({ error: "Not found" });
  const rows = await db.select().from(eventRsvps).where(eq(eventRsvps.eventId, ev.id)).orderBy(asc(eventRsvps.createdAt));
  csvResponse(res, `${ev.slug}-rsvps.csv`, toCsv([["Name", "Email", "RSVP time (ISO)"], ...rows.map((r) => [r.name, r.email, r.createdAt.toISOString()])]));
});

/* ---------------------------- applications ---------------------------- */

function appFilters(query: Request["query"]) {
  const conds = [];
  const kind = q1(query.kind);
  if (kind && APPLICATION_KINDS.some((k) => k.value === kind)) conds.push(eq(applications.kind, kind));
  const status = q1(query.status);
  if (status && APPLICATION_STATUSES.some((s) => s.value === status)) conds.push(eq(applications.status, status));
  const q = q1(query.q);
  if (q) conds.push(or(ilike(applications.name, `%${q}%`), ilike(applications.email, `%${q}%`), ilike(applications.branch, `%${q}%`)));
  return conds.length ? and(...conds) : undefined;
}

adminRouter.get("/applications.csv", async (req, res) => {
  const rows = await db.select().from(applications).where(appFilters(req.query)).orderBy(desc(applications.createdAt));
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r.answers)))].sort();
  const header = ["Received (ISO)", "Type", "Status", "Name", "Email", "Phone", "Branch", "Year", ...keys, "Notes", "Reviewed by"];
  const body = rows.map((r) => [
    r.createdAt.toISOString(), kindLabel(r.kind), statusLabel(r.status), r.name, r.email, r.phone, r.branch, r.year,
    ...keys.map((k) => r.answers[k] ?? ""), r.notes, r.reviewedBy,
  ]);
  csvResponse(res, `bec-applications-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([header, ...body]));
});

adminRouter.get("/applications", async (req, res) => {
  const where = appFilters(req.query);
  const page = Math.max(1, Number.parseInt(q1(req.query.page) ?? "1", 10) || 1);
  const [{ n: total }] = await db.select({ n: count() }).from(applications).where(where);
  const rows = await db.select().from(applications).where(where).orderBy(desc(applications.createdAt)).limit(PAGE).offset((page - 1) * PAGE);
  const counts = await db.select({ s: applications.status, n: count() }).from(applications).groupBy(applications.status);
  res.json({
    rows, total: Number(total), page, pages: Math.max(1, Math.ceil(Number(total) / PAGE)),
    counts: Object.fromEntries(counts.map((c) => [c.s, Number(c.n)])),
  });
});

adminRouter.get("/applications/:id", async (req, res) => {
  const [a] = await db.select().from(applications).where(eq(applications.id, req.params.id));
  if (!a) return res.status(404).json({ error: "Not found" });
  res.json({ application: a });
});

adminRouter.patch("/applications/:id", async (req, res) => {
  const status = String(req.body?.status ?? "");
  if (!APPLICATION_STATUSES.some((s) => s.value === status)) return res.status(400).json({ error: "Invalid status" });
  const patch: { status: string; reviewedBy: string; notes?: string } = { status, reviewedBy: req.admin!.email };
  if (typeof req.body?.notes === "string") patch.notes = req.body.notes.slice(0, 5000);
  await db.update(applications).set(patch).where(eq(applications.id, req.params.id));
  res.json({ ok: true });
});

adminRouter.delete("/applications/:id", async (req, res) => {
  await db.delete(applications).where(eq(applications.id, req.params.id));
  res.json({ ok: true });
});

/* -------------------------------- team -------------------------------- */

adminRouter.get("/team", async (_req, res) => {
  const [members, vs] = await Promise.all([
    db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder), asc(teamMembers.name)),
    db.select().from(verticals).orderBy(asc(verticals.sortOrder), asc(verticals.name)),
  ]);
  res.json({ members, verticals: vs });
});

adminRouter.get("/team/members/:id", async (req, res) => {
  const [m] = await db.select().from(teamMembers).where(eq(teamMembers.id, req.params.id));
  if (!m) return res.status(404).json({ error: "Not found" });
  res.json({ member: m });
});

function parseMember(body: unknown) {
  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) return { errors: flattenErrors(parsed.error) };
  const d = parsed.data;
  return {
    values: {
      name: d.name, group: d.group, role: d.role, verticalId: nullIfEmpty(d.verticalId), isLead: d.isLead,
      branchYear: d.branchYear, bio: d.bio, topics: d.topics.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
      email: nullIfEmpty(d.email), linkedin: nullIfEmpty(d.linkedin), office: nullIfEmpty(d.office),
      photoUrl: nullIfEmpty(d.photoUrl), sortOrder: d.sortOrder, active: d.active,
    },
  };
}

adminRouter.post("/team/members", async (req, res) => {
  const r = parseMember(req.body);
  if (!r.values) return bad(res, r.errors!, "Please fix the highlighted fields.");
  await db.insert(teamMembers).values(r.values);
  res.json({ ok: true });
});
adminRouter.put("/team/members/:id", async (req, res) => {
  const r = parseMember(req.body);
  if (!r.values) return bad(res, r.errors!, "Please fix the highlighted fields.");
  await db.update(teamMembers).set(r.values).where(eq(teamMembers.id, req.params.id));
  res.json({ ok: true });
});
adminRouter.delete("/team/members/:id", async (req, res) => {
  await db.delete(teamMembers).where(eq(teamMembers.id, req.params.id));
  res.json({ ok: true });
});

adminRouter.get("/team/verticals/:id", async (req, res) => {
  const [v] = await db.select().from(verticals).where(eq(verticals.id, req.params.id));
  if (!v) return res.status(404).json({ error: "Not found" });
  res.json({ vertical: v });
});
adminRouter.post("/team/verticals", async (req, res) => {
  const p = verticalSchema.safeParse(req.body);
  if (!p.success) return bad(res, flattenErrors(p.error));
  await db.insert(verticals).values(p.data);
  res.json({ ok: true });
});
adminRouter.put("/team/verticals/:id", async (req, res) => {
  const p = verticalSchema.safeParse(req.body);
  if (!p.success) return bad(res, flattenErrors(p.error));
  await db.update(verticals).set(p.data).where(eq(verticals.id, req.params.id));
  res.json({ ok: true });
});
adminRouter.delete("/team/verticals/:id", async (req, res) => {
  await db.delete(verticals).where(eq(verticals.id, req.params.id));
  res.json({ ok: true });
});

/* ------------------------------ handbooks ------------------------------ */

adminRouter.get("/handbooks", async (_req, res) => {
  const rows = await db.select().from(handbooks).orderBy(asc(handbooks.volume));
  const [m] = await db.select({ m: max(handbooks.volume) }).from(handbooks);
  res.json({ handbooks: rows, nextVolume: (m?.m ?? 0) + 1 });
});
adminRouter.get("/handbooks/:id", async (req, res) => {
  const [b] = await db.select().from(handbooks).where(eq(handbooks.id, req.params.id));
  if (!b) return res.status(404).json({ error: "Not found" });
  res.json({ handbook: b });
});

async function parseHandbook(body: unknown, id: string | null) {
  const parsed = handbookSchema.safeParse(body);
  if (!parsed.success) return { errors: flattenErrors(parsed.error) };
  const d = parsed.data;
  const [dupe] = await db
    .select({ id: handbooks.id })
    .from(handbooks)
    .where(id ? and(eq(handbooks.volume, d.volume), ne(handbooks.id, id)) : eq(handbooks.volume, d.volume));
  if (dupe) return { errors: { volume: "Another handbook already uses this volume number" } };
  return {
    values: {
      volume: d.volume, title: d.title, description: d.description, bestFor: d.bestFor, pages: d.pages,
      readMinutes: d.readMinutes, readUrl: nullIfEmpty(d.readUrl), pdfUrl: nullIfEmpty(d.pdfUrl),
      chapters: d.chapters.split("\n").map((c) => c.trim()).filter(Boolean).slice(0, 30), published: d.published,
    },
  };
}
adminRouter.post("/handbooks", async (req, res) => {
  const r = await parseHandbook(req.body, null);
  if (!r.values) return bad(res, r.errors!, "Please fix the highlighted fields.");
  await db.insert(handbooks).values(r.values);
  res.json({ ok: true });
});
adminRouter.put("/handbooks/:id", async (req, res) => {
  const r = await parseHandbook(req.body, req.params.id);
  if (!r.values) return bad(res, r.errors!, "Please fix the highlighted fields.");
  await db.update(handbooks).set(r.values).where(eq(handbooks.id, req.params.id));
  res.json({ ok: true });
});
adminRouter.delete("/handbooks/:id", async (req, res) => {
  await db.delete(handbooks).where(eq(handbooks.id, req.params.id));
  res.json({ ok: true });
});

/* ------------------------------- settings ------------------------------ */

adminRouter.get("/settings", async (_req, res) => {
  res.json({ settings: await getSettings() });
});
adminRouter.put("/settings", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const out: Partial<Record<SettingKey, string>> = {};
  for (const f of SETTING_FIELDS) {
    out[f.key] = f.type === "toggle" ? (body[f.key] === true || body[f.key] === "on" ? "open" : "closed") : String(body[f.key] ?? "").trim().slice(0, 600);
  }
  if (out.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.contactEmail)) return bad(res, { contactEmail: "Enter a valid email address" });
  for (const k of ["instagram", "linkedin", "youtube"] as const) {
    if (out[k] && !/^https?:\/\//i.test(out[k]!)) return bad(res, { [k]: "Must start with http:// or https://" });
  }
  await saveSettings(out);
  res.json({ ok: true });
});

/* -------------------------------- admins ------------------------------- */

adminRouter.get("/admins", requireOwner, async (_req, res) => {
  res.json({ admins: await db.select().from(admins).orderBy(asc(admins.createdAt)) });
});
adminRouter.post("/admins", requireOwner, async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  if (!email.endsWith(`@${ADMIN_EMAIL_DOMAIN}`) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(res, { email: `Must be an @${ADMIN_EMAIL_DOMAIN} address` });
  const [exists] = await db.select().from(admins).where(eq(admins.email, email));
  if (exists) return bad(res, { email: "Already an admin" });
  await db.insert(admins).values({ email, name: String(req.body?.name ?? "").trim().slice(0, 120), role: "admin" });
  res.json({ ok: true });
});
adminRouter.delete("/admins/:id", requireOwner, async (req, res) => {
  const id = String(req.params.id);
  if (id === req.admin!.id) return res.status(400).json({ error: "You cannot remove yourself" });
  await db.delete(admins).where(eq(admins.id, id));
  res.json({ ok: true });
});
adminRouter.put("/admins/:id/role", requireOwner, async (req, res) => {
  const role = req.body?.role === "owner" ? "owner" : "admin";
  const id = String(req.params.id);
  if (id === req.admin!.id && role !== "owner") return res.status(400).json({ error: "You cannot demote yourself" });
  await db.update(admins).set({ role }).where(eq(admins.id, id));
  res.json({ ok: true });
});

/* ------------------------------- uploads ------------------------------- */

adminRouter.post("/uploads", express.raw({ type: () => true, limit: "26mb" }), async (req, res) => {
  const buf = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  if (!buf.length) return res.status(400).json({ error: "No file" });
  const r = await saveUpload(buf);
  if ("error" in r) return res.status(400).json(r);
  res.json(r);
});
