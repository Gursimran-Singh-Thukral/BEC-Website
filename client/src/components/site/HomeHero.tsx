"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { CONTAINER } from "./ui";
import { useParallax } from "./PageHero";
import { cn } from "@/lib/utils";

export function HomeHero({ aside }: { aside: ReactNode }) {
  const { s, handlers } = useParallax();
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [launched, setLaunched] = useState(0);
  const seq = useRef(0);

  function onClick(e: React.MouseEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest("a")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const id = ++seq.current;
    setLaunched((n) => n + 1);
    setSparks((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }].slice(-12));
  }

  const path = "M70 320 C 40 170, 300 40, 560 60 C 840 80, 930 300, 660 380 C 430 450, 100 470, 70 320 Z";

  return (
    <section
      {...handlers}
      onClick={onClick}
      className="clip-hero relative cursor-crosshair overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 86% 46%, rgba(77,182,255,0.42) 0%, rgba(77,182,255,0) 40%), radial-gradient(circle at 6% 105%, rgba(77,182,255,0.22) 0%, rgba(77,182,255,0) 38%), linear-gradient(180deg, #1E3A8A 0%, #16285F 42%, #111829 100%)",
      }}
    >
      <div className="pointer-events-none relative z-[1]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-sky via-ice to-sky"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)" }}
        />
        <div className="relative overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% 84%, 0 95.5%)" }}>
          <Image
            src="/images/hero-poster.jpg"
            alt="BEC: It all starts with an idea. IIT Jammu campus"
            width={2820}
            height={477}
            priority
            className="poster-zoom block h-auto w-full origin-top object-cover object-top"
            style={{ aspectRatio: "2820 / 477" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(17,24,41,0) 70%, rgba(17,24,41,0.18) 100%)" }}
          />
        </div>
      </div>

      {s.hover && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute size-[560px] rounded-full"
          style={{
            left: s.mx,
            top: s.my,
            margin: "-280px 0 0 -280px",
            background: "radial-gradient(circle, rgba(77,182,255,0.22) 0%, rgba(77,182,255,0) 65%)",
          }}
        />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${(s.px * -18).toFixed(1)}px, ${(s.py * -12).toFixed(1)}px, 0)` }}
      >
        <div
          className="bec-drift absolute -top-5 -right-5 h-[calc(100%+40px)]"
          style={{
            width: "max(0px, min(40%, calc(100vw - 760px)))",
            background: "linear-gradient(200deg, rgba(77,182,255,0.55), rgba(77,182,255,0.06))",
            clipPath: "polygon(45% 0, 100% 0, 100% 100%, 0 100%)",
          }}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-transform duration-[350ms] ease-out"
        style={{ transform: `translate3d(${(s.px * -34).toFixed(1)}px, ${(s.py * -22).toFixed(1)}px, 0)` }}
      >
        <div
          className="bec-drift-slow absolute -top-5 -right-5 h-[calc(100%+40px)]"
          style={{
            width: "max(0px, min(40%, calc(100vw - 760px)))",
            background: "rgba(17,24,41,0.45)",
            clipPath: "polygon(100% 55%, 100% 100%, 38% 100%)",
          }}
        />
        <svg
          className="bec-hide-sm absolute top-[30%] -right-[260px] h-[420px] w-[640px] overflow-visible"
          viewBox="0 0 640 420"
        >
          <path d={path} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="6 10" strokeLinecap="round" opacity="0.8" />
        </svg>
        <div className="bec-hide-sm absolute top-[30%] -right-[260px] h-[420px] w-[640px]">
          <div
            className="bec-fly absolute top-0 left-0 h-6 w-[52px]"
            style={{
              offsetPath: `path('${path}')`,
              offsetRotate: "auto",
              filter: "drop-shadow(0 0 8px rgba(77,182,255,0.9)) drop-shadow(0 2px 3px rgba(17,24,41,0.35))",
            }}
          >
            <svg viewBox="0 0 52 24" width="52" height="24" className="block overflow-visible">
              <path className="bec-flame" d="M14 8 L0 12 L14 16 Z" fill="#4DB6FF" />
              <path d="M14 6 L8 0 H17 L24 6 Z" fill="#1E3A8A" />
              <path d="M14 18 L8 24 H17 L24 18 Z" fill="#1E3A8A" />
              <path d="M13 6 H35 C43 6 49 9.5 51 12 C49 14.5 43 18 35 18 H13 Z" fill="#fff" />
              <circle cx="37" cy="12" r="3.2" fill="#1E3A8A" />
              <path d="M13 6 V18" stroke="#4DB6FF" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      </div>

      {sparks.map((sp) => (
        <span
          key={sp.id}
          aria-hidden="true"
          className="bec-spark pointer-events-none absolute size-3.5 rounded-full bg-sky"
          style={{ left: sp.x, top: sp.y, margin: "-7px 0 0 -7px", boxShadow: "0 0 18px 4px rgba(77,182,255,0.8)" }}
        />
      ))}

      <div
        className={cn(
          CONTAINER,
          "hero-exit pointer-events-none relative flex flex-wrap items-end justify-between gap-10 pt-[clamp(8px,2vw,32px)] pb-[clamp(96px,10vw,140px)]",
        )}
      >
        <div className="max-w-[660px] flex-[1_1_520px]">
          <span className="clip-tab-lg inline-block bg-sky py-2 pr-[30px] pl-3.5 font-ui text-[13px] font-semibold tracking-[0.04em] text-ink">
            It all starts with an idea!
          </span>
          <h1 className="mt-6 font-display text-[clamp(48px,6.8vw,96px)] leading-none font-bold tracking-[-0.015em]">
            Ideas in.
            <br />
            <span className="text-grad">Ventures out.</span>
          </h1>
          <p className="mt-6 max-w-[540px] text-[clamp(17px,1.5vw,19px)] leading-[1.6] text-ice">
            The student-run E-Cell of IIT Jammu. Workshops, speaker sessions, bootcamps and case challenges, plus a direct line into the institute&apos;s incubation ecosystem.
          </p>
          <p className="mt-[18px] font-ui text-[13px] font-semibold text-sky">
            Click anywhere here to launch an idea ✦ {launched ? `(${launched} launched)` : ""}
          </p>
        </div>
        <div className="pointer-events-auto flex-[0_1_360px]">{aside}</div>
      </div>
    </section>
  );
}
