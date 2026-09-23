/**
 * The flyleaf's runtime: the count.
 *
 * It is not a module anyone imports to call. `Flyleaf.tsx` serialises this
 * function with `Function.prototype.toString` into an inline <script> placed
 * directly after the leaf's markup, so it runs while the HTML is still being
 * parsed: before the first paint of anything below it, and seconds before the
 * bundles React needs have arrived. That is the only way a loading screen can
 * be on screen from the first frame and still report on a load that React
 * itself is part of.
 *
 * Which fixes the dialect. The body is shipped as the compiler emits it, so it
 * must be self-contained (no imports, nothing closed over from module scope)
 * and plain enough that the compiler needs no helper for it: function
 * declarations, no optional chaining, no spread, no async.
 *
 * WHAT IT OWNS, and why it is not React. The leaf is printed by the server and
 * this script is the only thing awake early enough to run it, so its state
 * lives on `window.__flyleaf`; `lib/useFlyleafOpen.ts` is the React side of
 * that one fact. It never removes the leaf from the DOM (React owns the node
 * and would trip over a missing child on its next pass). It only sets
 * attributes on the leaf, `data-live`, `data-still`, `data-n` and
 * `data-stage`, which carries `suppressHydrationWarning`, and it moves the
 * numeral with the Web Animations API, which writes no attribute at all.
 */

export type FlyleafConfig = {
  /** The window event `lib/useFlyleafOpen.ts` listens for. */
  event: string;
  /** CSS easing strings built from lib/ease, never restated here. */
  ease: { out: string; inout: string; press: string; push: string };
  /** The shortest interval between two counts, in ms. */
  beat: number;
  /** 九 to 十: the last two are said together, «ку, ДЗЮ». */
  last: number;
  /** 十 is struck, on the press curve. */
  stamp: number;
  /** and held, the count finished. */
  hold: number;
  /** The push toward the reader that the cut to the page rides on. */
  push: number;
  /** A held count gathers tension over this long. */
  swell: number;
  /** Reduced motion: the numeral fades, then the paper. */
  fade: number;
  /** Before this, input is not taken as a request to skip (trackpad inertia). */
  grace: number;
  /** From navigation start, the longest the leaf will wait for a slow page. */
  wait: number;
  /**
   * How much of the count each piece of evidence releases. `head` is released
   * at once. They sum to less than 1 on purpose: 十 is not earned by any of
   * them, only by all of them together with hydration.
   */
  share: { head: number; dom: number; load: number; plate: number };
};

export function runFlyleaf(cfg: FlyleafConfig) {
  const w = window;
  const d = document;
  const leaf = d.getElementById("flyleaf");
  const state: { open: boolean; ready?: () => void } = { open: false };
  w.__flyleaf = state;

  function announce() {
    if (state.open) return;
    state.open = true;
    w.dispatchEvent(new Event(cfg.event));
  }

  /* Counted on every full load, reloads included: it covers the page until
     the page is ready, whoever is loading it and however many times. */
  if (!leaf) {
    announce();
    return;
  }
  const sheet = leaf;
  const num = sheet.querySelector(".flyleaf__num") as SVGGElement | null;

  /* A reader who asked for stillness gets the same count with nothing moving:
     the numerals change in place, and at the end they fade, then the paper. */
  const still = !!(w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (still) sheet.setAttribute("data-still", "");

  /* Armed, and already on 一. The leaf is `display: none` until `data-live`,
     so a reader without JavaScript, or behind a policy that blocks inline
     script, never meets a cover nothing will ever lift. */
  sheet.setAttribute("data-n", "1");
  sheet.setAttribute("data-live", "");

  function stage(name: string) {
    sheet.setAttribute("data-stage", name);
  }

  /* ---- the evidence ----------------------------------------------------
     Four things say the page has arrived: the document is parsed, the window
     has loaded with its fonts settled, the first screen's plate is decoded
     (so the leaf never opens on a half-painted hall), and React has hydrated
     (FlyleafCue), without which the page's entrances cannot run. None of them
     reports a percentage, so each releases a share of the count. */
  const met = { dom: d.readyState !== "loading", load: false, plate: false, ready: !!w.__flyleafReady };
  const s = cfg.share;
  function released() {
    return s.head + (met.dom ? s.dom : 0) + (met.load ? s.load : 0) + (met.plate ? s.plate : 0);
  }
  /* What the count may reach while it waits: everything released, plus a
     creep towards half of what is still owed. So a slow page still counts on,
     slowly, and never reaches 十 on creep alone. The creep is CARRIED when
     evidence arrives, never restarted, or the count would stall at exactly
     the moment the page moved on. */
  let base = s.head;
  let since = w.performance.now();
  function reachable(now: number) {
    return base + (1 - base) * 0.5 * (1 - Math.exp(-Math.max(0, now - since) / 2500));
  }
  function mark(which: "dom" | "load" | "plate" | "ready") {
    if (met[which]) return;
    const now = w.performance.now();
    const carried = reachable(now);
    met[which] = true;
    /* hydration releases no share of its own: it is one of the keys to 十 */
    if (which === "ready") return;
    base = Math.max(released(), carried);
    since = now;
  }
  state.ready = function () {
    mark("ready");
  };

  function settle(img: HTMLImageElement) {
    /* either outcome settles it: a plate that failed is not worth waiting on */
    const done = function () {
      mark("plate");
    };
    if (img.decode) img.decode().then(done, done);
    else if (img.complete) done();
    else {
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    }
  }
  function parsed() {
    mark("dom");
    /* the plate is the one image the first screen is fetched with priority */
    const plate = d.querySelector('img[fetchpriority="high"]') as HTMLImageElement | null;
    if (plate) settle(plate);
    else mark("plate");
  }
  if (met.dom) parsed();
  else d.addEventListener("DOMContentLoaded", parsed);

  function loaded() {
    const fonts = d.fonts && d.fonts.ready;
    const done = function () {
      mark("load");
    };
    if (fonts) fonts.then(done, done);
    else done();
  }
  if (d.readyState === "complete") loaded();
  else w.addEventListener("load", loaded);

  /* ---- the numeral ----------------------------------------------------
     Every count is a hard cut: the new numeral is simply there, a hair large,
     and settles. Held, while the page keeps the count waiting, it gathers a
     slow tension, like a stance held between two counts. 十 is the loud one:
     struck, with the press overshoot. */
  let anim: Animation | null = null;
  function move(frames: Keyframe[], opts: KeyframeAnimationOptions) {
    if (still || !num || !num.animate) return;
    if (anim) anim.cancel();
    anim = num.animate(frames, opts);
  }
  function land(n: number) {
    if (n < 10) {
      move(
        [
          { transform: "scale(1.03)", easing: cfg.ease.out },
          { transform: "scale(1)", offset: 0.06, easing: cfg.ease.inout },
          { transform: "scale(1.06)" },
        ],
        { duration: cfg.swell, fill: "forwards" },
      );
    } else {
      move([{ transform: "scale(1.1)" }, { transform: "scale(1)" }], {
        duration: cfg.stamp,
        easing: cfg.ease.press,
        fill: "forwards",
      });
    }
  }
  let shown = 1;
  let last = w.performance.now();
  land(1);
  function count(n: number) {
    shown = n;
    sheet.setAttribute("data-n", String(n));
    land(n);
  }

  /* ---- the cut ---------------------------------------------------------
     The page arrives the way every count did: as a cut. 十 is pushed toward
     the reader, gathering speed, and at the height of the push the leaf is
     gone and the hall is there. The page's own entrance (the plate settling
     back from its first scale, the bow and the strike rising) starts on that
     same frame, so the push carries across the cut into the page. */
  let lifted = false;
  function begin() {
    if (lifted) return false;
    lifted = true;
    release();
    return true;
  }
  function cut() {
    if (anim) anim.cancel();
    stage("gone");
    announce();
  }
  function fadeOut() {
    stage("fade");
    announce();
    w.setTimeout(function () {
      stage("gone");
    }, cfg.fade * 3);
  }
  function finish() {
    if (!begin()) return;
    if (still) return fadeOut();
    stage("push");
    move([{ transform: "scale(1)" }, { transform: "scale(1.18)" }], {
      duration: cfg.push,
      easing: cfg.ease.push,
      fill: "forwards",
    });
    w.setTimeout(cut, cfg.push);
  }
  /* asked for by the reader: no ceremony, the page at once */
  function skip() {
    if (!begin()) return;
    if (still) return fadeOut();
    cut();
  }

  /* ---- the page underneath stays where it is ---------------------------
     Not `overflow: hidden` on the root: on a desktop with classic scrollbars
     that removes the bar, and the sheet reflows 15px wider under the leaf and
     back again at the cut. The inputs are held instead, in the capture phase,
     so Lenis never hears them either.

     And every deliberate input after the grace is the reader asking to see
     the page: a click or tap, a wheel, a key, focus moving. A parent on a slow
     network is never held until the ceiling, and a focus ring is never drawn
     under paper. */
  const holdOpts = { passive: false, capture: true };
  const SCROLL_KEYS = [" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"];
  /* a modifier on its own is someone on their way to Ctrl+Tab or Alt+Tab,
     leaving the tab rather than asking to see it */
  const MODIFIERS = ["Shift", "Control", "Alt", "AltGraph", "Meta", "CapsLock", "OS", "Fn"];
  const armedAt = w.performance.now();
  function asked() {
    return w.performance.now() - armedAt > cfg.grace;
  }
  function hush(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (asked()) skip();
  }
  function hushKey(e: KeyboardEvent) {
    if (SCROLL_KEYS.indexOf(e.key) >= 0) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || MODIFIERS.indexOf(e.key) >= 0) return;
    if (asked()) skip();
  }
  /* The skip is the CLICK, not the pointerdown. A touch tap's click is hit-
     tested after the finger lifts; lifting on pointerdown would already have
     let go of the page, and the same tap would press whatever lay under the
     paper: the hero's «Записаться», the menu. The click still lands on the
     leaf, and goes no further. */
  function tapped(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (asked()) skip();
  }
  function focused() {
    skip();
  }
  w.addEventListener("wheel", hush, holdOpts);
  w.addEventListener("touchmove", hush, holdOpts);
  w.addEventListener("keydown", hushKey, true);
  w.addEventListener("click", tapped, true);
  w.addEventListener("focusin", focused, true);
  function release() {
    w.removeEventListener("wheel", hush, holdOpts);
    w.removeEventListener("touchmove", hush, holdOpts);
    w.removeEventListener("keydown", hushKey, true);
    w.removeEventListener("click", tapped, true);
    w.removeEventListener("focusin", focused, true);
  }

  /* A page restored from the back-forward cache is already open. */
  w.addEventListener("pageshow", function (e: PageTransitionEvent) {
    if (e.persisted && begin()) cut();
  });

  /* The watchdog. The count runs on animation frames, which is right (a tab
     opened in the background counts nothing until it is looked at) and also
     the one way it could stall: a VISIBLE page whose frames never come. So it
     is a heartbeat, not a deadline. A hidden tab is not stalled, it is
     unread: the watch waits until it is shown and gives the whole count time
     to run. A visible one whose frames are still arriving is fine. */
  let beat = -1;
  function watch() {
    if (lifted) return;
    if (d.visibilityState !== "visible") {
      d.addEventListener(
        "visibilitychange",
        function () {
          w.setTimeout(watch, cfg.beat * 10 + cfg.stamp + cfg.hold + 1000);
        },
        { once: true },
      );
      return;
    }
    if (beat >= 0 && w.performance.now() - beat < 1000) {
      w.setTimeout(watch, 1000);
      return;
    }
    skip();
  }
  w.setTimeout(watch, cfg.wait + 2000);

  /* ---- the count ------------------------------------------------------
     One numeral per tenth of the load, and never more than the load has
     done: 二 needs a tenth, 九 needs eight, 十 needs everything. The counts
     keep a dojo's rhythm, never closer than a beat, so a cached page still
     gets all ten, and a slow one holds each count as long as it has to. */
  function frame(now: number) {
    if (lifted) return;
    try {
      beat = now;
      const ready = (met.dom && met.load && met.plate && met.ready) || now > cfg.wait;
      const earned = ready ? 10 : Math.min(9, 1 + Math.floor(reachable(now) * 10));
      const gap = shown === 9 ? cfg.last : cfg.beat;
      if (shown < earned && now - last >= gap) {
        last = now;
        count(shown + 1);
      }
      if (shown === 10) {
        w.setTimeout(finish, cfg.stamp + cfg.hold);
        return;
      }
      w.requestAnimationFrame(frame);
    } catch {
      /* anything that goes wrong in here opens the page rather than
         stranding the reader behind the leaf */
      skip();
    }
  }
  w.requestAnimationFrame(frame);
}
