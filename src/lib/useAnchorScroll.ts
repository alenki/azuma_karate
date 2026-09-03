"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { easeInOutCubic } from "./ease";

type AnchorScrollOptions = {
  /**
   * Extra pixels added to the landing position. Almost always 0: Lenis reads
   * the target's own `scroll-margin-top` (`.chapter` sets it to the header
   * height plus 1.5rem in globals.css) and subtracts it for us, so an offset
   * passed here would be counted a second time.
   */
  offset?: number;
};

/** Anything with its own scroll behaviour, or that is not a same-page jump. */
function isPlainLeftClick(event: MouseEvent) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/**
 * Makes every in-page anchor travel instead of teleport.
 *
 * The wheel is smoothed by Lenis, but a native anchor jump is not: the nav,
 * the contents menu, the mobile bar and each chapter's exit links all snapped
 * the page to their target in one frame, so the two ways of moving through
 * the manual felt like two different sites. This is one delegated listener on
 * the document rather than a handler on each of the fifteen links, so a
 * chapter can add an exit link and get the behaviour for nothing.
 *
 * Three things it is careful about:
 *
 *  - Focus. After the URL changes, Tab must continue from the target and not
 *    from the link. Focus is moved FIRST and with `preventScroll`, so the
 *    browser does not race Lenis to the same place; the target is given
 *    `tabindex="-1"` if it cannot hold focus on its own.
 *  - Reduced motion. The hook does nothing at all — no `preventDefault` —
 *    so the browser's own instant jump is what a reader who asked for
 *    stillness gets. (`SmoothScroll` does not even mount Lenis for them.)
 *  - A modifier or a middle click is a request for a new tab, and a link with
 *    a `target` or a `download` is not ours to intercept.
 */
export function useAnchorScroll({ offset = 0 }: AnchorScrollOptions = {}) {
  const lenis = useLenis();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!lenis || reduced) return;

    const onClick = (event: MouseEvent) => {
      if (!isPlainLeftClick(event)) return;

      const node = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(node instanceof HTMLAnchorElement)) return;
      if (node.hasAttribute("download")) return;
      if (node.target && node.target !== "_self") return;

      /* Same document, same query — only the fragment may differ. */
      const url = new URL(node.href);
      const here = window.location;
      if (url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search) return;

      const id = decodeURIComponent(url.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id) ?? document.getElementsByName(id)[0];
      if (!(target instanceof HTMLElement)) return;

      event.preventDefault();

      if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) {
        /*
          A chapter is a <section>: it cannot hold focus until we say it can.
          Saying so also makes it match `[tabindex]:focus-visible` in
          primitives.css, which would ring an entire 2000px chapter in 2px of
          vermilion — a rule written for controls, drawn around a box no one
          can tab to. The ring belongs to the link that was activated; the
          destination is a landing place. Both the attribute and the
          suppression are handed back when focus leaves.
        */
        target.tabIndex = -1;
        target.style.outline = "none";
        target.addEventListener(
          "blur",
          () => {
            target.style.removeProperty("outline");
            target.removeAttribute("tabindex");
          },
          { once: true },
        );
      }
      target.focus({ preventScroll: true });

      /*
        A jump to the next chapter and a jump to the end of the book should
        not take the same time. The distance to travel is the target's own
        distance from the top of the viewport, which is what Lenis is about
        to close.
      */
      const travel = Math.abs(target.getBoundingClientRect().top);
      const scroll = () =>
        lenis.scrollTo(target, {
          offset,
          duration: Math.min(1.5, Math.max(0.75, 0.6 + travel / 2600)),
          easing: easeInOutCubic,
        });

      if (lenis.isStopped) {
        /*
          The contents overlay stops Lenis and locks the body while it is
          open, and starts it again in its own effect cleanup — but `start()`
          calls `reset()`, which would kill a scroll begun before it. So hand
          the page back here first (the overlay's own `start()` then finds
          nothing to do and cannot cancel us) and wait one frame for the body
          lock to lift, since a locked document cannot be scrolled at all.
        */
        lenis.start();
        requestAnimationFrame(scroll);
      } else {
        scroll();
      }

      /*
        `pushState` rather than `replaceState`: a native anchor click leaves a
        history entry, and Back should return the reader to where they were
        reading. Next's router integrates with the History API directly, so
        this stays a fragment change and never a navigation.
      */
      if (here.hash !== url.hash) window.history.pushState(null, "", url.hash);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis, reduced, offset]);
}
