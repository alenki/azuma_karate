"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { useAnchorScroll } from "@/lib/useAnchorScroll";
import { useStillness } from "@/lib/useStillness";

/**
 * Mounts the delegated anchor handler. It has to be a child rather than a
 * hook call in `SmoothScroll` itself, because `useLenis()` reads the context
 * that `<ReactLenis>` provides — asking for it from the component that
 * renders the provider would always answer `undefined`.
 */
function AnchorScroll() {
  useAnchorScroll();
  return null;
}

/**
 * Lenis smooth scroll, turned off — but never unmounted — for readers who ask
 * for reduced motion. `root` attaches Lenis to the window so native anchors,
 * `scrollIntoView` and Motion's `useScroll` keep working.
 *
 * This used to be `if (reduced) return <>{children}</>`, and that one line
 * corrupted the whole page for exactly the readers it was trying to help.
 * `useReducedMotion()` answers `false` on the server and `true` on a machine
 * that asks for stillness, so the server sent `<ReactLenis><AnchorScroll/>…`
 * and the client hydrated a bare fragment. Two different trees mean React
 * numbers `useId` differently on the two sides of the boundary, and this
 * component wraps the entire page — so EVERY id below it diverged: the brush
 * masks, the accordion's `aria-controls`, and, because a mark seeds its own
 * hand from its id, the per-instance jitter of every brush stroke. React
 * reported it as a hydration mismatch and left the served markup in place.
 *
 * Two changes fix it and neither is a workaround. The tree shape is now
 * constant — Lenis is always mounted and is configured into a no-op instead,
 * which is what it is for: `smoothWheel: false` leaves the wheel native and
 * `lerp: 1` lands every programmatic scroll on the same frame it starts. And
 * the preference is read through `useStillness()`, which answers `false`
 * during the hydrating render on both sides and flips immediately after, so
 * the markup agrees and the reader still gets stillness.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useStillness();
  return (
    <ReactLenis
      root
      options={{
        lerp: reduced ? 1 : 0.085,
        duration: reduced ? 0 : 1.15,
        smoothWheel: !reduced,
        syncTouch: false,
        wheelMultiplier: 0.95,
      }}
    >
      <AnchorScroll />
      {children}
    </ReactLenis>
  );
}
