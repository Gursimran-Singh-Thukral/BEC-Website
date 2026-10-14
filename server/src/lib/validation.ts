import { z } from "zod";
import { EVENT_TYPES, IDEA_NEEDS, YEARS } from "./constants";

const t = (max: number) => z.string().trim().max(max);
const req = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);
const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => !v || /^https?:\/\//i.test(v) || v.startsWith("/"), "Must start with http(s):// or /")
  .optional()
  .default("");

/* ---------------- Public forms ---------------- */

const base = { name: req("Name", 120), email };

export const publicForms = {
  core_team: z.object({
    ...base,
    phone: t(30).optional().default(""),
    branch: req("Branch", 80),
    year: z.enum(YEARS, { error: "Select your year" }),
    vertical: req("Choose a vertical", 80),
    why: req("Tell us why you want to join", 1500),
    experience: t(1500).optional().default(""),
    linkedin: optionalUrl,
  }),
  member: z.object({
    ...base,
    branch: req("Branch", 80),
    year: z.enum(YEARS, { error: "Select your year" }),
    interests: t(500).optional().default(""),
  }),
  mentor: z.object({
    ...base,
    organisation: req("Organisation / designation", 200),
    relation: req("Select how you are connected", 60),
    domain: req("Tell us your domain", 300),
    availability: t(300).optional().default(""),
    linkedin: optionalUrl,
    note: t(1500).optional().default(""),
  }),
  cohort: z.object({
    ...base,
    branch: req("Branch", 80),
    year: z.enum(YEARS, { error: "Select your year" }),
    teamSize: t(60).optional().default(""),
    problem: req("Describe the problem", 2000).refine((v) => v.length >= 30, "Add a little more detail (30+ characters)"),
    stage: t(300).optional().default(""),
  }),
  idea: z.object({
    ...base,
    idea: req("Describe the problem", 3000).refine((v) => v.length >= 20, "Add a little more detail (20+ characters)"),
    need: z.enum(IDEA_NEEDS).default("Not sure yet"),
  }),
  suggestion: z.object({
    topic: req("Topic", 300),
  }),
} as const;

export type PublicKind = keyof typeof publicForms;

/* ---------------- Admin forms ---------------- */

const intOrNull = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? Number.parseInt(v, 10) : null))
  .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Must be a non-negative number");

export const eventSchema = z.object({
  title: req("Title", 160),
  type: z.enum(EVENT_TYPES.map((e) => e.value) as [string, ...string[]]),
  summary: t(2000).optional().default(""),
  startsAt: req("Start date and time", 40),
  endsAt: t(40).optional().default(""),
  venue: t(200).optional().default(""),
  audience: t(200).optional().default(""),
  posterUrl: optionalUrl,
  capacity: intOrNull,
  attendeeCount: intOrNull,
  highlight: t(300).optional().default(""),
  status: z.enum(["draft", "published"]),
  rsvpOpen: z.boolean(),
});

export const teamSchema = z.object({
  name: req("Name", 120),
  group: z.enum(["faculty", "staff", "core", "member"]),
  role: t(120).optional().default(""),
  verticalId: t(60).optional().default(""),
  isLead: z.boolean(),
  branchYear: t(120).optional().default(""),
  bio: t(600).optional().default(""),
  topics: t(500).optional().default(""),
  email: t(200).optional().default(""),
  linkedin: optionalUrl,
  office: t(160).optional().default(""),
  photoUrl: optionalUrl,
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  active: z.boolean(),
});

export const handbookSchema = z.object({
  volume: z.coerce.number().int().min(1).max(999),
  title: req("Title", 160),
  description: t(1000).optional().default(""),
  bestFor: t(160).optional().default(""),
  pages: intOrNull,
  readMinutes: intOrNull,
  readUrl: optionalUrl,
  pdfUrl: optionalUrl,
  chapters: t(3000).optional().default(""),
  published: z.boolean(),
});

export const verticalSchema = z.object({
  name: req("Name", 100),
  blurb: t(500).optional().default(""),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export type FieldErrors = Record<string, string>;

export function flattenErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "_");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}
