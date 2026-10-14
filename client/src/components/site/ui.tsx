import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const CONTAINER = "mx-auto max-w-[1280px] px-[clamp(20px,4vw,56px)]";

type Tone = "navy" | "sky" | "white" | "ink";
const TAG_TONES: Record<Tone, string> = {
  navy: "bg-navy text-white",
  sky: "bg-sky text-ink",
  white: "bg-white text-navy",
  ink: "bg-ink text-white",
};

/** The angled "tab" label that sits above every section heading. */
export function SectionTag({
  children,
  tone = "navy",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "clip-tab inline-block py-[7px] pr-7 pl-3 font-ui text-[13px] font-semibold",
        TAG_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  children,
  sweep = true,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  sweep?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={cn(
        "mt-4 font-display text-[clamp(38px,4.8vw,66px)] leading-[1.04] font-bold tracking-[-0.015em]",
        sweep ? "sweep text-ink" : "",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

const BTN_VARIANTS = {
  sky: "bg-sky text-ink",
  navy: "bg-navy text-white",
  ink: "bg-ink text-white",
  white: "bg-white text-navy",
  "outline-white": "border-[1.5px] border-white/70 text-white !py-[13px] !px-[21px]",
  "outline-ink": "border-[1.5px] border-ink text-ink bg-white/35 !py-[13px] !px-[21px]",
  "outline-navy": "border-[1.5px] border-navy text-navy bg-white !py-[13px] !px-[23px]",
} as const;
export type BtnVariant = keyof typeof BTN_VARIANTS;

export const btnClass = (variant: BtnVariant, extra?: string) =>
  cn(
    "btn inline-flex items-center gap-2.5 rounded-full px-[22px] py-3.5 font-ui text-sm font-semibold no-underline",
    BTN_VARIANTS[variant],
    extra,
  );

export function ButtonLink({
  variant = "sky",
  arrow,
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & { variant?: BtnVariant; arrow?: string }) {
  return (
    <Link {...rest} className={btnClass(variant, className)}>
      {children}
      {arrow ? <span className="arr">{arrow}</span> : null}
    </Link>
  );
}

/** Filter / tab pill with the slanted right edge. */
export function TabPill({
  active,
  tone = "light",
  className,
  children,
  ...rest
}: ComponentProps<"button"> & { active: boolean; tone?: "light" | "dark" }) {
  const styles =
    tone === "light"
      ? active
        ? "bg-linear-to-r from-navy to-sky text-white"
        : "bg-ice text-navy"
      : active
        ? "bg-linear-to-r from-sky to-ice text-ink"
        : "bg-white/10 text-white";
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "pill clip-pill-tab min-h-12 cursor-pointer border-0 py-3 pr-[34px] pl-[18px] font-ui text-[15px] font-semibold",
        styles,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Rocket({ size = 20, className, stroke = "#4DB6FF", fill }: { size?: number; className?: string; stroke?: string; fill?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4c3.5-1 6 0 6 0s1 2.5 0 6l-6 6-6-6z" fill={fill} />
      <path d="M8 10l-3 .5L3 13l4 1" />
      <path d="M14 16l-.5 3L11 21l-1-4" />
      <circle cx="15.5" cy="8.5" r="1.4" />
    </svg>
  );
}

export function SpinRings({ className, color = "#4DB6FF", size = 560 }: { className?: string; color?: string; size?: number }) {
  return (
    <svg className={className} aria-hidden="true" width={size} height={size} viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="96" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 8" />
      <circle cx="100" cy="100" r="62" fill="none" stroke={color} strokeWidth="1" />
    </svg>
  );
}

/** Full-width gradient call-to-action block used at the bottom of most pages. */
export function CtaBand({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className="px-[clamp(12px,2.4vw,32px)] pb-[clamp(48px,6vw,80px)]">
      <div
        className={cn(
          "rv-z bg-cta clip-corner-xl relative mx-auto max-w-[1376px] overflow-hidden rounded-[32px] px-[clamp(24px,5vw,72px)] py-[clamp(48px,7vw,96px)] text-ink",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span role="alert" className="text-[13px] font-medium text-red-600">
      {message}
    </span>
  );
}
