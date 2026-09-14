import type { Locale } from "@/i18n/config";

/**
 * Home page copy — «Первая черта» / "The First Stroke".
 * Russian is the source language; English follows it line by line.
 */

export type L<T> = Record<Locale, T>;

/*
  BOUND SPACES
  ------------
  Russian sets much longer words than English and breaks in places a Russian
  typesetter never would. Two of those breaks were visible on the first screen:
  an em dash opening a line («Остаётся / — за характером.») and a one-letter
  conjunction hanging at a line end («для детей и / взрослых»).

  So the breaks are bound here, in the copy, rather than left to the box. Every
  bound space is written as the escape `\u00A0`, never as a literal character:
  the mark is invisible in an editor, and an editor that normalises whitespace
  would silently undo it, whereas an escape survives, greps and reviews. Three
  rules, applied to every RU string that is typeset:

    1. `\u00A0` BEFORE every «—», so a dash can never begin a line.
    2. `\u00A0` AFTER every one- and two-letter preposition or conjunction
       (в с и к у о а я на не по за до из от об для во со), so a short word
       always leaves the line with the word it governs.
    3. `\u00A0` between a figure and its unit or its abbreviation
       («ул.\u00A0Кирова,\u00A0157», «41\u00A0ученик», «1\u00A0дан», «Илл.\u00A002»),
       and before a «·» or an operator used as a separator — those are dashes
       by another name.

  English binds only what English actually binds: the em dash, and a figure to
  its unit. No article or preposition is bound in the EN mirror.

  Two deliberate exceptions, both because the string is never typeset: matter
  read only by assistive technology (a figure's screen-reader description) and
  the alt texts in `media.ts` carry no bound spaces. Display headlines are bound at
  their dashes only — binding a preposition inside a 6rem line would hand the
  browser an unbreakable run wider than a phone.
*/

/*
  PENDING FACTS
  -------------
  A manual does not invent a fact, and it does not print a lie about one
  either: it prints an unset slot. The sensei's citation carried «(номер и
  дата — уточняются)» as running prose, and a second coach the club had never
  named was typeset as «Имя Фамилия» — both of them fiction set as production
  copy. The citation is still here and still pending; the second coach was
  retired with his register when chapter 四 became a chapter about one man.

  A pending fact is marked as such in the model, so a consumer can print the
  label and the ruled line with the value left blank instead of printing an
  invention. `pendingText()` returns something that is still a
  `Record<Locale, string>`, so every existing consumer keeps compiling and
  prints the blank mark rather than the fake name; a consumer that knows this
  convention calls `isPending()` and draws the ruled blank, with `awaiting` set
  beside it to say what is still missing and from whom.

  `PENDING_MARK` is the em dash, already this manual's mark for "nothing here":
  the timetable prints it for a day with no session.
*/
export const PENDING_MARK = "—";

/** A fact the club has not confirmed. `awaiting` names what is missing, in the reader's language. */
export type Pending = { pending: true; awaiting: L<string> };

/** A per-locale value that is not yet a fact: it reads as the blank mark. */
export type PendingText = L<string> & Pending;

export function pendingText(awaiting: L<string>): PendingText {
  return { ru: PENDING_MARK, en: PENDING_MARK, pending: true, awaiting };
}

/** For a fact that is not a per-locale string — a phone number, a coordinate pair. */
export function pendingFact(awaiting: L<string>): Pending {
  return { pending: true, awaiting };
}

export function isPending(value: unknown): value is Pending {
  return typeof value === "object" && value !== null && (value as { pending?: unknown }).pending === true;
}

export const chapters: { id: string; index: number; title: L<string> }[] = [
  { id: "hero", index: 1, title: { ru: "Первая черта", en: "The first stroke" } },
  { id: "about", index: 2, title: { ru: "О\u00A0клубе", en: "About" } },
  { id: "schedule", index: 3, title: { ru: "Расписание", en: "Schedule" } },
  { id: "sensei", index: 4, title: { ru: "Тренер", en: "Sensei" } },
  { id: "results", index: 5, title: { ru: "Хроника", en: "Chronicle" } },
  { id: "join", index: 6, title: { ru: "Запись", en: "Join" } },
];

/**
 * Chapter 一 — «Первая черта».
 *
 * The sheet sets ONE sentence and puts the silence inside it. «Сначала поклон.»
 * is printed at exactly half the size of «Потом удар.», with a band of bare
 * paper between them, so the sentence's own logic — first this, then that — is
 * carried by scale rather than by punctuation, and the gap the reader's eye has
 * to cross is the beat a student holds between the bow and the strike.
 *
 * Which is why this chapter sets four strings and not twelve. The eyebrow, the
 * aside, the lead, the plate legend, the brush's colophon, the trial line, the
 * Telegram link, the live strip and the scroll cue were all cut: every one of
 * them was a second voice on a sheet whose whole job is one gesture.
 */
export const hero = {
  /*
    BOUND SPACES ARE WRITTEN AS THE ESCAPE HERE, every one of them, and that is
    not a style preference — see the rule at the top of this file. A literal
    U+00A0 is invisible in an editor and the next tool that normalises
    whitespace deletes it without anyone noticing; the escape survives, and it
    greps and reviews. This block had eight lines carrying the raw character
    and they are all escapes again.
  */

  /*
    OG-ONLY, both of them. Neither is printed on the page any more — the fixed
    header prints the club's name thirty pixels above where the eyebrow used to
    stand, and the trial is folded into `offer` below. `opengraph-image.tsx`
    still sets both on the share card, which is the book's COVER: a cover is
    seen once, at 1200x630, and may carry matter the interior does not.
    Do not delete them, and do not restore them to the sheet.
  */
  eyebrow: {
    ru: "СК\u00A0Азума\u00A0· Киокушинкай каратэ\u00A0· Нальчик",
    en: "SK\u00A0Azuma\u00A0· Kyokushin karate\u00A0· Nalchik",
  },
  trial: { ru: "Первая тренировка\u00A0— пробная", en: "The first session is a trial" },


  /* The two headline lines are measured in `heroFit` below; they carry no bound
     spaces, and must not, or the measurements stop describing them. */
  line1: { ru: "Сначала поклон.", en: "First the bow." },
  line2: { ru: "Потом удар.", en: "Then the strike." },

  /*
    The sheet's only prose, and the only commercial sentence on it. It carries
    the two facts that actually decide a parent — how young a child may start,
    and that the first session costs nothing to try — and it absorbs both the
    old Cormorant aside and the old trial line.

    IT IS TWO SENTENCES AND IT STAYS TWO. The reference this composition is
    drawn from sets four lines of prose in this corner, and the obvious move is
    to write two more to fill the column. But a third sentence about the hall
    and the park would be chapter 二's own `about.lede` printed twice on one page,
    and everything else the club has confirmed is either an address — which
    lives once, in `content/schedule.ts` — or is not confirmed at all. The
    column is set to 34ch instead, so two sentences fill three lines. The
    length of this paragraph is a typographic problem, not a copy problem.

    Set at caption size and in SENTENCE CASE on purpose: `.t-mono` is for labels
    of three words or fewer, and this is a sentence, to be read rather than
    counted.
  */
  offer: {
    ru: "Детям с\u00A0четырёх лет и\u00A0взрослым. Первая тренировка\u00A0— пробная.",
    en: "Children from age four and adults. The first session is a trial.",
  },
  /* The page's one action. Unchanged, and still the whole label. */
  ctaPrimary: { ru: "Записаться на\u00A0первую тренировку", en: "Book a first session" },

  /*
    RETIRED FROM THE HERO, kept for chapter 二 to adopt. It is a good paragraph,
    and it is most of the reason the old sheet carried four blocks of text; it
    simply belongs one screen later, where a reader who has decided to keep
    reading is asking the question it answers.
  */
  lead: {
    ru: "Секция киокушинкай каратэ для\u00A0детей и\u00A0взрослых. Дисциплина, характер и\u00A0настоящая физическая подготовка\u00A0— на\u00A0улице Кирова и\u00A0по\u00A0утрам в\u00A0парке.",
    en: "A Kyokushin karate club for children and adults. Discipline, character and real physical training\u00A0— on Kirova street and in the park at dawn.",
  },
} satisfies Record<string, L<string>>;

/**
 * Width of each headline line set in Prata 400 at −0.01em, in em, measured in
 * the browser against the live face.
 *
 * THE SIZE LAW. The strike is set to `measure / strike`, so «Потом удар.» lands
 * exactly on the right edge of its own column, in either language, at any
 * viewport; the bow is then set to half of that. The column is 0.62 of the trim
 * from 1100 up — the rest of the foot is the offer — and the whole trim below
 * it, where the offer stacks underneath instead.
 *
 * Because the bow is half, it fits on one line wherever `bow ÷ 2 ÷ strike ≤ 1`
 * — RU 0.694, EN 0.435 — so NEITHER LINE EVER WRAPS, at any width down to 390,
 * at either share, and the hero's fold guard divides by a constant 1.41
 * (0.94 leading × 1.5 lines) rather than by a measured row count.
 *
 * `wide` and `narrow` are the older pair and are kept only because
 * `opengraph-image.tsx` reads them (`Math.max(wide, narrow)`). They are these
 * same two lines padded, in longest-first order; the page does not use them.
 *
 * RE-MEASURE ALL OF THIS if the headline copy, the display face or the
 * headline's letter-spacing changes. The recipe: a `<span>` set in the live
 * Prata at `font-size: 100px; letter-spacing: -0.01em; white-space: pre`, then
 * `getBoundingClientRect().width / 100`. Tightening the tracking without
 * re-measuring silently stops the strike landing on the trim. Re-taken against
 * the live face in the hero's full-bleed pass and unchanged to three decimals.
 */
export const heroFit: Record<Locale, { wide: number; narrow: number; bow: number; strike: number }> = {
  // measured: «Сначала поклон.» 8.243 · «Потом удар.» 5.942 — padded ~0.6%
  ru: { wide: 8.36, narrow: 6.04, bow: 8.29, strike: 5.98 },
  // measured: "First the bow." 6.307 · "Then the strike." 7.249 — here the second line is the longer
  en: { wide: 7.38, narrow: 7.38, bow: 6.35, strike: 7.30 },
};

export const about = {

  /* ---- the name, and what the club is ----------------------------- */
  /*
    ONE WORD AT SCALE, AND NOTHING GLOSSES IT. The chapter used to set two
    dictionary entries at display size — «Азума — восток.» and «Киокушин —
    предельная истина.» — each filling its own screen. The second went first,
    folded into the prose below. The first has now lost its meaning line too,
    so what stands at the head of the chapter is the club's name and nothing
    else. 東 is blind-stamped beside it and the reading is spelled out nowhere:
    the mark is the club's own, not a lesson in Japanese.

    THE KEYS ARE NO LONGER NUMBERED. They were `word1` / `body1` / `word3` /
    `meaning3` while the chapter ran to two frames with a statement each. There
    is one frame now, so the digits pointed at nothing.
  */
  name: { ru: "Азума", en: "Azuma" },
  /*
    The chapter's only prose, and it states exactly two things now: what the
    club is, and where and when it trains.

    IT USED TO CARRY THE FULL-CONTACT PARAGRAPH — what kyokushin means, that
    there are no points for a touch, and the two rules that actually answer a
    parent: no sparring under eight, and headgear and pads after that, only
    once the child is ready. That was cut deliberately. The safety half of it
    still reaches the reader in chapter 三, off the group notes in
    `content/schedule.ts` («Без спаррингов.» on kids-4-6, «Кумитэ в защите…»
    on teens-12-16). The definition of the word is nowhere on the page, by
    choice.

    Bound spaces are written as the escape and never as a literal NBSP — see
    the note at the head of this file. Shorten this string by deleting from a
    sentence boundary, never by retyping the part that survives.
  */
  lede: {
    ru: "СК\u00A0«Азума»\u00A0— секция киокушинкай каратэ в\u00A0Нальчике. Вечером мы работаем в\u00A0зале, по\u00A0выходным\u00A0— в\u00A0парке, лицом к\u00A0восходу.",
    en: "SK\u00A0Azuma is a Kyokushin karate club in Nalchik. We train in the hall in the evenings and in the park at weekends, facing the sunrise.",
  },
};

export const sensei = {
  /*
    Sensei.tsx splits this on its space to set the two lines of the name, so
    this one string must never carry a bound space — a nbsp here would print
    the name as a single unbreakable line.
  */
  name: { ru: "Астемир Жамбеев", en: "Astemir Zhambeev" },
  rank: { ru: "Мастер спорта международного класса", en: "Master of Sport, International Class" },
  /*
    The confirmed half of the citation. It used to end «(номер и дата —
    уточняются)», which set the gap in the club's own records as though the
    parenthesis were part of the honour. The gap is a pending fact now
    (`decreeRef`), so this line states only what is true.
  */
  decree: {
    ru: "Звание присвоено приказом Минспорта России.",
    en: "Title conferred by order of the Russian Ministry of Sport.",
  },
  decreeRefLabel: { ru: "Приказ", en: "Order" },
  /** PENDING — the decree's number and date. Print the label and a ruled blank. */
  decreeRef: pendingText({ ru: "номер и\u00A0дата приказа", en: "order number and date" }),
  /*
    THE TWO REGISTERS — one man, read twice.

    This was a single `bio` paragraph that ran the founder, his competitive
    record and his teaching into one block of prose. It is the same three
    sentences, in the same words, split onto the two registers the chapter is
    composed around: what he has done, and what he does. One semicolon became a
    full stop and the founder clause moved to open the second register. NOTHING
    WAS ADDED AND NOTHING WAS DROPPED — check any edit here against that,
    because a register is a place a fact could very easily be invented.

    The labels are the copy's own vocabulary («лучший СПОРТСМЕН сезона»,
    «главный ТРЕНЕР»), so neither asserts anything the biography did not
    already. The order is chronological — he competed, then he taught — so the
    block lands on «Тренер», which is this chapter's own title and the word a
    parent is reading for.
  */
  registers: [
    {
      label: { ru: "Спортсмен", en: "Competitor" },
      body: {
        ru: "Призёр чемпионатов и\u00A0первенств России по\u00A0киокушин. Лучший спортсмен сезона 2025/26 по\u00A0версии клуба.",
        en: "Medallist of Russian Kyokushin championships. The club's athlete of the 2025/26 season.",
      },
    },
    {
      label: { ru: "Тренер", en: "Coach" },
      body: {
        ru: "Основатель и\u00A0главный тренер SK\u00A0AZUMA. Ведёт детские и\u00A0взрослую группы сам\u00A0— от\u00A0первого поклона до\u00A0чёрного пояса.",
        en: "Founder and head coach of SK\u00A0AZUMA. He coaches the children's and adult groups himself\u00A0— from the first bow to the black belt.",
      },
    },
  ],
  /*
    NO PLATE CAPTION, and that is a decision rather than an omission.

    «Илл. 04 — А. Жамбеев, портрет.» stood here and printed the sensei's name
    under a Wikimedia stranger — an invented fact hiding in the apparatus
    rather than in the copy, which is exactly where nobody goes looking for
    one. The plate runs uncaptioned now: its subject is named at chapter scale
    one column away, which is how a frontispiece portrait has always been
    captioned. `media.ts` carries the alt text, and that is the only
    description of this plate that is true of the file on disk.

    ALSO RETIRED HERE: `second` — the second coach. The club never gave a name,
    so the slot printed a label, a ruled blank and a note saying the name was
    awaited. A register whose entire content is an absence is not a register,
    and the chapter is about one man. The pending fact retires with the slot
    rather than lingering unrendered.

    AND `hoverHint` — «Наведите — увидите его таким, каким видят ученики». It
    was already unreferenced, and this chapter now has no hover at all.

    AND `quote` / `signature` — the coda that closed the chapter under a rule.
    It said at display size what the registers had already said in the man's
    own record, and the seal beside it belongs where a reader signs up, not
    where a biography ends.
  */
};

export const results = {
  title: { ru: "Сезон 2025/26", en: "Season 2025/26" },
  lead: { ru: "Медали считаем так, как считают в\u00A0додзё: по\u00A0пять черт.", en: "We count medals the dojo way: five strokes at a time." },
  /** PLACEHOLDER counts — the club's to confirm, never ours to adjust. */
  tallies: [
    { label: { ru: "Медали сезона", en: "Season medals" }, value: 23 },
    { label: { ru: "Аттестаций сдано", en: "Gradings passed" }, value: 41 },
    { label: { ru: "Турниров", en: "Tournaments" }, value: 7 },
  ],
  timeline: [
    { date: { ru: "Март\u00A02026", en: "March\u00A02026" }, title: { ru: "Первенство России по\u00A0киокушин", en: "Russian Kyokushin Youth Championship" }, note: { ru: "золото и\u00A0бронза, Москва", en: "gold and bronze, Moscow" } },
    { date: { ru: "Февраль\u00A02026", en: "February\u00A02026" }, title: { ru: "Чемпионат России по\u00A0киокушин", en: "Russian Kyokushin Championship" }, note: { ru: "выход в\u00A0финал", en: "reached the final" } },
    { date: { ru: "Декабрь\u00A02025", en: "December\u00A02025" }, title: { ru: "Первенство КБР", en: "Kabardino-Balkaria Youth Championship" }, note: { ru: "12\u00A0призовых мест", en: "12\u00A0podium places" } },
    { date: { ru: "Октябрь\u00A02025", en: "October\u00A02025" }, title: { ru: "Аттестация на\u00A0пояса", en: "Belt grading" }, note: { ru: "41\u00A0ученик, первые оранжевые пояса", en: "41\u00A0students, first orange belts" } },
  ],
  best: { ru: "Лучший спортсмен года\u00A0· сезон\u00A02025–2026", en: "Athlete of the year\u00A0· season\u00A02025–2026" },
  plateCaption: { ru: "Илл.\u00A005\u00A0— кубки перед награждением.", en: "Plate\u00A005\u00A0— trophies before the awards." },
};

export const schedule = {
  title: { ru: "Неделя", en: "The week" },
  lead: { ru: "Зал на\u00A0Кирова,\u00A0157. Пробная тренировка\u00A0— в\u00A0любой день вашей группы.", en: "The hall at Kirova\u00A0157. A trial session on any day of your group." },
  route: { ru: "Построить маршрут", en: "Get directions" },
  telegram: { ru: "Написать в\u00A0Telegram", en: "Message on Telegram" },
  note: { ru: "Расписание\u00A0— предварительное и\u00A0уточняется у\u00A0тренера.", en: "The timetable is provisional and confirmed with the coach." },

  /*
    The table's own apparatus — the band's caption, today's mark, and the
    sr-only heading on the mobile agenda's times. These were a `copy` object
    inside `Timetable.tsx`; a component holding three strings is a second
    content layer, and the band's caption is printed now rather than being an
    aria-label only.

    No bound spaces are due here: none of the three carries an em dash, a short
    preposition or a figure and its unit.
  */
  table: {
    groups: { ru: "Группы", en: "Groups" },
    today: { ru: "сегодня", en: "today" },
    hours: { ru: "Время", en: "Time" },
  },
};

export const join = {
  title: { ru: "Первая тренировка", en: "The first session" },
  lead: { ru: "Оставьте имя и\u00A0возраст ученика\u00A0— мы ответим в\u00A0Telegram в\u00A0течение дня и\u00A0подберём группу.", en: "Leave the student's name and age\u00A0— we will reply on Telegram within the day and suggest a group." },
  fields: {
    name: { ru: "Имя ученика", en: "Student's name" },
    age: { ru: "Возраст ученика", en: "Student's age" },
    contact: { ru: "Телефон или Telegram", en: "Phone or Telegram" },
    note: { ru: "Комментарий (необязательно)", en: "Comment (optional)" },
  },
  placeholders: {
    name: { ru: "Тамерлан", en: "Tamerlan" },
    age: { ru: "6", en: "6" },
    contact: { ru: "+7\u00A0900 000-00-00 или @username", en: "+7\u00A0900 000-00-00 or @username" },
  },
  submit: { ru: "Записаться", en: "Sign up" },
  sending: { ru: "Отправляем…", en: "Sending…" },
  success: { ru: "Осу! Мы получили заявку и\u00A0напишем вам сегодня.", en: "Osu! We have your request and will message you today." },
  error: { ru: "Не\u00A0отправилось. Напишите нам в\u00A0Telegram\u00A0— ответим сразу.", en: "It did not send. Message us on Telegram\u00A0— we reply right away." },
  /*
    The consent line. Under 152-ФЗ the consent has to point at a stated policy
    and there is no policy route on the site yet, so the phrase such a link
    would wrap is kept separate: a consumer sets `privacyLead`, links
    `privacyLink` once the route exists, and closes with `privacyTail`.
    `privacy` stays as the single-string form for as long as nothing links it.
  */
  privacy: { ru: "Нажимая «Записаться», вы соглашаетесь на\u00A0обработку персональных данных.", en: "By pressing “Sign up” you agree to the processing of personal data." },
  privacyLead: { ru: "Нажимая «Записаться», вы соглашаетесь на\u00A0", en: "By pressing “Sign up” you agree to the " },
  privacyLink: { ru: "обработку персональных данных", en: "processing of personal data" },
  privacyTail: { ru: ".", en: "." },
  alt: { ru: "или напишите в\u00A0Telegram", en: "or message us on Telegram" },
  trust: { ru: "Ответим в\u00A0Telegram в\u00A0течение дня.", en: "We reply on Telegram within the day." },
  errors: {
    name: { ru: "Напишите имя", en: "Please enter a name" },
    age: { ru: "Укажите возраст от\u00A04 до\u00A099", en: "Enter an age from 4 to 99" },
    contact: { ru: "Оставьте телефон или Telegram", en: "Leave a phone number or Telegram" },
  },
};
