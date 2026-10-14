"use client";

import { useState } from "react";

const STEPS = [
  { n: "01", title: "Submit", text: "Open to students through college seniors. Submit real-world problems, no solutions yet.", out: "a clearly stated, real-world problem." },
  { n: "02", title: "Validate", text: "The strongest submissions validate their chosen problem using a structured framework, confirming it's real and worth solving.", out: "evidence that the problem is real and worth solving." },
  { n: "03", title: "Present", text: "Top teams present validated, prototyped solutions to mentors, investors and industry leaders.", out: "a prototyped solution and a path into the incubation ecosystem." },
];

export function CohortSteps() {
  const [step, setStep] = useState(0);
  const sv = STEPS[step];
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  return (
    <div className="rv mt-14">
      <div className="relative h-1.5 rounded-md bg-white/14">
        <div
          className="bar-fill absolute inset-y-0 left-0 rounded-md bg-linear-to-r from-sky to-ice shadow-[0_0_16px_rgba(77,182,255,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div role="tablist" aria-label="Cohort stages" className="mt-[18px] flex flex-wrap gap-3">
        {STEPS.map((s, i) => {
          const on = i === step;
          return (
            <button
              key={s.n}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setStep(i)}
              className={`step min-h-24 flex-[1_1_200px] cursor-pointer rounded-[18px] border px-5 py-[18px] text-left font-ui text-white ${
                on ? "border-sky bg-linear-to-br from-sky/40 to-sky/10" : "border-sky/30 bg-white/5"
              }`}
            >
              <span className={`block font-display text-[32px] leading-none font-bold ${on ? "text-white" : "text-sky"}`}>{s.n}</span>
              <span className="mt-2 block text-base font-semibold">{s.title}</span>
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        className="clip-corner-sm mt-4 flex flex-wrap items-center gap-x-10 gap-y-5 rounded-3xl bg-card-light p-[clamp(26px,3.5vw,44px)] text-ink"
        style={{ clipPath: "polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%)" }}
      >
        <div key={`n${step}`} className="bec-in text-grad-deep flex-none font-display text-[clamp(64px,8vw,112px)] leading-[0.9] font-bold">
          {sv.n}
        </div>
        <div key={`t${step}`} className="bec-in-2 flex-[1_1_380px]">
          <div className="font-display text-[clamp(26px,2.8vw,36px)] leading-[1.05] font-bold">{sv.title}</div>
          <p className="mt-2 text-lg text-body">{sv.text}</p>
          <p className="mt-2.5 font-ui text-sm font-semibold text-navy">What you leave with: {sv.out}</p>
        </div>
      </div>
    </div>
  );
}
