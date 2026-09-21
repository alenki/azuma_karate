"use client";

import Image, { getImageProps, type ImageProps } from "next/image";
import { cn } from "@/lib/cn";
import { media, type MediaKey } from "@/content/media";

/**
 * A second cut of the same subject, served to a narrower screen.
 *
 * `object-position` is a focal point, not a crop, and a focal point cannot save
 * a 3:2 landscape asked to cover a 390 x 844 phone: cover shows a 31% vertical
 * SLICE of it whatever the focus says, and a slice of a composition is not a
 * composition. So the manifest can carry a second frame and the browser picks
 * one — through <picture>, so exactly one file is fetched.
 */
export type ArtDirection = {
  /** The manifest slot holding the narrow cut. */
  slot: MediaKey;
  /** The media query under which that cut is served. */
  media: string;
  /** `sizes` for the narrow cut — it covers a taller box, so it is not 100vw. */
  sizes: string;
};

type PhotoProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  slot: MediaKey;
  className?: string;
  /** Serve a second cut of the same subject to narrow screens. */
  art?: ArtDirection;
  /**
   * How the plate is pressed (see ui/PressDefs).
   *
   * `duotone` runs the image's luminance from ink to paper; `duotone-ink` runs
   * it from ink to bone, which is what a plate on a dark chapter needs — the
   * paper-white highlight of the first blows a hole in the ground. `bw` is the
   * plain grayscale grade.
   *
   * `color` is not a plate at all — it is the press declining to run, and it
   * means two different things to its two consumers. Chapter 04's plate is the
   * COLOUR EXCEPTION: the one page in the manual about a person rather than
   * about a practice, printed in full sRGB on purpose. It used to be gated
   * behind a control the reader turned on; it is simply printed now, because a
   * colour page the reader has to ask for is a setting, and this is a decision
   * the book makes.
   *
   * Chapter 01's plate asks for it for the opposite reason: it is not on the
   * shared press because it carries its OWN grade, declared once in hero.css
   * for the still and the reel together (`saturate() contrast() brightness()`).
   * Passing `duotone` there and overriding it in the section stylesheet would
   * work by specificity and read as an accident.
   *
   * The trophies used to claim it too, and that was simply a hole in the
   * palette: gold cups, a yellow cloth and blue ribbons, printed, on a black
   * chapter. They are pressed in the ink ramp now.
   */
  grade?: "bw" | "duotone" | "duotone-ink" | "color";
  /** Fill the parent (parent must be positioned and sized). */
  fill?: boolean;
};

/**
 * A photographic plate. Reads its source and alt text from the media manifest
 * so the client's photography can replace the placeholders in one file.
 */
export function Photo({ slot, className, art, grade = "duotone", fill = true, sizes, priority, ...rest }: PhotoProps) {
  const m = media[slot];
  const gradeClass =
    grade === "color"
      ? undefined
      : grade === "duotone"
        ? "plate-duotone"
        : grade === "duotone-ink"
          ? "plate-duotone-ink"
          : "plate-bw";

  /*
    THE ART-DIRECTED PATH.

    <Image> renders one <img> and cannot carry a second <source>, so the two
    cuts are resolved with `getImageProps` — the documented way to art-direct in
    this version — and assembled by hand. `fill` is not passed to either: it
    would write `position: absolute; inset: 0` onto the <img> inside a <picture>
    that has no box of its own, so the picture is the fill box and the img fills
    it. The <img> keeps every prop the plain path gives it, so a caller cannot
    tell the two paths apart from the outside.
  */
  if (art) {
    const narrow = media[art.slot];
    const alt = m.alt;
    const common = { alt, quality: rest.quality as number | undefined };
    const { props: tall } = getImageProps({
      ...common,
      src: narrow.src,
      width: narrow.width,
      height: narrow.height,
      sizes: art.sizes,
    });
    const { props: wide } = getImageProps({
      ...common,
      src: m.src,
      width: m.width,
      height: m.height,
      sizes: sizes ?? "100vw",
    });
    const { src, srcSet, style: wideStyle, ...wideRest } = wide;
    return (
      <picture>
        <source media={art.media} srcSet={tall.srcSet} sizes={art.sizes} />
        <source srcSet={srcSet} sizes={wide.sizes} />
        {/* a bare <img>, because a <picture> needs one: both sources come from getImageProps */}
        <img
          {...wideRest}
          src={src}
          alt={alt}
          decoding="sync"
          fetchPriority={rest.fetchPriority ?? "high"}
          loading={rest.loading ?? "eager"}
          className={cn("object-cover", gradeClass, className)}
          /*
            The focal point is a VARIABLE, not a literal, and that is the one
            thing this path cannot do the plain way: the two cuts want two
            focal points and CSS cannot switch `object-position` per <source>.
            An inline literal would also beat any stylesheet rule trying to fix
            it. So the wide cut's focus is the fallback and the section's own
            stylesheet re-points `--plate-focus` inside the same media query it
            gave to `art.media`.
          */
          style={{
            ...(wideStyle ?? {}),
            objectPosition: `var(--plate-focus, ${m.focus ?? "50% 50%"})`,
            ...(rest.style ?? {}),
          }}
        />
      </picture>
    );
  }

  return (
    <Image
      src={m.src}
      alt={m.alt}
      {...(fill ? { fill: true } : { width: m.width, height: m.height })}
      sizes={sizes ?? "(min-width: 1024px) 50vw, 100vw"}
      priority={priority}
      className={cn("object-cover", gradeClass, className)}
      style={{ objectPosition: m.focus ?? "50% 50%" }}
      {...rest}
    />
  );
}
