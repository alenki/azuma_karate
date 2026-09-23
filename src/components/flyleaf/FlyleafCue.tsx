"use client";

import { useEffect } from "react";
import "@/lib/flyleaf";

/**
 * Tells the flyleaf the page has hydrated. Mounted once, from the root layout.
 *
 * The leaf holds for this as well as for the window's `load`, because a page
 * that has loaded but not hydrated is a page whose entrances cannot run yet:
 * lifting then would show the served markup standing still.
 */
export function FlyleafCue() {
  useEffect(() => {
    window.__flyleafReady = true;
    window.__flyleaf?.ready?.();
  }, []);
  return null;
}
