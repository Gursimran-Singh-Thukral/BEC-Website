import { admRaw } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Streams the API's CSV through, so the browser downloads it from this site (signed in as the admin). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const res = await admRaw(`/admin/events/${id}/rsvps.csv`).catch(() => null);
  if (!res || !res.ok) return new Response("Unauthorised or not found", { status: res?.status ?? 502 });
  return new Response(res.body, { headers: { "Content-Type": res.headers.get("content-type") ?? "text/csv", "Content-Disposition": res.headers.get("content-disposition") ?? "attachment", "Cache-Control": "no-store" } });
}
