import { PageHeader } from "@/components/admin/ui";
import { MemberForm } from "../MemberForm";

export const metadata = { title: "Add person" };

export default function NewMemberPage() {
  return (
    <>
      <PageHeader title="Add person" back={{ href: "/admin/team", label: "Team" }} />
      <MemberForm />
    </>
  );
}
