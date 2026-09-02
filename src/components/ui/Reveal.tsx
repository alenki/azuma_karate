"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  /** Seconds. */
  delay?: number;
  /** Seconds. */
  duration?: number;
  /** Pixels to rise from. */
  y?: number;
  /** Trigger on mount (`load`) or when scrolled into view (`view`). */
  mode?: "load" | "view";
  /** Viewport margin for `view` mode. */
  margin?: string;
  once?: boolean;
};

/**
 * Fade-and-rise reveal. Used for copy blocks, cards and rules.
 * Reduced motion is honoured globally through <MotionConfig reducedMotion="user">.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.9,
  y = 28,
  mode = "view",
  margin = "-12% 0px -8% 0px",
  once = true,
  ...rest
}: RevealProps) {
  const target = { opacity: 1, y: 0 };
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      {...(mode === "load"
        ? { animate: target }
        : { whileInView: target, viewport: { once, margin } })}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
