"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Global Motion settings: respect the OS reduced-motion preference everywhere. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
