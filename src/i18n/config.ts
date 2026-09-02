export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Build a locale-aware href. Russian (default) lives on the bare path,
 * English is prefixed with `/en`. Hash-only links are returned untouched.
 */
export function localeHref(locale: Locale, path: string): string {
  if (path.startsWith("#") || /^https?:\/\//.test(path) || path.startsWith("mailto:") || path.startsWith("tel:")) {
    return path;
  }
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean || "/";
  return `/${locale}${clean}`;
}

/** The other locale, used by the language toggle. */
export function otherLocale(locale: Locale): Locale {
  return locale === "ru" ? "en" : "ru";
}
