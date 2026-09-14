"use client";

import "@/styles/sections/schedule.css";

import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, schedule } from "@/content/home";
import { club } from "@/content/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { Button } from "@/components/ui/Button";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal } from "@/components/ui/Reveal";
import { Timetable } from "@/components/sections/Timetable";

const chapter = chapters.find((c) => c.id === "schedule")!;
const HEADING_ID = "schedule-title";

/**
 * Chapter 八 / 08 — «Расписание».
 *
 * The chapter opens as a band across the sheet — the title «Неделя» on the
 * left and the one action hung on the right trim, standing on a common
 * bottom edge — and then prints the week as a table. From 1280 up that table
 * is trimmed to the true paper edge rather than framed inside the margin:
 * seven weekdays are seven columns, so the table is the one thing in the
 * manual that spends every pixel of a wide screen on its subject. The table is
 * the chapter's last word — nothing is set under it.
 *
 * MOTION. The title rises line by line, the action fades up after it, and the
 * week — the largest artefact on the site — is pulled through the press column
 * by column, left to right, with the chapter's single brush mark ticked under
 * today's weekday after the seventh column lands. The verbs are the shared
 * ones; nothing here needed a new primitive.
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
        {/* ---- opener: the title and the one action, on the page grid ---- */}
        <div className="schedule__head">
          <div className="schedule__title-field">
            <h2 id={HEADING_ID} className="t-chapter">
              <LineReveal as="span" className="block" lines={[title]} delay={0.1} />
            </h2>
          </div>

          {/*
            One action, not a pair. The Telegram button is the only thing the
            reader can do from this chapter; the map lives in the footer, where
            the rest of the club's printed references are.
          */}
          <Reveal delay={0.45} y={20} className="schedule__actions">
            <Button variant="ink" size="lg" href={club.telegram} plain className="schedule__cta">
              {t.telegram[locale]}
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
      </div>
    </Chapter>
  );
}
