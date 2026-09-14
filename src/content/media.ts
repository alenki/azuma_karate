import type { Locale } from "@/i18n/config";

/**
 * Media manifest
 * --------------
 * Every photo on the site is referenced by a named slot, so the client's real
 * photography can replace the Wikimedia Commons placeholders by editing this
 * file only. Credits for the placeholders live in
 * `public/media/placeholders/CREDITS.md`. All entries below are placeholders.
 *
 * `placeholder: true` is the photographic form of the PENDING FACTS convention
 * stated in `home.ts`: the slot is reserved and its shape is known, but what
 * fills it is not the club's yet. A consumer may use it to hold back anything
 * that would assert the photograph is the club's own — a caption naming a
 * person, a place or an event, or a credit line.
 *
 * Alt texts here carry no bound spaces (the BOUND SPACES rule in `home.ts`
 * applies to typeset copy only). Alt text is never set in a box, so it has no
 * line to break, and U+00A0 buys a screen reader nothing.
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

/** The club's own material, under `/media/…` rather than `/media/placeholders/…`.
 *  Same slot, `placeholder: false` — nothing about it has to be held back. */
function own(file: string, width: number, height: number, alt: Record<Locale, string>, focus?: string): MediaSlot {
  return { src: `/media/${file}`, width, height, alt, focus, placeholder: false };
}

/**
 * A MOVING plate.
 *
 * Only chapter 一 has one and probably only chapter 一 ever should: it is the
 * page's first screen and the only place where a photograph being made rather
 * than printed is worth the weight. See `reels.firstScreen` for the whole
 * argument, and `scripts/press-hero-reel.sh` for how the file is cut.
 */
export type ReelSlot = {
  /** Sources in the order a browser should try them — smallest first. */
  sources: { src: string; type: string }[];
  width: number;
  height: number;
  /**
   * The plate printed UNDER it, and the reel's own frame 0. The two are the
   * same image by construction (the press script cuts the still from the same
   * `trim=start=` the video is cut from), so the handover is invisible: the
   * reader sees a photograph that starts moving, never a swap.
   */
  still: MediaKey;
  /** Seconds. Documentation — nothing reads it; the file is the fact. */
  seconds: number;
  placeholder: boolean;
};

export const media = {
  /* ---- plates used by the home page (usage-named) ---- */

  /*
    THE FIRST SCREEN.

    Chapter 一 is one plate at the size of the screen: it is the page's LCP
    element, the chapter's own ground, and the beat the headline is written
    across. It is also the one plate in the book that MOVES — see
    `reels.firstScreen` below, which is this exact frame and takes over from it
    without a seam.

    WHAT IT IS NOW. A black belt, drawn tight over a white gi, a hand on each
    end. Cut from the club's own reel of the all-styles championship in
    Nalchik; `scripts/press-hero-reel.sh` carries the cut and the arithmetic.
    It replaces a 1970 Commons frame of a karateka kicking in a snowfield,
    which was a placeholder and read like one.

    IT MEETS THE SLOT'S OWN BRIEF ALMOST BY ACCIDENT, and the brief is worth
    keeping written down because the next replacement has to meet it too:

      · a ground that is genuinely light and genuinely EVEN. The chapter prints
        on PAPER, so the type is INK and ink needs the plate's local tone at or
        ABOVE L 0.480 to clear 4.5:1 (hero.css states the arithmetic). A dark
        frame cannot be scrimmed into legibility here — it can only be veiled
        until the photograph is a grey field. A gi at this size is nothing but
        even light.
      · ONE subject. At the size of a screen a hall full of them reads as
        texture, which is what ruled out every other shot in the reel.
      · nothing competing in the bottom-left quadrant — that quadrant is
        «Потом удар.». The belt runs through the middle third and leaves both
        the bow's band and the strike's band as bare gi.
      · real tonal separation, because the duotone press throws away every
        trace of colour and a frame that is only legible through its colour
        comes out flat. Black on white is the most a plate can have.
      · no third-party wordmark anywhere in it.

    STORED GRAYSCALE, both cuts. The press discards chroma before it does
    anything else, so the colour planes are weight and nothing else. They are
    NOT pressed on disk: `<Photo grade="duotone">` applies
    `grayscale(1) contrast(1.06) url(#duotone-paper-ink)` in CSS, which is what
    keeps the image half of this plate retunable. The VIDEO half carries the
    same press baked in, for reasons the script explains.
  */
  firstScreen: own("hero/belt-plate.jpg", 1280, 720, {
    ru: "Чёрный пояс, затянутый поверх белого кимоно",
    en: "A black belt pulled tight over a white gi",
  }),
  /*
    The same frame, cut upright at 4:5 for a tall viewport, and on a phone this
    is the WHOLE plate — the reel does not play there (ui/Reel, and the query
    the hero passes it). A sideways 720p source can give 576 x 720 and no more,
    which would be too little almost anywhere else and is enough here: a white
    gi and a black belt have no fine detail for the upscale to lose, and the
    knot survives a 45% punch-in where the frames either side of it — measured,
    `blurdetect` — do not.
  */
  firstScreenTall: own("hero/belt-plate-portrait.jpg", 576, 720, {
    ru: "Чёрный пояс, затянутый поверх белого кимоно",
    en: "A black belt pulled tight over a white gi",
  }),

  /* The hero plate is shown inside the first stroke, so it is cropped to a
     letterbox of roughly 5:1. It needs a dark, high-contrast frame whose action
     survives that band, and no bright highlights along its top edge — the
     headline's second line is knocked out of it there. */
  heroStroke: ph("heavy-bag-kick-bw.jpg", 1600, 1066, {
    ru: "Удар в прыжке по тяжёлому мешку, чёрно-белое фото",
    en: "A jumping kick into a heavy bag, black and white",
  }, "50% 33%"),
  heroPlate: ph("kick-pairs-portrait.jpg", 1066, 1600, {
    ru: "Ученик в белом кимоно отрабатывает удар ногой в зале",
    en: "A student in a white gi practises a kick in the dojo",
  }, "50% 30%"),
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
  /*
    CHAPTER 四 — THE ONE COLOUR PLATE IN THE BOOK.

    Every other plate on this site is pressed through the duotone filters and
    comes out in the page's own two inks. This one is printed in full sRGB,
    because 四 is the one chapter about a person rather than about a practice.
    It is the single exception in the palette and it is spent here.

    WHY THIS FILE AND NOT A PORTRAIT. The slot used to be `coachPortrait` →
    `karateka-fist-bw.jpg`: the right picture (one older man, black belt, a
    coiled kata guard, a quiet ground) and unusable, because that file is a
    TRUE GREYSCALE ORIGINAL — single-channel on Wikimedia Commons too, not a
    local conversion. The chapter's whole point is colour, so a frame with no
    chroma to print could not stay. Of the colour frames on disk this is the
    only one that is anonymous, cleanly lit and free of another federation's
    branding: `sensei-blue-belt-portrait.jpg` carries 極真館 — a DIFFERENT
    organisation from the club's Kyokushinkai — brush-written across the chest,
    between the face and the belt, so no crop removes it.

    WHAT IT COSTS, stated rather than hidden: this is two fighters, not one
    man, and the belts are yellow and blue. In knockdown competition those are
    identification belts worn over rank, so they are not a claim about grade —
    but the chapter names one man and the plate shows two, and that is the gap
    the client's own photograph closes.

    WHAT A REPLACEMENT MUST SATISFY — it needs all five:
      · A. Zhambeev himself, alone in the frame.
      · Upright, 3:4 or taller. The chapter sets it 4:5 below 1024 and 3:4 above.
      · Chest-up or a held technique, with the face readable. This is the only
        plate in the book where a person is looked at rather than watched.
      · STORED IN COLOUR, and worth printing in colour: real skin, a real hall,
        one saturated event. It is the only full-colour image on the site, so a
        flat or fluorescent frame wastes the exception.
      · No third-party federation name or wordmark anywhere legible.
  */
  senseiPlate: ph("knockdown-kumite-kick.jpg", 1200, 1600, {
    ru: "Бой на турнире по киокушин — удар ногой",
    en: "Kyokushin tournament fight — a kick lands",
  }, "50% 20%"),
  flyingKick: ph("flying-kick-dojo.jpg", 1600, 1066, {
    ru: "Прыжковый удар ногой на тренировке",
    en: "A jumping kick during training",
  }),
  /*
    THE HERO'S HORIZON — the plate that runs across the foot of chapter 一,
    to the paper edge on three sides and cut by the fold. It is the page's
    LCP element and the only photograph on the first screen.

    It is cropped very wide (about 5:1 on a laptop, nearer 1.6:1 on a phone)
    and it carries no caption, so it has to work as a GROUND rather than as an
    illustration: a horizon must be populated across its whole width. A single
    figure in a 5:1 band is one small event with a thousand pixels of dead room
    either side — the file's own history records what that looked like, and the
    focal point below holds the standing bodies rather than the floor.

    REPLACING THIS PLACEHOLDER: landscape, at least 3200px wide, a line or rank
    of students mid-technique in the hall, evenly populated left to right with
    no single hero subject and no empty third; shot from standing height so the
    mat fills the ground; the interest held in the frame's upper-middle band,
    because the lower third sits below the fold at first paint; strong tonal
    separation between gi and floor, since the duotone press throws away every
    trace of colour. Kicks or a held stance beat anything static.
  */
  kickWide: ph("kick-dojo-wide.jpg", 1600, 1066, {
    ru: "Отработка ударов ногами в зале",
    en: "Kicking drills in the dojo",
  }, "50% 42%"),
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
  parkPath: ph("forest-path-portrait.jpg", 899, 1600, {
    ru: "Тропинка к реке в парке Нальчика",
    en: "A path down to the river in Nalchik's park",
  }, "50% 45%"),
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
    ru: "Дети в шлемах и защите в учебном бою",
    en: "Children in headgear and body protection during a practice bout",
  }, "50% 35%"),
  /* a 1067x1600 portrait, and — unlike `kidsSparringGear` — not another crop of
     the same frame as `kidsPadsDrill`, so two adjacent bands of chapter 三 no
     longer print the same photograph twice. */
  kidKicksPad: ph("kid-kicks-pad-coach.jpg", 1067, 1600, {
    ru: "Ребёнок отрабатывает удар по лапе, которую держит тренер",
    en: "A child kicking a pad held by the coach",
  }, "50% 35%"),
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

/**
 * THE ONE MOVING PLATE.
 *
 * A belt being drawn tight, 2.34s, once, and then the sheet is a photograph
 * for as long as the reader stays on it. It is deliberately not a loop and
 * deliberately not ambient: hero.css says of this sheet that "nothing on it
 * moves again — no loop, no breathing hairline, no scroll-linked transform, no
 * pointer lean", and a background quietly cycling every four seconds is
 * exactly the thing that sentence forbids. The gesture is also the chapter's
 * own subject. 一 is «Первая черта»; the belt is the first thing tied.
 *
 * THE SOURCE decided most of this. It is a 720 x 1280 phone clip carrying no
 * rotation metadata and ninety degrees of rotation in the pixels, so upright
 * it is 1280 x 720 and that is all the resolution there is. Ninety-one seconds
 * of a championship, of which this is the only shot that is one subject, evenly
 * lit, and free of sponsor boards — and within it, `blurdetect` says only
 * 3.33s to 5.32s is sharp. Everything in `scripts/press-hero-reel.sh` follows
 * from those two measurements.
 *
 * WHO SEES IT. Wide viewports only, and only after hydration — `ui/Reel` holds
 * it back behind `useMediaQuery` so a phone, which is shown `firstScreenTall`
 * instead, never has the element in its markup to preload. Reduced motion gets
 * the still, which is the same frame, so nothing is lost but the movement.
 *
 * THE PRESS IS BAKED IN, unlike every other plate in the book. A full-screen
 * SVG reference filter over 30fps is a per-frame pass on the machines least
 * able to afford one. The script computes what the CSS would have, so the two
 * halves of this plate agree — re-run it if `--color-paper` or `--color-ink`
 * ever move.
 */
export const reels = {
  firstScreen: {
    /* VP9 first: 242 KB against H.264's 445 KB for the same cut, and every
       browser that cannot read it falls through to the mp4 on the next line. */
    sources: [
      { src: "/media/hero/belt-reel.webm", type: "video/webm" },
      { src: "/media/hero/belt-reel.mp4", type: "video/mp4" },
    ],
    width: 1280,
    height: 720,
    still: "firstScreen",
    seconds: 2.34,
    placeholder: false,
  },
} satisfies Record<string, ReelSlot>;

export type ReelKey = keyof typeof reels;
