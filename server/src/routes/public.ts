import { Router } from "express";
import { and, asc, count, desc, eq, gte, inArray, lt } from "drizzle-orm";
import { db } from "../db";
import { applications, eventRsvps, events, handbooks, teamMembers, verticals, type Event } from "../db/schema";
import { getSettings } from "../lib/settings";
import { rateLimit } from "../lib/rate-limit";
import { GRACE_MS } from "../lib/time";
import { flattenErrors, publicForms, type PublicKind } from "../lib/validation";

export const publicRouter = Router();

export type EventWithSeats = Event & { rsvpCount: number; seatsLeft: number | null };

async function withSeats(list: Event[]): Promise<EventWithSeats[]> {
  if (!list.length) return [];
  const rows = await db
    .select({ id: eventRsvps.eventId, n: count() })
    .from(eventRsvps)
    .where(inArray(eventRsvps.eventId, list.map((e) => e.id)))
    .groupBy(eventRsvps.eventId);
  const counts = new Map(rows.map((r) => [r.id, Number(r.n)]));
  return list.map((e) => {
    const rsvpCount = counts.get(e.id) ?? 0;
    return { ...e, rsvpCount, seatsLeft: e.capacity == null ? null : Math.max(0, e.capacity - rsvpCount) };
  });
}

const cutoff = () => new Date(Date.now() - GRACE_MS);

async function upcoming() {
  const list = await db
    .select()
    .from(events)
    .where(and(eq(events.status, "published"), gte(events.startsAt, cutoff())))
    .orderBy(asc(events.startsAt));
  return withSeats(list);
}

publicRouter.get("/site", async (_req, res) => {
  res.json({ settings: await getSettings() });
});

publicRouter.get("/home", async (_req, res) => {
  const [settings, up, [past], books] = await Promise.all([
    getSettings(),
    upcoming(),
    db.select({ n: count() }).from(events).where(and(eq(events.status, "published"), lt(events.startsAt, cutoff()))),
    db.select().from(handbooks).where(eq(handbooks.published, true)).orderBy(asc(handbooks.volume)),
  ]);
  res.json({ settings, next: up[0] ?? null, pastCount: Number(past?.n ?? 0), handbooks: books.slice(0, 4) });
});

publicRouter.get("/events", async (_req, res) => {
  const [settings, up, past] = await Promise.all([
    getSettings(),
    upcoming(),
    db
      .select()
      .from(events)
      .where(and(eq(events.status, "published"), lt(events.startsAt, cutoff())))
      .orderBy(desc(events.startsAt))
      .limit(3),
  ]);
  res.json({ settings, upcoming: up, past });
});

publicRouter.get("/events/:slug", async (req, res) => {
  const [e] = await db.select().from(events).where(eq(events.slug, req.params.slug));
  if (!e || e.status !== "published") return res.status(404).json({ error: "Not found" });
  res.json((await withSeats([e]))[0]);
});

publicRouter.get("/team", async (_req, res) => {
  const [people, vs] = await Promise.all([
    db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.active, true))
      .orderBy(desc(teamMembers.isLead), asc(teamMembers.sortOrder), asc(teamMembers.name)),
    db.select().from(verticals).orderBy(asc(verticals.sortOrder), asc(verticals.name)),
  ]);
  const by = (g: string) => people.filter((m) => m.group === g).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  res.json({
    settings: await getSettings(),
    faculty: by("faculty"),
    staff: by("staff"),
    core: by("core"),
    teamCount: people.filter((m) => m.group === "core" || m.group === "member").length,
    verticals: vs.map((v) => ({
      ...v,
      members: people.filter((m) => m.verticalId === v.id && (m.group === "core" || m.group === "member")),
    })),
  });
});

publicRouter.get("/handbooks", async (_req, res) => {
  res.json({ handbooks: await db.select().from(handbooks).where(eq(handbooks.published, true)).orderBy(asc(handbooks.volume)) });
});

publicRouter.get("/join", async (_req, res) => {
  const vs = await db.select().from(verticals).orderBy(asc(verticals.sortOrder), asc(verticals.name));
  res.json({ settings: await getSettings(), verticals: vs.map((v) => v.name) });
});

/* ------------------------- form submissions ------------------------- */

publicRouter.post("/applications", async (req, res) => {
  const raw: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.body ?? {})) if (typeof v === "string") raw[k] = v;
  const kind = raw._kind as PublicKind;
  const schema = publicForms[kind];
  if (!schema) return res.status(400).json({ error: "Unknown form." });
  if (raw.company) return res.json({ ok: true }); // honeypot

  const ip = req.claims?.ip ?? "unknown";
  if (!rateLimit(`apply:${ip}`, 6, 60 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many submissions from your network. Please try again later." });
  }

  const s = await getSettings();
  if (kind === "core_team" && s.coreRecruitment !== "open") return res.status(400).json({ error: "Core team applications are currently closed." });
  if (kind === "cohort" && s.cohortRecruitment !== "open") return res.status(400).json({ error: "Cohort applications are currently closed." });

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return res.status(400).json({ error: "Please fix the highlighted fields.", fieldErrors: flattenErrors(parsed.error) });
  const d = parsed.data as Record<string, string>;
  const { name, email, phone, branch, year, ...rest } = d;

  await db.insert(applications).values({
    kind,
    name: kind === "suggestion" ? "Anonymous" : name,
    email: email || null,
    phone: phone || null,
    branch: branch || null,
    year: year || null,
    answers: Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, String(v ?? "")])),
  });
  res.json({ ok: true, name: kind === "suggestion" ? undefined : name });
});

publicRouter.post("/rsvps", async (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  if (b.company) return res.json({ ok: true });
  const ip = req.claims?.ip ?? "unknown";
  if (!rateLimit(`rsvp:${ip}`, 10, 60 * 60 * 1000)) return res.status(429).json({ error: "Too many requests. Please try again later." });

  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address";
  if (Object.keys(fieldErrors).length) return res.status(400).json({ fieldErrors });

  const [ev] = await db.select().from(events).where(eq(events.id, String(b.eventId ?? "")));
  if (!ev || ev.status !== "published" || !ev.rsvpOpen) return res.status(400).json({ error: "RSVPs are closed for this event." });
  if (ev.startsAt.getTime() < Date.now() - GRACE_MS) return res.status(400).json({ error: "This event has already happened." });

  const [existing] = await db.select({ id: eventRsvps.id }).from(eventRsvps).where(and(eq(eventRsvps.eventId, ev.id), eq(eventRsvps.email, email)));
  if (existing) return res.json({ ok: true, name });

  if (ev.capacity != null) {
    const [{ n }] = await db.select({ n: count() }).from(eventRsvps).where(eq(eventRsvps.eventId, ev.id));
    if (Number(n) >= ev.capacity) return res.status(400).json({ error: "Sorry, this event is full." });
  }
  await db.insert(eventRsvps).values({ eventId: ev.id, name: name.slice(0, 120), email: email.slice(0, 200) }).onConflictDoNothing();
  res.json({ ok: true, name });
});
