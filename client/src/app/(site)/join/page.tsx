import type { Metadata } from "next";
import { ApplySection, IdeaDropbox } from "@/components/site/ApplyForms";
import { Door, doorIconProps as iconProps } from "@/components/site/Door";
import { FaqList } from "@/components/site/FaqList";
import { PageHero } from "@/components/site/PageHero";
import { ButtonLink, CONTAINER, SectionTag, SectionTitle, SpinRings } from "@/components/site/ui";
import { getJoin } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Join BEC",
  description: "Run the club, learn alongside it, mentor a team, or just hand us an idea. Every route is open to every branch and every year.",
};

const ROLE_KEYS = ["core_team", "member", "mentor", "cohort"] as const;

const FAQS = [
  { q: "Do I need a startup idea to join?", a: "No. Most members join to learn and meet people. The ideas tend to follow." },
  { q: "Is it only for B.Tech students?", a: "No. BEC is open to every branch and every year." },
  { q: "Who sees my idea in the Dropbox?", a: "Submissions go to the BEC team that reviews the Dropbox. They are never published on this website." },
  { q: "What happens after I apply?", a: "Your application is read by the relevant BEC leads, and someone gets back to you by email." },
];

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const initialRole = (ROLE_KEYS as readonly string[]).includes(role ?? "") ? (role as (typeof ROLE_KEYS)[number]) : "core_team";
  const { settings, verticals } = await getJoin();
  const coreOpen = settings.coreRecruitment === "open";

  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title={<>Pick a <span className="text-grad">door.</span></>}
        description="Run the club, learn alongside it, mentor a team, or just hand us an idea. Every route is open to every branch and every year."
      >
        <div className="mt-7 flex flex-wrap gap-2.5">
          <ButtonLink href="#paths" arrow="↓">See the options</ButtonLink>
          <ButtonLink href="#dropbox" variant="outline-white">Drop an idea</ButtonLink>
        </div>
      </PageHero>

      <section id="paths" className={cn(CONTAINER, "scroll-mt-20 py-[clamp(56px,7vw,96px)]")}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="rv-l">
            <SectionTag>Ways in</SectionTag>
            <SectionTitle>Choose your role.</SectionTitle>
          </div>
          <p className="rv-r max-w-[380px] text-body">Open to every branch and every year. Not sure which fits? Start as a member.</p>
        </div>
        <div className="mt-11 flex flex-wrap gap-5">
          <Door
            href="/join?role=core_team#apply" n="01" tone={0} minH={420} heading="h3"
            icon={<svg {...iconProps}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17.5" cy="9" r="2.4" /><path d="M16 14.2c3 .2 5 2.6 5 5.8" /></svg>}
            kicker={`${coreOpen ? "Open" : "Closed"}${settings.coreDeadline ? ` · Closes ${settings.coreDeadline}` : ""}`}
            title="Core team" body="Plan events, lead a vertical and run the club. A short form and one interview." cta={coreOpen ? "Open application" : "See details"}
          />
          <Door
            href="/join?role=member#apply" n="02" tone={2} minH={420} heading="h3"
            icon={<svg {...iconProps}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /></svg>}
            kicker="Always open" title="Member" body="Early access to sessions, the members’ group and first pick for cohort seats. One-minute sign-up, no commitment." cta="Become a member"
          />
          <Door
            href="/join?role=mentor#apply" n="03" tone={1} minH={420} heading="h3"
            icon={<svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>}
            kicker="Alumni · founders · faculty" title="Mentor" body="An hour a month with a cohort team makes more difference than you’d think. Remote is fine; pick your domain." cta="Become a mentor"
          />
        </div>
      </section>

      <ApplySection
        key={initialRole}
        initialRole={initialRole}
        verticals={verticals}
        coreOpen={coreOpen}
        cohortOpen={settings.cohortRecruitment === "open"}
        coreDeadline={settings.coreDeadline}
        cohortDeadline={settings.cohortDeadline}
      />

      {/* IDEA DROPBOX */}
      <section id="dropbox" className="clip-band relative scroll-mt-16 overflow-hidden text-white" style={{ background: "radial-gradient(circle at 10% 10%, rgba(77,182,255,0.4), rgba(77,182,255,0) 42%), linear-gradient(180deg, #1E3A8A, #111829)" }}>
        <SpinRings className="bec-spin par absolute top-[60px] -right-[200px] opacity-[0.12]" />
        <div className={cn(CONTAINER, "relative flex flex-wrap items-start gap-12 py-[clamp(112px,12vw,168px)]")}>
          <div className="rv-l flex-[1_1_380px]">
            <SectionTag tone="sky">Idea Dropbox · always open</SectionTag>
            <h2 className="mt-4 font-display text-[clamp(40px,5vw,72px)] leading-none font-bold tracking-[-0.02em]">
              Half an idea is <span className="text-grad">enough.</span>
            </h2>
            <p className="mt-5 max-w-[440px] text-ice">
              Tell us the problem in a few lines. Someone from BEC replies with where it could go: a mentor, the next cohort, a competition or a co-founder.
            </p>
            <div className="mt-7 flex max-w-[420px] flex-col gap-2.5">
              {["You drop the idea", "A BEC lead reads it", "We route it where it can grow"].map((t, i) => (
                <div key={t} className="flex items-center gap-3 rounded-[14px] border border-sky/30 bg-white/7 px-4 py-3">
                  <span className="font-display font-bold text-sky">0{i + 1}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rv-r min-w-0 flex-[1_1_480px]">
            <IdeaDropbox />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={cn(CONTAINER, "flex flex-wrap gap-12 py-[clamp(64px,8vw,112px)]")}>
        <div className="rv-l flex-[1_1_300px]">
          <SectionTag>FAQ</SectionTag>
          <SectionTitle>Questions.</SectionTitle>
          <p className="mt-3.5 text-body">
            Still unsure? Write to <a href={`mailto:${settings.contactEmail}`} className="font-medium text-navy underline">{settings.contactEmail}</a>.
          </p>
        </div>
        <div className="rv-r flex-[2_1_560px]">
          <FaqList items={FAQS} />
        </div>
      </section>
    </>
  );
}
