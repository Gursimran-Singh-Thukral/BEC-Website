"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { CONTAINER, SectionTag, SectionTitle, TabPill } from "./ui";
import { cn } from "@/lib/utils";

export type HandbookView = {
  id: string;
  volume: number;
  title: string;
  description: string;
  bestFor: string;
  pages: number | null;
  readMinutes: number | null;
  readUrl: string | null;
  pdfUrl: string | null;
  chapters: string[];
};

const QUIZ = ["just curious", "sitting on an idea", "pitching soon", "looking for incubation"];
const KEY = "bec-handbook-progress";
const NONE: Record<string, boolean> = {};

export function HandbookShelf({ books }: { books: HandbookView[] }) {
  const [sel, setSel] = useState(0);
  const [quiz, setQuiz] = useState(-1);
  const [read, setRead] = useLocalStorage<Record<string, boolean>>(KEY, NONE);

  const toggle = (k: string) => setRead((r) => ({ ...r, [k]: !r[k] }));

  if (!books.length) {
    return (
      <section className={cn(CONTAINER, "py-24 text-center text-body")}>
        <p>The handbooks are being prepared. Check back soon.</p>
      </section>
    );
  }
  const b = books[Math.min(sel, books.length - 1)];
  const done = b.chapters.filter((_, c) => read[`${b.id}-${c}`]).length;
  const pct = b.chapters.length ? Math.round((done / b.chapters.length) * 100) : 0;
  const meta = [
    b.pages ? `${b.pages} pages` : "",
    b.readMinutes ? `${b.readMinutes} min read` : "",
    b.bestFor ? `Best for: ${b.bestFor}` : "",
  ].filter(Boolean).join(" · ");

  return (
    <>
      <section className={cn(CONTAINER, "pt-[clamp(56px,7vw,96px)] pb-6")}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="rv-l">
            <SectionTag>The library</SectionTag>
            <SectionTitle>Pick your handbook.</SectionTitle>
          </div>
          <p className="rv-r max-w-[380px] text-body">Not sure where to start? Tell us where you are, or pull a book off the shelf.</p>
        </div>
        <div role="group" aria-label="Where are you right now?" className="rv mt-7 flex flex-wrap items-center gap-2.5">
          <span className="mr-1.5 font-ui text-sm font-semibold text-navy">I&apos;m…</span>
          {QUIZ.map((q, i) => (
            <TabPill
              key={q}
              className="quiz"
              aria-pressed={quiz === i}
              active={quiz === i}
              onClick={() => {
                setQuiz(i);
                setSel(Math.min(i, books.length - 1));
              }}
            >
              {q}
            </TabPill>
          ))}
        </div>

        <div className="rv mt-16">
          <div className="flex flex-wrap items-end justify-center gap-[clamp(14px,2.4vw,32px)] px-[clamp(8px,3vw,40px)]">
            {books.map((x, i) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setSel(i)}
                aria-pressed={i === sel}
                aria-label={x.title}
                className={cn("book-btn flex-[0_1_230px] cursor-pointer border-0 bg-transparent p-0 text-left", i === sel && "is-sel")}
              >
                <span className={cn("book-cover flex h-[clamp(260px,26vw,330px)] flex-col justify-between rounded-[6px_20px_20px_6px] py-6 pr-[22px] pl-[34px]", `bk-${i % 4}`)}>
                  <span className="font-ui text-xs font-semibold tracking-[0.1em] opacity-85">VOL. {String(x.volume).padStart(2, "0")}</span>
                  <span className="font-display text-[clamp(22px,2.2vw,28px)] leading-[1.05] font-bold">{x.title}</span>
                  <span className="font-ui text-[13px] font-semibold">{i === sel ? "Open below ↓" : "Pull it out →"}</span>
                </span>
              </button>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="-mt-1.5 h-[18px] rounded-md bg-linear-to-b from-navy to-ink shadow-[0_18px_30px_rgba(17,24,41,0.25)]"
            style={{ clipPath: "polygon(18px 0, calc(100% - 18px) 0, 100% 100%, 0 100%)" }}
          />
        </div>
      </section>

      <section className={cn(CONTAINER, "pt-8 pb-[clamp(64px,8vw,112px)]")}>
        <div
          key={b.id}
          className="bec-in bg-panel clip-corner-lg flex flex-wrap gap-x-14 gap-y-8 rounded-[28px] p-[clamp(28px,4vw,52px)]"
        >
          <div className="flex-[1_1_400px]">
            <div className="text-grad-deep font-display text-[clamp(64px,8vw,112px)] leading-[0.9] font-bold">{String(b.volume).padStart(2, "0")}</div>
            <h3 className="mt-3 font-display text-[clamp(28px,3vw,42px)] leading-[1.05] font-bold text-ink">{b.title}</h3>
            <p className="mt-3 text-[19px] text-body">{b.description}</p>
            {meta && <p className="mt-2.5 font-ui text-sm font-semibold text-navy">{meta}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              {b.readUrl ? (
                <a href={b.readUrl} target="_blank" rel="noopener noreferrer" className="btn rounded-full bg-navy px-6 py-3.5 font-ui text-[15px] font-semibold text-white no-underline">
                  Read online <span className="arr">→</span>
                </a>
              ) : null}
              {b.pdfUrl ? (
                <a href={b.pdfUrl} download className="btn rounded-full border-[1.5px] border-navy bg-white px-[23px] py-[13px] font-ui text-[15px] font-semibold text-navy no-underline">
                  Download PDF ↓
                </a>
              ) : null}
              {!b.readUrl && !b.pdfUrl && (
                <span className="rounded-full bg-white px-6 py-3.5 font-ui text-[15px] font-semibold text-navy">Coming soon</span>
              )}
            </div>
          </div>
          {b.chapters.length > 0 && (
            <div className="flex-[1_1_360px]">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-ui text-sm font-semibold text-navy">Inside · tick off as you read</span>
                <span className="font-ui text-[13px] font-semibold text-body">{done === b.chapters.length ? "Finished ✓" : `${done} of ${b.chapters.length} read`}</span>
              </div>
              <div className="mt-2.5 h-1.5 rounded-md bg-white">
                <div className="meter-fill h-full rounded-md bg-linear-to-r from-sky to-navy" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-4 flex flex-col gap-2.5">
                {b.chapters.map((c, ci) => {
                  const k = `${b.id}-${ci}`;
                  const isDone = !!read[k];
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={isDone}
                      onClick={() => toggle(k)}
                      className="chk flex min-h-14 cursor-pointer items-center gap-3.5 rounded-2xl border-0 bg-white px-4 py-3 text-left text-ink shadow-[0_6px_16px_rgba(30,58,138,0.08)]"
                    >
                      {isDone ? (
                        <span className="bec-pop grid size-7 flex-none place-items-center rounded-full bg-linear-to-br from-sky to-navy text-[15px] text-white">✓</span>
                      ) : (
                        <span className="grid size-7 flex-none place-items-center rounded-full border-2 border-sky font-ui text-xs font-semibold text-navy">{ci + 1}</span>
                      )}
                      <span className="flex-auto">{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
