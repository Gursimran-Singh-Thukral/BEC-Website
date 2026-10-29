"use client";

import { useState } from "react";
import { TabPill } from "./ui";

const PILLARS = [
  { label: "Observe", line: "Ask why something is broken, instead of accepting that it just is." },
  { label: "Validate", line: "Check the problem is real and worth solving, before building anything." },
  { label: "Prototype", line: "Build the smallest version that tests the idea, not the dream version." },
  { label: "Iterate", line: "Improve based on what real users tell you, not what you assumed." },
];

export function PillarsTabs() {
  const [i, setI] = useState(0);
  const cur = PILLARS[i];
  return (
    <div className="rv mt-10">
      <h3 className="font-display text-[clamp(24px,2.6vw,32px)] font-bold text-ink">How ideas become startups</h3>
      <p className="mt-2 mb-5 max-w-[720px] text-body">
        Most students don&apos;t arrive with a startup. They arrive with curiosity: a complaint about the mess, the Wi-Fi, a portal that never works right. BEC&apos;s job is turning that curiosity into a repeatable way of thinking.
      </p>
      <div role="tablist" aria-label="How ideas become startups" className="flex flex-wrap gap-2.5">
        {PILLARS.map((p, idx) => (
          <TabPill key={p.label} role="tab" aria-selected={idx === i} active={idx === i} onClick={() => setI(idx)}>
            {p.label}
          </TabPill>
        ))}
      </div>
      <div
        role="tabpanel"
        className="clip-corner relative mt-4 flex flex-wrap items-center gap-x-12 gap-y-6 overflow-hidden rounded-3xl p-[clamp(28px,4vw,48px)]"
        style={{
          background:
            "radial-gradient(circle at 95% 15%, rgba(77,182,255,0.4), rgba(77,182,255,0) 45%), linear-gradient(135deg, #F1F5F9, #DBEFFF)",
        }}
      >
        <div key={`n${i}`} className="bec-in text-grad-deep flex-none font-display text-[clamp(72px,9vw,128px)] leading-[0.9] font-bold">
          0{i + 1}
        </div>
        <div key={`t${i}`} className="bec-in-2 flex-[1_1_380px]">
          <div className="font-display text-[clamp(28px,3vw,40px)] leading-[1.05] font-bold text-ink">{cur.label}</div>
          <p className="mt-2.5 text-[19px] text-body">{cur.line}</p>
        </div>
      </div>
    </div>
  );
}
