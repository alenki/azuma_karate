"use client";

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
 * A chapter opener in two columns: the title «Неделя» and the lead set in
 * cols 1–7, the two practical actions stacked as one block in cols 9–12 and
 * hung on the lead's last line. Under it the weekly timetable is tipped in
 * full width inside a hairline frame, like a table set to the trim of a
 * printed manual; the note and the address close the chapter as a colophon.
 * The chapter's single brush mark is the tick the timetable draws under
 * today's column — nothing else is hand-made here.
 */
export function Schedule() {
  const { locale } = useLocale();
  const t = schedule;
  const title = t.title[locale];

  return (
    <Chapter id={chapter.id} index={chapter.index} title={chapter.title[locale]} labelledBy={HEADING_ID}>
      <div className="wrap pt-20 pb-24 md:pt-28 md:pb-36">
        {/* ---- running head: rule → eyebrow / mobile folio ---- */}
        <HairRule />
        <Reveal delay={0.15} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="hachi" className="chapter__kanji" label={null} /> 08
          </span>
        </Reveal>

        {/* ---- opener: title + lead (cols 1–7) · actions (cols 9–12, hung on the lead) ---- */}
        <div className="mt-10 md:mt-14 md:grid md:grid-cols-12 md:items-end md:gap-x-6">
          <div className="md:col-span-7">
            <h2 id={HEADING_ID} className="t-chapter">
              <LineReveal as="span" className="block" lines={[title]} delay={0.1} />
            </h2>
            <Reveal delay={0.3} className="mt-8 md:mt-10">
              <p className="t-lead max-w-[46ch] text-pretty text-ink-2">{t.lead[locale]}</p>
            </Reveal>
          </div>

          <Reveal
            delay={0.45}
            y={20}
            className="mt-10 flex flex-col gap-2 md:col-span-5 md:col-start-8 md:mt-0 lg:col-span-4 lg:col-start-9"
          >
            <Button variant="outline" size="lg" href={club.mapsHref} plain className="w-full">
              {t.route[locale]}
            </Button>
            <Button variant="ink" size="lg" href={club.telegram} plain className="w-full">
              {t.telegram[locale]}
            </Button>
          </Reveal>
        </div>

        {/* ---- the plate of this chapter: the week, framed by a hairline ---- */}
        <Reveal delay={0.3} y={24} duration={1} className="mt-12 md:mt-20">
          <div className="md:border md:border-rule md:p-6">
            <Timetable />
          </div>
        </Reveal>

        {/* ---- colophon: the note and the address ---- */}
        <Reveal delay={0.4} y={12} duration={0.8} className="mt-6 md:mt-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between md:gap-6">
            <p className="t-caption text-ink-3">{t.note[locale]}</p>
            <address className="t-mono not-italic text-ink-2 md:shrink-0 md:text-right">
              <span className="whitespace-nowrap">{club.city[locale]} ·</span>{" "}
              <span className="whitespace-nowrap">{club.address[locale]} ·</span>{" "}
              <span className="whitespace-nowrap">{club.coordsLabel}</span>
            </address>
          </div>
        </Reveal>
      </div>
    </Chapter>
  );
}
