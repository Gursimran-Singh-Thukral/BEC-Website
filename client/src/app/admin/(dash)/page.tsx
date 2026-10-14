import Link from "next/link";
import { adm } from "@/lib/api";
import type { ApplicationRow, EventRow } from "@/lib/types";
import { eventTypeLabel, kindLabel, statusLabel } from "@/lib/constants";
import { fullDateTime, relativeTime } from "@/lib/time";
import { Badge, Card, LinkBtn, PageHeader, SectionLabel, StatCard, statusTone } from "@/components/admin/ui";

export default async function OverviewPage() {
  const o = await adm<{
    me: { name: string; email: string };
    newApps: number; totalApps: number; upcomingCount: number; rsvps: number; team: number;
    upcoming: EventRow[]; recent: ApplicationRow[]; byKind: { kind: string; n: number }[];
  }>("/admin/overview");
  const { newApps, totalApps, upcomingCount, rsvps, team, upcoming, recent, byKind } = o;
  const admin = o.me;

  return (
    <>
      <PageHeader
        title={`Hello${admin.name ? `, ${admin.name.split(" ")[0]}` : ""}.`}
        subtitle="Here's what's happening across BEC."
        actions={<LinkBtn href="/admin/events/new" variant="sky">+ New event</LinkBtn>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="dark" label="New applications" value={newApps} hint={`${totalApps} received in total`} />
        <StatCard label="Upcoming events" value={upcomingCount} hint="Published and still to come" />
        <StatCard tone="sky" label="Event RSVPs" value={rsvps} hint="Across all events" />
        <StatCard label="Active team members" value={team} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card padded={false}>
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <SectionLabel>Latest applications</SectionLabel>
            <Link href="/admin/applications" className="font-ui text-sm font-semibold text-navy">View all →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-muted">Nothing yet. Applications from the public website will show up here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/applications/${a.id}`} className="flex items-center gap-3 px-6 py-3.5 no-underline transition hover:bg-mist">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-ink">{a.name}</div>
                      <div className="truncate text-sm text-muted">{kindLabel(a.kind)} · {relativeTime(a.createdAt)}</div>
                    </div>
                    <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card padded={false}>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <SectionLabel>Coming up</SectionLabel>
              <Link href="/admin/events" className="font-ui text-sm font-semibold text-navy">Manage →</Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted">No upcoming events. Add one to show it on the site.</p>
            ) : (
              <ul className="divide-y divide-line">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <Link href={`/admin/events/${e.id}`} className="block px-6 py-3.5 no-underline transition hover:bg-mist">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-ink">{e.title}</span>
                        <Badge tone={statusTone(e.status)}>{e.status === "published" ? "Live" : "Draft"}</Badge>
                      </div>
                      <div className="text-sm text-muted">{eventTypeLabel(e.type)} · {fullDateTime(e.startsAt)}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {byKind.length > 0 && (
            <Card>
              <SectionLabel>Waiting for review</SectionLabel>
              <ul className="mt-4 space-y-2">
                {byKind.map((k) => (
                  <li key={k.kind} className="flex items-center justify-between text-[15px]">
                    <Link href={`/admin/applications?kind=${k.kind}&status=new`} className="text-ink no-underline hover:text-navy">{kindLabel(k.kind)}</Link>
                    <span className="font-display text-xl font-bold text-navy">{k.n}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
