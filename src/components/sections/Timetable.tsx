"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { schedule } from "@/content/home";
import { groups, type GroupId } from "@/content/schedule";
import { byDay, dayLong, dayShort, groupById, nowInClubTime } from "@/lib/schedule";
import { createLiveStore, useLiveStore } from "@/lib/useLiveValue";
import { Brush } from "@/components/brush/Brush";
import { Register, EASE_OUT } from "@/components/ui/Reveal";

/** The server has no clock for Nalchik, so it marks no day as "today". */
const SERVER_DAY: number | null = null;
const todayStore = createLiveStore<number | null>(() => nowInClubTime().day, (d) => String(d));

/**
 * The club's week, in reading order — the days this table prints, left to
 * right. The club trains Monday to Friday, so the weekend is not printed at
 * all rather than printed empty: `.timetable__empty`'s em dash states a rest
 * day INSIDE the week the table covers, and Saturday and Sunday are outside
 * it. Both the desktop columns and the mobile agenda iterate this list, and
 * `byDay()` is keyed by ISO weekday, so a session added on day 6 or 7 would
 * need this list widened before it printed anywhere.
 *
 * `Session["day"]` keeps the full ISO range on purpose: `nowInClubTime()`
 * reports the real weekday, and on a weekend no printed column is today.
 */
const WEEK = [1, 2, 3, 4, 5] as const;

/**
 * The weekly timetable as a printed table.
 *
 * MOTION. The week is the largest artefact on the site, and it used to arrive
 * as one 24px fade-up: every day column, every session and every rule in the
 * table appearing together in a single block, with no internal order at all.
 * It is a press pulling five forms now — <Register>, the verb for a row of
 * counted things coming into register, staggering the five columns left to
 * right along the baseline they share. The band above it registers the same
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
 * column head, because the mobile week has no column heads.
 *
 * THE BAND. The key used to be five mono labels on a flex row with a 2rem
 * margin under it — a strip of UI floating over a printed table, and three
 * ragged rows of small caps on a phone. It is the table's own head now: four
 * ruled cells, bled with the week from 1280, carrying the group in the display
 * face, its age band, and the club's own line about the group (`Group.note`, which was written for this file and printed nowhere
 * until now). Its bottom rule IS the table's top rule — the week's columns and
 * the mobile agenda stopped drawing their own, or the two would stack as a 2px
 * double.
 *
 * Choosing a group strikes that group's sessions: the ground inverts, ink for
 * paper, the same mark the band cell wears. Everything else drops one step down
 * the ink ramp and loses its hairlines. Recession is by losing RULES, not
 * legibility — `opacity: .3` used to composite to about 2.1:1, which is not a
 * de-emphasis but an erasure with the contrast of a smudge. Nothing here is
 * announced by hue.
 *
 * Colour and transition for `.timetable__cell`, `.timetable__session`,
 * `.timetable__day-row` and every `.legend__*` class live in `globals.css`;
 * geometry and type size live in `schedule.css`. Where one line needs both —
 * a hairline is a `border`, which carries a width and a colour — the geometry
 * file writes the border and reads its colour from a `--tt-*` token the colour
 * file declares, so each declaration still has exactly one home.
 */
export function Timetable({ className, highlight, onHighlight }: { className?: string; highlight?: GroupId | null; onHighlight?: (g: GroupId | null) => void }) {
  const t = schedule.table;
  const days = byDay();
  /* the club's weekday exists only on the client; the server prints no tick */
  const today = useLiveStore(todayStore, SERVER_DAY);
  const [openedDay, setOpenedDay] = useState<number | null>(null);
  const openDay = openedDay ?? today;
  const setOpenDay = setOpenedDay;

  /*
    TWO states, not one. They used to be a single `localHi`, which made the
    click toggle dead code and `aria-pressed` a lie: `onMouseEnter` had already
    set the highlight by the time `onClick` ran, so `hi === g.id` was always
    true and the toggle could only ever switch it OFF — and `onMouseLeave` then
    cleared whatever the click had done. A pointer user could not pin a group
    at all.

      hovered  the reader is pointing at, or tabbed onto, a cell — transient
      pinned   the reader has chosen a group — it survives the pointer leaving

    The effective mark reads hover first, so a pinned group can still be
    previewed against another one; `highlight` (the controlled prop) wins over
    both.
  */
  const [pinned, setPinned] = useState<GroupId | null>(null);
  const [hovered, setHovered] = useState<GroupId | null>(null);
  const hi = highlight ?? hovered ?? pinned;
  const mark = (g: GroupId | null) => { setHovered(g); onHighlight?.(g ?? pinned); };
  const pin = (g: GroupId) => {
    const next = pinned === g ? null : g;
    setPinned(next);
    /* unpinning while still pointing at the cell keeps the preview: the dot
       empties but `hovered` is untouched */
    onHighlight?.(hovered ?? next);
  };

  const baseId = useId();
  const bandId = `${baseId}-band`;

  return (
    <div className={cn("timetable", className)}>
      {/*
        ---- the register band ----
        The table's key, printed as the table's own head rather than as a line
        of labels floating above it: four ruled cells sharing the week's bleed,
        its hairline grade and its seam. Each cell is still one filter toggle.

        The caption stays inside the trim while the band bleeds past it, and it
        is a VISIBLE label now — `role="group"` is pointed at it with
        `aria-labelledby`, so the name a screen reader announces is the one a
        sighted reader can read. It used to be an `aria-label` hardcoded in this
        file, which meant the four buttons carried no printed label at all.

        `itemClassName` matters: <Register> wraps every child in a box of its
        own, so THAT box is the flex item and the button has to fill it —
        exactly the arrangement `.timetable__colwrap` handles for the week.
      */}
      <p id={bandId} className="t-mono timetable__band-cap">{t.groups}</p>

      <Register
        className="timetable__legend"
        itemClassName="legend__cellwrap"
        role="group"
        aria-labelledby={bandId}
        stagger={0.05}
        duration={0.6}
        x={-10}
      >
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={cn(
              "legend__cell",
              hi === g.id && "legend__cell--on",
              pinned === g.id && "legend__cell--pinned",
            )}
            aria-pressed={pinned === g.id}
            onMouseEnter={() => mark(g.id)}
            onMouseLeave={() => mark(null)}
            onFocus={() => mark(g.id)}
            onBlur={() => mark(null)}
            onClick={() => pin(g.id)}
          >
            {/* the state mark: apparatus, not the entry's name, so it is kept
                out of the button's accessible name. It used to share this line
                with a printed ordinal — the cell carries the group's name and
                its band and nothing else now, so the mark has the line alone
                and is ranged to the cell's outer edge. */}
            <span className="legend__head" aria-hidden="true">
              <span className="legend__dot" />
            </span>
            <span className="legend__name">{g.name}</span>
            <span className="t-mono legend__ages">{g.ages}</span>
          </button>
        ))}
      </Register>

      {/*
        desktop: the week in five columns, trimmed to the paper edge from
        1280. `amount` holds the stagger back until a fifth of the table is in
        front of the reader — the whole run is 5 × 70ms and would otherwise be
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
                <span className="timetable__dayname">{dayShort(d)}</span>
                {isToday && (
                  <span className="t-mono timetable__now">
                    {t.today}
                    {/*
                      `view`, not `load`: on `load` the mark was drawn the
                      moment the client learned the weekday — which, for a
                      chapter eight screens down the sheet, meant it had
                      already been drawn by the time anyone arrived. The delay
                      puts it after the last column lands.
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
                      className={cn(
                        "timetable__cell",
                        hi === s.group && "timetable__cell--hi",
                        hi && hi !== s.group && "timetable__cell--off",
                      )}
                    >
                      <span className="t-caption block">{s.time}</span>
                      <span className="timetable__name">{g.name}</span>
                      <span className="t-mono timetable__ages">{g.ages}</span>
                    </li>
                  );
                })}
                {days.get(d)!.length === 0 && <li className="t-caption timetable__empty">·</li>}
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
          /*
            Every panel is closed by default, so choosing a group used to do
            nothing at all on a phone — the only thing it could have changed
            was already hidden. Quieting the days that hold no session for that
            group answers the question a parent actually has: which days is my
            group in the hall.
          */
          const dayHas = !hi || list.some((s) => s.group === hi);
          return (
            <div
              key={d}
              className={cn(
                "timetable__day-row",
                isToday && "timetable__day-row--now",
                !dayHas && "timetable__day-row--off",
              )}
            >
              <button
                id={btnId}
                type="button"
                className="timetable__day-btn"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenDay(open ? null : d)}
              >
                <span className="timetable__day-name">{dayLong(d)}</span>
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
                  {list.length > 0 ? list.map((s) => s.time).join(" · ") : "·"}
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
                            className={cn(
                              "timetable__session",
                              hi === s.group && "timetable__session--hi",
                              hi && hi !== s.group && "timetable__session--off",
                            )}
                          >
                            <span className="t-caption timetable__session-time">{s.time}</span>
                            <span className="timetable__session-name">{g.name}</span>
                            <span className="t-mono timetable__session-ages">{g.ages}</span>
                          </li>
                        );
                      })}
                      {list.length === 0 && <li className="t-caption timetable__session timetable__session--empty">·</li>}
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
