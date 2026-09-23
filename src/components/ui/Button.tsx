import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
/*
  The press's paint lives in `styles/sections/chrome.css`, and it is imported
  HERE rather than left to <Header> happening to be mounted: this component is
  the only thing on the page that emits `.btn-press` markup, so the stylesheet
  is its dependency, not the header's.
*/
import "@/styles/sections/chrome.css";

type Variant = "ink" | "text";

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  href?: string;
  /** Render as an in-page anchor (no Next routing). */
  plain?: boolean;
  size?: "md" | "lg";
  /**
   * Print the vermilion half. On by default — the seal IS the control.
   *
   * Turn it off only for an action that already stands inside a red mark: the
   * sign-up submit sits in the middle of the ensō, and a second vermilion in
   * the same field would be two seals on one impression.
   */
  seal?: boolean;
} & Omit<ComponentProps<"button">, "children" | "className">;

/*
  THE PRESS — the page's primary control.

  There used to be two objects doing this one job. The hero had a considered
  CTA hand-built in hero.css — an ink label block welded to a vermilion square
  carrying the arrow, the two halves swapping under the pointer, which is the
  black pass and the red pass printed as one object — and everywhere else the
  same action was `.btn-ink`: a flat #151311 rectangle with white mono in it.
  That slab was the loudest mass in the header and the only element on a page
  about paper, ink and one vermilion with no printerly reasoning behind it.

  So the hero's object is the control now, and the header CTA, the contents
  page's CTA and the schedule's Telegram CTA all print it. The variant is
  still called `ink` because the ink half is still what it is: a block of
  solid ink with a label knocked out of it. What changed is that the second
  pass is on it.

  `--press-h` is the whole size system: the label's height floor AND the seal's
  edge, because the seal is square. Set it from the call site's stylesheet —
  chrome.css does it for the header at 44/48/56px — and the two halves stay
  in register at every width.
*/
const PRESS = "btn btn-press select-none cursor-pointer";

/* The typeset slab, for everything that is not the primary action. */
const SLAB =
  "btn inline-flex items-center justify-center gap-3 font-mono uppercase tracking-[0.12em] " +
  "min-h-11 px-6 text-[0.75rem] transition-[background-color,color,border-color,transform] duration-300 " +
  "ease-[var(--ease-out)] select-none cursor-pointer";

/**
 * Typeset buttons. `ink` is the press (above); `text` is a mono label ruled
 * under, for a secondary reference. The `outline` variant is gone — it had no
 * call site, and a third paint for the same action was a third answer to a
 * question the page had already answered twice.
 */
export function Button({
  children,
  variant = "ink",
  className,
  href,
  plain,
  size = "md",
  seal = true,
  ...rest
}: ButtonProps) {
  const press = variant === "ink";
  const cls = press
    ? cn(PRESS, size === "lg" && "btn-press--lg", className)
    : cn(SLAB, "btn-text min-h-0 px-0", size === "lg" && "min-h-14 px-8 text-[0.8125rem]", className);

  /*
    The label is a real element, not the anchor's own text, because the ink
    half has to be paintable independently of the red one — that swap is the
    hover state. The seal is aria-hidden: the arrow is a printed ornament and
    the accessible name is the label beside it.
  */
  const content = press ? (
    <>
      <span className="btn-press__label t-mono">{children}</span>
      {seal && (
        <span className="btn-press__seal" aria-hidden="true">
          <span className="btn-press__arrow">→</span>
        </span>
      )}
    </>
  ) : (
    children
  );

  if (href) {
    if (plain || href.startsWith("#") || /^https?:/.test(href)) {
      return (
        <a href={href} className={cls} {...(rest as ComponentProps<"a">)}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  );
}
