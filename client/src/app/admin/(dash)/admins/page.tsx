import { redirect } from "next/navigation";
import { adm } from "@/lib/api";
import type { Admin } from "@/lib/types";
import { requireAdmin } from "@/lib/admin-auth";
import { ADMIN_EMAIL_DOMAIN } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import { AdminForm, ConfirmButton, SubmitButton, TextField } from "@/components/admin/forms";
import { Badge, Card, Flash, PageHeader, SectionLabel, Td, Th } from "@/components/admin/ui";
import { addAdmin, removeAdmin, setAdminRole } from "../actions";

export const metadata = { title: "Admins" };

export default async function AdminsPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> }) {
  const me = await requireAdmin();
  if (me.role !== "owner") redirect("/admin");
  const sp = await searchParams;
  const { admins: rows } = await adm<{ admins: Admin[] }>("/admin/admins");
  return (
    <>
      <PageHeader title="Admins" subtitle={`Only these @${ADMIN_EMAIL_DOMAIN} accounts can sign in to the dashboard. Owners can manage this list.`} />
      <Flash saved={sp.saved} deleted={sp.deleted} error={sp.error} />

      <Card padded={false} className="mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="border-b border-line bg-mist"><tr><Th>Account</Th><Th>Role</Th><Th>Last sign-in</Th><Th /></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((a) => (
                <tr key={a.id}>
                  <Td>
                    <div className="font-medium text-ink">{a.name || a.email}{a.id === me.id && <span className="ml-2 text-xs text-muted">(you)</span>}</div>
                    {a.name && <div className="text-sm text-muted">{a.email}</div>}
                  </Td>
                  <Td><Badge tone={a.role === "owner" ? "navy" : "sky"}>{a.role === "owner" ? "Owner" : "Admin"}</Badge></Td>
                  <Td className="text-muted">{a.lastLoginAt ? relativeTime(a.lastLoginAt) : "Never"}</Td>
                  <Td className="text-right">
                    {a.id !== me.id && (
                      <div className="flex justify-end gap-3">
                        <form action={setAdminRole.bind(null, a.id, a.role === "owner" ? "admin" : "owner")}>
                          <button className="cursor-pointer font-ui text-sm font-semibold text-navy">{a.role === "owner" ? "Make admin" : "Make owner"}</button>
                        </form>
                        <form action={removeAdmin.bind(null, a.id)}>
                          <ConfirmButton message={`Remove ${a.email}? They will lose access immediately.`}>Remove</ConfirmButton>
                        </form>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="max-w-[560px]">
        <SectionLabel>Add an admin</SectionLabel>
        <AdminForm action={addAdmin} className="mt-4 flex flex-col gap-4">
          <TextField name="email" type="email" label="Email" required placeholder={`name@${ADMIN_EMAIL_DOMAIN}`} />
          <TextField name="name" label="Name (optional)" />
          <div><SubmitButton pendingText="Adding…">Add admin</SubmitButton></div>
        </AdminForm>
      </Card>
    </>
  );
}
