"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: ReactNode; badge?: number; ownerOnly?: boolean };

const ico = (d: ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

export function AdminShell({
  children,
  user,
  newApplications,
  isOwner,
  signOutAction,
}: {
  children: ReactNode;
  user: { name: string; email: string };
  newApplications: number;
  isOwner: boolean;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items: Item[] = [
    { href: "/admin", label: "Overview", icon: ico(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>) },
    { href: "/admin/events", label: "Events", icon: ico(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>) },
    { href: "/admin/applications", label: "Applications", badge: newApplications, icon: ico(<><path d="M4 4h16v12H8l-4 4z" /><path d="M8 9h8M8 12h5" /></>) },
    { href: "/admin/team", label: "Team", icon: ico(<><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17.5" cy="9" r="2.4" /><path d="M16 14.2c3 .2 5 2.6 5 5.8" /></>) },
    { href: "/admin/handbooks", label: "Handbooks", icon: ico(<><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11" /></>) },
    { href: "/admin/settings", label: "Site settings", icon: ico(<><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" /></>) },
    { href: "/admin/admins", label: "Admins", ownerOnly: true, icon: ico(<><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>) },
  ];

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
      {items.filter((i) => !i.ownerOnly || isOwner).map((i) => {
        const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-ui text-[15px] font-semibold no-underline transition",
              active ? "bg-sky text-ink shadow-[0_6px_16px_rgba(77,182,255,0.35)]" : "text-ice hover:bg-white/10",
            )}
          >
            {i.icon}
            <span className="flex-1">{i.label}</span>
            {!!i.badge && (
              <span className={cn("grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs font-bold", active ? "bg-ink text-white" : "bg-sky text-ink")}>{i.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const panel = (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link href="/admin" className="flex items-center gap-3 no-underline" onClick={() => setOpen(false)}>
        <span className="rounded-lg bg-white px-2 py-1.5"><Image src="/images/bec-logo.png" alt="BEC" width={73} height={30} className="h-[30px] w-auto" /></span>
        <span className="font-display text-lg leading-tight font-bold text-white">Admin</span>
      </Link>
      {nav}
      <div className="rounded-2xl border border-sky/25 bg-white/5 p-3.5">
        <div className="truncate text-sm font-semibold text-white">{user.name || user.email}</div>
        <div className="truncate text-xs text-ice">{user.email}</div>
        <div className="mt-3 flex gap-2">
          <Link href="/" target="_blank" className="flex-1 rounded-full border border-white/30 px-3 py-1.5 text-center font-ui text-xs font-semibold text-white no-underline hover:bg-white/10">View site ↗</Link>
          <form action={signOutAction} className="flex-1">
            <button className="w-full cursor-pointer rounded-full bg-white/10 px-3 py-1.5 font-ui text-xs font-semibold text-white hover:bg-white/20">Sign out</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mist">
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-[270px] lg:block"
        style={{ background: "radial-gradient(circle at 100% 0%, rgba(77,182,255,0.28), rgba(77,182,255,0) 45%), linear-gradient(180deg, #16285F, #111829)" }}
      >
        {panel}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5 no-underline">
          <Image src="/images/bec-logo.png" alt="BEC" width={60} height={25} className="h-[25px] w-auto" />
          <span className="font-display text-lg font-bold text-ink">Admin</span>
        </Link>
        <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-lg border border-line text-navy">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <div className="bec-in absolute inset-y-0 left-0 w-[280px] max-w-[85vw]" style={{ background: "linear-gradient(180deg, #16285F, #111829)" }}>
            {panel}
          </div>
        </div>
      )}

      <main className="lg:pl-[270px]">
        <div className="mx-auto max-w-[1180px] px-[clamp(16px,3vw,40px)] py-[clamp(24px,3vw,44px)]">{children}</div>
      </main>
    </div>
  );
}
