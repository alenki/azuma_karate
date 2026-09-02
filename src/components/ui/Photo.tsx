"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/cn";
import { useLocale } from "@/i18n/LocaleProvider";
import { media, type MediaKey } from "@/content/media";

type PhotoProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  slot: MediaKey;
  className?: string;
  /** `bw` prints the plate in the manual's grayscale grade. */
  grade?: "bw" | "color" | "muted";
  /** Fill the parent (parent must be positioned and sized). */
  fill?: boolean;
};

/**
 * A photographic plate. Reads its source and alt text from the media manifest
 * so the client's photography can replace the placeholders in one file.
 */
export function Photo({ slot, className, grade = "bw", fill = true, sizes, priority, ...rest }: PhotoProps) {
  const { locale } = useLocale();
  const m = media[slot];
  const gradeClass =
    grade === "bw" ? "plate-bw" : grade === "muted" ? "plate-muted" : undefined;
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
