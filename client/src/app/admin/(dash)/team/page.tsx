import Link from "next/link";
import { adm } from "@/lib/api";
import type { TeamMember, Vertical } from "@/lib/types";
import { TEAM_GROUPS } from "@/lib/constants";
import { initials } from "@/lib/utils";
import { Badge, Card, EmptyState, Flash, LinkBtn, PageHeader, SectionLabel } from "@/components/admin/ui";

export const metadata = { title: "Team" };

export default async function TeamAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const { members, verticals: vs } = await adm<{ members: TeamMember[]; verticals: Vertical[] }>("/admin/team");
  const vName = new Map(vs.map((v) => [v.id, v.name]));

  return (
    <>
      <PageHeader title="Team" subtitle="People shown on the Team page. Order within a group follows the 'Order' number." actions={<LinkBtn href="/admin/team/new" variant="sky">+ Add person</LinkBtn>} />
      <Flash saved={sp.saved} deleted={sp.deleted} />

      {members.length === 0 ? (
        <EmptyState title="No team members yet" action={<LinkBtn href="/admin/team/new">+ Add person</LinkBtn>} />
      ) : (
        TEAM_GROUPS.map((g) => {
          const list = members.filter((m) => m.group === g.value);
          if (!list.length) return null;
          return (
            <section key={g.value} className="mb-8">
              <div className="mb-3 flex items-center gap-3"><SectionLabel>{g.label}</SectionLabel><span className="text-sm text-muted">{list.length}</span></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((m) => (
                  <Link key={m.id} href={`/admin/team/${m.id}`} className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-3.5 no-underline transition hover:-translate-y-0.5 hover:border-sky hover:shadow-md">
                    <span className="grid size-14 flex-none place-items-center overflow-hidden rounded-full bg-linear-to-br from-sky to-navy font-display text-lg font-bold text-white">
                      {m.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.photoUrl} alt="" className="size-full object-cover" loading="lazy" />
                      ) : initials(m.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{m.name}</span>
                      <span className="block truncate text-sm text-muted">{[m.role, m.verticalId ? vName.get(m.verticalId) : ""].filter(Boolean).join(" · ") || "—"}</span>
                    </span>
                    {!m.active && <Badge tone="amber">Hidden</Badge>}
                  </Link>
                ))}
              </div>
            </section>
          );
        })
      )}

      <section className="mt-12">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div><SectionLabel>Verticals</SectionLabel><p className="mt-2 text-sm text-muted">The tabs in &lsquo;How we&rsquo;re organised&rsquo; on the Team page.</p></div>
          <LinkBtn href="/admin/team/verticals/new" variant="ghost">+ Add vertical</LinkBtn>
        </div>
        <Card padded={false} className="divide-y divide-line">
          {vs.length === 0 && <p className="p-6 text-center text-muted">No verticals yet.</p>}
          {vs.map((v) => (
            <Link key={v.id} href={`/admin/team/verticals/${v.id}`} className="flex items-center gap-4 px-5 py-3.5 no-underline transition hover:bg-mist">
              <span className="w-8 font-display text-lg font-bold text-sky">{v.sortOrder + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">{v.name}</span>
                <span className="block truncate text-sm text-muted">{v.blurb}</span>
              </span>
              <span className="text-sm text-muted">{members.filter((m) => m.verticalId === v.id).length} people</span>
            </Link>
          ))}
        </Card>
      </section>
    </>
  );
}
