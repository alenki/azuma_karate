"use client";

import "@/styles/sections/chrome.css";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { cta, navItems } from "@/content/nav";
import { homeAnchorHref, sectionLink } from "@/lib/sections";
import { club } from "@/content/schedule";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useActiveChapter } from "./ChapterContext";
import { EASE_OUT } from "@/lib/ease";

// `lang` and `switchTo` used to live here too, for the RU | EN toggle that
// stood in the bar's aside. Both went with the English edition.
const t = { menu: "Меню", close: "Закрыть", contents: "Содержание", skip: "К содержанию" };

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

export function Header({ chapters, route = "/", ctaHref }: { chapters: ChapterLink[]; route?: string; ctaHref?: string }) {
  const { active, ground } = useActiveChapter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

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
  */
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1280px)");
    const shut = () => {
      if (wide.matches) setOpen(false);
    };
    shut();
    wide.addEventListener("change", shut);
    return () => wide.removeEventListener("change", shut);
  }, []);

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
      · focus returns to the toggle on close, so the reader carries on from
        where they were instead of restarting at the skip link.

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
        setOpen(false);
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
      lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      /* Return focus to the opener, unless something else already took it.
         Closing by Escape or by clicking a chapter link both unmount the node
         focus was on, which drops it to <body>; from there the next Tab would
         restart at the skip link. Closing by pressing the toggle leaves focus
         on the toggle already, and this is then a no-op. */
      if (!document.activeElement || document.activeElement === document.body) opener?.focus();
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
          */
          ground === "ink" && !open && "site-header--ink",
        )}
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
              className="menu-toggle t-mono"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
            >
              {/*
                The handle's mark is the manual's binding: one hairline per
                chapter, stacked like the edges of ten leaves, with the chapter
                the reader is in drawn full length. So the control says both
                what it opens and where the reader is — and it says the second
                by length and weight, never by hue (1.4.1, and red has three
                jobs on this page and this is not one of them).

                `--i` is the leaf's index, which is what lets the stack close
                onto its first leaf when the contents page opens: see
                chrome.css §2a. Ornament, so the whole stack is aria-hidden and
                the accessible name is the word beside it.
              */}
              <span className="menu-toggle__binding" aria-hidden="true">
                {chapters.map((c, i) => (
                  <span
                    key={c.id}
                    style={{ "--i": i } as CSSProperties}
                    className={cn("menu-toggle__leaf", active?.id === c.id && "menu-toggle__leaf--here")}
                  />
                ))}
              </span>
              <span className="menu-toggle__label">{open ? t.close : t.menu}</span>
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
                of the ask rather than sending a reader back to 六 for it. */}
            <Button href={ctaHref ?? homeAnchorHref(cta.href, route)} seal={false} className="site-header__cta">
              {cta.label}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            ref={menuRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={t.menu}
            className="menu fixed inset-0 z-40 ground-paper overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            {/*
              The contents page. Three blocks — the entries, the chapters,
              the club's particulars — flattened out of the old column-inside-
              a-column so chrome.css can stand each of them on the page grid
              once the sheet is wide enough to hold three verticals.
            */}
            <div className="menu__inner wrap">
              <nav aria-label={t.menu} className="menu__nav">
                {navItems.map((item, i) => {
                  const link = sectionLink(item.href, route);
                  const body = (
                    <>
                      <span className="menu__index t-mono">{String(i + 1).padStart(2, "0")}</span>
                      {item.label}
                    </>
                  );
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.05 + i * 0.05, ease: EASE_OUT }}
                      className="border-b border-rule"
                    >
                      {link.inPage ? (
                        <a href={link.href} className="menu__link t-display" onClick={() => setOpen(false)}>
                          {body}
                        </a>
                      ) : (
                        <Link href={link.href} className="menu__link t-display" onClick={() => setOpen(false)}>
                          {body}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </nav>

              <div className="menu__contents">
                <p className="menu__contents-label t-mono text-ink-2">{t.contents}</p>
                <ol className="menu__contents-list">
                  {/* the contents page lists the MANUAL, which is the home page,
                      from wherever it is opened — so off the home page each
                      entry carries the home path with it */}
                  {chapters.map((c) => (
                    <li key={c.id}>
                      <a
                        href={homeAnchorHref(c.id, route)}
                        className="menu__chapter t-caption"
                        onClick={() => setOpen(false)}
                      >
                        <span className="menu__chapter-no">{String(c.index).padStart(2, "0")}</span>
                        {c.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="menu__foot">
                <div className="menu__where t-caption">
                  <span>{club.city}, {club.address}</span>
                  <a href={club.telegram} className="btn-text self-start">Telegram</a>
                  <a href={club.instagram} className="btn-text self-start">Instagram</a>
                </div>
                <Button href={ctaHref ?? homeAnchorHref(cta.href, route)} size="lg" onClick={() => setOpen(false)}>
                  {cta.label}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
