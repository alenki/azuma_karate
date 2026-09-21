import { club, groups, sessions, type FamilyId, type GroupId, type Session } from "@/content/schedule";

const DAY_SHORT: string[] = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DAY_LONG: string[] = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

export function dayShort(day: number) {
  return DAY_SHORT[day - 1];
}
export function dayLong(day: number) {
  return DAY_LONG[day - 1];
}
export function groupById(id: GroupId) {
  return groups.find((g) => g.id === id)!;
}

/** The groups the club sorts into one intake family, in timetable order. */
export function groupsInFamily(family: FamilyId) {
  return groups.filter((g) => g.family === family);
}

/** Russian binds the space AFTER a one-letter conjunction. */
const AND = "и\u00A0";

/**
 * A family's age bands as running PROSE rather than as a column: «4–6, 6–11
 * и\u00A012–16\u00A0лет», «16+».
 *
 * IT USED TO BE ONE BAND AT A TIME. Chapter 二 printed the intake as a ruled
 * two-column table — a family ranged left, its bands stacked right — and each
 * band carried its own unit, because a column has no last item to hang one off.
 * The chapter states the intake in a SENTENCE now, and «4–6\u00A0лет, 6–11\u00A0лет
 * и\u00A012–16\u00A0лет» is a column read aloud: the unit is printed ONCE, at the end
 * of the list. A band that never closes carries its plus sign and takes no unit
 * at all, which is why the affix is decided by the whole list and not per band.
 *
 * The figures are read off `content/schedule.ts` — the same record chapter 三's
 * timetable legend reads — so the sentence and the week cannot disagree, and a
 * band is added or moved by editing the groups there and nothing here.
 */
export function ageBands(family: FamilyId) {
  const bands = groupsInFamily(family).map((g) => {
    if (!g.ageSpan) return { text: g.ages, closed: false };
    const { from, to } = g.ageSpan;
    return to === null ? { text: `${from}+`, closed: false } : { text: `${from}–${to}`, closed: true };
  });
  if (bands.length === 0) return "";
  const head = bands.slice(0, -1).map((b) => b.text).join(", ");
  const tail = bands[bands.length - 1].text;
  const list = head ? `${head} ${AND}${tail}` : tail;
  /* every figure in the list is bound to one unit, or none of them is */
  if (!bands.every((b) => b.closed)) return list;
  return `${list}\u00A0лет`;
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
