"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ElementType, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";
import { useFlyleafOpen } from "@/lib/useFlyleafOpen";
import { EASE_OUT } from "@/lib/ease";

type LineRevealProps = {
  /** One entry per visual line. Entries can be strings or rich nodes. */
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  /** Class applied to every line wrapper (the overflow-hidden block). */
  lineClassName?: string;
  /** Seconds before the first line starts. */
  delay?: number;
  /** Seconds between lines. */
  stagger?: number;
  duration?: number;
  mode?: "load" | "view";
  margin?: string;
  /** How much of the block must be inside `margin` before the lines run. */
  amount?: number | "some" | "all";
  /** Extra vertical padding so descenders are not clipped by the mask, in em. */
  bleed?: number;
  id?: string;
  /**
   * Plain text for assistive technology. Defaults to the string lines joined.
   * Pass it when the lines are elements; pass `null` when the caller already
   * renders its own screen-reader text, so nothing is announced twice.
   */
  label?: string | null;
};

/**
 * Masked line-by-line rise: each line sits in an overflow-hidden block and
 * translates up from 112%.
 *
 * Two details matter. The wrapper (not the clipped line) is observed for
 * `view` mode, because a line translated out of its mask never intersects.
 * And the animated lines are hidden from assistive technology, with the full
 * text exposed once in a visually hidden span — never as an `aria-label`,
 * which would silently win over the real content.
 *
 * Nothing here sets `will-change` by hand. Motion adds the hint for the life
 * of the transform and drops it again; the class that used to be hardcoded
 * here promoted sixteen large display lines to permanent compositor layers
 * for a rise that is over in the first second of their chapter.
 */
export function LineReveal({
  lines,
  as = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  duration = 1.1,
  mode = "view",
  margin = "-12% 0px -8% 0px",
  amount,
  bleed = 0.12,
  id,
  label,
}: LineRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: margin as never, amount });
  /* "load" means when the reader first sees the page, which is when the
     flyleaf lifts rather than when this mounts under it (lib/useFlyleafOpen) */
  const open = useFlyleafOpen(mode === "load");
  const shown = mode === "load" ? open : inView;

  const derived = lines.map((l) => (typeof l === "string" ? l : "")).join(" ").trim();
  const text = label === null ? "" : (label ?? derived);

  const Tag = as as "div";
  return (
    <Tag ref={ref as Ref<HTMLDivElement>} id={id} className={className}>
      {text ? <span className="sr-only">{text}</span> : null}
      {lines.map((line, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn("block overflow-hidden", lineClassName)}
          style={{ paddingBlock: `${bleed}em`, marginBlock: `-${bleed}em` }}
        >
          <motion.span
            className="block origin-left"
            initial={{ y: "112%", rotate: 1.5 }}
            animate={shown ? { y: "0%", rotate: 0 } : { y: "112%", rotate: 1.5 }}
            transition={{ duration, delay: delay + i * stagger, ease: EASE_OUT }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
