import Link from "next/link";
import { adm } from "@/lib/api";
import type { Handbook } from "@/lib/types";
import { AdminForm, CheckField, SubmitButton, TextArea, TextField, UploadField } from "@/components/admin/forms";
import { Card, SectionLabel } from "@/components/admin/ui";
import { saveHandbook } from "../actions";

export async function HandbookForm({ book }: { book?: Handbook }) {
  const { nextVolume: nextVol } = await adm<{ nextVolume: number }>("/admin/handbooks");
  return (
    <AdminForm action={saveHandbook.bind(null, book?.id ?? null)} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <SectionLabel>Details</SectionLabel>
          <div className="grid gap-5 sm:grid-cols-[120px_1fr]">
            <TextField name="volume" type="number" label="Volume" required defaultValue={book?.volume ?? nextVol} />
            <TextField name="title" label="Title" required defaultValue={book?.title} />
          </div>
          <TextArea name="description" label="Description" rows={4} defaultValue={book?.description} />
          <div className="grid gap-5 sm:grid-cols-3">
            <TextField name="bestFor" label="Best for" defaultValue={book?.bestFor} placeholder="the curious" />
            <TextField name="pages" type="number" label="Pages" defaultValue={book?.pages} />
            <TextField name="readMinutes" type="number" label="Minutes to read" defaultValue={book?.readMinutes} />
          </div>
          <TextArea name="chapters" label="Chapters" rows={6} defaultValue={book?.chapters.join("\n")} hint="One chapter title per line. Readers can tick them off as they go." />
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <SectionLabel>Files</SectionLabel>
          <UploadField name="pdfUrl" label="PDF" accept="application/pdf" defaultValue={book?.pdfUrl} hint="Upload a PDF (up to 25 MB) or paste a link." />
          <TextField name="readUrl" label="Read-online link (optional)" defaultValue={book?.readUrl} placeholder="https://" />
        </Card>
        <Card className="flex flex-col gap-5">
          <SectionLabel>Publishing</SectionLabel>
          <CheckField name="published" label="Visible on the website" defaultChecked={book?.published ?? true} />
        </Card>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>{book ? "Save changes" : "Create volume"}</SubmitButton>
          <Link href="/admin/handbooks" className="font-ui text-sm font-semibold text-muted no-underline hover:text-navy">Cancel</Link>
        </div>
      </div>
    </AdminForm>
  );
}
