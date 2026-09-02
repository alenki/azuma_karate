import { cn } from "@/lib/cn";

/**
 * Film-grain overlay. Absolutely positioned inside a `relative` parent
 * (or `fixed` for the whole page). The noise tile is an inline SVG
 * feTurbulence, defined once in globals.css as `.grain`.
 */
export function Grain({ className, fixed = false, opacity }: { className?: string; fixed?: boolean; opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn("grain pointer-events-none", fixed ? "fixed inset-0 z-[60]" : "absolute inset-0", className)}
      style={opacity !== undefined ? { opacity } : undefined}
    />
  );
}
