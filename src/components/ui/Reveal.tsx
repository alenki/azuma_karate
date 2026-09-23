"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { Children, type ReactNode } from "react";
import { useFlyleafOpen } from "@/lib/useFlyleafOpen";
import { EASE_OUT, EASE_PRESS } from "@/lib/ease";

/*
  The curves live in `@/lib/ease` now, with a job written against each one.
  They are re-exported here because every animated call site on the page
  already imports its easing from this module, and a chapter reaching for a
  different curve should not also have to reach for a different import.
*/
export { EASE_OUT, EASE_OUT_EXPO, EASE_BRUSH, EASE_PRESS, EASE_INOUT } from "@/lib/ease";

/*
  THE VOCABULARY. Three verbs, one line each — pick by what the matter is
  doing, not by what looks nice:

    <Reveal>    matter arrives from below. The general case: a copy block, a
                card, a caption. Vertical, so it reads as the page scrolling
                the matter into place.
    <Register>  a ROW comes into register: items hold one baseline and slide
                in along it, left to right, one after another. For anything
                counted or tabulated — a ledger row, a set of figures, a strip
                of labels — where a vertical rise would break the line they
                share.
    <Settle>    matter is PRINTED, not flown in: it does not move at all, it
                fades up through a sub-pixel scale on the press curve. For a
                mark that should look like it was always on the sheet — a
                seal, a folio, a plate caption, a numeral.

  <Curtain> (a plate uncovered by a travelling front) and <LineReveal>
  (display type rising line by line inside its mask) are the other two, in
  their own files.
*/

/** Shared viewport contract, so every verb is triggered the same way. */
type ArrivalProps = {
  /** Seconds. */
  delay?: number;
  /** Seconds. */
  duration?: number;
  /**
   * Trigger when the reader first sees the page (`load`: the moment the
   * flyleaf lifts, or mount if it already has) or when scrolled into view
   * (`view`).
   */
  mode?: "load" | "view";
  /** Viewport margin for `view` mode. */
  margin?: string;
  /**
   * How much of the element must be inside that margin before it starts.
   * Leave unset for "any part of it"; raise it for something tall whose
   * arrival would otherwise be over before the reader reached it.
   */
  amount?: number | "some" | "all";
  once?: boolean;
};

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> &
  ArrivalProps & {
    children: ReactNode;
    /** Pixels to rise from. */
    y?: number;
  };

/**
 * Fade-and-rise reveal. Used for copy blocks, cards and rules.
 * Reduced motion is honoured globally through <MotionConfig reducedMotion="user">.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.9,
  y = 28,
  mode = "view",
  margin = "-12% 0px -8% 0px",
  amount,
  once = true,
  ...rest
}: RevealProps) {
  const open = useFlyleafOpen(mode === "load");
  const target = { opacity: 1, y: 0 };
  const hidden = { opacity: 0, y };
  return (
    <motion.div
      initial={hidden}
      {...(mode === "load"
        ? { animate: open ? target : hidden }
        : { whileInView: target, viewport: { once, margin, amount } })}
      transition={{ duration, delay, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type RegisterProps = Omit<HTMLMotionProps<"div">, "children"> &
  ArrivalProps & {
    children: ReactNode;
    /** Seconds between items. */
    stagger?: number;
    /**
     * Pixels each item travels along the baseline. Negative means it comes
     * from the binding side and settles with the reading direction.
     */
    x?: number;
    /** Class applied to every item wrapper. */
    itemClassName?: string;
  };

/**
 * A row coming into register: the items never leave their shared baseline,
 * they slide along it, one after another in DOM order.
 *
 * Each child is wrapped in one <motion.div>, so Register itself is the row —
 * give IT the grid or flex class and the wrappers become its cells. The
 * stagger is driven by variants rather than by a computed delay per item, so
 * `<MotionConfig reducedMotion="user">` can neutralise the translation and
 * still let the opacity run, exactly as it does for <Reveal>.
 */
export function Register({
  children,
  delay = 0,
  duration = 0.7,
  stagger = 0.06,
  x = -10,
  mode = "view",
  margin = "-12% 0px -8% 0px",
  amount,
  once = true,
  itemClassName,
  ...rest
}: RegisterProps) {
  const row = {
    rest: {},
    run: { transition: { delayChildren: delay, staggerChildren: stagger } },
  };
  const item = {
    rest: { opacity: 0, x },
    run: { opacity: 1, x: 0, transition: { duration, ease: EASE_OUT } },
  };
  const open = useFlyleafOpen(mode === "load");
  return (
    <motion.div
      initial="rest"
      variants={row}
      {...(mode === "load"
        ? { animate: open ? "run" : "rest" }
        : { whileInView: "run", viewport: { once, margin, amount } })}
      {...rest}
    >
      {Children.toArray(children).map((child, i) => (
        <motion.div key={i} variants={item} className={itemClassName}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

type SettleProps = Omit<HTMLMotionProps<"div">, "children"> &
  ArrivalProps & {
    children: ReactNode;
    /** Scale it settles down FROM. Keep it near 1: this is an impression, not an entrance. */
    from?: number;
  };

/**
 * Matter that was printed rather than flown in: no translation at all, an
 * opacity rise and a scale that comes down through 1 and back on the press
 * curve. At 1.012 on a 300px mark the overshoot is under a pixel — you do not
 * see it move, you see it land, which is the whole difference between a stamp
 * and a slide.
 *
 * Reach for it where a rise would be a lie: a seal, a folio, a caption under
 * a plate, a chapter numeral — anything the manual would have gone to press
 * with rather than assembled in front of the reader.
 */
export function Settle({
  children,
  delay = 0,
  duration = 0.7,
  from = 1.012,
  mode = "view",
  margin = "-12% 0px -8% 0px",
  amount,
  once = true,
  ...rest
}: SettleProps) {
  const open = useFlyleafOpen(mode === "load");
  const target = { opacity: 1, scale: 1 };
  const hidden = { opacity: 0, scale: from };
  return (
    <motion.div
      initial={hidden}
      {...(mode === "load"
        ? { animate: open ? target : hidden }
        : { whileInView: target, viewport: { once, margin, amount } })}
      transition={{
        /* opacity must not overshoot; the impression must. */
        opacity: { duration, delay, ease: EASE_OUT },
        scale: { duration: duration * 1.15, delay, ease: EASE_PRESS },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
