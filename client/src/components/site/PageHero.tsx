"use client";

import { useRef, useState, type ReactNode } from "react";
import { CONTAINER } from "./ui";
import { cn } from "@/lib/utils";

/** Mouse-driven parallax state shared by the page heroes. */
export function useParallax() {
  const [s, setS] = useState({ hover: false, mx: 0, my: 0, px: 0, py: 0 });
  const raf = useRef(0);
  return {
    s,
    handlers: {
      onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - r.left;
        const my = e.clientY - r.top;
        cancelAnimationFrame(raf.current);
        raf.current = requestAnimationFrame(() =>
          setS({ hover: true, mx, my, px: (mx / r.width) * 2 - 1, py: (my / r.height) * 2 - 1 }),
        );
      },
      onMouseLeave: () => setS({ hover: false, mx: 0, my: 0, px: 0, py: 0 }),
    },
  };
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  const { s, handlers } = useParallax();
  return (
    <section {...handlers} className="bg-hero clip-hero relative overflow-hidden text-white">
      {s.hover && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute size-[520px] rounded-full"
          style={{
            left: s.mx,
            top: s.my,
            margin: "-260px 0 0 -260px",
            background: "radial-gradient(circle, rgba(77,182,255,0.22) 0%, rgba(77,182,255,0) 65%)",
          }}
        />
      )}
      <div
        aria-hidden="true"
        className="bec-hide-sm pointer-events-none absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${(s.px * -18).toFixed(1)}px, ${(s.py * -12).toFixed(1)}px, 0)` }}
      >
        <div
          className="bec-drift absolute -top-5 -right-5 h-[calc(100%+40px)] w-[46%] bg-linear-to-br from-sky to-ice"
          style={{ clipPath: "polygon(34% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
        <div
          role="img"
          aria-label="IIT Jammu campus"
          className="bec-drift bg-campus absolute -top-5 -right-5 h-[calc(100%+40px)] w-[46%]"
          style={{ clipPath: "polygon(38% 0, 100% 0, 100% 100%, 5% 100%)" }}
        />
        <div
          className="absolute -top-5 -right-5 h-[calc(100%+40px)] w-[46%]"
          style={{
            background: "linear-gradient(90deg, rgba(17,24,41,0.55), rgba(17,24,41,0) 60%)",
            clipPath: "polygon(38% 0, 100% 0, 100% 100%, 5% 100%)",
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="bec-hide-sm pointer-events-none absolute inset-0 transition-transform duration-[350ms] ease-out"
        style={{ transform: `translate3d(${(s.px * -30).toFixed(1)}px, ${(s.py * -20).toFixed(1)}px, 0)` }}
      >
        <div
          className="bec-drift-slow absolute -right-5 -bottom-5 h-[46%] w-[30%] bg-linear-to-br from-navy to-ink"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        />
      </div>
      <div className={cn(CONTAINER, "hero-exit relative pt-[clamp(56px,7vw,104px)] pb-[clamp(104px,11vw,150px)]")}>
        <div className="max-w-[640px]">
          <span className="clip-tab-lg inline-block bg-sky py-2 pr-[30px] pl-3.5 font-ui text-[13px] font-semibold tracking-[0.04em] text-ink">
            {eyebrow}
          </span>
          <h1 className="mt-6 font-display text-[clamp(48px,6.6vw,92px)] leading-none font-bold tracking-[-0.015em]">{title}</h1>
          <p className="mt-[22px] max-w-[520px] text-[clamp(17px,1.5vw,19px)] leading-[1.6] text-ice">{description}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
