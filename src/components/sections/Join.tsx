"use client";

import "@/styles/sections/join.css";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
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
 * Where the заявка is posted.
 *
 * `/api/send.php` is a RELATIVE path on purpose: the relay ships in `public/`
 * and lands next to the exported page, so the request is same-origin and
 * there is no CORS preflight, no second host and no way for the endpoint to
 * be reached from anywhere but this site.
 *
 * Setting `NEXT_PUBLIC_JOIN_ENDPOINT` to an EMPTY STRING turns the relay off
 * and restores exactly what this chapter did before one existed: the message
 * is assembled, printed, and carried by hand. That is the right setting for
 * `next dev`, where the .php is served as its own source text, and it is also
 * the honest setting for a deploy where the club has not set up the bot yet.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_JOIN_ENDPOINT ?? "/api/send.php";

/**
 * What became of a pressed заявка. `text` is the message as the READER sees
 * it; the one that travelled was built by the relay from the raw fields.
 *
 *   sent    the relay confirmed it
 *   carry   nothing is answering there, so nothing was attempted
 *   failed  the relay answered and said no
 */
type Outcome = { kind: "sent" | "carry" | "failed"; text: string };

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
 * IT SENDS NOW. For most of this chapter's life it could not: four asks were
 * assembled into a message, printed back to the reader, and handed to them to
 * carry into Telegram by hand, because there was no bot token, no chat id and
 * no address the club had agreed an enquiry should land in. There is now.
 * `public/api/send.php` posts the message to the club's own bot, and the three
 * strings that described a POST while this chapter performed none —
 * `join.sending` / `success` / `error` — are finally saying something true.
 *
 * WHY THE ROUTE IS A PHP FILE AND NOT A ROUTE HANDLER. The club's hosting is
 * shared: Apache and PHP, no Node. `next build` has to be a static export, and
 * under `output: 'export'` a Next route handler is GET-only and rendered to a
 * file at build time. There is no runtime to POST to. The relay's own header
 * comment carries the rest.
 *
 * THE SLIP DID NOT GO AWAY, IT CHANGED JOB. It used to be the outcome; it is
 * now the fallback, and which of the three things it prints is the whole state
 * machine of this chapter:
 *
 *   sent    the relay confirmed. `success` over a RECEIPT of the message,
 *           because the reader should still see every word that went out in
 *           their name even though they no longer carry it.
 *   carry   there is no relay answering: no endpoint configured, or a reply
 *           that is not ours. Prints the old slip and NOTHING ELSE. Nothing
 *           failed and nothing was sent, so the page claims neither.
 *   failed  the relay answered and said no. `error` over the old slip, with
 *           the copy control and the Telegram route under it, so a reader
 *           whose request did not go through is left exactly where they stood
 *           before any of this existed rather than at a dead end.
 *
 * WHAT GOES OVER THE WIRE IS THE FOUR RAW ANSWERS, never the assembled text.
 * A relay that accepted finished text would be an open relay into the coach's
 * phone. The message is built twice from one source — here for the receipt,
 * in PHP for the send — and `scripts/gen-join-message.ts` is what stops the
 * two drifting.
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
 *   the head      «Первая тренировка» over cols 1–8, its one line under it,
 *                 道 on the column's right edge
 *   the register  cols 1–7. Four asks stacked, each of them one line: the
 *                 label in mono at the binding edge, the blank beside it, one
 *                 rule under both. Four rules, one length, one rhythm.
 *   the seal      cols 9–12, hanging from the same line as the register: the
 *                 ensō with the ask inside it, the 152-ФЗ consent under the
 *                 ask it is about, and under that the Telegram route for a
 *                 reader who would rather just write, with what the club
 *                 promises printed under the route that delivers it
 *
 * THE ENSŌ IS DRAWN ONCE AND STAYS DRAWN. It is the chapter's closing mark and
 * never a progress indicator: it does not appear on submit, it does not spin,
 * and it does not withdraw when the slip arrives. That rule survived the relay
 * intact — an in-flight submit changes the WORD inside the ring and nothing
 * else, because a ring that started turning the moment a form was posted is
 * the one reading of this mark the chapter has refused from the start.
 */
export function Join() {
  const t = join;
  const uid = useId().replace(/:/g, "");
  const slipRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  /*
    WHEN THE SHEET WAS OPENED, and deliberately not when the first key was
    pressed. The relay drops anything filled in under three seconds, and
    measuring from the first keystroke would put a parent whose browser
    autofills their name and phone inside that window — dropped silently,
    which is the worst way to lose a заявка. Chapter 六 is the last of six on
    a long page, so a human has always spent far more than three seconds
    getting here.

    SET IN AN EFFECT AND NOT IN RENDER. `Date.now()` is impure and the compiler
    rejects it there, correctly. The ref therefore starts at 0, which makes
    the elapsed time astronomical rather than zero if a press somehow beat the
    effect — that is the safe direction to fail in, because the other one
    drops a real заявка without telling anyone.
  */
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const [values, setValues] = useState({ name: "", age: "", contact: "", note: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  /*
    THE SAME THREE RULES THE RELAY APPLIES, and they have to stay the same
    three or the two ends of this disagree and the reader is shown a generic
    failure for an answer the page told them was fine.

    The age test is DIGITS ONLY rather than `Number.isInteger`, which is the
    one that used to differ: `maxLength` is 2, so «7.» fits, and
    `Number.isInteger(Number("7."))` is true while the relay's `ctype_digit`
    says no.
  */
  const validate = (field: Field, value: string): string | undefined => {
    const v = value.trim();
    if (field === "name") return v.length >= 2 && v.length <= 80 ? undefined : t.errors.name;
    if (field === "age") {
      const n = /^[0-9]{1,2}$/.test(v) ? Number(v) : NaN;
      return n >= 4 && n <= 99 ? undefined : t.errors.age;
    }
    return v.length >= 4 && v.length <= 120 ? undefined : t.errors.contact;
  };

  /* An edited entry is a new entry, so the slip withdraws on the first
     keystroke: without this, pressing the ask a second time would leave a
     stale message standing on the sheet and read as a dead control. */
  const edit = (field: Field | "note", value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setOutcome(null);
    setCopied(false);
    if (field !== "note" && errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const onBlur = (field: Field) => setErrors((e) => ({ ...e, [field]: validate(field, values[field]) }));

  /*
    «7 лет», «22 года», «1 год». The unit is declined by `Intl.PluralRules`
    rather than by a hand-rolled modulo, and the relay declines it again with
    the same rule written longhand in PHP.

    IT PRINTS THE PARSED NUMBER, not the raw string, and that is what keeps
    the two sides identical: the relay casts to int, so «07» reaches the coach
    as «7 лет», and a receipt reading «07 лет» would be a receipt for a
    message that was never sent.
  */
  const age = (raw: string) => {
    const n = Number(raw);
    const forms = t.years;
    const rule = new Intl.PluralRules("ru").select(n);
    const unit = rule === "one" ? forms.one : rule === "few" ? forms.few : forms.many;
    return `${n}\u00A0${unit}`;
  };

  /*
    The message. One line from the page saying what the reader just did, then
    their own four answers and nothing else — no form numbers, no "sent from",
    no subject line. Every line a page adds here is a line the coach has to
    read past and the parent would have had to delete.

    This copy is for the READER: it is what the receipt and the slip print.
    The one that actually travels is built by the relay, from the same two
    strings, out of the raw fields posted below.
  */
  const assemble = () => {
    const who = [values.name.trim(), age(values.age.trim())].join(", ");
    return [t.opening, [who, values.contact.trim()].join("\n"), values.note.trim()]
      .filter(Boolean)
      .join("\n\n");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    /* A second press while the first is in flight would post the same заявка
       twice. The button is disabled too; this is the guard for the Enter key
       that beats the re-render. */
    if (pending) return;

    const next: Errors = {};
    REQUIRED.forEach((f) => {
      const msg = validate(f, values[f]);
      if (msg) next[f] = msg;
    });
    setErrors(next);

    const firstBad = REQUIRED.find((f) => next[f]);
    if (firstBad) {
      setOutcome(null);
      document.getElementById(`${uid}-${firstBad}`)?.focus();
      return;
    }

    const text = assemble();
    setCopied(false);

    /* focus follows the reader to the thing that just appeared, or a keyboard
       user is left standing on a control that seems to have done nothing */
    const land = (kind: Outcome["kind"]) => {
      setOutcome({ kind, text });
      requestAnimationFrame(() => slipRef.current?.focus());
    };

    /* `NEXT_PUBLIC_JOIN_ENDPOINT=""` turns the relay off and restores exactly
       what this chapter did before it existed. It is the honest setting for a
       local dev server, where `public/api/send.php` is served as its own
       source text rather than executed. */
    if (!ENDPOINT) {
      land("carry");
      return;
    }

    setOutcome(null);
    setPending(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          age: values.age.trim(),
          contact: values.contact.trim(),
          note: values.note.trim(),
          /* the honeypot and the dwell time: see the relay */
          subject: honeypotRef.current?.value ?? "",
          elapsed: Date.now() - openedAt.current,
        }),
      });

      const data: unknown = await res.json().catch(() => null);
      const body = (data && typeof data === "object" ? data : {}) as {
        ok?: unknown;
        code?: unknown;
      };

      /*
        A REPLY THAT IS NOT OURS IS «carry», NOT «failed», and the distinction
        is the point of having three outcomes. No `ok` boolean means nothing
        is answering on the other end: a 404, an Apache error page, or a dev
        server handing back the PHP source. Nothing was attempted, so the page
        prints the slip and says nothing about sending. Only a relay that
        answered and said no is a failure.
      */
      if (res.ok && body.ok === true) land("sent");
      else if (typeof body.ok !== "boolean") land("carry");
      else if (body.code === "unconfigured") land("carry");
      else land("failed");
    } catch {
      /* the network, or an origin that refused. There IS a relay in
         production, so this one is a real failure and says so. */
      land("failed");
    } finally {
      setPending(false);
    }
  };

  const copyRequest = async () => {
    if (!outcome) return;
    try {
      await navigator.clipboard.writeText(outcome.text);
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
    printed, with a control that copies it — is what actually carries a request
    the relay could not. Which is also why `slipNote` says the request does not
    leave on its own: on the fallback path that is true on every client.
  */
  const carry = outcome ? `${club.telegram}?text=${encodeURIComponent(outcome.text)}` : club.telegram;

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

              {/*
                THE HONEYPOT. A fifth blank that no reader ever meets: taken
                off the page with a clip rather than `display: none`, which
                some bots skip, hidden from assistive technology with
                `aria-hidden` and off the tab ring with `tabIndex`. It is not
                `.sr-only` — that is the one hiding technique that would put
                it in front of the exact reader least able to tell it is a
                trap. Anything in it was typed by something reading the DOM.
              */}
              <div className="join-hp" aria-hidden="true">
                <label htmlFor={`${uid}-subject`}>Тема</label>
                <input
                  ref={honeypotRef}
                  id={`${uid}-subject`}
                  name="subject"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
            </Reveal>

            {/* ---- the seal ----
                The ask, what pressing it consents to, and the way out for a
                reader who would rather not fill a sheet in at all. It hangs
                from the same line as the register and closes on the same
                right trim the 道 above it closes on, so the two ends of the
                spread are the two ends of the page. The word «или» is doing
                real work there: it is the alternative to the form rather than
                a second control on it, and the trust line stays with it so
                that what the club promises is printed next to the route that
                delivers it. */}
            <div className="join-act">
              <Settle delay={0.24} className="join-act__press">
                <div className="join-ring">
                  <Brush kind="enso" className="join-enso" delay={0.5} />
                  <button type="submit" className="join-cta t-mono" disabled={pending}>
                    {pending ? t.sending : t.submit}
                  </button>
                </div>
                {/* The 152-ФЗ consent, and it is set UNDER THE ASK because
                    the sentence names that button. It could not be printed
                    at all until the relay existed: consent covers processing,
                    and while nothing left the browser there was nothing to
                    consent to. See the note in `join` in `content/home.ts`. */}
                <p className="t-note join-consent">{t.privacy}</p>
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
            The slip. It is in the tree from the first paint and empty until
            the reader presses — a live region that mounts already carrying
            its text is announced by some screen readers and missed by others
            — so at rest it is a zero-height region reserving no band of ink.
            It sits OUTSIDE `.join-body`, and that is a layout fact rather
            than a semantic one: an empty item in a gapped grid is still a
            row, and an empty row still costs its gap.

            It prints below the spread, so pressing the ask never moves the
            ask.

            THREE OUTCOMES, ONE BLOCK. A sent request prints the club's answer
            over a receipt and stops there: there is nothing left to carry, so
            offering a copy control and a route out would be inviting the
            reader to send it a second time. The other two keep the carry
            apparatus, and only `failed` admits to a failure.
          */}
          <div role="status">
            {outcome && (
              <Settle mode="load" duration={0.5} className="join-slip">
                {outcome.kind !== "carry" && (
                  <p className="t-lead join-slip__lead">
                    {outcome.kind === "sent" ? t.success : t.error}
                  </p>
                )}
                <p className="t-mono join-slip__cap">
                  {outcome.kind === "sent" ? t.receipt : t.slip}
                </p>
                <div ref={slipRef} tabIndex={-1} className="t-note join-slip__text">
                  {outcome.text}
                </div>
                {outcome.kind !== "sent" && (
                  <>
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
                  </>
                )}
              </Settle>
            )}
          </div>
        </form>
      </div>
    </Chapter>
  );
}
