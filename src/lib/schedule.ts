import { club, groups, sessions, type GroupId, type Session } from "@/content/schedule";
import type { Locale } from "@/i18n/config";

const DAY_SHORT: Record<Locale, string[]> = {
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};
const DAY_LONG: Record<Locale, string[]> = {
  ru: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};

export function dayShort(day: number, locale: Locale) {
  return DAY_SHORT[locale][day - 1];
}
export function dayLong(day: number, locale: Locale) {
  return DAY_LONG[locale][day - 1];
}
export function groupById(id: GroupId) {
  return groups.find((g) => g.id === id)!;
}

/** Current wall-clock in the club's time zone: ISO weekday (1–7) and minutes since midnight. */
export function nowInClubTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: club.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const day = (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(wd) + 1) as Session["day"];
  return { day, minutes: hour * 60 + minute };
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export type NextSession = Session & { /** 0 = today, 1 = tomorrow … */ inDays: number; isToday: boolean };

/**
 * The next session from a given moment. A session still counts while it is
 * running (until its end), so the strip says "today, 17:00" during class.
 */
export function nextSession(date = new Date()): NextSession {
  const { day, minutes } = nowInClubTime(date);
  let best: NextSession | null = null;
  for (const s of sessions) {
    let inDays = (s.day - day + 7) % 7;
    const start = toMinutes(s.time);
    if (inDays === 0 && start + s.minutes <= minutes) inDays = 7;
    const score = inDays * 1440 + start;
    if (!best || score < best.inDays * 1440 + toMinutes(best.time)) {
      best = { ...s, inDays, isToday: inDays === 0 };
    }
  }
  return best!;
}

/** Static first slot for server rendering (no clock on the server). */
export function firstSession(): NextSession {
  const s = [...sessions].sort((a, b) => a.day - b.day || toMinutes(a.time) - toMinutes(b.time))[0];
  return { ...s, inDays: 0, isToday: false };
}

/** Timetable grouped by ISO weekday, sorted by time. */
export function byDay() {
  const map = new Map<number, Session[]>();
  for (let d = 1; d <= 7; d++) map.set(d, []);
  for (const s of sessions) map.get(s.day)!.push(s);
  for (const list of map.values()) list.sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
  return map;
}
