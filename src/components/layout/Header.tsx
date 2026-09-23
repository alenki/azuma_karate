"use client";

import "@/styles/sections/chrome.css";

import Link from "next/link";
import { AnimatePresence, motion, useIsPresent, useMotionValueEvent, usePresenceData, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useEffectEvent, useId, useRef, useState, type CSSProperties, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { cta, navItems } from "@/content/nav";
import { contentsEntries, homeAnchorHref, sectionLink, type ContentsEntry } from "@/lib/sections";
import { club } from "@/content/schedule";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useActiveChapter } from "./ChapterContext";
import { EASE_INOUT, EASE_OUT } from "@/lib/ease";
import { useStillness } from "@/lib/useStillness";

// `lang` and `switchTo` used to live here too, for the RU | EN toggle that
// stood in the bar's aside. Both went with the English edition.
const t = { menu: "Меню", close: "Закрыть", skip: "К содержанию" };

export type ChapterLink = { id: string; index: number; title: string };

/*
  THE PRINTED SECTIONS ARE CHAPTERS, NOT ROUTES.

  `navItems` points at /about, /schedule, /trainers, /achievements and
  /contacts, and the app has exactly one route, so all five would be 404s
  printed three times over — the bar, the contents page, the colophon. The map
  that re-points a label at the chapter which already answers it lives in
  `lib/sections.ts`, together with the list of sections that have stopped
  needing it, which is empty this month.

  The consequence for this file is that a chapter link is not always a bare
  fragment. The day one of the five ships, it has to carry the home path with
  it off the home page, or «О клубе» over there points at nothing — which is why
  `route` is a prop. See the note in `lib/sections.ts` on why it is passed
  rather than read from `usePathname()`.
*/

/** Re-exported for the colophon, which has imported it from here since before
 *  the map moved out. The map itself lives in lib/sections. */
export { sectionAnchor } from "@/lib/sections";

/*
  PUTTING THE CONTENTS PAGE AWAY.

  The close used to fade the whole sheet on the arrival curve, which spends
  most of the fade in its first few frames: at ~70ms the six entries stood at
  ~40% over the chapter's own display lines, two layers of Prata printed on one
  another, and by ~170ms the sheet was gone. It read as a flicker, not a close.

  Display type on this page never fades. It rises out of its own line
  (ui/LineReveal), so the entries leave the same way, set back into that line:
  each word sinks under its mask on the travel curve, outward from whatever the
  reader touched, and the touched unit stands a beat and goes last. Only once
  every glyph is under its mask does the blank paper clear, with the bar
  (globals.css), on the arrival curve, because what arrives is the page. No
  frame holds two layers of display type.

  `from` is the stack position touched: -1 the bar (the handle, Escape, the
  bar's own press), 0..n-1 an entry, n the foot's press. An exiting child's
  props are frozen at its last present render, so this reaches the sheet
  through AnimatePresence's `custom` and is read back with usePresenceData().
*/
type Leave = {
  /* hand: never mind. link: the page is about to travel. shut: the handle has
     just stopped being printed (>= 1280), and nobody asked for a close */
  kind: "hand" | "link" | "shut";
  from: number;
  /* useStillness() at the close. `reducedMotion="user"` does not reach a
     transform string or opacity, so stillness is decided here */
  still: boolean;
};

/* seconds, because Motion counts in seconds */
const STEP = 0.02; // between two neighbours letting go
const SINK = 0.18; // one word back under its line
/* EASE_INOUT is at 98.4% here: 1.23em of the 1.25em travel puts the ink
   (-0.07em..1.10em) under the mask (-0.12em..1.16em, chrome.css 2b) */
const CLEARED = 0.87;
const HOLD = 0.1; // the touched unit stands alone, ruled, then goes last
const FOOT = 0.13; // the foot's fade. n * STEP + FOOT must stay under settleAt(n)
const GROUND = 0.28; // the blank paper and the bar clearing together
const STILL = 0.12; // the whole close, for a reader who asked for stillness

/* The raw transform string, not y/rotate: Motion hands `transform` to WAAPI,
   so the sink runs on the compositor beside Lenis's travel. The same function
   list at both ends, or the browser cannot interpolate it. */
const SET = "translateY(0%) rotate(0deg)";
const SUNK = "translateY(125%) rotate(1.5deg)"; // LineReveal's start, reached from the other side

/** When the paper may start to clear: the last word's ink is under its mask. 0.26 with six entries. */
const settleAt = (n: number) => Math.ceil((Math.max(HOLD, (n - 1) * STEP) + CLEARED * SINK) * 100) / 100;
/** Outward from the touch: its neighbours first, the touched unit itself last. */
const letGo = (u: number, l: Leave) => {
  const d = Math.abs(u - l.from);
  return d === 0 ? HOLD : (d - 1) * STEP;
};
const cut = (l: Leave) => l.still || l.kind === "shut";
const GONE = { opacity: 0, transition: { duration: 0 } };

const wordGone = (u: number) => (l: Leave) =>
  cut(l) ? GONE : { transform: SUNK, transition: { duration: SINK, delay: letGo(u, l), ease: EASE_INOUT } };
const footGone = (u: number) => (l: Leave) =>
  cut(l) ? GONE : { opacity: 0, transition: { duration: FOOT, delay: letGo(u, l), ease: EASE_INOUT } };
const groundGone = (at: number) => (l: Leave) => ({
  opacity: 0,
  /* pointer-events is NOT here: Motion sets a value it cannot animate at the
     start of the exit, not at its delay (measured). chrome.css releases it
     from `data-leaving` on `--menu-let-go` instead. */
  transition:
    l.kind === "shut"
      ? { duration: 0 }
      : l.still
        ? { duration: STILL, ease: "linear" as const }
        : { duration: GROUND, delay: at, ease: EASE_OUT },
});
const ms = (s: number) => `${Math.round(s * 1000)}ms`;

export function Header({ chapters, route = "/", ctaHref }: { chapters: ChapterLink[]; route?: string; ctaHref?: string }) {
  const { active, ground } = useActiveChapter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [leave, setLeave] = useState<Leave>({ kind: "hand", from: -1, still: false });
  const still = useStillness();

  /* one entry per destination, chapters merged with whatever has shipped as a
     page: the argument is in lib/sections. Derived during render rather than
     memoised, because it is six array entries off two module constants. */
  const entries = contentsEntries(chapters, route);
  const groundAt = settleAt(entries.length);
  const askHref = ctaHref ?? homeAnchorHref(cta.href, route);

  /*
    EVERY CLOSE GOES THROUGH HERE, and focus is decided BEFORE the commit that
    makes the leaving sheet aria-hidden and inert: AnimatePresence keeps it
    painted for its exit, and focus left inside it would be refused.

      · hand: back to the handle. That covers Escape from an entry, and
        Safari's tap, which never focuses the button and leaves focus on the
        dialog.
      · link: let go of it. useAnchorScroll moves it to the chapter; for a
        reader who asked for stillness it steps aside, and the native jump
        sets the Tab starting point on the chapter. Focusing the handle here
        would send that reader back to the hero on their next Tab.
      · shut: to the first entry the bar now prints, because the handle has
        just stopped being printed.

    `leave` is set in the SAME batch as `open`: Motion never re-resolves an
    exit that is already running (motion-dom, animation-state).
  */
  const putAway = (kind: Leave["kind"], from: number) => {
    if (!open) return;
    const panel = menuRef.current;
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const inside = !!panel && !!focused && panel.contains(focused);
    if (kind === "hand") {
      if (inside || !focused || focused === document.body) toggleRef.current?.focus({ preventScroll: true });
    } else if (inside) {
      const next = kind === "shut" ? document.querySelector<HTMLElement>(".site-header__nav a") : null;
      if (next) next.focus({ preventScroll: true });
      else focused?.blur();
    }
    setLeave({ kind, from, still });
    setOpen(false);
  };
  const onEscape = useEffectEvent(() => putAway("hand", -1));
  const onWide = useEffectEvent(() => putAway("shut", -1));

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  /*
    THE CONTENTS PAGE CLOSES WHEN ITS HANDLE STOPS BEING PRINTED.

    From 1280 up the five entries are printed in the bar and the handle is not
    printed at all (chrome.css §2a). Without this, a reader who opens the
    contents on a phone and rotates it — or drags a desktop window wider — is
    sealed inside a modal whose only visible control has just vanished: the
    panel is `inset-0`, `aria-modal` tells assistive technology to ignore
    everything outside it, the trap holds Tab inside it, and the toggle that
    would close it is `display: none`. Escape still works, which is not a thing
    a reader can be expected to know.

    THIS EFFECT AND THAT MEDIA QUERY ARE ONE DECISION. If the handle is ever
    printed at every width again — and it has been, twice — delete this with
    it, or a desktop reader who opens the contents page will watch it shut the
    moment they resize the window by a pixel across 1280.

    Listened for only while the page is open, so it can never try to close a
    page that is not there, and the old check on mount went with that: the
    handle is not printed from 1280, so the page cannot be opened there. It is
    a cut and not a close (putAway("shut")), because nobody asked for it.
  */
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 1280px)");
    const shut = () => {
      if (wide.matches) onWide();
    };
    wide.addEventListener("change", shut);
    return () => wide.removeEventListener("change", shut);
  }, [open]);

  /*
    The overlay declares `aria-modal`, which tells assistive technology to
    ignore everything outside it — so it has to behave like a modal, not just
    say it is one. Under 1280 the handle is the reader's only navigation and
    the panel is a keyboard surface like any other, so three things have to
    hold:

      · focus moves INTO the dialog when it opens. Left on the toggle, focus
        would sit in <header>, a sibling of the dialog and therefore outside
        the subtree AT is told to read.
      · Tab wraps inside it. The dialog is the last node in the fragment, so
        without a trap Tab walks out of it into <main> — visually covered by
        the panel and hidden from AT.
      · focus leaves it on close. That is decided in putAway(), before the
        commit that makes the leaving sheet aria-hidden and inert, and not in
        this cleanup: the cleanup runs while AnimatePresence still holds the
        focused node, so an «is focus on <body>?» test here never fired on
        Escape, and focus fell to <body> when the node unmounted.

    Escape stays on `window`: it must fire wherever focus happens to be.
  */
  useEffect(() => {
    if (!open) return;
    const opener = toggleRef.current;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /*
      The focus scope. It is the toggle PLUS the panel's own tabbables, in
      document order — the toggle is the visible «Закрыть» / "Close", it sits in
      <header> rather than in the dialog, and a trap that excluded it would put
      the one control that closes the panel out of reach of the keyboard.
    */
    const tabbables = () => {
      const inPanel = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);
      return opener ? [opener, ...inPanel] : inPanel;
    };

    /* The panel mounts with AnimatePresence, so wait a frame for its children.
       Focus lands on the panel itself (tabIndex -1) rather than its first link,
       so the dialog's own label is announced before its contents. */
    const focusFirst = requestAnimationFrame(() => menuRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = tabbables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const activeInside = nodes.includes(document.activeElement as HTMLElement) || menuRef.current === document.activeElement;
      if (!activeInside) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(focusFirst);
      /* Released at the START of the exit, on purpose. A link's travel needs
         Lenis running in this same click (useAnchorScroll), and a reader who
         flicks the page while the paper clears must get their scroll. By now
         the leaving sheet is aria-hidden and its contents are inert. */
      lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  return (
    <>
      <a href="#main" className="skip-link t-mono">
        {t.skip}
      </a>
      <header
        className={cn(
          "site-header fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-500",
          scrolled && !open && "site-header--scrolled",
          open && "site-header--open",
          /*
            The bar takes the ground of whatever is behind it. Without this a
            cream header floats over the three ink blocks — chapters 五 and 十
            and the footer — for ~4600px of the scroll, which reads as a bug
            rather than as chrome. The menu is always paper, so an open menu
            wins over the ground it happens to be standing on.

            While it is being put away, the bar's transition is retimed from
            globals.css, keyed on the leaving sheet, and not here.
          */
          ground === "ink" && !open && "site-header--ink",
        )}
        style={
          {
            /* the clock the bar's handoff runs on while the contents page is put
               away (globals.css), written from the constants that time the sheet */
            "--menu-ground-at": still ? "0ms" : ms(groundAt),
            "--menu-ground": ms(still ? STILL : GROUND),
            "--menu-ground-ease": still ? "linear" : "var(--ease-out)",
          } as CSSProperties
        }
      >
        {/*
          Three bands on one grid — see chrome.css §1. Ranged left / centred /
          ranged right, and it is the NAV that stands in the middle band now,
          on the sheet's own centre line rather than tucked against the
          wordmark. The running head that used to be printed there is gone:
          on a full-bleed sheet the bar was carrying the entries, a chapter
          announcement and the cluster at once, and the announcement was the
          only one of the three the reader could not act on.
        */}
        <div className="site-header__bar wrap">
          <div className="site-header__lead">
            <Link href="/" className="site-header__brand shrink-0">
              <Logo />
            </Link>
          </div>

          {/* five chapter anchors — see lib/sections. Because they resolve to
              somewhere real they can also say where the reader is, which five
              dead links could not: a chapter link marks itself `location`
              while the reader is inside that chapter, and a section that has
              shipped as a page marks itself `page` while the reader is on it.

              PRINTED FROM 1280 ONLY, and that is done in chrome.css §1 — NOT
              with a `hidden xl:flex` here. The band sets `display` from an
              unlayered stylesheet, and an unlayered rule beats a layered
              utility however specific: the utility would have lost and the
              labels would have printed on a 390 sheet. Same trap as the press
              and the contents handle. */}
          <nav aria-label="Основная навигация" className="site-header__nav">
            {navItems.map((item) => {
              const link = sectionLink(item.href, route);
              const mark = link.live
                ? link.current
                  ? ("page" as const)
                  : undefined
                : route === "/" && active?.id === link.anchor
                  ? ("location" as const)
                  : undefined;
              /* a bare fragment is the delegated scroller's business (it travels
                 rather than teleports); anything with a path is a navigation and
                 belongs to the router, so it is a <Link> and is prefetched */
              return link.inPage ? (
                <a key={item.href} href={link.href} className="nav-link t-mono" aria-current={mark}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={link.href} className="nav-link t-mono" aria-current={mark}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="site-header__aside">
            {/*
              PRINTED UNDER 1280 ONLY, and that is done in chrome.css §2a —
              NOT with an `xl:hidden` here. `.menu-toggle` sets `display` from
              an unlayered stylesheet and an unlayered rule beats a layered
              utility, so the class would have lost and the handle would have
              printed next to the very labels it opens (the same trap that put
              the press on a 390 sheet — see chrome.css §1).

              1280 is where the nav beside the wordmark starts printing. Above
              that line the bar already carries the five entries, so a handle
              is a second route to them standing beside the first; below it,
              it is the only route there is.

              The overlay's other block — the ten numbered chapters — goes with
              it, and that is the cost of this: on a wide sheet nothing lists
              the chapters, and the colophon lists the same five sections the
              bar does. §2a carries the argument in full.
            */}
            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls={menuId}
              /*
                THE NAME IS ON THE BUTTON, because nothing inside it is text.

                The handle used to print «Меню» beside its mark and that word
                was the accessible name. The mark is the whole control now, so
                the name has to be stated here or the button is announced as
                «кнопка» and nothing else. It states the ACTION the press
                performs, which is why it flips with `open`: «Закрыть» while
                the contents page is up, «Меню» while it is not, matching what
                the two rules are drawing.
              */
              aria-label={open ? t.close : t.menu}
              onClick={() => (open ? putAway("hand", -1) : setOpen(true))}
            >
              {/*
                Two rules, and that is the whole handle. It was the manual's
                binding before this — one hairline per chapter, the chapter
                being read drawn full length — which stated where the reader
                was as well as what the control opened, and cost the bar a word
                and 28px of stack to do it. On a phone that is the wrong trade:
                the running head and the contents page both say where the
                reader is, and the bar's job there is to be pressable.

                The rules cross into an X when the page opens, which is the only
                close mark left once the word is gone. Ornament, so the pair is
                aria-hidden and the name is the label above.
              */}
              <span className="menu-toggle__binding" aria-hidden="true">
                <span className="menu-toggle__leaf" />
                <span className="menu-toggle__leaf" />
              </span>
            </button>
            {/*
              The RU | EN toggle stood here: two tokens either side of a
              hairline rule, the language you were reading inert beside the one
              you could go to. With one edition there is nothing to switch to,
              and a toggle whose only state is the current one is furniture
              claiming to be a control, so it is gone rather than disabled.
            */}
            {/*
              The press, welded into the corner of the sheet — flush with the
              top trim and with the right one (chrome.css §1). It is LAST in the
              band because that is what lets it sit in the corner at all, and
              the reading order and the tab order are therefore the same.

              `seal={false}`: this instance is fixed on screen in every chapter
              at every scroll position, and the vermilion square is one of the
              three jobs red has on this page. An accent that is never absent is
              not an accent — the same argument that took the red out of the
              wordmark. The seal is spent on the two controls that are actually
              being pressed, in chapter 一 and chapter 十.

              It is not printed below 768 and that is done in chrome.css, not
              with a `hidden md:inline-flex` here: `.btn-press` sets `display`
              from an unlayered stylesheet, and an unlayered rule beats
              Tailwind's layered `hidden` — the slab printed on a 390 sheet and
              drove through the lockup.
            */}
            {/* Unset, the control is the home chapter, and off the home page it
                carries the home path with it — «Записаться» belongs to 六 Запись.
                `ctaHref` is the override for a page that carries its own version
                of the ask rather than sending a reader back to 六 for it.

                Printed beside the handle from 768 to 1279, so it can be pressed
                with the contents page open. It puts the page away as it goes;
                before, it travelled the manual under a sheet that stayed up. */}
            <Button
              href={askHref}
              seal={false}
              className="site-header__cta"
              onClick={open ? () => putAway("link", -1) : undefined}
            >
              {cta.label}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence custom={leave}>
        {open && (
          <ContentsSheet
            key="contents"
            id={menuId}
            sheetRef={menuRef}
            entries={entries}
            route={route}
            activeId={active?.id}
            askHref={askHref}
            groundAt={groundAt}
            onLeave={putAway}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/*
  The contents page as its own component, for one reason: it reads the presence
  context, so it re-renders the moment it starts leaving, even though
  AnimatePresence goes on rendering the element it last had, props frozen. That
  re-render is what prints inert, aria-hidden and the touched entry's rule.

  THE CONTENTS PAGE IS SIX WORDS AND THE ASK.

  It was three blocks: the five section labels set large, the six numbered
  chapters under «Содержание», and the club's particulars. With `LIVE_ROUTES`
  empty the first two lists resolve to the same six anchors, so the sheet
  printed eleven links to six places, five of them twice, numbered by two
  schemes that disagreed and named by two vocabularies that also disagreed. It
  did not fit a 390 sheet either: 971px of contents in 844px of viewport, which
  put the club, both social links and the one control the page is asking for
  below the fold of a panel the reader had to scroll to find them.

  What is left is what a contents page is: the chapters, once each, set in the
  book's own face at the size the sheet can hold. `contentsEntries()` merges the
  two lists on the anchor they share, so the duplicate cannot come back and a
  section that ships as a page re-points its own entry (lib/sections).

  The numerals went with the second list. A phone prints no chapter numeral
  anywhere — `.chapter__rail` is `display: none` below 768 because the binding
  margin is 20px there and the glyph will not fit in it — so a 一 beside
  «Первая черта» here would be the only one on the sheet, teaching a counting
  system the rest of the phone does not use. The folios `01`…`06` would say the
  same thing twice as digits. Six words, in the order they are printed in: the
  order IS the numbering.
*/
function ContentsSheet({
  id,
  sheetRef,
  entries,
  route,
  activeId,
  askHref,
  groundAt,
  onLeave,
}: {
  id: string;
  sheetRef: RefObject<HTMLDivElement | null>;
  entries: ContentsEntry[];
  route: string;
  activeId?: string;
  askHref: string;
  groundAt: number;
  onLeave: (kind: Leave["kind"], from: number) => void;
}) {
  const present = useIsPresent();
  const data = usePresenceData() as Leave | undefined;
  const leaving = present ? undefined : data;
  /* the entry the reader touched, ruled while the rest clear round it */
  const chosen = leaving?.kind === "link" && !leaving.still ? leaving.from : null;
  const n = entries.length;

  return (
    <motion.div
      id={id}
      ref={sheetRef}
      role="dialog"
      aria-label={t.menu}
      /* leaving, it stops walling off the page and leaves the AT tree at once */
      aria-modal={present ? true : undefined}
      aria-hidden={present ? undefined : true}
      tabIndex={present ? -1 : undefined}
      /* the switch globals.css retimes the bar on, set only while an asked-for close runs */
      data-leaving={leaving && leaving.kind !== "shut" ? leaving.kind : undefined}
      /* z-45: under the head bar (z-50), whose toggle closes the sheet */
      className="menu fixed inset-0 z-[45] ground-paper"
      /* when the leaving paper stops catching taps: as it starts to clear */
      style={{ "--menu-let-go": leaving?.still ? "0ms" : ms(groundAt) } as CSSProperties}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      variants={{ gone: groundGone(groundAt) }}
      exit="gone"
      transition={{ duration: 0.3, ease: EASE_OUT }}
    >
      {/* inert contents on a live ground: a tap on a word lands on blank paper
          and stops there until the paper starts to clear, never on a page link
          hidden (and on the link path, moving) under it */}
      <div className="menu__inner wrap" inert={!present}>
        <nav aria-label={t.menu} className="menu__nav">
          {entries.map((e, i) => {
            /* The same two marks the bar makes, for the same two
               questions: `page` while the reader is on that section's
               own route, `location` while they are inside the chapter it
               stands for. Drawn as the entry's own underline printed in
               ink, never as a colour: see globals.css. */
            const mark = e.live
              ? e.current
                ? ("page" as const)
                : undefined
              : route === "/" && activeId === e.anchor
                ? ("location" as const)
                : undefined;
            const ruled = chosen === i ? "" : undefined;
            const pick = () => onLeave("link", i);
            /* The word in its own line, as every display line on the page is
               (chrome.css 2b). At rest from mount (`initial={false}`), so the
               open is untouched; its transition serves only a re-open, which
               lifts it back out of the line. */
            const body = (
              <span className="menu__mask">
                <motion.span
                  className="menu__word"
                  initial={false}
                  animate={{ transform: SET, opacity: 1 }}
                  variants={{ gone: wordGone(i) }}
                  exit="gone"
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                >
                  {e.label}
                </motion.span>
              </span>
            );
            return (
              /* the open's rise, unchanged. No exit: the row neither leaves nor holds the unmount */
              <motion.div
                key={e.anchor}
                className="menu__row"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.05 + i * 0.05, ease: EASE_OUT }}
              >
                {e.inPage ? (
                  <a href={e.href} className="menu__link t-display" aria-current={mark} data-chosen={ruled} onClick={pick}>
                    {body}
                  </a>
                ) : (
                  <Link href={e.href} className="menu__link t-display" aria-current={mark} data-chosen={ruled} onClick={pick}>
                    {body}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/*
          The foot. The address stood here as plain text and it is gone:
          it is not actionable from a menu, and 三 Расписание and the
          colophon both set the club's particulars in full, the colophon
          with the map link on them. The two social links stay because
          they ARE actionable and they are the fastest route out of the
          page to the club. Then the ask, across the trim.
        */}
        <motion.div
          className="menu__foot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          variants={{ gone: footGone(n) }}
          exit="gone"
          transition={{ duration: 0.6, delay: 0.05 + n * 0.05, ease: EASE_OUT }}
        >
          <div className="menu__refs">
            <a href={club.telegram} className="btn-text">
              Telegram
            </a>
            <a href={club.instagram} className="btn-text">
              Instagram
            </a>
          </div>
          <Button href={askHref} size="lg" className="menu__act" onClick={() => onLeave("link", n)}>
            {cta.label}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
