import { PageHeader } from "@/components/admin/ui";
import { EventForm } from "../EventForm";

export const metadata = { title: "New event" };

export default function NewEventPage() {
  return (
    <>
      <PageHeader title="New event" back={{ href: "/admin/events", label: "All events" }} />
      <EventForm />
    </>
  );
}
