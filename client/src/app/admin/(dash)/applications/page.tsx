import Link from "next/link";
import { adm } from "@/lib/api";
import type { ApplicationRow } from "@/lib/types";
import { APPLICATION_KINDS, APPLICATION_STATUSES, kindLabel, statusLabel } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import { Badge, Card, EmptyState, Flash, LinkBtn, PageHeader, Td, Th, statusTone } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Applications" };

type SP = { kind?: string; status?: string; q?: string; page?: string; deleted?: string };

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const qs = new URLSearchParams();
  if (sp.kind) qs.set("kind", sp.kind);
  if (sp.status) qs.set("status", sp.status);
  if (q) qs.set("q", q);
  if (sp.page) qs.set("page", sp.page);
  const d = await adm<{ rows: ApplicationRow[]; total: number; page: number; pages: number; counts: Record<string, number> }>(`/admin/applications?${qs}`);
  const { rows, total, page, pages } = d;
  const counts = new Map(Object.entries(d.counts));
  const allCount = [...counts.values()].reduce((a, b) => a + b, 0);

  const href = (over: Partial<SP>) => {
    const p = new URLSearchParams();
    const m = { ...sp, ...over };
    for (const [k, v] of Object.entries(m)) if (v && k !== "deleted") p.set(k, String(v));
    return `/admin/applications${p.size ? `?${p}` : ""}`;
  };
  const exportHref = `/admin/applications/export${(() => { const p = new URLSearchParams(); if (sp.kind) p.set("kind", sp.kind); if (sp.status) p.set("status", sp.status); if (q) p.set("q", q); return p.size ? `?${p}` : ""; })()}`;

  const chip = (label: string, active: boolean, to: string, n?: number) => (
    <Link key={label} href={to} className={cn("rounded-full px-3.5 py-1.5 font-ui text-sm font-semibold no-underline", active ? "bg-navy text-white" : "bg-white text-navy hover:bg-ice")}>
      {label}{n != null && <span className={cn("ml-1.5 text-xs", active ? "text-ice" : "text-muted")}>{n}</span>}
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Applications"
        subtitle="Everything submitted through the public website: team, member, mentor and cohort applications, Idea Dropbox entries and handbook suggestions."
        actions={<LinkBtn href={exportHref} variant="ghost">Export CSV</LinkBtn>}
      />
      <Flash deleted={sp.deleted} />

      <div className="mb-3 flex flex-wrap gap-2">
        {chip("All", !sp.status, href({ status: undefined, page: undefined }), allCount)}
        {APPLICATION_STATUSES.map((s) => chip(s.label, sp.status === s.value, href({ status: s.value, page: undefined }), counts.get(s.value) ?? 0))}
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {chip("Any type", !sp.kind, href({ kind: undefined, page: undefined }))}
          {APPLICATION_KINDS.map((k) => chip(k.label, sp.kind === k.value, href({ kind: k.value, page: undefined })))}
        </div>
        <form action="/admin/applications" className="flex gap-2">
          {sp.kind && <input type="hidden" name="kind" value={sp.kind} />}
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <input name="q" defaultValue={q} placeholder="Search name, email, branch…" className="min-h-10 rounded-full border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-sky" />
          <button className="min-h-10 cursor-pointer rounded-full bg-ink px-4 font-ui text-sm font-semibold text-white">Search</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={allCount === 0 ? "No applications yet" : "No applications match"} body={allCount === 0 ? "When someone applies or drops an idea on the website, it will appear here." : "Try clearing a filter."} />
      ) : (
        <Card padded={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="border-b border-line bg-mist"><tr><Th>Applicant</Th><Th>Type</Th><Th>Branch / year</Th><Th>Received</Th><Th>Status</Th></tr></thead>
              <tbody className="divide-y divide-line">
                {rows.map((a) => (
                  <tr key={a.id} className="transition hover:bg-mist/60">
                    <Td>
                      <Link href={`/admin/applications/${a.id}`} className={cn("no-underline hover:text-navy", a.status === "new" ? "font-bold text-ink" : "font-medium text-ink")}>{a.name}</Link>
                      {a.email && <div className="text-sm text-muted">{a.email}</div>}
                    </Td>
                    <Td>{kindLabel(a.kind)}</Td>
                    <Td className="text-body">{[a.branch, a.year].filter(Boolean).join(" · ") || "—"}</Td>
                    <Td className="whitespace-nowrap text-muted">{relativeTime(a.createdAt)}</Td>
                    <Td><Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm text-muted">
          <span>{total} results · page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <LinkBtn href={href({ page: String(page - 1) })} variant="ghost">← Previous</LinkBtn>}
            {page < pages && <LinkBtn href={href({ page: String(page + 1) })} variant="ghost">Next →</LinkBtn>}
          </div>
        </div>
      )}
    </>
  );
}
