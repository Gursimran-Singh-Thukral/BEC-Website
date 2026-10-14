import { admRaw } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const qs = new URL(req.url).searchParams.toString();
  const res = await admRaw(`/admin/applications.csv${qs ? `?${qs}` : ""}`).catch(() => null);
  if (!res || !res.ok) return new Response("Unauthorised", { status: res?.status ?? 502 });
  return new Response(res.body, { headers: { "Content-Type": res.headers.get("content-type") ?? "text/csv", "Content-Disposition": res.headers.get("content-disposition") ?? "attachment", "Cache-Control": "no-store" } });
}
