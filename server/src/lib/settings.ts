import { db } from "../db";
import { settings } from "../db/schema";

export const SETTING_FIELDS = [
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
] as const;

export type SettingKey = (typeof SETTING_FIELDS)[number]["key"];
export type Settings = Record<SettingKey, string>;

const DEFAULTS: Settings = {
  coreRecruitment: "closed",
  coreDeadline: "",
  cohortRecruitment: "closed",
  cohortLabel: "",
  cohortDeadline: "",
  cohortWeeks: "",
  statStudents: "",
  statPartners: "",
  statSessionsOffset: "",
  vision: "",
  contactEmail: "bec@iitjammu.ac.in",
  address: "IIT Jammu, Jagti, NH-44, Nagrota, Jammu & Kashmir",
  instagram: "",
  linkedin: "",
  youtube: "",
};

export async function getSettings(): Promise<Settings> {
  const rows = await db.select().from(settings);
  const out = { ...DEFAULTS };
  for (const r of rows) if (r.key in out) out[r.key as SettingKey] = r.value;
  return out;
}

export async function saveSettings(values: Partial<Settings>) {
  for (const f of SETTING_FIELDS) {
    const v = values[f.key];
    if (v === undefined) continue;
    await db.insert(settings).values({ key: f.key, value: v }).onConflictDoUpdate({ target: settings.key, set: { value: v } });
  }
}
