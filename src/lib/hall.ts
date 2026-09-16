import { groups, sessions, type GroupId, type Session } from "@/content/schedule";
import { dayShort, nextSession, nowInClubTime, type NextSession } from "@/lib/schedule";
import type { Locale } from "@/i18n/config";

/**
 * What the hall is doing — derived, never restated.
 * ------------------------------------------------
 * The contacts page answers two questions the home page does not: "when can I
 * come" and "is anyone there right now". Both are computed from `sessions` in
 * `content/schedule.ts` — the same record the timetable, the JSON-LD opening
 * hours and the next-session strip read — so the four can never disagree, and
 * a session moved there moves here without anyone remembering to.
 *
 * Everything below is PURE and takes its `Date` as an argument, so the server
 * can render one value and the client's live store can refresh it (see
 * `lib/useLiveValue.ts`). No `Date.now()` is called at module scope.
 */

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number): string {
  const m = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** The minute a session ends. */
export function sessionEnd(session: Session): string {
  return fromMinutes(toMinutes(session.time) + session.minutes);
}

/**
 * The week's envelope: which days carry sessions, and the earliest start and
 * latest finish across them.
 *
 * It is deliberately an ENVELOPE and it is labelled as one. Per-day windows
 * differ (Monday runs 17:00–22:00, Tuesday 18:00–21:00), so a single line that
 * claimed «Пн–Пт, 17:00–22:00» as opening HOURS would be false four days out of
 * five. Printed under «Тренировки» it says what is true: sessions happen on
 * these days, between these two times. The exact week is one link away — the
 * timetable in chapter 三 is the fact, and this page does not reprint it.
 */
export type Envelope = { days: number[]; opens: string; closes: string };

export function weekEnvelope(): Envelope {
  const days = [...new Set(sessions.map((s) => s.day))].sort((a, b) => a - b);
  const opens = Math.min(...sessions.map((s) => toMinutes(s.time)));
  const closes = Math.max(...sessions.map((s) => toMinutes(s.time) + s.minutes));
  return { days, opens: fromMinutes(opens), closes: fromMinutes(closes) };
}

/**
 * The day list as a typeset range. Contiguous days collapse to «Пн–Пт»; a
 * gapped week prints its days separated by commas, because a range that skips
 * a day is a lie told in two characters.
 */
export function dayRange(days: number[], locale: Locale): string {
  if (days.length === 0) return "";
  const contiguous = days.every((d, i) => i === 0 || d === days[i - 1] + 1);
  if (contiguous && days.length > 2) return `${dayShort(days[0], locale)}\u2013${dayShort(days[days.length - 1], locale)}`;
  return days.map((d) => dayShort(d, locale)).join(", ");
}

/**
 * Is anyone on the tatami at this instant?
 *
 * `training` is the session that is RUNNING — started and not yet finished —
 * and `next` is the one after it. The page states one or the other and never
 * invents a third state: the club has not told us when the hall unlocks, only
 * when it trains, so "open" is a word this page is not entitled to.
 */
export type HallState =
  | { kind: "training"; session: Session; endsAt: string; next: NextSession }
  | { kind: "closed"; next: NextSession };

export function hallState(date = new Date()): HallState {
  const { day, minutes } = nowInClubTime(date);
  const running = sessions.find((s) => {
    const start = toMinutes(s.time);
    return s.day === day && minutes >= start && minutes < start + s.minutes;
  });
  const next = nextSession(date);
  return running ? { kind: "training", session: running, endsAt: sessionEnd(running), next } : { kind: "closed", next };
}


/** The club's own wall clock, as a tabular HH:MM in `club.timeZone`. */
export function clubClock(date = new Date()): string {
  const { minutes } = nowInClubTime(date);
  return fromMinutes(minutes);
}

/** Every session a group trains, in week order. */
export function groupSessions(group: GroupId): Session[] {
  return sessions
    .filter((s) => s.group === group)
    .sort((a, b) => a.day - b.day || toMinutes(a.time) - toMinutes(b.time));
}

/**
 * A group's week as slots — «Пн 17:00», «Ср 17:00» … — plus the session length
 * when every one of its sessions runs the same one, and `null` when they do not.
 *
 * The length is printed ONCE at the end of the row rather than after each slot,
 * so the row reads as a group's week and not as four repetitions of a figure.
 * It is conditional because nothing in the data model requires a group's
 * sessions to share a duration; the day one of them differs, the row simply
 * stops claiming a single length instead of printing a false one.
 */
export function groupWeek(group: GroupId, locale: Locale): { slots: string[]; minutes: number | null } {
  const own = groupSessions(group);
  const minutes = own.length > 0 && own.every((s) => s.minutes === own[0].minutes) ? own[0].minutes : null;
  return { slots: own.map((s) => `${dayShort(s.day, locale)} ${s.time}`), minutes };
}

/**
 * The groups a student of this age may train in.
 *
 * It returns a LIST, and that is the whole point of it. `content/schedule.ts`
 * states that the bands overlap at 6 and at 16 because the club runs them that
 * way — «a six-year-old goes to whichever group they are ready for» — and the
 * page is built to show two answers where the club has two, rather than
 * silently picking the first match and tidying the club's own pedagogy away.
 */
export function groupsForAge(age: number): GroupId[] {
  return groups
    .filter((g) => g.ageSpan && age >= g.ageSpan.from && (g.ageSpan.to === null || age <= g.ageSpan.to))
    .map((g) => g.id);
}

/** The youngest age any group accepts — the club's own floor, never a literal. */
export function youngestAge(): number {
  return Math.min(...groups.filter((g) => g.ageSpan).map((g) => g.ageSpan!.from));
}
