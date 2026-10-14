import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { callRaw } from "@/lib/api-core";

export const runtime = "nodejs";

/** Relays an admin's file upload to the API server (which stores it and checks the file type). */
export async function POST(req: Request) {
  const email = (await auth())?.user?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "No file" }, { status: 400 });
  const res = await callRaw({ role: "admin", email }, "/admin/uploads", {
    method: "POST",
    body: new Uint8Array(await file.arrayBuffer()),
    headers: { "Content-Type": "application/octet-stream" },
  });
  const data = await res.json().catch(() => ({ error: "Upload failed" }));
  return NextResponse.json(data, { status: res.status === 403 ? 401 : res.status });
}
