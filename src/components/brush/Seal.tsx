"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { useStillness } from "@/lib/useStillness";
import { Kanji } from "@/components/brush/Kanji";

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
 */
export function Seal({
  className,
  delay = 0,
  trigger = "view",
  text = "SK AZUMA · КИОКУШИНКАЙ КАРАТЭ · НАЛЬЧИК · ",
  label,
}: {
  className?: string;
  delay?: number;
  trigger?: "view" | "load";
  text?: string;
  label?: string;
}) {
  const id = useId().replace(/:/g, "");
  const reduced = useStillness();
  const target = { scale: 1, rotate: -6, opacity: 1 };
  return (
    <motion.div
      className={cn("seal relative aspect-square", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      initial={{ scale: 1.3, rotate: -8, opacity: 0 }}
      {...(trigger === "load" ? { animate: target } : { whileInView: target, viewport: { once: true, margin: "-10% 0px" } })}
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
          <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="5" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter={`url(#${id}-rough)`} fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="94" strokeWidth="5" />
          <circle cx="100" cy="100" r="52" strokeWidth="2.5" />
        </g>
        <text className="seal__text" fill="currentColor" fontSize="12.5" letterSpacing="2.2">
          <textPath href={`#${id}-ring`} startOffset="0">
            {text}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Kanji id="azuma" className="h-[43%] w-[43%]" weight={5} label={null} />
      </div>
    </motion.div>
  );
}
