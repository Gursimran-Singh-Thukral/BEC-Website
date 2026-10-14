import { notFound } from "next/navigation";
import { adm, ApiError } from "@/lib/api";
import type { TeamMember } from "@/lib/types";
import { ConfirmButton } from "@/components/admin/forms";
import { PageHeader } from "@/components/admin/ui";
import { MemberForm } from "../MemberForm";
import { deleteTeamMember } from "../../actions";

export const metadata = { title: "Edit person" };

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let m: TeamMember;
  try {
    m = (await adm<{ member: TeamMember }>(`/admin/team/members/${id}`)).member;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  return (
    <>
      <PageHeader
        title={m.name}
        back={{ href: "/admin/team", label: "Team" }}
        actions={<form action={deleteTeamMember.bind(null, m.id)}><ConfirmButton message={`Remove ${m.name} from the team?`}>Delete</ConfirmButton></form>}
      />
      <MemberForm member={m} />
    </>
  );
}
