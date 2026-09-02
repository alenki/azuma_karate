import type { Locale } from "@/i18n/config";

/**
 * Home page copy — «Первая черта» / "The First Stroke".
 * Russian is the source language; English follows it line by line.
 * Facts marked PLACEHOLDER must be confirmed with the club before launch.
 */

type L<T> = Record<Locale, T>;

export const chapters: { id: string; index: number; title: L<string> }[] = [
  { id: "hero", index: 1, title: { ru: "Первая черта", en: "The first stroke" } },
  { id: "kyokushin", index: 2, title: { ru: "Киокушин", en: "Kyokushin" } },
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
  eyebrow: { ru: "СК Азума · Киокушинкай каратэ · Нальчик", en: "SK Azuma · Kyokushin karate · Nalchik" },
  line1: { ru: "Сначала поклон.", en: "First the bow." },
  line2: { ru: "Потом удар.", en: "Then the strike." },
  aside: { ru: "с четырёх лет", en: "from age four" },
  lead: {
    ru: "Секция киокушинкай каратэ для детей и взрослых. Дисциплина, характер и настоящая физическая подготовка — на улице Кирова и по утрам в парке.",
    en: "A Kyokushin karate club for children and adults. Discipline, character and real physical training — on Kirova street and in the park at dawn.",
  },
  ctaPrimary: { ru: "Записаться на первую тренировку", en: "Book a first session" },
  ctaSecondary: { ru: "Расписание", en: "Schedule" },
  ctaTelegram: { ru: "или напишите в Telegram", en: "or message us on Telegram" },
  plateCaption: { ru: "Илл. 01 — поклон перед выходом на татами.", en: "Plate 01 — the bow before stepping onto the tatami." },
  scroll: { ru: "Листайте", en: "Scroll" },
} satisfies Record<string, L<string>>;

export const kyokushin = {
  eyebrow: { ru: "Глава вторая · Что такое киокушин", en: "Chapter two · What Kyokushin is" },
  word: { ru: "Киокуши́н", en: "Kyokushin" },
  dash: { ru: "—", en: "—" },
  meaning: { ru: "предельная истина", en: "the ultimate truth" },
  couplet1: { ru: "Мы не учим драться.", en: "We don't teach fighting." },
  couplet2: { ru: "Мы учим держать удар.", en: "We teach how to take a hit." },
  body: {
    ru: "Киокушинкай — полноконтактное каратэ, созданное Масутацу Оямой. Здесь нет очков за касание: техника проверяется на прочность, а характер — на выдержку. Ребёнок учится вставать после падения, взрослый — доводить дело до конца. Всё остальное — гибкость, сила, скорость — приходит само, тренировка за тренировкой.",
    en: "Kyokushin is full-contact karate founded by Masutatsu Oyama. There are no points for touching: technique is tested for strength and character for composure. A child learns to get up after a fall; an adult learns to finish what they started. Everything else — flexibility, strength, speed — follows, class after class.",
  },
  facts: [
    { k: { ru: "Основано", en: "Founded" }, v: { ru: "1964, Токио", en: "1964, Tokyo" } },
    { k: { ru: "Стиль", en: "Style" }, v: { ru: "полный контакт", en: "full contact" } },
    { k: { ru: "Приветствие", en: "Greeting" }, v: { ru: "Осу!", en: "Osu!" } },
    { k: { ru: "Символ", en: "Symbol" }, v: { ru: "極真 — «предельная истина»", en: "極真 — “the ultimate truth”" } },
  ],
};

export const programs = {
  eyebrow: { ru: "Глава третья · Группы", en: "Chapter three · Groups" },
  title1: { ru: "С", en: "From" },
  titleNumber: "4",
  title2: { ru: "лет", en: "years old" },
  lead: {
    ru: "Четыре группы по возрасту и одна общая — по утрам в парке. Первая тренировка в любой группе — пробная.",
    en: "Four age groups and one shared group — mornings in the park. The first session in any group is a trial.",
  },
  rowLabels: { age: { ru: "Возраст", en: "Age" }, what: { ru: "Что происходит", en: "What happens" }, when: { ru: "Когда", en: "When" } },
  more: { ru: "В расписание", en: "See the schedule" },
  checklistTitle: { ru: "Что взять на первую тренировку", en: "What to bring to the first session" },
  checklist: [
    { ru: "Спортивную форму: футболку и штаны без молний", en: "Sportswear: a T-shirt and trousers without zips" },
    { ru: "Сменную обувь до зала — на татами занимаются босиком", en: "Indoor shoes for the corridor — the tatami is trained barefoot" },
    { ru: "Бутылку воды", en: "A bottle of water" },
    { ru: "Хорошее настроение. Кимоно понадобится позже", en: "A good mood. The gi comes later" },
  ],
};

export const sensei = {
  eyebrow: { ru: "Глава четвёртая · Тренер", en: "Chapter four · The coach" },
  name: { ru: "Астемир Жамбеев", en: "Astemir Zhambeev" },
  rank: { ru: "Мастер спорта международного класса", en: "Master of Sport, International Class" },
  /** PLACEHOLDER — confirm the decree reference with the club. */
  decree: { ru: "Звание присвоено приказом Минспорта России (номер и дата — уточняются).", en: "Title conferred by order of the Russian Ministry of Sport (number and date to be confirmed)." },
  bio: {
    ru: "Основатель и главный тренер SK AZUMA. Призёр чемпионатов и первенств России по киокушин; лучший спортсмен сезона 2025/26 по версии клуба. Ведёт детские и взрослую группы сам — от первого поклона до чёрного пояса.",
    en: "Founder and head coach of SK AZUMA. Medallist of Russian Kyokushin championships; the club's athlete of the 2025/26 season. He coaches the children's and adult groups himself — from the first bow to the black belt.",
  },
  quote: { ru: "Ребёнок приходит за поясом. Остаётся — за характером.", en: "A child comes for the belt. They stay for the character." },
  signature: { ru: "Осу! А. Жамбеев", en: "Osu! A. Zhambeev" },
  second: {
    label: { ru: "Второй тренер", en: "Second coach" },
    /** PLACEHOLDER name. */
    name: { ru: "Имя Фамилия", en: "First Last" },
    role: { ru: "Тренер младших групп, 1 дан", en: "Junior groups coach, 1st dan" },
  },
  hoverHint: { ru: "Наведите — увидите его таким, каким видят ученики", en: "Hover to see him as his students do" },
};

export const results = {
  eyebrow: { ru: "Глава пятая · Хроника", en: "Chapter five · Chronicle" },
  title: { ru: "Сезон 2025/26", en: "Season 2025/26" },
  lead: { ru: "Медали считаем так, как считают в додзё: по пять черт.", en: "We count medals the dojo way: five strokes at a time." },
  /** PLACEHOLDER numbers. */
  tallies: [
    { label: { ru: "Медали сезона", en: "Season medals" }, value: 23 },
    { label: { ru: "Аттестаций сдано", en: "Gradings passed" }, value: 41 },
    { label: { ru: "Турниров", en: "Tournaments" }, value: 7 },
  ],
  timeline: [
    { date: { ru: "Март 2026", en: "March 2026" }, title: { ru: "Первенство России по киокушин", en: "Russian Kyokushin Youth Championship" }, note: { ru: "золото и бронза, Москва", en: "gold and bronze, Moscow" } },
    { date: { ru: "Февраль 2026", en: "February 2026" }, title: { ru: "Чемпионат России по киокушин", en: "Russian Kyokushin Championship" }, note: { ru: "выход в финал", en: "reached the final" } },
    { date: { ru: "Декабрь 2025", en: "December 2025" }, title: { ru: "Первенство КБР", en: "Kabardino-Balkaria Youth Championship" }, note: { ru: "12 призовых мест", en: "12 podium places" } },
    { date: { ru: "Октябрь 2025", en: "October 2025" }, title: { ru: "Аттестация на пояса", en: "Belt grading" }, note: { ru: "41 ученик, первые оранжевые пояса", en: "41 students, first orange belts" } },
  ],
  best: { ru: "Лучший спортсмен года · сезон 2025–2026", en: "Athlete of the year · season 2025–2026" },
  plateCaption: { ru: "Илл. 05 — кубки перед награждением.", en: "Plate 05 — trophies before the awards." },
};

export const morning = {
  eyebrow: { ru: "Глава шестая · Утро", en: "Chapter six · Morning" },
  title: { ru: "Два адреса. Один путь.", en: "Two addresses. One path." },
  body: {
    ru: "Вечером — зал на Кирова, 157. По выходным в восемь утра — парк: бег, камни, работа в парах на траве. Так тренировался Ояма, так тренируемся мы.",
    en: "Evenings — the hall at Kirova 157. Weekends at eight in the morning — the park: running, stones, partner work on the grass. That is how Oyama trained, and how we train.",
  },
  meta: { ru: "Утренние · Сб, Вс · 08:00 · Точку сбора публикуем в Telegram", en: "Mornings · Sat, Sun · 08:00 · Meeting point posted on Telegram" },
  sunriseLabel: { ru: "Восход сегодня", en: "Sunrise today" },
  plateCaption: { ru: "Илл. 06 — парк, восемь утра.", en: "Plate 06 — the park, eight in the morning." },
};

export const reviews = {
  eyebrow: { ru: "Глава седьмая · Слова родителей", en: "Chapter seven · Parents' words" },
  title: { ru: "Что говорят дома", en: "What they say at home" },
  /** PLACEHOLDER reviews — replace with real quotes and written consent. */
  items: [
    {
      quote: { ru: "Сын пришёл в четыре года и первые два месяца просто смотрел. Тренер не торопил. Сейчас сам напоминает про тренировку.", en: "My son came at four and just watched for the first two months. The coach didn't rush him. Now he reminds me about class himself." },
      who: { ru: "мама Тамерлана, 6 лет", en: "Tamerlan's mother, age 6" },
      group: { ru: "группа «Первый шаг»", en: "First Step group" },
    },
    {
      quote: { ru: "Я пришёл во взрослую группу в тридцать четыре, без опыта. Через год — синий пояс и колени, которые перестали болеть.", en: "I joined the adult group at thirty-four with no experience. A year later — a blue belt and knees that stopped hurting." },
      who: { ru: "Заур, 35 лет", en: "Zaur, 35" },
      group: { ru: "группа «Взрослые»", en: "Adults group" },
    },
    {
      quote: { ru: "Дочь боялась спаррингов. Здесь их вводят медленно и только в защите — теперь она ждёт их больше всего.", en: "My daughter was afraid of sparring. Here it is introduced slowly and only with protection — now it is what she looks forward to most." },
      who: { ru: "мама Дианы, 9 лет", en: "Diana's mother, age 9" },
      group: { ru: "группа «Дети»", en: "Kids group" },
    },
  ],
  prev: { ru: "Предыдущий отзыв", en: "Previous review" },
  next: { ru: "Следующий отзыв", en: "Next review" },
};

export const schedule = {
  eyebrow: { ru: "Глава восьмая · Расписание", en: "Chapter eight · Schedule" },
  title: { ru: "Неделя", en: "The week" },
  lead: { ru: "Зал на Кирова, 157. Пробная тренировка — в любой день вашей группы.", en: "The hall at Kirova 157. A trial session on any day of your group." },
  route: { ru: "Построить маршрут", en: "Get directions" },
  telegram: { ru: "Написать в Telegram", en: "Message on Telegram" },
  note: { ru: "Расписание — предварительное и уточняется у тренера.", en: "The timetable is provisional and confirmed with the coach." },
};

export const faq = {
  eyebrow: { ru: "Глава девятая · Вопросы родителей", en: "Chapter nine · Parents' questions" },
  title: { ru: "Что нужно, чтобы начать?", en: "What does it take to start?" },
  items: [
    {
      q: { ru: "С какого возраста можно начать?", en: "From what age can a child start?" },
      a: { ru: "С четырёх лет. Младшая группа «Первый шаг» — это игра, координация и первые команды на японском. Взрослые — с любого возраста и с любым уровнем.", en: "From four. The youngest group, First Step, is play, coordination and the first commands in Japanese. Adults start at any age and any level." },
    },
    {
      q: { ru: "Что взять на первую тренировку?", en: "What should we bring to the first session?" },
      a: { ru: "Футболку и спортивные штаны без молний, воду и сменную обувь до зала. Кимоно покупается позже, когда становится понятно, что ребёнок остаётся.", en: "A T-shirt and sports trousers without zips, water and indoor shoes for the corridor. The gi is bought later, once it is clear the child is staying." },
    },
    {
      q: { ru: "Это безопасно?", en: "Is it safe?" },
      a: { ru: "Да. До восьми лет спаррингов нет вообще. Дальше — только в шлемах, накладках и под контролем тренера. На татами выходят только тогда, когда готовы.", en: "Yes. Under eight there is no sparring at all. After that — only in headgear and pads, under the coach's supervision. Nobody steps onto the tatami before they are ready." },
    },
    {
      q: { ru: "Сколько стоит?", en: "How much does it cost?" },
      /** PLACEHOLDER pricing. */
      a: { ru: "Первая тренировка — пробная. Абонемент на месяц — уточняйте у тренера: цена зависит от группы и количества занятий в неделю.", en: "The first session is a trial. Monthly membership — ask the coach: the price depends on the group and the number of sessions per week." },
    },
    {
      q: { ru: "Соревнования обязательны?", en: "Are competitions mandatory?" },
      a: { ru: "Нет. Но большинство детей через год-два сами просятся на первый турнир — и мы готовим к нему отдельно.", en: "No. But most children ask for their first tournament within a year or two — and we prepare them for it separately." },
    },
    {
      q: { ru: "Нужна ли медицинская справка?", en: "Is a medical certificate needed?" },
      a: { ru: "Да, справка от педиатра или терапевта об отсутствии противопоказаний — до первой полноценной тренировки.", en: "Yes, a certificate from a paediatrician or GP confirming no contraindications — before the first full session." },
    },
    {
      q: { ru: "Есть ли группа для взрослых?", en: "Is there an adult group?" },
      a: { ru: "Да. Вечерняя группа для взрослых — с нуля или с опытом, четыре раза в неделю.", en: "Yes. An evening adult group — beginners or experienced, four times a week." },
    },
  ],
};

export const join = {
  eyebrow: { ru: "Глава десятая · Запись", en: "Chapter ten · Join" },
  title: { ru: "Первая тренировка", en: "The first session" },
  lead: { ru: "Оставьте имя и возраст ученика — мы ответим в Telegram в течение дня и подберём группу.", en: "Leave the student's name and age — we will reply on Telegram within the day and suggest a group." },
  fields: {
    name: { ru: "Имя ученика", en: "Student's name" },
    age: { ru: "Возраст ученика", en: "Student's age" },
    contact: { ru: "Телефон или Telegram", en: "Phone or Telegram" },
    note: { ru: "Комментарий (необязательно)", en: "Comment (optional)" },
  },
  placeholders: {
    name: { ru: "Тамерлан", en: "Tamerlan" },
    age: { ru: "6", en: "6" },
    contact: { ru: "+7 900 000-00-00 или @username", en: "+7 900 000-00-00 or @username" },
  },
  submit: { ru: "Записаться", en: "Sign up" },
  sending: { ru: "Отправляем…", en: "Sending…" },
  success: { ru: "Осу! Мы получили заявку и напишем вам сегодня.", en: "Osu! We have your request and will message you today." },
  error: { ru: "Не отправилось. Напишите нам в Telegram — ответим сразу.", en: "It did not send. Message us on Telegram — we reply right away." },
  privacy: { ru: "Нажимая «Записаться», вы соглашаетесь на обработку персональных данных.", en: "By pressing “Sign up” you agree to the processing of personal data." },
  alt: { ru: "или напишите в Telegram", en: "or message us on Telegram" },
  trust: { ru: "Ответим в Telegram в течение дня.", en: "We reply on Telegram within the day." },
  errors: {
    name: { ru: "Напишите имя", en: "Please enter a name" },
    age: { ru: "Укажите возраст от 4 до 99", en: "Enter an age from 4 to 99" },
    contact: { ru: "Оставьте телефон или Telegram", en: "Leave a phone number or Telegram" },
  },
};
