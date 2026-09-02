"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Brush } from "@/components/brush/Brush";
import { EASE_OUT_EXPO } from "./Reveal";

export type AccordionItem = {
  id: string;
  question: ReactNode;
  answer: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
  /** Index open by default; -1 for none. */
  defaultOpen?: number;
  /** Mono numeral prefix on each row. */
  numbered?: boolean;
  /** Draw a red brush check next to the open question (un-drawn on close). */
  brush?: boolean;
};

/**
 * Typeset FAQ accordion: hairline rows, mono folio, arrow-key navigation,
 * aria-expanded / aria-controls, height animated with Motion.
 */
export function Accordion({ items, className, defaultOpen = -1, numbered = true, brush = false }: AccordionProps) {
  const [open, setOpen] = useState<number>(defaultOpen);
  const baseId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = items.length;
    const focus = (k: number) => buttons.current[(k + n) % n]?.focus();
    if (e.key === "ArrowDown") { e.preventDefault(); focus(i + 1); }
    if (e.key === "ArrowUp") { e.preventDefault(); focus(i - 1); }
    if (e.key === "Home") { e.preventDefault(); focus(0); }
    if (e.key === "End") { e.preventDefault(); focus(n - 1); }
  };

  return (
    <div className={cn("accordion", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-b-${i}`;
        const panelId = `${baseId}-p-${i}`;
        return (
          <div key={item.id} className="accordion__row border-t border-rule last:border-b">
            <h3 className="m-0">
              <button
                ref={(el) => { buttons.current[i] = el; }}
                id={btnId}
                type="button"
                className="accordion__btn flex w-full items-start gap-5 py-5 text-left md:gap-8 md:py-6"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {numbered && <span className="t-mono pt-[0.45em] text-ink-3 shrink-0">{String(i + 1).padStart(2, "0")}</span>}
                <span className="accordion__q flex-1 t-h3 font-display">{item.question}</span>
                <span className="relative flex h-6 w-7 shrink-0 items-center justify-center" aria-hidden="true">
                  {brush ? (
                    <Brush kind="check" className="w-6 text-shu" trigger="manual" active={isOpen} />
                  ) : (
                    <>
                      <motion.span
                        className="block h-[1px] w-4 bg-current"
                        animate={{ rotate: isOpen ? 0 : 90 }}
                        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                        style={{ position: "absolute" }}
                      />
                      <span className="block h-[1px] w-4 bg-current" />
                    </>
                  )}
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ height: { duration: 0.5, ease: EASE_OUT_EXPO }, opacity: { duration: 0.3 } }}
                >
                  <div className={cn("accordion__a pb-7 text-ink-2 max-w-[62ch]", numbered && "md:pl-[calc(2ch+2rem)] pl-[calc(2ch+1.25rem)]")}>
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
