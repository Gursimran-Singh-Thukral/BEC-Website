import { NextResponse } from "next/server";
import { getEvent } from "@/lib/data";

export const dynamic = "force-dynamic";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  let e;
  try {
    e = await getEvent(slug);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
  const end = e.endsAt ?? new Date(e.startsAt.getTime() + 2 * 60 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BEC IIT Jammu//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@bec-iitjammu`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(e.startsAt)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.summary)}`,
    `LOCATION:${esc(e.venue)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.slug}.ics"`,
    },
  });
}
