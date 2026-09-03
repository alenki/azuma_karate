"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/cn";
import { useLocale } from "@/i18n/LocaleProvider";
import { media, type MediaKey } from "@/content/media";

type PhotoProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  slot: MediaKey;
  className?: string;
  /**
   * How the plate is pressed (see ui/PressDefs).
   *
   * `duotone` runs the image's luminance from ink to paper; `duotone-ink` runs
   * it from ink to bone, which is what a plate on a dark chapter needs — the
   * paper-white highlight of the first blows a hole in the ground. `bw` is the
   * plain grayscale grade.
   *
   * `color` is not a plate. It exists for one device only — chapter 04, where
   * the reader can lift the grade off the sensei's portrait and see him as his
   * students do — and it is always something a reader turns on, never something
   * the manual prints. The trophies used to claim it too, and that was simply a
   * hole in the palette: gold cups, a yellow cloth and blue ribbons, printed,
   * on a black chapter. They are pressed in the ink ramp now.
   */
  grade?: "bw" | "duotone" | "duotone-ink" | "color";
  /** Fill the parent (parent must be positioned and sized). */
  fill?: boolean;
};

/**
 * A photographic plate. Reads its source and alt text from the media manifest
 * so the client's photography can replace the placeholders in one file.
 */
export function Photo({ slot, className, grade = "duotone", fill = true, sizes, priority, ...rest }: PhotoProps) {
  const { locale } = useLocale();
  const m = media[slot];
  const gradeClass =
    grade === "color"
      ? undefined
      : grade === "duotone"
        ? "plate-duotone"
        : grade === "duotone-ink"
          ? "plate-duotone-ink"
          : "plate-bw";
  return (
    <Image
      src={m.src}
      alt={m.alt[locale]}
      {...(fill ? { fill: true } : { width: m.width, height: m.height })}
      sizes={sizes ?? "(min-width: 1024px) 50vw, 100vw"}
      priority={priority}
      className={cn("object-cover", gradeClass, className)}
      style={{ objectPosition: m.focus ?? "50% 50%" }}
      {...rest}
    />
  );
}
