import { notFound } from "next/navigation";
import { adm, ApiError } from "@/lib/api";
import type { Vertical } from "@/lib/types";
import { ConfirmButton } from "@/components/admin/forms";
import { PageHeader } from "@/components/admin/ui";
import { VerticalForm } from "../VerticalForm";
import { deleteVertical } from "../../../actions";

export const metadata = { title: "Edit vertical" };

export default async function EditVerticalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let v: Vertical;
  try {
    v = (await adm<{ vertical: Vertical }>(`/admin/team/verticals/${id}`)).vertical;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  return (
    <>
      <PageHeader
        title={v.name}
        back={{ href: "/admin/team", label: "Team" }}
        actions={<form action={deleteVertical.bind(null, v.id)}><ConfirmButton message={`Delete the "${v.name}" vertical? People in it will stay on the team but lose this tag.`}>Delete</ConfirmButton></form>}
      />
      <VerticalForm vertical={v} />
    </>
  );
}
