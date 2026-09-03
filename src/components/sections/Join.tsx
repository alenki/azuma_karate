"use client";

import "@/styles/sections/join.css";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, join } from "@/content/home";
import { club } from "@/content/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { Seal } from "@/components/brush/Seal";
import { Grain } from "@/components/ui/Grain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal, EASE_OUT_EXPO } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "join")!;
const HEADING_ID = "join-title";

type Field = "name" | "age" | "contact";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "success";

/**
 * Chapter 十 / 10 — «Запись».
 *
 * The closing ink block and the last mark of the manual: the ensō, drawn in
 * one breath around the button that ends the page. Validation is inline and
 * on blur; on success the club's seal stamps «Осу» beside the confirmation.
 * There is no backend yet — the submit is simulated and the Telegram link is
 * the working alternative.
 *
 * The chapter is set as three bands on the page grid — invitation on the left
 * trim, a form capped at its own measure, and the ensō on the right trim from
 * 1600 up. All of that geometry lives in `join.css`; the markup only names the
 * parts, because the bands re-order by media query and nothing here should
 * have to know at which width.
 */
export function Join() {
  const { locale } = useLocale();
  const t = join;
  const uid = useId().replace(/:/g, "");
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
      document.getElementById(`${uid}-${firstBad}`)?.focus();
      return;
    }
    /* honeypot: a filled hidden field means a bot — pretend all is well */
    if ((e.currentTarget.elements.namedItem("company") as HTMLInputElement | null)?.value) {
      setStatus("success");
      return;
    }
    setStatus("sending");
    window.setTimeout(() => setStatus("success"), 700);
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
          onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
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
      className="join relative overflow-hidden"
      bleed={<Grain opacity={0.22} />}
    >
      <div className="join__sheet wrap relative z-10">
        <div className="rule" />
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
            <Reveal delay={0.35} className="join__invite-foot mt-10 flex flex-col items-start gap-4">
              <a href={club.telegram} className="btn-text t-mono inline-flex min-h-11 items-center" rel="noopener">
                {t.alt[locale]} <span aria-hidden="true" className="ml-2">→</span>
              </a>
              <p className="t-mono text-bone-2">{t.trust[locale]}</p>
            </Reveal>
          </div>

          {/* ---- the form ---- */}
          <div className="join__form-col">
            <AnimatePresence mode="wait" initial={false}>
              {status === "success" ? (
                <motion.div
                  key="done"
                  className="join-done"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                >
                  <p className="t-statement max-w-[20ch] text-bone">{t.success[locale]}</p>
                  <Seal className="join-done__seal shrink-0" trigger="load" text="ОСУ · SK AZUMA · ОСУ · SK AZUMA · " />
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={onSubmit}
                  className="join-form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="join-form__pair">
                    <Reveal delay={0.1}>{field("name", "text", "given-name")}</Reveal>
                    <Reveal delay={0.16}>{field("age", "number", "off", { min: 4, max: 99, inputMode: "numeric" })}</Reveal>
                  </div>
                  <Reveal delay={0.22} className="join-form__contact">
                    {field("contact", "text", "tel")}
                  </Reveal>
                  <Reveal delay={0.28} className="join-form__note">
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
                        onChange={(e) => setValues((v) => ({ ...v, note: e.target.value }))}
                      />
                    </div>
                  </Reveal>

                  {/* honeypot */}
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" className="join-hp" aria-hidden="true" />

                  <Reveal delay={0.36} className="join-form__close">
                    <div className="join-enso">
                      <Brush kind="enso" className="join-enso__mark text-shu-lift" delay={0.6} />
                      <button type="submit" className="join-submit t-mono" disabled={status === "sending"}>
                        {status === "sending" ? t.sending[locale] : t.submit[locale]}
                      </button>
                    </div>
                    <p className="t-mono mt-6 max-w-[42ch] text-bone-2">{t.privacy[locale]}</p>
                  </Reveal>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
