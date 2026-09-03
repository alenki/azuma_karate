"use client";

import "@/styles/sections/schedule.css";

import { motion } from "motion/react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, schedule } from "@/content/home";
import { club } from "@/content/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { Kanji } from "@/components/brush/Kanji";
import { Button } from "@/components/ui/Button";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal, EASE_OUT_EXPO } from "@/components/ui/Reveal";
import { Timetable } from "@/components/sections/Timetable";

const chapter = chapters.find((c) => c.id === "schedule")!;
const HEADING_ID = "schedule-title";
const VIEWPORT = { once: true, margin: "-12% 0px -8% 0px" } as const;

/** A hairline that is ruled across the page before the type arrives. */
function HairRule({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className="rule origin-left"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, delay, ease: EASE_OUT_EXPO }}
    />
  );
}

/**
 * Chapter 八 / 08 — «Расписание».
 *
 * The chapter opens as a band across the sheet — the title «Неделя», the
 * lead, and the two practical actions anchored at the right trim — and then
 * prints the week as a table. From 1280 up that table is trimmed to the true
 * paper edge rather than framed inside the margin: seven weekdays are seven
 * columns, so the table is the one thing in the manual that spends every
 * pixel of a wide screen on its subject. The note and the address close the
 * chapter as a colophon ranged across the full trim.
 *
 * The chapter's single brush mark is the tick the timetable draws under
 * today's column — nothing else here is hand-made.
 *
 * All geometry lives in `src/styles/sections/schedule.css`, including the
 * timetable's, because `Timetable` is rendered only from here.
 */
export function Schedule() {
  const { locale } = useLocale();
  const t = schedule;
  const title = t.title[locale];

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      className="schedule"
    >
      <div className="wrap schedule__sheet">
        {/* ---- running head: rule → eyebrow / mobile folio ---- */}
        <HairRule />
        <Reveal delay={0.15} y={12} duration={0.8} className="schedule__runhead">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="hachi" className="chapter__kanji" label={null} /> 08
          </span>
        </Reveal>

        {/* ---- opener: title · lead · the two actions, on the page grid ---- */}
        <div className="schedule__head">
          <div className="schedule__title-field">
            <h2 id={HEADING_ID} className="t-chapter">
              <LineReveal as="span" className="block" lines={[title]} delay={0.1} />
            </h2>
          </div>

          <Reveal delay={0.3} className="schedule__lead-field">
            <p className="t-lead measure-lead text-pretty text-ink-2">{t.lead[locale]}</p>
          </Reveal>

          {/*
            One action and one route, not two blocks. Set full-width and stacked
            they were a 74px outlined box above a 74px filled box, which reads as
            two text inputs rather than as a button pair. The Telegram button is
            the action; the map is a printed reference, so it is set as a ruled
            link — the same distinction the rest of the manual makes.
          */}
          <Reveal delay={0.45} y={20} className="schedule__actions">
            <Button variant="ink" size="lg" href={club.telegram} plain className="schedule__cta">
              {t.telegram[locale]}
            </Button>
            <Button variant="text" href={club.mapsHref} plain className="schedule__route t-mono">
              {t.route[locale]} <span aria-hidden="true">&#8594;</span>
            </Button>
          </Reveal>
        </div>

        {/*
          ---- the plate of this chapter: the week ----
          No frame. The table rules itself — a hairline over and under it and
          six between the days — and from 1280 those rules run past the trim
          to the paper edge, so a drawn box around it would contradict them.
        */}
        <Reveal delay={0.3} y={24} duration={1} className="schedule__table">
          <Timetable />
        </Reveal>

        {/* ---- colophon: the note and the address, ranged across the trim ---- */}
        <Reveal delay={0.4} y={12} duration={0.8} className="schedule__colophon">
          <p className="t-caption schedule__note">{t.note[locale]}</p>
          <address className="t-mono schedule__address">
            <span className="whitespace-nowrap">{club.city[locale]} ·</span>{" "}
            <span className="whitespace-nowrap">{club.address[locale]} ·</span>{" "}
            <span className="whitespace-nowrap">{club.coordsLabel}</span>
          </address>
        </Reveal>
      </div>
    </Chapter>
  );
}
