"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { CONTAINER, SectionTag, SectionTitle, TabPill } from "./ui";
import { RsvpDialog } from "./RsvpDialog";
import { cn } from "@/lib/utils";

export type EventCard = {
  id: string;
  slug: string;
  type: string;
  typeLabel: string;
  title: string;
  summary: string;
  audience: string;
  venue: string;
  day: string;
  month: string;
  dateLabel: string;
  time: string;
  posterUrl: string | null;
  rsvpOpen: boolean;
  capacity: number | null;
  seatsLeft: number | null;
};

const STORAGE_KEY = "bec-rsvps";
const NONE: Record<string, boolean> = {};

export function UpcomingEvents({ events, types }: { events: EventCard[]; types: { value: string; label: string }[] }) {
  const [filter, setFilter] = useState("all");
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [going, setGoing] = useLocalStorage<Record<string, boolean>>(STORAGE_KEY, NONE);
  const [tick, setTick] = useState(0);
  const [rsvpFor, setRsvpFor] = useState<EventCard | null>(null);
  const lastNav = useRef(0);
  const touchX = useRef(0);

  const list = filter === "all" ? events : events.filter((e) => e.type === filter);
  const n = list.length;
  const cur = n ? Math.min(idx, n - 1) : 0;

  const go = useCallback(
    (d: number, manual: boolean) => {
      if (!n) return;
      if (manual) {
        lastNav.current = Date.now();
        setTick((t) => t + 1);
      }
      setIdx((i) => (((Math.min(i, n - 1) + d) % n) + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => {
      if (paused || Date.now() - lastNav.current < 5500 || rsvpFor) return;
      go(1, false);
    }, 6000);
    return () => clearInterval(t);
  }, [paused, go, n, rsvpFor]);

  const markGoing = (id: string) => setGoing((g) => ({ ...g, [id]: true }));

  const pad = (x: number) => String(x).padStart(2, "0");
  const goingCount = events.filter((e) => going[e.id]).length;

  return (
    <>
      <section id="upcoming" className={cn(CONTAINER, "scroll-mt-20 pt-[clamp(56px,7vw,96px)] pb-8")}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="rv-l">
            <SectionTag>Calendar</SectionTag>
            <SectionTitle>Upcoming.</SectionTitle>
          </div>
          <p className="rv-r max-w-[360px] text-body">
            Filter by format, flick through the slides, and tap RSVP to save your seat.
            {goingCount > 0 && ` You're going to ${goingCount} ${goingCount === 1 ? "event" : "events"}.`}
          </p>
        </div>
        {events.length > 0 && (
          <div role="group" aria-label="Filter by format" className="rv mt-8 flex flex-wrap gap-2.5">
            {[{ value: "all", label: "All" }, ...types].map((t) => (
              <TabPill
                key={t.value}
                active={filter === t.value}
                aria-pressed={filter === t.value}
                className="!min-h-[46px] !pr-8 !pl-4 !text-sm"
                onClick={() => {
                  lastNav.current = Date.now();
                  setTick((x) => x + 1);
                  setFilter(t.value);
                  setIdx(0);
                }}
              >
                {t.label}
              </TabPill>
            ))}
          </div>
        )}
      </section>

      {events.length === 0 ? (
        <div className={cn(CONTAINER)}>
          <div className="rounded-[20px] bg-linear-to-br from-mist to-ice p-10 text-center text-body">
            Nothing is scheduled right now. New sessions are announced here first, so check back soon.
          </div>
        </div>
      ) : (
        <div
          className="slider rv clip-notch-lg relative overflow-hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label="Upcoming events"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1, true);
          }}
        >
          <div className="track flex" style={{ transform: `translateX(${-cur * 100}%)` }}>
            {list.map((e, i) => {
              const active = i === cur;
              const full = e.seatsLeft === 0;
              const pct = e.capacity ? Math.round(((e.capacity - (e.seatsLeft ?? 0)) / e.capacity) * 100) : 0;
              return (
                <div
                  key={e.id}
                  id={`event-${e.slug}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${n}`}
                  aria-hidden={!active}
                  className={cn("relative w-full flex-[0_0_100%] scroll-mt-20 overflow-hidden text-white", `tone-${events.findIndex((x) => x.id === e.id) % 4}`)}
                >
                  <svg aria-hidden="true" className="bec-spin absolute -bottom-[260px] -left-[220px] opacity-[0.12]" width="620" height="620" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="96" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="4 8" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="#fff" strokeWidth="1" />
                  </svg>
                  <div className={cn(CONTAINER, "relative flex flex-wrap items-center gap-10 pt-[clamp(48px,6vw,88px)] pb-[clamp(112px,10vw,136px)]")}>
                    <div className={cn("slide-copy min-w-0 flex-[1_1_520px]", active && "is-active")}>
                      <SectionTag tone="sky">{e.typeLabel}</SectionTag>
                      <div className="mt-[18px] bg-linear-to-b from-white from-30% to-sky bg-clip-text font-display text-[clamp(64px,9vw,136px)] leading-[0.9] font-bold tracking-[-0.02em] text-transparent">
                        {e.day} {e.month}
                      </div>
                      <h3 className="mt-4 font-display text-[clamp(30px,3.6vw,52px)] leading-[1.05] font-bold">{e.title}</h3>
                      <p className="mt-2.5 text-lg text-ice">
                        {e.time}
                        {e.venue ? ` · ${e.venue}` : ""}
                        {e.audience ? ` · ${e.audience}` : ""}
                      </p>
                      {e.summary && <p className="mt-3 max-w-[560px] text-ice/90">{e.summary}</p>}
                      <div className="mt-[26px] flex flex-wrap items-center gap-3">
                        {going[e.id] ? (
                          <button type="button" tabIndex={active ? 0 : -1} className="btn bec-pop min-h-[50px] cursor-default rounded-full bg-white px-[26px] py-[13px] font-ui text-[15px] font-semibold text-navy">
                            You&apos;re in ✓
                          </button>
                        ) : e.rsvpOpen && !full ? (
                          <button
                            type="button"
                            tabIndex={active ? 0 : -1}
                            onClick={() => setRsvpFor(e)}
                            className="btn min-h-[50px] cursor-pointer rounded-full bg-sky px-[26px] py-[13px] font-ui text-[15px] font-semibold text-ink"
                          >
                            RSVP <span className="arr">→</span>
                          </button>
                        ) : (
                          <span className="min-h-[50px] rounded-full bg-white/15 px-[26px] py-[13px] font-ui text-[15px] font-semibold">
                            {full ? "Event full" : "RSVPs closed"}
                          </span>
                        )}
                        <a
                          href={`/api/events/${e.slug}/ics`}
                          tabIndex={active ? 0 : -1}
                          className="btn rounded-full border-[1.5px] border-white/70 px-6 py-3 font-ui text-[15px] font-semibold text-white no-underline"
                        >
                          Add to calendar
                        </a>
                      </div>
                      {e.capacity != null && (
                        <div className="mt-6 max-w-[360px]">
                          <div className="flex justify-between font-ui text-[13px] font-semibold text-ice">
                            <span>Seats filling</span>
                            <span>{full ? "Full" : `${e.seatsLeft} left`}</span>
                          </div>
                          <div className="mt-2 h-1.5 rounded-md bg-white/18">
                            <div className="h-full rounded-md bg-linear-to-r from-sky to-white" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={cn("slide-art min-w-0 flex-[1_1_380px]", active && "is-active")}>
                      <div
                        className="clip-corner-lg relative aspect-[4/3] overflow-hidden rounded-[26px] shadow-[0_24px_50px_rgba(0,0,0,0.3)]"
                      >
                        {e.posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={e.posterUrl} alt={`Poster for ${e.title}`} className="absolute inset-0 size-full object-cover" loading="lazy" />
                        ) : (
                          <>
                            <div className="bg-campus absolute inset-0" />
                            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(30,58,138,0.25), rgba(17,24,41,0.75))" }} />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute right-0 bottom-7 left-0">
            <div className={cn(CONTAINER, "flex flex-wrap items-center justify-between gap-4")}>
              <div className="pointer-events-auto flex items-center gap-[18px]">
                <span className="font-display text-xl font-bold text-white">
                  {pad(cur + 1)} / {pad(n)}
                </span>
                <div className="flex gap-2">
                  {list.map((e, i) => (
                    <button
                      key={e.id}
                      type="button"
                      aria-label={`Show event ${i + 1}`}
                      onClick={() => {
                        lastNav.current = Date.now();
                        setTick((x) => x + 1);
                        setIdx(i);
                      }}
                      className="relative h-6 w-11 cursor-pointer border-0 bg-transparent p-0"
                    >
                      <span className="absolute inset-x-0 top-2.5 h-1 overflow-hidden rounded bg-white/30">
                        {i === cur && <span key={`${filter}-${cur}-${tick}`} className="dot-fill block h-full bg-sky" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {n > 1 && (
                <div className="pointer-events-auto flex gap-2.5">
                  <button type="button" aria-label="Previous event" onClick={() => go(-1, true)} className="nav-btn grid size-[52px] cursor-pointer place-items-center rounded-full border-[1.5px] border-white/70 bg-white/8 text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button type="button" aria-label="Next event" onClick={() => go(1, true)} className="nav-btn grid size-[52px] cursor-pointer place-items-center rounded-full border-0 bg-sky text-ink">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {events.length > 0 && n === 0 && (
        <div className={CONTAINER}>
          <div className="rounded-[20px] bg-linear-to-br from-mist to-ice p-10 text-center text-body">
            Nothing scheduled in this format yet. Check back soon.
          </div>
        </div>
      )}
      <div className="h-[clamp(48px,6vw,80px)]" />

      {rsvpFor && (
        <RsvpDialog
          key={rsvpFor.id}
          eventId={rsvpFor.id}
          title={rsvpFor.title}
          open
          onClose={() => setRsvpFor(null)}
          onDone={() => markGoing(rsvpFor.id)}
        />
      )}
    </>
  );
}
