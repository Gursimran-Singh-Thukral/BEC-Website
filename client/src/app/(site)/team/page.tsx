import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { VerticalTabs } from "@/components/site/VerticalTabs";
import { ButtonLink, CONTAINER, CtaBand, Rocket, SectionTag, SectionTitle, SpinRings } from "@/components/site/ui";
import { getTeam } from "@/lib/data";
import type { TeamMember } from "@/lib/types";
import { CARD_BGS, GRADIENTS, cn, initials, safeUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Team",
  description: "BEC is run entirely by students, with guidance from faculty. Every name here is someone you can message.",
};

const chip = "rounded-full border border-sky bg-white px-3 py-1 text-[13px]";

function Avatar({ m, className, style }: { m: TeamMember; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("grid place-items-center overflow-hidden rounded-full font-display font-bold text-white", className)} style={style}>
      {m.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.photoUrl} alt={m.name} className="size-full object-cover" loading="lazy" />
      ) : (
        initials(m.name)
      )}
    </div>
  );
}

function PersonCard({ m, i, tone }: { m: TeamMember; i: number; tone: "dark" | "light" }) {
  const mail = m.email ? `mailto:${m.email}` : null;
  return (
    <div className={cn("rv fac flex-[1_1_210px] max-w-[260px]", i % 3 === 1 && "d1", i % 3 === 2 && "d2")}>
      <div
        className={cn(
          "clip-corner-sm flex h-full flex-col items-center gap-3.5 rounded-[22px] px-5 pt-7 pb-6 text-center",
          tone === "dark" ? "text-white" : "border border-line bg-linear-to-b from-white to-mist text-ink",
        )}
        style={tone === "dark" ? { background: "radial-gradient(circle at 100% 0%, rgba(77,182,255,0.45), rgba(77,182,255,0) 55%), linear-gradient(150deg, #1E3A8A, #111829)" } : undefined}
      >
        <Avatar m={m} className="size-[132px] flex-none text-4xl shadow-[0_0_0_5px_rgba(77,182,255,0.35)]" style={{ background: GRADIENTS[i % GRADIENTS.length] }} />
        <div>
          <div className="font-display text-[22px] leading-[1.1] font-bold">{m.name}</div>
          {m.role && <div className={cn("mt-1.5 text-[15px]", tone === "dark" ? "text-ice" : "text-body")}>{m.role}</div>}
          {mail && (
            <a href={mail} className={cn("mt-2 inline-block text-sm font-medium", tone === "dark" ? "text-sky" : "text-navy")}>Email</a>
          )}
        </div>
      </div>
    </div>
  );
}

function CoreCard({ m, i }: { m: TeamMember; i: number }) {
  const li = safeUrl(m.linkedin);
  return (
    <div tabIndex={0} className={cn("rv flip h-[400px]", i % 4 === 1 && "d1", i % 4 === 2 && "d2", i % 4 === 3 && "d3")} aria-label={`${m.name}, ${m.role}`}>
      <div className="flip-inner">
        <div className="face clip-corner flex flex-col justify-between overflow-hidden rounded-3xl text-white" style={{ background: CARD_BGS[i % 4] }}>
          {m.photoUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.photoUrl} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
              <div />
            </>
          ) : (
            <div className="p-6 font-display text-[96px] leading-[0.85] font-bold text-white/90">{initials(m.name)}</div>
          )}
          <div className="relative bg-linear-to-b from-ink/0 via-ink/55 to-ink/85 px-6 pt-[72px] pb-6">
            <div className="font-display text-[26px] leading-[1.1] font-bold">{m.name}</div>
            <div className="mt-1 text-[15px] text-ice">{[m.role, m.branchYear].filter(Boolean).join(" · ")}</div>
            <div className="mt-2.5 font-ui text-xs font-semibold text-sky">Hover to flip ↻</div>
          </div>
        </div>
        <div className="face face-back clip-back flex flex-col gap-3 overflow-hidden rounded-3xl bg-linear-to-b from-white to-ice p-[26px] text-ink">
          {m.role && <span className="clip-tab-sm self-start bg-navy py-[5px] pr-5 pl-2.5 font-ui text-xs font-semibold text-white">{m.role}</span>}
          <div className="font-display text-2xl leading-[1.1] font-bold">{m.name}</div>
          {m.bio && <p className="text-[15px] text-body">{m.bio}</p>}
          {m.topics.length > 0 && (
            <>
              <div className="font-ui text-[13px] font-semibold text-navy">Ask me about</div>
              <div className="flex flex-wrap gap-1.5">{m.topics.map((t) => <span key={t} className={chip}>{t}</span>)}</div>
            </>
          )}
          {li && (
            <a href={li} target="_blank" rel="noopener noreferrer" className="btn mt-auto self-start rounded-full bg-navy px-[18px] py-[11px] font-ui text-sm font-semibold text-white no-underline">
              LinkedIn <span className="arr">→</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function TeamPage() {
  const { faculty, staff, core, verticals, teamCount: total, settings } = await getTeam();
  const open = settings.coreRecruitment === "open";

  return (
    <>
      <PageHero
        eyebrow="Our team"
        title={<>Who&apos;s <span className="text-grad">building.</span></>}
        description="BEC is run entirely by students, with guidance from faculty. Every name here is someone you can message."
      >
        <div className="mt-7 flex flex-wrap gap-2.5">
          {[total > 0 && `${total} team members`, verticals.length > 0 && `${verticals.length} verticals`].filter(Boolean).map((t) => (
            <span key={String(t)} className="rounded-full border border-white/40 bg-white/8 px-4 py-[9px] font-ui text-sm font-semibold">{t}</span>
          ))}
        </div>
      </PageHero>

      {(faculty.length > 0 || staff.length > 0) && (
        <section className={cn(CONTAINER, "pt-[clamp(56px,7vw,96px)]")}>
          <div className="rv-l">
            <SectionTag>Guided by</SectionTag>
            <SectionTitle>Professors in charge.</SectionTitle>
          </div>
          <div className="mt-9 flex flex-wrap gap-5">{faculty.map((m, i) => <PersonCard key={m.id} m={m} i={i} tone="dark" />)}</div>
          {staff.length > 0 && (
            <>
              <h3 className="rv-l mt-14 font-display text-[clamp(28px,3vw,40px)] leading-[1.05] font-bold text-ink">Staff.</h3>
              <div className="mt-6 flex flex-wrap gap-5">{staff.map((m, i) => <PersonCard key={m.id} m={m} i={i} tone="light" />)}</div>
            </>
          )}
        </section>
      )}

      <section className={cn(CONTAINER, "py-[clamp(64px,8vw,112px)]")}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="rv-l">
            <SectionTag>Leads</SectionTag>
            <SectionTitle>Core team.</SectionTitle>
          </div>
          <p className="rv-r max-w-[360px] text-body">Hover over (or tab to) a card to flip it and see what each lead is happy to help with.</p>
        </div>
        {core.length === 0 ? (
          <div className="mt-10 rounded-[20px] bg-linear-to-br from-mist to-ice p-10 text-center text-body">The core team will be announced here soon.</div>
        ) : (
          <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">{core.map((m, i) => <CoreCard key={m.id} m={m} i={i} />)}</div>
        )}
      </section>

      {verticals.length > 0 && (
        <section className="bg-band clip-band relative overflow-hidden text-white">
          <SpinRings className="bec-spin par absolute bottom-10 -left-[200px] opacity-[0.12]" />
          <div className={cn(CONTAINER, "relative py-[clamp(112px,12vw,168px)]")}>
            <div className="rv-l">
              <SectionTag tone="sky">How we&apos;re organised</SectionTag>
              <SectionTitle sweep={false}>Verticals.</SectionTitle>
              <p className="mt-3 max-w-[520px] text-ice">Pick a vertical to meet the people behind it.</p>
            </div>
            <VerticalTabs
              verticals={verticals.map((v) => ({
                id: v.id,
                name: v.name,
                blurb: v.blurb,
                members: v.members.map((m) => ({ id: m.id, name: m.name, branchYear: m.branchYear, isLead: m.isLead, photoUrl: m.photoUrl })),
              }))}
            />
          </div>
        </section>
      )}

      <div className="pt-[clamp(24px,4vw,48px)]">
        <CtaBand className="flex flex-wrap items-center justify-between gap-7">
          <div>
            <span className="clip-tab inline-flex items-center gap-2.5 bg-ink py-[7px] pr-7 pl-3 font-ui text-[13px] font-semibold text-white">
              <span className="bec-pulse size-2 rounded-full bg-sky" />
              Recruitment · {open ? "Open" : "Closed"}
            </span>
            <h2 className="mt-4 max-w-[720px] font-display text-[clamp(36px,5vw,72px)] leading-none font-bold tracking-[-0.02em]">Your name goes here next.</h2>
          </div>
          <ButtonLink href="/join?role=core_team#apply" variant="ink" className="launch !px-[26px] !py-4 !text-[15px]">
            Apply to the team <Rocket className="launch-rocket" />
          </ButtonLink>
        </CtaBand>
      </div>
    </>
  );
}
