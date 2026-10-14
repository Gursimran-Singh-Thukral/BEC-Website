"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CONTAINER } from "./ui";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/initiatives", label: "Initiatives" },
  { href: "/team", label: "Team" },
  { href: "/handbooks", label: "Handbooks" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onJoin = pathname === "/join";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 text-ink backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <nav aria-label="Main" className={cn(CONTAINER, "flex flex-wrap items-center justify-between gap-4 py-3.5")}>
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3.5 no-underline md:flex-none" onClick={() => setOpen(false)}>
          <Image src="/images/bec-logo.png" alt="BEC" width={97} height={40} priority className="h-10 w-auto" />
          <span className="hidden flex-col border-l border-line pl-3.5 min-[420px]:flex font-ui text-[13px] leading-[1.3] font-semibold">
            <span className="text-ink">Budding Entrepreneurs&apos; Club</span>
            <span className="text-navy">IIT Jammu</span>
          </span>
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="grid size-11 place-items-center rounded-lg border border-line text-navy md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <div
          className={cn(
            "w-full flex-col items-stretch gap-1 font-ui text-sm font-semibold md:flex md:w-auto md:flex-row md:items-center md:gap-x-7",
            open ? "flex" : "hidden",
          )}
        >
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href) && l.href !== "#contact";
            return (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b-2 py-2.5 no-underline",
                  active ? "border-sky text-navy" : "border-transparent text-body hover:text-navy",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/join"
            onClick={() => setOpen(false)}
            className={cn(
              "btn mt-2 rounded px-5 py-3 text-center text-white no-underline md:mt-0",
              onJoin ? "bg-ink" : "bg-navy",
            )}
          >
            Join BEC
          </Link>
        </div>
      </nav>
    </header>
  );
}
