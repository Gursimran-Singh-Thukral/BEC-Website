import { notFound } from "next/navigation";
import { adm, ApiError } from "@/lib/api";
import type { EventRow, RsvpRow } from "@/lib/types";
import { shortDateTime } from "@/lib/time";
import { Card, EmptyState, LinkBtn, PageHeader, SectionLabel, Td, Th } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/forms";
import { EventForm } from "../EventForm";
import { deleteEvent, deleteRsvp } from "../../actions";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data: { event: EventRow; rsvps: RsvpRow[] };
  try {
    data = await adm(`/admin/events/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const { event, rsvps } = data;

  return (
    <>
      <PageHeader
        title={event.title}
        back={{ href: "/admin/events", label: "All events" }}
        actions={
          <>
            {event.status === "published" && <LinkBtn href={`/initiatives#event-${event.slug}`} variant="ghost" target="_blank">View on site ↗</LinkBtn>}
            <form action={deleteEvent.bind(null, event.id)}>
              <ConfirmButton message={`Delete "${event.title}" and its ${rsvps.length} RSVP(s)? This cannot be undone.`}>Delete</ConfirmButton>
            </form>
          </>
        }
      />
      <EventForm event={event} />

      <div className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionLabel>RSVPs ({rsvps.length}{event.capacity ? ` of ${event.capacity}` : ""})</SectionLabel>
          {rsvps.length > 0 && <LinkBtn href={`/admin/events/${event.id}/rsvps.csv`} variant="ghost">Download CSV</LinkBtn>}
        </div>
        {rsvps.length === 0 ? (
          <EmptyState title="No RSVPs yet" body="People who reserve a seat from the website will appear here." />
        ) : (
          <Card padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse">
                <thead className="border-b border-line bg-mist"><tr><Th>Name</Th><Th>Email</Th><Th>RSVP&apos;d</Th><Th /></tr></thead>
                <tbody className="divide-y divide-line">
                  {rsvps.map((r) => (
                    <tr key={r.id}>
                      <Td className="font-medium">{r.name}</Td>
                      <Td><a href={`mailto:${r.email}`} className="text-navy">{r.email}</a></Td>
                      <Td className="whitespace-nowrap text-muted">{shortDateTime(r.createdAt)}</Td>
                      <Td className="text-right">
                        <form action={deleteRsvp.bind(null, event.id, r.id)}><button className="cursor-pointer font-ui text-sm font-semibold text-red-600">Remove</button></form>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
