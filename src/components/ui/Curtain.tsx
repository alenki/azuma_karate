"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EASE_OUT_EXPO } from "./Reveal";

type CurtainProps = {
  children: ReactNode;
  /** Sizes the plate: give it an aspect class or explicit height. */
  className?: string;
  delay?: number;
  duration?: number;
  /** Edge the curtain rises from. */
  from?: "bottom" | "top" | "left" | "right";
  /** Slight settle-scale of the content while the curtain opens. */
  scale?: number;
  mode?: "view" | "load";
  margin?: string;
};

const INSET: Record<NonNullable<CurtainProps["from"]>, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

/**
 * Plate reveal. The OUTER wrapper is observed for the viewport (an element
 * that starts fully clipped never intersects, so `whileInView` on the clipped
 * node itself never fires); the inner layer animates clip-path and a settle
 * scale. Children should fill the box (e.g. <Photo fill />).
 */
export function Curtain({ children, className, delay = 0, duration = 1.1, from = "bottom", scale = 1.06, mode = "view", margin = "-12% 0px -8% 0px" }: CurtainProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: margin as never });
  const reduced = useReducedMotion();
  const shown = mode === "load" || inView;
  const closed = INSET[from];
  const open = "inset(0% 0% 0% 0%)";
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: reduced ? open : closed }}
        animate={{ clipPath: shown || reduced ? open : closed }}
        transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: EASE_OUT_EXPO }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: reduced ? 1 : scale }}
          animate={{ scale: shown || reduced ? 1 : scale }}
          transition={{ duration: reduced ? 0 : duration * 1.4, delay: reduced ? 0 : delay, ease: EASE_OUT_EXPO }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
