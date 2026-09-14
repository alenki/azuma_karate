"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

/** Nothing ever changes, so the store never notifies. */
const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * The reduced-motion preference, but only after the page has hydrated.
 *
 * `useReducedMotion()` cannot know the media query on the server, so it answers
 * `false` there and `true` on a machine that asks for stillness. Any value that
 * is *serialised into the HTML* must not be allowed to disagree across that
 * boundary: Motion writes a component's `initial` prop into the SSR markup, and
 * React refuses to patch mismatched `style` attributes — so a plate whose
 * `initial` clip-path differed between server and client stayed clipped shut
 * for exactly the readers who asked for less motion.
 *
 * `useSyncExternalStore` is the supported way to ask "have we hydrated yet?":
 * React calls `getServerSnapshot` both on the server and during the hydrating
 * render, then re-renders with `getSnapshot` once hydration is committed. So
 * this answers `false` on both sides of the boundary — the two agree, and
 * hydration is clean — and flips to the real preference immediately after.
 * `initial` has been read by then; `animate` and `transition` have not, and
 * those are where stillness belongs: the mark is not drawn, it is simply
 * printed, in zero seconds, one frame after mount.
 *
 * Use this for anything that decides an `initial` prop or a serialised `style`.
 * For a plain `animate`/`whileInView` transition, prefer Motion's own
 * `<MotionConfig reducedMotion="user">`, which already handles it. To pin a
 * scroll-linked transform at rest, prefer CSS — a `transform: none !important`
 * rule is the only thing that can win against the inline transform Motion
 * rewrites every frame, and `sections/Morning.tsx` is the one place on the page
 * that still needs it.
 */
export function useStillness(): boolean {
  const reduced = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribe, onClient, onServer);
  return hydrated && reduced === true;
}
