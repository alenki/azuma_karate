import { brushMarks, type BrushKind } from "@/components/brush/marks";

/**
 * The press.
 *
 * Every filter the manual is printed through, defined once per document and
 * referenced by id. Three families live here:
 *
 *   duotone-*     the two-colour plate, for photographs
 *   ink-* / dry-* the brush, for the sensei's marks
 *   press-seal-*  the stone, for the club's hanko
 *
 * They are defined once per document rather than per instance so the browser
 * rasterises each filter once and every mark that pulls it shares it. The two
 * hand-made families are built PRESS_SEEDS times each, though: a press shared
 * by every instance of a kind IS a rubber stamp, and the marks on this page
 * have to be impressions. Which one a mark pulls is chosen by its seed.
 */

/* ------------------------------------------------------------------ */
/* 1 · The two-colour press                                            */
/*                                                                     */
/* A photograph in this manual is not "a desaturated photograph" — it is */
/* a plate pulled in the two inks the page is printed in. feColorMatrix  */
/* takes the luminance of the source and feComponentTransfer maps that   */
/* single channel onto a line between two tokens, so the darkest tone in  */
/* every plate is exactly one ink and the lightest is exactly the other.  */
/* Nothing else survives the filter, which is the point: a full-colour     */
/* sunrise cannot smuggle a second hue onto a page that claims one.        */
/*                                                                        */
/* There are two, because the page is printed on two grounds. Pressing an  */
/* ink chapter's plate to paper-white blows a hole in the black; it has to */
/* run to bone, the ink ramp's own highlight.                             */
/*                                                                        */
/*   ink   #151311 -> .082 .075 .067      paper #F3EFE6 -> .953 .937 .902 */
/*   ink   #151311 -> .082 .075 .067      bone  #EFE9DD -> .937 .914 .867 */
/* ------------------------------------------------------------------ */
const LUMA = `0.2126 0.7152 0.0722 0 0
              0.2126 0.7152 0.0722 0 0
              0.2126 0.7152 0.0722 0 0
              0      0      0      1 0`;

function Duotone({ id, to }: { id: string; to: [number, number, number] }) {
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values={LUMA} />
      <feComponentTransfer>
        <feFuncR type="table" tableValues={`0.082 ${to[0]}`} />
        <feFuncG type="table" tableValues={`0.075 ${to[1]}`} />
        <feFuncB type="table" tableValues={`0.067 ${to[2]}`} />
      </feComponentTransfer>
    </filter>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · The hand, as arithmetic                                         */
/*                                                                     */
/* No mark on this page may repeat. But every jitter has to survive the */
/* server: Motion serialises `initial` and React refuses to patch a     */
/* mismatched attribute, so a mark placed with Math.random would land   */
/* in one place in the HTML and another after hydration and the whole   */
/* SVG would repaint. So the hand is a pure function of a seed — FNV-1a */
/* for the hash, splitmix32 for the stream — and the seed itself is     */
/* either passed by the call site or taken from React's own per-instance */
/* `useId`, which is guaranteed identical across that boundary.         */
/* ------------------------------------------------------------------ */

/** How many impressions of each press exist. Three is too few to hide a repeat
 *  in a row of eight; more than four is filters nobody will ever look at. */
export const PRESS_SEEDS = 4;

/** feTurbulence phases, and a frequency shift to go with each: two
 *  impressions should differ in the SIZE of their tooth as well as in its
 *  position — a different sheet of paper, not the same sheet slid sideways. */
const PHASE = [7, 23, 61, 97];
const SCALE = [1, 0.93, 1.08, 0.87];
/** [0, 1, … PRESS_SEEDS-1] — every press is built once per impression. */
const IMPRESSIONS = Array.from({ length: PRESS_SEEDS }, (_, v) => v);

/** 32-bit FNV-1a. Pure, so SSR and the client agree on every jitter. */
export function seedHash(seed: string | number): number {
  const s = String(seed);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The i-th draw from a hash, in [0, 1). splitmix32's finaliser. */
export function seedFloat(hash: number, i: number): number {
  let x = (hash + Math.imul(i + 1, 0x9e3779b9)) | 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

/** …the same draw centred on zero, in [-1, 1) — which is what a jitter wants. */
export const seedSigned = (hash: number, i: number) => seedFloat(hash, i) * 2 - 1;

/** Which of the four impressions a seed pulls. */
export const pressVariant = (hash: number) => Math.floor(seedFloat(hash, 0) * PRESS_SEEDS) % PRESS_SEEDS;

/* ------------------------------------------------------------------ */
/* 3 · The brush                                                       */
/*                                                                     */
/* marks.ts gives each mark as a filled silhouette. Filled, it renders as */
/* a vector blob — the concept says brush and the render says            */
/* border-radius. Three things separate ink from a shape, and all three   */
/* are done here rather than in the geometry, so the mask-reveal          */
/* animation is untouched:                                               */
/*                                                                       */
/*   tooth    the edge is displaced by low-frequency noise, so the        */
/*            silhouette stops being a machined curve                    */
/*   mottle   the ink's density varies where the paper's tooth held less  */
/*            pigment — a fine noise field multiplied into the alpha      */
/*   bleed    a faint blurred copy underneath, ink wicking into fibre     */
/*                                                                       */
/* Every parameter is expressed as a fraction of the mark's own `thick`,  */
/* so one formula serves a 64-unit hero stroke and a 26-unit ring. And    */
/* each is built PRESS_SEEDS times, so two marks of the same kind are two */
/* impressions rather than one shape printed twice.                       */
/* ------------------------------------------------------------------ */
function Ink({ id, thick, v }: { id: string; thick: number; v: number }) {
  const warp = ((2.2 * SCALE[v]) / thick).toFixed(4);
  /* the press varies its own bite by ±10% as well as its phase: the same
     bristles do not carry the same load twice */
  const disp = (0.07 * thick * (0.9 + 0.2 * seedFloat(PHASE[v], 3))).toFixed(2);
  const grain = ((42 * SCALE[v]) / thick).toFixed(4);
  const blur = (0.02 * thick).toFixed(2);
  return (
    <filter id={id} x="-10%" y="-40%" width="120%" height="180%" colorInterpolationFilters="sRGB">
      {/* tooth */}
      <feTurbulence type="fractalNoise" baseFrequency={warp} numOctaves="2" seed={PHASE[v]} result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale={disp} xChannelSelector="R" yChannelSelector="G" result="edge" />
      {/* mottle — white with a noise alpha, multiplied into the ink's own alpha.
          feComposite arithmetic k1=1 multiplies two premultiplied layers, so a
          white-with-alpha field scales the ink's coverage and leaves its hue. */}
      <feTurbulence type="fractalNoise" baseFrequency={grain} numOctaves="3" seed={PHASE[v] + 16} result="grain" />
      <feColorMatrix
        in="grain"
        type="matrix"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.34 0.34 0.34 0 0"
        result="mottleRaw"
      />
      <feComponentTransfer in="mottleRaw" result="mottle">
        {/* the noise clusters around the middle of its range, so a table that is
            flat at 1 across the top half leaves most of the stroke fully dense
            and only lightens where the paper was highest */}
        <feFuncA type="table" tableValues="0.62 0.88 1 1 1" />
      </feComponentTransfer>
      <feComposite in="edge" in2="mottle" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="ink" />
      {/* bleed */}
      <feGaussianBlur in="ink" stdDeviation={blur} result="halo" />
      <feComponentTransfer in="halo" result="haloDim">
        <feFuncA type="linear" slope="0.34" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="haloDim" />
        <feMergeNode in="ink" />
      </feMerge>
    </filter>
  );
}

/**
 * The dry tail, as a mask.
 *
 * A brush running out of ink does not fade — a smooth ramp to transparent is
 * the one thing that reads as a CSS gradient rather than as pigment. It breaks:
 * the bristles separate and what is left is full-strength ink in ribbons with
 * bare paper between them.
 *
 * So the falloff is a gradient that never touches the artwork directly. It is
 * fed to a filter as SourceGraphic, where its luminance is a position signal:
 * streak noise (very low frequency along the stroke, high across it) is added
 * to it and the sum is pushed through a steep table, which thresholds it into
 * ribbons. Where the gradient is white the sum always clears the threshold and
 * the ink is solid; where it is black only the crests of the noise survive.
 *
 * Only linear marks get one — the gradient runs along x, so it is meaningless
 * on a ring, where it would dry one SIDE of the circle rather than the end of
 * the gesture.
 */
function Dry({ id, thick, w, h, v }: { id: string; thick: number; w: number; h: number; v: number }) {
  const fx = ((0.55 * SCALE[v]) / thick).toFixed(5);
  const fy = ((60 * SCALE[v]) / thick).toFixed(4);
  const table = "0 0 0.1 0.9 1 1";
  return (
    <>
      <filter id={`${id}-f`} x="-5%" y="-20%" width="110%" height="140%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency={`${fx} ${fy}`} numOctaves="2" seed={PHASE[v] + 6} result="streak" />
        <feColorMatrix
          in="streak"
          type="matrix"
          values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"
          result="streakGrey"
        />
        <feComposite in="SourceGraphic" in2="streakGrey" operator="arithmetic" k1="0" k2="1" k3="0.8" k4="-0.34" result="mix" />
        <feComponentTransfer in="mix">
          <feFuncR type="table" tableValues={table} />
          <feFuncG type="table" tableValues={table} />
          <feFuncB type="table" tableValues={table} />
        </feComponentTransfer>
      </filter>
      <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2="0">
        <stop offset="0" stopColor="#fff" />
        <stop offset="0.55" stopColor="#fff" />
        <stop offset="1" stopColor="#000" />
      </linearGradient>
      <mask id={id} maskUnits="userSpaceOnUse" x={-w} y={-h} width={w * 3} height={h * 3}>
        <rect x={-w} y={-h} width={w * 3} height={h * 3} fill={`url(#${id}-g)`} filter={`url(#${id}-f)`} />
      </mask>
    </>
  );
}

/**
 * The hero's 一, which is not a <Brush> at all.
 *
 * Chapter one's stroke is a generated silhouette used as a CSS `mask-image` on
 * a vermilion box, so it never passes through the SVG mark pipeline. It still
 * has to be ink. The filter cannot go on the masked element — CSS applies
 * filter BEFORE mask, so it would displace a plain rectangle and the mask would
 * then cut it back to a machined edge — so it goes on that element's PARENT,
 * where what it receives is the already-masked shape.
 *
 * That also means this one is measured in CSS pixels rather than in viewBox
 * units, which is the better end of the bargain: the tooth stays about six
 * pixels whether the sheet is 390 or 2560 wide, instead of scaling up with the
 * mark until it reads as a wobble.
 */
function HeroInk() {
  return (
    <filter id="ink-hero" x="-4%" y="-30%" width="108%" height="160%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.032" numOctaves="2" seed="7" result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="7" xChannelSelector="R" yChannelSelector="G" result="edge" />
      {/*
        The mottle is pitched for the size the mark is actually read at, which
        is the whole width of the sheet. At baseFrequency 0.85 every feature was
        about a pixel across: correct for a 200-unit ring in a chapter, and on a
        2500px poster stroke it anti-aliases into a flat wash — the edges had
        tooth and the ink inside them had none. 0.11 puts the coarsest features
        at roughly nine pixels and the three octaves carry it down to two, so
        the density reads both from across the room and with a nose against the
        screen.
      */}
      <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="3" seed="23" result="grain" />
      <feColorMatrix
        in="grain"
        type="matrix"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.34 0.34 0.34 0 0"
        result="mottleRaw"
      />
      <feComponentTransfer in="mottleRaw" result="mottle">
        <feFuncA type="table" tableValues="0.58 0.86 1 1 1" />
      </feComponentTransfer>
      <feComposite in="edge" in2="mottle" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="ink" />
      <feGaussianBlur in="ink" stdDeviation="1.4" result="halo" />
      <feComponentTransfer in="halo" result="haloDim">
        <feFuncA type="linear" slope="0.32" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="haloDim" />
        <feMergeNode in="ink" />
      </feMerge>
    </filter>
  );
}

/**
 * Which marks are printed through the press.
 *
 * Only the marks that are actually read at size. `sei`, `check`, `tick` and the
 * quote brackets are set at twenty or thirty pixels, where a displacement of a
 * fraction of a unit is invisible and a mottle at forty cycles per unit is
 * moiré. They stay as they are drawn.
 *
 * `ichi` joined the list when chapter four started printing one at the width of
 * its own column — a thousand CSS pixels of vermilion, which is the largest
 * mark in the book and the one that can least afford to render as a vector
 * leaf. Its `thick` is 64, so every fraction below resolves against a stroke
 * more than twice the underline's: the formula did not need a special case.
 */
export const INKED: BrushKind[] = ["enso", "circle", "underline", "ichi"];
/** …and of those, the ones whose gesture runs along x, so a tail can dry. */
export const DRIED: BrushKind[] = ["underline", "ichi"];

/**
 * `variant` is the impression, 0…PRESS_SEEDS-1, normally `pressVariant(hash)`.
 *
 * The small marks are deliberately not on this list, and no amount of seeding
 * changes that: 正 prints 109 viewBox units into about 46 CSS pixels, so its
 * 9.5-unit stroke is four pixels wide and any edge tooth worth the name is
 * sub-pixel. Those marks are varied by the hand instead — see Brush.
 */
export const inkFilter = (kind: BrushKind, variant = 0) =>
  INKED.includes(kind) ? `ink-${kind}-${variant % PRESS_SEEDS}` : null;
export const dryMask = (kind: BrushKind, variant = 0) =>
  DRIED.includes(kind) ? `dry-${kind}-${variant % PRESS_SEEDS}` : null;

/* ------------------------------------------------------------------ */
/* 4 · The seal                                                        */
/*                                                                     */
/* A hanko is not drawn, it is pressed, and a press does three things a  */
/* vector circle does not: it bites the paper unevenly, it squeezes ink  */
/* out past its own edge, and it skips wherever the stone did not meet   */
/* the sheet. The filter therefore has to reach the WHOLE device — ring, */
/* legend and centre glyph together. A seal with a rough ring and crisp  */
/* type is not a seal, it is a logo, which is why Seal.tsx now draws its */
/* 東 inside the SVG instead of floating it over the top in a div.       */
/*                                                                      */
/* Units are the seal's own 200-unit viewBox, which renders at 112-160px, */
/* so one unit is about 0.6-0.8px: a 4.4-unit displacement is the ~2px    */
/* bite a stamp of this size actually leaves.                            */
/* ------------------------------------------------------------------ */
function SealPress({ id, v }: { id: string; v: number }) {
  return (
    <filter id={id} x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
      {/* the bite: four octaves off a 17-unit base, so the ring wanders (the
          coarse octave) and its edge frays (the fine ones) at the same time.
          Proofed against three weaker and one stronger setting: below this the
          seal is a vector circle with a wobble, above it the 東 in the middle
          starts coming apart at the 112px the smaller of the two seals prints. */}
      <feTurbulence
        type="fractalNoise"
        baseFrequency={(0.06 * SCALE[v]).toFixed(4)}
        numOctaves="4"
        seed={PHASE[v]}
        result="warp"
      />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="4.4" xChannelSelector="R" yChannelSelector="G" result="edge" />
      {/* where the stone skipped */}
      <feTurbulence
        type="fractalNoise"
        baseFrequency={(0.12 * SCALE[v]).toFixed(4)}
        numOctaves="3"
        seed={PHASE[v] + 31}
        result="skip"
      />
      <feColorMatrix
        in="skip"
        type="matrix"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.34 0.34 0.34 0 0"
        result="biteRaw"
      />
      <feComponentTransfer in="biteRaw" result="bite">
        {/* the noise sits around the middle of its range, so the stamp prints at
            about nine tenths everywhere and drops to a third only in the tail —
            a seal reads as pressed because of the few places it did NOT print */}
        <feFuncA type="table" tableValues="0 0.4 0.82 1 1" />
      </feComponentTransfer>
      <feComposite in="edge" in2="bite" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="ink" />
      {/* squeeze-out: the bead of ink pushed past the edge by the pressure */}
      <feMorphology in="ink" operator="dilate" radius="0.35" result="squeeze" />
      <feGaussianBlur in="squeeze" stdDeviation="0.6" result="squeezeSoft" />
      <feComponentTransfer in="squeezeSoft" result="squeezeDim">
        <feFuncA type="linear" slope="0.28" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="squeezeDim" />
        <feMergeNode in="ink" />
      </feMerge>
    </filter>
  );
}

/** The press a seal is stamped with; `variant` picks the impression. */
export const sealPress = (variant = 0) => `press-seal-${variant % PRESS_SEEDS}`;

/**
 * Rendered once per document, from the root layout. next/image emits a plain
 * <img>, so a same-document `filter: url(#…)` applies to it.
 */
export function PressDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <Duotone id="duotone-paper-ink" to={[0.953, 0.937, 0.902]} />
        <Duotone id="duotone-ink-bone" to={[0.937, 0.914, 0.867]} />
        <HeroInk />
        {IMPRESSIONS.map((v) => (
          <SealPress key={v} id={sealPress(v)} v={v} />
        ))}
        {INKED.map((kind) =>
          IMPRESSIONS.map((v) => (
            <Ink key={`${kind}-${v}`} id={`ink-${kind}-${v}`} thick={brushMarks[kind].thick} v={v} />
          )),
        )}
        {DRIED.map((kind) =>
          IMPRESSIONS.map((v) => (
            <Dry
              key={`${kind}-${v}`}
              id={`dry-${kind}-${v}`}
              thick={brushMarks[kind].thick}
              w={brushMarks[kind].width}
              h={brushMarks[kind].height}
              v={v}
            />
          )),
        )}
      </defs>
    </svg>
  );
}
