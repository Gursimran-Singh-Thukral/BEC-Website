import { PageHeader } from "@/components/admin/ui";
import { VerticalForm } from "../VerticalForm";

export const metadata = { title: "Add vertical" };

export default function NewVerticalPage() {
  return (
    <>
      <PageHeader title="Add vertical" back={{ href: "/admin/team", label: "Team" }} />
      <VerticalForm />
    </>
  );
}
