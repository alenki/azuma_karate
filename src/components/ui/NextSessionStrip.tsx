"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { club } from "@/content/schedule";
import { dayShort, firstSession, groupById, nextSession, type NextSession } from "@/lib/schedule";
import { createLiveStore, useLiveStore } from "@/lib/useLiveValue";
import type { Locale } from "@/i18n/config";

type Live = { session: NextSession; live: boolean };

const SERVER: Live = { session: firstSession(), live: false };
const store = createLiveStore<Live>(
  () => ({ session: nextSession(), live: true }),
  (v) => `${v.session.day}:${v.session.time}:${v.session.group}:${v.session.inDays}`,
);

/**
 * The live "next session" readout. The server renders the static first slot of
 * the week; after hydration it becomes the real next session in the club's
 * time zone and refreshes every minute.
 */
export function useNextSession(): Live {
  return useLiveStore(store, SERVER);
}

export function formatNextSession(session: NextSession, live: boolean, locale: Locale) {
  const group = groupById(session.group);
  const when = !live
    ? dayShort(session.day, locale)
    : session.isToday
      ? locale === "ru" ? "Сегодня" : "Today"
      : session.inDays === 1
        ? locale === "ru" ? "Завтра" : "Tomorrow"
        : dayShort(session.day, locale);
  return {
    label: locale === "ru" ? "Ближайшая тренировка" : "Next session",
    when,
    time: session.time,
    /* the full line, for a strip that has the trim to set it on */
    group: `${group.name[locale]} · ${group.ages[locale]}`,
    /* the group alone, for the 56px foot margin — the ages are what pushed
       that line past its column and into an ellipsis */
    groupName: group.name[locale],
    place: club.address[locale],
  };
}

export function NextSessionStrip({ className, href }: { className?: string; href: string }) {
  const { locale } = useLocale();
  const { session, live } = useNextSession();
  const f = formatNextSession(session, live, locale);
  return (
    <a href={href} className={className} data-live={live ? "true" : "false"}>
      <span className="t-mono">{f.label}</span>
      <span aria-hidden="true" className="t-mono opacity-50">·</span>
      <span className="t-mono">
        <time>{f.when} {f.time}</time>
      </span>
      <span aria-hidden="true" className="t-mono opacity-50">·</span>
      <span className="t-mono">{f.group}</span>
      <span aria-hidden="true" className="t-mono opacity-50">·</span>
      <span className="t-mono">{f.place}</span>
      <span aria-hidden="true" className="t-mono">→</span>
    </a>
  );
}
