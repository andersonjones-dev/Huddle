# Huddle

Ten party games for one phone, for game nights, youth groups and family evenings.
Bible and everyday word packs, in English and ಕನ್ನಡ. Works offline once opened.

| Game | How it plays on one phone |
|---|---|
| Act It Out | Guesser holds the phone on their forehead; tilt down = got it, up = pass (buttons work too) |
| Forbidden Words | Clue-giver describes the word without saying the banned words |
| One Word | One clue-giver per team sees the word; teams take turns giving one-word clues, only one team wins each word |
| Draw It | Drawer holds Peek to see the word, then draws on the screen |
| Hum That Tune | Hum the song, no words |
| Hot Potato | Say one thing in the category and pass the phone before it blows |
| Who's Most Likely | Everyone points on three; the host taps who was picked |
| Spin the Challenge | Flick the prize wheel; it lands on a player, who gets a challenge |
| Fill the Verse | Host reads a KJV verse with a missing word; teams shout, or buzz on their own phones through Firstbuzz |
| Odd One Out | Four words, one doesn't belong |
| Hot Seat | The hot seat secretly becomes a Bible character (Everyday: a famous character or job) and answers questions in character until their team guesses |
| Ark Match | Memory cards: pair the animals two by two (Everyday: Memory Match) |

Also: players and teams (random or choose yourself) or individual play, a round length / question count for every game, one scoreboard for the night,
Party Night (a running order of games with standings and a podium), Kids mode,
Learn More cards with Bible references, your own word packs shared by link, WhatsApp or QR code,
a Bible / Everyday content switch on the main screen (no overlap between the two), four looks (Illustrated & Playful with Light, Dark or Match phone; Comic Splash; Arcade Night; Graffiti) and layouts for phones, iPads and Android tablets.

## Files

- `index.html` – the page and icons
- `css/app.css` – all styles and the four looks
- `js/data.js` – **word packs and prompts; edit freely** (format explained at the top)
- `js/i18n.js` – English and Kannada interface text
- `js/core.js` – saved settings, teams, scoring, sound and vibration
- `js/app.js` – menus, packs, settings, scoreboard, Party Night
- `js/games/` – the games
- `js/buzz.js` – phone buzzers: Huddle hosts a Firstbuzz room (needs internet)
- `sw.js` – offline support. **Raise `VERSION` every time you publish a change**; phones then show the Update bar.
- `update.js`, `about.js` – the same shared files as the other apps

## Tests

    node tests/logic.test.js

## Notes

- Scripture follows the King James Version (public domain).
- Kannada words and text should be checked by a Kannada speaker.
- iPhone: Safari has no vibration; Huddle uses the light haptic tap iOS allows, plus sound.

© 2026 Anderson Jones
