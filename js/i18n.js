/*
 * HUDDLE — interface text in English and Kannada.
 * Add a key to both. Missing Kannada falls back to English.
 * Kannada text should be checked by a native speaker before release.
 */
(function () {
  'use strict';
  var EN = {
    pickGame: 'Pick a game', games: 'Games', all: 'All', words: 'Words', party: 'Party', quick: 'Quick-fire',
    players: 'Players', teams: 'Teams', packs: 'Word packs', settings: 'Settings', score: 'Scoreboard',
    partyNight: 'Party Night', partyNightSub: 'A running order of games and one scoreboard for the whole night',
    onePhone: '1 phone', passIt: 'Pass it', later: 'Later', done: 'Done', next: 'Next', start: 'Start', back: 'Back',
    playersTeams: 'Players & teams', addPlayer: 'Add player', playerName: 'Player name', remove: 'Remove',
    teamCount: 'Number of teams', howTeams: 'How to make teams', random: 'Randomise', manual: 'Choose myself',
    shuffle: 'Shuffle again', tapToMove: 'Tap a player to move them to the next team',
    needPlayers: 'Add at least 2 players first', needTeams: 'Every team needs at least one player',
    roundTime: 'Round time', sec: 'sec', got: 'Got it', pass: 'Pass', slip: 'Slip!', timeUp: 'Time’s up!',
    handTo: 'Give the phone to', dontLook: 'Don’t look at the screen yet', tapWhenReady: 'Tap when you’re ready',
    results: 'Results', learnMore: 'Learn more', playAgain: 'Play again', backToGames: 'Back to games',
    kids: 'Kids mode', kidsSub: 'Only easy words and gentle challenges', sound: 'Sounds', haptics: 'Vibration',
    learnCards: 'Learn More cards', learnCardsSub: 'Show the Bible reference and a short fact after each round',
    language: 'Language', look: 'Look', tilt: 'Tilt to answer', tiltTest: 'Test the tilt',
    myPack: 'Make my own pack', share: 'Share', addPack: 'Add this pack', on: 'On', off: 'Off',
    points: 'points', winner: 'Winner', tonight: 'Tonight', resetNight: 'Start a new night',
    spin: 'Spin', spinAgain: 'Spin again', landedOn: 'It landed on', showAnswer: 'Show answer',
    nextQ: 'Next question', whoWins: 'Who got it?', nobody: 'Nobody'
  };
  var KN = {
    pickGame: 'ಆಟ ಆರಿಸಿ', games: 'ಆಟಗಳು', all: 'ಎಲ್ಲಾ', words: 'ಪದಗಳು', party: 'ಪಾರ್ಟಿ', quick: 'ಚುರುಕು',
    players: 'ಆಟಗಾರರು', teams: 'ತಂಡಗಳು', packs: 'ಪದ ಪ್ಯಾಕ್‌ಗಳು', settings: 'ಸೆಟ್ಟಿಂಗ್ಸ್', score: 'ಅಂಕಪಟ್ಟಿ',
    partyNight: 'ಪಾರ್ಟಿ ರಾತ್ರಿ', partyNightSub: 'ಇಡೀ ರಾತ್ರಿಗೆ ಆಟಗಳ ಸರಣಿ ಮತ್ತು ಒಂದೇ ಅಂಕಪಟ್ಟಿ',
    onePhone: '1 ಫೋನ್', passIt: 'ಕೈ ಬದಲಿಸಿ', later: 'ನಂತರ', done: 'ಆಯಿತು', next: 'ಮುಂದೆ', start: 'ಆರಂಭಿಸಿ', back: 'ಹಿಂದೆ',
    playersTeams: 'ಆಟಗಾರರು ಮತ್ತು ತಂಡಗಳು', addPlayer: 'ಆಟಗಾರರನ್ನು ಸೇರಿಸಿ', playerName: 'ಹೆಸರು', remove: 'ತೆಗೆದುಹಾಕಿ',
    teamCount: 'ತಂಡಗಳ ಸಂಖ್ಯೆ', howTeams: 'ತಂಡ ಹೇಗೆ ಮಾಡುವುದು', random: 'ಯಾದೃಚ್ಛಿಕ', manual: 'ನಾನೇ ಆರಿಸುವೆ',
    shuffle: 'ಮತ್ತೆ ಬೆರೆಸಿ', tapToMove: 'ಆಟಗಾರರನ್ನು ಮುಂದಿನ ತಂಡಕ್ಕೆ ಸರಿಸಲು ಒತ್ತಿ',
    needPlayers: 'ಮೊದಲು ಕನಿಷ್ಠ 2 ಆಟಗಾರರನ್ನು ಸೇರಿಸಿ', needTeams: 'ಪ್ರತಿ ತಂಡದಲ್ಲಿ ಕನಿಷ್ಠ ಒಬ್ಬ ಆಟಗಾರ ಇರಬೇಕು',
    roundTime: 'ಸುತ್ತಿನ ಸಮಯ', sec: 'ಸೆ', got: 'ಸರಿ', pass: 'ಬಿಡು', slip: 'ತಪ್ಪಾಯಿತು!', timeUp: 'ಸಮಯ ಮುಗಿಯಿತು!',
    handTo: 'ಫೋನನ್ನು ಇವರಿಗೆ ಕೊಡಿ', dontLook: 'ಇನ್ನೂ ಪರದೆಯನ್ನು ನೋಡಬೇಡಿ', tapWhenReady: 'ಸಿದ್ಧವಾದಾಗ ಒತ್ತಿ',
    results: 'ಫಲಿತಾಂಶ', learnMore: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ', playAgain: 'ಮತ್ತೆ ಆಡಿ', backToGames: 'ಆಟಗಳಿಗೆ ಹಿಂದಿರುಗಿ',
    kids: 'ಮಕ್ಕಳ ಮೋಡ್', kidsSub: 'ಸುಲಭ ಪದಗಳು ಮತ್ತು ಸೌಮ್ಯ ಸವಾಲುಗಳು ಮಾತ್ರ', sound: 'ಧ್ವನಿ', haptics: 'ಕಂಪನ',
    learnCards: 'ಕಲಿಕೆ ಕಾರ್ಡ್‌ಗಳು', learnCardsSub: 'ಪ್ರತಿ ಸುತ್ತಿನ ನಂತರ ಬೈಬಲ್ ವಚನ ಸೂಚನೆ ಮತ್ತು ಚಿಕ್ಕ ಮಾಹಿತಿ',
    language: 'ಭಾಷೆ', look: 'ನೋಟ', tilt: 'ಓರೆ ಮಾಡಿ ಉತ್ತರಿಸಿ', tiltTest: 'ಓರೆ ಪರೀಕ್ಷಿಸಿ',
    myPack: 'ನನ್ನ ಸ್ವಂತ ಪ್ಯಾಕ್', share: 'ಹಂಚಿಕೊಳ್ಳಿ', addPack: 'ಈ ಪ್ಯಾಕ್ ಸೇರಿಸಿ', on: 'ಆನ್', off: 'ಆಫ್',
    points: 'ಅಂಕಗಳು', winner: 'ವಿಜೇತ', tonight: 'ಇಂದು ರಾತ್ರಿ', resetNight: 'ಹೊಸ ರಾತ್ರಿ ಆರಂಭಿಸಿ',
    spin: 'ತಿರುಗಿಸಿ', spinAgain: 'ಮತ್ತೆ ತಿರುಗಿಸಿ', landedOn: 'ನಿಂತದ್ದು', showAnswer: 'ಉತ್ತರ ತೋರಿಸಿ',
    nextQ: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ', whoWins: 'ಯಾರು ಸರಿಯಾಗಿ ಹೇಳಿದರು?', nobody: 'ಯಾರೂ ಇಲ್ಲ'
  };

  var EN2 = {
    add: 'Add', addSome: 'Add everyone who’s playing. Names are saved on this phone.', playersSub: 'Set up once, used in every game',
    playersLc: 'players', teamsLc: 'teams', wordsLc: 'words', packsLc: 'packs', noPlayers: 'Add players', noOneYet: 'No one yet',
    teamName: 'Team name', sameName: 'That name is already playing', tooMany: 'That’s the most players', setUp: 'Set up players',
    justPlay: 'Just play', justPlaySub: 'No names or team scores, just the game',
    needThree: 'This game needs at least 3 players',
    clueGiver: 'Clue-giver', guesser: 'Guesser', drawer: 'Drawer', hummer: 'Hummer',
    forbidNote: 'Only you look. Someone from another team watches for banned words.',
    oneNote: 'Only you look. One word per clue.', humNote: 'Only you look. Hum it, no words.',
    actNote: 'Don’t look! Hold it on your forehead, screen facing out.', drawNote: 'Only you peek at the word.',
    describe: 'Describe', oneWordOnly: 'One-word clues', humIt: 'Hum it', clue: 'Clue', endRound: 'End round',
    tapToFix: 'Tap a word to fix a mistake', nextTeam: 'Next team', finish: 'Finish',
    onForehead: 'Put it on your forehead', faceRoom: 'Hold it up facing the room',
    holdToPeek: 'Hold to peek', drawHere: 'Drawing pad', undo: 'Undo', clear: 'Clear', giveUp: 'Give up', guessed: 'Guessed it',
    potatoHow: 'Read the category, say one thing that fits and pass the phone on. No repeats!',
    potatoNoNames: 'Add players to keep lives and a winner.', potatoPass: 'Say one, pass it on!',
    category: 'Category', newCategory: 'New category', whoHeld: 'Who was holding it?', potatoHolder: 'Whoever’s holding it is out this round!', out: 'out',
    whoLikely: 'Who’s most likely to…', countIn: 'Count 3, 2, 1', point: 'Point!', tapWho: 'Tap each person who got pointed at',
    round: 'Round', rounds: 'rounds', tallies: 'Who got picked', mostPicked: 'Picked the most',
    wheel: 'Prize wheel', flickSub: 'Flick the wheel or tap Spin', flickHint: 'Drag it round and let go. The harder the flick, the longer it spins.',
    flickHarder: 'Flick it harder to spin', whoWillItBe: 'Who will it be?', spinning: 'Spinning…', skip: 'Skip', didIt: 'Done it',
    question: 'Question', hostReads: 'host reads it out',
    packsSub: 'Turn packs on or off for tonight', yours: 'yours', kidsNote: 'Kids mode shows only the easy words.',
    myPackSub: 'Your own words, to play and share', packName: 'Pack name', packNameEg: 'e.g. Youth camp 2026',
    wordsOnePerLine: 'Words, one per line', wordsEg: 'Pastor’s car\nChurch picnic\nSunday school',
    save: 'Save', edit: 'Edit', delete: 'Delete', deleteSure: 'Tap again to delete', needName: 'Give the pack a name', needWords: 'Add at least 3 words',
    shareSub: 'Friends open the link or scan the code to add this pack to their Huddle.', copyLink: 'Copy link', linkCopied: 'Link copied',
    waText: 'Here’s a Huddle word pack:', qrTooLong: 'This pack is too big for a QR code. Share the link instead.', qrOffline: 'The QR code needs internet the first time. Share the link instead.',
    importTitle: 'A word pack for you', importSub: 'Someone shared this Huddle pack', noThanks: 'No thanks', packAdded: 'Pack added', badLink: 'That pack link didn’t work',
    hapticsSub: 'Android vibrates; iPhone gives a light tap', tiltSub: 'Act It Out: tilt down for got it, up for pass',
    testFeel: 'Test sound and vibration', tiltTestSub: 'Hold the phone on your forehead and nod', tiltHold: 'Tap Start, then tilt the phone',
    tiltStart: 'Start', tiltNo: 'Motion is turned off. Use the buttons instead.', tiltNone: 'No motion found on this device. The buttons always work.',
    scoreSub: 'One scoreboard for the whole night', resetSure: 'Tap again to clear all points',
    nightOn: 'Your night is on. Tap to carry on.', readyToStart: 'Ready when you are', standings: 'Standings so far', upNext: 'Up next',
    playNext: 'Play', skipGame: 'Skip this game', endNight: 'End the night', pickGames: 'Pick tonight’s games', moveUp: 'Move up',
    appearance: 'Appearance', appearanceSub: 'Light or dark, for Illustrated & Playful', light: 'Light', dark: 'Dark', matchPhone: 'Match phone',
    sideBible: 'Bible', sideEveryday: 'Everyday', sideLabel: 'Content', sideBibleOn: 'Bible content on', sideEverydayOn: 'Everyday content on: no Bible or church words', sideNote: 'Switch to Everyday on the main screen for the other packs', sideNoteB: 'Switch to Bible on the main screen for the other packs',
    surprise: 'Surprise order', startNight: 'Start the night', nightNote: 'Points from every game add up on one scoreboard.', finalResults: 'Final results'
  };
  var KN2 = {
    add: 'ಸೇರಿಸಿ', addSome: 'ಆಡುವ ಎಲ್ಲರನ್ನೂ ಸೇರಿಸಿ. ಹೆಸರುಗಳು ಈ ಫೋನಿನಲ್ಲೇ ಉಳಿಯುತ್ತವೆ.', playersSub: 'ಒಮ್ಮೆ ಹೊಂದಿಸಿ, ಎಲ್ಲಾ ಆಟಗಳಲ್ಲಿ ಬಳಸಿ',
    playersLc: 'ಆಟಗಾರರು', teamsLc: 'ತಂಡಗಳು', wordsLc: 'ಪದಗಳು', packsLc: 'ಪ್ಯಾಕ್‌ಗಳು', noPlayers: 'ಆಟಗಾರರನ್ನು ಸೇರಿಸಿ', noOneYet: 'ಇನ್ನೂ ಯಾರೂ ಇಲ್ಲ',
    teamName: 'ತಂಡದ ಹೆಸರು', sameName: 'ಈ ಹೆಸರು ಈಗಾಗಲೇ ಇದೆ', tooMany: 'ಇನ್ನು ಸೇರಿಸಲು ಆಗದು', setUp: 'ಆಟಗಾರರನ್ನು ಹೊಂದಿಸಿ',
    justPlay: 'ಸುಮ್ಮನೆ ಆಡಿ', justPlaySub: 'ಹೆಸರು, ಅಂಕ ಇಲ್ಲದೆ ಆಟ ಮಾತ್ರ',
    needThree: 'ಈ ಆಟಕ್ಕೆ ಕನಿಷ್ಠ 3 ಆಟಗಾರರು ಬೇಕು',
    clueGiver: 'ಸುಳಿವು ಕೊಡುವವರು', guesser: 'ಊಹಿಸುವವರು', drawer: 'ಚಿತ್ರ ಬಿಡಿಸುವವರು', hummer: 'ಗುನುಗುವವರು',
    forbidNote: 'ನೀವು ಮಾತ್ರ ನೋಡಿ. ಬೇರೆ ತಂಡದವರು ನಿಷಿದ್ಧ ಪದಗಳನ್ನು ಗಮನಿಸುತ್ತಾರೆ.',
    oneNote: 'ನೀವು ಮಾತ್ರ ನೋಡಿ. ಪ್ರತಿ ಸುಳಿವಿಗೆ ಒಂದೇ ಪದ.', humNote: 'ನೀವು ಮಾತ್ರ ನೋಡಿ. ಪದಗಳಿಲ್ಲದೆ ಗುನುಗಿ.',
    actNote: 'ನೋಡಬೇಡಿ! ಪರದೆ ಹೊರಗೆ ಕಾಣುವಂತೆ ಹಣೆಗೆ ಹಿಡಿಯಿರಿ.', drawNote: 'ಪದವನ್ನು ನೀವು ಮಾತ್ರ ನೋಡಿ.',
    describe: 'ವಿವರಿಸಿ', oneWordOnly: 'ಒಂದು ಪದದ ಸುಳಿವು', humIt: 'ಗುನುಗಿ', clue: 'ಸುಳಿವು', endRound: 'ಸುತ್ತು ಮುಗಿಸಿ',
    tapToFix: 'ತಪ್ಪು ಸರಿಪಡಿಸಲು ಪದವನ್ನು ಒತ್ತಿ', nextTeam: 'ಮುಂದಿನ ತಂಡ', finish: 'ಮುಗಿಸಿ',
    onForehead: 'ಹಣೆಗೆ ಹಿಡಿಯಿರಿ', faceRoom: 'ಎಲ್ಲರಿಗೂ ಕಾಣುವಂತೆ ಹಿಡಿಯಿರಿ',
    holdToPeek: 'ನೋಡಲು ಒತ್ತಿ ಹಿಡಿಯಿರಿ', drawHere: 'ಚಿತ್ರ ಫಲಕ', undo: 'ರದ್ದು', clear: 'ಅಳಿಸಿ', giveUp: 'ಬಿಟ್ಟುಬಿಡಿ', guessed: 'ಸರಿಯಾಗಿ ಊಹಿಸಿದರು',
    potatoHow: 'ವಿಷಯ ಓದಿ, ಅದಕ್ಕೆ ಹೊಂದುವ ಒಂದು ಹೇಳಿ, ಫೋನ್ ಮುಂದಕ್ಕೆ ಕೊಡಿ. ಪುನರಾವರ್ತನೆ ಇಲ್ಲ!',
    potatoNoNames: 'ಜೀವಗಳು ಮತ್ತು ವಿಜೇತರಿಗಾಗಿ ಆಟಗಾರರನ್ನು ಸೇರಿಸಿ.', potatoPass: 'ಒಂದು ಹೇಳಿ, ಮುಂದಕ್ಕೆ ಕೊಡಿ!',
    category: 'ವಿಷಯ', newCategory: 'ಹೊಸ ವಿಷಯ', whoHeld: 'ಯಾರ ಕೈಯಲ್ಲಿ ಇತ್ತು?', potatoHolder: 'ಯಾರ ಕೈಯಲ್ಲಿದೆಯೋ ಅವರು ಈ ಸುತ್ತಿನಿಂದ ಹೊರಗೆ!', out: 'ಹೊರಗೆ',
    whoLikely: 'ಯಾರು ಹೆಚ್ಚಾಗಿ…', countIn: '3, 2, 1 ಎಣಿಸಿ', point: 'ತೋರಿಸಿ!', tapWho: 'ತೋರಿಸಲ್ಪಟ್ಟ ಪ್ರತಿಯೊಬ್ಬರನ್ನೂ ಒತ್ತಿ',
    round: 'ಸುತ್ತು', rounds: 'ಸುತ್ತುಗಳು', tallies: 'ಯಾರನ್ನು ಆರಿಸಲಾಯಿತು', mostPicked: 'ಹೆಚ್ಚು ಆರಿಸಲ್ಪಟ್ಟವರು',
    wheel: 'ಚಕ್ರ', flickSub: 'ಚಕ್ರವನ್ನು ತಳ್ಳಿ ಅಥವಾ ತಿರುಗಿಸಿ ಒತ್ತಿ', flickHint: 'ಎಳೆದು ಬಿಡಿ. ಜೋರಾಗಿ ತಳ್ಳಿದಷ್ಟು ಹೆಚ್ಚು ತಿರುಗುತ್ತದೆ.',
    flickHarder: 'ಇನ್ನೂ ಜೋರಾಗಿ ತಳ್ಳಿ', whoWillItBe: 'ಯಾರು ಆಗಬಹುದು?', spinning: 'ತಿರುಗುತ್ತಿದೆ…', skip: 'ಬಿಡಿ', didIt: 'ಮಾಡಿದರು',
    question: 'ಪ್ರಶ್ನೆ', hostReads: 'ನಿರೂಪಕರು ಓದುತ್ತಾರೆ',
    packsSub: 'ಇಂದಿನ ಆಟಕ್ಕೆ ಪ್ಯಾಕ್‌ಗಳನ್ನು ಆನ್ ಅಥವಾ ಆಫ್ ಮಾಡಿ', yours: 'ನಿಮ್ಮದು', kidsNote: 'ಮಕ್ಕಳ ಮೋಡ್‌ನಲ್ಲಿ ಸುಲಭ ಪದಗಳು ಮಾತ್ರ.',
    myPackSub: 'ನಿಮ್ಮ ಸ್ವಂತ ಪದಗಳು, ಆಡಲು ಮತ್ತು ಹಂಚಲು', packName: 'ಪ್ಯಾಕ್ ಹೆಸರು', packNameEg: 'ಉದಾ: ಯುವ ಶಿಬಿರ 2026',
    wordsOnePerLine: 'ಪದಗಳು, ಸಾಲಿಗೆ ಒಂದು', save: 'ಉಳಿಸಿ', edit: 'ಬದಲಿಸಿ', delete: 'ಅಳಿಸಿ', deleteSure: 'ಅಳಿಸಲು ಮತ್ತೆ ಒತ್ತಿ',
    needName: 'ಪ್ಯಾಕ್‌ಗೆ ಹೆಸರು ಕೊಡಿ', needWords: 'ಕನಿಷ್ಠ 3 ಪದಗಳನ್ನು ಸೇರಿಸಿ',
    shareSub: 'ಸ್ನೇಹಿತರು ಲಿಂಕ್ ತೆರೆದು ಅಥವಾ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಈ ಪ್ಯಾಕ್ ಸೇರಿಸಬಹುದು.', copyLink: 'ಲಿಂಕ್ ನಕಲಿಸಿ', linkCopied: 'ಲಿಂಕ್ ನಕಲಾಯಿತು',
    waText: 'ಇದೋ ಒಂದು Huddle ಪದ ಪ್ಯಾಕ್:', qrTooLong: 'ಈ ಪ್ಯಾಕ್ QR ಕೋಡ್‌ಗೆ ತುಂಬಾ ದೊಡ್ಡದು. ಲಿಂಕ್ ಹಂಚಿ.', qrOffline: 'ಮೊದಲ ಬಾರಿ QR ಕೋಡ್‌ಗೆ ಇಂಟರ್ನೆಟ್ ಬೇಕು. ಲಿಂಕ್ ಹಂಚಿ.',
    importTitle: 'ನಿಮಗಾಗಿ ಒಂದು ಪದ ಪ್ಯಾಕ್', importSub: 'ಯಾರೋ ಈ Huddle ಪ್ಯಾಕ್ ಹಂಚಿದ್ದಾರೆ', noThanks: 'ಬೇಡ', packAdded: 'ಪ್ಯಾಕ್ ಸೇರಿತು', badLink: 'ಈ ಪ್ಯಾಕ್ ಲಿಂಕ್ ಕೆಲಸ ಮಾಡಲಿಲ್ಲ',
    hapticsSub: 'Android ಕಂಪಿಸುತ್ತದೆ; iPhone ಹಗುರವಾಗಿ ತಟ್ಟುತ್ತದೆ', tiltSub: 'ಅಭಿನಯಿಸು: ಸರಿ ಆದರೆ ಕೆಳಗೆ, ಬಿಡಲು ಮೇಲೆ ಓರೆ',
    testFeel: 'ಧ್ವನಿ ಮತ್ತು ಕಂಪನ ಪರೀಕ್ಷಿಸಿ', tiltTestSub: 'ಫೋನನ್ನು ಹಣೆಗೆ ಹಿಡಿದು ತಲೆ ಆಡಿಸಿ', tiltHold: 'ಆರಂಭಿಸಿ ಒತ್ತಿ, ನಂತರ ಫೋನ್ ಓರೆ ಮಾಡಿ',
    tiltStart: 'ಆರಂಭಿಸಿ', tiltNo: 'ಚಲನೆ ಆಫ್ ಆಗಿದೆ. ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ.', tiltNone: 'ಈ ಸಾಧನದಲ್ಲಿ ಚಲನೆ ಸಿಗಲಿಲ್ಲ. ಬಟನ್‌ಗಳು ಯಾವಾಗಲೂ ಕೆಲಸ ಮಾಡುತ್ತವೆ.',
    scoreSub: 'ಇಡೀ ರಾತ್ರಿಗೆ ಒಂದೇ ಅಂಕಪಟ್ಟಿ', resetSure: 'ಎಲ್ಲಾ ಅಂಕ ಅಳಿಸಲು ಮತ್ತೆ ಒತ್ತಿ',
    nightOn: 'ನಿಮ್ಮ ರಾತ್ರಿ ನಡೆಯುತ್ತಿದೆ. ಮುಂದುವರಿಸಲು ಒತ್ತಿ.', readyToStart: 'ನೀವು ಸಿದ್ಧವಾದಾಗ', standings: 'ಇಲ್ಲಿಯವರೆಗಿನ ಅಂಕ', upNext: 'ಮುಂದಿನದು',
    playNext: 'ಆಡಿ', skipGame: 'ಈ ಆಟ ಬಿಡಿ', endNight: 'ರಾತ್ರಿ ಮುಗಿಸಿ', pickGames: 'ಇಂದಿನ ಆಟಗಳನ್ನು ಆರಿಸಿ', moveUp: 'ಮೇಲೆ ಸರಿಸಿ',
    appearance: 'ನೋಟದ ಬಣ್ಣ', appearanceSub: 'ಬೆಳಕು ಅಥವಾ ಕತ್ತಲು (ಚಿತ್ರಮಯ ನೋಟಕ್ಕೆ)', light: 'ಬೆಳಕು', dark: 'ಕತ್ತಲು', matchPhone: 'ಫೋನಿನಂತೆ',
    sideBible: 'ಬೈಬಲ್', sideEveryday: 'ದಿನನಿತ್ಯ', sideLabel: 'ವಿಷಯ', sideBibleOn: 'ಬೈಬಲ್ ವಿಷಯ ಆನ್', sideEverydayOn: 'ದಿನನಿತ್ಯ ವಿಷಯ ಆನ್: ಬೈಬಲ್ ಅಥವಾ ಸಭೆಯ ಪದಗಳಿಲ್ಲ', sideNote: 'ಇತರ ಪ್ಯಾಕ್‌ಗಳಿಗೆ ಮುಖ್ಯ ಪರದೆಯಲ್ಲಿ ದಿನನಿತ್ಯ ಆರಿಸಿ', sideNoteB: 'ಇತರ ಪ್ಯಾಕ್‌ಗಳಿಗೆ ಮುಖ್ಯ ಪರದೆಯಲ್ಲಿ ಬೈಬಲ್ ಆರಿಸಿ',
    surprise: 'ಅಚ್ಚರಿಯ ಕ್ರಮ', startNight: 'ರಾತ್ರಿ ಆರಂಭಿಸಿ', nightNote: 'ಎಲ್ಲಾ ಆಟಗಳ ಅಂಕಗಳು ಒಂದೇ ಅಂಕಪಟ್ಟಿಗೆ ಸೇರುತ್ತವೆ.', finalResults: 'ಅಂತಿಮ ಫಲಿತಾಂಶ'
  };
  Object.keys(EN2).forEach(function (k) { EN[k] = EN2[k]; });
  Object.keys(KN2).forEach(function (k) { KN[k] = KN2[k]; });
  // Game names and one-line descriptions
  var GAMES_KN = {
    act: ['ಅಭಿನಯಿಸು', 'ಹಣೆಗೆ ಫೋನ್ ಇಡಿ. ಸರಿ ಆದರೆ ಕೆಳಗೆ, ಬಿಡಲು ಮೇಲೆ ಓರೆ ಮಾಡಿ.'],
    forbid: ['ನಿಷಿದ್ಧ ಪದಗಳು', 'ನಿಷೇಧಿತ ಪದಗಳನ್ನು ಹೇಳದೆ ವಿವರಿಸಿ.'],
    one: ['ಒಂದೇ ಪದ', 'ಪ್ರತಿ ಸುಳಿವಿಗೆ ಒಂದೇ ಪದ.'],
    draw: ['ಚಿತ್ರ ಬಿಡಿಸು', 'ಸಮಯ ಮುಗಿಯುವ ಮೊದಲು ಪದವನ್ನು ಚಿತ್ರಿಸಿ.'],
    hum: ['ರಾಗ ಗುನುಗು', 'ಹಾಡನ್ನು ಗುನುಗಿ, ತಂಡ ಹೆಸರು ಹೇಳಲಿ.'],
    potato: ['ಬಿಸಿ ಬಾಂಬ್', 'ಒಂದು ಹೇಳಿ, ಮುಂದಕ್ಕೆ ಕೊಡಿ. ಸಿಡಿದಾಗ ನಿಮ್ಮ ಕೈಯಲ್ಲಿ ಇರಬಾರದು.'],
    likely: ['ಯಾರು ಹೆಚ್ಚು?', 'ಮೂರು ಎಣಿಸಿ ಎಲ್ಲರೂ ಬೆರಳು ತೋರಿಸಿ.'],
    spin: ['ಚಕ್ರ ತಿರುಗಿಸು', 'ಆಟಗಾರ ಮತ್ತು ಸವಾಲಿಗಾಗಿ ಚಕ್ರ ತಿರುಗಿಸಿ.'],
    verse: ['ವಚನ ಪೂರ್ಣಗೊಳಿಸು', 'ಬೈಬಲ್ ವಚನವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.'],
    verseE: ['ಗಾದೆ ಪೂರ್ಣಗೊಳಿಸು', 'ಪ್ರಸಿದ್ಧ ಗಾದೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.'],
    odd: ['ಬೇರೆಯದು ಯಾವುದು?', 'ನಾಲ್ಕರಲ್ಲಿ ಹೊಂದದ್ದನ್ನು ಹುಡುಕಿ.']
  };
  window.HuddleI18n = { en: EN, kn: KN, gamesKn: GAMES_KN };
})();
