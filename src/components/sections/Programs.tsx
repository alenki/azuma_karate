"use client";

import { motion } from "motion/react";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";
import { chapters, programs } from "@/content/home";
import { groups, sessions, type GroupId } from "@/content/schedule";
import { dayShort } from "@/lib/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal, EASE_OUT_EXPO } from "@/components/ui/Reveal";

const VIEWPORT = { once: true, margin: "-12% 0px -8% 0px" } as const;

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

/** A hairline that is ruled across the page before the type arrives. */
function HairRule({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className={className ? `rule origin-left ${className}` : "rule origin-left"}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, delay, ease: EASE_OUT_EXPO }}
    />
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Chapter 三 · Группы — the programme list.
 * A typographic statement («С 4 лет», the 4 circled by the brush), the lead,
 * five hairline rows linking into the timetable, and a tipped-in checklist
 * for the first session.
 */
export function Programs() {
  const { locale } = useLocale();
  const chapter = chapters.find((c) => c.id === "programs")!;
  const t = programs;
  const titleText = `${t.title1[locale]} ${t.titleNumber} ${t.title2[locale]}`;

  return (
    <Chapter id="programs" index={3} title={chapter.title[locale]} labelledBy="programs-title">
      <div className="wrap pt-20 pb-24 md:pt-28 md:pb-36">
        {/* ---- running head: rule → eyebrow / mobile folio ---- */}
        <HairRule />
        <Reveal delay={0.15} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="san" className="chapter__kanji" label={null} /> 03
          </span>
        </Reveal>

        {/* ---- statement + lead ---- */}
        <div className="mt-10 md:mt-14 md:grid md:grid-cols-12 md:gap-x-6">
          <h2 id="programs-title" className="t-chapter md:col-span-12">
            <span className="sr-only">{titleText}</span>
            <LineReveal
              as="span"
              className="block"
              bleed={0.26}
              lines={[
                <span key="statement">
                  {t.title1[locale]}{" "}
                  <span className="relative inline-block mx-[0.26em]">
                    {t.titleNumber}
                    {/* the chapter's single brush mark: the circle around the digit, drawn after the line has risen */}
                    <Brush
                      kind="circle"
                      className="pointer-events-none absolute left-1/2 top-[46%] w-[1.8em] h-auto -translate-x-1/2 -translate-y-1/2 text-shu"
                      delay={0.8}
                    />
                  </span>{" "}
                  {t.title2[locale]}
                </span>,
              ]}
            />
          </h2>
          <Reveal delay={0.3} className="mt-8 md:mt-10 md:col-span-6 md:col-start-7 lg:col-span-5">
            <p className="t-lead text-ink-2 max-w-[36ch]">{t.lead[locale]}</p>
          </Reveal>
        </div>

        {/* ---- the programme rows ---- */}
        <div className="mt-16 md:mt-24">
          <Reveal
            aria-hidden="true"
            y={10}
            duration={0.7}
            className="hidden md:grid md:grid-cols-12 md:gap-x-6 pb-3 t-mono text-ink-3"
          >
            <span className="md:col-span-1" />
            <span className="md:col-span-4">{t.rowLabels.age[locale]}</span>
            <span className="md:col-span-4">{t.rowLabels.what[locale]}</span>
            <span className="md:col-span-3 text-right">{t.rowLabels.when[locale]}</span>
          </Reveal>

          <ul className="border-b border-rule">
            {groups.map((g, i) => {
              const lines = whenLines(g.id, locale);
              return (
                <li key={g.id} className="border-t border-rule">
                  <Reveal delay={i * 0.06} duration={0.8} y={18}>
                    <a
                      href="#schedule"
                      data-group={g.id}
                      className="group grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-2 py-5 transition-colors duration-300 ease-[var(--ease-out)] hover:bg-paper-2 focus-visible:bg-paper-2 md:grid-cols-12 md:gap-x-6 md:gap-y-0 md:py-6"
                    >
                      <span className="t-mono text-ink-3 row-span-3 md:row-span-1 md:col-span-1">{pad(i + 1)}</span>
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:col-span-4">
                        <span className="t-h3 font-display text-ink transition-colors duration-300 ease-[var(--ease-out)] group-hover:text-shu group-focus-visible:text-shu">
                          {g.name[locale]}
                        </span>
                        <span className="t-mono text-ink-2">{g.ages[locale]}</span>
                      </span>
                      <span className="text-[0.9375rem] leading-[1.5] text-ink-2 md:col-span-4 md:pr-8">{g.note[locale]}</span>
                      <span className="t-caption text-ink md:col-span-3 md:text-right">
                        {lines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </span>
                    </a>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ---- colophon link + tipped-in checklist ---- */}
        <div className="mt-12 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-x-6">
          <Reveal y={12} duration={0.8} className="md:col-span-5 md:pt-2">
            <a
              href="#schedule"
              className="inline-flex min-h-11 items-center gap-3 t-mono text-ink transition-colors duration-300 ease-[var(--ease-out)] hover:text-shu focus-visible:text-shu"
            >
              <span className="border-b border-current pb-[0.2em]">{t.more[locale]}</span>
              <span aria-hidden="true">→</span>
            </a>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-6 md:col-start-7">
            <aside
              aria-labelledby="programs-checklist-title"
              className="ml-auto w-full max-w-[34rem] border border-rule bg-paper-3 p-6 md:p-8"
            >
              <h3 id="programs-checklist-title" className="t-mono text-ink-2">
                {t.checklistTitle[locale]}
              </h3>
              <ol className="mt-6">
                {t.checklist.map((item, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-t border-rule py-4 md:grid-cols-[4.5rem_minmax(0,1fr)] md:py-5"
                  >
                    <span aria-hidden="true" className="font-display text-[2rem] leading-none tabular-nums text-ink md:text-[2.5rem]">
                      {pad(i + 1)}
                    </span>
                    <span className="text-[0.9375rem] leading-[1.5] text-ink">{item[locale]}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </Reveal>
        </div>
      </div>
    </Chapter>
  );
}
