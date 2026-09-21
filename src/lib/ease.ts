/**
 * The four curves the page moves on — one source, four jobs.
 *
 * The numbers are the same ones the `--ease-*` tokens carry in
 * `app/globals.css`. They are repeated here rather than read from the
 * custom properties because Motion needs a tuple and CSS needs a
 * `cubic-bezier()`, and no single value serves both; if a curve is ever
 * retuned, retune it in both places. What must NOT happen again is a component
 * writing `[0.16, 1, 0.3, 1]` inline: three of these were re-declared as
 * literal arrays in three different files, and a token nobody reads is a token
 * the render is free to disagree with.
 *
 * Four curves only earn their keep if each one holds a job. The page read as
 * flat because every one of its ~50 animations decelerated identically, so the
 * job is the whole point:
 *
 *   EASE_BRUSH   the hand — a stroke laid down by the sensei's brush.
 *   EASE_OUT     matter arriving — type, rules, plates coming to rest.
 *   EASE_PRESS   something stamped — it overshoots, because a press rebounds.
 *   EASE_INOUT   something that travels — it starts from rest and stops at
 *                rest, so it is for a front crossing a plate or the sheet
 *                moving under the reader, never for matter arriving.
 */

/** The hand. Slow to load, then a long even pull: `--ease-brush`. */
export const EASE_BRUSH = [0.3, 0.02, 0.15, 1] as const;

/** Matter arriving. Expo-out — fast in, long settle: `--ease-out`. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** The press. Overshoots past its target and comes back: `--ease-press`. */
export const EASE_PRESS = [0.34, 1.56, 0.64, 1] as const;

/** Travel. Rest to rest, symmetrical: `--ease-inout`. */
export const EASE_INOUT = [0.65, 0, 0.35, 1] as const;

/**
 * The name a dozen call sites already import. It is `EASE_OUT` — kept as an
 * alias so nothing has to change at once, but new code should say which job it
 * means rather than which curve shape it wants.
 */
export const EASE_OUT_EXPO = EASE_OUT;

/**
 * `EASE_INOUT` as a function, for the one consumer that cannot take a tuple:
 * Lenis wants `easing: (t: number) => number` for a programmatic scroll.
 * `cubic-bezier(0.65, 0, 0.35, 1)` is the published approximation of
 * easeInOutCubic, so the closed form below is the same curve to within a
 * fraction of a pixel of scroll — cheaper than importing a bezier solver, and
 * it keeps the reader's travel on the same curve as everything else that
 * travels.
 */
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
