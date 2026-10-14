"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center px-5 text-center text-white" style={{ background: "linear-gradient(170deg, #1E3A8A 0%, #16285F 45%, #111829 100%)" }}>
      <div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">We&apos;re warming things up.</h1>
        <p className="mx-auto mt-3 max-w-md text-ice">
          The site couldn&apos;t reach its data just now. This usually fixes itself within a minute. Try again in a few seconds.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="btn cursor-pointer rounded-full bg-sky px-[22px] py-3.5 font-ui text-sm font-semibold text-ink">Try again</button>
          <Link href="/" className="btn rounded-full border-[1.5px] border-white/70 px-[21px] py-[13px] font-ui text-sm font-semibold text-white no-underline">Home</Link>
        </div>
      </div>
    </div>
  );
}
