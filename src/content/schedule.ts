import type { Locale } from "@/i18n/config";

/**
 * Weekly timetable — PLACEHOLDER DATA.
 * Every time, group and age band below must be confirmed with the club before
 * launch. One data source drives the programme rows, the timetable and the
 * "next session" strip.
 */
export type GroupId = "kids-4-6" | "kids-7-11" | "teens-12-16" | "adults" | "morning";

export type Group = {
  id: GroupId;
  name: Record<Locale, string>;
  ages: Record<Locale, string>;
  /** Short line under the group name. */
  note: Record<Locale, string>;
  /**
   * The group's place on chapter three's age chart, in whole years.
   * `to: null` is an open band that never closes («17+»). `ageSpan: null`
   * means the group has no age band at all — it runs alongside every other
   * group, and the chart draws it as the rail crossing them rather than as a
   * band among them. Keep it in step with `ages` above.
   */
  ageSpan: { from: number; to: number | null } | null;
};

export const groups: Group[] = [
  {
    id: "kids-4-6",
    name: { ru: "Первый шаг", en: "First Step" },
    ages: { ru: "4–6 лет", en: "ages 4–6" },
    note: { ru: "Игра, координация, дисциплина. Без спаррингов.", en: "Play, coordination, discipline. No sparring." },
    ageSpan: { from: 4, to: 6 },
  },
  {
    id: "kids-7-11",
    name: { ru: "Дети", en: "Kids" },
    ages: { ru: "7–11 лет", en: "ages 7–11" },
    note: { ru: "Кихон, ката, первые аттестации.", en: "Kihon, kata, first gradings." },
    ageSpan: { from: 7, to: 11 },
  },
  {
    id: "teens-12-16",
    name: { ru: "Подростки", en: "Teens" },
    ages: { ru: "12–16 лет", en: "ages 12–16" },
    note: { ru: "Кумитэ в защите, соревнования по желанию.", en: "Protected kumite, competitions optional." },
    ageSpan: { from: 12, to: 16 },
  },
  {
    id: "adults",
    name: { ru: "Взрослые", en: "Adults" },
    ages: { ru: "17+", en: "17+" },
    note: { ru: "С нуля или с опытом. Вечерняя группа.", en: "Beginners or experienced. Evening group." },
    ageSpan: { from: 17, to: null },
  },
  {
    id: "morning",
    name: { ru: "Утренние в парке", en: "Park mornings" },
    ages: { ru: "все группы", en: "all groups" },
    note: { ru: "Точку сбора публикуем в Telegram.", en: "Meeting point posted on Telegram." },
    ageSpan: null,
  },
];

/** 1 = Monday … 7 = Sunday (ISO). */
export type Session = { day: 1 | 2 | 3 | 4 | 5 | 6 | 7; time: string; group: GroupId; minutes: number };

export const sessions: Session[] = [
  { day: 1, time: "17:00", group: "kids-4-6", minutes: 60 },
  { day: 1, time: "18:00", group: "kids-7-11", minutes: 75 },
  { day: 1, time: "19:30", group: "teens-12-16", minutes: 90 },
  { day: 1, time: "20:30", group: "adults", minutes: 90 },
  { day: 2, time: "18:00", group: "kids-7-11", minutes: 75 },
  { day: 2, time: "19:30", group: "adults", minutes: 90 },
  { day: 3, time: "17:00", group: "kids-4-6", minutes: 60 },
  { day: 3, time: "18:00", group: "kids-7-11", minutes: 75 },
  { day: 3, time: "19:30", group: "teens-12-16", minutes: 90 },
  { day: 3, time: "20:30", group: "adults", minutes: 90 },
  { day: 4, time: "18:00", group: "kids-7-11", minutes: 75 },
  { day: 4, time: "19:30", group: "adults", minutes: 90 },
  { day: 5, time: "17:00", group: "kids-4-6", minutes: 60 },
  { day: 5, time: "18:00", group: "kids-7-11", minutes: 75 },
  { day: 5, time: "19:30", group: "teens-12-16", minutes: 90 },
  { day: 6, time: "08:00", group: "morning", minutes: 90 },
  { day: 7, time: "08:00", group: "morning", minutes: 90 },
];

export const club = {
  name: "SK AZUMA",
  city: { ru: "Нальчик", en: "Nalchik" } as Record<Locale, string>,
  address: { ru: "ул. Кирова, 157", en: "Kirova St, 157" } as Record<Locale, string>,
  /** Approximate coordinates of Nalchik; confirm the exact hall location. */
  lat: 43.4853,
  lng: 43.6071,
  coordsLabel: "43°29′ N · 43°36′ E",
  telegram: "https://t.me/zhaambeevteam",
  instagram: "https://www.instagram.com/sk.azuma_karate",
  /** PLACEHOLDER phone. */
  phone: "+7 (900) 000-00-00",
  phoneHref: "tel:+79000000000",
  timeZone: "Europe/Moscow",
  mapsHref: "https://yandex.ru/maps/?text=Нальчик,%20улица%20Кирова,%20157",
};
