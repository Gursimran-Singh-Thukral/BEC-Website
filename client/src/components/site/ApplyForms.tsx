"use client";

import { useActionState, useState } from "react";
import { submitApplication, type FormState } from "@/app/(site)/actions";
import { FieldError, Rocket, SectionTag, TabPill } from "./ui";
import { MENTOR_RELATIONS, YEARS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "textarea" | "select";
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
  half?: boolean;
  rows?: number;
};

type RoleKey = "core_team" | "member" | "mentor" | "cohort";

const ROLES: { key: RoleKey; label: string; blurb: string }[] = [
  { key: "core_team", label: "Core team", blurb: "Plan events, lead a vertical and run the club. Tell us a bit about you and where you'd like to help." },
  { key: "member", label: "Member", blurb: "Early access to sessions, the members' group and first pick for cohort seats. One-minute sign-up, no commitment." },
  { key: "mentor", label: "Mentor", blurb: "Alumni, founders and faculty: an hour a month with a cohort team makes more difference than you'd think. Remote is fine." },
  { key: "cohort", label: "Big Idea Cohort", blurb: "Submit a real-world problem, no solution needed yet. The strongest submissions go on to validate and present." },
];

function fieldsFor(role: RoleKey, verticals: string[]): FieldDef[] {
  const base: FieldDef[] = [
    { name: "name", label: "Your name", required: true, half: true },
    { name: "email", label: "Email", type: "email", required: true, half: true, placeholder: "you@iitjammu.ac.in" },
  ];
  const student: FieldDef[] = [
    { name: "branch", label: "Branch", required: true, half: true },
    { name: "year", label: "Year", type: "select", options: YEARS, required: true, half: true },
  ];
  switch (role) {
    case "core_team":
      return [
        ...base,
        ...student,
        { name: "phone", label: "Phone (optional)", type: "tel", half: true },
        { name: "vertical", label: "Where would you like to help?", type: "select", options: verticals, required: true, half: true },
        { name: "why", label: "Why do you want to join the core team?", type: "textarea", required: true, rows: 4 },
        { name: "experience", label: "Anything you've built, run or organised (optional)", type: "textarea", rows: 3 },
        { name: "linkedin", label: "LinkedIn or portfolio link (optional)", type: "url", placeholder: "https://" },
      ];
    case "member":
      return [...base, ...student, { name: "interests", label: "What are you hoping to get out of BEC? (optional)", type: "textarea", rows: 3 }];
    case "mentor":
      return [
        ...base,
        { name: "organisation", label: "Organisation / designation", required: true, half: true },
        { name: "relation", label: "Connection to IIT Jammu", type: "select", options: MENTOR_RELATIONS, required: true, half: true },
        { name: "domain", label: "Domains you can mentor in", required: true },
        { name: "availability", label: "Availability (optional)", placeholder: "e.g. 1 hour a month, evenings, remote" },
        { name: "linkedin", label: "LinkedIn (optional)", type: "url", placeholder: "https://" },
        { name: "note", label: "Anything else (optional)", type: "textarea", rows: 3 },
      ];
    case "cohort":
      return [
        ...base,
        ...student,
        { name: "teamSize", label: "Team size (optional)", half: true, placeholder: "Solo, or names of teammates" },
        { name: "stage", label: "Where are you now? (optional)", half: true, placeholder: "e.g. just a problem, spoke to 5 users" },
        { name: "problem", label: "The real-world problem you want to solve", type: "textarea", required: true, rows: 5 },
      ];
  }
}

const inputCls =
  "min-h-[52px] w-full rounded-[14px] border-[1.5px] border-ice bg-mist px-4 py-3 text-base text-ink outline-none transition focus:border-sky focus:bg-white";

const initial: FormState = { ok: false };

function RoleForm({ role, verticals, open }: { role: RoleKey; verticals: string[]; open: boolean }) {
  const [state, action, pending] = useActionState(submitApplication, initial);
  const fields = fieldsFor(role, verticals);
  const r = ROLES.find((x) => x.key === role)!;

  if (state.ok) {
    return (
      <div className="bec-in flex min-h-[320px] flex-col items-start justify-center gap-3">
        <div className="bec-pop grid size-14 place-items-center rounded-full bg-linear-to-br from-sky to-navy text-2xl text-white">✓</div>
        <div className="font-display text-[44px] leading-none font-bold">Application received{state.name ? `, ${state.name.split(" ")[0]}` : ""}!</div>
        <p className="text-body">Thanks for applying as {r.label.toLowerCase()}. Someone from the team will get back to you by email.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="flex min-h-[260px] flex-col justify-center gap-3">
        <div className="font-display text-[32px] leading-tight font-bold">Applications are closed for now.</div>
        <p className="text-body">
          We&apos;ll open {r.label.toLowerCase()} applications again soon. In the meantime, you can{" "}
          <button type="button" className="font-semibold text-navy underline" onClick={() => document.getElementById("dropbox")?.scrollIntoView({ behavior: "smooth" })}>
            drop an idea
          </button>{" "}
          or become a member.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-[18px]" noValidate={false}>
      <input type="hidden" name="_kind" value={role} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <p className="text-body">{r.blurb}</p>
      <div className="flex flex-wrap gap-3.5">
        {fields.map((f) => {
          const err = state.fieldErrors?.[f.name];
          const common = {
            id: `${role}-${f.name}`,
            name: f.name,
            required: f.required,
            defaultValue: state.values?.[f.name] ?? "",
            "aria-invalid": err ? true : undefined,
            className: cn(inputCls, err && "!border-red-400"),
          };
          return (
            <div key={f.name} className={cn("flex flex-col gap-1.5", f.half ? "flex-[1_1_200px]" : "flex-[1_1_100%]")}>
              <label htmlFor={common.id} className="font-ui text-sm font-semibold text-navy">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea {...common} rows={f.rows ?? 4} placeholder={f.placeholder} className={cn(common.className, "resize-y")} />
              ) : f.type === "select" ? (
                <select {...common}>
                  <option value="">Select…</option>
                  {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input {...common} type={f.type ?? "text"} placeholder={f.placeholder} autoComplete={f.name === "name" ? "name" : f.name === "email" ? "email" : undefined} />
              )}
              <FieldError message={err} />
            </div>
          );
        })}
      </div>
      {state.error && <p role="alert" className="text-sm font-medium text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="btn inline-flex min-h-[54px] cursor-pointer items-center gap-2.5 self-start rounded-full bg-ink px-7 py-[15px] font-ui text-[15px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : <>Submit application <span className="arr">→</span></>}
      </button>
    </form>
  );
}

export function ApplySection({
  initialRole,
  verticals,
  coreOpen,
  cohortOpen,
  coreDeadline,
  cohortDeadline,
}: {
  initialRole: RoleKey;
  verticals: string[];
  coreOpen: boolean;
  cohortOpen: boolean;
  coreDeadline: string;
  cohortDeadline: string;
}) {
  const [role, setRole] = useState<RoleKey>(initialRole);
  const open = role === "core_team" ? coreOpen : role === "cohort" ? cohortOpen : true;
  const deadline = role === "core_team" ? coreDeadline : role === "cohort" ? cohortDeadline : "";
  return (
    <section id="apply" className="mx-auto max-w-[1280px] scroll-mt-20 px-[clamp(20px,4vw,56px)] pb-[clamp(56px,7vw,96px)]">
      <div className="rv-l">
        <SectionTag>Apply</SectionTag>
        <h2 className="sweep mt-4 font-display text-[clamp(34px,4.2vw,58px)] leading-[1.06] font-bold tracking-[-0.015em] text-ink">Ready? Tell us about you.</h2>
      </div>
      <div role="tablist" aria-label="Application type" className="rv mt-8 flex flex-wrap gap-2.5">
        {ROLES.map((r) => (
          <TabPill key={r.key} role="tab" aria-selected={role === r.key} active={role === r.key} onClick={() => setRole(r.key)}>
            {r.label}
          </TabPill>
        ))}
      </div>
      <div
        className="clip-corner rv relative mt-4 rounded-[26px] border border-line bg-linear-to-b from-white to-mist p-[clamp(24px,3.4vw,44px)]"
        style={{ clipPath: "polygon(0 0, calc(100% - 48px) 0, 100% 48px, 100% 100%, 0 100%)" }}
      >
        {open && deadline && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-ice px-3.5 py-1.5 font-ui text-[13px] font-semibold text-navy">
            <span className="bec-pulse size-2 rounded-full bg-sky" /> Closes {deadline}
          </div>
        )}
        <RoleForm key={role} role={role} verticals={verticals} open={open} />
      </div>
    </section>
  );
}

/* ---------------- Idea Dropbox ---------------- */

const NEEDS = ["Not sure yet", "A mentor", "A co-founder", "A cohort seat", "Incubation or funding"];

export function IdeaDropbox() {
  const [n, setN] = useState(0);
  return <DropCard key={n} onAgain={() => setN((x) => x + 1)} />;
}

function DropCard({ onAgain }: { onAgain: () => void }) {
  const [state, action, pending] = useActionState(submitApplication, initial);
  const [need, setNeed] = useState(0);
  const [idea, setIdea] = useState("");
  const len = idea.trim().length;
  const level = len === 0 ? "Empty" : len < 40 ? "Spark" : len < 120 ? "Flame" : "Rocket fuel";
  const first = state.name?.split(" ")[0];
  const e = state.fieldErrors ?? {};

  return (
    <div
      className="relative min-h-[560px] rounded-[26px] bg-linear-to-b from-white from-60% to-ice p-[clamp(24px,3.4vw,40px)] text-ink"
      style={{ clipPath: "polygon(0 0, calc(100% - 48px) 0, 100% 48px, 100% 100%, 0 100%)" }}
    >
      {state.ok ? (
        <div className="relative flex min-h-[480px] flex-col items-start justify-center gap-3">
          <div className="relative h-[120px] w-20">
            <span className="trail absolute top-[60px] left-[34px] w-2.5 rounded-[10px] bg-linear-to-b from-sky to-sky/0" aria-hidden="true" />
            <Rocket className="launching absolute top-[30px] left-2" size={64} stroke="#1E3A8A" fill="#DBEFFF" />
          </div>
          <div className="bec-in font-display text-[52px] leading-none font-bold">Launched{first ? `, ${first}` : ""}!</div>
          <p className="bec-in-2 text-body">Your idea is on its way. Someone from the team will write back.</p>
          <button
            type="button"
            onClick={onAgain}
            className="btn bec-in-3 mt-1.5 min-h-12 cursor-pointer rounded-full border-[1.5px] border-navy bg-transparent px-[22px] py-[11px] font-ui text-sm font-semibold text-navy"
          >
            Drop another
          </button>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-[18px]">
          <input type="hidden" name="_kind" value="idea" />
          <input type="hidden" name="need" value={NEEDS[need]} />
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <div className="flex flex-wrap gap-3.5">
            <div className="flex flex-[1_1_200px] flex-col gap-1.5">
              <label htmlFor="dz-name" className="font-ui text-sm font-semibold text-navy">Your name</label>
              <input id="dz-name" name="name" autoComplete="name" required defaultValue={state.values?.name} className={inputCls} />
              <FieldError message={e.name} />
            </div>
            <div className="flex flex-[1_1_200px] flex-col gap-1.5">
              <label htmlFor="dz-email" className="font-ui text-sm font-semibold text-navy">College email</label>
              <input id="dz-email" name="email" type="email" autoComplete="email" required placeholder="you@iitjammu.ac.in" defaultValue={state.values?.email} className={inputCls} />
              <FieldError message={e.email} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between gap-2.5">
              <label htmlFor="dz-idea" className="font-ui text-sm font-semibold text-navy">The problem, in a few lines</label>
              <span className="text-[13px] text-muted">{len} characters</span>
            </div>
            <textarea id="dz-idea" name="idea" rows={5} required value={idea} onChange={(ev) => setIdea(ev.target.value)} className={cn(inputCls, "resize-y")} />
            <FieldError message={e.idea} />
            <div className="mt-1 flex items-center gap-3">
              <div className="h-2 flex-auto overflow-hidden rounded-lg bg-ice">
                <div className="meter-fill h-full rounded-lg bg-linear-to-r from-sky to-navy" style={{ width: `${Math.min(100, Math.round(len / 1.6))}%` }} />
              </div>
              <span className="flex-none font-ui text-[13px] font-semibold text-navy">{level}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-ui text-sm font-semibold text-navy">What would help most?</span>
            <div role="group" aria-label="What would help most?" className="flex flex-wrap gap-2">
              {NEEDS.map((label, i) => (
                <TabPill key={label} className="need !min-h-[46px] !pr-[30px] !pl-4 !text-sm" active={i === need} aria-pressed={i === need} onClick={() => setNeed(i)}>
                  {label}
                </TabPill>
              ))}
            </div>
          </div>
          {state.error && <p role="alert" className="text-sm font-medium text-red-600">{state.error}</p>}
          <button disabled={pending} className="btn inline-flex min-h-[54px] cursor-pointer items-center gap-2.5 self-start rounded-full bg-ink px-7 py-[15px] font-ui text-[15px] font-semibold text-white disabled:opacity-60">
            {pending ? "Launching…" : <>Launch the idea <Rocket /></>}
          </button>
        </form>
      )}
    </div>
  );
}
