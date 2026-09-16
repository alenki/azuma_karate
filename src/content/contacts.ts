import { pendingFact, type L } from "@/content/home";

/**
 * Contacts page copy — «Обратная сторона» / "The Reverse".
 * Russian is the source language; English follows it line by line.
 *
 * THE TWO CONVENTIONS FROM `home.ts` HOLD HERE WITHOUT RESTATEMENT.
 *
 *   BOUND SPACES. Every bound space is the escape, never a literal U+00A0 —
 *   the mark is invisible in an editor and the next tool that normalises
 *   whitespace deletes it silently. Russian binds before every «—», after
 *   every one- and two-letter preposition or conjunction, and between a figure
 *   and its unit. English binds the em dash and the figure only.
 *
 *   PENDING FACTS. Nothing here invents one. The club's phone is
 *   `club.pending.phone` in `content/schedule.ts`, and this page is the first
 *   consumer in the codebase to honour it: it prints a ruled blank and says
 *   what is awaited, and it never renders `club.phone` or `club.phoneHref`.
 *
 * WHAT IS NOT HERE, AND WHY.
 *
 *   No FAQ. The reference this page is drawn from answers six questions down
 *   its left edge, and for this club every one of those answers — the price,
 *   what to bring, how fast we reply — is a fact nobody has confirmed. Six
 *   ruled blanks in a row is not a design, it is an apology. So the questions
 *   are kept and the answers are given back: they are the SUBJECTS below,
 *   turned from "here is our answer" into "which one are you asking?", and
 *   choosing one writes the first line of the reader's own letter.
 *
 *   No second timetable. Chapter 三 on the home page is the week. This page
 *   prints only the days and times of the ONE group the reader turns out to
 *   belong to, read off `content/schedule.ts` and never restated.
 *
 *   No response-time promise beyond the one the club already ships. «Ответим
 *   в Telegram» is `join.trust`, already on the home page; nothing here adds
 *   a number of hours to it.
 */

/* ------------------------------------------------------------------ */
/* The head                                                            */
/* ------------------------------------------------------------------ */
export const meta = {
  title: {
    ru: "Контакты\u00A0— SK\u00A0AZUMA, Нальчик",
    en: "Contacts\u00A0— SK\u00A0AZUMA, Nalchik",
  },
  description: {
    ru: "Зал киокушинкай каратэ на\u00A0ул.\u00A0Кирова,\u00A0157 в\u00A0Нальчике: как дойти, когда тренируется ваша группа и\u00A0как написать в\u00A0клуб.",
    en: "The Kyokushin karate hall at Kirova\u00A0157 in Nalchik: how to get there, when your group trains, and how to write to the club.",
  },
};

/* ------------------------------------------------------------------ */
/* Band A — the addressed face                                         */
/*                                                                     */
/* The club's particulars, set the way a posted address is set: the     */
/* addressee, the street, the city, the republic. It carries no label   */
/* of any kind and needs none — an address block is recognised by its   */
/* SHAPE, and every glyph in it is a confirmed fact already living in   */
/* `content/schedule.ts`. The only strings this band owns are the three */
/* route names and the words the live line is built from.              */
/* ------------------------------------------------------------------ */
export const door = {
  /** The addressee. «СК» is an abbreviation standing before a name, so it binds. */
  addressee: { ru: "СК\u00A0«Азума»", en: "SK\u00A0Azuma" } as L<string>,

  /* The routes. One-word labels, which is what `.t-mono` is for. */
  routes: {
    telegram: { ru: "Telegram", en: "Telegram" } as L<string>,
    instagram: { ru: "Instagram", en: "Instagram" } as L<string>,
    phone: { ru: "Телефон", en: "Phone" } as L<string>,
  },
  /** The handles, printed instead of the bare URLs they resolve to. */
  telegramHandle: "@zhaambeevteam",
  instagramHandle: "@sk.azuma_karate",

  /*
    The live line at the foot of the first screen.

    Not one of its states says «открыто». The club has told us when it TRAINS,
    not when it unlocks the door, so "open" is a word this page is not entitled
    to: it prints who is on the tatami right now, or when the next session is,
    and nothing in between.
  */
  now: {
    clock: { ru: "Сейчас в\u00A0Нальчике", en: "Now in Nalchik" } as L<string>,
    training: { ru: "На\u00A0татами", en: "On the tatami" } as L<string>,
    next: { ru: "Ближайшая тренировка", en: "Next session" } as L<string>,
    /** «до 19:15» — its consumer binds the word to the figure. */
    until: { ru: "до", en: "until" } as L<string>,
    /** The days and hours sessions run between, labelled as the envelope it is. */
    sessions: { ru: "Тренировки", en: "Sessions" } as L<string>,
  },
  /** The whole week is one link away; this page does not reprint it. */
  week: { ru: "Вся неделя", en: "The whole week" } as L<string>,
};

/* ------------------------------------------------------------------ */
/* Band B — the group                                                  */
/*                                                                     */
/* One question, one blank, four rows. The club's own bands, names and  */
/* notes come from `content/schedule.ts`; the only copy here is the     */
/* question and the two answers the data cannot give by itself.        */
/* ------------------------------------------------------------------ */
export const group = {
  title: { ru: "Ваша группа", en: "Your group" } as L<string>,
  question: { ru: "Сколько лет ученику?", en: "How old is the student?" } as L<string>,
  /** The four rows are controls too, for a reader who would rather press than type. */
  pick: { ru: "Или выберите группу", en: "Or pick a group" } as L<string>,
  /*
    Under the floor, nothing is marked — and the brush's refusal to make a mark
    is the proof that the mark means something. What is printed instead is the
    club's own floor, and the FIGURE IS NOT TYPED HERE: `youngestAge()` reads it
    off the youngest band in `content/schedule.ts`, the same record the rows
    above are built from, so the sentence and the bands cannot disagree. The
    day the club takes three-year-olds, the band moves there and this line
    follows it.

    Two Russian forms, because «с 4 лет» and «с 1 года» do not decline the same
    way; the consumer picks between them with `Intl.PluralRules`. English has
    one form and carries it twice rather than letting the shape differ by
    language.
  */
  tooYoung: {
    ru: { one: "Берут с\u00A0{n}\u00A0года.", many: "Берут с\u00A0{n}\u00A0лет." },
    en: { one: "Students start from age {n}.", many: "Students start from age {n}." },
  } as L<{ one: string; many: string }>,
  /*
    Six and sixteen sit on the seam of two bands, and `content/schedule.ts`
    states plainly that the club runs them that way on purpose — a six-year-old
    goes to whichever group they are ready for. So two rows are marked, not
    one, and this line is that rule typeset. It names no age, deliberately:
    the data owns the ages, and it serves both seams.
  */
  overlap: {
    ru: "Этот возраст\u00A0— на\u00A0стыке двух групп. Какая подойдёт, решают на\u00A0первой тренировке.",
    en: "This age sits on the seam between two groups. Which one fits is decided at the first session.",
  } as L<string>,
  /** The unit a session's length is printed in. */
  minutes: { ru: "мин", en: "min" } as L<string>,
  /** Printed once, under the rows, when a group has been marked. */
  trial: { ru: "Первая тренировка\u00A0— пробная.", en: "The first session is a trial." } as L<string>,
};

/* ------------------------------------------------------------------ */
/* Band B's foot — the register of particulars                         */
/*                                                                     */
/* Four entries on leaders: a label, a dotted rule carrying the eye     */
/* across, a value, and a LOCATOR — the chapter of the home page that   */
/* answers it in full, or the route to ask through when nobody has      */
/* answered it yet. The leader is `--color-rule-hair`, whose own note   */
/* in globals.css names this exact job: "separations inside a block:    */
/* table rows, list entries, definition leaders".                       */
/*                                                                     */
/* TWO OF THE FOUR ARE PENDING, AND THAT IS WHY THEY ARE PRINTED.       */
/* «Сколько стоит» and «Что взять» are the two questions a parent asks  */
/* after «в какую группу», and the club has answered neither. A page    */
/* that omitted them would look finished and answer nothing; a ruled    */
/* blank with the route to ask beside it is honest to the reader and a  */
/* standing prod to the club. Fill them here the day they answer, and   */
/* nothing else on the page changes.                                    */
/*                                                                     */
/* THERE IS NO EMAIL ROW, and its absence is a decision, not an         */
/* oversight. A pending slot asserts that the fact EXISTS and is merely */
/* unknown — that is what a ruled blank means — and nobody has told us   */
/* the club uses email at all. Inventing the slot would imply the fact. */
/* ------------------------------------------------------------------ */
export const particulars = {
  trial: { ru: "Первая тренировка", en: "First session" } as L<string>,
    /* «пробная» is a trial, NOT a free one. The row under this one prints
     `pendingParticulars.price` — nobody has confirmed what a session costs — so an
     English adjective saying it costs nothing would state the very fact the ruled
     blank beside it says is unknown, and state it in one language only. The word
     matches `hero.trial` in home.ts, which is where the fact lives. */
  trialValue: { ru: "пробная", en: "a trial" } as L<string>,
  kit: { ru: "Что взять", en: "What to bring" } as L<string>,
  price: { ru: "Стоимость", en: "Cost" } as L<string>,
  /* «Главный тренер», not «Тренер»: chapter 四 prints two coaches now, and this
     row names the one the club was founded by. */
  coach: { ru: "Главный тренер", en: "Head coach" } as L<string>,
  /** The locator's accessible tail: a numeral alone is not a destination. */
  seeChapter: { ru: "Глава", en: "Chapter" } as L<string>,
  ask: { ru: "Спросить", en: "Ask" } as L<string>,
};

/* ------------------------------------------------------------------ */
/* Band C — the letter                                                 */
/*                                                                     */
/* A different transaction from chapter 六 «Запись», and the difference */
/* is structural rather than cosmetic. That chapter BOOKS a session:    */
/* name, age, contact, one act, an ensō drawn round it. This one WRITES */
/* TO the club — a subject, a letter, a signature under it — so the     */
/* message is the largest field on the sheet and the reader's own name  */
/* sits at the foot, where a signature goes.                           */
/*                                                                     */
/* AND IT NEVER CLAIMS TO SEND. There is no route to post to: no bot    */
/* token, no chat id, no address the club has agreed an enquiry should  */
/* land in. A control labelled «Отправить» that validates and then      */
/* apologises tells the reader after they have typed; this one tells    */
/* them before, in the one place a reader reliably reads — the label on */
/* the control they are about to press. «Собрать письмо» assembles what */
/* they wrote, hands it back ready to copy, and becomes «Открыть        */
/* Telegram», which is the route that reaches a human. Nothing here     */
/* ever describes something that does not happen.                       */
/*                                                                     */
/* WHICH IS ALSO WHY THERE IS NO CONSENT LINE. Consent is for the       */
/* processing of personal data, and nothing here leaves the reader's    */
/* own browser: the letter is assembled in the page and carried across  */
/* by hand. A legal sentence printed where no data is processed is a    */
/* false statement in the one register where false statements matter    */
/* most. The day a route exists the consent arrives WITH it — and it    */
/* must be written fresh, never copied from `join.privacy`, which names */
/* the «Записаться» control and would be wrong under any other.         */
/* ------------------------------------------------------------------ */
export type SubjectId = "trial" | "price" | "timetable" | "kit" | "competitions" | "other";

export type Subject = { id: SubjectId; label: L<string>; opening: L<string> };

export const write = {
  title: { ru: "Написать в\u00A0клуб", en: "Write to the club" } as L<string>,
  lead: {
    ru: "Соберите письмо здесь и\u00A0отправьте в\u00A0Telegram.",
    en: "Put your message together here and send it on Telegram.",
  } as L<string>,

  /** The chooser's own label. Two words, which is what `.t-mono` is for. */
  subjectLabel: { ru: "О\u00A0чём", en: "About" } as L<string>,

  /*
    THE SUBJECTS ARE THE REFERENCE'S FAQ, TURNED ROUND.

    Every answer that list would print for this club — the price, what to
    bring, how fast we reply — is a fact nobody has confirmed, and six ruled
    blanks in a row is not a design, it is an apology. So the questions are
    kept and the answers given back: each subject carries the first line of the
    letter it opens, and a reader who presses «Стоимость» finds their own
    question already begun and has only to finish it.

    The opening is a PLACEHOLDER and never a prefilled value: a sentence the
    reader did not write must not go out in their name, and a placeholder left
    alone contributes nothing to what is assembled.
  */
  subjects: [
    {
      id: "trial",
      label: { ru: "Первая тренировка", en: "First session" },
      opening: {
        ru: "Здравствуйте! Хотим привести ребёнка на\u00A0пробную тренировку…",
        en: "Hello! We would like to bring our child to a trial session…",
      },
    },
    {
      id: "price",
      label: { ru: "Стоимость", en: "Cost" },
      opening: {
        ru: "Здравствуйте! Подскажите, сколько стоят занятия…",
        en: "Hello! Could you tell me what the sessions cost…",
      },
    },
    {
      id: "timetable",
      label: { ru: "Расписание", en: "Timetable" },
      opening: {
        ru: "Здравствуйте! Подскажите по\u00A0расписанию…",
        en: "Hello! I have a question about the timetable…",
      },
    },
    {
      id: "kit",
      label: { ru: "Форма и\u00A0экипировка", en: "Kit and gear" },
      opening: {
        ru: "Здравствуйте! Что нужно к\u00A0первой тренировке…",
        en: "Hello! What is needed for the first session…",
      },
    },
    {
      id: "competitions",
      label: { ru: "Соревнования", en: "Competitions" },
      opening: {
        ru: "Здравствуйте! Интересуют соревнования…",
        en: "Hello! I am interested in the competitions…",
      },
    },
    {
      id: "other",
      label: { ru: "Другое", en: "Something else" },
      opening: { ru: "Здравствуйте!", en: "Hello!" },
    },
  ] as Subject[],

  fields: {
    name: { ru: "Имя", en: "Name" } as L<string>,
    contact: { ru: "Телефон или Telegram", en: "Phone or Telegram" } as L<string>,
    message: { ru: "Письмо", en: "Letter" } as L<string>,
  },
  placeholders: {
    name: { ru: "Тамерлан", en: "Tamerlan" } as L<string>,
    contact: { ru: "+7\u00A0900 000-00-00 или @username", en: "+7\u00A0900 000-00-00 or @username" } as L<string>,
  },

  /** The control, at rest and after it has done its one job. */
  compose: { ru: "Собрать письмо", en: "Compose the message" } as L<string>,
  open: { ru: "Открыть Telegram", en: "Open Telegram" } as L<string>,
  /** The assembled letter, handed back ready to carry across. */
  slip: { ru: "Готовое письмо", en: "Your message" } as L<string>,
  copy: { ru: "Скопировать", en: "Copy" } as L<string>,
  copied: { ru: "Скопировано", en: "Copied" } as L<string>,
  /** What the slip is for, said once, beneath it. */
  slipNote: {
    ru: "Скопируйте и\u00A0вставьте в\u00A0Telegram: письмо не\u00A0уходит с\u00A0этой страницы само.",
    en: "Copy it and paste it into Telegram: nothing leaves this page on its own.",
  } as L<string>,

  errors: {
    message: { ru: "Напишите, о\u00A0чём вопрос", en: "Tell us what you are asking about" } as L<string>,
  },
};

/*
  The two facts the register leaves ruled.

  They live here rather than on `club.pending` in `content/schedule.ts` because
  that object is documented as facts ON THAT RECORD — the club's phone, the
  hall's coordinates — and neither of these is. They are the two questions a
  parent asks straight after «в какую группу», and the club has answered
  neither; when it does, the value replaces the call to `pendingFact` here and
  nothing else on the page changes.
*/
export const pendingParticulars = {
  kit: pendingFact({ ru: "список уточняется у\u00A0клуба", en: "the list is to be confirmed with the club" }),
  price: pendingFact({ ru: "цены уточняются у\u00A0клуба", en: "prices are to be confirmed with the club" }),
};
