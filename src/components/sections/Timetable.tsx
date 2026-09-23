"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { schedule } from "@/content/home";
import { groups, type GroupId } from "@/content/schedule";
import { byDay, byGroup, dayLong, dayShort, groupById, nowInClubTime } from "@/lib/schedule";
import { createLiveStore, useLiveStore } from "@/lib/useLiveValue";
import { Brush } from "@/components/brush/Brush";
import { Register } from "@/components/ui/Reveal";

/** The server has no clock for Nalchik, so it marks no day as "today". */
const SERVER_DAY: number | null = null;
const todayStore = createLiveStore<number | null>(() => nowInClubTime().day, (d) => String(d));

/**
 * The club's week, in reading order — the days this table prints, left to
 * right. The club trains Monday to Friday, so the weekend is not printed at
 * all rather than printed empty: `.timetable__empty`'s middle dot states a
 * rest day INSIDE the week the table covers, and Saturday and Sunday are
 * outside it. The desktop columns and the phone's weekday slots both iterate
 * this list and print nothing outside it, so a session added on day 6 or 7
 * would need it widened, and the five-track grids in `schedule.css` with it,
 * before it printed anywhere.
 *
 * `Session["day"]` keeps the full ISO range on purpose: `nowInClubTime()`
 * reports the real weekday, and on a weekend no printed column is today.
 */
const WEEK = [1, 2, 3, 4, 5] as const;

/*
  Today's two ticks, their impressions pinned. A <Brush> seeds its hand from
  React's `useId`, and a mark that mounts only on the client (both of these
  do: the server knows no today) takes the next id off a page-wide counter.
  Its impression therefore re-rolled whenever anything else on the page
  mounted one id more or fewer, which is how rebuilding the phone's rows
  nudged the desktop column's tick by a pixel. These are the ids the two
  marks printed with before that, so neither mark moved.
*/
const TICK_SEED = { column: "_r_4_", phone: "_r_5_" } as const;

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
 * brush alone. Below 768 there is no column to cap, so today's weekday is
 * struck (bone on ink) in every row that trains on it, and the word and the
 * tick stand over that column of struck days on the table's top rule.
 *
 * THE PHONE. Below 768 the week is printed on its side: the four groups are
 * the rows, and each prints its time and the weekdays it trains, the days in
 * five fixed slots so a weekday stands on one vertical down the page. It used
 * to be a scrolling band of groups over an accordion of days whose rows
 * printed bare times, so a parent tapped a day to learn which group was
 * behind 18:00 and read every time twice. The question on a phone is "when
 * does my child's group train", and this answers it with nothing to tap. The
 * band is not printed there: the groups are the rows now, so a key naming
 * them and a filter striking one of them have nothing left to do.
 *
 * THE BAND. The key used to be five mono labels on a flex row with a 2rem
 * margin under it — a strip of UI floating over a printed table, and three
 * ragged rows of small caps on a phone. It is the table's own head now: four
 * ruled cells, bled with the week from 1280, carrying the group in the display
 * face and its age band. Its bottom rule IS the table's top rule — the week's columns
 * stopped drawing their own, or the two would stack as a 2px double. The
 * phone's rows draw theirs, because the band is not printed there.
 *
 * Choosing a group strikes that group's sessions: the ground inverts, ink for
 * paper, the same mark the band cell wears. Everything else drops one step down
 * the ink ramp and loses its hairlines. Recession is by losing RULES, not
 * legibility — `opacity: .3` used to composite to about 2.1:1, which is not a
 * de-emphasis but an erasure with the contrast of a smudge. Nothing here is
 * announced by hue.
 *
 * Colour and transition for `.timetable__cell`, the phone's rows and every
 * `.legend__*` class live in `globals.css`;
 * geometry and type size live in `schedule.css`. Where one line needs both —
 * a hairline is a `border`, which carries a width and a colour — the geometry
 * file writes the border and reads its colour from a `--tt-*` token the colour
 * file declares, so each declaration still has exactly one home.
 */
export function Timetable({ className, highlight, onHighlight }: { className?: string; highlight?: GroupId | null; onHighlight?: (g: GroupId | null) => void }) {
  const t = schedule.table;
  const days = byDay();
  const rows = byGroup(WEEK);
  /* the club's weekday exists only on the client; the server prints no tick */
  const today = useLiveStore(todayStore, SERVER_DAY);
  /* today's place in the printed week, 1-based, or 0 on a weekend */
  const todaySlot = WEEK.findIndex((d) => d === today) + 1;

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
                    <Brush kind="tick" seed={TICK_SEED.column} className="timetable__tick text-shu" delay={0.65} />
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

      {/*
        phone: the week on its side. Below 768 neither the band nor the five
        columns print; the four groups are the rows instead, and each prints
        when it trains. Nothing here is interactive, so the band's filter
        state is simply not read. The list takes its name from the band's
        caption, which is hidden here but still names what the rows are.

        Every line is the same grid: the time, then five weekday slots, one
        per day of WEEK and filled only where the group trains. A weekday
        therefore stands on the same vertical in every row, and a day off is
        blank paper. The two-letter weekdays are hidden from assistive tech,
        which hears the full names instead.

        Today is struck in the rows, bone on ink, wherever a group trains on
        it; those struck days are the column the desktop caps. The word and the
        tick stand over them on the list's top rule. The mark is
        client-only and absolutely placed in the air above the rule, so the
        server's render, which knows no weekday, is the same table at the
        same height. It is set inside the FIRST row because that row's box
        carries the top rule, so the mark arrives with the rule it stands on
        rather than on a reveal of its own that could land first, over bare
        paper. The tick is timed to land after the last row.
      */}
      <div className="timetable__groups">
        <Register
          itemClassName="timetable__groupwrap"
          role="list"
          aria-labelledby={bandId}
          stagger={0.06}
          duration={0.6}
          x={-10}
        >
          {rows.map(({ group: g, lines }, i) => (
            <div key={g.id} role="listitem" className="timetable__group">
              {i === 0 && todaySlot > 0 && (
                <div className="timetable__today" aria-hidden="true">
                  {/* track 1 of the shared grid is the time; the slots follow */}
                  <span
                    className={cn(
                      "t-mono timetable__now timetable__today-mark",
                      todaySlot === WEEK.length && "timetable__today-mark--end",
                    )}
                    style={{ gridColumn: todaySlot + 1 }}
                  >
                    {t.today}
                    <Brush kind="tick" seed={TICK_SEED.phone} className="timetable__tick-inline text-shu" delay={0.8} />
                  </span>
                </div>
              )}
              <p className="timetable__group-head">
                <span className="timetable__group-name">{g.name}</span>
                <span className="t-caption timetable__group-ages">{g.ages}</span>
              </p>
              {lines.map(({ time, days: on }) => (
                <p key={time} className="timetable__line">
                  <span className="t-caption timetable__line-time">{time}</span>
                  {WEEK.map((d) => (
                    <span
                      key={d}
                      aria-hidden="true"
                      className={cn("t-caption timetable__slot", today === d && on.includes(d) && "timetable__slot--now")}
                    >
                      {on.includes(d) ? dayShort(d) : null}
                    </span>
                  ))}
                  <span className="sr-only">
                    {WEEK.filter((d) => on.includes(d))
                      .map((d) => (today === d ? `${dayLong(d)} (${t.today})` : dayLong(d)))
                      .join(", ")}
                  </span>
                </p>
              ))}
            </div>
          ))}
        </Register>
      </div>
    </div>
  );
}
