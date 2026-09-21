"use client";

import "@/styles/sections/join.css";

import { useId, useRef, useState, type FormEvent } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
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
 * 押忍 — the watermark, and the only thing on this sheet that is not read.
 *
 * DRAWN, NOT TYPESET, and that is not a stylistic preference. The page ships
 * two Latin faces and one mono and no CJK whatsoever, so a text node here would
 * resolve to Yu Gothic on Windows, Hiragino on macOS, Noto on a Linux box that
 * happens to have it and tofu on one that does not — four different marks at
 * the size of a headline. `content/kanji.ts` already holds both characters as
 * KanjiVG centrelines, and `<Kanji>` already strokes them through the same
 * taper table as the chapter numerals 一…六, so the glyph below is the same
 * printed type as the numeral in the binding margin, on every machine.
 *
 * It is never DRAWN in the animated sense (`draw` stays false). The one
 * hand-made mark in this chapter is the sensei's brush; a watermark that
 * writes itself in front of the reader is a different claim entirely, and it
 * would also be the second gesture competing with the ensō below it.
 */
const GHOST: readonly KanjiId[] = ["ou", "su"];

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
 * FIVE THINGS, CENTRED, and the centring is the exception this chapter earns
 * and no other one does. `.wrap` is still the trim and there is still no centred
 * column anywhere in this book — what is centred here is the CONTENT of the last
 * sheet, which is the one sheet a printed manual does centre. Chapter 五 above
 * it is ranged left like every other; the change of axis is how the reader knows
 * the book has ended.
 *
 *   the watermark   押忍, at the size of the sheet, a tone off the ground
 *   the title       «Первая тренировка», over the watermark's lower third
 *   one line        what happens if you press
 *   the entry       four ruled fields, and the ensō closed round the ask
 *   the exit        a hairline, then the Telegram route and what it promises
 *
 * THE FORM BLOCK IS CENTRED; ITS ENTRIES ARE NOT. A centred label over a
 * centred input is a thing nobody has ever printed and nobody can fill in — the
 * eye needs one left edge to run down. So the block is centred on the sheet's
 * axis and ranged left inside itself, which is how a form on a centred closing
 * page is set, and the ensō below it returns to the axis and closes it.
 *
 * THE ENSŌ IS DRAWN ONCE AND STAYS DRAWN. It is the chapter's closing mark and
 * never a progress indicator: it does not appear on submit, it does not spin,
 * and it does not withdraw when the slip arrives. The submit lives inside it
 * because the ring is the seal around the last ask in the manual.
 */
export function Join() {
  const { locale } = useLocale();
  const t = join;
  const uid = useId().replace(/:/g, "");
  const slipRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState({ name: "", age: "", contact: "", note: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [request, setRequest] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = (field: Field, value: string): string | undefined => {
    if (field === "name") return value.trim().length >= 2 ? undefined : t.errors.name[locale];
    if (field === "age") {
      const n = Number(value.trim());
      return Number.isInteger(n) && n >= 4 && n <= 99 ? undefined : t.errors.age[locale];
    }
    return value.trim().length >= 4 ? undefined : t.errors.contact[locale];
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
    const forms = t.years[locale];
    const rule = new Intl.PluralRules(locale).select(Number(raw));
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
    return [t.opening[locale], [who, values.contact.trim()].join("\n"), values.note.trim()]
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

  const field = (name: Field, extra?: Record<string, string | number>) => {
    const id = `${uid}-${name}`;
    const errId = `${id}-err`;
    const err = errors[name];
    return (
      <div className="join-field">
        <label htmlFor={id} className="t-mono join-label">
          {t.fields[name][locale]}
        </label>
        <input
          id={id}
          name={name}
          type="text"
          className="join-input"
          placeholder={t.placeholders[name][locale]}
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
    );
  };

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
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
        <div className="join__plate">
          {/* ---- the watermark and the title, in that order and in one box ----
              The glyphs are positioned OUT of flow so the title alone sets the
              height of this block. In flow they would be two 400px squares
              deciding the chapter's proportions, and the mark would stop being
              a watermark and start being a picture with a caption. */}
          <div className="join__head">
            <div className="join__ghost" aria-hidden="true">
              {GHOST.map((id) => (
                <Kanji key={id} id={id} className="join__ghost-glyph" weight={5.5} label={null} />
              ))}
            </div>

            <h2 id={HEADING_ID} className="t-chapter">
              <LineReveal as="span" className="block" lines={[t.title[locale]]} />
            </h2>
          </div>

          <Reveal delay={0.2} className="join__lead-band">
            <p className="t-lead join__lead">{t.lead[locale]}</p>
          </Reveal>

          {/* ---- the entry ----
              `noValidate`: the browser's own bubbles are a different typeface,
              a different voice and sometimes a different language from the
              page, and they cannot be ranged under the rule the field is drawn
              with. Every message here is `t.errors`, set in the page's type. */}
          <form noValidate onSubmit={onSubmit} className="join-form">
            <div className="join-form__pair">
              <Reveal delay={0.1}>{field("name", { autoComplete: "given-name" })}</Reveal>
              <Reveal delay={0.16}>{field("age", { inputMode: "numeric", autoComplete: "off", maxLength: 2 })}</Reveal>
            </div>
            <Reveal delay={0.22}>{field("contact", { autoComplete: "tel" })}</Reveal>
            <Reveal delay={0.28}>
              <div className="join-field">
                <label htmlFor={`${uid}-note`} className="t-mono join-label">
                  {t.fields.note[locale]}
                </label>
                <textarea
                  id={`${uid}-note`}
                  name="note"
                  rows={3}
                  className="join-input join-input--area"
                  value={values.note}
                  onChange={(e) => edit("note", e.target.value)}
                />
              </div>
            </Reveal>

            {/* ---- the act ---- */}
            <Reveal delay={0.34} className="join__act-band">
              <div className="join-act">
                <Brush kind="enso" className="join-enso" delay={0.5} />
                <button type="submit" className="join-cta t-mono">
                  {t.submit[locale]}
                </button>
              </div>
            </Reveal>
          </form>

          {/*
            The slip. It is in the tree from the first paint and empty until the
            reader presses — a live region that mounts already carrying its text
            is announced by some screen readers and missed by others — so at
            rest it is a zero-height region reserving no band of ink.
          */}
          <div className="join__slip-region" role="status">
            {request !== null && (
              <Settle mode="load" duration={0.5} className="join-slip">
                <p className="t-mono join-label">{t.slip[locale]}</p>
                <div ref={slipRef} tabIndex={-1} className="t-note join-slip__text">
                  {request}
                </div>
                <p className="t-note join-slip__note">{t.slipNote[locale]}</p>
                <div className="join-slip__foot">
                  <button type="button" onClick={copyRequest} className="t-mono join-copy">
                    {copied ? t.copied[locale] : t.copy[locale]}
                  </button>
                  <a href={carry} rel="noopener" className="join-out t-mono">
                    <span className="join-out__label">{t.open[locale]}</span>
                    <span aria-hidden="true" className="join-out__arrow">
                      →
                    </span>
                  </a>
                </div>
              </Settle>
            )}
          </div>

          {/* ---- the exit ----
              Still «или напишите в Telegram», and the word «или» is doing real
              work: it is the alternative to filling the sheet in at all, for a
              reader who would rather just ask. The trust line stays with it
              rather than following the lead, so that what the club promises is
              printed next to the route that delivers it. */}
          <Reveal delay={0.46} className="join__exit">
            <div className="rule rule--hair join__exit-rule" />
            <a href={club.telegram} className="join-out t-note" rel="noopener">
              <span className="join-out__label">{t.alt[locale]}</span>
              <span aria-hidden="true" className="join-out__arrow">
                →
              </span>
            </a>
            <p className="t-note join__trust">{t.trust[locale]}</p>
          </Reveal>
        </div>
      </div>
    </Chapter>
  );
}
