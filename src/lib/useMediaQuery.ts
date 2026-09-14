"use client";

import { useSyncExternalStore } from "react";

type Store = {
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => boolean;
};

/** One store per query string, kept at module scope so two callers asking the
 *  same question share one MediaQueryList and one cached snapshot. */
const stores = new Map<string, Store>();

function storeFor(query: string): Store {
  const cached = stores.get(query);
  if (cached) return cached;

  let mql: MediaQueryList | undefined;
  /* lazily, because this module is imported on the server too and only
     `subscribe`/`getSnapshot` are ever called on a machine that has a window */
  const list = () => (mql ??= window.matchMedia(query));

  const store: Store = {
    subscribe(onStoreChange) {
      const m = list();
      m.addEventListener("change", onStoreChange);
      return () => m.removeEventListener("change", onStoreChange);
    },
    getSnapshot: () => list().matches,
  };
  stores.set(query, store);
  return store;
}

/**
 * A media query, answered `false` on the server and until hydration.
 *
 * The same shape as `useStillness` and for the same reason: the server cannot
 * know the query, so anything it decides must agree across the boundary or
 * React will not patch it. `useSyncExternalStore` is the supported way to say
 * "not yet" — React reads `getServerSnapshot` on the server AND during the
 * hydrating render, then re-renders from `getSnapshot` once hydration commits.
 *
 * So a caller that returns `null` while this is `false` renders NOTHING into
 * the HTML and mounts after hydration. That is the point, and it is what keeps
 * a phone from downloading a video it will never be shown: an element that is
 * merely `display: none` is still in the markup, and a browser will happily
 * preload one. Use this for matter that is genuinely absent below a breakpoint,
 * never to lay out matter that is merely hidden — that is CSS's job, and CSS
 * does it before this file has loaded.
 */
export function useMediaQuery(query: string): boolean {
  const store = storeFor(query);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => false);
}
