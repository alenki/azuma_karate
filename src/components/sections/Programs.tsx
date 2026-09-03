"use client";

import "@/styles/sections/programs.css";

import { useCallback, useState, type CSSProperties, type PointerEvent } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";
import { chapters, programs } from "@/content/home";
import { club, groups, sessions, type Group, type GroupId } from "@/content/schedule";
import type { MediaKey } from "@/content/media";
import { dayShort } from "@/lib/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { Curtain } from "@/components/ui/Curtain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Photo } from "@/components/ui/Photo";
import { RegisterMark } from "@/components/ui/RegisterMark";
import { Reveal, Settle, EASE_OUT_EXPO } from "@/components/ui/Reveal";

const VIEWPORT = { once: true, margin: "-12% 0px -8% 0px" } as const;

/** Units the open band «17+» occupies: one for 17, two for «и дальше». */
const OPEN_UNITS = 3;

/**
 * One plate per band that has something a parent actually asks about —
 * «первые аттестации» and «кумитэ в защите». Bands 01 and 04 carry none:
 * the empty paper there is the years, made visible.
 * PLACEHOLDER photography. These two are the first plates to replace with
 * the club's own, consented images — see `public/media/placeholders/`.
 */
const PLATES: Partial<Record<GroupId, MediaKey>> = {
  /* a portrait source for a portrait box: 1067x1600 crops 0% here, where the
     1600x1200 `kidsYellowBelt` lost 41% of its width to the cover crop — and a
     different frame from band 03's, which `kidsSparringGear` is not. */
  "kids-7-11": "kidKicksPad",
  /* NOT `kidsKumite` — chapter 二 prints that frame near-full-bleed to answer
     «полный контакт». `kidsPadsDrill` is the tighter crop of a different
     protected bout; at 1390x1600 it crops sideways in this box and so keeps
     the action large, where the looser `kidsSparringGear` crop of the same
     frame would leave the subject small. */
  "teens-12-16": "kidsPadsDrill",
};

/**
 * One entry per tier of `--plate-w` in `programs.css`, widest first (the
 * browser takes the first match). The declared width is a little over the
 * column so the plate is never upscaled: the 14rem and 16.5rem columns ask
 * for 15rem and 17rem.
 *
 * The last two entries are the PHONE geometry, which is not `--plate-w` at
 * all: below 768 the plate drops into flow at `min(66%, 15rem)` of the band,
 * so it is capped at 15rem from ~458px up and is two thirds of a band column
 * — about 66vw — under that. The old `100vw` asked for a source three times
 * the box on the one screen that pays for it by the megabyte.
 */
const PLATE_SIZES =
  "(min-width: 2000px) 17rem, (min-width: 1600px) 15rem, (min-width: 1280px) 12rem, (min-width: 768px) 10rem, (min-width: 460px) 15rem, 66vw";

/**
 * The rail's plate, matching the `--rail-w` tiers less its left padding —
 * except above 1600, where the rail is a fraction of the sheet rather than a
 * rem: it runs 224 → 287px through the 1600 tier and 276 → 370px through the
 * 2000 one, so those two entries are the top of each range rounded up.
 */
const RAIL_PLATE_SIZES =
  "(min-width: 2000px) 24rem, (min-width: 1600px) 18rem, (min-width: 1024px) 14rem, (min-width: 640px) 15rem, 100vw";

/**
 * Each group link carries `data-group`, matching the attribute the timetable
 * uses for its own legend. It is a hook, NOT a working feature: `Schedule.tsx`
 * renders `<Timetable />` with no props, so the `highlight` / `onHighlight`
 * pair that `Timetable` accepts is never wired up. Linking the two is a
 * one-line change in `Schedule.tsx` when chapter 八 is built — until then, do
 * not describe this as connected.
 */

type AgeSpan = NonNullable<Group["ageSpan"]>;
type BandGroup = Group & { ageSpan: AgeSpan };

/** The groups that sit on the age scale, in order, and those that do not. */
const AGE_BANDS = groups.filter((g): g is BandGroup => g.ageSpan !== null);
/**
 * Groups with no age band at all. The first is drawn as the rail crossing
 * every band; any further one is stated as a full-width row after the chart,
 * so a second age-less group can never be silently dropped.
 */
const RAILS = groups.filter((g) => g.ageSpan === null);

/**
 * Development-only invariant. The chart's whole argument is that the bands
 * tile the age scale exactly — so if the club ever edits `schedule.ts` into a
 * gap, an overlap or an out-of-order band, the drawing would still show a
 * perfect tiling and quietly lie about which group a child belongs to. Warn
 * loudly instead; the layout itself degrades safely either way.
 */
if (process.env.NODE_ENV !== "production") {
  let previous: number | null = null;
  for (const g of AGE_BANDS) {
    const { from, to } = g.ageSpan;
    if (previous !== null && from !== previous + 1) {
      const what = from > previous + 1 ? "leaves a gap after" : "overlaps or reorders";
      console.warn(
        `[chapter 三] «${g.name.ru}» ${what} age ${previous}. The chart draws the bands as an exact tiling of the age scale, so ageSpan values in content/schedule.ts must be contiguous and in ascending order.`,
      );
    }
    if (to !== null && to < from) console.warn(`[chapter 三] «${g.name.ru}» has ageSpan.to before ageSpan.from.`);
    previous = to;
    if (to === null) break; /* the open band ends the scale */
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

/** How many years of the scale a band covers. The open band never closes. */
function unitsOf(span: AgeSpan) {
  return span.to === null ? OPEN_UNITS : span.to - span.from + 1;
}

/** One entry per unit; `null` is a ruled year that carries no label. */
function yearsOf(span: AgeSpan): (number | null)[] {
  if (span.to === null) return [span.from, ...Array<null>(OPEN_UNITS - 1).fill(null)];
  const out: (number | null)[] = [];
  for (let y = span.from; y <= span.to; y++) out.push(y);
  return out;
}

/** Russian takes three plural forms; English takes two. */
function plural(n: number, locale: Locale, one: string, few: string, many: string) {
  if (locale === "en") return n === 1 ? one : many;
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
}

/** «8 лет», «4 года», «21 год» — the readout is set in Russian, not in digits. */
function ageLabel(year: number, locale: Locale) {
  if (locale === "en") return `age ${year}`;
  const d = year % 10;
  const dd = year % 100;
  if (d === 1 && dd !== 11) return `${year} год`;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return `${year} года`;
  return `${year} лет`;
}

/**
 * Days of one time slot, set the manual's way: runs of three or more
 * consecutive days collapse to a range («Пн–Пт»), the rest are dotted
 * («Пн · Ср · Пт»).
 */
function formatDays(days: number[], locale: Locale) {
  const parts: string[] = [];
  let i = 0;
  while (i < days.length) {
    let j = i;
    while (j + 1 < days.length && days[j + 1] === days[j] + 1) j++;
    if (j - i >= 2) parts.push(`${dayShort(days[i], locale)}–${dayShort(days[j], locale)}`);
    else for (let k = i; k <= j; k++) parts.push(dayShort(days[k], locale));
    i = j + 1;
  }
  return parts.join(" · ");
}

/** «Пн · Ср · Пт · 17:00» — one line per distinct start time, earliest weekday first. */
function whenLines(group: GroupId, locale: Locale): string[] {
  const byTime = new Map<string, number[]>();
  for (const s of sessions) {
    if (s.group !== group) continue;
    const days = byTime.get(s.time) ?? [];
    if (!days.includes(s.day)) days.push(s.day);
    byTime.set(s.time, days);
  }
  return [...byTime.entries()]
    .map(([time, days]) => ({ time, days: [...days].sort((a, b) => a - b) }))
    .sort((a, b) => a.days[0] - b.days[0])
    .map(({ time, days }) => `${formatDays(days, locale)} · ${time}`);
}

/** A hairline ruled across the page before the type arrives. */
function HairRule({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className={cn("rule origin-left", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, delay, ease: EASE_OUT_EXPO }}
    />
  );
}

/** One rule of the sheet, run out from the axis. */
function Rule({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className={cn("band__rule", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1, delay, ease: EASE_OUT_EXPO }}
    />
  );
}

/** A register mark at the end of a rule — the sheet locking into register. */
function Mark({ x, y, origin }: { x: "axis" | "rail"; y: "top" | "bottom"; origin?: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      className={cn("band__mark", origin && "band__mark--origin")}
      data-x={x}
      data-y={y}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.45, delay: 0.55, ease: EASE_OUT_EXPO }}
    >
      <RegisterMark className="h-full w-full" />
    </motion.span>
  );
}

/**
 * Chapter 三 · Группы — the age chart.
 *
 * The chapter's subject is age, so the layout is an age axis and nothing
 * else. «С 4 лет» is circled by the brush, and the scale below begins at the
 * same 4: four bands whose heights are their age spans tile 4 → 17+ with no
 * gap and no overlap, so every age visibly has exactly one home. The park
 * mornings have no age at all, so they are drawn as the rail crossing all
 * four bands rather than as a fifth band among them.
 *
 * The axis is decorative: every age it shows is also set as real text inside
 * its band, so it is hidden from assistive technology and the figure carries
 * one written description instead. Hovering a year is a pointer-only
 * convenience that hides nothing.
 */
export function Programs() {
  const { locale } = useLocale();
  const chapter = chapters.find((c) => c.id === "programs")!;
  const t = programs;
  const titleText = `${t.title1[locale]} ${t.titleNumber} ${t.title2[locale]}`;

  const [active, setActive] = useState<{ group: GroupId | null; year: number | null }>({
    group: null,
    year: null,
  });
  const clear = useCallback(() => setActive({ group: null, year: null }), []);
  const holdGroup = useCallback((group: GroupId) => setActive({ group, year: null }), []);
  const holdYear = useCallback(
    (group: GroupId, year: number) => (e: PointerEvent) => {
      /* touch taps must not leave a band stuck in its hover state */
      if (e.pointerType !== "mouse") return;
      setActive({ group, year });
    },
    [],
  );

  const activeGroup = active.group ? groups.find((g) => g.id === active.group) : undefined;
  /* «5 групп · 4 → 17+», read off `schedule.ts` rather than restated in copy */
  const last = AGE_BANDS[AGE_BANDS.length - 1].ageSpan;
  const summary = `${groups.length} ${plural(groups.length, locale, t.chart.groupsOne[locale], t.chart.groupsFew[locale], t.chart.groupsMany[locale])} · ${AGE_BANDS[0].ageSpan.from} → ${last.to === null ? `${last.from}+` : last.to}`;
  const readout =
    active.year !== null && activeGroup
      ? `${ageLabel(active.year, locale)} · ${activeGroup.name[locale]}`
      : activeGroup
        ? `${activeGroup.name[locale]} · ${activeGroup.ages[locale]}`
        : summary;

  return (
    <Chapter
      id="programs"
      index={3}
      title={chapter.title[locale]}
      labelledBy="programs-title"
      className="programs"
    >
      <div className="wrap pt-[var(--pad-top)] pb-[var(--pad-bottom)]">
        {/* ---- running head ---- */}
        <HairRule />
        <Reveal delay={0.15} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="san" className="chapter__kanji" label={null} /> 03
          </span>
        </Reveal>

        {/* ---- the statement, and the lead that sends you to the figure ----
            The twelve-column field and the two blocks' places on it are set
            in `programs.css` (`.programs__head`), not here: the gap is the
            sheet's `--col-gap`, and the wide tiers move both blocks. */}
        <div className="programs__head mt-10 md:mt-14">
          <h2 id="programs-title" className="programs__title t-chapter">
            <span className="sr-only">{titleText}</span>
            <LineReveal
              as="span"
              className="block"
              bleed={0.42}
              label={null}
              lines={[
                <span key="statement">
                  {t.title1[locale]}{" "}
                  <span className="relative inline-block mx-[0.5em]">
                    {t.titleNumber}
                    {/*
                      The chapter's one brush mark, and the chart's origin. The
                      ring is drawn AROUND the digit, so it must clear the
                      letters either side of it: at 1.8em over a 0.58em digit
                      inset by 0.26em the ink ran through the «С» and touched
                      «лет», and the annotation read as a collision. 1.5em on a
                      0.5em inset leaves ~0.4em of paper on both sides.
                    */}
                    <Brush
                      kind="circle"
                      className="pointer-events-none absolute left-1/2 top-[46%] w-[1.5em] h-auto -translate-x-1/2 -translate-y-1/2 text-shu"
                      delay={0.8}
                    />
                  </span>{" "}
                  {t.title2[locale]}
                </span>,
              ]}
            />
          </h2>
          <Reveal delay={0.3} className="programs__lead mt-8 md:mt-0 md:pt-3">
            <p className="t-lead text-ink-2 max-w-[38ch]">{t.lead[locale]}</p>
          </Reveal>
        </div>

        {/* ---- Фиг. 03 — the age chart ---- */}
        <figure className="chart mt-[var(--rhythm)]" onPointerLeave={clear}>
          {/* first child, so the shape of the figure is explained before its
              contents are read rather than after all of them */}
          <figcaption className="sr-only">{t.chart.description[locale]}</figcaption>
          {/* the head row is itself the grid that aligns «Лет» over the axis,
              so it animates in place — a wrapper would break the columns */}
          <motion.div
            className="chart__head t-mono"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <span className="chart__axis-label text-ink-2" aria-hidden="true">
              {t.chart.axis[locale]}
            </span>
            <p className="chart__caption">
              <span className="text-ink-2">{t.chart.caption[locale]}</span>
              <span className="chart__readout text-ink" aria-hidden="true">
                {readout}
              </span>
            </p>
          </motion.div>

          <div
            className="chart__body"
            style={{ "--band-rows": AGE_BANDS.length, "--all-rows": AGE_BANDS.length + RAILS.length } as CSSProperties}
          >
            {/* Zone A — the ruler. Decorative: every age below is also set as
                text inside its own band. */}
            {AGE_BANDS.map((g, i) => {
              const units = unitsOf(g.ageSpan);
              const years = yearsOf(g.ageSpan);
              const isOpen = g.ageSpan.to === null;
              return (
                <div
                  key={`axis-${g.id}`}
                  aria-hidden="true"
                  className={cn("axis-block", isOpen && "axis-block--open")}
                  style={{ "--row": i + 1, "--span": units } as CSSProperties}
                >
                  <motion.span
                    className="axis-block__line"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
                  />
                  {years.map((year, k) => (
                    <motion.span
                      key={k}
                      className={cn("axis-year t-mono", year !== null && active.year === year && "axis-year--on")}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={VIEWPORT}
                      transition={{ duration: 0.35, delay: 0.2 + k * 0.04, ease: EASE_OUT_EXPO }}
                      onPointerEnter={year === null ? undefined : holdYear(g.id, year)}
                    >
                      {year === null ? "" : isOpen ? `${year}+` : year}
                    </motion.span>
                  ))}
                  {isOpen && <span className="chart__arrow" />}
                </div>
              );
            })}

            {/* Zones B and C — the bands, and the rail that crosses them */}
            <ol role="list" className="chart__bands">
              {AGE_BANDS.map((g, i) => {
                const units = unitsOf(g.ageSpan);
                const years = yearsOf(g.ageSpan);
                const isOpen = g.ageSpan.to === null;
                const plate = PLATES[g.id];
                const readingIndex = active.year === null ? -1 : years.indexOf(active.year);
                return (
                  <li
                    key={g.id}
                    className={cn("band", active.group === g.id && "band--on")}
                    style={{ "--row": i + 1, "--span": units } as CSSProperties}
                    onPointerEnter={() => holdGroup(g.id)}
                  >
                    <Rule />
                    <Mark x="axis" y="top" origin={i === 0} />
                    <Mark x="rail" y="top" />
                    {isOpen && (
                      <>
                        <Rule className="band__rule--bottom band__rule--open" delay={0.1} />
                        <Mark x="axis" y="bottom" />
                        <Mark x="rail" y="bottom" />
                      </>
                    )}

                    {readingIndex >= 0 && (
                      <motion.span
                        aria-hidden="true"
                        className="band__reading"
                        style={{ "--i": readingIndex } as CSSProperties}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                      />
                    )}

                    {/* the Reveal's own div is the band's content box, and
                        above 1600 it is the grid the band's four columns
                        stand in — see «the band as a table row». The rail
                        below is deliberately NOT given this class. */}
                    <Reveal delay={0.18} y={14} duration={0.75} className="band__content">
                      <div className="band__row">
                        <span className="band__index t-mono" aria-hidden="true">
                          {pad(i + 1)}
                        </span>
                        <h3 className="band__name">
                          <a
                            href="#schedule"
                            data-group={g.id}
                            className="band__link"
                            onFocus={() => holdGroup(g.id)}
                            onBlur={clear}
                          >
                            <span className="band__title t-h3 font-display">{g.name[locale]}</span>{" "}
                            <span className="band__ages t-mono">{g.ages[locale]}</span>
                            <span className="band__go" aria-hidden="true">
                              →
                            </span>
                            <span className="sr-only"> — {t.more[locale]}</span>
                          </a>
                        </h3>
                        <span className="band__when t-caption text-ink">
                          {whenLines(g.id, locale).map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </span>
                      </div>
                      <p className="band__note">{g.note[locale]}</p>
                    </Reveal>

                    {plate && (
                      <Curtain className="band__plate" duration={1} delay={0.3}>
                        <Photo slot={plate} sizes={PLATE_SIZES} />
                      </Curtain>
                    )}
                  </li>
                );
              })}

              {RAILS.map((g, i) => (
                <li
                  key={g.id}
                  /* the first age-less group is the rail crossing every band;
                     any further one is stated as a row after the chart */
                  className={cn("band", i === 0 ? "band--rail" : "band--extra", active.group === g.id && "band--on")}
                  style={{ "--row": AGE_BANDS.length + 1 + i } as CSSProperties}
                  onPointerEnter={() => holdGroup(g.id)}
                >
                  <Rule />
                  {i === 0 && <Rule className="band__rule--second" delay={0.08} />}
                  <Mark x="axis" y="top" />
                  <Mark x="rail" y="top" />

                  <Reveal delay={0.18} y={14} duration={0.75}>
                    <div className="rail__body">
                      <div>
                        <div className="band__row">
                          <span className="band__index t-mono" aria-hidden="true">
                            {pad(AGE_BANDS.length + 1 + i)}
                          </span>
                          <h3 className="band__name">
                            <a
                              href="#schedule"
                              data-group={g.id}
                              className="band__link"
                              onFocus={() => holdGroup(g.id)}
                              onBlur={clear}
                            >
                              <span className="band__title t-h3 font-display">{g.name[locale]}</span>{" "}
                              <span className="band__ages t-mono">{g.ages[locale]}</span>
                              <span className="band__go" aria-hidden="true">
                                →
                              </span>
                              <span className="sr-only"> — {t.more[locale]}</span>
                            </a>
                          </h3>
                          <span className="band__when t-caption text-ink">
                            {whenLines(g.id, locale).map((line) => (
                              <span key={line} className="block">
                                {line}
                              </span>
                            ))}
                          </span>
                        </div>
                        <p className="band__note">{g.note[locale]}</p>
                      </div>

                      {/* the rail's plate hangs on the foot of the column: the
                          group that has no age is the one that trains outdoors */}
                      {i === 0 && (
                        <figure className="rail__figure">
                          {/* `amount={0}`: Curtain's threshold is a fraction of
                              the PLATE, and this plate is 650px tall on a wide
                              sheet, at the foot of a column as tall as the whole
                              chart. A third of it clears the reader's margin long
                              after the group it illustrates has been read, so it
                              opens when it arrives instead — the case Curtain's
                              own note on `amount` says to pass 0 for. */}
                          <Curtain className="rail__plate" duration={1.1} delay={0.3} amount={0}>
                            <Photo slot="parkPath" sizes={RAIL_PLATE_SIZES} />
                          </Curtain>
                          <figcaption className="t-caption mt-3 text-ink-2">
                            {/* a caption is PRINTED, not flown in — and it is
                                held until the curtain has crossed the plate, so
                                it is never a caption under blank paper */}
                            <Settle delay={1.2} duration={0.6}>
                              {t.plateCaption[locale]}
                            </Settle>
                          </figcaption>
                        </figure>
                      )}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

        </figure>

        {/* ---- the offer, the checklist, and the two ways out of the chapter ---- */}
        <div className="mt-[var(--rhythm)]">
          <HairRule />
          <Reveal delay={0.1} y={12} duration={0.8}>
            <p className="programs__trial t-statement">{t.trial[locale]}</p>
          </Reveal>
          <HairRule delay={0.15} />

          <Reveal delay={0.15} y={12} duration={0.8} className="mt-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h3 className="t-mono text-ink-2">{t.checklistTitle[locale]}</h3>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-1">
              <a href="#schedule" className="exit-link t-mono">
                <span className="exit-link__label">{t.more[locale]}</span>
                <span className="exit-link__arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <a href={club.telegram} rel="noopener" className="exit-link t-mono">
                <span className="exit-link__label">{t.telegram[locale]}</span>
                <span className="exit-link__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </Reveal>

          <ol className="notes__items mt-2">
            {t.checklist.map((item, i) => (
              /* the item is the two-column grid, so it animates in place */
              <motion.li
                key={i}
                className="notes__item"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.7, delay: 0.05 + i * 0.06, ease: EASE_OUT_EXPO }}
              >
                <span className="notes__index t-mono" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span className="notes__text">{item[locale]}</span>
              </motion.li>
            ))}
          </ol>
          {/* the sheet is closed, the way every other rule on it is ruled */}
          <HairRule delay={0.2} />
        </div>
      </div>
    </Chapter>
  );
}
