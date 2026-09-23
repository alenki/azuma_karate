import { navItems, type NavItem } from "@/content/nav";
/*
  THE PRINTED SECTIONS ARE CHAPTERS, NOT ROUTES.
  ----------------------------------------------
  `content/nav.ts` names five sections: /about, /schedule, /trainers,
  /achievements, /contacts. The app has exactly one route — the home page, by
  design, in this phase — and every one of them is printed three times over, on
  the bar, the contents page and the colophon, so a label that points nowhere is
  a dead link printed fifteen times in the manual's own furniture.

  Until a section ships as a page, its label is re-pointed at the chapter that
  already answers it. This map is that re-pointing, and `LIVE_ROUTES` is the
  list of sections that have stopped needing it. Both live here rather than in
  `content/nav` because neither is a fact about the club — they are facts about
  which pages exist this month, and each entry is deleted the day its page
  ships.

  /contacts shipped as a page once and was taken back out; its re-point at
  六 Запись came back with it. That is the whole cycle this file is built for,
  in both directions, which is why the machinery below stays while `LIVE_ROUTES`
  is empty rather than being unwound and written again for /about.

  THE CURRENT ROUTE IS PASSED IN, NEVER READ FROM `usePathname()`. The original
  reason was the locale rewrite: the server rendered `/ru/about` while the
  browser showed `/about`, so a hook reading the path could answer differently
  on the two sides of hydration and every id below the header would renumber
  with it (the failure `providers/SmoothScroll.tsx` documents at length). That
  rewrite is gone with the English edition and the paths now agree, but the
  argument that replaced it is the plainer one: a page knows its own route, so
  it says so, and nothing below has to re-derive it during render.
*/
export const SECTION_ANCHOR: Record<string, string> = {
  "/about": "about",
  "/schedule": "schedule",
  /* «Тренеры» is the one label whose chapter carries the same word: 四 Тренеры
     sets both coaches on one spread, so the section is already written. */
  "/trainers": "sensei",
  "/achievements": "results",
  /* «Контакты» goes to 六 Запись, which is where a reader who wants the club
     is actually going. */
  "/contacts": "join",
};

/** Sections that are real pages now, and so are never re-pointed at a chapter. */
export const LIVE_ROUTES: ReadonlySet<string> = new Set<string>();

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
 * `route` is the current page's own route — "/" for the home page, and the
 * section's own path for a section that has shipped. Off the home page a
 * chapter link has to carry the home path with it, or «О клубе» on that page is
 * a fragment pointing at nothing.
 */
export function sectionLink(routeHref: string, route: string): SectionLink {
  const anchor = sectionAnchor(routeHref);
  if (LIVE_ROUTES.has(routeHref)) {
    return { href: routeHref, live: true, anchor, current: route === routeHref, inPage: false };
  }
  if (route === "/") return { href: `#${anchor}`, live: false, anchor, current: false, inPage: true };
  return { href: `/#${anchor}`, live: false, anchor, current: false, inPage: false };
}

/* ------------------------------------------------------------------ */
/* THE CONTENTS PAGE LISTS EACH DESTINATION EXACTLY ONCE.               */
/*                                                                      */
/* The phone's contents overlay used to print two lists: the five       */
/* section labels above, and the chapters below them under the heading  */
/* «Содержание». With `LIVE_ROUTES` empty, every one of those five      */
/* labels resolves through `sectionLink()` to a chapter anchor, so the  */
/* overlay was printing eleven links to six places — `#about`,          */
/* `#schedule`, `#sensei`, `#results` and `#join` twice each, under two */
/* different numbering systems that disagreed about what `03` meant     */
/* («Тренеры» in one list, «Расписание» in the other) and under two     */
/* different names for one chapter («Достижения» over «Хроника»).       */
/*                                                                      */
/* The fix is not to delete one of the lists, because each of them is   */
/* right about something the other is not: the chapters are what the    */
/* page actually contains, and the section labels are where those       */
/* chapters are going the day they ship as routes. So the two are       */
/* MERGED here, on the anchor they share, and the merge is what makes   */
/* the duplicate structurally impossible rather than merely absent this */
/* month:                                                               */
/*                                                                      */
/*   · a chapter with no shipped page is itself, at its own fragment,   */
/*     under its own title;                                             */
/*   · a chapter whose section HAS shipped takes that page's label and  */
/*     that page's path, because the page is now the better answer to   */
/*     the same question;                                               */
/*   · a shipped page that answers no chapter is appended, in nav       */
/*     order, because nothing above it is going to print it.            */
/*                                                                      */
/* One entry per destination at every stage of the phase plan, and the  */
/* day `/about` ships the overlay re-points itself with no edit here.   */
/* ------------------------------------------------------------------ */
export type ContentsEntry = {
  /** The chapter this entry stands for: the key the reading observer marks. */
  anchor: string;
  /** What is printed. The chapter's own title, unless a page has taken over. */
  label: string;
  href: string;
  /** True when the entry points at a page rather than at a chapter. */
  live: boolean;
  /** Whether the reader is ON this entry's page right now. */
  current: boolean;
  /** A bare `#fragment`, which is the only case the delegated scroller owns. */
  inPage: boolean;
};

export function contentsEntries(
  chapters: readonly { id: string; index: number; title: string }[],
  route: string,
): ContentsEntry[] {
  /*
    Only LIVE sections are indexed. A section still re-pointed at a chapter IS
    that chapter, and entering it here would put it back in the list twice,
    which is the whole thing this function exists to prevent.
  */
  const shipped = new Map<string, NavItem>();
  for (const item of navItems) {
    if (LIVE_ROUTES.has(item.href)) shipped.set(sectionAnchor(item.href), item);
  }

  const entries: ContentsEntry[] = chapters.map((c) => {
    const page = shipped.get(c.id);
    if (!page) {
      return {
        anchor: c.id,
        label: c.title,
        href: homeAnchorHref(c.id, route),
        live: false,
        current: false,
        inPage: route === "/",
      };
    }
    /* claimed, so the sweep below does not append it a second time */
    shipped.delete(c.id);
    return {
      anchor: c.id,
      label: page.label,
      href: page.href,
      live: true,
      current: route === page.href,
      inPage: false,
    };
  });

  /* Walked in `navItems` order rather than in the map's, so the tail of the
     contents page is in the order the sections are declared, not in whatever
     order the chapters happened to claim them. */
  for (const item of navItems) {
    const a = sectionAnchor(item.href);
    if (!shipped.has(a)) continue;
    shipped.delete(a);
    entries.push({ anchor: a, label: item.label, href: item.href, live: true, current: route === item.href, inPage: false });
  }

  return entries;
}

/**
 * The primary control's destination. `content/nav.ts` states it as the home
 * chapter `#join`; a page that carries its own version of that act states its
 * own fragment instead and this is never consulted.
 */
export function homeAnchorHref(anchor: string, route: string): string {
  const id = anchor.replace(/^#/, "");
  return route === "/" ? `#${id}` : `/#${id}`;
}
