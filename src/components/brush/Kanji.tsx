"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useStillness } from "@/lib/useStillness";
import { kanji, type KanjiId } from "@/content/kanji";

type KanjiProps = {
  id: KanjiId;
  className?: string;
  /** Stroke width in the 109-unit KanjiVG grid. */
  weight?: number;
  /** Draw stroke by stroke when scrolled into view (else printed static). */
  draw?: boolean;
  delay?: number;
  /** Seconds per stroke. */
  perStroke?: number;
  color?: string;
  /** Screen-reader text; defaults to the character itself. Pass null for decorative. */
  label?: string | null;
};

/**
 * Printed kanji from KanjiVG stroke-order paths — the chapter numerals, 極真,
 * 押忍. Rendered as mono-stroke glyphs so the only hand-made mark on the page
 * stays the red brush. Optional stroke-by-stroke draw honours reduced motion.
 */
export function Kanji({ id, className, weight = 5.5, draw = false, delay = 0, perStroke = 0.18, color, label }: KanjiProps) {
  const glyph = kanji[id];
  const reduced = useStillness();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" as never });
  const animate = draw && !reduced;
  return (
    <svg
      ref={ref}
      viewBox="0 0 109 109"
      className={cn("block", className)}
      role="img"
      aria-label={label === undefined ? glyph.char : label ?? undefined}
      aria-hidden={label === null ? true : undefined}
      style={color ? { color } : undefined}
    >
      {glyph.strokes.map((d, i) =>
        animate ? (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={weight}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{
              pathLength: { duration: perStroke, delay: delay + i * perStroke, ease: [0.3, 0.02, 0.15, 1] },
              opacity: { duration: 0.01, delay: delay + i * perStroke },
            }}
          />
        ) : (
          <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" />
        ),
      )}
    </svg>
  );
}
