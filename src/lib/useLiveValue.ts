"use client";

import { useSyncExternalStore } from "react";

export type LiveStore<T> = {
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => T;
};

/**
 * A clock-driven value that only exists on the client: today's weekday, which
 * the timetable marks.
 *
 * The store lives outside React (module scope), so the cached snapshot stays
 * referentially stable between ticks without an effect that calls setState.
 * `identity` maps a value to a string; when it changes, subscribers re-render.
 */
export function createLiveStore<T>(compute: () => T, identity: (value: T) => string, intervalMs = 60_000): LiveStore<T> {
  let key: string | null = null;
  let value: T;
  let timer: number | undefined;
  const listeners = new Set<() => void>();

  const read = (): T => {
    const next = compute();
    const nextKey = identity(next);
    if (key !== nextKey) {
      key = nextKey;
      value = next;
    }
    return value;
  };

  const tick = () => {
    const before = value;
    if (read() !== before) for (const listener of listeners) listener();
  };

  return {
    subscribe(onStoreChange) {
      listeners.add(onStoreChange);
      if (timer === undefined) timer = window.setInterval(tick, intervalMs);
      return () => {
        listeners.delete(onStoreChange);
        if (listeners.size === 0 && timer !== undefined) {
          window.clearInterval(timer);
          timer = undefined;
        }
      };
    },
    getSnapshot: read,
  };
}

/** Reads a live store, rendering `serverValue` on the server and until hydration. */
export function useLiveStore<T>(store: LiveStore<T>, serverValue: T): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => serverValue);
}
