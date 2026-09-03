import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * SK AZUMA wordmark: "SK AZUMA" over "karate team".
 *
 * The lockup is type and nothing else. There was a figurative mark here — a
 * hand-drawn kicking figure standing in for the club's own — and a placeholder
 * of somebody else's logo is worse than no logo at all: it teaches the reader a
 * mark that will not survive launch. The wordmark IS the logo until the client
 * supplies their vector.
 *
 * It used to be set in Unbounded, a fifth family loaded for these eight
 * characters and belonging to no other part of the page. A book sets its
 * masthead in a face the book owns, so the stand-in is now the manual's own
 * mono at 500, tracked wide: the same voice as the folios, the running head and
 * the plate numbers, which is the right voice for a mark a reader COUNTS on
 * rather than reads. It also sets ~105px against Unbounded's 130.7px, so the
 * header band the chrome was measured for has more room, never less.
 */
export function Logo({
  className,
  tagline = true,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex flex-col leading-none", className)}
      /* `.wordmark` in globals.css still reads `var(--font-wordmark)`, which
         next/font set from Unbounded. The token is re-pointed here rather than
         deleted, so the lockup is a decision at the one place that owns it
         instead of falling through the stack to the body face. */
      style={{ "--font-wordmark": "var(--font-mono)" } as CSSProperties}
    >
      <span
        className="wordmark text-[1.05rem] tracking-[0.18em]"
        /* `.wordmark` asks for 600, which Plex Mono does not ship — the browser
           would synthesise it and smear a mark that has to stay crisp at 12.8px
           on a 320 sheet. Inline because that rule is unlayered and a utility
           class cannot reach it. */
        style={{ fontWeight: 500 }}
      >
        SK AZUMA
      </span>
      {tagline && <span className="wordmark-tag mt-[3px] text-[0.58rem] tracking-[0.28em]">karate team</span>}
    </span>
  );
}
