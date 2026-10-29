import { adm } from "@/lib/api";
import { SETTING_FIELDS, type Settings } from "@/lib/types";
import { AdminForm, CheckField, SubmitButton, TextArea, TextField } from "@/components/admin/forms";
import { Card, Flash, PageHeader, SectionLabel } from "@/components/admin/ui";
import { saveSiteSettings } from "../actions";

export const metadata = { title: "Site settings" };

const GROUPS: { title: string; keys: string[] }[] = [
  { title: "Recruitment", keys: ["coreRecruitment", "coreDeadline", "cohortRecruitment", "cohortLabel", "cohortDeadline"] },
  { title: "Home page", keys: ["statStudents", "statPartners", "statSessionsOffset", "vision"] },
  { title: "Contact & social", keys: ["contactEmail", "address", "instagram", "linkedin", "youtube"] },
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const sp = await searchParams;
  const { settings: s } = await adm<{ settings: Settings }>("/admin/settings");
  return (
    <>
      <PageHeader title="Site settings" subtitle="Small things that appear across the public website." />
      <Flash saved={sp.saved} />
      <AdminForm action={saveSiteSettings} className="flex max-w-[820px] flex-col gap-6">
        {GROUPS.map((g) => (
          <Card key={g.title} className="flex flex-col gap-5">
            <SectionLabel>{g.title}</SectionLabel>
            {g.keys.map((k) => {
              const f = SETTING_FIELDS.find((x) => x.key === k)!;
              if (f.type === "toggle")
                return <CheckField key={k} name={k} label={`${f.label}: open`} hint={f.hint} defaultChecked={s[f.key] === "open"} />;
              if (f.type === "textarea") return <TextArea key={k} name={k} label={f.label} hint={f.hint} rows={3} defaultValue={s[f.key]} />;
              return <TextField key={k} name={k} label={f.label} hint={f.hint} defaultValue={s[f.key]} />;
            })}
          </Card>
        ))}
        <div><SubmitButton>Save settings</SubmitButton></div>
      </AdminForm>
    </>
  );
}
