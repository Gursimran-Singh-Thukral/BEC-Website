import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const BGS = [
  "radial-gradient(circle at 100% 0%, rgba(77,182,255,0.55), rgba(77,182,255,0) 55%), linear-gradient(155deg, #1E3A8A, #16285F)",
  "radial-gradient(circle at 0% 100%, rgba(77,182,255,0.4), rgba(77,182,255,0) 50%), linear-gradient(155deg, #111829, #1E3A8A)",
  "radial-gradient(circle at 100% 0%, rgba(77,182,255,0.55), rgba(77,182,255,0) 50%), linear-gradient(160deg, #DBEFFF, #F1F5F9 70%)",
];
const BTNS = ["bg-white text-navy", "bg-sky text-ink", "bg-navy text-white"];

export const doorIconProps = {
  width: 52, height: 52, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
} as const;

/** One of the three "doors" (large angled cards) used on Home and Join. */
export function Door({
  href, n, tone, icon, kicker, title, body, cta, minH = 440, heading: H = "h3",
}: {
  href: string; n: string; tone: 0 | 1 | 2; icon: ReactNode; kicker: string;
  title: string; body: string; cta: string; minH?: number; heading?: "h2" | "h3";
}) {
  const light = tone === 2;
  return (
    <div className={cn("rv flex-[1_1_300px]", tone === 1 && "d1", tone === 2 && "d2")}>
      <Link href={href} className={cn("door block no-underline", light ? "text-ink" : "text-white")}>
        <div
          className="clip-corner-lg relative flex flex-col justify-between gap-7 overflow-hidden rounded-[22px] p-8"
          style={{ background: BGS[tone], minHeight: minH }}
        >
          <div className="flex items-start justify-between">
            <span className="door-icon" style={{ color: light ? "#1E3A8A" : "#4DB6FF" }}>{icon}</span>
            <span className={cn("door-num mr-[34px] font-display text-lg font-bold opacity-80", light ? "text-navy" : "text-sky")}>{n}</span>
          </div>
          <div>
            <div className={cn("font-ui text-xs font-semibold", light ? "text-navy" : "text-ice")}>{kicker}</div>
            <H className="mt-2.5 font-display text-[34px] leading-[1.05] font-bold">{title}</H>
            <p className={cn("mt-3", light ? "text-body" : "text-ice")}>{body}</p>
            <span className={cn("btn mt-[22px] inline-block rounded-full px-[22px] py-3.5 font-ui text-sm font-semibold", BTNS[tone])}>
              {cta} <span className="arr">→</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
