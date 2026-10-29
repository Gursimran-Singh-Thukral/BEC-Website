import Link from "next/link";
import { adm } from "@/lib/api";
import type { EventRow } from "@/lib/types";
import { EVENT_TYPES, eventTypeLabel } from "@/lib/constants";
import { fullDateTime, nowMs } from "@/lib/time";
import { Badge, Card, EmptyState, Flash, LinkBtn, PageHeader, Td, Th, statusTone } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Events" };

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; when?: string; saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (sp.status) qs.set("status", sp.status);
  if (sp.when) qs.set("when", sp.when);
  const { events: list } = await adm<{ events: (EventRow & { rsvps: number })[] }>(`/admin/events?${qs}`);
  const rows = list.map((e) => ({ e, rsvps: e.rsvps }));
  const now = nowMs();

  const tab = (label: string, key: "when", val: string | undefined) => {
    const active = sp.when === val || (!sp.when && !val);
    const params = new URLSearchParams();
    if (val) params.set(key, val);
    if (q) params.set("q", q);
    return (
      <Link key={label} href={`/admin/events${params.size ? `?${params}` : ""}`} className={cn("rounded-full px-4 py-1.5 font-ui text-sm font-semibold no-underline", active ? "bg-navy text-white" : "bg-white text-navy hover:bg-ice")}>
        {label}
      </Link>
    );
  };

  return (
    <>
      <PageHeader title="Events" subtitle="Everything published here appears on the Initiatives page and in the Home 'Next up' card." actions={<LinkBtn href="/admin/events/new" variant="sky">+ New event</LinkBtn>} />
      <Flash saved={sp.saved} deleted={sp.deleted} />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">{[tab("All", "when", undefined), tab("Upcoming", "when", "upcoming"), tab("Past", "when", "past")]}</div>
        <form className="flex gap-2" action="/admin/events">
          {sp.when && <input type="hidden" name="when" value={sp.when} />}
          <input name="q" defaultValue={q} placeholder="Search events…" className="min-h-10 rounded-full border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-sky" />
          <select name="status" defaultValue={sp.status ?? ""} className="min-h-10 rounded-full border-[1.5px] border-line bg-white px-3 text-sm outline-none focus:border-sky">
            <option value="">Any status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button className="min-h-10 cursor-pointer rounded-full bg-ink px-4 font-ui text-sm font-semibold text-white">Filter</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No events found" body="Create your first event to put it on the website." action={<LinkBtn href="/admin/events/new">+ New event</LinkBtn>} />
      ) : (
        <Card padded={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="border-b border-line bg-mist">
                <tr><Th>Event</Th><Th>When</Th><Th>Type</Th><Th>RSVPs</Th><Th>Status</Th><Th /></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ e, rsvps }) => {
                  const past = e.startsAt.getTime() < now;
                  return (
                    <tr key={e.id} className="transition hover:bg-mist/60">
                      <Td>
                        <Link href={`/admin/events/${e.id}`} className="font-medium text-ink no-underline hover:text-navy">{e.title}</Link>
                        {e.venue && <div className="text-sm text-muted">{e.venue}</div>}
                      </Td>
                      <Td className="whitespace-nowrap text-body">{fullDateTime(e.startsAt)}{past && <span className="ml-2 text-xs text-muted">(past)</span>}</Td>
                      <Td>{eventTypeLabel(e.type)}</Td>
                      <Td>{rsvps}{e.capacity ? <span className="text-muted"> / {e.capacity}</span> : null}</Td>
                      <Td><Badge tone={statusTone(e.status)}>{e.status === "published" ? "Published" : "Draft"}</Badge></Td>
                      <Td className="text-right"><Link href={`/admin/events/${e.id}`} className="font-ui text-sm font-semibold text-navy">Edit</Link></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <p className="mt-3 text-xs text-muted">Event types: {EVENT_TYPES.map((t) => t.label).join(", ")}. Times are shown in IST.</p>
    </>
  );
}
