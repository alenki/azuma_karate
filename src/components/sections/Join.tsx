"use client";

import "@/styles/sections/join.css";

import { useId, useState, type FormEvent } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, join, schedule as timetable } from "@/content/home";
import { club } from "@/content/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { ChapterFoot } from "@/components/layout/ChapterFoot";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { Grain } from "@/components/ui/Grain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal, Settle } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "join")!;
/* the two exits the last page of a book is allowed: back to the timetable, and
   back to the first stroke. Both labels are the chapters' own titles, so the
   colophon never invents a name for a chapter that already has one. */
const scheduleChapter = chapters.find((c) => c.id === "schedule")!;
const firstChapter = chapters.find((c) => c.id === "hero")!;
const HEADING_ID = "join-title";

type Field = "name" | "age" | "contact";
type Errors = Partial<Record<Field, string>>;

/**
 * Two states, and neither of them is «отправлено».
 *
 * The form has no route to post to: there is no bot token, no chat id, and the
 * club has not confirmed which channel an enquiry should land in. What stood
 * here was `setStatus("sending")` followed by a 700ms `setTimeout` that printed
 * «Осу! Мы получили заявку» beside the club's seal — a receipt for a message
 * that was never sent, on a page a parent is trusting with a child's name and
 * age. A manual does not print a fact it does not have, and it certainly does
 * not print a confirmation it has not earned.
 *
 * So the second state is `unsent`: the entry is validated, the reader is told
 * plainly that nothing left the page, and the working route — the club's
 * Telegram — is put under their thumb with their own answers still on screen to
 * copy across. The moment a route exists this becomes `idle | sending | sent |
 * error`, the submit awaits it, and `t.success` finally has something true to
 * say. Until then the honest state is the only state.
 */
type Status = "idle" | "unsent";

/**
 * Chapter 十 / 10 — «Запись».
 *
 * The closing ink block and the last mark of the manual: the ensō, drawn in one
 * breath around the word that ends the page.
 *
 * Three bands, and the geometry lives in `join.css` because the bands re-order
 * by media query and nothing here should have to know at which width:
 *
 *   the invitation   ranged hard left, bottoming out on the form's baseline
 *   the form         capped at a real form measure, never a table
 *   the closing act  the ensō with the ask inside it — the mark's own band on
 *                    the right trim from 1600 up, under the fields below that
 *
 * The act is a SIBLING of the form rather than a row inside it (the submit
 * reaches its form by `form=`, which is what that attribute is for). Two things
 * fall out of that and both are the point: the ring is drawn once and stays
 * drawn whatever the form does — it is the chapter's closing mark, not a
 * progress indicator that appears and vanishes with a request — and the ask
 * below 1024 can be the width of the field column while the mark keeps its own
 * size above it.
 */
export function Join() {
  const { locale } = useLocale();
  const t = join;
  const uid = useId().replace(/:/g, "");
  const formId = `${uid}-form`;
  const [status, setStatus] = useState<Status>("idle");
  const [values, setValues] = useState({ name: "", age: "", contact: "", note: "" });
  const [errors, setErrors] = useState<Errors>({});

  const validate = (field: Field, value: string): string | undefined => {
    if (field === "name") return value.trim().length >= 2 ? undefined : t.errors.name[locale];
    if (field === "age") {
      const n = Number(value);
      return Number.isFinite(n) && n >= 4 && n <= 99 ? undefined : t.errors.age[locale];
    }
    return value.trim().length >= 4 ? undefined : t.errors.contact[locale];
  };

  const onBlur = (field: Field) => setErrors((e) => ({ ...e, [field]: validate(field, values[field]) }));

  /* An edited entry is a new entry, so the notice withdraws on the first
     keystroke: without this, pressing the button a second time would change
     nothing on the sheet and read as a dead control. */
  const onEdit = (name: Field | "note", value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setStatus("idle");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors = {};
    (["name", "age", "contact"] as Field[]).forEach((f) => {
      const msg = validate(f, values[f]);
      if (msg) next[f] = msg;
    });
    setErrors(next);
    const firstBad = (["name", "age", "contact"] as Field[]).find((f) => next[f]);
    if (firstBad) {
      setStatus("idle");
      document.getElementById(`${uid}-${firstBad}`)?.focus();
      return;
    }
    /* No fetch, and no timer pretending to be one — see `Status` above. */
    setStatus("unsent");
  };

  const field = (name: Field, type: string, autoComplete?: string, extra?: Record<string, string | number>) => {
    const id = `${uid}-${name}`;
    const errId = `${id}-err`;
    const err = errors[name];
    return (
      <div className="join-field">
        <label htmlFor={id} className="t-mono text-bone-2">
          {t.fields[name][locale]}
        </label>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          className="join-input"
          placeholder={t.placeholders[name][locale]}
          value={values[name]}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? errId : undefined}
          onChange={(e) => onEdit(name, e.target.value)}
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
         ensō's hang inside the paper without that side effect. */
      className="join relative overflow-x-clip"
      bleed={<Grain opacity={0.22} />}
    >
      <div className="join__sheet wrap relative z-10">
        <div className="rule rule--strong" />
        <Reveal delay={0.1} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-bone-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono text-bone-2">
            <Kanji id="ju" className="chapter__kanji" label={null} /> 10
          </span>
        </Reveal>

        <div className="join__body">
          {/* ---- the invitation ---- */}
          <div className="join__invite">
            <h2 id={HEADING_ID} className="t-chapter text-bone">
              <LineReveal as="span" className="block" lines={[t.title[locale]]} />
            </h2>
            <Reveal delay={0.2} className="mt-8">
              <p className="t-lead max-w-[40ch] text-bone-2">{t.lead[locale]}</p>
            </Reveal>
            {/*
              The foot of the column, and from 1024 up it is ranged to the
              bottom of it rather than left hanging under the lead — the two
              columns of this spread now end together on the same baseline
              instead of the left one dying at 60% of the sheet.
            */}
            <Reveal delay={0.35} className="join__invite-foot">
              <a href={club.telegram} className="join-out t-note" rel="noopener">
                <span className="join-out__label">{t.alt[locale]}</span>
                <span aria-hidden="true" className="join-out__arrow">
                  →
                </span>
              </a>
              <p className="t-note text-bone-2">{t.trust[locale]}</p>
            </Reveal>
          </div>

          {/* ---- the form ---- */}
          <div className="join__form-col">
            <form noValidate id={formId} onSubmit={onSubmit} className="join-form">
              <div className="join-form__pair">
                <Reveal delay={0.1}>{field("name", "text", "given-name")}</Reveal>
                <Reveal delay={0.16}>{field("age", "number", "off", { min: 4, max: 99, inputMode: "numeric" })}</Reveal>
              </div>
              <Reveal delay={0.22}>{field("contact", "text", "tel")}</Reveal>
              <Reveal delay={0.28}>
                <div className="join-field">
                  <label htmlFor={`${uid}-note`} className="t-mono text-bone-2">
                    {t.fields.note[locale]}
                  </label>
                  <textarea
                    id={`${uid}-note`}
                    name="note"
                    rows={3}
                    className="join-input join-input--area"
                    value={values.note}
                    onChange={(e) => onEdit("note", e.target.value)}
                  />
                </div>
              </Reveal>

              {/* honeypot. Nothing is posted yet, so it protects nothing yet —
                  it stays because the route that will read it is the same route
                  that will make the field worth reading. */}
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="join-hp" aria-hidden="true" />
            </form>

            <Reveal delay={0.36} className="join-close">
              <div className="join-act">
                <Brush kind="enso" className="join-enso" delay={0.5} />
                {/* outside the <form> element, owned by it through `form=`: the
                    ring has to be able to hold the button without the form's
                    grid holding the ring. Implicit submission on Enter follows
                    the form OWNER, not the DOM ancestor, so it is unaffected. */}
                <button type="submit" form={formId} className="join-submit t-mono">
                  {t.submit[locale]}
                </button>
              </div>

              {/*
                The live region is in the DOM from the first paint and empty
                until there is something to say — a status region that mounts
                already carrying its text is announced by some screen readers
                and missed by others.
              */}
              <div className="join-notice" role="status">
                {status === "unsent" && (
                  <Settle mode="load" duration={0.55} className="join-notice__slip">
                    <div className="rule rule--hair" />
                    <p className="t-note join-notice__line">{t.error[locale]}</p>
                    <a href={club.telegram} className="join-out t-mono" rel="noopener">
                      <span className="join-out__label">{timetable.telegram[locale]}</span>
                      <span aria-hidden="true" className="join-out__arrow">
                        →
                      </span>
                    </a>
                  </Settle>
                )}
              </div>

              {/* set in `.t-note`, not `.t-mono`: it is a sentence a reader
                  reads, and 0.12em of tracking on all-caps Cyrillic is a line
                  decoded letter by letter. */}
              <p className="t-note join-consent">{t.privacy[locale]}</p>
            </Reveal>
          </div>
        </div>

        <ChapterFoot
          index={chapter.index}
          links={[
            { href: "#schedule", label: scheduleChapter.title[locale] },
            { href: "#hero", label: firstChapter.title[locale] },
          ]}
        />
      </div>
    </Chapter>
  );
}
