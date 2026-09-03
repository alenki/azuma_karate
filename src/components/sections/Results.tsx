"use client";

import "@/styles/sections/results.css";

import { motion, useInView } from "motion/react";
import { useId, useRef } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, results } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { ChapterFoot } from "@/components/layout/ChapterFoot";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { brushMarks } from "@/components/brush/marks";
import { Curtain } from "@/components/ui/Curtain";
import { Grain } from "@/components/ui/Grain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Photo } from "@/components/ui/Photo";
import { seedHash, seedSigned } from "@/components/ui/PressDefs";
import { Register, Reveal, Settle } from "@/components/ui/Reveal";
import { EASE_BRUSH } from "@/lib/ease";
import { useStillness } from "@/lib/useStillness";

const chapter = chapters.find((c) => c.id === "results")!;
const HEADING_ID = "results-title";
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
 * The figure used to be ranged to the far trim, which printed every count twice
 * at full weight with half a sheet of black between the two halves. A ledger
 * writes the total at the END of the strokes, so the marks and the figure are
 * now items of the same wrapping flex line: the count is one phrase, it breaks
 * where it must, and the rag it leaves on the right is the point — the length
 * of the run IS the size of the count.
 *
 * Nothing here is vermilion. A tally is not a mark the sensei is making, it is
 * a count, so it is set in the ink ramp: the complete fives quiet (bone-2), the
 * open five loud (bone). That tone only backs up a difference the reader can
 * already see — the last character is unfinished — so nothing is signalled by
 * colour, and the chapter's one red is left for the mark at its foot.
 */
function TallyRow({ label, value, index }: { label: string; value: number; index: number }) {
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

/**
 * Chapter 五 / 05 — «Хроника».
 *
 * The page's first ink block. Medals, gradings and tournaments are counted the
 * way a dojo counts them — in 正 tally marks, five strokes at a time, struck
 * onto the board as the section enters — and the season is listed as a printed
 * timeline. The chapter's plate, the trophies, is pressed ink-to-bone.
 *
 * The sheet is the viewport, so the chapter is composed as a ledger PAGE and
 * changes shape twice as the paper grows (the arithmetic is in results.css):
 * one column below 1024; two fields on the shared twelve-column page grid from
 * 1024; and past 1600 the deck leaves the ledger column, each counted row
 * becomes a single ledger line — label rail, then the count — and the plate
 * bleeds off the right edge of the paper.
 *
 * Motion is by verb, not by habit: the running head and every tabulated row
 * come into REGISTER along their baseline, the copy REVEALS, the plate opens
 * under a CURTAIN, and the figures SETTLE as though the sheet went to press
 * with them. The only thing drawn by a hand is the count.
 */
export function Results() {
  const { locale } = useLocale();
  const t = results;

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      ground="ink"
      className="results relative overflow-hidden"
      bleed={<Grain opacity={0.25} />}
    >
      <div className="wrap results__sheet relative z-10">
        <div className="rule" />
        <Register
          className="flex items-baseline justify-between gap-6 pt-4"
          delay={0.1}
          duration={0.7}
          stagger={0.08}
        >
          <p className="t-mono text-bone-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono text-bone-2">
            <Kanji id="go" className="chapter__kanji" label={null} /> 05
          </span>
        </Register>

        {/*
          The masthead is one grid at every width. Up to 1600 the deck and the
          ledger share a six-column stack (`.results__col`); past it the column
          dissolves — `display: contents` — and title, lead and board are placed
          on the page grid themselves. Source order is already reading order, so
          the promotion changes no focus order and nothing is announced twice.
        */}
        <div className="results__masthead">
          {/* ---- title, lead, tally board ---- */}
          <div className="results__col">
            <h2 id={HEADING_ID} className="t-chapter text-bone results__title">
              <LineReveal as="span" className="block" lines={[t.title[locale]]} />
            </h2>
            <Reveal delay={0.2} className="results__lead">
              <p className="t-lead max-w-[40ch] text-bone-2">{t.lead[locale]}</p>
            </Reveal>

            {/* the board is a tabulated set, so its rows come into register one
                after another rather than each rising on its own */}
            <Register className="results__board" delay={0.05} stagger={0.1} x={-14} duration={0.75}>
              {t.tallies.map((tally, i) => (
                <TallyRow key={tally.label.en} label={tally.label[locale]} value={tally.value} index={i} />
              ))}
            </Register>
          </div>

          {/* ---- the chapter's plate: five columns to 1600, then four that
                  bleed to the paper edge — hence the two `sizes` steps.
                  Pressed ink-to-bone, not ink-to-paper: this is a dark
                  chapter, and a plate whose highlight is paper-white punches
                  a hole in the ground it is printed on. ---- */}
          <figure className="results__plate">
            <Curtain className="results__plate-frame" duration={1.1}>
              <Photo
                slot="trophies"
                grade="duotone-ink"
                sizes="(min-width: 1600px) 34vw, (min-width: 1024px) 38vw, 100vw"
              />
            </Curtain>
            <figcaption className="t-caption text-bone-2 results__plate-caption">{t.plateCaption[locale]}</figcaption>
          </figure>
        </div>

        {/* ---- season timeline ---- */}
        <div className="results__timeline">
          <ol className="m-0 list-none p-0">
            {t.timeline.map((row, i) => (
              <li key={row.title.en}>
                {/*
                  A chronicle line is tabulated matter, so it comes into
                  register: date, title and note hold one baseline and arrive
                  along it, left to right. <Register> wraps each field in its
                  own element, which is why the grid columns in results.css are
                  addressed by POSITION rather than by the classes below.
                */}
                <Register className="timeline-row" delay={0.05 + i * 0.08} stagger={0.07} x={-12} duration={0.65}>
                  <p className="t-mono text-bone-2 timeline-row__date">{row.date[locale]}</p>
                  <h3 className="t-h3 font-display text-bone timeline-row__title">{row.title[locale]}</h3>
                  <p className="t-caption text-bone-2 timeline-row__note">{row.note[locale]}</p>
                </Register>
              </li>
            ))}
          </ol>
          <div className="rule" />
        </div>

        {/*
          The colophon closes the chapter, and the season's record closes the
          colophon. The record used to be a 2px vermilion box animated on
          scaleX — a rule impersonating a brush — with its line set in red mono
          beside it. The line is ink now and the mark under it is a real one:
          the sensei's underline, pulled through the press, and the only
          vermilion in the whole chapter.

          `rule={false}` because the chronicle above already closes itself with
          a hairline, and two rules a finger's width apart is a printing error,
          not a colophon.
        */}
        <ChapterFoot
          rule={false}
          index={chapter.index}
          note={
            <>
              <span className="results__record">{t.best[locale]}</span>
              <Brush kind="underline" className="results__record-mark" delay={0.45} duration={1.1} />
            </>
          }
        />
      </div>
    </Chapter>
  );
}
