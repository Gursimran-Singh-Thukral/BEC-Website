import { count, eq } from "drizzle-orm";
import { db } from "./index";
import { config } from "../config";
import { admins, events, handbooks, settings, teamMembers, verticals } from "./schema";

/* ------------------------------------------------------------------ */
/* Initial content, taken from the "BEC Orientation Session 2026" deck */
/* and Design.html. Seeded once; afterwards everything is edited from  */
/* the admin dashboard.                                                */
/* ------------------------------------------------------------------ */

const VERTICALS = [
  { key: "strategy", name: "Strategy", blurb: "Sets the club's direction, plans the semester and keeps every vertical pulling the same way." },
  { key: "events", name: "Event management", blurb: "Plans and runs every talk, workshop and case challenge, from booking the hall to the last chair stacked." },
  { key: "outreach", name: "Outreach", blurb: "Brings in speakers, partner E-Cells, incubators and schools across J&K." },
  { key: "pr", name: "PR", blurb: "Keeps campus, partners and the wider network up to date on what BEC is doing." },
  { key: "media", name: "Media", blurb: "Photos, reels and event coverage that carry the BEC look." },
  { key: "design", name: "Design", blurb: "Posters, graphics and the visual identity behind every BEC event." },
  { key: "inventory", name: "Inventory", blurb: "Looks after the club's equipment and materials for events." },
  { key: "tech", name: "Tech & web", blurb: "Builds and looks after this website and the club's tools." },
];

// Team photos ship with the website (client/public/team) and are served by it.
const img = (slug: string) => `/team/${slug}.jpg`;

type Seed = {
  name: string; slug: string; group: "faculty" | "staff" | "core" | "member";
  role?: string; vertical?: string; lead?: boolean; topics?: string[];
};

const TEAM: Seed[] = [
  // Professors in charge
  { name: "M T Arvind", slug: "mt-arvind", group: "faculty", role: "CIO, IIT Jammu" },
  { name: "Navneet Kumar", slug: "navneet-kumar", group: "faculty", role: "PIC, I2EDC" },
  { name: "Ankit Dubey", slug: "ankit-dubey", group: "faculty", role: "Ex-PIC, I2EDC" },
  { name: "Nalin Sharma", slug: "nalin-sharma", group: "faculty", role: "PIC, I3C" },
  { name: "Yogesh Nimdeo", slug: "yogesh-nimdeo", group: "faculty", role: "PIC, I3C" },
  // Staff
  { name: "Mohammad Israil", slug: "mohammad-israil", group: "staff", role: "Protospace in-charge" },
  { name: "Namrit Bhardwaj", slug: "namrit-bhardwaj", group: "staff", role: "Tinkering Lab in-charge" },
  { name: "Priyanka Manhas", slug: "priyanka-manhas", group: "staff", role: "Administration & Outreach in-charge" },
  { name: "Sahil Sharma", slug: "sahil-sharma", group: "staff", role: "Lab technician" },
  // Core team
  { name: "Sonu Patidar", slug: "sonu-patidar", group: "core", role: "President" },
  { name: "Bhanu Mobarsa", slug: "bhanu-mobarsa", group: "core", role: "Senior Advisor" },
  { name: "Ansh", slug: "ansh", group: "core", role: "Event Management Head", vertical: "events", lead: true },
  { name: "Sarthak", slug: "sarthak", group: "core", role: "Outreach Head", vertical: "outreach", lead: true },
  { name: "Daksh", slug: "daksh", group: "core", role: "PR Head", vertical: "pr", lead: true },
  { name: "Majied", slug: "majied", group: "core", role: "Media Head", vertical: "media", lead: true },
  { name: "Manish R K", slug: "manish-rk", group: "core", role: "Design Head", vertical: "design", lead: true },
  { name: "Tharang", slug: "tharang", group: "core", role: "Inventory Head", vertical: "inventory", lead: true },
  { name: "Gursimran Singh Thukral", slug: "gursimran-singh-thukral", group: "core", role: "Web Dev Head", vertical: "tech", lead: true, topics: ["Web development"] },
  // Strategy team
  { name: "Dawik", slug: "dawik", group: "member", vertical: "strategy" },
  { name: "Jai", slug: "jai", group: "member", vertical: "strategy" },
  { name: "Siddharth", slug: "siddharth", group: "member", vertical: "strategy" },
  { name: "Pari", slug: "pari", group: "member", vertical: "strategy" },
  { name: "Sharav", slug: "sharav", group: "member", vertical: "strategy" },
];

const HANDBOOKS = [
  { title: "Entrepreneurship Starter Kit", description: "What a startup actually is, how to find a problem worth your time, and how to talk to the people who have it.", bestFor: "the curious" },
  { title: "From Idea to MVP", description: "Scoping the smallest thing worth building, testing it cheaply, and knowing when to change course.", bestFor: "anyone with an idea" },
  { title: "Pitch Deck Playbook", description: "The slides judges and investors expect, in order, and how to say a lot in ten minutes.", bestFor: "teams pitching soon" },
  { title: "Navigating the Ecosystem", description: "Who does what among I3C, I2EDC, AIC and ACIC, which grants exist, and how to approach each one.", bestFor: "teams ready for support" },
];

async function seedContent() {
  const [done] = await db.select().from(settings).where(eq(settings.key, "seeded_v1"));
  if (done) return;

  const vIds = new Map<string, string>();
  for (const [i, v] of VERTICALS.entries()) {
    const id = crypto.randomUUID();
    vIds.set(v.key, id);
    await db.insert(verticals).values({ id, name: v.name, blurb: v.blurb, sortOrder: i });
  }

  for (const [i, m] of TEAM.entries()) {
    await db.insert(teamMembers).values({
      name: m.name,
      group: m.group,
      role: m.role ?? "",
      verticalId: m.vertical ? vIds.get(m.vertical) : null,
      isLead: !!m.lead,
      topics: m.topics ?? [],
      photoUrl: img(m.slug),
      sortOrder: i,
    });
  }

  const [{ n: nBooks }] = await db.select({ n: count() }).from(handbooks);
  if (nBooks === 0) await db.insert(handbooks).values(HANDBOOKS.map((h, i) => ({ ...h, volume: i + 1 })));

  const [{ n: nEvents }] = await db.select({ n: count() }).from(events);
  if (nEvents === 0) {
    await db.insert(events).values({
      slug: "bec-orientation-2026",
      title: "BEC Orientation Session 2026",
      type: "orientation",
      summary:
        "An introduction to BEC and the innovation and entrepreneurship ecosystem at IIT Jammu: how ideas become startups, what the club runs, the Big Idea Cohort and the people who guide it.",
      // The deck gives no exact date: edit this in Admin > Events.
      startsAt: new Date("2026-10-14T17:00:00+05:30"),
      venue: "IIT Jammu",
      audience: "Open to all",
      posterUrl: "/images/campus.jpg",
      rsvpOpen: false,
      status: "published",
      highlight: "Ecosystem overview, our events and the Big Idea Cohort",
    });
  }

  await db
    .insert(settings)
    .values([
      { key: "instagram", value: "https://www.instagram.com/bec.iitjammu/" },
      { key: "seeded_v1", value: "1" },
    ])
    .onConflictDoNothing();
}

/** Idempotent start-up tasks: allow-list admins from env and seed first-run content. */
export async function bootstrap() {
  for (const [i, email] of config.adminEmails.entries()) {
    const [exists] = await db.select().from(admins).where(eq(admins.email, email));
    if (exists) continue;
    // The first address listed becomes the owner (can manage other admins).
    await db.insert(admins).values({ email, role: i === 0 ? "owner" : "admin" });
  }
  await seedContent();
}
