"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitRsvp, type FormState } from "@/app/(site)/actions";
import { FieldError } from "./ui";

const initial: FormState = { ok: false };

export function RsvpDialog({
  eventId,
  title,
  open,
  onClose,
  onDone,
}: {
  eventId: string;
  title: string;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(submitRsvp, initial);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (state.ok) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  const field = "min-h-[52px] rounded-[14px] border-[1.5px] border-ice bg-mist px-4 py-3 text-base text-ink outline-none focus:border-sky";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(92vw,480px)] rounded-3xl border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-7">
        {state.ok ? (
          <div className="bec-in text-center">
            <div className="bec-pop mx-auto grid size-14 place-items-center rounded-full bg-linear-to-br from-sky to-navy text-2xl text-white">✓</div>
            <h3 className="mt-4 font-display text-[28px] leading-tight font-bold">You&apos;re in{state.name ? `, ${state.name.split(" ")[0]}` : ""}!</h3>
            <p className="mt-2 text-body">Your seat for {title} is saved. See you there.</p>
            <button type="button" onClick={onClose} className="btn mt-6 rounded-full bg-navy px-6 py-3 font-ui text-sm font-semibold text-white">Done</button>
          </div>
        ) : (
          <form action={action} className="flex flex-col gap-4">
            <div>
              <div className="font-ui text-xs font-semibold tracking-[0.06em] text-navy">RSVP</div>
              <h3 className="mt-1 font-display text-[26px] leading-[1.1] font-bold">{title}</h3>
            </div>
            <input type="hidden" name="eventId" value={eventId} />
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <label className="flex flex-col gap-1.5 font-ui text-sm font-semibold text-navy">
              Your name
              <input name="name" autoComplete="name" defaultValue={state.values?.name} className={field} required />
              <FieldError message={state.fieldErrors?.name} />
            </label>
            <label className="flex flex-col gap-1.5 font-ui text-sm font-semibold text-navy">
              Email
              <input name="email" type="email" autoComplete="email" placeholder="you@iitjammu.ac.in" defaultValue={state.values?.email} className={field} required />
              <FieldError message={state.fieldErrors?.email} />
            </label>
            {state.error && <p role="alert" className="text-sm font-medium text-red-600">{state.error}</p>}
            <div className="flex gap-3">
              <button disabled={pending} className="btn rounded-full bg-ink px-6 py-3 font-ui text-sm font-semibold text-white disabled:opacity-60">
                {pending ? "Saving…" : "Save my seat"}
              </button>
              <button type="button" onClick={onClose} className="rounded-full px-5 py-3 font-ui text-sm font-semibold text-navy">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
