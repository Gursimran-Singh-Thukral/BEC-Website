"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="flex flex-col gap-3">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="overflow-hidden rounded-[20px] bg-mist" style={{ clipPath: "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)" }}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="faq-q flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 border-0 bg-mist px-[22px] py-[18px] text-left font-display text-[21px] font-bold text-ink"
            >
              <span>{f.q}</span>
              <span aria-hidden="true" className={cn("faq-ic grid size-9 flex-none place-items-center rounded-full bg-linear-to-br from-sky to-navy font-ui text-[22px] leading-none text-white", isOpen && "is-open")}>
                +
              </span>
            </button>
            {isOpen && <p className="bec-in px-[22px] pb-5 text-body">{f.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
