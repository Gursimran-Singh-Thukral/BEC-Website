import type { Metadata } from "next";
import { signOut } from "@/auth";
import { AdminShell } from "@/components/admin/AdminNav";
import { adm } from "@/lib/api";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | BEC Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
// Allow time for the API server to wake up on free hosting.
export const maxDuration = 60;

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const { newApplications: newApps } = await adm<{ newApplications: number }>("/admin/badge");

  async function out() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <AdminShell user={{ name: admin.name, email: admin.email }} newApplications={newApps} isOwner={admin.role === "owner"} signOutAction={out}>
      {children}
    </AdminShell>
  );
}
