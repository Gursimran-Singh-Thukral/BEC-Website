import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputCls =
  "min-h-11 w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-faint focus:border-sky focus:ring-4 focus:ring-sky/15 disabled:bg-mist";
export const labelCls = "font-ui text-[13px] font-semibold text-navy";

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 font-ui text-[13px] font-semibold text-muted no-underline hover:text-navy">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-[clamp(30px,3.4vw,44px)] leading-[1.05] font-bold tracking-[-0.01em] text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-[640px] text-[15px] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={cn("rounded-[20px] border border-line bg-white shadow-[0_1px_2px_rgba(17,24,41,0.04)]", padded && "p-6", className)}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="clip-tab inline-block bg-navy py-[5px] pr-6 pl-2.5 font-ui text-xs font-semibold text-white">{children}</span>
  );
}

const BADGE: Record<string, string> = {
  sky: "bg-sky/20 text-navy",
  navy: "bg-navy text-white",
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-800",
  slate: "bg-mist text-body",
  violet: "bg-indigo-100 text-indigo-800",
};
export function Badge({ tone = "slate", children }: { tone?: keyof typeof BADGE; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-[3px] font-ui text-xs font-semibold whitespace-nowrap", BADGE[tone])}>{children}</span>;
}

export function statusTone(s: string): keyof typeof BADGE {
  return ({ new: "sky", in_review: "amber", shortlisted: "violet", accepted: "green", rejected: "red", archived: "slate", published: "green", draft: "amber" } as const)[s as "new"] ?? "slate";
}

const BTN = {
  primary: "bg-navy text-white hover:bg-navy-deep",
  sky: "bg-sky text-ink hover:bg-sky-deep hover:text-white",
  ghost: "border-[1.5px] border-line bg-white text-navy hover:border-sky",
  danger: "border-[1.5px] border-red-200 bg-white text-red-600 hover:bg-red-50",
  ink: "bg-ink text-white hover:bg-navy-deep",
} as const;
export type AdminBtn = keyof typeof BTN;
export const adminBtn = (v: AdminBtn = "primary", extra?: string) =>
  cn("inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-[18px] py-2 font-ui text-sm font-semibold no-underline transition disabled:cursor-not-allowed disabled:opacity-60", BTN[v], extra);

export function LinkBtn({ variant = "primary", className, ...rest }: ComponentProps<typeof Link> & { variant?: AdminBtn }) {
  return <Link {...rest} className={adminBtn(variant, className)} />;
}

export function Flash({ saved, deleted, error }: { saved?: string; deleted?: string; error?: string }) {
  const msg = error ? { t: error, c: "border-red-200 bg-red-50 text-red-700" } : saved ? { t: "Saved.", c: "border-emerald-200 bg-emerald-50 text-emerald-800" } : deleted ? { t: "Deleted.", c: "border-emerald-200 bg-emerald-50 text-emerald-800" } : null;
  if (!msg) return null;
  return (
    <div role="status" className={cn("bec-in mb-5 rounded-xl border px-4 py-3 text-sm font-medium", msg.c)}>
      {msg.t}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-2 rounded-[20px] border border-dashed border-line bg-white px-6 py-14 text-center">
      <div className="font-display text-2xl font-bold text-ink">{title}</div>
      {body && <p className="max-w-[420px] text-[15px] text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "light" }: { label: string; value: ReactNode; hint?: string; tone?: "light" | "dark" | "sky" }) {
  const styles = {
    light: "border border-line bg-white text-ink",
    dark: "text-white [background:radial-gradient(circle_at_90%_10%,rgba(77,182,255,0.45),rgba(77,182,255,0)_50%),linear-gradient(135deg,#111829,#1E3A8A)]",
    sky: "text-ink [background:linear-gradient(135deg,#4DB6FF,#DBEFFF)]",
  }[tone];
  return (
    <div className={cn("clip-corner-sm rounded-[20px] p-5", styles)}>
      <div className={cn("font-ui text-[13px] font-semibold", tone === "dark" ? "text-ice" : "text-muted", tone === "sky" && "text-navy")}>{label}</div>
      <div className="mt-1 font-display text-[44px] leading-none font-bold">{value}</div>
      {hint && <div className={cn("mt-1.5 text-[13px]", tone === "dark" ? "text-ice" : "text-muted")}>{hint}</div>}
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-left font-ui text-xs font-semibold tracking-wide text-muted uppercase", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3.5 align-middle text-[15px]", className)}>{children}</td>;
}
