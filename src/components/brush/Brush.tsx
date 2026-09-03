"use client";

import { motion, useInView } from "motion/react";
import { useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { useStillness } from "@/lib/useStillness";
import { dryMask, inkFilter, pressVariant, seedHash, seedSigned } from "@/components/ui/PressDefs";
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
  /**
   * Which impression this is. Two marks with the same seed are the same
   * impression; two with different seeds differ in press, angle, size, placement
   * and speed. Left unset it falls back to React's own per-instance id, so a
   * `.map()` of eight tally marks already writes eight different hands with no
   * change at the call site. Pass it explicitly only to PIN a mark (so it stays
   * the same across a re-render) or to re-roll one (Reviews' brackets on the
   * quote index, so advancing the quote writes the pair again).
   */
  seed?: number | string;
};

/**
 * The sensei's brush.
 *
 * Each mark is a filled calligraphic shape (pressed head, thinning belly,
 * lifted tail) revealed through an SVG mask whose centreline is drawn with
 * Motion's `pathLength`, so the ink appears under the bristles instead of
 * fading in. Multi-stroke marks (正, 「 」) draw stroke by stroke in writing
 * order. With reduced motion the finished mark is simply printed.
 *
 * The marks that are read at size are printed through the press (ui/PressDefs):
 * a filter gives the silhouette tooth, mottle and bleed, and the linear ones
 * carry a second, static mask that breaks the tail into bristle ribbons. Both
 * are nested INSIDE the reveal rather than replacing it — the dry mask masks
 * the animated centreline, so the ink still appears under the bristles and the
 * texture costs the animation nothing.
 *
 * And no two impressions are the same. A hand that writes fifteen tally marks
 * in a training log never repeats, so every instance pulls its own press and
 * sits at its own angle, size, placement and speed — all of it derived from one
 * seed by pure arithmetic, never Math.random, so the server and the browser
 * write the same hand and hydration is clean.
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
  seed,
}: BrushProps) {
  const mark = brushMarks[kind];
  const id = useId().replace(/:/g, "");
  const reduced = useStillness();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: margin as never });

  const hand = seedHash(seed ?? id);
  /* a hand does not keep time either — ±7% on the gesture, which is what turns a
     row of eight tally marks from a metronome into someone counting */
  const total = (duration ?? DURATIONS[kind]) * (1 + seedSigned(hand, 6) * 0.07);
  const per = total / mark.strokes.length;

  const drawing = trigger === "load" ? true : trigger === "manual" ? active : inView;
  const impression = pressVariant(hand);
  const ink = inkFilter(kind, impression);
  const dry = dryMask(kind, impression);

  /* ---- the hand -----------------------------------------------------
     Two transforms, both in the mark's own viewBox units. The first sets the
     whole mark down: a sub-degree tilt, half a percent of size, a slip of the
     paper. The angle has to be derived rather than fixed, because one degree
     on a square 正 is a hair and one degree on a 1000-unit 一 is a slope — so
     the tilt is defined as a displacement (about 2% of the mark's short side
     at its furthest corner) and only then converted back to an angle, capped
     under a degree. This is a disciplined hand, not a shaky one.

     The second places each stroke separately, and only on marks that have more
     than one — 正 and the two quote brackets, which are exactly the marks the
     page repeats. Its size is tied to `thick` rather than to the mark, because
     placement error scales with the brush being used, and because those marks
     print small: a jitter measured against the viewBox would be sub-pixel on a
     46px glyph and invisible, which is the whole defect being fixed. */
  const cx = mark.width / 2;
  const cy = mark.height / 2;
  const short = Math.min(mark.width, mark.height);
  const maxDeg = Math.min(0.85, (Math.atan2(0.022 * short, Math.hypot(mark.width, mark.height) / 2) * 180) / Math.PI);
  const slip = Math.min(0.06 * mark.thick, 0.008 * short);
  const settle =
    `translate(${(cx + seedSigned(hand, 4) * slip).toFixed(3)} ${(cy + seedSigned(hand, 5) * slip).toFixed(3)})` +
    ` rotate(${(seedSigned(hand, 1) * maxDeg).toFixed(3)})` +
    ` scale(${(1 + seedSigned(hand, 2) * 0.005).toFixed(5)} ${(1 + seedSigned(hand, 3) * 0.005).toFixed(5)})` +
    ` translate(${-cx} ${-cy})`;

  const multi = mark.strokes.length > 1;
  const nudge = Math.min(0.2 * mark.thick, 0.025 * short);
  const strokeSettle = (i: number) => {
    if (!multi) return undefined;
    const k = 10 + i * 3;
    return (
      `translate(${(cx + seedSigned(hand, k) * nudge).toFixed(3)} ${(cy + seedSigned(hand, k + 1) * nudge).toFixed(3)})` +
      ` rotate(${(seedSigned(hand, k + 2) * 0.7).toFixed(3)}) translate(${-cx} ${-cy})`
    );
  };

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
      {/* The transform wraps mask and ink together, which it must: a mask's
          content is resolved in the user space of the element that REFERENCES
          it, so moving the ink under the same <g> moves the reveal with it. */}
      <g transform={settle}>
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
            <g key={i} transform={strokeSettle(i)}>
              <mask id={maskId} maskUnits="userSpaceOnUse">
                {/* The dry mask wraps the reveal, so the two multiply: a stroke is
                    visible only where the brush has already passed AND where the
                    bristles still carry ink. */}
                <g mask={dry ? `url(#${dry})` : undefined}>
                  <motion.path
                    d={stroke.center}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={mark.thick * 1.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    /* Always start un-drawn. Seeding `initial` with the finished
                       state when trigger="load" made initial equal the animate
                       target, and Motion does not animate between equal values —
                       every load-triggered mark was printed, never drawn. */
                    initial={hidden}
                    animate={drawing ? drawn : hidden}
                    transition={transition}
                  />
                </g>
              </mask>
              <path
                d={stroke.fill}
                fill="currentColor"
                filter={ink ? `url(#${ink})` : undefined}
                mask={`url(#${maskId})`}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
