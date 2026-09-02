"use client";

import "@/styles/sections/results.css";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, results } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { brushMarks } from "@/components/brush/marks";
import { Curtain } from "@/components/ui/Curtain";
import { Grain } from "@/components/ui/Grain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Photo } from "@/components/ui/Photo";
import { Reveal, EASE_OUT_EXPO } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "results")!;
const HEADING_ID = "results-title";
const SEI = brushMarks.sei;

/**
 * A partial 正: the first `strokes` of the five, printed the way a hand stops
 * mid-character. Drawn stroke by stroke when the board enters view.
 */
function PartialTally({ strokes, delay }: { strokes: number; delay: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" as never });
  const reduced = useReducedMotion();
  const per = 0.9 / 5;
  return (
    <svg ref={ref} viewBox={SEI.viewBox} className="tally__glyph" aria-hidden="true">
      {SEI.strokes.slice(0, strokes).map((stroke, i) => (
        <motion.path
          key={i}
          d={stroke.fill}
          fill="currentColor"
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: inView || reduced ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.12, delay: reduced ? 0 : delay + i * per }}
        />
      ))}
    </svg>
  );
}

/** One counted row: label, the count in 正 marks, the arabic number. */
function TallyRow({ label, value, index }: { label: string; value: number; index: number }) {
  const fives = Math.floor(value / 5);
  const rest = value % 5;
  const base = 0.1 + index * 0.12;
  return (
    <div className="tally-row">
      <p className="t-mono text-bone-2 tally-row__label">{label}</p>
      <div className="tally-row__marks" aria-hidden="true">
        {Array.from({ length: fives }, (_, i) => (
          <Brush key={i} kind="sei" className="tally__glyph text-shu-lift" delay={base + i * 0.12} duration={0.7} />
        ))}
        {rest > 0 && (
          <span className="text-shu-lift">
            <PartialTally strokes={rest} delay={base + fives * 0.12} />
          </span>
        )}
      </div>
      <p className="t-chapter font-display text-bone tally-row__value">
        <span className="sr-only">{label}: </span>
        {value}
      </p>
    </div>
  );
}

/**
 * Chapter 五 / 05 — «Хроника».
 *
 * The page's first ink block. Medals, gradings and tournaments are counted the
 * way a dojo counts them — in 正 tally marks, five strokes at a time, struck
 * onto the board as the section enters — and the season is listed as a printed
 * timeline. The one colour photograph on the site sits here: the trophies.
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
      <div className="wrap relative z-10 py-28 md:py-40">
        <div className="rule" />
        <Reveal delay={0.1} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-bone-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono text-bone-2">
            <Kanji id="go" className="chapter__kanji" label={null} /> 05
          </span>
        </Reveal>

        <div className="mt-12 grid gap-x-8 gap-y-16 md:mt-16 lg:grid-cols-12">
          {/* ---- title, lead, tally board ---- */}
          <div className="lg:col-span-6">
            <h2 id={HEADING_ID} className="t-chapter text-bone">
              <LineReveal as="span" className="block" lines={[t.title[locale]]} />
            </h2>
            <Reveal delay={0.2} className="mt-6">
              <p className="t-lead max-w-[40ch] text-bone-2">{t.lead[locale]}</p>
            </Reveal>

            <div className="mt-14 flex flex-col">
              {t.tallies.map((tally, i) => (
                <TallyRow key={tally.label.en} label={tally.label[locale]} value={tally.value} index={i} />
              ))}
            </div>
          </div>

          {/* ---- the one colour plate ---- */}
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-10">
            <figure className="m-0">
              <Curtain className="aspect-[16/10]" duration={1.1}>
                <Photo slot="trophies" grade="color" sizes="(min-width: 1024px) 40vw, 100vw" />
              </Curtain>
              <figcaption className="t-caption mt-4 text-bone-2">{t.plateCaption[locale]}</figcaption>
            </figure>
          </div>
        </div>

        {/* ---- season timeline ---- */}
        <div className="mt-20 md:mt-28">
          <ol className="m-0 list-none p-0">
            {t.timeline.map((row, i) => (
              <li key={row.title.en}>
                <Reveal delay={0.05 + i * 0.06}>
                  <div className="timeline-row">
                    <p className="t-mono text-bone-2 timeline-row__date">{row.date[locale]}</p>
                    <h3 className="t-h3 font-display text-bone timeline-row__title">{row.title[locale]}</h3>
                    <p className="t-caption text-bone-2 timeline-row__note">{row.note[locale]}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className="rule" />
        </div>

        {/* ---- athlete of the year ---- */}
        <Reveal delay={0.2} className="mt-12">
          <div className="best-strip">
            <motion.span
              aria-hidden="true"
              className="best-strip__rule"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
            />
            <p className="t-mono text-shu-lift">{t.best[locale]}</p>
          </div>
        </Reveal>
      </div>
    </Chapter>
  );
}
