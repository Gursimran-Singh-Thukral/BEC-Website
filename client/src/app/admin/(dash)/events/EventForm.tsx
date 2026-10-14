import Link from "next/link";
import type { EventRow as Event } from "@/lib/types";
import { EVENT_TYPES } from "@/lib/constants";
import { toISTInput } from "@/lib/time";
import { AdminForm, CheckField, SelectField, SubmitButton, TextArea, TextField, UploadField } from "@/components/admin/forms";
import { Card, SectionLabel } from "@/components/admin/ui";
import { saveEvent } from "../actions";

export function EventForm({ event }: { event?: Event }) {
  const action = saveEvent.bind(null, event?.id ?? null);
  return (
    <AdminForm action={action} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <SectionLabel>Details</SectionLabel>
          <TextField name="title" label="Title" required defaultValue={event?.title} placeholder="e.g. Founder's Forum with an alumnus" />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField name="type" label="Format" required defaultValue={event?.type ?? "founders_forum"} options={EVENT_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
            <TextField name="audience" label="Who it's for" defaultValue={event?.audience} placeholder="Open to all years" />
          </div>
          <TextArea name="summary" label="Description" rows={5} defaultValue={event?.summary} hint="Shown on the slide and in the calendar invite." />
        </Card>

        <Card className="flex flex-col gap-5">
          <SectionLabel>When &amp; where</SectionLabel>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="startsAt" type="datetime-local" label="Starts (IST)" required defaultValue={toISTInput(event?.startsAt)} />
            <TextField name="endsAt" type="datetime-local" label="Ends (IST, optional)" defaultValue={toISTInput(event?.endsAt)} />
          </div>
          <TextField name="venue" label="Venue" defaultValue={event?.venue} placeholder="e.g. Lecture Hall 3, Academic Block" />
        </Card>

        <Card className="flex flex-col gap-5">
          <SectionLabel>After the event</SectionLabel>
          <p className="-mt-2 text-sm text-muted">Shown in the &lsquo;Previously&rsquo; archive once the event is over.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="attendeeCount" type="number" label="Attendance" defaultValue={event?.attendeeCount} hint="Number of people who attended." />
            <TextField name="highlight" label="One-line highlight" defaultValue={event?.highlight} />
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <SectionLabel>Publishing</SectionLabel>
          <SelectField name="status" label="Status" defaultValue={event?.status ?? "draft"} options={[{ value: "draft", label: "Draft (hidden from the site)" }, { value: "published", label: "Published (visible on the site)" }]} />
          <CheckField name="rsvpOpen" label="RSVPs open" hint="Visitors can reserve a seat on the Initiatives page." defaultChecked={event?.rsvpOpen ?? true} />
          <TextField name="capacity" type="number" label="Capacity (optional)" defaultValue={event?.capacity} hint="Leave empty for unlimited seats." />
        </Card>
        <Card className="flex flex-col gap-5">
          <SectionLabel>Poster</SectionLabel>
          <UploadField name="posterUrl" label="Poster image" defaultValue={event?.posterUrl} hint="JPG, PNG or WebP, up to 6 MB. 4:3 works best." />
        </Card>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>{event ? "Save changes" : "Create event"}</SubmitButton>
          <Link href="/admin/events" className="font-ui text-sm font-semibold text-muted no-underline hover:text-navy">Cancel</Link>
        </div>
      </div>
    </AdminForm>
  );
}
