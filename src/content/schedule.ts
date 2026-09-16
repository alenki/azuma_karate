import type { Locale } from "@/i18n/config";
import { pendingFact } from "@/content/home";

/**
 * Weekly timetable — PART PLACEHOLDER.
 *
 * THE AGE BANDS AND THE TWO FAMILIES ARE THE CLUB'S OWN, confirmed by them:
 * 4–6, 6–11 and 12–16 for «Мальчики и девочки», 16+ for «Мужчины и девушки».
 * The bands overlap at 6 and at 16 because the club runs them that way — a
 * six-year-old goes to whichever group they are ready for — so do not "tidy"
 * either seam into 4–5 / 7–11 / 17+. Chapter 二's intake line and chapter
 * 三's timetable legend both read them from here, which is the only reason
 * the two cannot disagree.
 *
 * Every TIME below is still placeholder and must be confirmed before launch,
 * as are the group names — the club gave us bands, not names. One data source
 * drives the timetable, the JSON-LD opening hours and the "next session" strip.
 *
 * Typeset strings here follow the BOUND SPACES rule stated in `home.ts`: a
 * non-breaking space is written as the escape `\u00A0`, and binds a figure to
 * its unit and a one- or two-letter preposition to the word it governs. Facts
 * the club has not confirmed follow the PENDING FACTS convention from the same
 * file, which is why this data module imports from the copy module — there is
 * no third content file to state the convention in, and stating it twice is
 * how two conventions are born.
 */
export type GroupId = "kids-4-6" | "kids-6-11" | "teens-12-16" | "adults";

/**
 * The club sorts its groups into two FAMILIES, and these are its own words for
 * them. They are not a second set of groups: nobody trains in a family, and the
 * timetable never prints one. They exist because the club states its intake as
 * two sentences — «Мальчики и девочки: 4–6 / 6–11 / 12–16», «Мужчины и девушки:
 * 16+» — and chapter 二 states it the same way, as one sentence with a
 * term and its bands. `family: null` stays legal for a group in neither
 * of them, though no group is set that way now.
 */
export type FamilyId = "children" | "adults";

export const families: { id: FamilyId; label: Record<Locale, string> }[] = [
  { id: "children", label: { ru: "Мальчики и\u00A0девочки", en: "Boys and girls" } },
  { id: "adults", label: { ru: "Мужчины и\u00A0девушки", en: "Men and women" } },
];

export type Group = {
  id: GroupId;
  name: Record<Locale, string>;
  ages: Record<Locale, string>;
  /** Short line under the group name. */
  note: Record<Locale, string>;
  /** Which of the club's two intake families this group belongs to. */
  family: FamilyId | null;
  /**
   * The group's age band in whole years, as figures rather than as a typeset
   * string. `to: null` is an open band that never closes (16+); `ageSpan: null`
   * is a group with no band at all, which none of them currently is.
   * `ageBands()` in `lib/schedule.ts` typesets it for
   * chapter 二's intake line, so this and `ages` above are one fact written twice:
   * change either and change the other.
   */
  ageSpan: { from: number; to: number | null } | null;
};

export const groups: Group[] = [
  {
    id: "kids-4-6",
    name: { ru: "Первый шаг", en: "First Step" },
    ages: { ru: "4–6\u00A0лет", en: "ages\u00A04–6" },
    note: { ru: "Игра, координация, дисциплина. Без спаррингов.", en: "Play, coordination, discipline. No sparring." },
    family: "children",
    ageSpan: { from: 4, to: 6 },
  },
  {
    id: "kids-6-11",
    name: { ru: "Дети", en: "Kids" },
    ages: { ru: "6–11\u00A0лет", en: "ages\u00A06–11" },
    note: { ru: "Кихон, ката, первые аттестации.", en: "Kihon, kata, first gradings." },
    family: "children",
    ageSpan: { from: 6, to: 11 },
  },
  {
    id: "teens-12-16",
    name: { ru: "Подростки", en: "Teens" },
    ages: { ru: "12–16\u00A0лет", en: "ages\u00A012–16" },
    note: { ru: "Кумитэ в\u00A0защите, соревнования по\u00A0желанию.", en: "Protected kumite, competitions optional." },
    family: "children",
    ageSpan: { from: 12, to: 16 },
  },
  {
    id: "adults",
    name: { ru: "Взрослые", en: "Adults" },
    ages: { ru: "16+", en: "16+" },
    note: { ru: "С\u00A0нуля или с\u00A0опытом. Вечерняя группа.", en: "Beginners or experienced. Evening group." },
    family: "adults",
    ageSpan: { from: 16, to: null },
  },
];

/** 1 = Monday … 7 = Sunday (ISO). */
export type Session = { day: 1 | 2 | 3 | 4 | 5 | 6 | 7; time: string; group: GroupId; minutes: number };

export const sessions: Session[] = [
  { day: 1, time: "17:00", group: "kids-4-6", minutes: 60 },
  { day: 1, time: "18:00", group: "kids-6-11", minutes: 75 },
  { day: 1, time: "19:30", group: "teens-12-16", minutes: 90 },
  { day: 1, time: "20:30", group: "adults", minutes: 90 },
  { day: 2, time: "18:00", group: "kids-6-11", minutes: 75 },
  { day: 2, time: "19:30", group: "adults", minutes: 90 },
  { day: 3, time: "17:00", group: "kids-4-6", minutes: 60 },
  { day: 3, time: "18:00", group: "kids-6-11", minutes: 75 },
  { day: 3, time: "19:30", group: "teens-12-16", minutes: 90 },
  { day: 3, time: "20:30", group: "adults", minutes: 90 },
  { day: 4, time: "18:00", group: "kids-6-11", minutes: 75 },
  { day: 4, time: "19:30", group: "adults", minutes: 90 },
  { day: 5, time: "17:00", group: "kids-4-6", minutes: 60 },
  { day: 5, time: "18:00", group: "kids-6-11", minutes: 75 },
  { day: 5, time: "19:30", group: "teens-12-16", minutes: 90 },
];

export const club = {
  name: "SK AZUMA",
  city: { ru: "Нальчик", en: "Nalchik" } as Record<Locale, string>,
  /*
    The republic. It is geography rather than a claim about the club, and it
    lives here because it is part of ONE address with one home — the contacts
    page sets the particulars the way a posted address is set (addressee,
    street, city, republic) and must not retype a line of it into a copy file.
    Nothing on the home page prints it; a reader on /en outside the republic
    is who it is for.
  */
  region: { ru: "Кабардино-Балкария", en: "Kabardino-Balkaria" } as Record<Locale, string>,
  address: { ru: "ул.\u00A0Кирова,\u00A0157", en: "Kirova St,\u00A0157" } as Record<Locale, string>,
  /**
   * Approximate coordinates of Nalchik, used to compute the park sunrise — a
   * city-level position is accurate enough for a sunrise time. It is NOT the
   * hall's surveyed position, which is why `coordsLabel` below is pending.
   */
  lat: 43.4853,
  lng: 43.6071,
  coordsLabel: "43°29′\u00A0N\u00A0· 43°36′\u00A0E",
  telegram: "https://t.me/zhaambeevteam",
  instagram: "https://www.instagram.com/sk.azuma_karate",
  /** PLACEHOLDER phone — read `pending.phone` below before rendering it. */
  phone: "+7 (900) 000-00-00",
  phoneHref: "tel:+79000000000",
  timeZone: "Europe/Moscow",
  mapsHref: "https://yandex.ru/maps/?text=Нальчик,%20улица%20Кирова,%20157",

  /*
    Facts on this record the club has not confirmed. The convention is stated
    once, in `home.ts` — a consumer checks the flag and prints the label with a
    ruled blank instead of printing the placeholder.

    Both entries here are worse than an ordinary placeholder because both are
    currently ACTED ON rather than merely read. The footer renders `phone` as a
    live `tel:` link, so a parent can tap «+7 (900) 000-00-00» and reach
    nobody; and `coordsLabel` is printed in the schedule colophon and in the
    footer to the arc-minute, as though the hall had been surveyed, when the
    figures are the city's. `phone` and `phoneHref` keep their placeholder
    values so that nothing breaks at build time — the branch belongs at the
    call site, and until it exists the manual is printing a measurement it has
    not taken and a number that does not ring.
  */
  pending: {
    phone: pendingFact({ ru: "номер уточняется у\u00A0клуба", en: "number to be confirmed with the club" }),
    coordsLabel: pendingFact({ ru: "координаты зала уточняются", en: "hall coordinates to be confirmed" }),
  },
};
