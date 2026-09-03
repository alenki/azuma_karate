/**
 * The two-colour press.
 *
 * A photograph in this manual is not "a desaturated photograph" — it is a plate
 * pulled in the two inks the page is printed in. `feColorMatrix` takes the
 * luminance of the source, and `feComponentTransfer` then maps that single
 * channel onto a line from `--color-ink` at black to `--color-paper` at white,
 * so the darkest tone in every plate is exactly the page's ink and the lightest
 * is exactly its paper. Nothing else can survive the filter, which is the
 * point: a full-colour sunrise cannot smuggle a second hue onto a page that
 * claims one.
 *
 * The `saturate(0.72)` grade this replaces could not do it — it keeps 72% of the
 * chroma, so it dims a hue rather than removing it.
 *
 * The table values are the two tokens, in sRGB:
 *   ink   #151311 -> 21/255, 19/255, 17/255 = .082 .075 .067
 *   paper #F3EFE6 -> 243/255, 239/255, 230/255 = .953 .937 .902
 *
 * Rendered once per document. `next/image` emits a plain <img>, so a
 * same-document `filter: url(#…)` applies to it.
 */
export function DuotoneDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id="duotone-paper-ink" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0      0      0      1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.082 0.953" />
            <feFuncG type="table" tableValues="0.075 0.937" />
            <feFuncB type="table" tableValues="0.067 0.902" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
