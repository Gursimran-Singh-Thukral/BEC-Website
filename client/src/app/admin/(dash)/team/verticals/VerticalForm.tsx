import Link from "next/link";
import type { Vertical } from "@/lib/types";
import { AdminForm, SubmitButton, TextArea, TextField } from "@/components/admin/forms";
import { Card } from "@/components/admin/ui";
import { saveVertical } from "../../actions";

export function VerticalForm({ vertical }: { vertical?: Vertical }) {
  return (
    <AdminForm action={saveVertical.bind(null, vertical?.id ?? null)} className="max-w-[640px]">
      <Card className="flex flex-col gap-5">
        <TextField name="name" label="Name" required defaultValue={vertical?.name} />
        <TextArea name="blurb" label="What this vertical does" rows={3} defaultValue={vertical?.blurb} />
        <TextField name="sortOrder" type="number" label="Order" defaultValue={vertical?.sortOrder ?? 0} hint="Lower numbers appear first (0 is first)." />
        <div className="flex items-center gap-3">
          <SubmitButton>{vertical ? "Save changes" : "Add vertical"}</SubmitButton>
          <Link href="/admin/team" className="font-ui text-sm font-semibold text-muted no-underline hover:text-navy">Cancel</Link>
        </div>
      </Card>
    </AdminForm>
  );
}
