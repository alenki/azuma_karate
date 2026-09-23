<?php
/**
 * TEMPLATE. Copy this ONE DIRECTORY ABOVE THE WEB ROOT, fill it in, and do
 * not commit the filled copy.
 *
 *   cp config.example.php ../../azuma-telegram-config.php
 *
 * If the site is served from `~/public_html`, the filled file belongs at
 * `~/azuma-telegram-config.php` — a sibling of `public_html`, not inside it.
 * Apache serves nothing from there, so the token cannot be fetched even if
 * PHP stops executing and starts handing out source. That is the whole reason
 * for the awkward path: a config file inside the web root is one server
 * misconfiguration away from being a public document.
 *
 * `send.php` reads `AZUMA_TG_CONFIG` first if it is set, so a host that lays
 * its directories out differently needs no edit to the relay.
 *
 * HOW TO GET THE TWO VALUES
 *
 *   bot_token  Message @BotFather in Telegram, /newbot, follow the prompts.
 *              The token looks like 1234567890:AA... and is the single
 *              credential that controls the bot. Treat it as a password: if
 *              it leaks, /revoke with @BotFather and replace it here.
 *
 *   chat_id    Add the bot to the group that should receive the заявки, then
 *              send any message in that group and open
 *              https://api.telegram.org/bot<TOKEN>/getUpdates in a browser.
 *              The group's id is `result[].message.chat.id` and for a group
 *              it is NEGATIVE, e.g. -1001234567890. Keep the minus sign.
 *
 *              A bot cannot start a conversation, so it will not receive
 *              anything until it has been added to the group and, in a group
 *              with privacy mode on, it still receives nothing it is not
 *              addressed in — which does not matter here, because the relay
 *              only ever SENDS.
 *
 * AFTER FILLING IT IN, test from the server itself rather than from a laptop:
 *
 *   php -r '$c=include "azuma-telegram-config.php";
 *           echo file_get_contents("https://api.telegram.org/bot".$c["bot_token"]."/getMe");'
 *
 * That one line proves the token is right AND that this host can reach
 * api.telegram.org at all, which is the assumption most worth checking before
 * trusting the form.
 */

return [
    'bot_token' => '',
    'chat_id' => '',

    /*
      Where the rate-limit counter is kept. Empty means "next to this file",
      which is above the web root and therefore correct. It must be writable
      by the user PHP runs as; if it is not, the relay still works and simply
      stops rate limiting, because refusing every parent over a directory
      permission would be the worse failure.
    */
    'state_dir' => '',
];
