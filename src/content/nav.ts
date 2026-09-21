
export type NavItem = { href: string; label: string };

/** Site sections. Only the home page exists in this phase; the rest are future routes. */
export const navItems: NavItem[] = [
  { href: "/about", label: "О клубе" },
  { href: "/schedule", label: "Расписание" },
  { href: "/trainers", label: "Тренеры" },
  { href: "/achievements", label: "Достижения" },
  { href: "/contacts", label: "Контакты" },
];

export const cta = {
  label: "Записаться",
  href: "#join",
};
