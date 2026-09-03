"use client";

import "@/styles/sections/schedule.css";

import { motion } from "motion/react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, schedule } from "@/content/home";
import { club } from "@/content/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { ChapterFoot } from "@/components/layout/ChapterFoot";
import { Kanji } from "@/components/brush/Kanji";
import { Button } from "@/components/ui/Button";
import { LineReveal } from "@/components/ui/LineReveal";
import { Register, Reveal, Settle, EASE_OUT } from "@/components/ui/Reveal";
import { Timetable } from "@/components/sections/Timetable";

const chapter = chapters.find((c) => c.id === "schedule")!;
const HEADING_ID = "schedule-title";
const VIEWPORT = { once: true, margin: "-12% 0px -8% 0px" } as const;

/**
 * The rule that opens the chapter, ruled across the page before the type
 * arrives. `.rule--strong` is the heaviest of the three graded hairlines and
 * is spent once per chapter, at the head — the same mark chapters 02 «О клубе»
 * and 04 «Тренер» open with. The table below rules itself in the standard
 * weight, and the
 * separations inside it in the lightest, so the chapter has three line
 * weights and a reader can tell which of them is structural.
 */
function OpeningRule({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className="rule rule--strong origin-left"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, delay, ease: EASE_OUT }}
    />
  );
}

/**
 * Chapter 八 / 08 — «Расписание».
 *
 * The chapter opens as a band across the sheet — the title «Неделя», the
 * lead, and the two practical actions on one line, standing on a common
 * bottom edge — and then prints the week as a table. From 1280 up that table
 * is trimmed to the true paper edge rather than framed inside the margin:
 * seven weekdays are seven columns, so the table is the one thing in the
 * manual that spends every pixel of a wide screen on its subject. The address
 * is set under it as a plate's caption, and the chapter closes on the same
 * foot the rest of the book closes on.
 *
 * The opener band used to be gated at 1600, which left everything between
 * 1024 and 1600 opening with a 540 × 310 rectangle of blank paper between the
 * lead and the buttons. It is gated at 1280 now — the same tier the table
 * starts bleeding at, which is the tier the chapter becomes a full sheet.
 *
 * MOTION. Five fade-ups and a mark that had already been drawn by the time
 * anyone reached it. Now: the rule is ruled, the running head comes into
 * register, the title rises line by line, and the week — the largest artefact
 * on the site — is pulled through the press column by column, left to right,
 * with the chapter's single brush mark ticked under today's weekday after the
 * seventh column lands. The verbs are the shared ones (Register for a row of
 * counted things, Settle for matter that was printed rather than flown in);
 * nothing here needed a new primitive.
 *
 * The chapter's single brush mark is that tick — nothing else here is
 * hand-made, and nothing else here is red.
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
        <OpeningRule />
        <Register delay={0.15} stagger={0.08} duration={0.8} className="schedule__runhead">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="hachi" className="chapter__kanji" label={null} /> 08
          </span>
        </Register>

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
          No frame and no wrapper reveal. The table rules itself — a hairline
          over and under it and six between the days — and from 1280 those
          rules run past the trim to the paper edge, so a drawn box around it
          would contradict them. Its arrival is its own, column by column, and
          lives in `Timetable`.
        */}
        <div className="schedule__table">
          <Timetable />
        </div>

        {/*
          ---- the plate's caption: where the hall is ----
          `.t-note`, not `.t-mono`: this is four fields of address and
          coordinates that a reader READS, and the mono voice for read matter
          is sentence case at normal tracking. A street name in tracked
          all-caps is the thing the type rule exists to stop.
        */}
        <Settle delay={0.15} duration={0.7} className="schedule__caption">
          <address className="t-note schedule__address">
            <span className="whitespace-nowrap">{club.city[locale]} ·</span>{" "}
            <span className="whitespace-nowrap">{club.address[locale]} ·</span>{" "}
            <span className="whitespace-nowrap">{club.coordsLabel}</span>
          </address>
        </Settle>

        {/*
          The chapter closes on the book's foot rather than running off the
          bottom of the sheet: the folio at the binding, the provisional-data
          note as its closing line, and no exits — the chapter's two ways out
          are the buttons in its own opener, and a third would make a nav bar
          of the colophon.
        */}
        <ChapterFoot index={chapter.index} note={t.note[locale]} />
      </div>
    </Chapter>
  );
}
