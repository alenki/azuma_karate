"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { brushMarks, type BrushKind } from "./marks";

export const EASE_BRUSH = [0.3, 0.02, 0.15, 1] as const;

/** Seconds per mark kind — proportional to the stroke length, like a real hand. */
const DURATIONS: Record<BrushKind, number> = {
  ichi: 1.1,
  underline: 0.65,
  circle: 0.8,
  enso: 1.4,
  tick: 0.45,
  bracketL: 0.5,
  bracketR: 0.5,
  sei: 0.9,
  check: 0.4,
};

type BrushProps = {
  kind: BrushKind;
  className?: string;
  /** Seconds before the brush touches the paper. */
  delay?: number;
  /** `view` draws once when scrolled into view; `load` draws on mount; `manual` follows `active`. */
  trigger?: "view" | "load" | "manual";
  /** For `manual`: drawn when true, un-drawn when false. */
  active?: boolean;
  /** Viewport margin for `view`. */
  margin?: string;
  /** Override the drawing duration in seconds. */
  duration?: number;
  /** Explicit colour; by default the mark inherits `currentColor` from its parent. */
  color?: string;
  /** Decorative by default. Pass a label to expose it. */
  label?: string;
};

/**
 * The sensei's brush.
 *
 * Each mark is a filled calligraphic shape (pressed head, thinning belly,
 * lifted tail) revealed through an SVG mask whose centreline is drawn with
 * Motion's `pathLength`, so the ink appears under the bristles instead of
 * fading in. Multi-stroke marks (正, 「 」) draw stroke by stroke in writing
 * order. With reduced motion the finished mark is simply printed.
 */
export function Brush({
  kind,
  className,
  delay = 0,
  trigger = "view",
  active = true,
  margin = "-10% 0px -10% 0px",
  duration,
  color,
  label,
}: BrushProps) {
  const mark = brushMarks[kind];
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: margin as never });
  const total = duration ?? DURATIONS[kind];
  const per = total / mark.strokes.length;

  const drawing = trigger === "load" ? true : trigger === "manual" ? active : inView;

  /* opacity rides along so an undrawn mark never shows the mask's round-cap dot */
  const drawn = { pathLength: 1, opacity: 1 };
  const hidden = { pathLength: 0, opacity: 0 };

  return (
    <svg
      ref={ref}
      /* max-w-none: a mark is often sized in `em` over a narrow anchor (a single
         digit, a word), where the base `svg { max-width: 100% }` would clamp it */
      className={cn("block max-w-none overflow-visible", className)}
      viewBox={mark.viewBox}
      width={mark.width}
      height={mark.height}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={color ? { color } : undefined}
    >
      {mark.strokes.map((stroke, i) => {
        const maskId = `${id}-${kind}-${i}`;
        const strokeDelay = delay + i * per;
        const transition = {
          duration: reduced ? 0 : per,
          delay: reduced ? 0 : strokeDelay,
          ease: EASE_BRUSH,
          opacity: { duration: 0.06, delay: reduced ? 0 : drawing ? strokeDelay : per * 0.9 },
        };
        return (
          <g key={i}>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <motion.path
                d={stroke.center}
                fill="none"
                stroke="#fff"
                strokeWidth={mark.thick * 1.25}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduced || trigger === "load" ? (drawing ? drawn : hidden) : hidden}
                animate={drawing ? drawn : hidden}
                transition={transition}
              />
            </mask>
            <path d={stroke.fill} fill="currentColor" mask={`url(#${maskId})`} />
          </g>
        );
      })}
    </svg>
  );
}
