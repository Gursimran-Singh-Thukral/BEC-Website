"use client";

import { useState } from "react";
import { TabPill } from "./ui";
import { GRADIENTS, initials } from "@/lib/utils";

export type VerticalView = {
  id: string;
  name: string;
  blurb: string;
  members: { id: string; name: string; branchYear: string; isLead: boolean; photoUrl: string | null }[];
};

export function VerticalTabs({ verticals }: { verticals: VerticalView[] }) {
  const [i, setI] = useState(0);
  const v = verticals[Math.min(i, verticals.length - 1)];
  if (!v) return null;
  return (
    <>
      <div role="tablist" aria-label="Verticals" className="rv mt-8 flex flex-wrap gap-2.5">
        {verticals.map((x, idx) => (
          <TabPill key={x.id} tone="dark" role="tab" aria-selected={idx === i} active={idx === i} onClick={() => setI(idx)}>
            {x.name}
          </TabPill>
        ))}
      </div>
      <div
        role="tabpanel"
        className="clip-corner rv mt-[18px] rounded-[26px] bg-card-light p-[clamp(26px,3.5vw,48px)] text-ink"
        style={{ clipPath: "polygon(0 0, calc(100% - 48px) 0, 100% 48px, 100% 100%, 0 100%)" }}
      >
        <div key={v.id} className="flex flex-wrap items-start gap-x-12 gap-y-7">
          <div className="bec-in flex-[1_1_340px]">
            <div className="text-grad-deep font-display text-[clamp(64px,8vw,104px)] leading-[0.9] font-bold">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="mt-2.5 font-display text-[clamp(28px,3vw,40px)] leading-[1.05] font-bold">{v.name}</div>
            <p className="mt-2.5 text-lg text-body">{v.blurb}</p>
          </div>
          <div className="bec-in-2 flex flex-[1_1_380px] flex-col gap-3">
            {v.members.length === 0 && <p className="rounded-[18px] bg-white p-5 text-body shadow-[0_6px_18px_rgba(30,58,138,0.1)]">Members will be listed here soon.</p>}
            {v.members.map((m, idx) => (
              <div key={m.id} className="member flex items-center gap-3.5 rounded-[18px] bg-white px-[18px] py-3.5 shadow-[0_6px_18px_rgba(30,58,138,0.1)]">
                <span
                  className="grid size-[52px] flex-none place-items-center overflow-hidden rounded-full font-display text-lg font-bold text-white"
                  style={{ background: GRADIENTS[idx % GRADIENTS.length] }}
                >
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt="" className="size-full object-cover" loading="lazy" />
                  ) : (
                    initials(m.name)
                  )}
                </span>
                <span className="flex-auto">
                  <span className="block font-medium">{m.name}</span>
                  <span className="block text-sm text-muted">{[m.isLead ? "Lead" : "", m.branchYear].filter(Boolean).join(" · ")}</span>
                </span>
                {m.isLead && <span className="clip-tab-sm bg-navy py-1 pr-4 pl-2 font-ui text-[11px] font-semibold text-white">LEAD</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
