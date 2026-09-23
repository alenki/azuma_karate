/**
 * Generates public/api/join-message.json — the only copy the PHP relay knows.
 *
 *   npx tsx scripts/gen-join-message.ts
 *
 * WHY THIS EXISTS. `src/content/home.ts` is the single source for every string
 * on the site, and chapter 六's message is now assembled twice: once in the
 * browser to print the receipt, once in `public/api/send.php` to build what
 * the coach actually receives. Retyping the opening line and the three plural
 * forms into a PHP file would be the first place this manual ever kept a
 * sentence in two hands, and the two would drift the first time the club
 * reworded the line. So the relay reads them, and this script is the only
 * thing that writes them.
 *
 * THE OUTPUT IS PURE ASCII, deliberately. Every Cyrillic letter and the bound
 * space are emitted as \uXXXX escapes, so the file survives an FTP client in
 * text mode, an editor that guesses cp1251, and a control panel that re-saves
 * it — all of which are live risks on the shared hosting this ships to, and
 * all of which would otherwise corrupt the first message a parent sends.
 * `json_decode` restores the exact characters on the other side.
 *
 * Run it after touching `join.opening` or `join.years`. Nothing checks for
 * you: the relay is on a different machine from the build.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { join as joinCopy } from "../src/content/home";

/*
  A backslash, BUILT rather than typed. A literal one does not reliably survive
  the round trip into this repo's files through either editing path, and the
  whole point of the file below is that its escapes are exact. See the note in
  CLAUDE.md about authoring bound spaces.
*/
const BS = String.fromCharCode(92);

/**
 * `JSON.stringify` with every non-ASCII code unit escaped.
 *
 * Iterating UTF-16 code units rather than code points is the correct choice
 * and not a shortcut: a surrogate pair comes out as the two `\uXXXX` halves
 * JSON actually specifies, which is what a decoder expects.
 */
function asciiJson(value: unknown): string {
  const raw = JSON.stringify(value, null, 2);
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    out += code > 126 ? BS + "u" + code.toString(16).padStart(4, "0") : raw[i];
  }
  return out;
}

const payload = {
  /* One line, and it is the only sentence the PAGE contributes to a message
     made of somebody else's answers. */
  opening: joinCopy.opening,
  /* «1 год» / «22 года» / «7 лет». The relay picks the slot with the same
     rule `Intl.PluralRules` applies in the browser. */
  years: joinCopy.years,
};

/* Resolved from the working directory, matching gen-hero-stroke.ts: both are
   documented as being run from the repo root. */
const out = resolve(process.cwd(), "public/api/join-message.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, asciiJson(payload) + "\n", "ascii");

console.log("wrote", out);
console.log(asciiJson(payload));
