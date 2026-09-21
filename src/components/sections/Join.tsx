"use client";

import "@/styles/sections/join.css";

import { useId, useRef, useState, type FormEvent } from "react";
import { chapters, join } from "@/content/home";
import { club } from "@/content/schedule";
import type { KanjiId } from "@/content/kanji";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { Grain } from "@/components/ui/Grain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal, Settle } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "join")!;
const HEADING_ID = "join-title";

type Field = "name" | "age" | "contact";
type Errors = Partial<Record<Field, string>>;

const REQUIRED: readonly Field[] = ["name", "age", "contact"];

/**
 * 道 — the watermark, and the only thing on this sheet that is not read.
 *
 * ONE GLYPH, AND NOT 押忍. The mark used to be the same two characters the
 * colophon prints, at the same tone, a few hundred pixels above them — a
 * repeat rather than a rhyme — and it sat directly behind the title, so what
 * actually reached the page was two halves of two glyphs poking out of the
 * display type. 道 appears nowhere else on the site, it is the second half of
 * 空手道, and on the one sheet that books a first session it names what the
 * session is the start of. It stands on the right trim, clear of every line,
 * which is where chapter 二 puts its 東 — and since the redraw below it is also
 * the head of the column the seal closes.
 *
 * DRAWN, NOT TYPESET, and that is not a stylistic preference. The page ships
 * two Latin faces and one mono and no CJK whatsoever, so a text node here
 * would resolve to Yu Gothic on Windows, Hiragino on macOS, Noto on a Linux
 * box that happens to have it and tofu on one that does not — four different
 * marks at the size of a headline. `content/kanji.ts` already holds the
 * character as KanjiVG centrelines, and `<Kanji>` strokes it through the same
 * taper table as the chapter numerals 一…六, so the glyph is the same printed
 * type as the numeral in the binding margin, on every machine.
 *
 * It is never DRAWN in the animated sense (`draw` stays false). The one
 * hand-made mark in this chapter is the sensei's brush; a watermark that
 * writes itself in front of the reader is a different claim entirely, and it
 * would also be the second gesture competing with the ensō below it.
 */
const GHOST: KanjiId = "do";

/**
 * Chapter 六 / 06 — «Запись». The last plate of the manual, and the one sheet
 * a reader is asked to write on.
 *
 * WHAT IT DOES, AND THE ONE THING IT DOES NOT. Four asks — name, age, a way to
 * answer, and whatever else the reader wants to say — assembled into a message
 * and handed back to them, with the route that reaches a human under it. There
 * is no fetch, no route to post to, no bot token and no chat id, so this
 * chapter never claims to send: `join.sending` / `success` / `error` are
 * dormant and documented as such in `content/home.ts`, and the moment a route
 * exists the submit awaits it and the slip becomes the fallback rather than
 * the outcome.
 *
 * Nothing goes out in the reader's name that they have not read first.
 * `join.opening` is the single line this page contributes to the message, it
 * states only what they just did — pressed «Записаться» on a sheet headed
 * «Первая тренировка» — and the whole assembled thing is printed back to them
 * before the route out of the page is offered.
 *
 * THIS CHAPTER IS A COLUMN, and it is the only one in the book that is. Every
 * other chapter is trimmed to the page edge; 六 is held in a centred column
 * and only its ground runs full bleed. The two rules that spanned the whole
 * trim went with the change — the chapter's opening rule and the hairline at
 * its foot — because at 1854px wide they read as two long grey dividers
 * rather than as typesetting, and they were most of what made a sheet that
 * wide look stretched. The four rules left in the chapter are the register's
 * own, and none of them divides anything: each one is the control it is drawn
 * under.
 *
 * What stands in the column is unchanged: the same twelve-column field and the
 * same two masses on it, on a narrower field, so the blanks come down with it.
 * Before the column there were two other answers and both were wrong in
 * opposite directions — a 34rem column centred on a 2560 sheet that read as a
 * form abandoned in a dark room, then every blank run edge to edge, which gave
 * a nine-letter name a 760px rule and made the one optional field a 1790 x 115
 * void. See `styles/sections/join.css` for the measurements.
 *
 *   the head      «Первая тренировка» over cols 1–8, its one line under it,
 *                 道 on the column's right edge
 *   the register  cols 1–7. Four asks stacked, each of them one line: the
 *                 label in mono at the binding edge, the blank beside it, one
 *                 rule under both. Four rules, one length, one rhythm.
 *   the seal      cols 9–12, hanging from the same line as the register: the
 *                 ensō with the ask inside it, and under it the Telegram
 *                 route for a reader who would rather just write, with what
 *                 the club promises printed under the route that delivers it
 *
 * THE ENSŌ IS DRAWN ONCE AND STAYS DRAWN. It is the chapter's closing mark and
 * never a progress indicator: it does not appear on submit, it does not spin,
 * and it does not withdraw when the slip arrives. The ask lives inside it
 * because the ring is the seal around the last question in the manual — and it
 * is a WORD on the ink now rather than a bone slab, because a hard-edged chip
 * centred in a red circle is the exact silhouette of a loading spinner.
 */
export function Join() {
  const t = join;
  const uid = useId().replace(/:/g, "");
  const slipRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState({ name: "", age: "", contact: "", note: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [request, setRequest] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = (field: Field, value: string): string | undefined => {
    if (field === "name") return value.trim().length >= 2 ? undefined : t.errors.name;
    if (field === "age") {
      const n = Number(value.trim());
      return Number.isInteger(n) && n >= 4 && n <= 99 ? undefined : t.errors.age;
    }
    return value.trim().length >= 4 ? undefined : t.errors.contact;
  };

  /* An edited entry is a new entry, so the slip withdraws on the first
     keystroke: without this, pressing the ask a second time would leave a
     stale message standing on the sheet and read as a dead control. */
  const edit = (field: Field | "note", value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setRequest(null);
    setCopied(false);
    if (field !== "note" && errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const onBlur = (field: Field) => setErrors((e) => ({ ...e, [field]: validate(field, values[field]) }));

  /*
    «7 лет», «22 года», «1 год». The unit is declined by `Intl.PluralRules`
    rather than by a hand-rolled modulo, and English falls through `other` to
    the same slot Russian uses for «лет» — which is why that record carries the
    same string three times instead of changing shape by language.
  */
  const age = (raw: string) => {
    const forms = t.years;
    const rule = new Intl.PluralRules("ru").select(Number(raw));
    const unit = rule === "one" ? forms.one : rule === "few" ? forms.few : forms.many;
    return `${raw}\u00A0${unit}`;
  };

  /*
    The message. One line from the page saying what the reader just did, then
    their own four answers and nothing else — no form numbers, no "sent from",
    no subject line. Every line a page adds here is a line the coach has to
    read past and the parent would have had to delete.
  */
  const assemble = () => {
    const who = [values.name.trim(), age(values.age.trim())].join(", ");
    return [t.opening, [who, values.contact.trim()].join("\n"), values.note.trim()]
      .filter(Boolean)
      .join("\n\n");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors = {};
    REQUIRED.forEach((f) => {
      const msg = validate(f, values[f]);
      if (msg) next[f] = msg;
    });
    setErrors(next);

    const firstBad = REQUIRED.find((f) => next[f]);
    if (firstBad) {
      setRequest(null);
      document.getElementById(`${uid}-${firstBad}`)?.focus();
      return;
    }

    setRequest(assemble());
    setCopied(false);
    /* focus follows the reader to the thing that just appeared, or a keyboard
       user is left standing on a control that seems to have done nothing */
    requestAnimationFrame(() => slipRef.current?.focus());
  };

  const copyRequest = async () => {
    if (!request) return;
    try {
      await navigator.clipboard.writeText(request);
      setCopied(true);
    } catch {
      /* no clipboard permission, or an insecure origin. The slip is
         `user-select: all`, so one click still selects the whole request — the
         control simply says nothing rather than claiming a copy it did not
         make. */
      setCopied(false);
    }
  };

  /*
    `?text=` is a best effort and never the mechanism. Telegram prefills the
    message box from it on the clients that honour it and silently opens a bare
    chat on the ones that do not, so the slip above the link — the message,
    printed, with a control that copies it — is what actually carries the
    request across. Which is also why `slipNote` says the request does not
    leave on its own: that is true on every client, not only the unlucky ones.
  */
  const carry = request ? `${club.telegram}?text=${encodeURIComponent(request)}` : club.telegram;

  /*
    One ask, one line of the register: a label, a blank, and a single rule
    under both. THE RULE BELONGS TO THE ROW, not to the input, which is the
    difference between a ruled form and a page of boxes, and it is why the row
    carries `data-invalid` rather than the control: a proof mark runs the width
    of the line it marks.

    THE MESSAGE IS TAKEN OUT OF FLOW and hung under the rule, ranged with the
    ANSWER rather than with the label: it is about what was typed, and set at
    the binding edge under a mono label it reads as a second line of that
    label. In flow it moves something whatever you do with it. Left in the
    blank it pushes the blank's half of the rule down while the label's half
    stays put, so one line of type breaks the row in two; given a grid row of
    its own it shoves the remaining asks down the sheet at the exact moment the
    reader is being told they got something wrong. Absolute inside the blank it
    reserves nothing and moves nothing, and `--row-gap` is floored at 2rem so
    the one line it ever takes has somewhere to hang.
  */
  const field = (name: Field, extra?: Record<string, string | number>) => {
    const id = `${uid}-${name}`;
    const errId = `${id}-err`;
    const err = errors[name];
    return (
      <div className="join-row" data-invalid={err ? "" : undefined}>
        <label htmlFor={id} className="t-mono join-label">
          {t.fields[name]}
        </label>
        <div className="join-blank">
          <input
            id={id}
            name={name}
            type="text"
            className="join-input"
            /* Only the contact ask carries one, and it is a FORMAT and not an
               example: a placeholder is held to the same text tone as the
               label beside it, so a plausible name sitting in the name blank
               reads as an answer already given. See `join.placeholders`. */
            placeholder={name === "contact" ? t.placeholders.contact : undefined}
            value={values[name]}
            aria-invalid={err ? true : undefined}
            aria-describedby={err ? errId : undefined}
            onChange={(e) => edit(name, e.target.value)}
            onBlur={() => onBlur(name)}
            {...extra}
          />
          {err && (
            <p id={errId} role="alert" className="t-caption join-error">
              {err}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title}
      labelledBy={HEADING_ID}
      ground="ink"
      /* `overflow-x-clip`, never `overflow-hidden`: hidden on either axis makes
         this section its own scroll container, which would pin the sticky
         binding numeral at the chapter head and undo the rail. Clip holds the
         watermark's overhang inside the paper without that side effect. */
      className="join relative overflow-x-clip"
      bleed={<Grain opacity={0.22} />}
    >
      <div className="join__sheet wrap relative z-10">
        {/* ---- the head ----
            The glyph is positioned OUT of flow so the title and its line alone
            set the height of this band. In flow it would be a ~350px square
            deciding the chapter's proportions, and 道 would stop being a
            watermark and start being a picture with a caption. */}
        <div className="join__head">
          <h2 id={HEADING_ID} className="t-chapter join__title">
            <LineReveal as="span" className="block" lines={[t.title]} />
          </h2>

          <Reveal delay={0.16} y={20} className="join__lead-band">
            <p className="t-lead join__lead">{t.lead}</p>
          </Reveal>

          <div className="join__ghost" aria-hidden="true">
            <Kanji id={GHOST} className="join__ghost-glyph" weight={5.5} label={null} />
          </div>
        </div>

        {/* `noValidate`: the browser's own bubbles are a different typeface, a
            different voice and sometimes a different language from the page,
            and they cannot be ranged under the rule the field is drawn with.
            Every message here is `t.errors`, set in the page's type. */}
        <form noValidate onSubmit={onSubmit} className="join-form">
          <div className="join-body">
            {/*
              ---- the register ----
              One <Reveal>, not four: the four asks share a rhythm and a left
              edge, and staggering them turns a ruled form into a hand of cards
              being dealt. It is a printed block and it arrives as one.
            */}
            <Reveal delay={0.06} y={18} className="join-register">
              {field("name", { autoComplete: "given-name" })}
              {field("age", { inputMode: "numeric", autoComplete: "off", maxLength: 2 })}
              {field("contact", { autoComplete: "tel" })}

              <div className="join-row">
                <label htmlFor={`${uid}-note`} className="t-mono join-label">
                  {t.fields.note}
                </label>
                <div className="join-blank">
                  <textarea
                    id={`${uid}-note`}
                    name="note"
                    rows={2}
                    className="join-input join-input--area"
                    value={values.note}
                    onChange={(e) => edit("note", e.target.value)}
                  />
                </div>
              </div>
            </Reveal>

            {/* ---- the seal ----
                The ask, and the way out for a reader who would rather not fill
                a sheet in at all. It hangs from the same line as the register
                and closes on the same right trim the 道 above it closes on, so
                the two ends of the spread are the two ends of the page. The
                word «или» is doing real work there: it is the alternative to
                the form rather than a second control on it, and the trust line
                stays with it so that what the club promises is printed next to
                the route that delivers it. */}
            <div className="join-act">
              <Settle delay={0.24} className="join-act__press">
                <div className="join-ring">
                  <Brush kind="enso" className="join-enso" delay={0.5} />
                  <button type="submit" className="join-cta t-mono">
                    {t.submit}
                  </button>
                </div>
              </Settle>

              <Reveal delay={0.32} y={18} className="join-act__exit">
                <a href={club.telegram} className="join-out t-note" rel="noopener">
                  <span className="join-out__label">{t.alt}</span>
                  <span aria-hidden="true" className="join-out__arrow">
                    →
                  </span>
                </a>
                <p className="t-note join__trust">{t.trust}</p>
              </Reveal>
            </div>
          </div>

          {/*
            The slip. It is in the tree from the first paint and empty until the
            reader presses — a live region that mounts already carrying its text
            is announced by some screen readers and missed by others — so at
            rest it is a zero-height region reserving no band of ink. It sits
            OUTSIDE `.join-body`, and that is a layout fact rather than a
            semantic one: an empty item in a gapped grid is still a row, and an
            empty row still costs its gap.

            It prints below the spread, so pressing the ask never moves the ask.
          */}
          <div role="status">
            {request !== null && (
              <Settle mode="load" duration={0.5} className="join-slip">
                <p className="t-mono join-slip__cap">{t.slip}</p>
                <div ref={slipRef} tabIndex={-1} className="t-note join-slip__text">
                  {request}
                </div>
                <p className="t-note join-slip__note">{t.slipNote}</p>
                <div className="join-slip__foot">
                  <button type="button" onClick={copyRequest} className="t-mono join-copy">
                    {copied ? t.copied : t.copy}
                  </button>
                  <a href={carry} rel="noopener" className="join-out t-mono">
                    <span className="join-out__label">{t.open}</span>
                    <span aria-hidden="true" className="join-out__arrow">
                      →
                    </span>
                  </a>
                </div>
              </Settle>
            )}
          </div>
        </form>
      </div>
    </Chapter>
  );
}
