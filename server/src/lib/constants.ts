export const EVENT_TYPES = [
  { value: "founders_forum", label: "Founder's Forum" },
  { value: "insight_out", label: "Insight Out" },
  { value: "esdp", label: "ESDP" },
  { value: "open_house", label: "Open House" },
  { value: "movie_night", label: "Movie Night" },
  { value: "orientation", label: "Orientation" },
  { value: "other", label: "Other" },
] as const;
export type EventType = (typeof EVENT_TYPES)[number]["value"];
export const eventTypeLabel = (v: string) =>
  EVENT_TYPES.find((t) => t.value === v)?.label ?? v;

export const EVENT_STATUSES = ["draft", "published"] as const;

export const APPLICATION_KINDS = [
  { value: "core_team", label: "Core team" },
  { value: "member", label: "Member" },
  { value: "mentor", label: "Mentor" },
  { value: "cohort", label: "Big Idea Cohort" },
  { value: "idea", label: "Idea Dropbox" },
  { value: "suggestion", label: "Handbook suggestion" },
] as const;
export type ApplicationKind = (typeof APPLICATION_KINDS)[number]["value"];
export const kindLabel = (v: string) =>
  APPLICATION_KINDS.find((k) => k.value === v)?.label ?? v;

export const APPLICATION_STATUSES = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
] as const;
export const statusLabel = (v: string) =>
  APPLICATION_STATUSES.find((s) => s.value === v)?.label ?? v;

export const TEAM_GROUPS = [
  { value: "faculty", label: "Professor in charge" },
  { value: "staff", label: "Staff" },
  { value: "core", label: "Core team" },
  { value: "member", label: "Vertical member" },
] as const;

export const IDEA_NEEDS = [
  "Not sure yet",
  "A mentor",
  "A co-founder",
  "A cohort seat",
  "Incubation or funding",
] as const;

export const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "5th year", "PG", "PhD"] as const;

export const MENTOR_RELATIONS = ["Alumni", "Founder", "Faculty", "Industry professional", "Other"] as const;

export const ADMIN_EMAIL_DOMAIN = "iitjammu.ac.in";
export const SITE_NAME = "Budding Entrepreneurs' Club, IIT Jammu";
