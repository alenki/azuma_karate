"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { door } from "@/content/contacts";
import { schedule as scheduleCopy, isPending, PENDING_MARK } from "@/content/home";
import { club } from "@/content/schedule";
import { firstSession, groupById } from "@/lib/schedule";
import { formatNextSession } from "@/components/ui/NextSessionStrip";
import { clubClock, dayRange, hallState, weekEnvelope, type HallState } from "@/lib/hall";
import { createLiveStore, useLiveStore } from "@/lib/useLiveValue";
import { Leaf } from "./Leaf";
import { Seal } from "@/components/brush/Seal";
import { LineReveal } from "@/components/ui/LineReveal";
import { Register, Reveal, Settle } from "@/components/ui/Reveal";

const HEADING_ID = "contacts-door-title";

/*
  THE CLOCK AND THE STATE ARE ONE LIVE VALUE.

  The page is statically generated, so the server has no useful clock: whatever
  time it printed would be the time of the BUILD, frozen. The repo's answer is
  `lib/useLiveValue.ts` — a module-scope store read through
  `useSyncExternalStore`, with the server value passed in — and this follows the
  next-session strip exactly. The served markup carries the manual's own mark
  for "nothing here yet" at the clock's tabular width, and the week's first slot
  as the next session; one frame after hydration both become true, and then they
  tick every minute.

  The identity includes the clock, so the row re-renders each minute. That costs
  nothing and is the whole point of printing a clock — and the row is NOT a live
  region, so nothing is announced at a reader every sixty seconds.
*/
/* `live` is the store's own "is this a real reading yet" flag, and it is NOT
   the hall's state: `formatNextSession` takes it to decide whether it may say
   «Сегодня» / «Завтра» rather than a bare weekday, which it may only do once a
   clock exists. Passing the open/closed state there instead happened to produce
   the right words — the training branch never reads them — and would have
   printed a weekday for a session that is today the moment it did. */
type Live = { state: HallState; clock: string; live: boolean };

const SERVER: Live = {
  state: { kind: "closed", next: firstSession() },
  clock: `${PENDING_MARK}${PENDING_MARK}`,
  live: false,
};

const store = createLiveStore<Live>(
  () => ({ state: hallState(), clock: clubClock(), live: true }),
  (v) => `${v.clock}:${v.state.kind}:${v.state.next.day}:${v.state.next.time}`,
);

/**
 * Band A — the addressed face.
 *
 * The club's particulars, set the way a posted address is set: addressee,
 * street, city, republic, ranged left, with no label on any of them. An address
 * block is recognised by its SHAPE, and every glyph in this one is a confirmed
 * fact that already lives in `content/schedule.ts` — so the page opens with the
 * reference's confidence without inventing a word.
 *
 * The scale is the argument. The STREET is the largest type on the page and the
 * city is one step under it. Every reader this page is for is already in
 * Nalchik; «НАЛЬЧИК» at poster size would be maximum scale spent on zero
 * information.
 *
 * Three routes stand beside it and one is a ruled blank: the club's phone is
 * `club.pending.phone`, and this is the first place in the codebase that draws
 * what the pending convention has always described. It is not a link, because
 * there is nothing to dial.
 *
 * The <Seal> sits in the stamp corner — the one job a seal literally has — and
 * it is this band's only vermilion. The page spends the accent once per band
 * and each time on a different one of its three sanctioned jobs: the stamp
 * here, the brush in «Ваша группа», the press at the close.
 */
export function Door() {
  const { locale } = useLocale();
  const { state, clock, live } = useLiveStore(store, SERVER);
  const envelope = weekEnvelope();
  const phonePending = isPending(club.pending.phone);

  /* the two states the hall can be in, and there is no third — see lib/hall */
  const nowGroup = groupById(state.kind === "training" ? state.session.group : state.next.group);
  const nowLabel = state.kind === "training" ? door.now.training[locale] : door.now.next[locale];
  /*
    THE NEXT SESSION CARRIES ITS DAY. `nextSession()` can land on any weekday,
    so «18:00 · Дети» would tell a reader on Saturday nothing at all.
    `formatNextSession` is the home page's own formatter for exactly this —
    «Сегодня» / «Завтра» / «Вт» — so the two readouts word it identically. It
    also sidesteps Russian's prepositional weekday («во вторник», never «в
    вторник») by needing no preposition at all.
  */
  const when = formatNextSession(state.next, live, locale);
  const nowValue =
    state.kind === "training"
      ? `${nowGroup.name[locale]}\u00A0· ${door.now.until[locale]}\u00A0${state.endsAt}`
      : `${when.when} ${state.next.time}\u00A0· ${nowGroup.name[locale]}`;
  const sessionsValue = `${dayRange(envelope.days, locale)}\u00A0· ${envelope.opens}\u2013${envelope.closes}`;

  return (
    <Leaf id="door" labelledBy={HEADING_ID} className="door">
      <div className="door__sheet wrap">
        <div className="door__body">
          {/* THE ADDRESS IS THE PAGE'S HEADING. A contacts page whose <h1> is
              the word «Контакты» prints a label where it could print a fact;
              the accessible name here is the block read as an address, which is
              exactly what the sighted reader sees. */}
          <div className="door__address">
            <Settle mode="load" duration={0.6}>
              <span className="t-mono door__addressee block">{door.addressee[locale]}</span>
            </Settle>
            {/* The <h1> is the street and the city — the two lines a reader
                came for. The addressee and the republic stand outside it
                because <Reveal> and <Settle> render a <div>, and a heading
                takes phrasing content only; the accessible name is the
                sr-only line below, since LineReveal prints its own lines
                aria-hidden and is passed `label={null}` so nothing is
                announced twice. */}
            <h1 id={HEADING_ID} className="door__h1">
              <span className="sr-only">
                {door.addressee[locale]}, {club.address[locale]}, {club.city[locale]}, {club.region[locale]}
              </span>
              <LineReveal
                as="span"
                className="t-display door__street block"
                mode="load"
                delay={0.05}
                duration={1.05}
                lines={[club.address[locale]]}
                label={null}
              />
              <LineReveal
                as="span"
                className="t-display door__city block"
                mode="load"
                delay={0.16}
                duration={1}
                lines={[club.city[locale]]}
                label={null}
              />
            </h1>
            <Reveal mode="load" delay={0.3} y={14} duration={0.8}>
              <span className="t-note door__region block">{club.region[locale]}</span>
            </Reveal>
          </div>

          {/* The stamp corner. <Seal> is printed here and nowhere else on the
              site, and this is the one job a seal literally has: it is where a
              stamp goes on an addressed envelope. It is a GRID CHILD rather
              than an overlay, so it can never land on the street name — an
              absolutely positioned stamp cleared the type at 1512 and sat on
              it at 390, which is the kind of collision that is tuned away at a
              few widths instead of being made impossible at all of them. */}
          <Settle mode="load" delay={0.8} duration={0.5} className="door__seal">
            <Seal trigger="load" delay={0.85} />
          </Settle>

          <Register mode="load" delay={0.42} stagger={0.07} className="door__routes">
            <div className="door__entry">
              <span className="t-mono door__label">{door.routes.telegram[locale]}</span>
              <a href={club.telegram} rel="noopener" className="t-note door__value">
                {door.telegramHandle}
              </a>
            </div>
            <div className="door__entry">
              <span className="t-mono door__label">{door.routes.instagram[locale]}</span>
              <a href={club.instagram} rel="noopener" className="t-note door__value">
                {door.instagramHandle}
              </a>
            </div>
            {/* THE RULED BLANK. `club.phone` and `club.phoneHref` are never
                rendered on this page: the number is a placeholder, and a parent
                who tapped it would reach nobody. */}
            <div className="door__entry">
              <span className="t-mono door__label">{door.routes.phone[locale]}</span>
              {phonePending ? (
                <span className="t-note door__pending">
                  <span aria-hidden="true" className="door__blank" />
                  <span className="door__awaiting">{club.pending.phone.awaiting[locale]}</span>
                </span>
              ) : (
                <a href={club.phoneHref} className="t-note door__value">
                  {club.phone}
                </a>
              )}
            </div>
          </Register>
        </div>

        {/*
          THE HALL, LIVE, ON ONE RULE AT THE FOOT OF THE FOLD.

          Not one of its states says «открыто». The club has told us when it
          TRAINS, not when it unlocks the door, so this prints who is on the
          tatami right now or when the next session is, and nothing in between.
          «Тренировки» beside it is an ENVELOPE and is labelled as one: per-day
          windows differ (Monday runs to 22:00, Tuesday to 21:00), so a line
          claiming those two figures as opening HOURS would be false four days
          out of five. The week itself is one link away and is not reprinted.
        */}
        <Reveal mode="load" delay={0.6} y={16} duration={0.8} className="door__now">
          <div className="rule" />
          <div className="door__now-row">
            <span className="door__now-item">
              <span className="t-mono door__now-label">{door.now.clock[locale]}</span>
              <time className="t-note door__now-value door__clock">{clock}</time>
            </span>
            <span className="door__now-item">
              <span className="t-mono door__now-label">{nowLabel}</span>
              <span className="t-note door__now-value">{nowValue}</span>
            </span>
            <span className="door__now-item">
              <span className="t-mono door__now-label">{door.now.sessions[locale]}</span>
              <span className="t-note door__now-value">{sessionsValue}</span>
            </span>
            <a href={club.mapsHref} rel="noopener" className="t-note door__value door__route-link">
              {scheduleCopy.route[locale]}
              <span aria-hidden="true"> →</span>
            </a>
          </div>
        </Reveal>
      </div>
    </Leaf>
  );
}
