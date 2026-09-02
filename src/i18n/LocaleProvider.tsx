"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultLocale, localeHref, type Locale } from "./config";

type LocaleContextValue = {
  locale: Locale;
  /** Build an href for the current locale. */
  href: (path: string) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  href: (path) => localeHref(defaultLocale, path),
});

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <LocaleContext.Provider value={{ locale, href: (path) => localeHref(locale, path) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
