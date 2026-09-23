import { count } from "@/content/count";
import { EASE_INOUT, EASE_OUT, EASE_PRESS, EASE_PUSH } from "@/lib/ease";
import { FLYLEAF_EVENT } from "@/lib/flyleaf";
import { NUMERALS } from "./numerals";
import { runFlyleaf, type FlyleafConfig } from "./run";
import "@/styles/flyleaf.css";

/**
 * The flyleaf: the leaf at the front of the book, which is the loading screen.
 *
 * THE COUNT. Every Kyokushin class counts its repetitions aloud in Japanese,
 * ити, ни, сан, up to дзю, and the book already numbers its chapters 一 二 三.
 * So the page is counted in: one large numeral at a time on the book's own
 * paper, one per tenth of the load, the reading of each set small at the foot.
 * The count cannot run ahead of the page (run.ts): 九 holds until the page has
 * hydrated, and 十, the only red mark, means ready. Then 十 is pushed toward
 * the reader and, at the height of the push, the page is there: the eleventh
 * cut, and the class begins.
 *
 * WHAT IS RENDERED HERE. A server component, printed at the head of <body>
 * so it is painted in the first frame, before any bundle has arrived. All ten
 * numerals are in the markup as outlines (numerals.ts), because a loading
 * screen cannot wait for a Japanese web font; CSS shows the one `data-n` names.
 * `run.ts` is serialised into the inline script right after it and owns
 * everything that moves. See styles/flyleaf.css for the states.
 */

const bezier = (c: readonly number[]) => `cubic-bezier(${c.join(",")})`;

/* ---- the rhythm, one source for the script -------------------------- */
const CONFIG: FlyleafConfig = {
  event: FLYLEAF_EVENT,
  ease: { out: bezier(EASE_OUT), inout: bezier(EASE_INOUT), press: bezier(EASE_PRESS), push: bezier(EASE_PUSH) },
  /* never two counts closer than this, so even a cached page is counted */
  beat: 170,
  /* «ку, ДЗЮ»: the last two come together */
  last: 120,
  stamp: 170,
  hold: 80,
  push: 150,
  swell: 4000,
  fade: 180,
  /* input before this is inertia from the reload, not a request */
  grace: 400,
  /* from navigation start: a page this slow is not helped by being hidden */
  wait: 10000,
  /* the head is released at once; the rest is earned; 十 waits for all of it */
  share: { head: 0.14, dom: 0.22, load: 0.28, plate: 0.22 },
};

export function Flyleaf() {
  return (
    <>
      {/* aria-hidden: the leaf is a picture of the page arriving, and the page
          itself is already in the document for anyone not looking at it */}
      <div id="flyleaf" className="flyleaf ground-paper" aria-hidden="true" suppressHydrationWarning>
        <svg className="flyleaf__sheet" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
          <g className="flyleaf__num">
            {NUMERALS.map((d, i) => (
              <path key={i} className="flyleaf__glyph" d={d} />
            ))}
          </g>
        </svg>
        <p className="flyleaf__read">
          {count.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </p>
      </div>
      <script
        /* the runtime, run in place while the document is still being parsed */
        dangerouslySetInnerHTML={{ __html: `(${runFlyleaf.toString()})(${JSON.stringify(CONFIG)})` }}
      />
    </>
  );
}
