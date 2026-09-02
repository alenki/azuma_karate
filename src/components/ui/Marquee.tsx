import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  /** Seconds for one full loop of the track. */
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  /** Accessible label; the repeated track is hidden from assistive tech. */
  label?: string;
};

/**
 * CSS-only infinite marquee. The track is rendered twice and translated by
 * -50%, so the loop is seamless at any width. Honours prefers-reduced-motion
 * through the `.marquee` rules in globals.css.
 */
export function Marquee({ children, className, duration = 40, reverse = false, pauseOnHover = false, label }: MarqueeProps) {
  return (
    <div
      className={cn("marquee", pauseOnHover && "marquee--pause", className)}
      style={{ ["--marquee-duration" as string]: `${duration}s`, ["--marquee-direction" as string]: reverse ? "reverse" : "normal" }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <div className="marquee__track" aria-hidden={label ? "true" : undefined}>
        <div className="marquee__group">{children}</div>
        <div className="marquee__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
