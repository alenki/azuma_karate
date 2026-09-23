<?php
/**
 * SK AZUMA — chapter 六's relay. The one piece of server on the whole site.
 *
 * WHY THIS IS PHP AND NOT A ROUTE HANDLER. The club's hosting (reg.ru) is
 * shared: Apache and PHP, no Node process. `next build` therefore has to be a
 * static export, and under `output: 'export'` a Next route handler supports
 * GET only and is rendered to a file at build time — there is no runtime to
 * POST to. See `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`.
 * So the endpoint is a plain PHP file that ships in `public/` and lands next
 * to the exported page, on the same origin: no CORS, no second deployment, no
 * third party holding the name and age of somebody's child.
 *
 * WHAT IT NEVER CONTAINS. The bot token. It is read from a config file that
 * sits ABOVE the web root (see `config.example.php`), so no request can reach
 * it even if PHP stops executing. Nothing secret is in this file, which is why
 * it is safe that a Node server would serve its source as plain text: the form
 * then fails to parse the reply and falls back to the slip, which is correct.
 *
 * WHAT THE BROWSER SENDS. The four raw answers, never the assembled message.
 * If the client posted finished text this would be an open relay into the
 * coach's phone and the next thing through it would be a scam link. The
 * message is built HERE, from `join-message.json`, which is generated out of
 * `src/content/home.ts` by `scripts/gen-join-message.ts` so the sentence the
 * reader is shown and the sentence the coach receives cannot drift apart.
 *
 * Targets PHP 7.4: no `never`, no enums, no `str_contains`. Shared hosting is
 * not where you find out your syntax needed 8.2.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');

/** Bytes of request body read before giving up. The four asks cannot fill it. */
const MAX_BODY = 4096;
/** A form filled faster than this was not filled by a person. Forgeable, and
 *  only ever meant to stop the unsophisticated majority. */
const MIN_ELAPSED_MS = 3000;
const WINDOW_SECONDS = 3600;
/** Per address, per window. A family enrolling two children needs two. */
const PER_IP_LIMIT = 5;
/** Across every address. The brake for the day a single run comes from a pool
 *  of hosts: the coach's phone stops being the target of the flood. */
const GLOBAL_LIMIT = 60;
const TELEGRAM_TIMEOUT = 10;

/** Length in CHARACTERS. Cyrillic is two bytes, so `strlen` would cut a
 *  Russian name at half the letters it promises. mbstring is near-universal
 *  but not guaranteed on shared hosting, hence the fallback. */
function ulen(string $s): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($s, 'UTF-8');
    }
    return (int) preg_match_all('/./us', $s);
}

/** The reply is a status code and a stable machine code. No Russian leaves
 *  this file: every sentence the reader sees is set in the page's own type,
 *  from `join.*` in the content layer. A server that writes its own prose into
 *  a designed page is how you get two typefaces and two voices. */
function reply(int $status, bool $ok, string $code = '')
{
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'code' => $code]);
    exit;
}

/**
 * The secrets, from above the web root.
 *
 * `__DIR__` is `<web root>/api`, so two levels up is the directory the web
 * root itself sits in — not served by Apache under any misconfiguration short
 * of a rewritten DocumentRoot. `AZUMA_TG_CONFIG` overrides it for a host that
 * lays its directories out differently.
 */
function load_config(): array
{
    $path = getenv('AZUMA_TG_CONFIG');
    if (!is_string($path) || $path === '') {
        $path = __DIR__ . '/../../azuma-telegram-config.php';
    }
    if (!is_readable($path)) {
        return [];
    }
    $config = include $path;
    return is_array($config) ? $config : [];
}

/**
 * A file-based window, and on this host that is the RIGHT answer rather than
 * the cheap one. Shared hosting is a single box with a writable disk, so a
 * counter on disk is shared by every request that arrives — which is more
 * than a serverless platform could have given us, where each cold instance
 * would have started counting from zero.
 *
 * `flock` around the whole read-modify-write, because two submissions in the
 * same second must not each read "4 so far" and both decide they are the
 * fifth. The lock is held for the length of a `json_decode` and a write.
 *
 * Addresses are stored as a truncated SHA-256 and never in the clear: this is
 * a spam counter, and it has no business also being a log of who visited a
 * children's karate club.
 */
function rate_limited(string $dir, string $ip): bool
{
    $file = rtrim($dir, '/') . '/azuma-join-rate.json';
    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        /* Nowhere to write. Let the request through rather than refusing
           every parent because a directory is read-only: the honeypot, the
           timing check and the field caps are all still standing. */
        return false;
    }
    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        return false;
    }

    $now = time();
    $cutoff = $now - WINDOW_SECONDS;
    $raw = stream_get_contents($handle);
    $hits = is_string($raw) && $raw !== '' ? json_decode($raw, true) : [];
    if (!is_array($hits)) {
        $hits = [];
    }

    /* Prune first, so the file is bounded by the window and not by the
       lifetime of the site. */
    $kept = [];
    foreach ($hits as $key => $stamps) {
        if (!is_array($stamps)) {
            continue;
        }
        $fresh = array_values(array_filter($stamps, static function ($t) use ($cutoff) {
            return is_int($t) && $t > $cutoff;
        }));
        if ($fresh !== []) {
            $kept[$key] = $fresh;
        }
    }

    $id = substr(hash('sha256', $ip), 0, 32);
    $mine = isset($kept[$id]) ? $kept[$id] : [];
    $total = 0;
    foreach ($kept as $stamps) {
        $total += count($stamps);
    }

    $over = count($mine) >= PER_IP_LIMIT || $total >= GLOBAL_LIMIT;
    if (!$over) {
        $mine[] = $now;
        $kept[$id] = $mine;
    }

    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, (string) json_encode($kept));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    return $over;
}

/**
 * «7 лет», «22 года», «1 год». The same three slots `Intl.PluralRules` picks
 * from in the browser, chosen by the same rule, so the receipt printed on the
 * page and the line the coach reads are one string.
 *
 * The space before the unit is a NON-BREAKING one (U+00A0): a figure and its
 * unit do not get separated by a line break, which is the convention the whole
 * manual is set to.
 */
function ru_years(int $n, array $forms): string
{
    $mod10 = $n % 10;
    $mod100 = $n % 100;
    if ($mod10 === 1 && $mod100 !== 11) {
        $unit = $forms['one'];
    } elseif ($mod10 >= 2 && $mod10 <= 4 && ($mod100 < 12 || $mod100 > 14)) {
        $unit = $forms['few'];
    } else {
        $unit = $forms['many'];
    }
    return $n . "\u{00A0}" . $unit;
}

/* ------------------------------------------------------------------ */
/* The request                                                         */
/* ------------------------------------------------------------------ */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, false, 'method');
}

$body = file_get_contents('php://input', false, null, 0, MAX_BODY + 1);
if (!is_string($body) || strlen($body) > MAX_BODY) {
    reply(413, false, 'size');
}

$in = json_decode($body, true);
if (!is_array($in)) {
    reply(400, false, 'json');
}

$str = static function ($v) {
    return is_string($v) ? trim($v) : '';
};

/*
  THE HONEYPOT ANSWERS 200. A bot told it failed retries, varies its payload
  and eventually finds the shape that works; one told it succeeded goes away
  satisfied and the coach's phone stays quiet.

  THE FIELD IS CALLED `subject` AND THAT IS A DELIBERATE, BORING CHOICE. It
  was nearly `email`, which is better bait but is also a token Chrome's
  autofill recognises: a browser helpfully filling a hidden field would make
  a real parent look like a bot, and because the answer here is a silent 200
  they would never learn their заявка was dropped. No autofill heuristic maps
  to "subject", and a bot that fills every input it finds bites either way.
*/
if ($str($in['subject'] ?? '') !== '') {
    reply(200, true, 'ok');
}

$elapsed = isset($in['elapsed']) && is_numeric($in['elapsed']) ? (int) $in['elapsed'] : 0;
if ($elapsed < MIN_ELAPSED_MS) {
    reply(200, true, 'ok');
}

$name = $str($in['name'] ?? '');
$ageRaw = $str($in['age'] ?? '');
$contact = $str($in['contact'] ?? '');
$note = $str($in['note'] ?? '');

/*
  THE SAME THREE RULES THE BROWSER APPLIED, APPLIED AGAIN. Client validation
  is a courtesy to the reader; it is not a check, because nothing stops a
  request arriving without ever having met the form.
*/
$age = ctype_digit($ageRaw) ? (int) $ageRaw : 0;
if (ulen($name) < 2 || ulen($name) > 80) {
    reply(422, false, 'name');
}
if ($age < 4 || $age > 99) {
    reply(422, false, 'age');
}
if (ulen($contact) < 4 || ulen($contact) > 120) {
    reply(422, false, 'contact');
}
if (ulen($note) > 1000) {
    reply(422, false, 'note');
}

$config = load_config();
$token = isset($config['bot_token']) ? (string) $config['bot_token'] : '';
$chat = isset($config['chat_id']) ? (string) $config['chat_id'] : '';
if ($token === '' || $chat === '') {
    /*
      No bot configured. 503 and not 500: the endpoint is correct, the club
      simply has not finished setting it up, and the page answers by printing
      the slip and the Telegram route exactly as it did before any of this
      existed. Nothing here claims to have sent anything.
    */
    reply(503, false, 'unconfigured');
}

$stateDir = isset($config['state_dir']) && $config['state_dir'] !== ''
    ? (string) $config['state_dir']
    : dirname(__DIR__, 2);
$ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
if (rate_limited($stateDir, $ip)) {
    reply(429, false, 'rate');
}

/* The copy, generated from the content layer. If it is missing the relay
   refuses rather than inventing an opening line of its own. */
$tpl = @file_get_contents(__DIR__ . '/join-message.json');
$copy = is_string($tpl) ? json_decode($tpl, true) : null;
if (!is_array($copy) || !isset($copy['opening'], $copy['years'])) {
    reply(500, false, 'copy');
}

/*
  The message, assembled in the shape `assemble()` used to build in the
  browser: the one line the page contributes, then the reader's own answers
  and nothing else. No form id, no "sent from", no subject, no timestamp —
  Telegram stamps every message itself, and every line added here is a line
  the coach reads past on a phone.
*/
$who = $name . ', ' . ru_years($age, $copy['years']);
$parts = [$copy['opening'], $who . "\n" . $contact];
if ($note !== '') {
    $parts[] = $note;
}
$text = implode("\n\n", $parts);

/*
  NO `parse_mode`. Sent as literal text, so an underscore in a Telegram handle
  or a bracket in a comment is delivered as typed instead of being read as
  markup and either mangling the message or failing the call outright. It also
  means the receipt printed on the page is byte-for-byte what arrives.
*/
$payload = json_encode([
    'chat_id' => $chat,
    'text' => $text,
    'disable_web_page_preview' => true,
], JSON_UNESCAPED_UNICODE);

if (!function_exists('curl_init')) {
    reply(500, false, 'curl');
}

$ch = curl_init('https://api.telegram.org/bot' . $token . '/sendMessage');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => TELEGRAM_TIMEOUT,
    CURLOPT_CONNECTTIMEOUT => 5,
]);
$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

/*
  Telegram answers 200 with `{"ok":false}` for a bad chat id, so the HTTP code
  alone is not the answer. A failure here is not an error page: the reader is
  handed the slip and the human route, which is what they had before.
*/
$result = is_string($response) ? json_decode($response, true) : null;
if ($status !== 200 || !is_array($result) || ($result['ok'] ?? false) !== true) {
    reply(502, false, 'telegram');
}

reply(200, true, 'ok');
