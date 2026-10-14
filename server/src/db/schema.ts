import { index, integer, jsonb, pgTable, text, timestamp, boolean, uniqueIndex, customType } from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const createdAt = () => ts("created_at").notNull().defaultNow();
const updatedAt = () => ts("updated_at").notNull().defaultNow().$onUpdate(() => new Date());

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

export const events = pgTable(
  "events",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    type: text("type").notNull(),
    summary: text("summary").notNull().default(""),
    startsAt: ts("starts_at").notNull(),
    endsAt: ts("ends_at"),
    venue: text("venue").notNull().default(""),
    audience: text("audience").notNull().default(""),
    posterUrl: text("poster_url"),
    capacity: integer("capacity"),
    rsvpOpen: boolean("rsvp_open").notNull().default(true),
    status: text("status").notNull().default("draft"), // draft | published
    attendeeCount: integer("attendee_count"),
    highlight: text("highlight").notNull().default(""),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("events_starts_idx").on(t.startsAt)],
);

export const eventRsvps = pgTable(
  "event_rsvps",
  {
    id: id(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("rsvp_event_email").on(t.eventId, t.email)],
);

export const applications = pgTable(
  "applications",
  {
    id: id(),
    kind: text("kind").notNull(), // core_team | member | mentor | cohort | idea | suggestion
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    branch: text("branch"),
    year: text("year"),
    answers: jsonb("answers").$type<Record<string, string>>().notNull().default({}),
    status: text("status").notNull().default("new"),
    notes: text("notes").notNull().default(""),
    reviewedBy: text("reviewed_by"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("applications_kind_idx").on(t.kind),
    index("applications_status_idx").on(t.status),
    index("applications_created_idx").on(t.createdAt),
  ],
);

export const verticals = pgTable("verticals", {
  id: id(),
  name: text("name").notNull(),
  blurb: text("blurb").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const teamMembers = pgTable("team_members", {
  id: id(),
  name: text("name").notNull(),
  group: text("group").notNull(), // faculty | staff | core | member
  role: text("role").notNull().default(""),
  verticalId: text("vertical_id").references(() => verticals.id, { onDelete: "set null" }),
  isLead: boolean("is_lead").notNull().default(false),
  branchYear: text("branch_year").notNull().default(""),
  bio: text("bio").notNull().default(""),
  topics: jsonb("topics").$type<string[]>().notNull().default([]),
  email: text("email"),
  linkedin: text("linkedin"),
  office: text("office"),
  photoUrl: text("photo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const handbooks = pgTable("handbooks", {
  id: id(),
  volume: integer("volume").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  bestFor: text("best_for").notNull().default(""),
  pages: integer("pages"),
  readMinutes: integer("read_minutes"),
  readUrl: text("read_url"),
  pdfUrl: text("pdf_url"),
  chapters: jsonb("chapters").$type<string[]>().notNull().default([]),
  published: boolean("published").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const admins = pgTable("admins", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  role: text("role").notNull().default("admin"), // owner | admin
  createdAt: createdAt(),
  lastLoginAt: ts("last_login_at"),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/** Uploaded images and PDFs, stored in the database so they survive redeploys on any host. */
export const files = pgTable("files", {
  name: text("name").primaryKey(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  createdAt: createdAt(),
});

export type Event = typeof events.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Vertical = typeof verticals.$inferSelect;
export type Handbook = typeof handbooks.$inferSelect;
export type Admin = typeof admins.$inferSelect;
