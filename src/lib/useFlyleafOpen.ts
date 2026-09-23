"use client";

import { useSyncExternalStore } from "react";
import { FLYLEAF_EVENT } from "./flyleaf";

/**
 * Whether the flyleaf has lifted, i.e. whether the reader can see the page yet.
 *
 * The flyleaf (components/flyleaf) is the blank leaf at the front of the book:
 * the loading screen. It is printed in the server HTML and run by an inline
 * script before any bundle arrives, so its state lives on `window` rather than
 * in React. The script is the only thing awake early enough to own it, and
 * this hook is the React side of that one fact.
 *
 * Anything that plays "on load" asks this instead of playing on mount. Without
 * it the hero's entrance (the plate settling, the bow and the strike rising)
 * runs its whole two seconds under a closed leaf and the reader is shown a
 * finished sheet, which is the one thing a loading screen must never cost.
 */

function subscribe(onChange: () => void) {
  window.addEventListener(FLYLEAF_EVENT, onChange);
  return () => window.removeEventListener(FLYLEAF_EVENT, onChange);
}

/*
  No state on `window` means no flyleaf ran at all: it was skipped, blocked, or
  this is a page without one. The answer is OPEN, because the only failure a
  missing leaf can cause is an entrance that waits forever for a signal that
  will never come, and a headline held in its mask is a blank first screen.
*/
const onClient = () => window.__flyleaf?.open ?? true;
/* Closed on the server and through hydration, which is what the markup already
   says: every `initial` is the closed pose, so both sides agree. */
const onServer = () => false;

/* Not asking: nothing to subscribe to, and always open. */
const unsubscribed = () => () => {};
const always = () => true;

/**
 * `true` once the reader can see the page. `false` on the server and while
 * hydrating.
 *
 * `enabled` is for the primitives that only need the answer in one mode: a
 * `view`-mode Reveal passes `false` and neither subscribes nor re-renders when
 * the leaf lifts. There are some sixty of them on the page and five that care.
 * Pass a value that is fixed for the life of the component.
 */
export function useFlyleafOpen(enabled = true): boolean {
  return useSyncExternalStore(
    enabled ? subscribe : unsubscribed,
    enabled ? onClient : always,
    enabled ? onServer : always,
  );
}
