"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/i18n/LocaleProvider";
import { groups, type GroupId } from "@/content/schedule";
import { byDay, dayLong, dayShort, groupById, nowInClubTime } from "@/lib/schedule";
import { createLiveStore, useLiveStore } from "@/lib/useLiveValue";
import { Brush } from "@/components/brush/Brush";
import { Register, EASE_OUT } from "@/components/ui/Reveal";

/** The server has no clock for Nalchik, so it marks no day as "today". */
const SERVER_DAY: number | null = null;
const todayStore = createLiveStore<number | null>(() => nowInClubTime().day, (d) => String(d));

/** ISO weekdays, in reading order. The week is printed left to right. */
const WEEK = [1, 2, 3, 4, 5, 6, 7] as const;

const copy = {
  ru: { today: "сегодня", legend: "Группы", hours: "Время" },
  en: { today: "today", legend: "Groups", hours: "Time" },
};

/**
 * The weekly timetable as a printed table.
 *
 * MOTION. The week is the largest artefact on the site, and it used to arrive
 * as one 24px fade-up: seven day columns, seventeen sessions and every rule in
 * the table appearing together in a single block, with no internal order at
 * all. It is a press pulling seven forms now — <Register>, the verb for a row
 * of counted things coming into register, staggering the seven columns left to
 * right along the baseline they share. The legend above it registers the same
 * way, and today's brush tick is timed to land after the last column, so the
 * chapter's one red mark is the last thing that happens rather than the first.
 *
 * That is also why the table's ruling moved onto the columns (see the head of
 * `schedule.css`): a rule-coloured ground behind the grid does not animate with
 * the columns in front of it, and would print as a taupe rectangle for the half
 * second before the first one arrived.
 *
 * TODAY. The server renders no "today" mark; after mount the club's current
 * weekday gets a 2px ink rule capping its column, the word «сегодня», and the
 * brush tick — a weight, a word and a drawn mark. It used to be a paper-3 card
 * plus a vermilion label plus the tick, and red on this page belongs to the
 * brush alone. Below 768 the tick is drawn beside the word instead of under a
 * column head, because the mobile week has no column heads; it used to not be
 * drawn at all, which left the chapter with no brush mark on a phone.
 *
 * Hovering or focusing a group in the legend highlights that group's cells
 * (shared `data-group`).
 *
 * Geometry lives in `src/styles/sections/schedule.css`, which is imported by
 * `Schedule` — the only component that renders this one. Colour and transition
 * for `.timetable__cell`, `.legend__btn` and `.legend__dot` live in
 * `globals.css`; neither file sets the other's properties.
 */
export function Timetable({ className, highlight, onHighlight }: { className?: string; highlight?: GroupId | null; onHighlight?: (g: GroupId | null) => void }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const days = byDay();
  /* the club's weekday exists only on the client; the server prints no tick */
  const today = useLiveStore(todayStore, SERVER_DAY);
  const [openedDay, setOpenedDay] = useState<number | null>(null);
  const openDay = openedDay ?? today;
  const setOpenDay = setOpenedDay;
  const [localHi, setLocalHi] = useState<GroupId | null>(null);
  const hi = highlight ?? localHi;
  const setHi = (g: GroupId | null) => { setLocalHi(g); onHighlight?.(g); };
  const baseId = useId();

  return (
    <div className={cn("timetable", className)} data-highlight={hi ?? undefined}>
      {/* legend — the table's key, so it stays inside the trim */}
      <Register
        className="timetable__legend"
        role="group"
        aria-label={t.legend}
        stagger={0.05}
        duration={0.6}
        x={-8}
      >
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={cn("legend__btn t-mono", hi === g.id && "legend__btn--on")}
            aria-pressed={hi === g.id}
            onMouseEnter={() => setHi(g.id)}
            onMouseLeave={() => setHi(null)}
            onFocus={() => setHi(g.id)}
            onBlur={() => setHi(null)}
            onClick={() => setHi(hi === g.id ? null : g.id)}
          >
            <span className="legend__dot" aria-hidden="true" data-group={g.id} />
            {g.name[locale]} · {g.ages[locale]}
          </button>
        ))}
      </Register>

      {/*
        desktop: the week in seven columns, trimmed to the paper edge from
        1280. `amount` holds the stagger back until a fifth of the table is in
        front of the reader — the whole run is 7 × 70ms and would otherwise be
        over before the first column cleared the fold.
      */}
      <Register
        className="timetable__week"
        itemClassName="timetable__colwrap"
        delay={0.08}
        stagger={0.07}
        duration={0.7}
        x={-16}
        amount={0.2}
      >
        {WEEK.map((d) => {
          const isToday = today === d;
          return (
            <div
              key={d}
              className={cn("timetable__col", isToday && "timetable__col--now")}
              aria-current={isToday ? "date" : undefined}
            >
              <div className="timetable__day">
                <span className="timetable__dayname">{dayShort(d, locale)}</span>
                {isToday && (
                  <span className="t-mono timetable__now">
                    {t.today}
                    {/*
                      `view`, not `load`: on `load` the mark was drawn the
                      moment the client learned the weekday — which, for a
                      chapter eight screens down the sheet, meant it had
                      already been drawn by the time anyone arrived. The delay
                      puts it after the seventh column lands.
                    */}
                    <Brush kind="tick" className="timetable__tick text-shu" delay={0.65} />
                  </span>
                )}
              </div>
              <ul className="timetable__list">
                {days.get(d)!.map((s) => {
                  const g = groupById(s.group);
                  return (
                    <li
                      key={`${d}-${s.time}-${s.group}`}
                      data-group={s.group}
                      className={cn("timetable__cell", hi && hi !== s.group && "opacity-30", hi === s.group && "timetable__cell--hi")}
                    >
                      <span className="t-caption block">{s.time}</span>
                      <span className="timetable__name">{g.name[locale]}</span>
                      <span className="t-mono timetable__ages">{g.ages[locale]}</span>
                    </li>
                  );
                })}
                {days.get(d)!.length === 0 && <li className="t-caption timetable__empty">—</li>}
              </ul>
            </div>
          );
        })}
      </Register>

      {/* mobile: the week as a printed agenda — every day shows its own times
          on its row, and opening one names the groups behind those times */}
      <div className="timetable__days">
        {WEEK.map((d) => {
          const list = days.get(d)!;
          const isToday = today === d;
          const open = openDay === d;
          const btnId = `${baseId}-d${d}`;
          const panelId = `${baseId}-p${d}`;
          return (
            <div key={d} className={cn("timetable__day-row", isToday && "timetable__day-row--now")}>
              <button
                id={btnId}
                type="button"
                className="timetable__day-btn"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenDay(open ? null : d)}
              >
                <span className="timetable__day-name">{dayLong(d, locale)}</span>
                <span className="timetable__day-state">
                  {isToday && (
                    <span className="t-mono timetable__now">
                      {t.today}
                      <Brush kind="tick" className="timetable__tick-inline text-shu" delay={0.25} />
                    </span>
                  )}
                  {/* open / closed as two hairlines, one of which turns */}
                  <span className="timetable__mark" aria-hidden="true">
                    <motion.span
                      className="timetable__mark-bar"
                      animate={{ rotate: open ? 0 : 90 }}
                      transition={{ duration: 0.4, ease: EASE_OUT }}
                    />
                    <span className="timetable__mark-bar" />
                  </span>
                </span>
                <span className="t-caption timetable__day-times">
                  {/* the times are read out as part of the row's own name, so
                      they are prefixed the way the column would be headed */}
                  <span className="sr-only">{t.hours}: </span>
                  {list.length > 0 ? list.map((s) => s.time).join(" · ") : "—"}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className="timetable__panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: { duration: 0.45, ease: EASE_OUT }, opacity: { duration: 0.25 } }}
                  >
                    <ul className="timetable__sessions">
                      {list.map((s) => {
                        const g = groupById(s.group);
                        return (
                          <li
                            key={`${d}-${s.time}-${s.group}`}
                            data-group={s.group}
                            className={cn("timetable__session", hi && hi !== s.group && "opacity-30")}
                          >
                            <span className="t-caption timetable__session-time">{s.time}</span>
                            <span className="timetable__session-name">{g.name[locale]}</span>
                            <span className="t-mono timetable__session-ages">{g.ages[locale]}</span>
                          </li>
                        );
                      })}
                      {list.length === 0 && <li className="t-caption timetable__session timetable__session--empty">—</li>}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
