import Link from "next/link";
import { adm } from "@/lib/api";
import type { Handbook } from "@/lib/types";
import { Badge, Card, EmptyState, Flash, LinkBtn, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Handbooks" };

export default async function HandbooksAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const { handbooks: rows } = await adm<{ handbooks: Handbook[] }>("/admin/handbooks");
  return (
    <>
      <PageHeader title="Handbooks" subtitle="The volumes shown on the Handbooks page. Add a PDF or link to enable the Read and Download buttons." actions={<LinkBtn href="/admin/handbooks/new" variant="sky">+ New volume</LinkBtn>} />
      <Flash saved={sp.saved} deleted={sp.deleted} />
      {rows.length === 0 ? (
        <EmptyState title="No handbooks yet" action={<LinkBtn href="/admin/handbooks/new">+ New volume</LinkBtn>} />
      ) : (
        <Card padded={false} className="divide-y divide-line overflow-hidden">
          {rows.map((h) => (
            <Link key={h.id} href={`/admin/handbooks/${h.id}`} className="flex items-center gap-4 px-5 py-4 no-underline transition hover:bg-mist">
              <span className="w-14 font-display text-2xl font-bold text-sky">{String(h.volume).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">{h.title}</span>
                <span className="block truncate text-sm text-muted">{h.description}</span>
              </span>
              <span className="hidden gap-2 sm:flex">
                {h.pdfUrl && <Badge tone="green">PDF</Badge>}
                {h.readUrl && <Badge tone="sky">Online</Badge>}
                {!h.pdfUrl && !h.readUrl && <Badge tone="amber">No file yet</Badge>}
              </span>
              <Badge tone={h.published ? "green" : "amber"}>{h.published ? "Published" : "Draft"}</Badge>
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
