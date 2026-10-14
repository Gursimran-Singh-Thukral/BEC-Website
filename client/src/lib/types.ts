/** Shapes returned by the API (/server). Dates are revived from ISO strings by lib/api-core.ts. */

export type EventRow = {
  id: string; slug: string; title: string; type: string; summary: string;
  startsAt: Date; endsAt: Date | null; venue: string; audience: string; posterUrl: string | null;
  capacity: number | null; rsvpOpen: boolean; status: string; attendeeCount: number | null; highlight: string;
  createdAt: Date; updatedAt: Date;
};
export type EventWithSeats = EventRow & { rsvpCount: number; seatsLeft: number | null };
export type RsvpRow = { id: string; eventId: string; name: string; email: string; createdAt: Date };

export type ApplicationRow = {
  id: string; kind: string; name: string; email: string | null; phone: string | null; branch: string | null; year: string | null;
  answers: Record<string, string>; status: string; notes: string; reviewedBy: string | null; createdAt: Date; updatedAt: Date;
};

export type Vertical = { id: string; name: string; blurb: string; sortOrder: number };
export type TeamMember = {
  id: string; name: string; group: string; role: string; verticalId: string | null; isLead: boolean; branchYear: string;
  bio: string; topics: string[]; email: string | null; linkedin: string | null; office: string | null; photoUrl: string | null;
  sortOrder: number; active: boolean;
};
export type Handbook = {
  id: string; volume: number; title: string; description: string; bestFor: string; pages: number | null;
  readMinutes: number | null; readUrl: string | null; pdfUrl: string | null; chapters: string[]; published: boolean;
};
export type Admin = { id: string; email: string; name: string; role: string; createdAt: Date; lastLoginAt: Date | null };

export type Settings = {
  coreRecruitment: string; coreDeadline: string; cohortRecruitment: string; cohortLabel: string; cohortDeadline: string;
  cohortWeeks: string; statStudents: string; statPartners: string; statSessionsOffset: string; vision: string;
  contactEmail: string; address: string; instagram: string; linkedin: string; youtube: string;
};
export type SettingKey = keyof Settings;

/** Field metadata for the admin "Site settings" form. */
export const SETTING_FIELDS: { key: SettingKey; label: string; type: "toggle" | "text" | "textarea"; hint: string }[] = [
  { key: "coreRecruitment", label: "Core team recruitment", type: "toggle", hint: "Shows Open/Closed on the site and enables or disables the core team form." },
  { key: "coreDeadline", label: "Core team deadline", type: "text", hint: "e.g. 30 Nov. Shown on the Join page." },
  { key: "cohortRecruitment", label: "Big Idea Cohort applications", type: "toggle", hint: "Enables or disables the cohort application form." },
  { key: "cohortLabel", label: "Cohort label", type: "text", hint: "e.g. Cohort 3" },
  { key: "cohortDeadline", label: "Cohort application deadline", type: "text", hint: "e.g. 15 Dec" },
  { key: "cohortWeeks", label: "Cohort length (weeks)", type: "text", hint: "e.g. 8" },
  { key: "statStudents", label: "Students reached", type: "text", hint: "Home page stat, e.g. 1500. Leave empty to hide." },
  { key: "statPartners", label: "Partner institutions", type: "text", hint: "Home page stat. Leave empty to hide." },
  { key: "statSessionsOffset", label: "Sessions held before this site", type: "text", hint: "Added to the automatic count of past published events." },
  { key: "vision", label: "Vision statement", type: "textarea", hint: "Shown on the Home page next to the mission." },
  { key: "contactEmail", label: "Contact email", type: "text", hint: "" },
  { key: "address", label: "Address", type: "text", hint: "Shown in the footer." },
  { key: "instagram", label: "Instagram URL", type: "text", hint: "Leave empty to hide." },
  { key: "linkedin", label: "LinkedIn URL", type: "text", hint: "Leave empty to hide." },
  { key: "youtube", label: "YouTube URL", type: "text", hint: "Leave empty to hide." },
];
