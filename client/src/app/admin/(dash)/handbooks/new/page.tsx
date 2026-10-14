import { PageHeader } from "@/components/admin/ui";
import { HandbookForm } from "../HandbookForm";

export const metadata = { title: "New handbook" };

export default function NewHandbookPage() {
  return (
    <>
      <PageHeader title="New handbook" back={{ href: "/admin/handbooks", label: "Handbooks" }} />
      <HandbookForm />
    </>
  );
}
