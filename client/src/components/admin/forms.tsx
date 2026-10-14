"use client";

import { createContext, useActionState, useContext, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { adminBtn, inputCls, labelCls, type AdminBtn } from "./ui";
import { cn } from "@/lib/utils";

export type AdminFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const Ctx = createContext<AdminFormState>({});

/** Wraps a server action; exposes validation errors and echoed values to child fields. */
export function AdminForm({
  action,
  children,
  className,
}: {
  action: (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <Ctx.Provider value={state}>
      <form action={formAction} className={className}>
        {state.error && (
          <div role="alert" className="bec-in mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {state.error}
          </div>
        )}
        {children}
      </form>
    </Ctx.Provider>
  );
}

export function SubmitButton({ children, variant = "primary", pendingText = "Saving…" }: { children: ReactNode; variant?: AdminBtn; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={adminBtn(variant)}>
      {pending ? pendingText : children}
    </button>
  );
}

type FieldProps = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  className?: string;
};

function useField(name: string, defaultValue: FieldProps["defaultValue"]) {
  const s = useContext(Ctx);
  const val = s.values?.[name] ?? (defaultValue == null ? "" : String(defaultValue));
  return { val, err: s.fieldErrors?.[name] };
}

function Wrap({ label, hint, err, required, className, htmlFor, children }: { label: string; hint?: string; err?: string; required?: boolean; className?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && !err && <p className="text-xs text-muted">{hint}</p>}
      {err && <p role="alert" className="text-xs font-medium text-red-600">{err}</p>}
    </div>
  );
}

export function TextField({ name, label, hint, required, defaultValue, className, type = "text", placeholder }: FieldProps & { type?: string; placeholder?: string }) {
  const { val, err } = useField(name, defaultValue);
  return (
    <Wrap label={label} hint={hint} err={err} required={required} className={className} htmlFor={name}>
      <input id={name} name={name} type={type} defaultValue={val} key={val} required={required} placeholder={placeholder} aria-invalid={err ? true : undefined} className={cn(inputCls, err && "!border-red-400")} />
    </Wrap>
  );
}

export function TextArea({ name, label, hint, required, defaultValue, className, rows = 4 }: FieldProps & { rows?: number }) {
  const { val, err } = useField(name, defaultValue);
  return (
    <Wrap label={label} hint={hint} err={err} required={required} className={className} htmlFor={name}>
      <textarea id={name} name={name} rows={rows} defaultValue={val} key={val} required={required} className={cn(inputCls, "resize-y", err && "!border-red-400")} />
    </Wrap>
  );
}

export function SelectField({ name, label, hint, required, defaultValue, className, options }: FieldProps & { options: { value: string; label: string }[] }) {
  const { val, err } = useField(name, defaultValue);
  return (
    <Wrap label={label} hint={hint} err={err} required={required} className={className} htmlFor={name}>
      <select id={name} name={name} defaultValue={val} key={val} required={required} className={cn(inputCls, err && "!border-red-400")}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Wrap>
  );
}

export function CheckField({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] border-line bg-white px-3.5 py-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 size-4 accent-[#1E3A8A]" />
      <span>
        <span className="block text-[15px] font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** URL input with an "Upload" button that stores the file on the server and fills in the URL. */
export function UploadField({ name, label, hint, defaultValue, accept = "image/*", className }: FieldProps & { accept?: string }) {
  const { val, err } = useField(name, defaultValue);
  const [value, setValue] = useState(val);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const isImg = /\.(jpe?g|png|webp)$/i.test(value) || value.startsWith("/images/") || value.startsWith("/team/");

  async function onPick(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) setMsg(j.error ?? "Upload failed");
      else setValue(j.url);
    } catch {
      setMsg("Upload failed. Check your connection.");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  return (
    <Wrap label={label} hint={hint} err={err ?? msg ?? undefined} className={className} htmlFor={name}>
      <div className="flex items-center gap-3">
        {isImg && value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-14 flex-none rounded-xl border border-line object-cover" />
        )}
        <input id={name} name={name} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Paste a URL or upload a file" className={inputCls} />
        <button type="button" disabled={busy} onClick={() => file.current?.click()} className={adminBtn("ghost", "flex-none")}>
          {busy ? "Uploading…" : "Upload"}
        </button>
        <input ref={file} type="file" accept={accept} className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
      </div>
    </Wrap>
  );
}

/** A button inside a server-action form that asks for confirmation first. */
export function ConfirmButton({ message, children, variant = "danger" }: { message: string; children: ReactNode; variant?: AdminBtn }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={adminBtn(variant)}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
