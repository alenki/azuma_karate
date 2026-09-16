"use client";

import "@/styles/sections/results.css";

import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, results, type ChronicleEntry } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Curtain } from "@/components/ui/Curtain";
import { Grain } from "@/components/ui/Grain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Photo } from "@/components/ui/Photo";
import { Register, Reveal } from "@/components/ui/Reveal";
import { Roll } from "@/components/ui/Roll";
import { TallyRow } from "@/components/sections/results/Tally";
import { cn } from "@/lib/cn";

const chapter = chapters.find((c) => c.id === "results")!;
const HEADING_ID = "results-title";

/**
 * The chapter's opening sheet: what the chronicle is, and the one line that
 * says it moves. It travels away with the rest of the roll rather than
 * standing above it, so the first thing the reader unrolls is the title.
 */
function Masthead() {
  const { locale } = useLocale();
  return (
    <div className="chronicle-head">
      <h2 id={HEADING_ID} className="t-chapter text-bone chronicle-head__title">
        <LineReveal as="span" className="block" lines={[results.title[locale]]} />
      </h2>
      <Reveal delay={0.2}>
        <p className="t-lead text-bone-2 chronicle-head__lead">{results.lead[locale]}</p>
      </Reveal>
      <Reveal delay={0.38}>
        <p className="t-mono chronicle-head__hint">{results.hint[locale]}</p>
      </Reveal>
    </div>
  );
}

/**
 * One sheet of the chronicle: the plate, the hairline it is tipped in above,
 * and the ledger — date, title, note.
 *
 * THE FORM ALTERNATES BY INDEX, and that is the whole of the rhythm: an odd
 * entry takes a wide plate dropped down the sheet, an even one a tall plate
 * standing near the top. It is derived rather than authored so a fourth event
 * pasted into `results.events` composes itself; and it is the reason the
 * ledgers do NOT share a baseline across panels — each one follows its own
 * plate, which is what keeps a row of photographs from reading as a carousel
 * of equal boxes.
 *
 * The plates are printed in COLOUR. See the note over the chronicle's slots in
 * `media.ts` for why this chapter is the second exception to the press, and
 * for the test a replacement photograph has to pass.
 */
function Entry({ entry, index }: { entry: ChronicleEntry; index: number }) {
  const { locale } = useLocale();
  const wide = index % 2 === 1;
  return (
    <article className={cn("entry", wide ? "entry--wide" : "entry--tall")}>
      <Curtain className="entry__frame" duration={1.05} amount={0.25} from="bottom">
        <Photo
          slot={entry.plate}
          grade="color"
          sizes={wide ? "(min-width: 1024px) 44vw, 88vw" : "(min-width: 1024px) 28vw, 88vw"}
        />
      </Curtain>

      <div className="rule entry__rule" />
      <p className="t-mono entry__date">{entry.date[locale]}</p>
      <h3 className="t-h3 font-display text-bone entry__title">
        <LineReveal as="span" className="block" lines={[entry.title[locale]]} duration={0.9} />
      </h3>
      <Reveal delay={0.12} y={16} duration={0.8}>
        <p className="t-caption text-bone-2 entry__note">{entry.note[locale]}</p>
      </Reveal>
    </article>
  );
}

/**
 * The roll's last sheet. A chronicle ends on its count, not on another
 * photograph — three counted rows struck in 正, and under them the season's
 * record with the sensei's underline, which is the only vermilion in the
 * chapter and the one place red is doing the job the rota reserves for it.
 */
function Colophon() {
  const { locale } = useLocale();
  return (
    <div className="chronicle-foot">
      <Register className="chronicle-foot__board" delay={0.05} stagger={0.1} x={-14} duration={0.75}>
        {results.tallies.map((tally, i) => (
          <TallyRow key={tally.label.en} label={tally.label[locale]} value={tally.value} index={i} />
        ))}
      </Register>
      <Reveal delay={0.1} y={10} duration={0.7} className="chronicle-foot__closing">
        <p className="t-note chronicle-foot__record">{results.best[locale]}</p>
        <Brush kind="underline" className="chronicle-foot__mark" delay={0.45} duration={1.1} />
      </Reveal>
    </div>
  );
}

/**
 * Chapter 五 / 05 — «Хроника».
 *
 * THE SEASON UNROLLS. A makimono is a chronicle read by unrolling it sideways,
 * which is what a season's record is, so this is the one chapter in the manual
 * that does not run down the page: the reader scrolls down and the sheets
 * travel across. The mechanism is `ui/Roll` and nothing about it is in here —
 * this file is the composition.
 *
 * Three layers move at three rates. «Хроника» is PRINTED on the page at poster
 * scale and travels on its own overflow; the sheets are tipped in over it and
 * travel on theirs, so the letters a reader can see at any moment are the ones
 * no photograph is covering. The roll's folio and gauge stand still.
 *
 * The chapter is the page's first ink spread and its plates are the only ones
 * on the site besides chapter 四's printed in colour. A victory is gold,
 * ribbons and a red mat; a chronicle of victories pressed into two inks is a
 * chronicle with its subject removed.
 *
 * Below 1024, and for a reader who has asked for less motion, none of this
 * happens: the sheets are a column, in the same order, and the chapter reads
 * as the rest of the manual does.
 */
export function Results() {
  const { locale } = useLocale();

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      ground="ink"
      className="results relative"
      bleed={<Grain opacity={0.25} />}
    >
      <Roll
        className="results__roll"
        labelledBy={HEADING_ID}
        backdrop={<span className="chronicle-mark">{chapter.title[locale]}</span>}
      >
        {[
          <Masthead key="head" />,
          ...results.events.map((entry, i) => <Entry key={entry.title.en} entry={entry} index={i} />),
          <Colophon key="foot" />,
        ]}
      </Roll>
    </Chapter>
  );
}
