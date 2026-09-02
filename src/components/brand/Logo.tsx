import { cn } from "@/lib/cn";

/**
 * SK AZUMA brush mark — a placeholder vector recreation of the club's logo
 * (a red kicking figure drawn in brush strokes). Replace the paths with the
 * client's official vector when supplied; keep the viewBox.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("block", className)} aria-hidden="true" fill="none">
      <defs>
        <mask id="sk-azuma-head-notch">
          <rect width="100" height="100" fill="#fff" />
          <path d="M28 27 54 13" stroke="#000" strokeWidth="3.2" strokeLinecap="round" />
        </mask>
      </defs>
      <g fill="currentColor">
        <circle cx="42" cy="21" r="11.5" mask="url(#sk-azuma-head-notch)" />
        <path d="M38 47c11-15 32-25 56-23l-3.5 6.5C70 30 55 38 46 55c-2.5 3.5-8.5 2-8-8z" />
        <path d="M46 60c9-11 22-18 38-18l-3.8 6.5c-12 .8-21.5 6-28.5 15.5-3 3.5-7.5 1.5-5.7-4z" />
        <path d="M31 31c9.5-5 21 2 23 12 1.8 8.5-2.8 16.5-8 26L27.5 98l-4.6-6 14.5-31c1.3-3.8.3-7-2-9-5.5-5.4-6.2-13.4-4.4-21z" />
      </g>
    </svg>
  );
}

/**
 * Wordmark lockup: mark + "SK AZUMA" + "karate team". The wordmark is typeset
 * in a wide geometric face as a stand-in for the client's vector lockup.
 */
export function Logo({
  className,
  markClassName,
  tagline = true,
}: {
  className?: string;
  markClassName?: string;
  tagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className={cn("h-9 w-9 shrink-0", markClassName)} />
      <span className="flex flex-col leading-none">
        <span className="wordmark text-[1.05rem] tracking-[0.14em]">SK AZUMA</span>
        {tagline && <span className="wordmark-tag mt-[3px] text-[0.58rem] tracking-[0.28em]">karate team</span>}
      </span>
    </span>
  );
}
