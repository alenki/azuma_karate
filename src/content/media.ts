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

/**
 * A plate that is PRESSED rather than downloaded: `scripts/press-hero-reel.sh`
 * cuts it out of a source clip and writes it to `/media/hero/`, so it sits
 * outside the Commons pool while being every bit as provisional as the rest of
 * it. `CREDITS.md` carries the source and the licence either way.
 *
 * This replaced `own()`, which marked the club's OWN material — same slot,
 * `placeholder: false`, nothing about it held back. Nothing claims that at the
 * moment: the club's belt footage was chapter 一's plate until this pass, and
 * the chapter needed a dark frame, which ninety-one seconds of a brightly lit
 * sports hall cannot give. Re-add `own()` the day the client's photography
 * lands. It is one line, and it is the point of this file.
 */
function pressed(file: string, width: number, height: number, alt: Record<Locale, string>, focus?: string): MediaSlot {
  return { src: `/media/hero/${file}`, width, height, alt, focus, placeholder: true };
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

    WHAT IT IS NOW. One karateka alone in a black room, in a back stance with
    the arm folded — the frame the strike is thrown from. Cut by
    `scripts/press-hero-reel.sh`, which carries the cut and the arithmetic. It
    replaces the club's own belt-tying frame, which was the right photograph
    for a chapter printed on paper and is the wrong one for a chapter printed
    on ink: a white gi filling the screen is a bright even field, and darkening
    it only makes it a grey one.

    THE BRIEF INVERTED WITH THE GROUND, and that is the whole of this pass. The
    chapter printed on PAPER and the type was INK, so the plate had to be light
    and EVEN — held at or above L 0.480 everywhere the headline fell, so it
    could clear 4.5:1. The chapter prints on INK now and the type is BONE, so
    every term flips, and the next replacement has to meet the new ones:

      · a ground that is genuinely DARK, and dark everywhere the type falls.
        This frame's mean luminance is 0.015 and the field around the figure is
        #000, so bone type stands on it at better than 18:1 with no scrim at
        all. That is what «filters less extreme» actually bought: the three
        measured ramps that used to carry the foot are a bleed now, not a
        crutch.
      · ONE subject, unchanged. At the size of a screen a hall full of them
        reads as texture.
      · the figure OUT of the left 62% of the trim, because that column is
        «Потом удар.». He is padded off centre in the press rather than nudged
        with `object-position` — a 16:9 plate covering a 1512 x 900 sheet has
        88px of horizontal slack in total, which is not enough to move anyone.
      · real tonal separation, unchanged, and this frame is the extreme case:
        a white gi and a black belt against black.
      · no third-party wordmark. There is a small embroidered maker's mark on
        the thigh, about 14px wide at 1512, and nothing else.

    STORED IN COLOUR, both cuts and the reel, and NOTHING IS BAKED. The plate
    used to be stored grayscale with a two-ink press computed into the video by
    hand, because `url(#duotone-paper-ink)` is an SVG reference filter and a
    full-screen one over 30fps is a per-frame pass on the machines least able
    to afford it. The grade is `saturate() contrast() brightness()` now — a
    colour matrix the compositor does for free — so hero.css grades the still
    and the reel with the SAME declaration, the tungsten warmth of the room
    survives, and the plate stays retunable without re-encoding a frame.

    WHAT IT COSTS, stated rather than hidden: the uniform is a taekwondo dobok,
    not a karate gi. The V-neck is the tell and no crop removes it. That is the
    one thing in this slot a Kyokushin reader will catch, and it is the gap the
    client's own photography closes.
  */
  firstScreen: pressed("kata-plate.jpg", 2560, 1080, {
    ru: "Каратист в белом кимоно с чёрным поясом в стойке на чёрном фоне",
    en: "A karateka in a white gi and black belt, in a stance against black",
  }),
  /*
    The upright cut — and NOT the same frame, which is the one convention this
    pass drops. The wide still has to be the reel's frame 0 because the reel
    lies over it; nothing lies over this one, because ui/Reel declines to mount
    below 4:5. So it is free to be the best frame in the cut rather than the
    first, and that is the punch itself.

    A phone does not see this cut either. 390 x 844 is far taller than 4:5, so
    `cover` takes the difference out of the WIDTH and shows a 0.46:1 strip of
    it, x 0.27–0.73. The figure is therefore set in a black field rather than
    filling one — 0.49 of the source frame, standing at x 0.31–0.69 — so the
    punching fist and the rear foot survive the strip, and the foot of the
    sheet stays black for the strike and the offer stacked under it.
  */
  firstScreenTall: pressed("kata-plate-portrait.jpg", 864, 1080, {
    ru: "Каратист в белом кимоно с чёрным поясом наносит прямой удар рукой",
    en: "A karateka in a white gi and black belt driving a straight punch",
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
  /*
    THE CHRONICLE'S PLATES — chapter 五, printed in colour rather than pressed.

    An exemption from the press is a decision that has to be argued each time,
    never a licence, so here is this one's. Chapter 四's reason is that the
    chapter is about a person. This one's is different: a victory is gold,
    ribbons and a red mat, and a chronicle of victories printed in two inks is
    a chronicle with its subject taken out — the plate below is the proof, a
    table of cups that came out of the press as grey crockery.

    (Grep `grade="color"` for the current set rather than trusting a count
    written in a comment. This file has been wrong about that before.)

    WHAT COLOUR COSTS, and the test every replacement has to pass. Pressed to
    bone, a federation banner in the background of a stock frame was texture.
    In full colour at plate scale it is READABLE, and it says the club belongs
    to an organisation it does not. Two otherwise perfect frames are on disk
    and are NOT used for exactly that:

      · kids-podium-trophies.jpg — «ISRAEL UNITED KYOKUSHIN KARATE» across the
        top AND a second circular logo of the same body low in the frame. No
        single crop removes both.
      · champion-medal-team.jpg — «FIRST EUROPEAN KYOKUSHIN/SHINKYOKUSHIN» on
        the diploma and a KARATE 極真 banner top-right.

    So a replacement needs all four: the club's own competition, real colour
    worth printing (a flat hall under fluorescent light wastes the exception),
    a subject that survives a hard crop to 3:4 or 4:3, and NO third-party
    federation wordmark anywhere legible. The same test `firstScreen` states
    for the first screen, applied to a plate the reader looks at for longer.

    The focal points below are crops, and they are arithmetic, not taste — each
    one is solved for the box its panel gives it. See `results.css`.
  */
  kidsPodium: ph("kids-podium-trophies.jpg", 1600, 1337, {
    ru: "Юные спортсмены с кубками на пьедестале",
    en: "Young athletes with trophies on the podium",
  }),
  /* chronicle, wide panel (4:3). 179px of horizontal overflow, so the focus
     barely moves the frame — it only keeps the cups off the right trim. */
  trophies: ph("trophies-table.jpg", 1600, 1066, {
    ru: "Кубки и медали на столе перед награждением",
    en: "Trophies and medals on a table before the awards",
  }, "62% 50%"),
  /* chronicle, tall panel (3:4). A 3:2 landscape cropped to 3:4 keeps only
     800 of 1600 columns, so the focus is what decides whether the frame holds
     a fight or half a referee: 60% puts the window at [480, 1280], which is
     both fighters' heads (≈600 and ≈1250) and neither edge of the hall. */
  kumiteKick: ph("mawashi-geri-kumite.jpg", 1600, 1066, {
    ru: "Маваши-гери в кумитэ на татами",
    en: "Mawashi-geri during kumite on the tatami",
  }, "60% 50%"),
  /*
    CHAPTER 四 — THE TWO COLOUR PLATES IN THE BOOK.

    Every other plate on this site is pressed through the duotone filters and
    comes out in the page's own two inks. These are printed in full sRGB,
    because 四 is the one chapter about people rather than about a practice.
    It is the single exception in the palette and it is spent here — on a
    spread of two coaches, so the exception is one decision, not two.

    WHY THESE FILES AND NOT PORTRAITS. The head coach's slot used to be
    `coachPortrait` → `karateka-fist-bw.jpg`: the right picture (one older man,
    black belt, a coiled kata guard, a quiet ground) and unusable, because that
    file is a TRUE GREYSCALE ORIGINAL — single-channel on Wikimedia Commons
    too, not a local conversion. The chapter's whole point is colour, so a
    frame with no chroma to print could not stay.

    AND FOUR OF THE FIVE REMAINING PORTRAIT FRAMES ARE OUT FOR ONE REASON:
    they are all the same Peruvian dojo, and they carry 極真館 / «CLUB DE
    KARATE MUSHA DOJO» — a DIFFERENT organisation from the club's
    Kyokushinkai — brush-written across a chest or hung on the wall behind the
    subject, where no crop reaches it. `sensei-blue-belt-portrait.jpg`
    (the `seniorSensei` slot), `sensei-seated-smile.jpg`,
    `mae-geri-jodan-portrait.jpg` and `kick-pairs-portrait.jpg` all fail on
    that one test. Printing another federation's name on a club's own coaches
    page is not a placeholder, it is a claim about who they train with.

    So the two that survive are the two below, and neither is a portrait.
  */
  /*
    WHAT THE HEAD COACH'S PLATE COSTS, stated rather than hidden: this is two
    fighters, not one man, and the belts are yellow and blue. In knockdown
    competition those are identification belts worn over rank, so they are not
    a claim about grade — but the chapter names one man and the plate shows
    two, and that is the gap the client's own photograph closes.
  */
  senseiPlate: ph("knockdown-kumite-kick.jpg", 1200, 1600, {
    ru: "Бой на турнире по киокушин — удар ногой",
    en: "Kyokushin tournament fight — a kick lands",
  }, "50% 20%"),
  /*
    THE SECOND COACH'S PLATE — and it is a PLACEHOLDER STANDING BESIDE A
    PLACEHOLDER. The man in the second half of the spread is invented
    (`assistant` in `content/home.ts`); so is this frame's relationship to him.
    Both are replaced together or neither is.

    `tameshiwari-bricks-vintage.jpg` was an orphan on disk with no slot. It is
    here because it is the only colour frame left that clears every test the
    branding rules out the others on: ONE adult, upright (1104 × 1600), a real
    karate event, and nothing on the man or behind him naming another
    federation — the poster at his shoulder is a venue bill, not a mark.

    WHAT IT COSTS: it is a 1970s or 80s frame and it prints like one, warm and
    faded beside the modern tournament plate next to it, with a crowd behind
    the break. That reads as a club with an archive rather than as an error,
    which is the most a stand-in can do — but two coaches photographed thirty
    years apart is not a spread, and the client's own two frames are what close
    it.

    WHAT A REPLACEMENT MUST SATISFY — both plates need all five:
      · The coach himself, alone in the frame.
      · Upright, 3:4 or taller. The chapter sets them 4:5 below 1024 and 3:4
        above, and caps their height so a 2560 sheet does not print a plate
        taller than the screen.
      · Chest-up or a held technique, with the face readable. This is the only
        chapter in the book where a person is looked at rather than watched.
      · STORED IN COLOUR, and worth printing in colour: real skin, a real hall,
        one saturated event. These are the only full-colour images on the site,
        so a flat or fluorescent frame wastes the exception.
      · No third-party federation name or wordmark anywhere legible.

    And the pair has a sixth: they are printed side by side at the same size on
    the same row, so they have to look like one commission — the same room or
    the same light, not one studio portrait against one snapshot.
  */
  assistantPlate: ph("tameshiwari-bricks-vintage.jpg", 1104, 1600, {
    ru: "Тамэсивари — разбивание кирпичей на показательном выступлении",
    en: "Tameshiwari — breaking bricks at a demonstration",
  }, "55% 45%"),
  /* chronicle, tall panel (3:4). The 800-column window sits centred here: the
     jumper spans ≈500–950 and the belt held across his path reaches ≈1200, so
     the default focus keeps the gesture and what it clears in one frame. */
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
 * A strike being thrown, 2.17s, once, and then the sheet is a photograph for
 * as long as the reader stays on it. It is deliberately not a loop and
 * deliberately not ambient: hero.css says of this sheet that "nothing on it
 * moves again — no loop, no breathing hairline, no scroll-linked transform, no
 * pointer lean", and a background quietly cycling every four seconds is
 * exactly the thing that sentence forbids.
 *
 * THE GESTURE IS THE CHAPTER'S OWN SENTENCE. 一 reads «Сначала поклон. / Потом
 * удар.», and the cut is the second half of it: guard, step, strike, hold. It
 * used to be a belt being tied, which was the first half.
 *
 * THE SOURCE is 1920 x 1080 at 23.976fps, ten and a half seconds of kata in a
 * black room with no fade at either end — `signalstats` YAVG sits flat at
 * 20.5/255 throughout, so the cut could be taken anywhere and the ground needs
 * no help. What decided 8.20–9.72 is that it is the only second and a half in
 * which anything happens: everything before it is held stances.
 *
 * WHO SEES IT. Wide viewports only, and only after hydration — `ui/Reel` holds
 * it back behind `useMediaQuery` so a phone, which is shown `firstScreenTall`
 * instead, never has the element in its markup to preload. Reduced motion gets
 * the still, which is this reel's own frame 0, so nothing is lost but the
 * movement.
 *
 * NOTHING IS BAKED IN any more, and that is the change that made the script
 * half its old length. The press used to be computed into the video by hand
 * because `url(#duotone-paper-ink)` is an SVG reference filter and a
 * full-screen per-frame pass; the grade is three plain colour-matrix functions
 * now, so hero.css declares it once for the still and the reel together and
 * the two halves of the plate cannot drift apart.
 */
export const reels = {
  firstScreen: {
    /* VP9 first: 142 KB against H.264's 235 KB for the same cut, and every
       browser that cannot read it falls through to the mp4 on the next line. */
    sources: [
      { src: "/media/hero/kata-reel.webm", type: "video/webm" },
      { src: "/media/hero/kata-reel.mp4", type: "video/mp4" },
    ],
    width: 2560,
    height: 1080,
    still: "firstScreen",
    seconds: 2.17,
    placeholder: true,
  },
} satisfies Record<string, ReelSlot>;

export type ReelKey = keyof typeof reels;
