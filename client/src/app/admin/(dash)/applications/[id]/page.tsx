import { notFound } from "next/navigation";
import { adm, ApiError } from "@/lib/api";
import type { ApplicationRow } from "@/lib/types";
import { APPLICATION_STATUSES, kindLabel, statusLabel } from "@/lib/constants";
import { fullDateTime } from "@/lib/time";
import { AdminForm, ConfirmButton, SelectField, SubmitButton, TextArea } from "@/components/admin/forms";
import { Badge, Card, Flash, PageHeader, SectionLabel, statusTone } from "@/components/admin/ui";
import { deleteApplication, setApplicationStatus, updateApplication } from "../../actions";

export const metadata = { title: "Application" };

const LABELS: Record<string, string> = {
  vertical: "Wants to help in", why: "Why join the core team", experience: "Experience", linkedin: "LinkedIn / portfolio",
  interests: "Hoping to get out of BEC", organisation: "Organisation / designation", relation: "Connection to IIT Jammu",
  domain: "Domains", availability: "Availability", note: "Notes from applicant", teamSize: "Team size", stage: "Current stage",
  problem: "Problem statement", idea: "The idea", need: "What would help most", topic: "Suggested topic",
};

export default async function ApplicationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  let a: ApplicationRow;
  try {
    a = (await adm<{ application: ApplicationRow }>(`/admin/applications/${id}`)).application;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const answers = Object.entries(a.answers).filter(([, v]) => v);

  const rows: [string, string | null][] = [
    ["Email", a.email], ["Phone", a.phone], ["Branch", a.branch], ["Year", a.year],
  ];

  return (
    <>
      <PageHeader
        title={a.name}
        subtitle={`${kindLabel(a.kind)} · received ${fullDateTime(a.createdAt)}`}
        back={{ href: "/admin/applications", label: "All applications" }}
        actions={<Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>}
      />
      <Flash saved={saved} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <SectionLabel>Applicant</SectionLabel>
            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <div><dt className="font-ui text-xs font-semibold text-muted uppercase">Name</dt><dd className="mt-0.5 text-[15px] text-ink">{a.name}</dd></div>
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <dt className="font-ui text-xs font-semibold text-muted uppercase">{k}</dt>
                  <dd className="mt-0.5 text-[15px] break-words text-ink">{k === "Email" ? <a href={`mailto:${v}`} className="text-navy">{v}</a> : v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          {answers.length > 0 && (
            <Card>
              <SectionLabel>{kindLabel(a.kind)} responses</SectionLabel>
              <dl className="mt-4 flex flex-col gap-5">
                {answers.map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-ui text-xs font-semibold text-muted uppercase">{LABELS[k] ?? k}</dt>
                    <dd className="mt-1 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-ink">
                      {/^https?:\/\//.test(v) ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-navy underline">{v}</a> : v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <SectionLabel>Review</SectionLabel>
            <AdminForm action={updateApplication.bind(null, a.id)} className="mt-4 flex flex-col gap-4">
              <SelectField name="status" label="Status" defaultValue={a.status} options={APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
              <TextArea name="notes" label="Internal notes" rows={6} defaultValue={a.notes} hint="Only admins can see these." />
              <SubmitButton>Save review</SubmitButton>
              {a.reviewedBy && <p className="text-xs text-muted">Last updated by {a.reviewedBy}</p>}
            </AdminForm>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              {a.status !== "shortlisted" && (
                <form action={setApplicationStatus.bind(null, a.id, "shortlisted")}><button className="cursor-pointer rounded-full bg-indigo-100 px-3.5 py-1.5 font-ui text-sm font-semibold text-indigo-800">Shortlist</button></form>
              )}
              {a.status !== "accepted" && (
                <form action={setApplicationStatus.bind(null, a.id, "accepted")}><button className="cursor-pointer rounded-full bg-emerald-100 px-3.5 py-1.5 font-ui text-sm font-semibold text-emerald-800">Accept</button></form>
              )}
              {a.status !== "rejected" && (
                <form action={setApplicationStatus.bind(null, a.id, "rejected")}><button className="cursor-pointer rounded-full bg-red-100 px-3.5 py-1.5 font-ui text-sm font-semibold text-red-700">Reject</button></form>
              )}
            </div>
          </Card>
          {a.email && (
            <Card>
              <SectionLabel>Reply</SectionLabel>
              <div className="mt-4">
                <a
                  href={`mailto:${a.email}?subject=${encodeURIComponent(`BEC IIT Jammu: your ${kindLabel(a.kind).toLowerCase()}`)}`}
                  className="btn inline-flex min-h-10 items-center rounded-full bg-sky px-[18px] py-2 font-ui text-sm font-semibold text-ink no-underline"
                >
                  Email {a.name.split(" ")[0]} →
                </a>
              </div>
            </Card>
          )}
          <form action={deleteApplication.bind(null, a.id)}>
            <ConfirmButton message={`Permanently delete this application from ${a.name}?`}>Delete application</ConfirmButton>
          </form>
        </div>
      </div>
    </>
  );
}
