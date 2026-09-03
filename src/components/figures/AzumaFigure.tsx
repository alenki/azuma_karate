"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { kanji } from "@/content/kanji";
import { RegisterMark } from "@/components/ui/RegisterMark";

/**
 * 東 — the club's own name — taken apart.
 *
 * KanjiVG writes 東 in eight strokes and they divide exactly in two: strokes
 * 0, 5, 6, 7 are 木 (the branch, the trunk, the two roots) and strokes 1, 2,
 * 3, 4 are 日 (the sun: left upright, the 横折 corner, two bars). The glyph is
 * a picture — a sun risen into the branches of a tree — and that picture is
 * the Japanese word for east, which is what «Азума» means. The club has never
 * said so anywhere on the site.
 *
 * So the figure prints the tree, ghosts the empty socket the sun belongs in,
 * and hands the sun to the reader: it climbs the trunk as the page is
 * scrolled and seats itself, finishing the club's own name. Scroll back and
 * it sets again.
 *
 * The rise is a rigid translate of a typeset glyph — the same class of motion
 * as chapter six's plate — and never a `pathLength` draw-on. In this manual
 * the only hand-made mark is the sensei's brush, and this is not it.
 */

/** Stroke indices, named because a KanjiVG regeneration would silently break them. */
const TREE = [0, 5, 6, 7];
const SUN = [1, 2, 3, 4];

/**
 * How far the sun must fall to clear a `0 0 109 109` frame. The 日 subset's
 * bounding box starts at y = 33.79; half a 2.4 stroke width puts its visual
 * top at 32.59, so 109 − 32.59 = 76.4 hides it exactly. 78 buys a margin, and
 * flat caps only ever shrink that box, never grow it.
 */
const SUN_SET = 78;

const strokes = kanji.azuma.strokes;

if (process.env.NODE_ENV !== "production" && strokes.length !== 8) {
  console.warn(
    `AzumaFigure: 東 now has ${strokes.length} strokes, not 8 — re-verify the TREE/SUN split before shipping.`,
  );
}

type Weights = { tree?: number; ghost?: number; sun?: number };

/**
 * The subset, drawn as measured line-work.
 *
 * `butt` caps, and that is the whole difference between a figure and a
 * tracing-app export. A KanjiVG centreline stroked at one width with round
 * caps puts a hemisphere on both ends of every stroke: at 20px in the binding
 * margin nobody can see it, but this plate runs to 768px, where each stroke
 * became a uniform tube with two domed ends — neither written (no wedge entry,
 * no swell and release, no tapered 撇) nor printed. Cut flat, the same
 * centreline reads as what it is: a construction drawing, where every stroke
 * weighs the same BECAUSE the reader is being asked to count them into 木 and
 * 日. Joins stay round, so the 横折 corner inside 日 does not spike.
 *
 * The modulated, written voice of these glyphs lives in <Kanji profile="brush">
 * and is used everywhere the kanji are type rather than diagram.
 */
function Strokes({ idx, width, className }: { idx: number[]; width: number; className?: string }) {
  return (
    <g className={className} fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="butt" strokeLinejoin="round">
      {idx.map((i) => (
        <path key={i} d={strokes[i]} />
      ))}
    </g>
  );
}

/**
 * A registered specimen of one stroke subset, drawn in the shared 109-unit
 * grid so the three glyphs of the equation sit in the same square and the
 * sun appears in its true seat rather than re-centred.
 */
export function AzumaGlyph({ part, className, width = 3.2 }: { part: "tree" | "sun" | "all"; className?: string; width?: number }) {
  const idx = part === "tree" ? TREE : part === "sun" ? SUN : [...TREE, ...SUN];
  return (
    <svg viewBox="0 0 109 109" className={cn("block", className)} aria-hidden="true">
      <Strokes idx={idx} width={width} />
    </svg>
  );
}

type AzumaFigureProps = {
  className?: string;
  /** Leader labels printed inside the frame (hidden on small frames by CSS). */
  labels: { tree: string; sun: string };
  weights?: Weights;
};

export function AzumaFigure({ className, labels, weights }: AzumaFigureProps) {
  const ref = useRef<HTMLDivElement>(null);

  /* One scroll-linked value in the whole chapter, driving one property. */
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "center 0.45"] });
  const y = useTransform(scrollYProgress, [0, 1], [SUN_SET, 0]);

  /*
    Reduced motion is handled in CSS, not here — `transform: none !important`
    under the media query seats the sun. Branching the rendered transform on
    `useReducedMotion()` instead would hydrate a server `translateY(78px)`
    against a client `none` and mismatch; and it must PIN the sun at rest
    rather than merely skip a transition, or a reduced-motion reader would be
    left looking at a character decapitated below its own frame.
  */

  const tree = weights?.tree ?? 2.6;
  /* The ghost seat is drawn thinner than the sun that covers it, so the
     finished character has no #A29B90 halo on a page about crisp printing. */
  const ghost = weights?.ghost ?? 1.8;
  const sun = weights?.sun ?? 2.6;

  return (
    <div ref={ref} className={cn("azuma-fig", className)}>
      <RegisterMark className="azuma-fig__reg azuma-fig__reg--tl" />
      <RegisterMark className="azuma-fig__reg azuma-fig__reg--tr" />
      <RegisterMark className="azuma-fig__reg azuma-fig__reg--bl" />
      <RegisterMark className="azuma-fig__reg azuma-fig__reg--br" />

      <div className="azuma-fig__frame">
        <svg viewBox="0 0 109 109" className="azuma-fig__glyph" aria-hidden="true">
          {/* the empty socket, printed so the destination is legible from the first frame */}
          <Strokes idx={SUN} width={ghost} className="azuma-fig__seat" />
          {/* 木 — the tree, always standing */}
          <Strokes idx={TREE} width={tree} className="azuma-fig__tree" />
          {/* 日 — the sun, where the reader put it */}
          <motion.g style={{ y }} className="azuma-fig__sun">
            <Strokes idx={SUN} width={sun} />
          </motion.g>
        </svg>

        <span className="azuma-fig__label azuma-fig__label--tree t-mono" aria-hidden="true">
          {labels.tree}
        </span>
        <span className="azuma-fig__label azuma-fig__label--sun t-mono" aria-hidden="true">
          {labels.sun}
        </span>
      </div>
    </div>
  );
}
