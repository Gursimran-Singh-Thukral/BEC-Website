"use client";

import { useActionState } from "react";
import { submitApplication, type FormState } from "@/app/(site)/actions";

const initial: FormState = { ok: false };

export function SuggestForm({ nextVolume }: { nextVolume: number }) {
  const [state, action, pending] = useActionState(submitApplication, initial);
  void nextVolume;
  if (state.ok)
    return (
      <div className="bec-in rounded-[20px] bg-ink px-6 py-[22px] text-white">
        <div className="font-display text-[26px] font-bold">Noted. Thank you!</div>
        <div className="mt-1 text-ice">The content team reads every suggestion.</div>
      </div>
    );
  return (
    <form action={action} className="flex flex-wrap gap-2.5">
      <input type="hidden" name="_kind" value="suggestion" />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <label htmlFor="hb-topic" className="flex-[1_1_100%] font-ui text-sm font-semibold">Suggest a topic</label>
      <input
        id="hb-topic"
        name="topic"
        type="text"
        required
        maxLength={300}
        placeholder="e.g. Finding a co-founder on campus"
        className="min-h-[52px] flex-[1_1_240px] rounded-full border-0 px-5 py-3 text-base text-ink outline-none focus:ring-4 focus:ring-ink/20"
      />
      <button disabled={pending} className="btn min-h-[52px] cursor-pointer rounded-full border-0 bg-ink px-6 py-3 font-ui text-[15px] font-semibold text-white disabled:opacity-60">
        {pending ? "Sending…" : <>Send <span className="arr">→</span></>}
      </button>
      {(state.error || state.fieldErrors?.topic) && <p role="alert" className="flex-[1_1_100%] text-sm font-medium text-red-700">{state.fieldErrors?.topic ?? state.error}</p>}
    </form>
  );
}
