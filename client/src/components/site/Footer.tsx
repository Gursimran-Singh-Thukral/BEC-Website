import Link from "next/link";
import { CONTAINER } from "./ui";
import { cn, safeUrl } from "@/lib/utils";
import type { Settings } from "@/lib/types";

const colHead = "mb-1 font-ui text-[13px] font-semibold text-white";
const colLink = "text-ice no-underline hover:text-sky";

export function Footer({ settings }: { settings: Settings }) {
  const socials = [
    { label: "Instagram", href: safeUrl(settings.instagram) },
    { label: "LinkedIn", href: safeUrl(settings.linkedin) },
    { label: "YouTube", href: safeUrl(settings.youtube) },
  ].filter((s) => s.href);

  return (
    <footer id="contact" className="relative bg-linear-to-b from-ink to-ink-deep text-ice">
      <div className="h-1 bg-linear-to-r from-sky to-navy" />
      <div className={cn(CONTAINER, "pt-16 pb-9")}>
        <div className="flex flex-wrap justify-between gap-12">
          <div className="max-w-[440px] flex-[1_1_340px]">
            <div className="font-display text-[32px] leading-[1.05] font-bold text-white">Budding Entrepreneurs&apos; Club</div>
            <p className="mt-3 text-base text-white">Our mission: to turn ideas into impact and launch the innovators of tomorrow.</p>
            {settings.address && <p className="mt-2.5 text-[15px]">{settings.address}</p>}
            <a href={`mailto:${settings.contactEmail}`} className="mt-3.5 inline-block text-lg font-medium text-sky">
              {settings.contactEmail}
            </a>
          </div>
          <div className="flex flex-[0_1_160px] flex-col gap-2.5 text-[15px]">
            <div className={colHead}>Explore</div>
            <Link href="/initiatives" className={colLink}>Initiatives</Link>
            <Link href="/team" className={colLink}>Team</Link>
            <Link href="/handbooks" className={colLink}>Handbooks</Link>
          </div>
          <div className="flex flex-[0_1_160px] flex-col gap-2.5 text-[15px]">
            <div className={colHead}>Get involved</div>
            <Link href="/join?role=core_team#apply" className={colLink}>Join BEC</Link>
            <Link href="/join?role=cohort#apply" className={colLink}>Big Idea Cohort</Link>
            <Link href="/join#dropbox" className={colLink}>Idea Dropbox</Link>
            <Link href="/join?role=mentor#apply" className={colLink}>Become a mentor</Link>
          </div>
          {socials.length > 0 && (
            <div className="flex flex-[0_1_160px] flex-col gap-2.5 text-[15px]">
              <div className={colHead}>Follow us</div>
              {socials.map((s) => (
                <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" className={colLink}>
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="mt-14 flex flex-wrap justify-between gap-3 border-t border-sky/25 pt-5 text-sm text-faint">
          <span>© {new Date().getFullYear()} Budding Entrepreneurs&apos; Club, IIT Jammu</span>
          <span>Built by students, for students.</span>
        </div>
      </div>
    </footer>
  );
}
