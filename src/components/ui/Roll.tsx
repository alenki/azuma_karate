"use client";

import "@/styles/roll.css";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useStillness } from "@/lib/useStillness";

/**
 * The unroll. Light, because Lenis is already smoothing the reader's input and
 * a second heavy spring on top of it reads as lag rather than as weight — this
 * one exists so the track has a velocity to be sheared by, and so it keeps
 * moving for a few frames after the wheel stops, the way a sheet does.
 */
const ROLL = { stiffness: 380, damping: 58, mass: 0.45 } as const;

/** The shear settles faster than the travel, or the lean outlives the motion. */
const SHEAR = { stiffness: 250, damping: 34, mass: 0.35 } as const;

/**
 * Degrees of shear at full speed, and the divisor that gets there.
 *
 * Both are small on purpose. Paper under tension deforms; paper does not
 * wobble. At ±2° over a 900px stage the extreme edge of a panel moves about
 * 16px from its rest position at the top and the same the other way at the
 * foot, which is enough for the eye to read the roll as a material being
 * pulled and not enough to make anybody's photograph look broken.
 */
const SHEAR_MAX = 2;
const SHEAR_DIV = 1100;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

type RollProps = {
  /** The panels, in reading order. Each child becomes one <li>. */
  children: ReactNode;
  /** Printed behind the track and travelling on its own, shorter, overflow. */
  backdrop?: ReactNode;
  /** The heading that names the chronicle; labels the list. */
  labelledBy?: string;
  className?: string;
};

/**
 * A chronicle that unrolls sideways.
 *
 * The reader scrolls DOWN and the track travels ACROSS: the component is a
 * tall spacer holding a sticky, viewport-high stage, and vertical progress
 * through the spacer is mapped onto the track's horizontal overflow. Nothing
 * here hijacks the wheel, captures a gesture or animates the scroll position —
 * the page scrolls exactly as it does everywhere else, which is the whole
 * reason this form is usable at all: `PageDown`, a trackpad, a screen reader's
 * own scrolling and a find-in-page jump all still work, because all of them
 * move the same `scrollY` the mapping reads.
 *
 * THE SPACER'S HEIGHT IS THE TRAVEL. `--roll-travel` starts at 0, so before
 * measurement — and on the server — the section is exactly one stage tall and
 * the track simply overflows a clipped box. That is also the layout a browser
 * with no JS keeps, which is why the stylesheet leaves the track scrollable
 * rather than merely clipped: the chronicle stays readable with none of this
 * running.
 *
 * TWO LAYERS, TWO RATES. The backdrop is not the track at a fraction of
 * its speed — it is mapped onto ITS OWN overflow, so however much wider or
 * narrower the printed word is than the panels over it, it starts flush left
 * and ends flush right and can never run out mid-roll or stop early.
 *
 * WHAT TURNS IT OFF. Below 1024 and under `prefers-reduced-motion` the panels
 * are a column and none of this is written: `pinned` gates every inline style,
 * so there is no height on the spacer and no transform on the track. The
 * stylesheet enforces the same thing a second time with `transform: none`,
 * because an inline transform Motion rewrites each frame cannot be beaten from
 * JS — `useStillness`'s own documentation prescribes exactly that belt and
 * braces.
 */
export function Roll({ children, backdrop, labelledBy, className }: RollProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const wide = useMediaQuery("(min-width: 1024px)");
  const still = useStillness();
  const pinned = wide && !still;

  const [measured, setMeasured] = useState({ travel: 0, back: 0 });

  /*
    The column state is DERIVED, never written. Resetting these to zero from
    inside the effect meant a synchronous setState on every change of `pinned`
    — a cascading render, and one React now flags. What the column needs is
    simply for the measurements not to be read, which is a `?:` rather than a
    round trip through state.
  */
  const travel = pinned ? measured.travel : 0;
  const backTravel = pinned ? measured.back : 0;

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track || !pinned) return;

    const measure = () => {
      const w = stage.clientWidth;
      const next = {
        travel: Math.max(0, track.scrollWidth - w),
        back: Math.max(0, (backRef.current?.scrollWidth ?? 0) - w),
      };
      setMeasured((prev) => (prev.travel === next.travel && prev.back === next.back ? prev : next));
    };

    /*
      No priming call: a ResizeObserver delivers the current size the moment it
      observes, so `measure` runs once on its own — off the effect body, which
      is where a layout read that sets state belongs.

      The track, because a panel's own type can reflow it; the stage, because
      the mapping is against ITS width; the backdrop, because a locale switch
      changes the length of the printed word.
    */
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(stage);
    if (backRef.current) ro.observe(backRef.current);
    return () => ro.disconnect();
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const x = useSpring(useTransform(scrollYProgress, [0, 1], [0, -travel]), ROLL);
  const bx = useSpring(useTransform(scrollYProgress, [0, 1], [0, -backTravel]), ROLL);

  const shear = useTransform(useSpring(useVelocity(x), SHEAR), (v) =>
    clamp(v / -SHEAR_DIV, -SHEAR_MAX, SHEAR_MAX),
  );

  return (
    <div
      ref={sectionRef}
      className={cn("roll", className)}
      /* the stylesheet reads this to swap the fallback's hand-scrollable strip
         for a clip — the reader must never be dragging one axis while the
         scroll position drives the other */
      data-pinned={pinned && travel > 0 ? "" : undefined}
      style={pinned ? ({ "--roll-travel": `${travel}px` } as CSSProperties) : undefined}
    >
      <div ref={stageRef} className="roll__stage">
        {backdrop && (
          <motion.div
            ref={backRef}
            className="roll__backdrop"
            aria-hidden="true"
            style={pinned ? { x: bx } : undefined}
          >
            {backdrop}
          </motion.div>
        )}

        <motion.ol
          ref={trackRef}
          className="roll__track"
          aria-labelledby={labelledBy}
          style={pinned ? { x, skewX: shear } : undefined}
        >
          {Children.map(children, (child) => (
            <li className="roll__panel">{child}</li>
          ))}
        </motion.ol>
      </div>
    </div>
  );
}
