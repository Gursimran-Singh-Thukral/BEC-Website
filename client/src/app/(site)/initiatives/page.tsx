import type { Metadata } from "next";
import Link from "next/link";
import { CohortSteps } from "@/components/site/CohortSteps";
import { PageHero } from "@/components/site/PageHero";
import { UpcomingEvents, type EventCard } from "@/components/site/UpcomingEvents";
import { ButtonLink, CONTAINER, CtaBand, SectionTag, SectionTitle, SpinRings } from "@/components/site/ui";
import { EVENT_TYPES, eventTypeLabel } from "@/lib/constants";
import { getEvents } from "@/lib/data";
import { dayOf, monthShort, monthYear, timeOf, weekdayDate } from "@/lib/time";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Initiatives",
  description: "Every session BEC runs, the flagship Big Idea Cohort, and what we've done before.",
};

export default async function InitiativesPage() {
  const { settings, upcoming, past } = await getEvents();

  const cards: EventCard[] = upcoming.map((e) => ({
    id: e.id,
    slug: e.slug,
    type: e.type,
    typeLabel: eventTypeLabel(e.type),
    title: e.title,
    summary: e.summary,
    audience: e.audience,
    venue: e.venue,
    day: dayOf(e.startsAt),
    month: monthShort(e.startsAt),
    dateLabel: weekdayDate(e.startsAt),
    time: timeOf(e.startsAt),
    posterUrl: e.posterUrl,
    rsvpOpen: e.rsvpOpen,
    capacity: e.capacity,
    seatsLeft: e.seatsLeft,
  }));
  const presentTypes = EVENT_TYPES.filter((t) => cards.some((c) => c.type === t.value)).map((t) => ({ value: t.value, label: t.label }));
  const cohortOpen = settings.cohortRecruitment === "open";

  return (
    <>
      <PageHero
        eyebrow="Initiatives"
        title={<>What&apos;s <span className="text-grad">on.</span></>}
        description="Every session BEC runs this semester, the flagship cohort, and what we've done before. All open to every student at IIT Jammu."
      >
        <div className="mt-7 flex flex-wrap gap-2.5">
          <ButtonLink href="#upcoming" arrow="↓">Upcoming events</ButtonLink>
          <ButtonLink href="#cohort" variant="outline-white">Big Idea Cohort</ButtonLink>
        </div>
      </PageHero>

      <UpcomingEvents events={cards} types={presentTypes} />

      {/* COHORT */}
      <section
        id="cohort"
        className="clip-band relative scroll-mt-16 overflow-hidden text-white"
        style={{ background: "radial-gradient(circle at 90% 10%, rgba(77,182,255,0.4), rgba(77,182,255,0) 42%), linear-gradient(180deg, #1E3A8A, #111829)" }}
      >
        <SpinRings className="bec-spin par absolute bottom-10 -left-[200px] opacity-[0.12]" />
        <div className={cn(CONTAINER, "relative py-[clamp(112px,12vw,168px)]")}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="rv-l">
              <SectionTag tone="sky">Idea Vault{settings.cohortLabel ? ` · ${settings.cohortLabel}` : ""}</SectionTag>
              <SectionTitle sweep={false}>Big Idea Cohort.</SectionTitle>
              <p className="mt-3.5 max-w-[500px] text-ice">
                Submit a real-world problem, validate it with a structured framework, and present to mentors, investors and industry leaders, with a path into the incubation ecosystem.
              </p>
            </div>
            <Link
              href="/join?role=cohort#apply"
              className="btn rv-r inline-flex items-center gap-2.5 rounded-full bg-sky px-6 py-[15px] font-ui text-[15px] font-semibold text-ink no-underline"
            >
              {cohortOpen && <span className="bec-pulse size-2.5 rounded-full bg-white" />}
              {cohortOpen ? `Apply${settings.cohortDeadline ? ` by ${settings.cohortDeadline}` : ""}` : "Applications closed"} <span className="arr">→</span>
            </Link>
          </div>
          <CohortSteps />
        </div>
      </section>

      {/* PAST */}
      <section className={cn(CONTAINER, "py-[clamp(64px,8vw,112px)]")}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="rv-l">
            <SectionTag>Archive</SectionTag>
            <SectionTitle>Previously.</SectionTitle>
          </div>
          <p className="rv-r max-w-[360px] text-body">A look back at sessions that already happened.</p>
        </div>
        {past.length === 0 ? (
          <div className="mt-10 rounded-[20px] bg-linear-to-br from-mist to-ice p-10 text-center text-body">Past sessions will appear here once they&apos;ve happened.</div>
        ) : (
          <div className="mt-10 flex flex-wrap gap-5">
            {past.map((e, i) => {
              const meta = [e.attendeeCount != null ? `${e.attendeeCount} attended` : "", e.highlight].filter(Boolean).join(" · ");
              const photo = e.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.posterUrl} alt="" className="past-img size-full object-cover" loading="lazy" />
              ) : (
                <div
                  className={cn("past-img flex size-full items-center justify-center font-ui text-[13px] font-semibold text-ice", i === 0 && "bg-campus photo-par")}
                  style={i === 0 ? undefined : { background: "radial-gradient(circle at 80% 20%, rgba(77,182,255,0.7), rgba(77,182,255,0) 50%), linear-gradient(135deg, #1E3A8A, #111829)" }}
                />
              );
              if (i === 0)
                return (
                  <div key={e.id} className="rv flex-[2_1_520px]">
                    <div className="ticket-card clip-corner h-full overflow-hidden rounded-[22px] border border-line bg-white">
                      <div className="aspect-video overflow-hidden">{photo}</div>
                      <div className="px-6 py-[22px]">
                        <span className="font-ui text-xs font-semibold text-navy">{eventTypeLabel(e.type)} · {monthYear(e.startsAt)}</span>
                        <div className="mt-1.5 font-display text-[26px] leading-[1.1] font-bold">{e.title}</div>
                        {meta && <div className="mt-1 text-[15px] text-muted">{meta}</div>}
                      </div>
                    </div>
                  </div>
                );
              return null;
            })}
            {past.length > 1 && (
              <div className="flex flex-[1_1_300px] flex-col gap-5">
                {past.slice(1).map((e, i) => (
                  <div key={e.id} className={cn("rv", i === 0 ? "d1" : "d2")}>
                    <div className="ticket-card overflow-hidden rounded-[22px] border border-line bg-white">
                      <div className="aspect-[16/8] overflow-hidden">
                        {e.posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={e.posterUrl} alt="" className="past-img size-full object-cover" loading="lazy" />
                        ) : (
                          <div
                            className="past-img size-full"
                            style={{
                              background:
                                i === 0
                                  ? "radial-gradient(circle at 80% 20%, rgba(77,182,255,0.7), rgba(77,182,255,0) 50%), linear-gradient(135deg, #1E3A8A, #111829)"
                                  : "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.6), rgba(255,255,255,0) 50%), linear-gradient(135deg, #4DB6FF, #1E3A8A)",
                            }}
                          />
                        )}
                      </div>
                      <div className="px-[22px] py-[18px]">
                        <div className="font-display text-[21px] font-bold">{e.title}</div>
                        <div className="text-sm text-muted">
                          {monthYear(e.startsAt)}
                          {e.attendeeCount != null ? ` · ${e.attendeeCount} attended` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <CtaBand className="flex flex-wrap items-center justify-between gap-7">
        <h2 className="max-w-[720px] font-display text-[clamp(36px,5vw,72px)] leading-none font-bold tracking-[-0.02em]">Want to run something with us?</h2>
        <ButtonLink href={`mailto:${settings.contactEmail}`} variant="ink" arrow="→" className="!px-[26px] !py-4 !text-[15px]">Write to us</ButtonLink>
      </CtaBand>
    </>
  );
}
