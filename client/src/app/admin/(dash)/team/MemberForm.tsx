import Link from "next/link";
import { adm } from "@/lib/api";
import type { TeamMember, Vertical } from "@/lib/types";
import { TEAM_GROUPS } from "@/lib/constants";
import { AdminForm, CheckField, SelectField, SubmitButton, TextArea, TextField, UploadField } from "@/components/admin/forms";
import { Card, SectionLabel } from "@/components/admin/ui";
import { saveTeamMember } from "../actions";

export async function MemberForm({ member }: { member?: TeamMember }) {
  const { verticals: vs } = await adm<{ verticals: Vertical[] }>("/admin/team");
  return (
    <AdminForm action={saveTeamMember.bind(null, member?.id ?? null)} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <SectionLabel>Person</SectionLabel>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="name" label="Full name" required defaultValue={member?.name} />
            <TextField name="role" label="Role / designation" defaultValue={member?.role} placeholder="e.g. Web Dev Head" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField name="group" label="Shown under" required defaultValue={member?.group ?? "member"} options={TEAM_GROUPS.map((g) => ({ value: g.value, label: g.label }))} />
            <SelectField name="verticalId" label="Vertical (optional)" defaultValue={member?.verticalId ?? ""} options={[{ value: "", label: "None" }, ...vs.map((v) => ({ value: v.id, label: v.name }))]} />
          </div>
          <TextField name="branchYear" label="Branch and year" defaultValue={member?.branchYear} placeholder="e.g. CSE, 3rd year" />
          <TextArea name="bio" label="One-line bio" rows={3} defaultValue={member?.bio} hint="Shown on the back of core team cards." />
          <TextField name="topics" label="Ask me about" defaultValue={member?.topics.join(", ")} hint="Comma separated, e.g. Pitching, Web development" />
        </Card>
        <Card className="flex flex-col gap-5">
          <SectionLabel>Contact</SectionLabel>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="email" type="email" label="Email" defaultValue={member?.email} />
            <TextField name="linkedin" label="LinkedIn URL" defaultValue={member?.linkedin} placeholder="https://" />
          </div>
          <TextField name="office" label="Office (faculty/staff)" defaultValue={member?.office} />
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <SectionLabel>Photo</SectionLabel>
          <UploadField name="photoUrl" label="Photo" defaultValue={member?.photoUrl} hint="Square or portrait works best. Faces are centred." />
        </Card>
        <Card className="flex flex-col gap-5">
          <SectionLabel>Display</SectionLabel>
          <TextField name="sortOrder" type="number" label="Order" defaultValue={member?.sortOrder ?? 0} hint="Lower numbers appear first." />
          <CheckField name="isLead" label="Vertical lead" hint="Shown first in the vertical, with a LEAD badge." defaultChecked={member?.isLead} />
          <CheckField name="active" label="Visible on the website" defaultChecked={member?.active ?? true} />
        </Card>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>{member ? "Save changes" : "Add person"}</SubmitButton>
          <Link href="/admin/team" className="font-ui text-sm font-semibold text-muted no-underline hover:text-navy">Cancel</Link>
        </div>
      </div>
    </AdminForm>
  );
}
