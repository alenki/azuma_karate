import type { Locale } from "@/i18n/config";

export type NavItem = { href: string; label: Record<Locale, string> };

/** Site sections. Only the home page exists in this phase; the rest are future routes. */
export const navItems: NavItem[] = [
  { href: "/about", label: { ru: "О клубе", en: "About" } },
  { href: "/training", label: { ru: "Тренировки", en: "Training" } },
  { href: "/schedule", label: { ru: "Расписание", en: "Schedule" } },
  { href: "/competitions", label: { ru: "Соревнования", en: "Competitions" } },
  { href: "/gallery", label: { ru: "Галерея", en: "Gallery" } },
  { href: "/contacts", label: { ru: "Контакты", en: "Contacts" } },
];

export const cta = {
  label: { ru: "Записаться", en: "Sign up" } as Record<Locale, string>,
  href: "#join",
};
