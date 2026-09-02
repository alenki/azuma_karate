"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { cta } from "@/content/nav";
import { formatNextSession, useNextSession } from "@/components/ui/NextSessionStrip";
import { EASE_OUT_EXPO } from "@/components/ui/Reveal";

/**
 * 56px sticky bottom bar on mobile: the live next session + the primary CTA.
 * Hidden while the sign-up chapter or the footer is in view, and until the
 * user has scrolled past the hero.
 */
export function MobileBar({ hideWhenVisible = ["join", "footer"] }: { hideWhenVisible?: string[] }) {
  const { locale } = useLocale();
  const { session, live } = useNextSession();
  const f = formatNextSession(session, live, locale);
  const [pastHero, setPastHero] = useState(false);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const targets = hideWhenVisible.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setCovered(visible.size > 0);
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0 },
    );
    targets.forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [hideWhenVisible]);

  const show = pastHero && !covered;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="mobile-bar fixed inset-x-0 bottom-0 z-40 md:hidden"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        >
          <div className="flex h-14 items-stretch">
            <div className="flex min-w-0 flex-1 flex-col justify-center px-4">
              <span className="t-mono text-[0.625rem] text-ink-2 truncate">{f.label}</span>
              <span className="t-caption truncate">
                {f.when} {f.time} · {f.group}
              </span>
            </div>
            <a href={cta.href} className="mobile-bar__cta t-mono flex items-center px-5">
              {cta.label[locale]}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
