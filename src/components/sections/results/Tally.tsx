"use client";

import { motion, useInView } from "motion/react";
import { useId, useRef } from "react";
import { Brush } from "@/components/brush/Brush";
import { brushMarks } from "@/components/brush/marks";
import { seedHash, seedSigned } from "@/components/ui/PressDefs";
import { Settle } from "@/components/ui/Reveal";
import { EASE_BRUSH } from "@/lib/ease";
import { useStillness } from "@/lib/useStillness";

const SEI = brushMarks.sei;

/*
  The pace of the counting hand, set once so a partial five keeps time with the
  whole ones beside it. 0.6s for five strokes is faster than <Brush>'s own 0.9s
  default for 正, and deliberately so: a tally is flicked onto a board, not
  composed. The longest count is nine glyphs, and at 0.075s apart the whole row
  is written in well under a second — long enough to read as a hand counting,
  short enough that a reader scrolling past still sees it happen.
*/
const MARK_DURATION = 0.6;
const MARK_STAGGER = 0.075;

/**
 * A partial 正: the first `strokes` of the five, written by the same hand that
 * writes the whole ones beside it.
 *
 * <Brush> draws a mark in FULL, and a tally's last five is by definition
 * unfinished, so the reveal is repeated here rather than shared: each stroke is
 * masked by its own centreline drawn on `pathLength`, so the ink appears under
 * the bristles instead of fading in. There is no filter to reproduce — 正 is
 * not one of PressDefs' INKED kinds, because at the size a tally prints the
 * press's tooth is sub-pixel — only the hand, which is why the seed tilts and
 * slips this glyph exactly as it does the others. Nine marks in a row that all
 * sit dead straight read as a font, not as someone counting.
 *
 * If <Brush> ever takes a stroke count, this collapses into it.
 */
function PartialTally({
  strokes,
  seed,
  delay,
  className,
}: {
  strokes: number;
  seed: string;
  delay: number;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" as never });
  const still = useStillness();
  const hand = seedHash(seed);

  /* a stroke of a partial takes a fifth of a whole 正, never a fifth of itself */
  const per = MARK_DURATION / SEI.strokes.length;
  const cx = SEI.width / 2;
  const cy = SEI.height / 2;
  const slip = 0.06 * SEI.thick;
  const settle =
    `translate(${(cx + seedSigned(hand, 4) * slip).toFixed(3)} ${(cy + seedSigned(hand, 5) * slip).toFixed(3)})` +
    ` rotate(${(seedSigned(hand, 1) * 0.85).toFixed(3)}) translate(${-cx} ${-cy})`;

  const drawn = { pathLength: 1, opacity: 1 };
  const hidden = { pathLength: 0, opacity: 0 };

  return (
    <svg ref={ref} viewBox={SEI.viewBox} className={className} aria-hidden="true">
      <g transform={settle}>
        {SEI.strokes.slice(0, strokes).map((stroke, i) => {
          const maskId = `${uid}-open-${i}`;
          const at = delay + i * per;
          return (
            <g key={i}>
              <mask id={maskId} maskUnits="userSpaceOnUse">
                <motion.path
                  d={stroke.center}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={SEI.thick * 1.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={hidden}
                  animate={inView || still ? drawn : hidden}
                  transition={{
                    duration: still ? 0 : per,
                    delay: still ? 0 : at,
                    ease: EASE_BRUSH,
                    /* opacity rides along so an undrawn stroke never shows the
                       mask's round-cap dot */
                    opacity: { duration: 0.06, delay: still ? 0 : at },
                  }}
                />
              </mask>
              <path d={stroke.fill} fill="currentColor" mask={`url(#${maskId})`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/**
 * One counted row: the label, and then the count — 正 marks and the arabic
 * figure as ONE run, the figure written immediately after the last stroke.
 *
 * A ledger writes the total at the END of the strokes, so the marks and the
 * figure are items of the same wrapping flex line: the count is one phrase, it
 * breaks where it must, and the rag it leaves on the right is the point — the
 * length of the run IS the size of the count.
 *
 * Nothing here is vermilion. A tally is not a mark the sensei is making, it is
 * a count, so it is set in the ink ramp: the complete fives quiet (bone-2), the
 * open five loud (bone). That tone only backs up a difference the reader can
 * already see — the last character is unfinished — so nothing is signalled by
 * colour, and the chapter's one red is left for the mark at its foot.
 */
export function TallyRow({ label, value, index }: { label: string; value: number; index: number }) {
  const fives = Math.floor(value / 5);
  const rest = value % 5;
  const base = 0.08 + index * 0.16;
  return (
    <div className="tally-row">
      <p className="t-mono tally-row__label">{label}</p>
      <div className="tally-row__count">
        {Array.from({ length: fives }, (_, i) => (
          <Brush
            key={i}
            kind="sei"
            /* the seed is PINNED rather than left to <Brush>'s per-instance id:
               the same count must write the same hand every time this chapter
               renders, including when the reader switches language */
            seed={`tally-${index}-${i}`}
            className="tally__glyph"
            delay={base + i * MARK_STAGGER}
            duration={MARK_DURATION}
          />
        ))}
        {rest > 0 && (
          <PartialTally
            strokes={rest}
            seed={`tally-${index}-open`}
            delay={base + fives * MARK_STAGGER}
            className="tally__glyph tally__glyph--open"
          />
        )}
        {/* the figure is PRINTED, not flown in — it is the ledger's own
            confirmation of the strokes, so it lands once they are counted */}
        <Settle
          className="tally-row__value"
          delay={base + (fives + 1) * MARK_STAGGER + 0.3}
          duration={0.55}
        >
          {value}
        </Settle>
      </div>
    </div>
  );
}
