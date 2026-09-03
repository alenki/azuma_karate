import { cn } from "@/lib/cn";

/**
 * SK AZUMA wordmark: "SK AZUMA" over "karate team".
 *
 * The lockup is type and nothing else. There was a figurative mark here — a
 * hand-drawn kicking figure standing in for the club's own — and a placeholder
 * of somebody else's logo is worse than no logo at all: it teaches the reader a
 * mark that will not survive launch. The wordmark IS the logo until the client
 * supplies their vector; it is typeset in a wide geometric face as a stand-in
 * for their lettering.
 */
export function Logo({
  className,
  tagline = true,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="wordmark text-[1.05rem] tracking-[0.14em]">SK AZUMA</span>
      {tagline && <span className="wordmark-tag mt-[3px] text-[0.58rem] tracking-[0.28em]">karate team</span>}
    </span>
  );
}
