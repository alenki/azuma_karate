
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
  alt: string;
  /** Focal point for object-position, e.g. "50% 30%". */
  focus?: string;
  placeholder: boolean;
};

const P = "/media/placeholders";

function ph(file: string, width: number, height: number, alt: string, focus?: string): MediaSlot {
  return { src: `${P}/${file}`, width, height, alt, focus, placeholder: true };
}

export const media = {
  /* ---- plates used by the home page (usage-named) ---- */

  /*
    THE FIRST SCREEN.

    Chapter 一 is one plate at the size of the screen: it is the page's LCP
    element, the chapter's own ground, and the beat the headline is written
    across.

    WHAT IT IS NOW. One karateka alone in a municipal sports hall — a deep low
    stance on the tatami, one hand and both feet on the mat, his own shadow
    thrown across it, and the room's haze standing in the window light behind
    him. Steel-framed glazing, safety netting, a radiator along the wall, bare
    trees outside: a real hall on a real winter morning, which is the whole
    point of this replacement.

    THE BRIEF INVERTED BACK WITH THE GROUND, and that is the whole of this
    pass. The chapter printed on INK and the type was BONE, so the plate had to
    be DARK everywhere the headline fell — and the only photographs that clear
    that ceiling are a subject lit on a black set, with no floor, no room and
    no depth behind them. That was not a photograph of a club, it was a cut-out;
    the frame it replaced was also a taekwondo dobok, which no crop removed.

    Measured against the ceiling, every real-room karate frame in the pool sits
    at L 0.3–0.99 where the type falls and fails outright — a warm backlit dojo
    reached 0.99. A real room and bone type are not compatible. So the chapter
    prints on PAPER again, the type is INK, every term flips back, and a
    replacement has to meet these:

      · a ground that is LIGHT where the type falls — at or above L 0.222, so
        ink clears 4.5:1. This frame runs 0.35–0.97 across the bow's band and
        0.21–0.74 across the foot; hero.css's foot ramp lifts the remainder.
      · ONE subject. At the size of a screen a hall full of them reads as
        texture.
      · the figure OUT of the left 62% of the trim, because that column is
        «Потом удар.». He stands at x 0.48–0.85 of the file, so the column is
        clear without any help from `object-position` — which is why the plate
        is no longer padded and the focus is a plain centre.
      · a REAL ROOM, and this is the term the previous pass could not meet at
        all: a floor under the feet, a cast shadow on it, and depth behind the
        subject.
      · no third-party wordmark. There is a small embroidered maker's mark on
        the chest, about 10px wide at 1512, and nothing else.

    WHAT IT COSTS, stated rather than hidden. The frame is a TRUE GREYSCALE
    original, so this plate carries no colour of its own and there is nothing
    here to grade warm if the page ever wants it. That suits a manual whose
    plates are black and white, but it is a constraint, not a choice. And the
    gi is a judogi rather than a Kyokushin karate gi — the wrap-over cut is
    right, the weight is heavier than a karate gi's. Both are gaps the client's
    own photography closes.
  */
  firstScreen: ph("sports-hall-stance.jpg", 2560, 1080, "Каратист в белом кимоно с чёрным поясом в низкой стойке на татами в спортивном зале"),
  /*
    The upright cut — the SAME frame, cropped to 0.8:1 rather than a second
    one. That the two cuts were different frames was the reel's convention: the
    wide still had to be the reel's frame 0 because the video lay directly over
    it, which left the upright cut free to be the best frame in the clip rather
    than the first. There is no reel any more, so there is no reason for the
    two to disagree, and one photograph read two ways is the truer thing for a
    book.

    A phone does not see this cut whole. 390 x 844 is far taller than 4:5, so
    `cover` takes the difference out of the WIDTH and shows a 0.46:1 strip of
    it, x 0.27–0.73. The figure is centred in the file for exactly that reason:
    the strip keeps his head, the belt and the braced arm, and loses only the
    reaching hand and the rear foot.
  */
  firstScreenTall: ph("sports-hall-stance-portrait.jpg", 864, 1080, "Каратист в белом кимоно с чёрным поясом в низкой стойке в спортивном зале"),

  /* The hero plate is shown inside the first stroke, so it is cropped to a
     letterbox of roughly 5:1. It needs a dark, high-contrast frame whose action
     survives that band, and no bright highlights along its top edge — the
     headline's second line is knocked out of it there. */
  heroStroke: ph("heavy-bag-kick-bw.jpg", 1600, 1066, "Удар в прыжке по тяжёлому мешку, чёрно-белое фото", "50% 33%"),
  heroPlate: ph("kick-pairs-portrait.jpg", 1066, 1600, "Ученик в белом кимоно отрабатывает удар ногой в зале", "50% 30%"),
  seniorSensei: ph("sensei-blue-belt-portrait.jpg", 1067, 1600, "Старший тренер показывает технику руками", "50% 25%"),
  kidsKumite: ph("kids-kumite-headgear.jpg", 1458, 1600, "Дети в шлемах и защите проводят учебный спарринг", "50% 40%"),
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
    a subject that survives a crop to 4:3, and NO third-party federation
    wordmark anywhere legible. The same test `firstScreen` states for the
    first screen, applied to a plate the reader looks at for longer.

    EVERY CHRONICLE PANEL IS THE SAME PANEL — one width, one 4:3 plate — so
    all three focal points below are solved against the same box: a 3:2
    original keeps 1421 of its 1600 columns, which leaves 179px of horizontal
    overflow for the focus to spend. They are arithmetic, not taste. See
    `results.css`.
  */
  kidsPodium: ph("kids-podium-trophies.jpg", 1600, 1337, "Юные спортсмены с кубками на пьедестале"),
  /* chronicle plate. 179px of overflow, so the focus barely moves the frame —
     it only keeps the cups off the right trim. */
  trophies: ph("trophies-table.jpg", 1600, 1066, "Кубки и медали на столе перед награждением", "62% 50%"),
  /* chronicle plate. The tall panel this was solved for kept only 800 columns,
     and the focus decided whether the frame held a fight or half a referee;
     at 4:3 it is a trim rather than a rescue — 60% sets the window at
     [107, 1528], which holds both fighters' heads (≈600 and ≈1250) and drops
     the empty left edge of the hall. */
  kumiteKick: ph("mawashi-geri-kumite.jpg", 1600, 1066, "Маваши-гери в кумитэ на татами", "60% 50%"),
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
  senseiPlate: ph("knockdown-kumite-kick.jpg", 1200, 1600, "Удар ногой в бою на турнире по киокушин", "50% 20%"),
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
  assistantPlate: ph("tameshiwari-bricks-vintage.jpg", 1104, 1600, "Тамэсивари, разбивание кирпичей на показательном выступлении", "55% 45%"),
  /* chronicle plate. The 1421-column window sits centred here: the jumper
     spans ≈500–950 and the belt held across his path reaches ≈1200, so the
     default focus keeps the gesture and what it clears in one frame. */
  flyingKick: ph("flying-kick-dojo.jpg", 1600, 1066, "Прыжковый удар ногой на тренировке"),
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
  kickWide: ph("kick-dojo-wide.jpg", 1600, 1066, "Отработка ударов ногами в зале", "50% 42%"),
  kickExchange: ph("kick-exchange.jpg", 1600, 1066, "Обмен ударами в учебном бою"),
  stretching: ph("stretching-class-overhead.jpg", 1600, 1066, "Растяжка всей группы на татами, вид сверху"),
  dojoSign: ph("kyokushin-dojo-sign.jpg", 1600, 1200, "Вывеска додзё с иероглифами 極真"),
  heavyBag: ph("heavy-bag-kick-bw.jpg", 1600, 1066, "Удар по тяжёлому мешку, чёрно-белое фото"),
  sunriseKick: ph("kick-sunrise-silhouette.jpg", 1600, 1066, "Силуэт удара ногой на рассвете", "50% 60%"),
  sunriseKick2: ph("kicking-sunrise-silhouette-2.jpg", 1600, 1066, "Утренняя тренировка на рассвете"),
  parkAlley: ph("nalchik-park-autumn-alley.jpg", 1600, 1066, "Аллея в парке Нальчика осенью"),
  parkWillows: ph("nalchik-park-willows-lake.jpg", 1600, 1066, "Ивы у озера в курортном парке Нальчика"),
  parkBench: ph("nalchik-park-bench-pines.jpg", 1600, 1066, "Скамейка под соснами в парке Нальчика"),
  parkPath: ph("forest-path-portrait.jpg", 899, 1600, "Тропинка к реке в парке Нальчика", "50% 45%"),
  roadToElbrus: ph("road-to-elbrus-steppe.jpg", 1600, 1066, "Дорога к Эльбрусу через степь", "50% 60%"),
  caucasusPanorama: ph("caucasus-panorama-kbr.jpg", 1600, 1066, "Панорама Кавказских гор, Кабардино-Балкария"),
  glacierPeak: ph("glacier-peak-dramatic.jpg", 1600, 1068, "Ледник и вершина в Приэльбрусье"),
  greenValley: ph("green-valley-jila-su.jpg", 1600, 1066, "Зелёная долина Джилы-Су"),
  mountainHuman: ph("mountain-and-human.jpg", 1066, 1600, "Человек в горной долине"),
  duskGrass1: ph("mountain-dusk-grass-1.jpg", 1600, 1066, "Сумерки в горах, трава на переднем плане"),
  duskGrass2: ph("mountain-dusk-grass-2.jpg", 1600, 1066, "Вечер в горах Кабардино-Балкарии"),
  duskGrass3: ph("mountain-dusk-grass-3.jpg", 1600, 900, "Ночь на склонах горы"),
  ridgeClimbers: ph("ridge-climbers-bw.jpg", 1600, 1600, "Альпинисты на снежном гребне, чёрно-белое фото"),
  kidsPadsDrill: ph("kids-pads-drill.jpg", 1390, 1600, "Дети в шлемах и защите в учебном бою", "50% 35%"),
  /* a 1067x1600 portrait, and — unlike `kidsSparringGear` — not another crop of
     the same frame as `kidsPadsDrill`, so two adjacent bands of chapter 三 no
     longer print the same photograph twice. */
  kidKicksPad: ph("kid-kicks-pad-coach.jpg", 1067, 1600, "Ребёнок отрабатывает удар по лапе, которую держит тренер", "50% 35%"),
  kidsSparringGear: ph("kids-sparring-gear.jpg", 1066, 1600, "Дети в защитной экипировке на тренировке", "50% 30%"),
  kidsYellowBelt: ph("kids-sparring-yellow-belt.jpg", 1600, 1200, "Юные каратисты с жёлтыми поясами в учебном бою"),
  maeGeriGym: ph("mae-geri-gym.jpg", 1600, 1472, "Мае-гери в спортивном зале"),
  maeGeriPortrait: ph("mae-geri-jodan-portrait.jpg", 1066, 1600, "Удар мае-гери дзёдан, вертикальный кадр", "50% 35%"),
  milkyWay: ph("milky-way-elbrus.jpg", 1066, 1600, "Млечный путь над Эльбрусом"),
  tikhtengen: ph("tikhtengen-peak.jpg", 1600, 1066, "Пик Тихтенген, Чегемское ущелье"),
  tournamentHall: ph("tournament-hall-tatami.jpg", 1600, 1200, "Турнирный зал с татами, вид сверху"),
} satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof media;

export function slot(key: MediaKey): MediaSlot {
  return media[key];
}

export const placeholderBase = P;
