import Link from "next/link";
import type { Metadata } from "next";
import { Door, doorIconProps as iconProps } from "@/components/site/Door";
import { HomeHero } from "@/components/site/HomeHero";
import { PillarsTabs } from "@/components/site/PillarsTabs";
import { ButtonLink, CONTAINER, CtaBand, Rocket, SectionTag, SectionTitle, SpinRings } from "@/components/site/ui";
import { getHome } from "@/lib/data";
import { timeOf, weekdayDate } from "@/lib/time";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: { absolute: "BEC IIT Jammu | Ideas in. Ventures out." } };

const FORMATS = [
  ["Founder's Forum", "Our flagship speaker series, where founders and alumni share real journeys and lessons."],
  ["Insight Out", "Teams tackle real business case studies with structured thinking under pressure, professional judges and prizes."],
  ["ESDP", "Entrepreneurial Skills Development: pitching, communicating ideas clearly, BEC Talks on patents and finance, and skills workshops."],
  ["Open House", "Monthly sessions where students present ideas and get direct feedback."],
  ["Movie Night", "Entrepreneurial stories as a starting point for discussion on resilience and decisions."],
] as const;

const ECOSYSTEM = [
  { abbr: "I3C", name: "Institute Innovation and Incubation Council", line: "The institute's not-for-profit incubation arm.", bar: "from-ink to-navy" },
  { abbr: "I2EDC", name: "Innovation, Incubation & Entrepreneurship Development Cell", line: "Home to BEC and Protospace, the first point of contact for mentorship, pre-incubation guidance, grants and lab access for prototyping.", bar: "from-navy to-sky" },
  { abbr: "AIC", name: "Atal Incubation Centre", line: "Under the Atal Innovation Mission, NITI Aayog.", bar: "from-sky to-navy" },
  { abbr: "ACIC", name: "Atal Community Innovation Centre", line: "AIM, NITI Aayog. Focused on Jammu & Kashmir.", bar: "from-sky to-ice" },
] as const;

const NETWORK = [
  { t: "IITs" }, { t: "IIMs" }, { t: "NITs" }, { t: "Schools across J&K", style: "sky" }, { t: "Incubators" },
  { t: "Student E-Cells" }, { t: "Mentors", style: "white" }, { t: "Angel investors" },
] as const;

export default async function HomePage() {
  const { settings, next, pastCount, handbooks: books } = await getHome();
  const sessions = pastCount + (Number.parseInt(settings.statSessionsOffset, 10) || 0);

  const stats = [
    sessions >= 3 && { v: `${sessions}+`, l: "Sessions & workshops" },
    settings.statStudents && { v: `${settings.statStudents}+`, l: "Students reached" },
    settings.statPartners && { v: settings.statPartners, l: "Partner institutions" },
    { v: "4", l: "Incubation bodies on campus", hi: true },
  ].filter(Boolean) as { v: string; l: string; hi?: boolean }[];

  const nextCard = next ? (
    <Link
      href={`/initiatives#event-${next.slug}`}
      className="btn clip-corner-sm flex flex-col gap-3 rounded-2xl p-7 text-ink no-underline"
      style={{ background: "linear-gradient(160deg, #FFFFFF 60%, #DBEFFF 100%)" }}
    >
      <span className="flex items-center gap-2.5 font-ui text-xs font-semibold tracking-[0.06em] text-navy">
        <span className="bec-pulse size-2.5 rounded-full bg-sky" />
        NEXT UP{next.rsvpOpen ? " · REGISTRATIONS OPEN" : ""}
      </span>
      <span className="font-display text-[30px] leading-[1.05] font-bold">{next.title}</span>
      <span className="text-[15px] text-muted">
        {weekdayDate(next.startsAt)} · {timeOf(next.startsAt)}
        {next.venue ? ` · ${next.venue}` : ""}
      </span>
      <span className="mt-1.5 font-ui text-sm font-semibold text-navy">
        Details and RSVP <span className="arr">→</span>
      </span>
    </Link>
  ) : (
    <Link
      href="/initiatives"
      className="btn clip-corner-sm flex flex-col gap-3 rounded-2xl p-7 text-ink no-underline"
      style={{ background: "linear-gradient(160deg, #FFFFFF 60%, #DBEFFF 100%)" }}
    >
      <span className="flex items-center gap-2.5 font-ui text-xs font-semibold tracking-[0.06em] text-navy">
        <span className="bec-pulse size-2.5 rounded-full bg-sky" />
        WHAT&apos;S ON
      </span>
      <span className="font-display text-[30px] leading-[1.05] font-bold">Our next session is being planned</span>
      <span className="text-[15px] text-muted">Browse the calendar and what we ran before.</span>
      <span className="mt-1.5 font-ui text-sm font-semibold text-navy">
        See initiatives <span className="arr">→</span>
      </span>
    </Link>
  );

  return (
    <>
      <HomeHero aside={nextCard} />

      {/* THREE WAYS IN */}
      <section className={cn(CONTAINER, "py-[clamp(56px,7vw,104px)]")}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="rv-l">
            <SectionTag>Get involved</SectionTag>
            <SectionTitle>Three ways in.</SectionTitle>
          </div>
          <p className="rv-r max-w-[400px] text-body">
            Pick the door that fits where you are. You don&apos;t need a startup, a team or a pitch deck to walk through any of them.
          </p>
        </div>
        <div className="mt-12 flex flex-wrap gap-5">
          <Door
            href="/join?role=core_team#apply" n="01" tone={0}
            icon={<svg {...iconProps}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17.5" cy="9" r="2.4" /><path d="M16 14.2c3 .2 5 2.6 5 5.8" /></svg>}
            kicker={`Recruitment · ${settings.coreRecruitment === "open" ? "Open" : "Closed"}`}
            title="Join the team" body="Core team and member applications. Run events, build the community, learn by doing." cta="Open application"
          />
          <Door
            href="/initiatives#cohort" n="02" tone={1}
            icon={<svg {...iconProps}><path d="M14 4c3.5-1 6 0 6 0s1 2.5 0 6l-6 6-6-6z" /><path d="M8 10l-3 .5L3 13l4 1" /><path d="M14 16l-.5 3L11 21l-1-4" /><circle cx="15.5" cy="8.5" r="1.4" /><path d="M6 18c-1 1-1.5 3-1.5 3s2-.5 3-1.5" /></svg>}
            kicker={`Programme${settings.cohortLabel ? ` · ${settings.cohortLabel}` : ""}`}
            title="Big Idea Cohort" body="Submit a real-world problem, validate it, and pitch a prototyped solution to mentors, investors and industry leaders." cta="Apply to the cohort"
          />
          <Door
            href="/join#dropbox" n="03" tone={2}
            icon={<svg {...iconProps}><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" /></svg>}
            kicker="Always open" title="Idea Dropbox" body="Half-formed is fine. We route it to a mentor, a cohort, a competition or a co-founder." cta="Drop your idea"
          />
        </div>
      </section>

      {/* NUMBERS */}
      <section className="px-[clamp(12px,2.4vw,32px)]">
        <div
          className="rv-z clip-notch mx-auto flex max-w-[1376px] flex-wrap gap-4 rounded-[28px] px-[clamp(20px,4vw,56px)] py-[clamp(36px,5vw,64px)]"
          style={{ background: "radial-gradient(circle at 90% 10%, rgba(77,182,255,0.5), rgba(77,182,255,0) 45%), linear-gradient(120deg, #111829, #1E3A8A)" }}
        >
          {stats.map((s) => (
            <div
              key={s.l}
              className={cn(
                "stat flex-[1_1_220px] rounded-[18px] border p-7 text-white",
                s.hi ? "border-sky/60 bg-sky/20" : "border-sky/35 bg-white/8",
              )}
            >
              <div className={cn("font-display text-[clamp(42px,4.4vw,60px)] leading-none font-bold", s.hi && "text-sky")}>{s.v}</div>
              <div className="mt-2 font-ui text-sm font-semibold text-ice">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className={cn(CONTAINER, "py-[clamp(64px,8vw,120px)]")}>
        <div className="flex flex-wrap items-end gap-12">
          <div className="rv-l flex-[1_1_520px]">
            <SectionTag>Who we are</SectionTag>
            <SectionTitle>
              Not an exception.
              <br />
              An expectation.
            </SectionTitle>
          </div>
          <div className="rv-r flex-[1_1_380px] rounded-[22px] bg-linear-to-br from-sky to-navy p-0.5">
            <div className="flex flex-col gap-[18px] rounded-[20px] bg-white p-7">
              <div>
                <div className="font-ui text-sm font-semibold text-navy">Mission</div>
                <p className="mt-1.5 text-body">To turn ideas into impact and launch the innovators of tomorrow.</p>
              </div>
              {settings.vision && (
                <>
                  <div className="h-px bg-linear-to-r from-sky to-sky/0" />
                  <div>
                    <div className="font-ui text-sm font-semibold text-navy">Vision</div>
                    <p className="mt-1.5 text-body">{settings.vision}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <blockquote className="rv mt-14 max-w-[820px] border-l-4 border-sky pl-6 text-[clamp(19px,2vw,24px)] leading-[1.5] font-medium text-ink">
          Every IIT is built to train engineers. A smaller number of us also try to build people who notice problems worth solving, and go build the answer.
        </blockquote>
        <PillarsTabs />
      </section>

      {/* WHAT WE RUN */}
      <section
        className="clip-band relative overflow-hidden text-white"
        style={{ background: "radial-gradient(circle at 100% 0%, rgba(77,182,255,0.3), rgba(77,182,255,0) 40%), linear-gradient(180deg, #111829, #16285F)" }}
      >
        <SpinRings className="bec-spin par absolute top-20 -right-40 opacity-[0.12]" size={520} />
        <div className={cn(CONTAINER, "relative py-[clamp(112px,12vw,168px)]")}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="rv-l">
              <SectionTag tone="sky">Formats</SectionTag>
              <SectionTitle sweep={false}>What we run.</SectionTitle>
            </div>
            <ButtonLink href="/initiatives" arrow="→" className="rv-r">Full calendar</ButtonLink>
          </div>
          {FORMATS.map(([name, line], i) => (
            <Link
              key={name}
              href="/initiatives"
              className={cn(
                "run-row rv flex flex-wrap items-center gap-x-8 gap-y-2 rounded-r-full border-t border-sky/35 px-4 py-[26px] text-white no-underline",
                i === FORMATS.length - 1 && "border-b",
              )}
            >
              <span className="run-num flex-[0_0_56px] font-display text-lg font-bold text-sky">0{i + 1}</span>
              <span className="run-name flex-[1_1_340px] font-display text-[clamp(26px,2.6vw,36px)] leading-[1.1] font-bold">{name}</span>
              <span className="flex-[1_1_340px] text-ice">{line}</span>
              <span className="run-go flex-none text-[22px] text-sky">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className={cn(CONTAINER, "py-[clamp(64px,8vw,112px)]")}>
        <div className="rv-l">
          <SectionTag>The ecosystem</SectionTag>
          <SectionTitle className="max-w-[900px] !text-[clamp(34px,4.2vw,58px)] leading-[1.06]">Idea to execution, without leaving campus.</SectionTitle>
        </div>
        <div className="relative mt-10 overflow-hidden rounded-3xl">
          <div
            role="img"
            aria-label="IIT Jammu campus entrance"
            className="bg-campus unclip h-[clamp(220px,30vw,420px)]"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 80%, 0 100%)" }}
          />
          <span className="clip-tab-lg absolute top-5 left-5 bg-white py-2 pr-[30px] pl-3.5 font-ui text-[13px] font-semibold text-navy">IIT Jammu campus</span>
        </div>
        <div className="relative -mt-10 flex flex-wrap gap-4 px-[clamp(0px,2vw,24px)]">
          {ECOSYSTEM.map((e, i) => (
            <div key={e.abbr} className={cn("rv flex-[1_1_250px]", i === 1 && "d1", i === 2 && "d2", i === 3 && "d3")}>
              <div className="eco h-full rounded-[20px] border border-line bg-linear-to-b from-white from-55% to-mist p-[26px]">
                <div className={cn("eco-bar h-[5px] w-11 rounded-md bg-linear-to-r", e.bar)} />
                <div className="mt-[18px] font-display text-[40px] leading-none font-bold text-navy">{e.abbr}</div>
                <div className="mt-2.5 font-medium text-ink">{e.name}</div>
                {e.line && <p className="mt-1.5 text-[15px] text-body">{e.line}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NETWORK */}
      <section className="px-[clamp(12px,2.4vw,32px)]">
        <div
          className="rv-z clip-notch-lg relative mx-auto max-w-[1376px] overflow-hidden rounded-[28px] py-[clamp(48px,6vw,88px)] text-white"
          style={{ background: "radial-gradient(circle at 15% 0%, rgba(77,182,255,0.55), rgba(77,182,255,0) 45%), linear-gradient(135deg, #1E3A8A, #111829)" }}
        >
          <div className="flex flex-wrap items-end justify-between gap-6 px-[clamp(20px,4vw,56px)]">
            <div>
              <SectionTag tone="sky">Beyond campus</SectionTag>
              <h2 className="mt-4 font-display text-[clamp(34px,4.2vw,58px)] leading-[1.06] font-bold tracking-[-0.015em]">A network that keeps growing.</h2>
              <p className="mt-3.5 max-w-[520px] text-ice">
                Open to all higher education institutions and every discipline: mentorship, lab access and grants for the initial phase, plus school outreach and warm introductions when your idea needs someone specific.
              </p>
            </div>
            <ButtonLink href="#contact" variant="white" arrow="→">Partner with us</ButtonLink>
          </div>
          <div className="marquee mt-11 overflow-hidden" aria-label="Who we work with">
            <div className="marquee-track flex w-max gap-3 py-2.5">
              {[0, 1].flatMap((copy) =>
                NETWORK.map((n) => (
                  <span
                    key={`${copy}-${n.t}`}
                    aria-hidden={copy === 1}
                    className={cn(
                      "chip rounded-full border px-[22px] py-3 font-ui text-lg font-semibold whitespace-nowrap",
                      "style" in n && n.style === "sky" ? "border-sky bg-sky text-ink" : "style" in n && n.style === "white" ? "border-white bg-white text-navy" : "border-white/50",
                    )}
                  >
                    {n.t}
                  </span>
                )),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HANDBOOKS */}
      {books.length > 0 && (
        <section className={cn(CONTAINER, "py-[clamp(64px,8vw,120px)]")}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="rv-l">
              <SectionTag>Free resources</SectionTag>
              <SectionTitle>The BEC Handbooks.</SectionTitle>
            </div>
            <p className="rv-r max-w-[380px] text-body">Short guides written by students who went through it first. Hover to open one up.</p>
          </div>
          <div className="mt-12 flex flex-wrap gap-6">
            {books.slice(0, 4).map((b, i) => (
              <Link key={b.id} href="/handbooks" className={cn("book-wrap rv flex-[1_1_240px] no-underline", i === 1 && "d1", i === 2 && "d2", i === 3 && "d3")}>
                <div className={cn("book bk-" + (i % 4), "flex min-h-[340px] flex-col justify-between rounded-[6px_22px_22px_6px] py-7 pr-7 pl-[38px]", i % 4 === 3 && "border border-ice")}>
                  <span className="font-ui text-xs font-semibold tracking-[0.1em] opacity-85">VOL. {String(b.volume).padStart(2, "0")}</span>
                  <span className="font-display text-[30px] leading-[1.05] font-bold">{b.title}</span>
                  <span className="font-ui text-sm font-semibold">Read →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CLOSING CTA */}
      <CtaBand>
        <svg className="par pointer-events-none absolute right-[4%] -bottom-10 opacity-35" aria-hidden="true" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 4c3.5-1 6 0 6 0s1 2.5 0 6l-6 6-6-6z" /><path d="M8 10l-3 .5L3 13l4 1" /><path d="M14 16l-.5 3L11 21l-1-4" /><circle cx="15.5" cy="8.5" r="1.4" />
        </svg>
        <h2 className="relative max-w-[820px] font-display text-[clamp(42px,6vw,88px)] leading-none font-bold tracking-[-0.02em]">You don&apos;t need a startup to start.</h2>
        <div className="relative mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/join" variant="ink" className="launch !px-[26px] !py-4 !text-[15px]">
            Join BEC <Rocket className="launch-rocket" />
          </ButtonLink>
          <ButtonLink href="/join#dropbox" variant="outline-ink" className="!px-[25px] !py-[15px] !text-[15px]">Drop an idea</ButtonLink>
        </div>
      </CtaBand>
    </>
  );
}
