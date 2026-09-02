"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/i18n/LocaleProvider";
import { groups, type GroupId } from "@/content/schedule";
import { byDay, dayLong, dayShort, groupById, nowInClubTime } from "@/lib/schedule";
import { createLiveStore, useLiveStore } from "@/lib/useLiveValue";
import { Brush } from "@/components/brush/Brush";

/** The server has no clock for Nalchik, so it marks no day as "today". */
const SERVER_DAY: number | null = null;
const todayStore = createLiveStore<number | null>(() => nowInClubTime().day, (d) => String(d));

const copy = {
  ru: { today: "сегодня", legend: "Группы", hours: "Время" },
  en: { today: "today", legend: "Groups", hours: "Time" },
};

/**
 * The weekly timetable as a printed table. The server renders it without a
 * "today" mark; after mount the current weekday gets the brush tick and, on
 * narrow screens, opens by default. Hovering or focusing a group in the legend
 * highlights that group's cells (shared `data-group`).
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

  return (
    <div className={cn("timetable", className)} data-highlight={hi ?? undefined}>
      {/* legend */}
      <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2" role="group" aria-label={t.legend}>
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={cn("legend__btn t-mono py-2", hi === g.id && "legend__btn--on")}
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
      </div>

      {/* desktop: 7 columns */}
      <div className="hidden md:grid grid-cols-7 gap-px bg-rule border border-rule">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => {
          const isToday = today === d;
          return (
            <div key={d} className={cn("timetable__col bg-paper p-4 min-h-[16rem]", isToday && "timetable__col--today")}>
              <div className="relative flex items-baseline justify-between mb-4">
                <span className="font-display text-lg">{dayShort(d, locale)}</span>
                {isToday && (
                  <span className="t-mono text-shu">
                    {t.today}
                    <Brush kind="tick" className="absolute -bottom-3 left-0 w-10 text-shu" trigger="load" delay={0.2} />
                  </span>
                )}
              </div>
              <ul className="flex flex-col gap-2">
                {days.get(d)!.map((s) => {
                  const g = groupById(s.group);
                  return (
                    <li
                      key={`${d}-${s.time}-${s.group}`}
                      data-group={s.group}
                      className={cn("timetable__cell py-2 border-t border-rule", hi && hi !== s.group && "opacity-30", hi === s.group && "timetable__cell--hi")}
                    >
                      <span className="t-caption block">{s.time}</span>
                      <span className="text-[0.875rem] leading-snug block">{g.name[locale]}</span>
                      <span className="t-mono text-ink-3 block mt-1">{g.ages[locale]}</span>
                    </li>
                  );
                })}
                {days.get(d)!.length === 0 && <li className="t-caption text-ink-3">—</li>}
              </ul>
            </div>
          );
        })}
      </div>

      {/* mobile: per-day accordion, today open */}
      <div className="md:hidden border-t border-rule">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => {
          const isToday = today === d;
          const open = openDay === d;
          return (
            <div key={d} className="border-b border-rule">
              <button
                type="button"
                className="flex w-full items-center justify-between py-4"
                aria-expanded={open}
                onClick={() => setOpenDay(open ? null : d)}
              >
                <span className="font-display text-xl">
                  {dayLong(d, locale)}
                  {isToday && <span className="t-mono text-shu ml-3">{t.today}</span>}
                </span>
                <span className="t-mono text-ink-3">{days.get(d)!.length}</span>
              </button>
              {open && (
                <ul className="pb-4 flex flex-col">
                  {days.get(d)!.map((s) => {
                    const g = groupById(s.group);
                    return (
                      <li key={`${d}-${s.time}-${s.group}`} data-group={s.group} className="flex items-baseline gap-4 py-2 border-t border-rule">
                        <span className="t-caption w-14 shrink-0">{s.time}</span>
                        <span className="text-[0.9375rem]">{g.name[locale]}</span>
                        <span className="t-mono text-ink-3 ml-auto">{g.ages[locale]}</span>
                      </li>
                    );
                  })}
                  {days.get(d)!.length === 0 && <li className="t-caption text-ink-3 py-2">—</li>}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
