"use client";

/* One stylesheet serves all three bands, and it is imported HERE rather than
   from whichever band happens to mount first: this component is the only thing
   on the page that emits `.leaf` markup, so the sheet is its dependency — the
   same argument `ui/Button.tsx` makes for owning the press's paint. */
import "@/styles/sections/contacts.css";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { RegisterMark } from "@/components/ui/RegisterMark";
import { useGroundReporter } from "@/components/layout/ChapterContext";

/**
 * A band of back matter.
 *
 * `<Chapter>` is not used on this page and that is the page's first decision:
 * the numerals 一…六 count the chapters of the manual, and a second sheet that
 * restarted the count would teach the reader a device that means nothing. So
 * the binding margin carries the printer's REGISTER MARK instead — where the
 * second pass lines up on the first, which is to say: same press, different
 * sheet.
 *
 * What is kept from `<Chapter>` is the one thing the chrome depends on. The
 * fixed bar takes the ground it stands on, and it learns that ground from a
 * one-pixel observer along its own lower edge; `useGroundReporter` is that
 * observer, and the footer already calls it the same way from outside the
 * chapter tree. Without it the bar floats cream over the ink band below.
 */
export function Leaf({
  id,
  ground = "paper",
  className,
  labelledBy,
  mark = true,
  children,
}: {
  id: string;
  ground?: "paper" | "ink";
  className?: string;
  labelledBy?: string;
  /** Print the register mark in the binding margin. */
  mark?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useGroundReporter(ref, id, ground);

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={cn("leaf relative", ground === "ink" ? "ground-ink" : "ground-paper", className)}
    >
      {mark && (
        /* inert, and never a scroll container — the sticky mark inside depends
           on both, exactly as `.chapter__rail` does */
        <div className="leaf__rail" aria-hidden="true">
          <RegisterMark className="leaf__mark" />
        </div>
      )}
      {children}
    </section>
  );
}
