"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useStillness } from "@/lib/useStillness";
import { Kanji } from "@/components/brush/Kanji";
import { EASE_INOUT } from "@/lib/ease";

/**
 * 東 — the club's own name, blind-stamped into the chapter.
 *
 * «Азума» is the east, and 東 is a picture of the east: a sun risen into the
 * branches of a tree. The chapter's whole argument about its own name is that
 * picture, so the character is printed in the frame the name is stated in, and
 * the statement beside it — «Азума — восток.» — is the reading.
 *
 * IT IS TYPE, NOT A DIAGRAM, and every other decision here follows from that.
 *
 * This figure used to take 東 apart: 木 standing, the 日 socket ghosted under
 * it, and a third copy of 日 that the reader raised up the trunk by scrolling
 * — all of it drawn in the `mono` voice at one width, so the strokes could be
 * counted into their two halves.
 *
 * That reading survives at the size a ruled plate prints at. It does not
 * survive at the size a watermark prints at, and the watermark is what this
 * became. Three stroke sets shared the sheet for the whole length of the climb,
 * so the mark a reader actually met was two 日 at different heights tangled
 * through a 木; and a KanjiVG centreline stroked at one width is a construction
 * drawing, which at 780px reads as scaffolding rather than as a character —
 * the exact failure `brush/Kanji.tsx` names at the top of its own file, where a
 * monoline is "clip art, because no written character has one weight along its
 * length". The apparatus that once justified the monoline (a ruled frame,
 * corner registration, two leader labels) had already been stripped out, which
 * left the diagram voice arguing for a diagram nobody was being shown.
 *
 * So the character is printed the way every other kanji on this page is
 * printed — <Kanji profile="brush">, modulated, entered and lifted — and ONE
 * mark is ever on the sheet. Nothing overlaps anything.
 *
 * MOTION, once and only once. The stamp is revealed by a single bottom-up wipe
 * as the frame arrives, on `EASE_INOUT`, because a wipe is a front crossing a
 * plate and not matter coming to rest. Then it is printed, and print does not
 * un-print: the reader can no longer take the character apart by scrolling back,
 * which is the point — there is nothing left to take apart.
 *
 * There is no scroll-linked value left in this chapter. The two notes that used
 * to live here — on `useScroll` walking offset parents, and on why a
 * reduced-motion branch must not be taken in the render — moved with the
 * reasoning: the first is gone with the last `useScroll`, and the second is
 * documented at length in `lib/useStillness.ts`, which is what this file now
 * uses to decide the same question.
 */

/** The wipe's two ends. Bottom-up: the sheet fills from the foot of the mark. */
const CLOSED = "inset(100% 0% 0% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

/** Seconds. Long enough to read as a press rather than a switch. */
const PRINT = 1.15;

type AzumaFigureProps = {
  className?: string;
  /**
   * Stroke body width in the 109-unit KanjiVG grid. Under the `brush` profile
   * the entry press runs about a third above this and the lift falls to half.
   * 東 carries two horizontal bars inside a closed 日, so it takes a lighter
   * body than the chapter numerals do at their default 5.5 — much above 4.5 and
   * the box fills in and the character stops being legible as itself.
   */
  weight?: number;
};

export function AzumaFigure({ className, weight = 4.2 }: AzumaFigureProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px -12% 0px" as never });
  const reduced = useStillness();
  const shown = inView || reduced;

  return (
    <div ref={ref} className={cn("azuma-fig", className)} aria-hidden="true">
      {/*
        `initial` is serialised into the SSR markup, so it is the SAME on both
        sides of the hydration boundary and stillness is spent on `animate` and
        `transition` only — the construction `ui/Curtain.tsx` uses, for the
        reason `lib/useStillness.ts` sets out. A reader who asked for less
        motion gets the finished stamp in zero seconds, not a mark clipped shut
        for good.
      */}
      <motion.div
        className="azuma-fig__press"
        initial={{ clipPath: CLOSED }}
        animate={{ clipPath: shown ? OPEN : CLOSED }}
        transition={{ duration: reduced ? 0 : PRINT, ease: EASE_INOUT }}
      >
        <Kanji id="azuma" profile="brush" weight={weight} label={null} className="azuma-fig__glyph" />
      </motion.div>
    </div>
  );
}
