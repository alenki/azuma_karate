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
  read only by assistive technology (`programs.chart.description`) and the alt
  texts in `media.ts` carry no bound spaces. Display headlines are bound at
  their dashes only — binding a preposition inside a 6rem line would hand the
  browser an unbreakable run wider than a phone.
*/

/*
  PENDING FACTS
  -------------
  A manual does not invent a fact, and it does not print a lie about one
  either: it prints an unset slot. The second coach was «Имя Фамилия» and the
  sensei's citation carried «(номер и дата — уточняются)» as running prose —
  both of them fiction typeset as production copy.

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
  { id: "programs", index: 3, title: { ru: "Группы", en: "Groups" } },
  { id: "sensei", index: 4, title: { ru: "Тренер", en: "Sensei" } },
  { id: "results", index: 5, title: { ru: "Хроника", en: "Chronicle" } },
  { id: "morning", index: 6, title: { ru: "Утро", en: "Morning" } },
  { id: "reviews", index: 7, title: { ru: "Слова родителей", en: "Parents" } },
  { id: "schedule", index: 8, title: { ru: "Расписание", en: "Schedule" } },
  { id: "faq", index: 9, title: { ru: "Вопросы", en: "Questions" } },
  { id: "join", index: 10, title: { ru: "Запись", en: "Join" } },
];

export const hero = {
  eyebrow: {
    ru: "СК\u00A0Азума\u00A0· Киокушинкай каратэ\u00A0· Нальчик",
    en: "SK\u00A0Azuma\u00A0· Kyokushin karate\u00A0· Nalchik",
  },
  /* The two headline lines are measured in `heroFit` below; they carry no bound
     spaces, and must not, or the measurements stop describing them. */
  line1: { ru: "Сначала поклон.", en: "First the bow." },
  line2: { ru: "Потом удар.", en: "Then the strike." },
  aside: { ru: "с\u00A0четырёх лет", en: "from age four" },
  lead: {
    ru: "Секция киокушинкай каратэ для\u00A0детей и\u00A0взрослых. Дисциплина, характер и\u00A0настоящая физическая подготовка\u00A0— на\u00A0улице Кирова и\u00A0по\u00A0утрам в\u00A0парке.",
    en: "A Kyokushin karate club for children and adults. Discipline, character and real physical training\u00A0— on Kirova street and in the park at dawn.",
  },
  ctaPrimary: { ru: "Записаться на\u00A0первую тренировку", en: "Book a first session" },
  ctaPrimaryShort: { ru: "Записаться на\u00A0тренировку", en: "Book a first session" },
  ctaSecondary: { ru: "Расписание", en: "Schedule" },
  ctaTelegram: { ru: "или напишите в\u00A0Telegram", en: "or message us on Telegram" },
  trial: { ru: "Первая тренировка\u00A0— пробная", en: "The first session is a trial" },
  plateCaption: { ru: "Илл.\u00A001\u00A0— удар в\u00A0прыжке, вечерняя тренировка.", en: "Plate\u00A001\u00A0— a jumping kick, evening training." },
  hand: { ru: "Тушь\u00A0· одно движение\u00A0· без исправлений", en: "Ink\u00A0· one movement\u00A0· no corrections" },
  scroll: { ru: "Листайте", en: "Scroll" },
} satisfies Record<string, L<string>>;

/**
 * Width of each headline line set in Prata, in em, measured in the browser.
 * The hero divides the measure by the longer of the two so the headline is
 * always set to the exact column width, in either language, at any viewport.
 * `narrow` only has to fit the second line — the first is allowed to wrap.
 * Re-measure these if the headline copy or the display face changes.
 */
export const heroFit: Record<Locale, { wide: number; narrow: number }> = {
  // «Сначала поклон.» 8.331 · «Потом удар.» 6.006
  ru: { wide: 8.36, narrow: 6.04 },
  // "First the bow." 6.389 · "Then the strike." 7.343 — here the second line is the longer
  en: { wide: 7.38, narrow: 7.38 },
};

export const about = {
  eyebrow: { ru: "Глава вторая\u00A0· Имя и\u00A0путь", en: "Chapter two\u00A0· The name and the way" },

  /* ---- 01 · the name ---------------------------------------------- */
  label1: { ru: "01\u00A0· Наше имя", en: "01\u00A0· Our name" },
  word1: { ru: "Азума", en: "Azuma" },
  dash: { ru: "—", en: "—" },
  meaning1: { ru: "восток.", en: "east." },
  body1: {
    ru: "СК\u00A0«Азума»\u00A0— секция киокушинкай каратэ в\u00A0Нальчике. Вечером мы работаем в\u00A0зале, по\u00A0выходным\u00A0— в\u00A0парке, лицом к\u00A0восходу.",
    en: "SK\u00A0Azuma is a Kyokushin karate club in Nalchik. We train in the hall in the evenings and in the park at weekends, facing the sunrise.",
  },

  /* ---- the figure: 東 taken apart --------------------------------- */
  figNumber: { ru: "Фиг.\u00A002", en: "Fig.\u00A002" },
  figEquation: { ru: "Дерево\u00A0+ солнце\u00A0= восток", en: "Tree\u00A0+ sun\u00A0= east" },
  figTree: { ru: "Дерево", en: "Tree" },
  figSun: { ru: "Солнце", en: "Sun" },
  figNote: {
    ru: "«Азума» по-японски\u00A0— восток: солнце, поднявшееся в\u00A0ветви дерева.",
    en: "“Azuma” is Japanese for east: the sun risen into the branches of a tree.",
  },
  figRefusal: {
    ru: "Больше в\u00A0имени ничего не\u00A0зашифровано.",
    en: "Nothing further is encrypted in it.",
  },

  /* ---- 02 · the way ----------------------------------------------- */
  label2: { ru: "02\u00A0· Наш путь", en: "02\u00A0· Our way" },
  word2: { ru: "Киокуши́н", en: "Kyokushin" },
  meaning2: { ru: "предельная истина.", en: "the ultimate truth." },
  body2: {
    ru: "Киокушинкай\u00A0— полноконтактное каратэ. Очков за\u00A0касание здесь нет: техника проверяется на\u00A0прочность, характер\u00A0— на\u00A0выдержку. До\u00A0восьми лет спаррингов нет вообще; дальше\u00A0— только в\u00A0шлемах и\u00A0накладках и\u00A0только когда ребёнок готов.",
    en: "Kyokushin is full-contact karate. There are no points for touching: technique is tested for strength and character for composure. Under eight there is no sparring at all; after that, only in headgear and pads, and only once the child is ready.",
  },
  romaji: "kyokushin",

  /* ---- the ledger: a printed reference table with dot leaders ------ */
  ledger: [
    { k: { ru: "Стиль", en: "Style" }, v: { ru: "киокушинкай, полный контакт", en: "Kyokushin, full contact" } },
    { k: { ru: "Основан", en: "Founded" }, v: { ru: "1964,\u00A0Токио", en: "1964,\u00A0Tokyo" } },
    { k: { ru: "Основатель", en: "Founder" }, v: { ru: "Масутацу Ояма", en: "Masutatsu Oyama" } },
    { k: { ru: "Приветствие", en: "Greeting" }, v: { ru: "Осу!", en: "Osu!" } },
  ],

  /* ---- the promise: the chapter's monument and its one red mark ---- */
  promise1: { ru: "Мы не\u00A0учим драться.", en: "We don’t teach fighting." },
  /**
   * `promiseLead` + `promiseMark` compose promise line two; the brush rules the
   * mark. The trailing space on `promiseLead` is an ordinary breaking space on
   * purpose — it is the seam the two spans meet at, and binding it would glue
   * the whole promise into one unbreakable run.
   */
  promiseLead: { ru: "Мы учим ", en: "We teach how to " },
  promiseMark: { ru: "держать удар", en: "take a hit" },
  promiseTail: { ru: ".", en: "." },

  /* ---- the chapter's one photograph -------------------------------- */
  plateNumber: { ru: "Илл.\u00A002", en: "Plate\u00A002" },
  plate: {
    ru: "Илл.\u00A002\u00A0— учебный бой в\u00A0шлемах.",
    en: "Plate\u00A002\u00A0— a supervised bout in headgear.",
  },

  /* ---- colophon ---------------------------------------------------- */
  onGroups: { ru: "Группы", en: "Groups" },
  onSensei: { ru: "Тренер", en: "Coach" },
};

export const programs = {
  eyebrow: { ru: "Глава третья\u00A0· Группы", en: "Chapter three\u00A0· Groups" },
  title1: { ru: "С", en: "From" },
  titleNumber: "4",
  title2: { ru: "лет", en: "years old" },
  lead: {
    ru: "Четыре группы по\u00A0возрасту и\u00A0одна общая\u00A0— по\u00A0утрам в\u00A0парке. Ниже вся школа на\u00A0одной шкале: от\u00A0четырёх лет и\u00A0дальше.",
    en: "Four age groups and one shared group\u00A0— mornings in the park. Below, the whole school on one scale: from four years old, and onward.",
  },
  /** The club's actual offer. Set on its own ruled line, not buried in the lead. */
  trial: { ru: "Первая тренировка в\u00A0любой группе\u00A0— пробная.", en: "The first session in any group is a trial." },
  /** Labels for the age chart — the chapter's figure. */
  chart: {
    caption: { ru: "Фиг.\u00A003\u00A0· Возраст и\u00A0группы", en: "Fig.\u00A003\u00A0· Ages and groups" },
    axis: { ru: "Лет", en: "Yrs" },
    /** Units for the computed readout, so it cannot drift from `schedule.ts`. */
    groupsOne: { ru: "группа", en: "group" },
    groupsFew: { ru: "группы", en: "groups" },
    groupsMany: { ru: "групп", en: "groups" },
    /**
     * Read to assistive technology in place of the drawn figure. It explains
     * the FORM of the chart only — every group's name, age band and times are
     * set as real text inside the figure, so naming them here too would both
     * repeat them and drift the day the club edits `schedule.ts`.
     *
     * It is never typeset, so it carries no bound spaces: there is no line for
     * a reader to break, and a screen reader gains nothing from U+\u00A0.
     */
    description: {
      ru: "Схема: возрастная шкала, на которой каждая группа занимает свой отрезок — без пропусков и наложений, от младшей группы и до открытого верхнего возраста. Утренние занятия в парке идут рядом со всеми группами и своего возраста не имеют. Группы, их возраст и время перечислены ниже.",
      en: "A chart: an age scale on which each group occupies its own stretch — no gaps, no overlaps, from the youngest group up to an open-ended top age. The park mornings run alongside every group and have no age of their own. The groups, their ages and times are listed below.",
    },
  },
  plateCaption: { ru: "Илл.\u00A003\u00A0— место утренних занятий.", en: "Plate\u00A003\u00A0— where the mornings are held." },
  more: { ru: "В\u00A0расписание", en: "See the schedule" },
  telegram: { ru: "Написать в\u00A0Telegram", en: "Message on Telegram" },
  /*
    Set as a mono label, so it is held to the three words a mono label may
    carry. It was «Что взять на первую тренировку» — five words of tracked
    uppercase Cyrillic, which is a sentence wearing a label's clothes. The
    first session it named is stated on the ruled line directly above it
    (`trial`), so the label does not have to repeat it.
  */
  checklistTitle: { ru: "Что взять с\u00A0собой", en: "What to bring" },
  checklist: [
    { ru: "Спортивную форму: футболку и\u00A0штаны без молний", en: "Sportswear: a T-shirt and trousers without zips" },
    { ru: "Сменную обувь до\u00A0зала\u00A0— на\u00A0татами занимаются босиком", en: "Indoor shoes for the corridor\u00A0— the tatami is trained barefoot" },
    { ru: "Бутылку воды", en: "A bottle of water" },
    { ru: "Хорошее настроение. Кимоно понадобится позже", en: "A good mood. The gi comes later" },
  ],
};

export const sensei = {
  eyebrow: { ru: "Глава четвёртая\u00A0· Тренер", en: "Chapter four\u00A0· The coach" },
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
  bio: {
    ru: "Основатель и\u00A0главный тренер SK\u00A0AZUMA. Призёр чемпионатов и\u00A0первенств России по\u00A0киокушин; лучший спортсмен сезона 2025/26 по\u00A0версии клуба. Ведёт детские и\u00A0взрослую группы сам\u00A0— от\u00A0первого поклона до\u00A0чёрного пояса.",
    en: "Founder and head coach of SK\u00A0AZUMA. Medallist of Russian Kyokushin championships; the club's athlete of the 2025/26 season. He coaches the children's and adult groups himself\u00A0— from the first bow to the black belt.",
  },
  quote: { ru: "Ребёнок приходит за\u00A0поясом. Остаётся\u00A0— за\u00A0характером.", en: "A child comes for the belt. They stay for the character." },
  signature: { ru: "Осу! А.\u00A0Жамбеев", en: "Osu! A.\u00A0Zhambeev" },
  /** The portrait carried no caption at all, so the plate count skipped 04. */
  plateCaption: { ru: "Илл.\u00A004\u00A0— А.\u00A0Жамбеев, портрет.", en: "Plate\u00A004\u00A0— A.\u00A0Zhambeev, portrait." },
  second: {
    label: { ru: "Второй тренер", en: "Second coach" },
    /** PENDING — the club has not given this name. It printed as «Имя Фамилия». */
    name: pendingText({ ru: "имя уточняется у\u00A0клуба", en: "name to be confirmed with the club" }),
    role: { ru: "Тренер младших групп, 1\u00A0дан", en: "Junior groups coach, 1st\u00A0dan" },
  },
  hoverHint: { ru: "Наведите\u00A0— увидите его таким, каким видят ученики", en: "Hover to see him as his students do" },
};

export const results = {
  eyebrow: { ru: "Глава пятая\u00A0· Хроника", en: "Chapter five\u00A0· Chronicle" },
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

export const morning = {
  eyebrow: { ru: "Глава шестая\u00A0· Утро", en: "Chapter six\u00A0· Morning" },
  title: { ru: "Два адреса. Один путь.", en: "Two addresses. One path." },
  body: {
    ru: "Вечером\u00A0— зал на\u00A0Кирова,\u00A0157. По\u00A0выходным в\u00A0восемь утра\u00A0— парк: бег, камни, работа в\u00A0парах на\u00A0траве. Так тренировался Ояма, так тренируемся мы.",
    en: "Evenings\u00A0— the hall at Kirova\u00A0157. Weekends at eight in the morning\u00A0— the park: running, stones, partner work on the grass. That is how Oyama trained, and how we train.",
  },
  /*
    The chapter is called «Два адреса»; before this it named only one of them
    in running prose. The two are now set as facing register blocks, from the
    facts the site already holds — the hall from `club.address`, the morning
    time from the timetable. Nothing here is invented: the meeting point is
    still the one thing the club publishes per week, in Telegram.
  */
  places: [
    {
      kicker: { ru: "Вечером", en: "Evenings" },
      where: { ru: "Зал", en: "The hall" },
      note: { ru: "Кихон, ката, кумитэ в\u00A0защите. Все группы по\u00A0расписанию.", en: "Kihon, kata, kumite in protective gear. Every group, by the timetable." },
      linkLabel: { ru: "Построить маршрут", en: "Get directions" },
    },
    {
      kicker: { ru: "По\u00A0выходным", en: "Weekends" },
      where: { ru: "Парк", en: "The park" },
      when: { ru: "Сб, Вс\u00A0· 08:00", en: "Sat, Sun\u00A0· 08:00" },
      note: { ru: "Бег, камни, работа в\u00A0парах на\u00A0траве. Точку сбора публикуем каждую неделю.", en: "Running, stones, partner work on the grass. The meeting point is posted every week." },
      linkLabel: { ru: "Написать в\u00A0Telegram", en: "Message us on Telegram" },
    },
  ],
  /* The break is set beside the copy, not computed by counting words — the old
     `split(" ").slice(0, 2)` only worked while both languages had four. */
  titleLines: {
    ru: ["Два адреса.", "Один путь."],
    en: ["Two addresses.", "One path."],
  },
  sunriseLabel: { ru: "Восход сегодня", en: "Sunrise today" },
  plateCaption: { ru: "Илл.\u00A006\u00A0— парк, восемь утра.", en: "Plate\u00A006\u00A0— the park, eight in the morning." },
  /*
    The chapter prints two photographs and both read `plateCaption`, so «Илл.
    06» was stamped on the silhouette at the head of the chapter AND on the
    autumn alley a thousand pixels below it. The second plate gets its own
    number and a caption that says only what the photograph shows.
  */
  plateCaptionAlley: { ru: "Илл.\u00A007\u00A0— аллея в\u00A0парке, осень.", en: "Plate\u00A007\u00A0— an alley in the park, autumn." },
};

export const reviews = {
  eyebrow: { ru: "Глава седьмая\u00A0· Слова родителей", en: "Chapter seven\u00A0· Parents' words" },
  title: { ru: "Что говорят дома", en: "What they say at home" },
  /**
   * PLACEHOLDER reviews — written by us, not by parents. They must be replaced
   * with real quotes and written consent before launch: a testimonial is the
   * one kind of copy a studio cannot draft on the client's behalf.
   */
  items: [
    {
      quote: { ru: "Сын пришёл в\u00A0четыре года и\u00A0первые два месяца просто смотрел. Тренер не\u00A0торопил. Сейчас сам напоминает про тренировку.", en: "My son came at four and just watched for the first two months. The coach didn't rush him. Now he reminds me about class himself." },
      who: { ru: "мама Тамерлана, 6\u00A0лет", en: "Tamerlan's mother, age\u00A06" },
      group: { ru: "группа «Первый шаг»", en: "First Step group" },
    },
    {
      quote: { ru: "Я\u00A0пришёл во\u00A0взрослую группу в\u00A0тридцать четыре, без опыта. Через год\u00A0— синий пояс и\u00A0колени, которые перестали болеть.", en: "I joined the adult group at thirty-four with no experience. A year later\u00A0— a blue belt and knees that stopped hurting." },
      who: { ru: "Заур, 35\u00A0лет", en: "Zaur, 35" },
      group: { ru: "группа «Взрослые»", en: "Adults group" },
    },
    {
      quote: { ru: "Дочь боялась спаррингов. Здесь их вводят медленно и\u00A0только в\u00A0защите\u00A0— теперь она ждёт их больше всего.", en: "My daughter was afraid of sparring. Here it is introduced slowly and only with protection\u00A0— now it is what she looks forward to most." },
      who: { ru: "мама Дианы, 9\u00A0лет", en: "Diana's mother, age\u00A09" },
      group: { ru: "группа «Дети»", en: "Kids group" },
    },
  ],
  prev: { ru: "Предыдущий отзыв", en: "Previous review" },
  next: { ru: "Следующий отзыв", en: "Next review" },
};

export const schedule = {
  eyebrow: { ru: "Глава восьмая\u00A0· Расписание", en: "Chapter eight\u00A0· Schedule" },
  title: { ru: "Неделя", en: "The week" },
  lead: { ru: "Зал на\u00A0Кирова,\u00A0157. Пробная тренировка\u00A0— в\u00A0любой день вашей группы.", en: "The hall at Kirova\u00A0157. A trial session on any day of your group." },
  route: { ru: "Построить маршрут", en: "Get directions" },
  telegram: { ru: "Написать в\u00A0Telegram", en: "Message on Telegram" },
  note: { ru: "Расписание\u00A0— предварительное и\u00A0уточняется у\u00A0тренера.", en: "The timetable is provisional and confirmed with the coach." },
};

export const faq = {
  eyebrow: { ru: "Глава девятая\u00A0· Вопросы родителей", en: "Chapter nine\u00A0· Parents' questions" },
  title: { ru: "Что нужно, чтобы начать?", en: "What does it take to start?" },
  items: [
    {
      q: { ru: "С\u00A0какого возраста можно начать?", en: "From what age can a child start?" },
      a: { ru: "С\u00A0четырёх лет. Младшая группа «Первый шаг»\u00A0— это игра, координация и\u00A0первые команды на\u00A0японском. Взрослые\u00A0— с\u00A0любого возраста и\u00A0с\u00A0любым уровнем.", en: "From four. The youngest group, First Step, is play, coordination and the first commands in Japanese. Adults start at any age and any level." },
    },
    {
      q: { ru: "Что взять на\u00A0первую тренировку?", en: "What should we bring to the first session?" },
      a: { ru: "Футболку и\u00A0спортивные штаны без молний, воду и\u00A0сменную обувь до\u00A0зала. Кимоно покупается позже, когда становится понятно, что ребёнок остаётся.", en: "A T-shirt and sports trousers without zips, water and indoor shoes for the corridor. The gi is bought later, once it is clear the child is staying." },
    },
    {
      q: { ru: "Это безопасно?", en: "Is it safe?" },
      a: { ru: "Да. До\u00A0восьми лет спаррингов нет вообще. Дальше\u00A0— только в\u00A0шлемах, накладках и\u00A0под контролем тренера. На\u00A0татами выходят только тогда, когда готовы.", en: "Yes. Under eight there is no sparring at all. After that\u00A0— only in headgear and pads, under the coach's supervision. Nobody steps onto the tatami before they are ready." },
    },
    {
      q: { ru: "Сколько стоит?", en: "How much does it cost?" },
      /** PLACEHOLDER pricing — the answer states honestly that the coach sets it. */
      a: { ru: "Первая тренировка\u00A0— пробная. Абонемент на\u00A0месяц\u00A0— уточняйте у\u00A0тренера: цена зависит от\u00A0группы и\u00A0количества занятий в\u00A0неделю.", en: "The first session is a trial. Monthly membership\u00A0— ask the coach: the price depends on the group and the number of sessions per week." },
    },
    {
      q: { ru: "Соревнования обязательны?", en: "Are competitions mandatory?" },
      a: { ru: "Нет. Но большинство детей через год-два сами просятся на\u00A0первый турнир\u00A0— и\u00A0мы готовим к\u00A0нему отдельно.", en: "No. But most children ask for their first tournament within a year or two\u00A0— and we prepare them for it separately." },
    },
    {
      q: { ru: "Нужна ли медицинская справка?", en: "Is a medical certificate needed?" },
      a: { ru: "Да, справка от\u00A0педиатра или терапевта об\u00A0отсутствии противопоказаний\u00A0— до\u00A0первой полноценной тренировки.", en: "Yes, a certificate from a paediatrician or GP confirming no contraindications\u00A0— before the first full session." },
    },
    {
      q: { ru: "Есть ли группа для\u00A0взрослых?", en: "Is there an adult group?" },
      a: { ru: "Да. Вечерняя группа для\u00A0взрослых\u00A0— с\u00A0нуля или с\u00A0опытом, четыре раза в\u00A0неделю.", en: "Yes. An evening adult group\u00A0— beginners or experienced, four times a week." },
    },
  ],
};

export const join = {
  eyebrow: { ru: "Глава десятая\u00A0· Запись", en: "Chapter ten\u00A0· Join" },
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
