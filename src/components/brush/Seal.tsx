"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { useFlyleafOpen } from "@/lib/useFlyleafOpen";
import { useStillness } from "@/lib/useStillness";
import { KanjiStrokes } from "@/components/brush/Kanji";
import { pressVariant, seedHash, sealPress } from "@/components/ui/PressDefs";

/**
 * The club's circular seal (印), pressed onto the page: outer ring, the club's
 * own 東, and the ring text "SK AZUMA · КИОКУШИНКАЙ · НАЛЬЧИК". Stamps in with
 * a press (scale 1.3 → 0.97 → 1, rotate −8° → −6°). With reduced motion it is
 * simply printed.
 *
 * A seal carries a legend and a device, and they must not be the same thing:
 * the ring already says SK AZUMA, so the centre says what SK AZUMA means.
 * Chapter 02 teaches the reader that 東 = Азума = east; this is where that is
 * cashed in. Printed, never drawn — the only hand-made mark in this manual is
 * the sensei's brush, and a seal is a press.
 *
 * Which means the press has to reach all of it. The whole device — ring, inner
 * ring, legend and 東 — sits inside ONE filtered group, so the stone bites the
 * type as unevenly as it bites the circles; the centre glyph is drawn into the
 * SVG rather than floated over it in a div, which is the only way it can be
 * under the same filter. A seal with a rough ring and crisp type is a logo.
 */
export function Seal({
  className,
  delay = 0,
  trigger = "view",
  text = "SK AZUMA · КИОКУШИНКАЙ КАРАТЭ · НАЛЬЧИК · ",
  seed,
  label,
}: {
  className?: string;
  delay?: number;
  trigger?: "view" | "load";
  text?: string;
  /** Which impression of the stone this is; defaults to the instance's own id. */
  seed?: number | string;
  label?: string;
}) {
  const id = useId().replace(/:/g, "");
  const reduced = useStillness();
  const press = sealPress(pressVariant(seedHash(seed ?? id)));
  const open = useFlyleafOpen(trigger === "load");
  const target = { scale: 1, rotate: -6, opacity: 1 };
  const unpressed = { scale: 1.3, rotate: -8, opacity: 0 };
  return (
    <motion.div
      className={cn("seal relative aspect-square", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      initial={unpressed}
      {...(trigger === "load" ? { animate: open ? target : unpressed } : { whileInView: target, viewport: { once: true, margin: "-10% 0px" } })}
      transition={{
        duration: reduced ? 0 : 0.32,
        delay: reduced ? 0 : delay,
        ease: [0.34, 1.56, 0.64, 1],
        opacity: { duration: 0.12, delay: reduced ? 0 : delay },
      }}
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <defs>
          <path id={`${id}-ring`} d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
        </defs>
        <g filter={`url(#${press})`}>
          <g fill="none" stroke="currentColor">
            <circle cx="100" cy="100" r="94" strokeWidth="5" />
            <circle cx="100" cy="100" r="52" strokeWidth="2.5" />
          </g>
          <text className="seal__text" fill="currentColor" fontSize="12.5" letterSpacing="2.2">
            <textPath href={`#${id}-ring`} startOffset="0">
              {text}
            </textPath>
          </text>
          {/* the device, seated at 43% of the seal: 109 KanjiVG units scaled to
              86 of the seal's 200, centred on the same point as the rings */}
          <g transform="translate(100 100) scale(0.789) translate(-54.5 -54.5)">
            <KanjiStrokes id="azuma" weight={5} />
          </g>
        </g>
      </svg>
    </motion.div>
  );
}
