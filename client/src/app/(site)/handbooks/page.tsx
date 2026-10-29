import type { Metadata } from "next";
import { HandbookShelf } from "@/components/site/HandbookShelf";
import { PageHero } from "@/components/site/PageHero";
import { SuggestForm } from "@/components/site/SuggestForm";
import { getHandbooks } from "@/lib/data";
import { safeUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Handbooks",
  description: "Short handbooks that answer the questions every first-time founder on campus asks. Free, written by students.",
};

export default async function HandbooksPage() {
  const { handbooks: books } = await getHandbooks();
  const next = (books.at(-1)?.volume ?? 0) + 1;
  return (
    <>
      <PageHero
        eyebrow="Resources · Free"
        title={<>Read <span className="text-grad">first.</span></>}
        description="Short handbooks that answer the questions every first-time founder on campus asks. Read online or grab the PDF."
      >
        <div className="mt-7 flex flex-wrap gap-2.5">
          {[`${books.length} ${books.length === 1 ? "volume" : "volumes"}`, "Free PDFs", "Written by students"].map((t) => (
            <span key={t} className="rounded-full border border-white/40 bg-white/8 px-4 py-[9px] font-ui text-sm font-semibold">{t}</span>
          ))}
        </div>
      </PageHero>

      <HandbookShelf
        books={books.map((b) => ({
          id: b.id,
          volume: b.volume,
          title: b.title,
          description: b.description,
          bestFor: b.bestFor,
          pages: b.pages,
          readMinutes: b.readMinutes,
          readUrl: safeUrl(b.readUrl),
          pdfUrl: safeUrl(b.pdfUrl),
          chapters: b.chapters,
        }))}
      />

      <section className="px-[clamp(12px,2.4vw,32px)] pb-[clamp(48px,6vw,80px)]">
        <div className="rv-z bg-cta clip-corner-xl relative mx-auto flex max-w-[1376px] flex-wrap items-center justify-between gap-7 overflow-hidden rounded-[32px] px-[clamp(24px,5vw,72px)] py-[clamp(44px,6vw,88px)] text-ink">
          <h2 className="flex-[1_1_420px] font-display text-[clamp(34px,4.6vw,64px)] leading-none font-bold tracking-[-0.02em]">
            What should Vol. {String(next).padStart(2, "0")} cover?
          </h2>
          <div className="flex-[1_1_380px]">
            <SuggestForm nextVolume={next} />
          </div>
        </div>
      </section>
    </>
  );
}
