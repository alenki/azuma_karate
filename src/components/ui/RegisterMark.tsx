import { cn } from "@/lib/cn";

/**
 * A printer's registration mark.
 *
 * This page is printed in two passes — the black type, then the sensei's
 * vermilion — and a register mark is where the second pass lines up on the
 * first. Which is exactly why it is drawn in ink and never in the accent:
 * the red pass is the brush, and only the brush.
 *
 * The reference boards use orange plus-signs at the corners of a card; this
 * is the same gesture with the colour taken back out of it.
 */
export function RegisterMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("block", className)} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M12 0.5V9M12 15V23.5M0.5 12H9M15 12H23.5" />
      <circle cx="12" cy="12" r="4.5" />
    </svg>
  );
}
