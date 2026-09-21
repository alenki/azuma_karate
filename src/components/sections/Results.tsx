"use client";

import "@/styles/sections/results.css";

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

const chapter = chapters.find((c) => c.id === "results")!;
const HEADING_ID = "results-title";

/**
 * The chapter's opening sheet: what the chronicle is, and the one line that
 * says it moves. It travels away with the rest of the roll rather than
 * standing above it, so the first thing the reader unrolls is the title.
 */
function Masthead() {
  return (
    <div className="chronicle-head">
      <h2 id={HEADING_ID} className="t-chapter text-bone chronicle-head__title">
        <LineReveal as="span" className="block" lines={[results.title]} />
      </h2>
      <Reveal delay={0.2}>
        <p className="t-lead text-bone-2 chronicle-head__lead">{results.lead}</p>
      </Reveal>
      <Reveal delay={0.38}>
        <p className="t-mono chronicle-head__hint">{results.hint}</p>
      </Reveal>
    </div>
  );
}

/**
 * One sheet of the chronicle: the plate, the hairline it is tipped in above,
 * and the ledger — date, title, note.
 *
 * EVERY SHEET IS THE SAME SHEET. One width, one aspect, one top edge, so the
 * rules and the dates under the plates stand on one baseline the whole length
 * of the roll and the chapter reads as a record rather than as three unrelated
 * pictures. The form used to alternate a tall plate and a dropped wide one by
 * index; nothing is derived from the index any more, so a fourth event pasted
 * into `results.events` needs no thought at all.
 *
 * The plates are printed in COLOUR. See the note over the chronicle's slots in
 * `media.ts` for why this chapter is the second exception to the press, and
 * for the test a replacement photograph has to pass.
 */
function Entry({ entry }: { entry: ChronicleEntry }) {
  return (
    <article className="entry">
      <Curtain className="entry__frame" duration={1.05} amount={0.25} from="bottom">
        <Photo slot={entry.plate} grade="color" sizes="(min-width: 1024px) 38vw, 88vw" />
      </Curtain>

      <div className="rule entry__rule" />
      <p className="t-mono entry__date">{entry.date}</p>
      <h3 className="t-h3 font-display text-bone entry__title">
        <LineReveal as="span" className="block" lines={[entry.title]} duration={0.9} />
      </h3>
      <Reveal delay={0.12} y={16} duration={0.8}>
        <p className="t-caption text-bone-2 entry__note">{entry.note}</p>
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
  return (
    <div className="chronicle-foot">
      <Register className="chronicle-foot__board" delay={0.05} stagger={0.1} x={-14} duration={0.75}>
        {results.tallies.map((tally, i) => (
          <TallyRow key={tally.label} label={tally.label} value={tally.value} index={i} />
        ))}
      </Register>
      <Reveal delay={0.1} y={10} duration={0.7} className="chronicle-foot__closing">
        <p className="t-note chronicle-foot__record">{results.best}</p>
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
 * Two layers move at two rates. «Хроника» is PRINTED on the page at poster
 * scale and travels on its own overflow; the sheets are tipped in over it and
 * travel on theirs, so the letters a reader can see at any moment are the ones
 * no photograph is covering.
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

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title}
      labelledBy={HEADING_ID}
      ground="ink"
      className="results relative"
      bleed={<Grain opacity={0.25} />}
    >
      <Roll
        className="results__roll"
        labelledBy={HEADING_ID}
        backdrop={<span className="chronicle-mark">{chapter.title}</span>}
      >
        {[
          <Masthead key="head" />,
          ...results.events.map((entry) => <Entry key={entry.title} entry={entry} />),
          <Colophon key="foot" />,
        ]}
      </Roll>
    </Chapter>
  );
}
