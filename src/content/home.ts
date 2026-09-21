import type { MediaKey } from "./media";

/**
 * Home page copy — «Первая черта» / "The First Stroke".
 *
 * The manual is set in Russian and in nothing else. Every string here used to
 * be a `Record<Locale, string>` with an English mirror beside it, read through
 * `value[locale]`; the English edition was withdrawn and the pairs were
 * collapsed to the Russian side, so a string in this file is now just a string
 * and a consumer prints it directly.
 */

/*
  BOUND SPACES
  ------------
  Russian sets much longer words than English and breaks in places a Russian
  typesetter never would. Two of those breaks were visible on the first screen:
  an em dash opening a line («Остаётся / — за характером.») and a one-letter
  conjunction hanging at a line end («для детей и / взрослых»). The first of
  those two cannot happen any more: no copy on this site sets an em dash.

  So the breaks are bound here, in the copy, rather than left to the box. Every
  bound space is written as the escape `\u00A0`, never as a literal character:
  the mark is invisible in an editor, and an editor that normalises whitespace
  would silently undo it, whereas an escape survives, greps and reviews. Two
  rules, applied to every string that is typeset:

    1. `\u00A0` AFTER every one- and two-letter preposition or conjunction
       (в с и к у о а я на не по за до из от об для во со), so a short word
       always leaves the line with the word it governs.
    2. `\u00A0` between a figure and its unit or its abbreviation
       («ул.\u00A0Кирова,\u00A0157», «41\u00A0ученик», «1\u00A0дан», «Илл.\u00A002»),
       and before a «·» or an operator used as a separator — those are dashes
       by another name.

  Two deliberate exceptions, both because the string is never typeset: matter
  read only by assistive technology (a figure's screen-reader description) and
  the alt texts in `media.ts` carry no bound spaces. Display headlines carry none
  either: binding a preposition inside a 6rem line would hand the browser an
  unbreakable run wider than a phone.

  NO EM DASH IS SET ANYWHERE A READER CAN SEE ONE. The mark
  was this manual's main joint, and every string that leaned on one has been
  rebuilt around it: split into two sentences, or rejoined with a colon, a
  comma or a conjunction. Nothing was swapped for a lookalike, and the en dash
  is untouched where it sets a range («4–6», «10–9», «5–6 октября»). Rule 1
  above used to bind a space before every «—»; there is nothing left for it to
  bind, so it is gone. Do not put one back.
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
  invention. `pendingText()` carries the blank mark as its `text`, so a
  consumer that knows nothing of the convention still prints the mark rather
  than a fake name; one that knows it calls `isPending()` and draws the ruled
  blank, with `awaiting` set beside it to say what is still missing and from
  whom.

  `PENDING_MARK` is the middle dot, this manual's mark for "nothing here": the
  timetable prints it for a day with no session. It was an em dash until the
  dash was taken out of the copy everywhere. No reader has met either mark:
  every printed day currently has a session, and both pending facts
  (`club.phone`, `club.coordsLabel`) are unprinted.
*/
export const PENDING_MARK = "·";

/** A fact the club has not confirmed. `awaiting` names what is missing. */
export type Pending = { pending: true; awaiting: string };

/** A value that is not yet a fact: its `text` reads as the blank mark. */
export type PendingText = { text: string } & Pending;

export function pendingText(awaiting: string): PendingText {
  return { text: PENDING_MARK, pending: true, awaiting };
}

/** For a fact that is not a string a reader sees — a phone number, a coordinate pair. */
export function pendingFact(awaiting: string): Pending {
  return { pending: true, awaiting };
}

export function isPending(value: unknown): value is Pending {
  return typeof value === "object" && value !== null && (value as { pending?: unknown }).pending === true;
}

export const chapters: { id: string; index: number; title: string }[] = [
  { id: "hero", index: 1, title: "Первая черта" },
  { id: "about", index: 2, title: "О\u00A0клубе" },
  { id: "schedule", index: 3, title: "Расписание" },
  { id: "sensei", index: 4, title: "Тренеры" },
  { id: "results", index: 5, title: "Хроника" },
  { id: "join", index: 6, title: "Запись" },
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
  eyebrow: "СК\u00A0Азума\u00A0· Киокушинкай каратэ\u00A0· Нальчик",
  trial: "Первая тренировка пробная",


  /* The two headline lines are measured in `heroFit` below; they carry no bound
     spaces, and must not, or the measurements stop describing them. */
  line1: "Сначала поклон.",
  line2: "Потом удар.",

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
  offer: "Детям с\u00A0четырёх лет и\u00A0взрослым. Первая тренировка пробная.",
  /* The page's one action. Unchanged, and still the whole label. */
  ctaPrimary: "Записаться на\u00A0первую тренировку",

  /*
    RETIRED FROM THE HERO, kept for chapter 二 to adopt. It is a good paragraph,
    and it is most of the reason the old sheet carried four blocks of text; it
    simply belongs one screen later, where a reader who has decided to keep
    reading is asking the question it answers.
  */
  lead: "Секция киокушинкай каратэ для\u00A0детей и\u00A0взрослых. Дисциплина, характер и\u00A0настоящая физическая подготовка на\u00A0улице Кирова и\u00A0по\u00A0утрам в\u00A0парке.",
} satisfies Record<string, string>;

/**
 * Width of each headline line set in Prata 400 at −0.01em, in em, measured in
 * the browser against the live face.
 *
 * THE SIZE LAW. The strike is set to `measure / strike`, so «Потом удар.» lands
 * exactly on the right edge of its own column, at any viewport; the bow is
 * then set to half of that. The column is 0.62 of the trim
 * from 1100 up — the rest of the foot is the offer — and the whole trim below
 * it, where the offer stacks underneath instead.
 *
 * Because the bow is half, it fits on one line wherever `bow ÷ 2 ÷ strike ≤ 1`
 * — 0.694 here — so NEITHER LINE EVER WRAPS, at any width down to 390, at
 * either share, and the hero's fold guard divides by a constant 1.41
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
// measured: «Сначала поклон.» 8.243 · «Потом удар.» 5.942 — padded ~0.6%
export const heroFit = { wide: 8.36, narrow: 6.04, bow: 8.29, strike: 5.98 };

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
  name: "Азума",
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
  lede: "СК\u00A0«Азума»: секция киокушинкай каратэ в\u00A0Нальчике. Вечером мы работаем в\u00A0зале, а\u00A0по\u00A0выходным выходим в\u00A0парк, лицом к\u00A0восходу.",
};

export const sensei = {
  /** The slot in `media.ts` — the head coach's half of the spread. */
  plate: "senseiPlate",
  /*
    Sensei.tsx splits this on its space to set the two lines of the name, so
    this one string must never carry a bound space — a nbsp here would print
    the name as a single unbreakable line.
  */
  name: "Астемир Жамбеев",
  rank: "Мастер спорта международного класса",
  /*
    RETIRED HERE: `decree`, `decreeRefLabel` and `decreeRef` — the citation.

    It printed a rule, the sentence «Звание присвоено приказом Минспорта
    России.», the label «ПРИКАЗ», a ruled blank and a note saying the number
    and the date were awaited. Two of those three were apparatus and the third
    was an absence, and from 1600 the whole block was dropped into the channel
    between the type and the plate, where it stood as a fragment with nothing
    above or below it. The chapter is the man's name, his rank and his record;
    the loudest thing this block said was that the club had not answered yet.

    The ministry sentence is a CONFIRMED fact and it is the one thing the
    chapter gave up. If the club wants it back it belongs under the rank as a
    sentence — not as a label, a rule and a blank.
  */
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
      label: "Спортсмен",
      body: "Призёр чемпионатов и\u00A0первенств России по\u00A0киокушин. Лучший спортсмен сезона 2025/26 по\u00A0версии клуба.",
    },
    {
      label: "Тренер",
      body: "Основатель и\u00A0главный тренер SK\u00A0AZUMA. Ведёт детские и\u00A0взрослую группы от\u00A0первого поклона до\u00A0чёрного пояса.",
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

    THE SECOND COACH IS BACK, AND HE IS INVENTED. `second` used to live here
    as a pending fact — a label, a ruled blank and a note saying the name was
    awaited — and it was deleted because a register whose entire content is an
    absence is not a register. The chapter now sets two coaches as a spread,
    so the second one needed a name, a rank and a record to stand up at all.
    He has them and none of them came from the club: see `assistant` below,
    which carries the whole argument and the instructions for deleting him.

    AND `hoverHint` — «Наведите — увидите его таким, каким видят ученики». It
    was already unreferenced, and this chapter now has no hover at all.

    AND `quote` / `signature` — the coda that closed the chapter under a rule.
    It said at display size what the registers had already said in the man's
    own record, and the seal beside it belongs where a reader signs up, not
    where a biography ends.
  */
} as const;

/**
 * THE SECOND COACH — AND THE ONLY INVENTED PERSON ON THIS SITE.
 *
 * Read this before touching anything in it.
 *
 * Everything below is a PLACEHOLDER. The name, the rank, the belt, the groups
 * he works with: none of it came from the club. It is written the way real
 * copy is written — a plausible Kabardian name, a real Russian sporting rank
 * one step under the head coach's, the club's own confirmed age bands — so
 * that the composition can be judged at full strength and so the client can
 * see the spread they are being asked to fill. That is the whole of its job.
 *
 * It breaks this file's own rule on purpose. The convention here is that a
 * fact the club has not given is modelled as PENDING (`pendingText()` /
 * `pendingFact()`) and prints as a ruled blank, never as plausible copy — and
 * that is exactly what the old `second` slot did, and exactly why it was
 * deleted: a register whose entire content is an absence is not a register.
 * The chapter now gives this man half the sheet, a plate and a name at chapter
 * scale, and half a spread of ruled blanks is not a design anyone can judge.
 * So the decision was made the other way, ONCE, in the open, here.
 *
 * WHICH MEANS IT CANNOT SHIP. It is listed in the README under «Before this
 * can go live» with the photography and the prices. If the club has no second
 * coach, delete this export, delete `assistantPlate` from `media.ts`, and the
 * chapter falls back to one entry — `Sensei.tsx` maps over `coaches` and does
 * not care how many there are.
 *
 * The one thing NOT invented is the age bands: 4–6 and 6–11 are the club's own
 * and are confirmed, and they are written here exactly as `schedule.ts` writes
 * them, so a reader who compares the two chapters is not told two stories.
 */
export const assistant = {
  /** The slot in `media.ts`. See the note there: the frame is a stand-in too. */
  plate: "assistantPlate",
  /*
    Split on its space for the two lines of the name, like the head coach's —
    so this string must never carry a bound space either.
  */
  name: "Руслан Тхагапсоев",
  rank: "Кандидат в мастера спорта",
  /*
    The same two registers under the same two words the head coach's entry
    uses. That is the point of them: the spread is one register system read
    twice, so the two men are set in the same terms and the reader can compare
    them without being told to.
  */
  registers: [
    {
      label: "Спортсмен",
      body: "Кандидат в\u00A0мастера спорта по\u00A0киокушин. Чёрный пояс, 1\u00A0дан.",
    },
    {
      label: "Тренер",
      body: "Ассистент главного тренера. Работает с\u00A0детскими группами 4–6 и\u00A06–11\u00A0лет.",
    },
  ],
} as const;

/**
 * The chapter, in reading order: the founder, then his assistant.
 *
 * `Sensei.tsx` maps over this and lays one entry per half of the spread, so
 * the chapter's arithmetic is the length of this array and nothing else.
 * Adding a third coach is a content edit; taking the second one away is a
 * deletion, and neither is a change to the component.
 *
 * `sensei` is named apart from the array because the FOUNDER is a different
 * fact from «whoever happens to be first in a list», and anything that prints
 * the club's head coach must read the name rather than index into `coaches`.
 * Its one reader outside this file was the contacts page, and left with it.
 */
export const coaches = [sensei, assistant] as const;

/**
 * One entry in the chronicle: what it was, when, and the plate it is
 * evidenced by. `plate` is a slot in `media.ts`, which stays the only file on
 * the site where a photograph is named.
 */
export type ChronicleEntry = {
  date: string;
  title: string;
  note: string;
  plate: MediaKey;
};

export const results = {
  title: "Сезон 2025/26",
  lead: "Турнир за\u00A0турниром. Счёт в\u00A0додзё ведут по\u00A0пять черт.",
  /* The chronicle moves sideways, which is the one thing about it a reader
     cannot infer from a still frame. One line, printed once, in the masthead. */
  hint: "Листайте\u00A0→",

  /*
    THE CHRONICLE — the club's own record, newest first, and CONFIRMED.

    This array is the only thing that has to grow. Chapter 五 prints every
    entry at the same size — one width, one 4:3 plate, one top edge — so a
    fourth one composes itself with no component touched; it needs a `plate`
    slot in `media.ts` and nothing else.

    A note does NOT restate its own date. A chronicle is ordered by date, the
    date is printed as its own field beside the title, and a note opening
    «26 июля 2025 года…» sets the same fact twice inside one panel.
  */
  events: [
    {
      date: "26\u00A0июля 2025",
      title: "RCC Kyokushin Fight\u00A04",
      note: "Профессиональный турнир по\u00A0киокусинкай на\u00A0арене Академии единоборств РМК. Спортсмены клуба взяли призовые места и\u00A0соревновательный опыт.",
      plate: "kumiteKick",
    },
    {
      date: "5–6\u00A0октября 2024",
      title: "Чемпионат и\u00A0Первенство России",
      note: "Спортсмены клуба показали высокий уровень подготовки и\u00A0вернулись с\u00A0большим количеством призовых мест.",
      plate: "trophies",
    },
    {
      date: "20–23\u00A0февраля 2025",
      title: "Russian Open Cup 2025",
      note: "Международные соревнования в\u00A0Московском центре боевых искусств: от\u00A08\u00A0лет до\u00A0взрослых, весовые категории и\u00A0ката. В\u00A0условиях высокой конкуренции спортсмены клуба достойно представили себя.",
      plate: "flyingKick",
    },
  ] satisfies ChronicleEntry[],

  /*
    THE COLOPHON. The roll ends on the count rather than on another
    photograph — three counted rows, struck in 正, five strokes at a time.

    PLACEHOLDER counts: the club's to confirm, never ours to adjust.
  */
  tallies: [
    { label: "Медали сезона", value: 23 },
    { label: "Аттестаций сдано", value: 41 },
    { label: "Турниров", value: 7 },
  ],
  best: "Лучший спортсмен года\u00A0· сезон\u00A02025–2026",
};

export const schedule = {
  title: "Неделя",
  lead: "Зал на\u00A0Кирова,\u00A0157. Пробная тренировка в\u00A0любой день вашей группы.",
  route: "Построить маршрут",
  telegram: "Написать в\u00A0Telegram",
  note: "Расписание предварительное, уточняйте у\u00A0тренера.",

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
    groups: "Группы",
    today: "сегодня",
    hours: "Время",
  },
};

export const join = {
  title: "Первая тренировка",
  /*
    One line, and it states the act and its outcome and nothing else. Nothing
    about price or a free first session is asserted; those are still pending
    facts, and a sheet that guessed at either would be inventing one.
  */
  lead: "Оставьте заявку, и\u00A0мы подберём группу.",

  /* ---- the entry ------------------------------------------------- */
  /*
    Four asks and not one more. Name, age and a way to answer are what a coach
    needs to put a child in a group; everything else the reader wants to say
    goes in the comment, in their own words, because a fifth labelled field is
    the club deciding in advance what a parent is allowed to be worried about.
  */
  fields: {
    name: "Имя ученика",
    age: "Возраст ученика",
    contact: "Телефон или Telegram",
    note: "Комментарий (необязательно)",
  },
  /*
    ONE PLACEHOLDER, AND IT IS THE ONE THAT TEACHES SOMETHING. «Тамерлан» and
    «6» used to stand in the name and age blanks. On the ruled register that
    was a defect and not a hint: a placeholder is text and is held to the same
    4.5:1 floor as the label beside it, so on ink both land on
    --color-bone-2 and «ВОЗРАСТ УЧЕНИКА    6» reads as an answer the form has
    already recorded rather than as an empty blank. The tone cannot be dropped
    to separate them, so the two decorative ones are gone and the blanks are
    blank. `contact` stays because it is the one ask whose ANSWER has a shape
    the reader cannot guess: a number or an @handle, either is fine.
  */
  placeholders: {
    contact: "+7\u00A0900 000-00-00 или @username",
  },
  errors: {
    name: "Напишите имя",
    age: "Укажите возраст от\u00A04 до\u00A099",
    contact: "Оставьте телефон или Telegram",
  },
  submit: "Записаться",

  /* ---- what the entry becomes ------------------------------------ */
  /*
    THE REQUEST IS ASSEMBLED IN THE READER'S OWN BROWSER AND CARRIED ACROSS BY
    HAND, for one reason: there is no bot token, no chat id and no address the
    club has agreed an enquiry should land in, so nothing here may claim to
    send.

    `opening` is the ONE line this page contributes to a message that goes out
    in the reader's name, and it is a statement of what they just did rather
    than a sentence put in their mouth — they pressed «Записаться» on a sheet
    headed «Первая тренировка». Their four answers follow it verbatim, and the
    whole thing is printed back to them on the slip BEFORE they carry it, so
    no word leaves this page unread by the person whose name is on it.

    `years` declines the unit: «1 год», «22 года», «7 лет». The consumer picks
    the form with `Intl.PluralRules`, on the "ru" locale, which is the only
    language this sheet is set in.
  */
  opening: "Заявка на\u00A0первую тренировку.",
  years: { one: "год", few: "года", many: "лет" },
  slip: "Готовая заявка",
  slipNote: "Заявка не\u00A0уходит сама. Откройте Telegram и\u00A0отправьте её.",
  copy: "Скопировать",
  copied: "Скопировано",
  open: "Открыть Telegram",

  /* ---- the exit --------------------------------------------------- */
  alt: "или напишите в\u00A0Telegram",
  trust: "Ответим в\u00A0Telegram в\u00A0течение дня.",

  /*
    DORMANT, AND KEPT ON PURPOSE.

    `sending` / `success` / `error` describe a POST, and this chapter performs
    none: the request is assembled in the browser and handed to the reader.
    The day a route exists the submit awaits it, `success` finally has
    something true to say, and the slip becomes the fallback rather than the
    outcome.

    `privacy` and its three parts are the 152-ФЗ consent. No consent is printed
    on this sheet, and that is not an oversight: consent covers the PROCESSING
    of personal data, and nothing typed here leaves the reader's own browser. A
    legal sentence printed where no data is processed is a false statement in
    the one register where false statements matter most. The consent arrives
    WITH the route, and `privacyLink` is kept split from the lead and the tail
    because it has to wrap an actual policy URL that does not exist yet.

    `privacy` and `trust` are kept as dormant keys rather than deleted, and
    nothing may start reading them again until there is a route behind them.
  */
  sending: "Отправляем…",
  success: "Осу! Мы получили заявку и\u00A0напишем вам сегодня.",
  error: "Не\u00A0отправилось. Напишите нам в\u00A0Telegram, и\u00A0мы ответим сразу.",
  privacy: "Нажимая «Записаться», вы соглашаетесь на\u00A0обработку персональных данных.",
  privacyLead: "Нажимая «Записаться», вы соглашаетесь на\u00A0",
  privacyLink: "обработку персональных данных",
  privacyTail: ".",
};
