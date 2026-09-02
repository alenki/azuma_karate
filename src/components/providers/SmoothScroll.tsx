"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Lenis smooth scroll, disabled for users who prefer reduced motion.
 * `root` attaches Lenis to the window so native anchors, `scrollIntoView`
 * and Motion's `useScroll` keep working.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.085,
        duration: 1.15,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.95,
      }}
    >
      {children}
    </ReactLenis>
  );
}
