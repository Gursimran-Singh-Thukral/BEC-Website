import { notFound } from "next/navigation";
import { adm, ApiError } from "@/lib/api";
import type { Handbook } from "@/lib/types";
import { ConfirmButton } from "@/components/admin/forms";
import { PageHeader } from "@/components/admin/ui";
import { HandbookForm } from "../HandbookForm";
import { deleteHandbook } from "../../actions";

export const metadata = { title: "Edit handbook" };

export default async function EditHandbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let b: Handbook;
  try {
    b = (await adm<{ handbook: Handbook }>(`/admin/handbooks/${id}`)).handbook;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  return (
    <>
      <PageHeader
        title={`Vol. ${String(b.volume).padStart(2, "0")}: ${b.title}`}
        back={{ href: "/admin/handbooks", label: "Handbooks" }}
        actions={<form action={deleteHandbook.bind(null, b.id)}><ConfirmButton message={`Delete "${b.title}"?`}>Delete</ConfirmButton></form>}
      />
      <HandbookForm book={b} />
    </>
  );
}
