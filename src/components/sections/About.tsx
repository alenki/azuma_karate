"use client";

import "@/styles/sections/about.css";

import { motion } from "motion/react";
import { useLocale } from "@/i18n/LocaleProvider";
import { about, chapters } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { ChapterFoot } from "@/components/layout/ChapterFoot";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { AzumaFigure, AzumaGlyph } from "@/components/figures/AzumaFigure";
import { RegisterMark } from "@/components/ui/RegisterMark";
import { Curtain } from "@/components/ui/Curtain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Photo } from "@/components/ui/Photo";
import { Register, Reveal, Settle, EASE_OUT_EXPO } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "about")!;
const HEADING_ID = "about-title";
const VIEWPORT = { once: true, margin: "-12% 0px -8% 0px" } as const;

/**
 * The chapter's one opening rule, ruled across the sheet before the type it
 * introduces arrives. `.rule--strong` is the heaviest of the three graded
 * hairlines and the book allows exactly one per chapter, at the head — the
 * chapter's foot, the plate note and the ledger take lighter weights below it,
 * so the page finally has a line hierarchy instead of one line repeated.
 */
function OpeningRule({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className="rule rule--strong origin-left"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, delay, ease: EASE_OUT_EXPO }}
    />
  );
}

/**
 * Chapter 二 / 02 — «О клубе».
 *
 * The glossary page of the manual. The club explains itself by defining the
 * only two words it owns — its own name and its own way — and then stops
 * defining and makes a promise.
 *
 * Entry one is 東 / «Азума», which is Japanese for east. Its figure prints the
 * tree, ghosts the socket where the sun belongs, and lets the reader raise the
 * sun by scrolling until the club's name finishes drawing itself. Entry two is
 * 極真 / «Киокуши́н» — printed here as a solid type specimen rather than the
 * 6%-opacity wallpaper this chapter used to carry, which duplicated the hero's.
 *
 * Then the apparatus stops. The promise is set alone on the paper, the denial
 * printed a tone back so the promise steps forward, and the chapter's single
 * brush mark is ruled under «держать удар» — the same word the hero's first
 * stroke completes two chapters earlier. That rhyme is the only red in the
 * chapter, and it is the whole reason the mark is here rather than under a
 * translation gloss.
 *
 * The sheet is the viewport, not a centred column, so from 1600px up both
 * entries re-column onto the same three bands of the page's twelve — a plate
 * or an argument, a ruled gutter, and a facing block split four and three —
 * and the promise, whose size is held by the measured width of its own longest
 * line rather than by a container, grows with the paper it is printed on.
 *
 * MOTION. Every block used to arrive by the same fade-and-rise, which made a
 * printed diagram, a photograph and a paragraph read as three cards of one
 * component library. They are three kinds of matter, so they arrive three
 * ways:
 *
 *   the running head comes into REGISTER — marks sliding along one shared
 *     baseline, which is how a sheet is lined up on a press;
 *   the apparatus is SETTLED — the diagram, its legend, the specimen, the
 *     ledger and the plate caption do not travel at all, they are printed;
 *   the copy REVEALS — the two arguments rise, because prose is the only
 *     matter here a reader is meant to watch arrive;
 *   the photograph is CURTAINED — uncovered by a front crossing it, the one
 *     thing in the chapter that travels;
 *   the display type rises inside its mask, and the brush is written.
 */
export function About() {
  const { locale } = useLocale();
  const t = about;

  const promiseText = `${t.promise1[locale]} ${t.promiseLead[locale]}${t.promiseMark[locale]}${t.promiseTail[locale]}`;

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      className="about"
    >
      <div className="wrap about__inner">
        {/* ---- running head: a trimmed sheet ---- */}
        <div className="about__head">
          <div className="about__head-rule">
            <OpeningRule />
            <RegisterMark className="about__reg about__reg--start" />
            <RegisterMark className="about__reg about__reg--end" />
          </div>
          {/*
            Two cells at every width, never three. The inline folio and the
            figure list are the same field of the running head — one prints
            below 768 where there is no binding margin to hang a numeral in,
            the other above it — so they are held in one cell that ranges to
            the trim at both widths. As two cells the hidden one still took its
            share of the `space-between` and unpinned the folio on a phone.
          */}
          <Register delay={0.15} stagger={0.09} duration={0.8} className="about__head-row">
            <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
            <span className="about__head-marks">
              <span className="folio-inline t-mono">
                <Kanji id="ni" className="chapter__kanji" label={null} /> 02
              </span>
              {/* what a manual prints at the outer edge of a running head */}
              <span className="t-mono about__head-figs" aria-hidden="true">
                {t.figNumber[locale]} · {t.plateNumber[locale]}
              </span>
            </span>
          </Register>
        </div>

        {/* ================= 01 · the name ================= */}
        <div className="about__entry about__entry--name">
          <span className="about__gutter about__gutter--name" aria-hidden="true" />

          <figure className="about__figure">
            {/* the diagram is PRINTED, not flown in: the only thing that ever
                moves inside this frame is the sun, and the reader moves it */}
            <Settle duration={0.9} from={1.008}>
              <AzumaFigure labels={{ tree: t.figTree[locale], sun: t.figSun[locale] }} />
            </Settle>

            <figcaption className="about__legend">
              <Settle delay={0.2} duration={0.8} className="about__legend-inner">
                <span className="about__equation" aria-hidden="true">
                  <span className="t-mono about__fig-no">{t.figNumber[locale]}</span>
                  <AzumaGlyph part="tree" className="about__eq-glyph" />
                  <span className="about__eq-op t-mono">+</span>
                  <AzumaGlyph part="sun" className="about__eq-glyph" />
                  <span className="about__eq-op t-mono">=</span>
                  <AzumaGlyph part="all" className="about__eq-glyph" />
                </span>
                <span className="t-mono about__eq-key">{t.figEquation[locale]}</span>
              </Settle>
            </figcaption>
          </figure>

          <div className="about__entry-body">
            <Settle delay={0.05} duration={0.7}>
              <p className="t-mono about__label">{t.label1[locale]}</p>
            </Settle>

            <h2 id={HEADING_ID} className="about__word">
              <span className="sr-only">
                {t.word1[locale]} {t.dash[locale]} {t.meaning1[locale]}
              </span>
              <LineReveal
                as="span"
                className="block"
                label={null}
                delay={0.12}
                stagger={0.1}
                bleed={0.2}
                lines={[
                  <span key="w" className="text-ink-2">
                    {t.word1[locale]} <span className="about__dash">{t.dash[locale]}</span>
                  </span>,
                  <span key="m">{t.meaning1[locale]}</span>,
                ]}
              />
            </h2>

            <Reveal delay={0.32} className="about__prose">
              <p>{t.body1[locale]}</p>
            </Reveal>

            {/* The figure's reading, set across from the figure as a manual
                sets a plate note. Below 1600 it follows the body copy; on a
                wide sheet the body splits and it stands beside it, in the
                margin. `.t-note` and not `.t-caption`: these are two running
                Russian sentences — matter that is READ — and the caption voice
                is drawn for the two counted words printed under a plate. */}
            <Reveal delay={0.44} className="about__fig-read">
              <div className="rule rule--hair" />
              <p className="t-note text-ink-2">{t.figNote[locale]}</p>
              <p className="t-note text-ink">{t.figRefusal[locale]}</p>
            </Reveal>
          </div>
        </div>

        {/* ================= 02 · the way ================= */}
        {/*
          Entry two is set to the same three bands as entry one — a block, a
          ruled gutter, a facing block — but opens out around them: a headline
          row above, then the plate across the whole sheet below. The chapter
          widens as it goes, so the promise arriving full-width at the end is
          the last step of a movement rather than a change of subject.
        */}
        <div className="about__entry about__entry--way">
          <div className="about__way-head">
            <div className="about__way-word">
              <Settle duration={0.7}>
                <p className="t-mono about__label">{t.label2[locale]}</p>
              </Settle>

              <h3 className="about__word">
                <span className="sr-only">
                  {t.word2[locale]} {t.dash[locale]} {t.meaning2[locale]}
                </span>
                <LineReveal
                  as="span"
                  className="block"
                  label={null}
                  delay={0.1}
                  stagger={0.1}
                  bleed={0.2}
                  lines={[
                    <span key="w" className="text-ink-2">
                      {t.word2[locale]} <span className="about__dash">{t.dash[locale]}</span>
                    </span>,
                    <span key="m">{t.meaning2[locale]}</span>,
                  ]}
                />
              </h3>
            </div>

            {/*
              The specimen faces the word it spells. Its weight was 4.2, chosen
              when <Kanji> drew one uniform monoline at every size; the glyph is
              modulated type now, and 4.2 next to a 128px Prata headword still
              read as a wireframe borrowed from another medium. 5 is the body
              width — the entry press runs about a third above it and the lift
              falls to half — which puts the specimen's stem on the headword's.
              It is the densest glyph in the book (極 is twelve strokes in a
              109-unit square), so it does not go heavier than that.
            */}
            <div className="about__specimen">
              <Settle delay={0.16} duration={0.9}>
                <div className="about__specimen-glyphs" aria-hidden="true">
                  <Kanji id="kyoku" className="about__specimen-glyph" weight={5} label={null} />
                  <Kanji id="shin" className="about__specimen-glyph" weight={5} label={null} />
                </div>
                <p className="t-mono about__romaji" aria-hidden="true">
                  {t.romaji}
                </p>
              </Settle>
            </div>
          </div>

          <div className="about__way-body">
            {/* the same hairline entry one rules between its two facing
                blocks — the argument and the ledger of facts face each
                other here in exactly the same way, and on a sheet wider
                than the two of them together they need it or they read as
                two islands. CSS hides it wherever they stack. */}
            <span className="about__gutter about__gutter--way" aria-hidden="true" />

            <Reveal delay={0.3} className="about__prose about__prose--way">
              <p>{t.body2[locale]}</p>
            </Reveal>

            {/*
              A printed reference table, so it settles rather than staggering
              row by row. <Register> is the verb a ledger asks for and it is
              deliberately not used here: it wraps every child in a `div` of its
              own, and `dl` admits exactly one kind of child — a `div` holding
              `dt`s and `dd`s. A second `div` inside that one falls outside the
              content model, and a definition list whose structure assistive
              technology can no longer parse is a far worse trade than a table
              that arrives in one impression. The counting is done by the
              graded rules instead: a standard hairline over the table, hair
              between the rows, a standard one closing it.
            */}
            {/* `from` is pulled well under the default: the impression is a
                fraction of the mark's own size, and this mark runs 1371px wide
                at 2560, where 1.2% is sixteen visible pixels of shrink. */}
            <Settle delay={0.42} duration={0.8} from={1.004} className="about__ledger-wrap">
              <dl className="about__ledger">
                {t.ledger.map((row) => (
                  <div key={row.k.en} className="about__ledger-row">
                    <dt className="t-mono text-ink-2">{row.k[locale]}</dt>
                    <dd className="t-caption text-ink">{row.v[locale]}</dd>
                  </div>
                ))}
              </dl>
            </Settle>
          </div>

          {/*
            The chapter's only photograph, placed to answer the exact question
            the words «полный контакт» raise in a parent one paragraph earlier:
            headgear, pads, a coach in the frame.
          */}
          <figure className="about__plate">
            <Curtain className="about__plate-img" duration={1.3} from="bottom">
              {/* The manifest's focal point frames a 4:5 crop; the 16:9 band
                  the plate takes from 640 up — and the 2:1 band it takes on a
                  wide sheet — need the same frame to sit higher to keep the
                  headgear in shot.

                  The plate is one gutter short of the viewport at every width
                  (95vw at 390, 96.4vw at 1440 and above), so a flat 97vw is
                  the honest hint; the old 92vw under-declared it by a hundred
                  pixels at 1440 and Next served a source too small for a sheet
                  that is now the width of the screen. */}
              <Photo
                slot="kidsKumite"
                sizes="97vw"
                style={{ objectPosition: "50% 26%" }}
              />
            </Curtain>
            <figcaption className="about__plate-cap t-caption text-ink-2">
              <Settle delay={0.4} duration={0.7}>
                {t.plate[locale]}
              </Settle>
            </figcaption>
          </figure>
        </div>

        {/* ================= the promise ================= */}
        <div className="about__promise">
          <p className="about__promise-type">
            <span className="sr-only">{promiseText}</span>
            <LineReveal
              as="span"
              className="block"
              label={null}
              delay={0.06}
              stagger={0.13}
              duration={1.15}
              bleed={0.2}
              lines={[
                <span key="a" className="about__ghost">
                  {t.promise1[locale]}
                </span>,
                <span key="b">
                  {t.promiseLead[locale]}
                  {/* the marked phrase must break as one unit here exactly as it
                      does in the twin below, or a wrap would slide the two out
                      of register and the stroke would rule the wrong words */}
                  <span className="about__promise-nowrap">{t.promiseMark[locale]}</span>
                  {t.promiseTail[locale]}
                </span>,
              ]}
            />

            {/*
              The mark rides an out-of-flow twin of both lines: LineReveal's
              masks clip anything inside them, so the brush cannot live there.
              The twin is `visibility: hidden` and only the stroke is turned
              back on, which means the mark measures «держать удар» — or "take
              a hit" — exactly, in either language, at any size, for free.
            */}
            <span className="about__promise-mark" aria-hidden="true">
              <span className="block">
                <span className="about__promise-bleed">
                  <span className="about__promise-line">{t.promise1[locale]}</span>
                </span>
                <span className="about__promise-bleed">
                  <span className="about__promise-line">
                    {t.promiseLead[locale]}
                    <span className="about__promise-anchor">
                      {t.promiseMark[locale]}
                      <Brush
                        kind="underline"
                        className="about__promise-stroke text-shu"
                        delay={1.25}
                        margin="-12% 0px -8% 0px"
                      />
                    </span>
                    {t.promiseTail[locale]}
                  </span>
                </span>
              </span>
            </span>
          </p>
        </div>

        {/*
          The colophon this chapter hand-built is the book's now, so all ten
          chapters close the same way they open. What it gains beyond that: the
          exits are 44px targets which double their own rule under the pointer
          instead of turning vermilion. Red on a mouse position was the last
          thing in this chapter spending the sensei's one accent on something
          that is not his brush.
        */}
        <ChapterFoot
          index={chapter.index}
          links={[
            { href: "#programs", label: t.onGroups[locale] },
            { href: "#sensei", label: t.onSensei[locale] },
          ]}
        />
      </div>
    </Chapter>
  );
}
