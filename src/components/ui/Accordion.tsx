"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Brush } from "@/components/brush/Brush";
import { Register } from "./Reveal";
import { EASE_OUT } from "@/lib/ease";
import { useStillness } from "@/lib/useStillness";

export type AccordionItem = {
  id: string;
  question: ReactNode;
  answer: ReactNode;
  /**
   * The register's third field: how the entry is classified, in one word.
   * A ruled row with only two fields leaves the outer third of a full-trim
   * sheet blank on every line, which is the dead channel this chapter was
   * rebuilt to get rid of. Decorative to assistive technology — the question
   * beside it already says what the row is about — so it is `aria-hidden`.
   */
  tag?: ReactNode;
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

/** Seconds the panel takes to open or close. The reader's own travel matches it. */
const PANEL = 0.5;

/**
 * `EASE_OUT` as a function, for the one consumer that cannot take a tuple.
 *
 * Lenis wants `easing: (t: number) => number`, and the compensating scroll
 * below has to ride the SAME curve as the panel it is compensating for or the
 * two drift apart mid-flight and the row wanders. `cubic-bezier(0.16, 1, 0.3,
 * 1)` is the published approximation of easeOutExpo, so this is that curve to
 * within a fraction of a pixel of scroll — the same trade `lib/ease.ts` makes
 * for `easeInOutCubic`, and where this belongs if a second call site ever
 * needs it.
 */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * The register: hairline rows, a mono ordinal in the margin, a classifying
 * tag at the trim, and the answer opening in place beneath its own question.
 *
 * Semantics are the APG accordion, unchanged: every row is a real <button>
 * inside a heading, with `aria-expanded` and `aria-controls`, arrow / Home /
 * End navigation between the buttons, and a panel that is a labelled region.
 * One row is open at a time.
 *
 * Two things this component does NOT do, deliberately:
 *
 *  - It does not lay itself out. The rows carry stable class names and the
 *    consumer's stylesheet puts them on the page grid (see
 *    `styles/sections/faq.css`), because how many columns an ordinal or a tag
 *    is worth is a decision about a chapter, not about a widget. Only the
 *    hairline between two rows is printed here, so the component is legible
 *    on its own; its GRADE and the rules that bound the whole block belong to
 *    the page.
 *  - It does not move the page under the reader. Opening a row grows the
 *    document, and because only one row is open at a time, opening a row
 *    BELOW the open one also collapses a panel above it — so the row the
 *    reader just clicked would jump up by the height of a panel they were no
 *    longer looking at. That height is measured before the state change and
 *    handed to Lenis as a matching travel, on the panel's own curve and
 *    duration, so the clicked row stays exactly where it was clicked.
 */
export function Accordion({ items, className, defaultOpen = -1, numbered = true, brush = false }: AccordionProps) {
  const [open, setOpen] = useState<number>(defaultOpen);
  const baseId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const lenis = useLenis();
  const still = useStillness();

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = items.length;
    const focus = (k: number) => buttons.current[(k + n) % n]?.focus();
    if (e.key === "ArrowDown") { e.preventDefault(); focus(i + 1); }
    if (e.key === "ArrowUp") { e.preventDefault(); focus(i - 1); }
    if (e.key === "Home") { e.preventDefault(); focus(0); }
    if (e.key === "End") { e.preventDefault(); focus(n - 1); }
  };

  const toggle = (i: number) => {
    /* Only a panel that is open ABOVE the clicked row moves that row: one
       below it collapses under the reader and one below the fold is not
       theirs to notice. Measured now, while it still has its full height. */
    const rise = open >= 0 && open < i ? (panels.current[open]?.offsetHeight ?? 0) : 0;
    setOpen(open === i ? -1 : i);
    if (rise <= 0) return;

    if (lenis && !still) {
      lenis.scrollTo(lenis.targetScroll - rise, { duration: PANEL, easing: easeOutExpo });
      return;
    }
    /*
      No Lenis (it is not mounted for a reader who asked for stillness), so
      the collapse is instant and so is the correction. Two frames: one for
      React to commit, one for Motion to write the closed height — until it
      has, there is nothing to compensate for.
    */
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollBy(0, -rise)));
  };

  return (
    /*
      The rows come into REGISTER rather than each rising on its own: they are
      tabulated matter held together by their rules, and a row that rises
      vertically pulls away from the hairline it shares with the row above it.
      They arrive along the reading direction instead, one after another, the
      way a register is written.
    */
    <Register
      className={cn("accordion", className)}
      itemClassName="accordion__entry"
      delay={0.05}
      stagger={0.06}
      duration={0.65}
      x={-12}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-b-${i}`;
        const panelId = `${baseId}-p-${i}`;
        return (
          <div key={item.id} className="accordion__row border-t border-rule" data-open={isOpen}>
            <h3 className="m-0">
              <button
                ref={(el) => { buttons.current[i] = el; }}
                id={btnId}
                type="button"
                className="accordion__btn w-full text-left"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {numbered && <span className="t-mono accordion__num">{String(i + 1).padStart(2, "0")}</span>}
                {/* `t-h3` is the shared scale the question falls back to; the
                    chapter that owns the register re-states it as `--q-size`,
                    which keeps the same growth term and only loses the
                    ceiling — a question is a chapter's headline here, not a
                    subhead in someone else's */}
                <span className="accordion__q t-h3 font-display">{item.question}</span>
                {/* the outer field: the classification, then the mark, both
                    ranged to the trim so the row ends on the sensei's tick */}
                <span className="accordion__tail">
                  {item.tag && <span className="t-mono accordion__tag" aria-hidden="true">{item.tag}</span>}
                  {/* `relative` is the fallback mark's own business: the two
                      hairlines that make its plus sign are stacked, and only
                      one of them is in flow */}
                  <span className="accordion__mark relative" aria-hidden="true">
                    {brush ? (
                      <Brush kind="check" className="accordion__check text-shu" trigger="manual" active={isOpen} seed={item.id} />
                    ) : (
                      <>
                        <motion.span
                          className="block h-[1px] w-4 bg-current"
                          animate={{ rotate: isOpen ? 0 : 90 }}
                          transition={{ duration: 0.4, ease: EASE_OUT }}
                          style={{ position: "absolute" }}
                        />
                        <span className="block h-[1px] w-4 bg-current" />
                      </>
                    )}
                  </span>
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  ref={(el) => { panels.current[i] = el; }}
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="accordion__panel overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  /*
                    `<MotionConfig reducedMotion="user">` neutralises transforms
                    and layout animations, not a height that is animated by
                    hand — so stillness is honoured here explicitly, and the
                    answer is simply printed.
                  */
                  transition={
                    still
                      ? { duration: 0 }
                      : { height: { duration: PANEL, ease: EASE_OUT }, opacity: { duration: 0.32, ease: EASE_OUT } }
                  }
                >
                  <div className="accordion__a text-ink-2">{item.answer}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </Register>
  );
}
