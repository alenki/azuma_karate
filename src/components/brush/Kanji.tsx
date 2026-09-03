"use client";

import { motion, useInView } from "motion/react";
import { useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { useStillness } from "@/lib/useStillness";
import { kanji, type KanjiId } from "@/content/kanji";

/**
 * Two jobs, two weights.
 *
 * KanjiVG gives one centreline per stroke, and drawn at a single width with
 * round caps that centreline is a DIAGRAM — which is exactly what the About
 * figure wants, because there the reader is being shown how 東 is built out of
 * 木 and 日 and every stroke has to weigh the same to be counted.
 *
 * Everywhere else the kanji are display type: the ten chapter numerals in the
 * binding margin, 極真 set as a specimen, 押忍 in the colophon, the 東 in the
 * seal. A uniform monoline there does not read as printed type, it reads as
 * clip art, because no written character — brush, pen or punch — has one
 * weight along its length.
 *
 * There is no font to fall back on (the page ships two Latin faces and one
 * mono, none of them CJK), so the modulation is built from the paths that are
 * here: each centreline is stroked several times, each pass running further
 * along the path than the last and thinner than the last, so their union is a
 * stroke that lands heavy, holds its body, and lifts. The pass endings are
 * round, which is what keeps the steps between widths from reading as notches.
 */
export type KanjiProfile = "brush" | "mono";

/**
 * The taper: [how far along the path this pass runs, its width as a multiple of
 * `weight`]. Widths only ever decrease, so the union is exactly the outer
 * envelope and the passes may be painted in any order.
 *
 * The first two entries are the entry press (起筆) — a brush lands before it
 * moves. The last two are the lift, and they are deliberately short: the
 * chapter numerals print at 24px and the inline mobile folio at 16px, where a
 * long thin tail would simply disappear, so only the final ninth of each stroke
 * runs under half weight.
 */
const TAPER: readonly (readonly [number, number])[] = [
  [0.09, 1.3],
  [0.22, 1.16],
  [0.4, 1.07],
  [0.6, 1.0],
  [0.78, 0.93],
  [0.91, 0.78],
  [1.0, 0.5],
];

/** One stroke's ink, at whichever of the two weights the job asks for. */
function StrokeInk({ d, weight, profile }: { d: string; weight: number; profile: KanjiProfile }) {
  if (profile === "mono") {
    return <path d={d} fill="none" stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" />;
  }
  return (
    <>
      {TAPER.map(([end, w], i) => (
        <path
          key={i}
          d={d}
          /* normalising pathLength to 1 lets one taper table serve a 4-unit tick
             and a 90-unit sweep without measuring either */
          pathLength={1}
          strokeDasharray={`${end} 2`}
          fill="none"
          stroke="currentColor"
          strokeWidth={weight * w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </>
  );
}

/**
 * A glyph as bare SVG content, for nesting inside somebody else's <svg>.
 * The seal needs this: its press has to bite the ring, the legend and the
 * centre device as one impression, and it cannot reach a glyph floated over
 * the top in a div.
 */
export function KanjiStrokes({
  id,
  weight = 5.5,
  profile = "brush",
}: {
  id: KanjiId;
  weight?: number;
  profile?: KanjiProfile;
}) {
  return (
    <>
      {kanji[id].strokes.map((d, i) => (
        <StrokeInk key={i} d={d} weight={weight} profile={profile} />
      ))}
    </>
  );
}

type KanjiProps = {
  id: KanjiId;
  className?: string;
  /** Stroke width in the 109-unit KanjiVG grid. Under `brush` this is the body
   *  width; the entry presses about a third above it and the lift falls to half. */
  weight?: number;
  /** `brush` (default) is display type; `mono` is the diagram voice — one
   *  weight, round caps, every stroke counted equally. */
  profile?: KanjiProfile;
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
 * 押忍. Printed, not written: the only hand-made mark on this page is the
 * sensei's red brush, and these are type. The optional stroke-by-stroke draw
 * honours reduced motion.
 */
export function Kanji({
  id,
  className,
  weight = 5.5,
  profile = "brush",
  draw = false,
  delay = 0,
  perStroke = 0.18,
  color,
  label,
}: KanjiProps) {
  const glyph = kanji[id];
  const reduced = useStillness();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" as never });
  const uid = useId().replace(/:/g, "");
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
      {animate ? (
        /* The draw reveals the ink through a mask rather than animating the ink
           itself, because a tapered stroke is several paths and its widths are
           already spending `stroke-dasharray`. So the centreline is drawn once,
           in white, as the mask — which is the same construction the brush uses
           two files over, and gives the same result for the monoline profile as
           the dash draw it replaces. */
        glyph.strokes.map((d, i) => {
          const maskId = `${uid}-k-${i}`;
          const at = delay + i * perStroke;
          return (
            <g key={i}>
              <mask id={maskId} maskUnits="userSpaceOnUse">
                <motion.path
                  d={d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={weight * 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{
                    pathLength: { duration: perStroke, delay: at, ease: [0.3, 0.02, 0.15, 1] },
                    opacity: { duration: 0.01, delay: at },
                  }}
                />
              </mask>
              <g mask={`url(#${maskId})`}>
                <StrokeInk d={d} weight={weight} profile={profile} />
              </g>
            </g>
          );
        })
      ) : (
        <KanjiStrokes id={id} weight={weight} profile={profile} />
      )}
    </svg>
  );
}
