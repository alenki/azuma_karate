"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useStillness } from "@/lib/useStillness";
import { EASE_INOUT, EASE_OUT } from "@/lib/ease";

type CurtainProps = {
  children: ReactNode;
  /** Sizes the plate: give it an aspect class or explicit height. */
  className?: string;
  delay?: number;
  duration?: number;
  /** Edge the curtain rises from. */
  from?: "bottom" | "top" | "left" | "right";
  /** Slight settle-scale of the content while the curtain opens. */
  scale?: number;
  mode?: "view" | "load";
  margin?: string;
  /**
   * Fraction of the plate that must be on screen before it starts opening.
   * The default holds a tall plate back until a third of it is in front of
   * the reader; pass `0` for a small plate inside a figure, which can be
   * wholly visible long before a third of it clears the margin.
   */
  amount?: number;
};

const INSET: Record<NonNullable<CurtainProps["from"]>, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

/**
 * The observer, with an `amount` a tall plate can actually reach.
 *
 * `amount` is an IntersectionObserver threshold, i.e. a fraction of the
 * ELEMENT — and a fraction of the element larger than the observation window
 * can never be satisfied. A full-bleed plate taller than about 2.3 screens
 * would therefore never open at all, and neither would a plate whose CSS has
 * left it at zero height, because a box with no area reports a ratio of 0
 * against any threshold above 0. Both failure modes print blank paper, which
 * is far worse than a reveal that fires early, so the requested amount is
 * clamped to what the window can hold: a third of the plate, or as much of it
 * as fits, whichever comes first. The 0.7 is a deliberate under-estimate of
 * the observation window — the default margin shrinks it to 0.8 of the
 * viewport and a caller may shrink it further.
 */
function usePlateInView(margin: string, amount: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [reachable, setReachable] = useState(amount);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      setReachable(h > 0 ? Math.min(amount, (window.innerHeight * 0.7) / h) : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [amount]);

  const inView = useInView(ref, { once: true, margin: margin as never, amount: reachable });
  return [ref, inView] as const;
}

/**
 * Plate reveal. The OUTER wrapper is observed for the viewport (an element
 * that starts fully clipped never intersects, so `whileInView` on the clipped
 * node itself never fires); the inner layer animates clip-path and a settle
 * scale. Children should fill the box (e.g. <Photo fill />).
 *
 * The wipe is the one thing on the page that TRAVELS rather than arrives — a
 * front crossing the plate — so it runs on `--ease-inout` while the settle
 * scale under it comes to rest on `--ease-out`. Both end together: the scale
 * used to run 1.4× the clip and left every plate creeping for another
 * half-second after it had finished opening.
 */
export function Curtain({
  children,
  className,
  delay = 0,
  duration = 1.1,
  from = "bottom",
  scale = 1.06,
  mode = "view",
  margin = "-12% 0px -8% 0px",
  amount = 0.3,
}: CurtainProps) {
  const [ref, inView] = usePlateInView(margin, amount);
  const reduced = useStillness();
  const shown = mode === "load" || inView;
  const closed = INSET[from];
  const open = "inset(0% 0% 0% 0%)";
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: closed }}
        animate={{ clipPath: shown || reduced ? open : closed }}
        transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: EASE_INOUT }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale }}
          animate={{ scale: shown || reduced ? 1 : scale }}
          transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: EASE_OUT }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
