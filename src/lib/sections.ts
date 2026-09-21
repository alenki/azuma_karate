import { localeHref, type Locale } from "@/i18n/config";

/*
  THE FOUR PRINTED SECTIONS — WHICH ARE ROUTES AND WHICH ARE STILL CHAPTERS.
  --------------------------------------------------------------------------
  `content/nav.ts` names four sections: /about, /schedule, /achievements,
  /contacts.
  They are printed three times over — the bar, the contents page, the colophon —
  so a label that points nowhere is a dead link printed twelve times in the
  manual's own furniture.

  Until a section ships as a page, its label is re-pointed at the chapter that
  already answers it. This map is that re-pointing, and `LIVE_ROUTES` is the
  list of sections that have stopped needing it. Both live here rather than in
  `content/nav` because neither is a fact about the club — they are facts about
  which pages exist this month, and each entry is deleted the day its page
  ships.

  THE CURRENT ROUTE IS PASSED IN, NEVER READ FROM `usePathname()`. The locale
  rewrite in `next.config.ts` means the server renders `/ru/contacts` while the
  browser shows `/contacts`, so a hook that reads the path would be free to
  answer differently on the two sides of hydration — and every id below the
  header would renumber with it (the failure `providers/SmoothScroll.tsx`
  documents at length). A page knows its own route; it says so.
*/
export const SECTION_ANCHOR: Record<string, string> = {
  "/about": "about",
  "/schedule": "schedule",
  "/achievements": "results",
  /* "/contacts" was here, re-pointed at 六 Запись. It shipped as a page, so
     the re-point went with it — see LIVE_ROUTES. */
};

/** Sections that are real pages now, and so are never re-pointed at a chapter. */
export const LIVE_ROUTES: ReadonlySet<string> = new Set(["/contacts"]);

/** The chapter id a printed section label falls back to. */
export function sectionAnchor(routeHref: string): string {
  return SECTION_ANCHOR[routeHref] ?? routeHref.replace(/^\//, "");
}

export type SectionLink = {
  href: string;
  /** True when the label points at a page rather than at a home-page chapter. */
  live: boolean;
  /** The chapter id it falls back to — still the key the reading observer marks. */
  anchor: string;
  /** Whether the reader is ON this section's page right now. */
  current: boolean;
  /** A bare `#fragment`, which is the only case the delegated anchor scroller owns. */
  inPage: boolean;
};

/**
 * Resolve one printed section label for the page it is being printed on.
 *
 * `route` is the current page's own route — "/" for the home page, "/contacts"
 * for the contacts page. Off the home page a chapter link has to carry the home
 * path with it, or «О клубе» on /contacts is a fragment pointing at nothing.
 */
export function sectionLink(routeHref: string, locale: Locale, route: string): SectionLink {
  const anchor = sectionAnchor(routeHref);
  if (LIVE_ROUTES.has(routeHref)) {
    return { href: localeHref(locale, routeHref), live: true, anchor, current: route === routeHref, inPage: false };
  }
  if (route === "/") return { href: `#${anchor}`, live: false, anchor, current: false, inPage: true };
  /* `localeHref(locale, "/")` is "/" or "/en" — never with a trailing slash, so
     the join can never produce the "/en/#id" that would 308 on its way. */
  return { href: `${localeHref(locale, "/")}#${anchor}`, live: false, anchor, current: false, inPage: false };
}

/**
 * The primary control's destination. `content/nav.ts` states it as the home
 * chapter `#join`; a page that carries its own version of that act states its
 * own fragment instead and this is never consulted.
 */
export function homeAnchorHref(anchor: string, locale: Locale, route: string): string {
  const id = anchor.replace(/^#/, "");
  return route === "/" ? `#${id}` : `${localeHref(locale, "/")}#${id}`;
}
