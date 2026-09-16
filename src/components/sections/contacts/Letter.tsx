"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/i18n/LocaleProvider";
import { write as copy, type SubjectId } from "@/content/contacts";
import { club } from "@/content/schedule";
import { Leaf } from "./Leaf";
import { Button } from "@/components/ui/Button";
import { Grain } from "@/components/ui/Grain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Register, Reveal, Settle } from "@/components/ui/Reveal";

const HEADING_ID = "contacts-letter-title";

/**
 * Band C — «Написать в клуб». The sheet turns over.
 *
 * A different transaction from chapter 六 «Запись», and the difference is
 * structural rather than cosmetic. That chapter BOOKS a session — name, age,
 * contact, one act, an ensō drawn round it — and its geometry is a narrow
 * column of ruled fields. This one WRITES TO the club, so the LETTER is the
 * widest object on the page, running the whole trim between two rules, and the
 * reader's name sits under it where a signature goes.
 *
 * IT NEVER CLAIMS TO SEND, AND IT SAYS SO WHERE A READER ACTUALLY LOOKS — on
 * the label of the control they are about to press. There is no route to post
 * to: no bot token, no chat id, no address the club has agreed an enquiry
 * should land in. A button marked «Отправить» that validates and then
 * apologises tells the reader after they have typed; «Собрать письмо»
 * assembles what they wrote, hands it back ready to carry, and becomes
 * «Открыть Telegram», which is the route that reaches a human. Nothing on this
 * page describes something that does not happen.
 *
 * THE SUBJECT IS NOT PART OF THE LETTER. It sets the first line the reader
 * finds in the field — a placeholder, never a value — and then gets out of the
 * way, so what is assembled is only ever the reader's own words. It is the
 * reference's nine-chip grid and its FAQ column collapsed into one control:
 * the questions are kept, and the answers are handed back as the beginning of
 * the reader's own sentence.
 */
export function Letter() {
  const { locale } = useLocale();
  const uid = useId().replace(/:/g, "");
  const slipRef = useRef<HTMLDivElement>(null);

  const [chosen, setChosen] = useState<SubjectId | null>(null);
  const [values, setValues] = useState({ name: "", contact: "", message: "" });
  const [letter, setLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const subject = copy.subjects.find((s) => s.id === chosen) ?? null;
  /* Until a subject is chosen the field opens on the NEUTRAL first line, never on the
     first cell in the row: a placeholder that reads «Хотим привести ребёнка…» before the
     reader has pressed anything is the page choosing their subject for them, and the whole
     point of the chooser is that it does not. */
  const neutral = copy.subjects[copy.subjects.length - 1];
  const messageId = `${uid}-message`;
  const errorId = `${uid}-message-err`;

  /* an edited letter is a new letter: the slip withdraws on the first
     keystroke, so pressing again is never a control that does nothing */
  const edit = (field: "name" | "contact" | "message", value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setLetter(null);
    setCopied(false);
    if (field === "message") setInvalid(false);
  };

  /*
    What is assembled is the reader's own words and nothing else: the message,
    then whatever of the signature they chose to give. No subject line, no form
    numbers, no "sent from" — this is a message a person pastes into a chat, and
    every line a page adds to it is a line they would have to delete.
  */
  const assemble = () => {
    const signature = [values.name.trim(), values.contact.trim()].filter(Boolean).join(", ");
    return [values.message.trim(), signature].filter(Boolean).join("\n\n");
  };

  const compose = () => {
    if (values.message.trim().length < 2) {
      setInvalid(true);
      document.getElementById(messageId)?.focus();
      return;
    }
    setLetter(assemble());
    setCopied(false);
    /* focus follows the reader to the thing that just appeared, or a keyboard
       user is left on a control whose label has changed under them */
    requestAnimationFrame(() => slipRef.current?.focus());
  };

  const copyLetter = async () => {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
    } catch {
      /* no clipboard permission, or an insecure origin. The slip is
         `user-select: all`, so one click still selects the whole letter — the
         control simply says nothing rather than claiming a copy it did not
         make. */
      setCopied(false);
    }
  };

  return (
    <Leaf id="letter" labelledBy={HEADING_ID} ground="ink" className="letter relative overflow-x-clip">
      <div className="letter__sheet wrap relative z-10">
        <div className="letter__head">
          <h2 id={HEADING_ID} className="t-chapter letter__title">
            <LineReveal as="span" className="block" lines={[copy.title[locale]]} />
          </h2>
          <Reveal delay={0.15} y={20} className="letter__lead">
            <p className="t-lead max-w-[40ch] text-bone-2">{copy.lead[locale]}</p>
          </Reveal>
        </div>

        {/*
          THE SUBJECTS. The reference's chip grid, translated into the pattern
          this system already owns: a chosen cell inverts its GROUND, which is a
          luminance event that survives greyscale, rather than taking a hue.
          `aria-pressed` reports the same state the ink does.
        */}
        <div className="letter__subjects">
          <p id={`${uid}-subject`} className="t-mono letter__label">
            {copy.subjectLabel[locale]}
          </p>
          <Register
            className="letter__cells"
            stagger={0.04}
            itemClassName="letter__cell-wrap"
            role="group"
            aria-labelledby={`${uid}-subject`}
          >
            {copy.subjects.map((s) => {
              const on = chosen === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setChosen(on ? null : s.id)}
                  className={cn("letter__cell t-note", on && "letter__cell--on")}
                >
                  {s.label[locale]}
                </button>
              );
            })}
          </Register>
        </div>

        {/*
          THE LETTER, the width of the sheet, between two rules. It is the
          largest field on the page because it is what the page is for — and it
          is set in the BODY face at body size, never the display face: nobody
          composes a message to a karate club in a Didone, and a high-contrast
          serif in a textarea fights the reader's own typing on a phone.
        */}
        <Reveal delay={0.2} y={20} className="letter__field">
          <label htmlFor={messageId} className="t-mono letter__label">
            {copy.fields.message[locale]}
          </label>
          <div className="rule" />
          <textarea
            id={messageId}
            className="letter__area"
            rows={6}
            value={values.message}
            placeholder={(subject ?? neutral).opening[locale]}
            aria-invalid={invalid ? true : undefined}
            aria-describedby={invalid ? errorId : undefined}
            onChange={(e) => edit("message", e.target.value)}
          />
          <div className={cn("rule", invalid && "letter__rule--invalid")} />
          {invalid && (
            <p id={errorId} role="alert" className="t-caption letter__error">
              {copy.errors.message[locale]}
            </p>
          )}
        </Reveal>

        {/* the signature — where a signature goes, under the letter */}
        <div className="letter__sign">
          <div className="letter__pair">
            <div className="letter__entry">
              <label htmlFor={`${uid}-name`} className="t-mono letter__label">
                {copy.fields.name[locale]}
              </label>
              <input
                id={`${uid}-name`}
                className="letter__input"
                type="text"
                autoComplete="given-name"
                placeholder={copy.placeholders.name[locale]}
                value={values.name}
                onChange={(e) => edit("name", e.target.value)}
              />
            </div>
            <div className="letter__entry">
              <label htmlFor={`${uid}-contact`} className="t-mono letter__label">
                {copy.fields.contact[locale]}
              </label>
              <input
                id={`${uid}-contact`}
                className="letter__input"
                type="text"
                autoComplete="tel"
                placeholder={copy.placeholders.contact[locale]}
                value={values.contact}
                onChange={(e) => edit("contact", e.target.value)}
              />
            </div>
          </div>

          {/*
            ONE CONTROL AT A TIME, AND IT NEVER DESCRIBES SOMETHING THAT DOES
            NOT HAPPEN. At rest the act is «Собрать письмо». Once it has been
            pressed the control is gone and the SLIP below carries what it
            produced — the assembled letter, a control that copies it, and the
            route that actually reaches a human. A reader who met «Открыть
            Telegram» while the letter was still below them would be sent away
            from the thing they had just made.
          */}
          <div className="letter__act">
            {letter === null && (
              <Button onClick={compose} className="letter__press">
                {copy.compose[locale]}
              </Button>
            )}
          </div>
        </div>

        {/*
          The slip. It is in the tree from the first paint and empty until the
          reader presses — a live region that mounts already carrying its text
          is announced by some screen readers and missed by others.

          `user-select: all` is the fallback the copy control needs: if the
          clipboard is unavailable (an insecure origin, a refused permission)
          one click still selects the whole letter, so the reader is never left
          with a control that claimed a copy it did not make.
        */}
        <div className="letter__slip-region" role="status">
          {letter !== null && (
            <Settle mode="load" duration={0.5} className="letter__slip">
              <p className="t-mono letter__label">{copy.slip[locale]}</p>
              <div
                ref={slipRef}
                tabIndex={-1}
                className="t-note letter__text"
              >
                {letter}
              </div>
              <p className="t-note letter__slip-note">{copy.slipNote[locale]}</p>
              <div className="letter__slip-foot">
                <button type="button" onClick={copyLetter} className="t-mono letter__copy">
                  {copied ? copy.copied[locale] : copy.copy[locale]}
                </button>
                <Button href={club.telegram} rel="noopener" className="letter__press letter__press--slip">
                  {copy.open[locale]}
                </Button>
              </div>
            </Settle>
          )}
        </div>
      </div>

      <Grain opacity={0.22} />
    </Leaf>
  );
}
