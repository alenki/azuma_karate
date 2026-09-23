# Chapter 六 sends: the Telegram relay

2026-09-22

## The ask

«I want the form to send to telegram by itself.» Chapter 六 validated four
answers, assembled a message, printed it, and asked the reader to carry it into
Telegram by hand. It should send.

## The constraint that decided the architecture

The club's hosting is **reg.ru shared хостинг: Apache and PHP, no Node
process.** That rules out the obvious answer. Under `output: 'export'` a Next
route handler supports GET only and is rendered to a static file at build time
(`node_modules/next/dist/docs/01-app/02-guides/static-exports.md`). There is no
runtime to POST to.

Three options were weighed:

| | verdict |
|---|---|
| **PHP relay in `public/`** | **chosen.** Same origin, no CORS, no second deployment, no third party. Works on any host with PHP and curl. |
| External function (Worker / Yandex Cloud) | rejected. Needs CORS, a second deploy target and another account for the club. Its one real advantage is living outside Russia, which matters only if the host cannot reach api.telegram.org. |
| Third-party form service | rejected. A third party would hold the names and ages of children, which is a 152-ФЗ data-localisation problem before it is a taste one. |
| Bot token in the browser | rejected outright. Anyone reading the bundle owns the bot. |

## Shape

```
browser ──POST (4 raw fields)──▶ /api/send.php ──sendMessage──▶ club's group
   │                                   │
   │                            azuma-telegram-config.php
   │                            (ABOVE the web root)
   └── prints a receipt of the same message
```

**The browser posts the four raw answers, never the assembled text.** A relay
that accepted finished text would be an open relay into the coach's phone and
the next thing through it would be a scam link. The relay revalidates every
field and builds the message itself.

**The message therefore exists twice**, and that is the only string in the
manual kept in two hands. `scripts/gen-join-message.ts` writes `join.opening`
and `join.years` from `src/content/home.ts` out to
`public/api/join-message.json` in pure-ASCII `\uXXXX` escapes, so the file also
survives an FTP client in text mode. Verified: `Intl.PluralRules("ru")` and the
longhand modulo rule in `ru_years()` agree on every age 0–200.

## Three outcomes, not two

The page must never claim a send it did not make. That is what the third state
is for.

| state | when | what prints |
|---|---|---|
| `sent` | relay confirmed | `join.success` over a **receipt** of the message. No copy control, no route out: there is nothing left to carry. |
| `carry` | nothing is answering there — no endpoint, a non-JSON reply, or `code: "unconfigured"` (no token on the server yet) | the old slip **alone**. Nothing was attempted, so nothing is reported. |
| `failed` | the relay answered and said no | `join.error` over the old slip, with the copy control and the Telegram route under it. |

`carry` is exactly what the chapter did before a relay existed, which is why
`NEXT_PUBLIC_JOIN_ENDPOINT=""` is a complete and honest off switch.

## Consent

`join.privacy` prints now, unlinked, under the ask. It could not print before:
consent covers the *processing* of personal data, and while nothing left the
reader's browser the sentence would have been false in the one register where
that matters. `privacyLead` / `privacyLink` / `privacyTail` stay dormant until
a policy page exists to wrap.

## Defences

Honeypot (`subject`, not `email` — Chrome's autofill maps the latter, and a
filled honeypot is answered with a silent 200, so a false positive would lose a
real заявка without telling anyone), a three-second dwell floor measured from
**page load** rather than first keystroke (autofill would otherwise trip it),
per-field length caps enforced on both sides, and a `flock`-guarded file-backed
rate limit above the web root: 5 per IP per hour, 60 overall, addresses stored
as truncated hashes. Shared hosting is one box with a writable disk, so that
counter is genuinely shared — more reliable than the in-memory limiter a
serverless platform would have allowed.

## Verified

- `npm run lint` and `npm run build` clean (React Compiler rejected `Date.now()`
  in render; it moved to an effect, with the zero default failing in the
  direction that lets a заявка through).
- All three outcomes driven in a real browser against the running page, plus
  the wire payload: raw fields, empty honeypot, dwell over the floor, «07»
  normalised to «7 лет» with its bound space intact on both sides.
- Consent measure set to 33ch **by measurement**: three lines at every tier,
  left edge within 3px of the trust line at 1024/1280/1440/1600/1998/2560. The
  two-line 38ch version was rejected for sitting ~36px proud of the column.
- No horizontal overflow from the off-canvas honeypot; `tabIndex -1` and
  `aria-hidden` on the wrapper.
- NBSP discipline held: escape counts unchanged, zero raw U+00A0 bytes.

## Deliberately not done

1. **`output: 'export'` is not flipped.** It forces `images.unoptimized`, which
   kills the AVIF/WebP pipeline and the `getImageProps` art direction in
   `ui/Photo.tsx`. Every plate on a photography-led page would get heavier and
   softer. That needs its own decision, not a side effect of a form change.
2. **No live send has been proven.** There is no PHP on this machine, so the
   relay is unlinted and untested end to end, and whether api.telegram.org is
   reachable from a Russian datacentre is an assumption. `config.example.php`
   ends with a one-line `getMe` check that settles both from the server.
