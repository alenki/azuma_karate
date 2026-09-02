import type { Locale } from "@/i18n/config";

/**
 * Media manifest
 * --------------
 * Every photo on the site is referenced by a named slot, so the client's real
 * photography can replace the Wikimedia Commons placeholders by editing this
 * file only. Credits for the placeholders live in
 * `public/media/placeholders/CREDITS.md`. All entries below are placeholders.
 */
export type MediaSlot = {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
  /** Focal point for object-position, e.g. "50% 30%". */
  focus?: string;
  placeholder: boolean;
};

const P = "/media/placeholders";

function ph(file: string, width: number, height: number, alt: Record<Locale, string>, focus?: string): MediaSlot {
  return { src: `${P}/${file}`, width, height, alt, focus, placeholder: true };
}

export const media = {
  /* ---- plates used by the home page (usage-named) ---- */
  heroPlate: ph("kick-pairs-portrait.jpg", 1066, 1600, {
    ru: "Ученик в белом кимоно отрабатывает удар ногой в зале",
    en: "A student in a white gi practises a kick in the dojo",
  }, "50% 30%"),
  coachPortrait: ph("karateka-fist-bw.jpg", 1066, 1600, {
    ru: "Тренер в кимоно, кулак у груди — портрет",
    en: "Coach in a gi with a fist at the chest — portrait",
  }, "50% 20%"),
  seniorSensei: ph("sensei-blue-belt-portrait.jpg", 1067, 1600, {
    ru: "Старший тренер показывает технику руками",
    en: "Senior instructor demonstrating hand technique",
  }, "50% 25%"),
  kidsKumite: ph("kids-kumite-headgear.jpg", 1458, 1600, {
    ru: "Дети в шлемах и защите проводят учебный спарринг",
    en: "Children in headgear and protection during a supervised sparring drill",
  }, "50% 40%"),
  kidsPodium: ph("kids-podium-trophies.jpg", 1600, 1337, {
    ru: "Юные спортсмены с кубками на пьедестале",
    en: "Young athletes with trophies on the podium",
  }),
  trophies: ph("trophies-table.jpg", 1600, 1066, {
    ru: "Кубки и медали на столе перед награждением",
    en: "Trophies and medals on a table before the awards",
  }),
  kumiteKick: ph("mawashi-geri-kumite.jpg", 1600, 1066, {
    ru: "Маваши-гери в кумитэ на татами",
    en: "Mawashi-geri during kumite on the tatami",
  }, "50% 35%"),
  knockdown: ph("knockdown-kumite-kick.jpg", 1200, 1600, {
    ru: "Бой на турнире по киокушин — удар ногой",
    en: "Kyokushin tournament fight — a kick lands",
  }),
  flyingKick: ph("flying-kick-dojo.jpg", 1600, 1066, {
    ru: "Прыжковый удар ногой на тренировке",
    en: "A jumping kick during training",
  }),
  kickWide: ph("kick-dojo-wide.jpg", 1600, 1066, {
    ru: "Отработка ударов ногами в зале",
    en: "Kicking drills in the dojo",
  }),
  kickExchange: ph("kick-exchange.jpg", 1600, 1066, {
    ru: "Обмен ударами в учебном бою",
    en: "Exchange of kicks in a training bout",
  }),
  stretching: ph("stretching-class-overhead.jpg", 1600, 1066, {
    ru: "Растяжка всей группы на татами, вид сверху",
    en: "Whole-class stretching on the tatami, seen from above",
  }),
  dojoSign: ph("kyokushin-dojo-sign.jpg", 1600, 1200, {
    ru: "Вывеска додзё с иероглифами 極真",
    en: "Dojo sign with the 極真 characters",
  }),
  heavyBag: ph("heavy-bag-kick-bw.jpg", 1600, 1066, {
    ru: "Удар по тяжёлому мешку, чёрно-белое фото",
    en: "A kick into a heavy bag, black and white",
  }),
  sunriseKick: ph("kick-sunrise-silhouette.jpg", 1600, 1066, {
    ru: "Силуэт удара ногой на рассвете",
    en: "Silhouette of a kick at sunrise",
  }, "50% 60%"),
  sunriseKick2: ph("kicking-sunrise-silhouette-2.jpg", 1600, 1066, {
    ru: "Утренняя тренировка на рассвете",
    en: "Morning training at sunrise",
  }),
  parkAlley: ph("nalchik-park-autumn-alley.jpg", 1600, 1066, {
    ru: "Аллея в парке Нальчика осенью",
    en: "An alley in Nalchik's park in autumn",
  }),
  parkWillows: ph("nalchik-park-willows-lake.jpg", 1600, 1066, {
    ru: "Ивы у озера в курортном парке Нальчика",
    en: "Willows by the lake in Nalchik's resort park",
  }),
  parkBench: ph("nalchik-park-bench-pines.jpg", 1600, 1066, {
    ru: "Скамейка под соснами в парке Нальчика",
    en: "A bench under the pines in Nalchik's park",
  }),
  roadToElbrus: ph("road-to-elbrus-steppe.jpg", 1600, 1066, {
    ru: "Дорога к Эльбрусу через степь",
    en: "The road to Elbrus across the steppe",
  }, "50% 60%"),
  caucasusPanorama: ph("caucasus-panorama-kbr.jpg", 1600, 1066, {
    ru: "Панорама Кавказских гор, Кабардино-Балкария",
    en: "Panorama of the Caucasus mountains, Kabardino-Balkaria",
  }),
  glacierPeak: ph("glacier-peak-dramatic.jpg", 1600, 1068, {
    ru: "Ледник и вершина в Приэльбрусье",
    en: "Glacier and peak in the Elbrus region",
  }),
  greenValley: ph("green-valley-jila-su.jpg", 1600, 1066, {
    ru: "Зелёная долина Джилы-Су",
    en: "The green Jila-Su valley",
  }),
  mountainHuman: ph("mountain-and-human.jpg", 1066, 1600, {
    ru: "Человек в горной долине",
    en: "A person in a mountain valley",
  }),
  duskGrass1: ph("mountain-dusk-grass-1.jpg", 1600, 1066, {
    ru: "Сумерки в горах, трава на переднем плане",
    en: "Dusk in the mountains, grass in the foreground",
  }),
  duskGrass2: ph("mountain-dusk-grass-2.jpg", 1600, 1066, {
    ru: "Вечер в горах Кабардино-Балкарии",
    en: "Evening in the mountains of Kabardino-Balkaria",
  }),
  duskGrass3: ph("mountain-dusk-grass-3.jpg", 1600, 900, {
    ru: "Ночь на склонах горы",
    en: "Night on a mountain slope",
  }),
  ridgeClimbers: ph("ridge-climbers-bw.jpg", 1600, 1600, {
    ru: "Альпинисты на снежном гребне, чёрно-белое фото",
    en: "Climbers on a snow ridge, black and white",
  }),
  kidsPadsDrill: ph("kids-pads-drill.jpg", 1390, 1600, {
    ru: "Дети отрабатывают удары по лапам",
    en: "Children drilling strikes on pads",
  }),
  kidsSparringGear: ph("kids-sparring-gear.jpg", 1066, 1600, {
    ru: "Дети в защитной экипировке на тренировке",
    en: "Children in protective gear at training",
  }, "50% 30%"),
  kidsYellowBelt: ph("kids-sparring-yellow-belt.jpg", 1600, 1200, {
    ru: "Юные каратисты с жёлтыми поясами в учебном бою",
    en: "Young karateka with yellow belts in a practice bout",
  }),
  maeGeriGym: ph("mae-geri-gym.jpg", 1600, 1472, {
    ru: "Мае-гери в спортивном зале",
    en: "Mae-geri in the gym",
  }),
  maeGeriPortrait: ph("mae-geri-jodan-portrait.jpg", 1066, 1600, {
    ru: "Удар мае-гери дзёдан, вертикальный кадр",
    en: "Mae-geri jodan, portrait frame",
  }, "50% 35%"),
  milkyWay: ph("milky-way-elbrus.jpg", 1066, 1600, {
    ru: "Млечный путь над Эльбрусом",
    en: "The Milky Way over Elbrus",
  }),
  tikhtengen: ph("tikhtengen-peak.jpg", 1600, 1066, {
    ru: "Пик Тихтенген, Чегемское ущелье",
    en: "Tikhtengen peak, Chegem gorge",
  }),
  tournamentHall: ph("tournament-hall-tatami.jpg", 1600, 1200, {
    ru: "Турнирный зал с татами, вид сверху",
    en: "Tournament hall with tatami, seen from above",
  }),
} satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof media;

export function slot(key: MediaKey): MediaSlot {
  return media[key];
}

export const placeholderBase = P;
