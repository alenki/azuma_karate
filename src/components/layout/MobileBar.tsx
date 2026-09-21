"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { cta } from "@/content/nav";
import { Button } from "@/components/ui/Button";
import { formatNextSession, useNextSession } from "@/components/ui/NextSessionStrip";
import { useActiveChapter } from "./ChapterContext";
import { EASE_OUT } from "@/lib/ease";

/*
  The hero is on this list, and that is the point of it.

  The bar used to arm at `scrollY > innerHeight * 0.6` — 506px on a 390 × 844
  phone — while the hero at that width is 1088px tall and ENDS with its own
  <NextSessionStrip> printing exactly the same readout. Between roughly 300 and
  700px of scroll the reader had the live session twice on one screen: once
  mid-viewport in the hero's folio row and once pinned to the bottom edge.
  Nothing else on this page repeats itself.

  Naming the hero instead of guessing at a fraction of the viewport makes the
  bar arrive exactly when the hero's own strip leaves, at any height and at
  any width. It is a module constant so the observer effect below does not re-run
  on every render — a default `[]` written in the parameter list is a new array
  identity each time.
*/
const HIDE_WHEN_VISIBLE = ["hero", "join", "footer"];

/**
 * The foot margin: the live next session and the primary control, pinned to
 * the bottom of a phone.
 *
 * It takes the ground behind it the way the header does — chapters 五 and 十
 * are ink and each runs several screens at 390px, and a cream slab welded
 * across the bottom of a black page reads as a bug rather than as chrome.
 * `.mobile-bar--ink` is in globals.css beside `.site-header--ink`.
 */
export function MobileBar({
  hideWhenVisible = HIDE_WHEN_VISIBLE,
  ctaHref = cta.href,
}: {
  hideWhenVisible?: string[];
  /* Where the foot margin's control goes. It defaults to the home chapter; a
     page that prints its own version of the ask points it at that instead,
     rather than sending a thumb to another page for something this one is
     already carrying. */
  ctaHref?: string;
}) {
  const { ground } = useActiveChapter();
  const { session, live } = useNextSession();
  const f = formatNextSession(session, live);
  /* covered until proven otherwise: the observer's first callback arrives
     before paint, and starting at `false` would flash the bar over the hero */
  const [covered, setCovered] = useState(true);

  useEffect(() => {
    const targets = hideWhenVisible.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (targets.length === 0) {
      /* Nothing named is on this page, so nothing can ever uncover the bar and
         it would stay hidden for good. Released on the next frame rather than
         here: a setState in an effect body is a synchronous cascading render. */
      const frame = requestAnimationFrame(() => setCovered(false));
      return () => cancelAnimationFrame(frame);
    }
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
    return () => io.disconnect();
  }, [hideWhenVisible]);

  return (
    <AnimatePresence>
      {!covered && (
        <motion.div
          className={cn(
            "mobile-bar fixed inset-x-0 bottom-0 z-40 md:hidden",
            ground === "ink" && "mobile-bar--ink",
          )}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <div className="mobile-bar__row">
            <div className="mobile-bar__now">
              {/*
                `mobile-bar__label` is the hook the ink override needs: the tone
                is set by a `text-ink-2` utility (#5A554E — 6.4:1 on paper, 2.1:1
                on ink) and a utility beats an unlayered rule on the parent, so
                the ink ramp's own secondary tone has to be aimed at the element
                itself and marked — see the rule in globals.css.
              */}
              <span className="mobile-bar__label t-mono text-[0.625rem] text-ink-2 truncate">{f.label}</span>
              {/* the group's NAME, not the group line: «Дети · 7–11 лет» was
                  what pushed this into an ellipsis inside a 56px band */}
              <span className="t-caption truncate">
                {f.when} {f.time} · {f.groupName}
              </span>
            </div>
            <Button href={ctaHref} className="mobile-bar__act">
              {cta.label}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
