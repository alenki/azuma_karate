"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { reels, type ReelKey } from "@/content/media";
import { useStillness } from "@/lib/useStillness";
import { useMediaQuery } from "@/lib/useMediaQuery";

type ReelProps = {
  slot: ReelKey;
  className?: string;
  /** The query under which the reel is worth playing at all. */
  when: string;
};

/**
 * A plate that is made rather than printed — for the one place in the book
 * that has one. See `reels` in content/media for what it is and why.
 *
 * IT IS NOT THE PLATE. It lies OVER one: `<Photo>` prints the reel's own frame
 * 0 underneath, and that <img> is what the browser measures for LCP, what a
 * screen reader is given, and what the reader is left with if any of the three
 * conditions below fails. A <video> is not an LCP candidate, cannot carry alt
 * text, and is one autoplay policy away from never painting at all, so nothing
 * that matters may depend on it.
 *
 * THREE THINGS MUST BE TRUE before it exists, and all three are client-side —
 * which is the point, because an element that is merely `display: none` is
 * still in the markup and browsers preload those:
 *
 *   1 the page has hydrated. Both hooks answer `false` until then, so the reel
 *     is absent from the SSR markup and cannot compete with the LCP image for
 *     bandwidth during the paint that decides it.
 *   2 the viewport is the shape the cut was composed for. A phone is shown the
 *     upright still instead and never downloads a frame of this.
 *   3 the reader has not asked for stillness. They get the still, which is the
 *     same frame — nothing is lost but the movement.
 *
 * AND THEN IT HANDS OVER IN ONE FRAME. It is transparent until `playing`
 * fires, so the <img> shows through; on the first painted frame — the identical
 * image, by construction — it lifts. The 280ms is insurance against a tone
 * mismatch between the baked press and the CSS one, not a dissolve anyone is
 * meant to see. If autoplay is refused, `playing` never fires, the reel stays
 * at zero and the sheet is exactly what it was.
 */
export function Reel({ slot, className, when }: ReelProps) {
  const reel = reels[slot];
  const still = useStillness();
  const shaped = useMediaQuery(when);
  const [lit, setLit] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const play = !still && shaped;

  /* `autoPlay` alone is enough in every browser that allows a muted inline
     video to start, but it is evaluated once at mount and this element mounts
     after hydration — so ask again, and swallow the rejection, which is the
     documented shape of a refusal rather than an error. */
  useEffect(() => {
    if (!play) return;
    ref.current?.play().catch(() => {});
  }, [play]);

  if (!play) return null;

  return (
    <video
      ref={ref}
      className={cn(className)}
      data-lit={lit || undefined}
      width={reel.width}
      height={reel.height}
      autoPlay
      muted
      playsInline
      preload="auto"
      /* NO `loop`. The cut is one gesture and it settles; see content/media. */
      controls={false}
      disablePictureInPicture
      tabIndex={-1}
      /* decorative: the <img> beneath it carries the alt text, and announcing
         both would print the same plate to a screen reader twice */
      aria-hidden="true"
      onPlaying={() => setLit(true)}
    >
      {reel.sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
}
