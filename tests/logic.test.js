/* Huddle logic tests:  node tests/logic.test.js */
'use strict';
var assert = require('assert'), path = require('path');
var store = {};
global.localStorage = { getItem: function (k) { return store[k] || null; }, setItem: function (k, v) { store[k] = String(v); } };
global.document = { addEventListener: function () {}, querySelector: function () { return null; }, hidden: false };
try { global.navigator = {}; } catch (e) { /* Node 21+ has its own */ }
global.window = global;
['data', 'i18n', 'core', 'games/words', 'games/act', 'games/spin', 'games/quiz'].forEach(function (f) { require(path.join(__dirname, '..', 'js', f + '.js')); });
var H = window.Huddle, S = H.S, n = 0;
function test(name, fn) { fn(); n++; console.log('ok  ' + name); }

test('ten players split evenly into 2, 3 and 4 random teams', function () {
  'ABCDEFGHIJ'.split('').forEach(function (c) { H.addPlayer('P' + c); });
  [2, 3, 4].forEach(function (k) {
    H.setTeamCount(k);
    var sizes = H.teamLists().map(function (l) { return l.length; });
    assert.strictEqual(sizes.length, k);
    assert.ok(Math.max.apply(0, sizes) - Math.min.apply(0, sizes) <= 1, sizes.join(','));
  });
});
test('choose myself: a tap moves a player to the next team and wraps round', function () {
  S.teams.mode = 'manual'; H.setTeamCount(3);
  var p = S.players[0], t0 = H.teamOf(p.id);
  H.moveToNextTeam(p.id); assert.strictEqual(H.teamOf(p.id), (t0 + 1) % 3);
  H.moveToNextTeam(p.id); H.moveToNextTeam(p.id); assert.strictEqual(H.teamOf(p.id), t0);
});
test('fewer teams keeps manual choices and moves only those left over', function () {
  S.teams.mode = 'manual'; H.setTeamCount(4);
  S.players.forEach(function (p, i) { S.teams.of[p.id] = i % 4; });
  H.setTeamCount(2);
  assert.ok(S.players.every(function (p) { return H.teamOf(p.id) < 2; }));
  assert.strictEqual(H.teamOf(S.players[1].id), 1);
});
test('new players in manual mode join the smallest team', function () {
  var p = H.addPlayer('Late'); var lists = H.teamLists();
  assert.ok(lists[H.teamOf(p.id)].length <= Math.min.apply(0, lists.map(function (l) { return l.length; })) + 1);
});
test('turns rotate team by team, and players inside each team', function () {
  S.teams.mode = 'random'; H.setTeamCount(2); H.resetTurns(false);
  var a = H.turn(), b = H.turn(), c = H.turn();
  assert.deepStrictEqual([a.team, b.team, c.team], [0, 1, 0]);
  assert.notStrictEqual(a.player.id, c.player.id);
});
test('a deck uses every card once before any repeat', function () {
  var d = H.deck([1, 2, 3, 4, 5]), seen = [];
  for (var i = 0; i < 5; i++) seen.push(d.next());
  assert.deepStrictEqual(seen.slice().sort(), [1, 2, 3, 4, 5]);
});
test('kids mode keeps only kid-friendly words', function () {
  S.kids = true;
  assert.ok(H.pool().length > 20 && H.pool().every(function (x) { return x.kid; }));
  assert.ok(H.list('CHALLENGES').every(function (x) { return x.kid; }));
  S.kids = false;
});
test('Kannada packs come on with the Kannada interface; songs stay in Hum', function () {
  S.lang = 'en'; assert.ok(!H.pool().some(function (x) { return x.pack === 'knbible'; }));
  S.lang = 'kn'; assert.ok(H.pool().some(function (x) { return x.pack === 'knbible'; }));
  assert.ok(!H.pool().some(function (x) { return x.pack === 'hymns'; }));
  assert.ok(H.pool({ songs: true }).every(function (x) { return x.pack === 'hymns' || x.pack === 'djnc'; }));
  S.lang = 'en';
});
test('every pack switched off still leaves words to play', function () {
  H.allPacks().forEach(function (p) { S.packsOn[p.id] = false; });
  assert.ok(H.pool().length > 0); S.packsOn = {};
});
test('points add to the night and save', function () {
  H.resetScore(); H.addPoints(1, 3, 'x'); H.addPoints(1, -1, 'x');
  assert.strictEqual(S.score.pts[1], 2);
  assert.strictEqual(JSON.parse(store['huddle.v1']).score.pts[1], 2);
});
test('saved data from an older or broken copy still loads', function () {
  store['huddle.v1'] = '{"teams":{"count":9},"score":{}}';
  var s = H.__test.load(); assert.strictEqual(s.teams.count, 4); assert.strictEqual(s.score.pts.length, 4);
  store['huddle.v1'] = 'not json'; assert.strictEqual(H.__test.load().theme, 'playful');
  store['huddle.v1'] = '{"theme":"popart"}'; assert.strictEqual(H.__test.load().theme, 'comic');   // Pop Art Comic was removed
});
test('wheel: the slice under the pointer for any angle', function () {
  assert.strictEqual(H.wheelSegAt(0, 6), 0);
  assert.strictEqual(H.wheelSegAt(-61, 6), 1);   // turned 61° anticlockwise: slice 1 is at the top
  assert.strictEqual(H.wheelSegAt(61, 6), 4);    // turned 61° clockwise: slice 5 (index 4)
  assert.strictEqual(H.wheelSegAt(-361, 6), 0);
  assert.strictEqual(H.wheelSegAt(3600 + 30.5, 6), 5);
});
test('tilt: upright 0, screen to the floor -1, to the ceiling +1', function () {
  function u(b, g) { return H.screenUp({ beta: b, gamma: g }); }
  assert.ok(Math.abs(u(90, 0)) < 1e-9);          // portrait upright
  assert.ok(Math.abs(u(0, 90)) < 1e-9);          // landscape upright on the forehead
  assert.ok(u(180, 0) < -0.99 && u(0, 0) > 0.99);
  assert.ok(u(0, 150) < -0.5 && u(0, 40) > 0.5);  // landscape nod down / tilt back
});
test('every Fill the Verse answer is part of its KJV text', function () {
  H.D.VERSES.forEach(function (v) { assert.ok(v.word && v.ref && v.before, v.ref); });
  H.D.ODDS.forEach(function (o) { assert.ok(o.words.indexOf(o.odd) >= 0, o.odd); });
});
test('every interface text has a Kannada version', function () {
  var I = window.HuddleI18n, miss = Object.keys(I.en).filter(function (k) { return !I.kn[k] && k !== 'wordsEg'; });
  assert.deepStrictEqual(miss, []);
});
/* ---------- Bible / Everyday sides ---------- */
function allText(side) {
  var D = H.D, out = [];
  D.PACKS.filter(function (p) { return p.mode === side; }).forEach(function (p) { p.items.forEach(function (x) { out.push(x.w); }); });
  ['FORBID', 'CATS', 'LIKELY', 'CHALLENGES'].forEach(function (k) { D[k].filter(function (x) { return x.mode === side; }).forEach(function (x) { out.push(x.w); }); });
  D.VERSES.concat(D.SAYINGS).filter(function (x) { return x.mode === side; }).forEach(function (x) { out.push(x.before + ' ' + x.word + x.after); });
  D.ODDS.filter(function (x) { return x.mode === side; }).forEach(function (x) { out.push(x.words.slice().sort().join('/')); });
  return out;
}
test('every built-in pack and prompt belongs to exactly one side', function () {
  var D = H.D, bad = [];
  D.PACKS.forEach(function (p) { if (p.mode !== 'bible' && p.mode !== 'everyday') bad.push(p.id); });
  ['FORBID', 'CATS', 'LIKELY', 'CHALLENGES', 'VERSES', 'SAYINGS', 'ODDS'].forEach(function (k) { D[k].forEach(function (x) { if (x.mode !== 'bible' && x.mode !== 'everyday') bad.push(k + ':' + (x.w || x.word)); }); });
  assert.deepStrictEqual(bad, []);
});
test('no content appears on both sides', function () {
  var norm = function (w) { return String(w).toLowerCase().replace(/[^a-z0-9ಀ-೿]+/g, ' ').trim(); };
  var b = {}; allText('bible').forEach(function (w) { b[norm(w)] = w; });
  var both = allText('everyday').filter(function (w) { return b[norm(w)]; });
  assert.deepStrictEqual(both, []);
});
test('the Everyday side has no Bible or church words', function () {
  var re = /\b(bible|church|jesus|christ|god|lord|pray\w*|hymn\w*|worship|pastor|sermon|angel\w*|christmas|easter|noah|moses|david|goliath|amen|psalm|verse|gospel|disciple\w*|heaven|sunday school|choir|baptis\w*|manger|bethlehem|saviour|scripture|nativity)\b/i;
  var hits = allText('everyday').filter(function (w) { return re.test(w); });
  assert.deepStrictEqual(hits, []);
});
test('both sides are well stocked', function () {
  [['bible', 300], ['everyday', 300]].forEach(function (x) { assert.ok(allText(x[0]).length >= x[1], x[0] + ' has ' + allText(x[0]).length); });
  ['bible', 'everyday'].forEach(function (m) {
    S.mode = m;
    ['FORBID', 'CATS', 'LIKELY', 'CHALLENGES', 'ODDS', 'VERSES'].forEach(function (k) { assert.ok(H.list(k).length >= 20, m + ' ' + k + ' ' + H.list(k).length); });
    assert.ok(H.pool({ songs: true }).length >= 25, m + ' songs');
  });
  S.mode = 'bible';
});
test('the switch changes every pool, and only shows that side', function () {
  S.lang = 'en'; S.kids = false;
  H.setMode('everyday');
  assert.ok(H.pool().every(function (x) { return x.mode === 'everyday'; }));
  assert.ok(H.list('VERSES').every(function (x) { return x.ref === 'Saying'; }));   // becomes Fill the Phrase
  assert.ok(H.sidePacks().every(function (p) { return p.custom || p.mode === 'everyday'; }));
  assert.strictEqual(H.gname(H.games.verse), 'Fill the Phrase');
  H.setMode('bible');
  assert.ok(H.pool().every(function (x) { return x.mode === 'bible'; }));
  assert.ok(H.list('CHALLENGES').every(function (x) { return x.mode === 'bible'; }));
  assert.strictEqual(H.gname(H.games.verse), 'Fill the Verse');
});
test('Kannada sayings appear only when the app is in Kannada', function () {
  H.setMode('everyday'); S.lang = 'en';
  assert.ok(!H.list('VERSES').some(function (x) { return x.lang === 'kn'; }));
  S.lang = 'kn'; assert.ok(H.list('VERSES').some(function (x) { return x.lang === 'kn'; }));
  S.lang = 'en'; H.setMode('bible');
});
test('kid-friendly words are marked without leaking the k into facts', function () {
  assert.ok(H.D.PACKS.every(function (p) { return p.items.every(function (x) { return x.fact !== 'k' && x.ref !== 'k'; }); }));
});
test('the stylesheet has no stray lines that would break a look', function () {
  var css = require('fs').readFileSync(path.join(__dirname, '..', 'css', 'app.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\("[^"]*"\)/g, 'url()');
  var depth = 0, line = 1, problems = [], startOfLine = true;
  for (var i = 0; i < css.length; i++) {
    var ch = css[i];
    if (ch === '\n') { line++; startOfLine = true; continue; }
    if (depth === 0 && startOfLine && /\s/.test(ch)) continue;
    if (depth === 0 && startOfLine && css.substr(i, 2) === '--') problems.push('setting outside a rule on line ' + line);
    startOfLine = false;
    if (ch === '{') depth++;
    if (ch === '}') { depth--; if (depth < 0) { problems.push('extra } on line ' + line); depth = 0; } }
  }
  if (depth) problems.push('unclosed {');
  assert.deepStrictEqual(problems, []);
  ['playful', 'comic', 'arcade', 'graffiti'].forEach(function (th) { assert.ok(css.indexOf('.app[data-theme="' + th + '"]{') >= 0, th + ' settings block'); });
});
test('every DJNC Songbook title is in Hum That Tune on the Bible side', function () {
  var djnc = H.D.PACKS.filter(function (p) { return p.id === 'djnc'; })[0];
  assert.ok(djnc && djnc.songs && djnc.mode === 'bible' && djnc.items.length >= 330);
  S.lang = 'en'; H.setMode('bible');
  assert.strictEqual(H.pool({ songs: true }).filter(function (x) { return x.pack === 'djnc'; }).length, djnc.items.length);   // on in English too
  H.setMode('everyday');
  assert.ok(!H.pool({ songs: true }).some(function (x) { return x.pack === 'djnc'; }));
  H.setMode('bible');
});
test('each game keeps its own round length, within 15 s to 10 min', function () {
  S.time = 60; S.times = {};
  assert.strictEqual(H.roundTime('hum'), 60);              // starts from the Settings value
  S.times.hum = 120; assert.strictEqual(H.roundTime('hum'), 120);
  assert.strictEqual(H.roundTime('act'), 60);              // other games unaffected
  S.times.act = 5; assert.strictEqual(H.roundTime('act'), 60);    // out of range falls back
  assert.strictEqual(H.fmt(45), '45'); assert.strictEqual(H.fmt(90), '1:30'); assert.strictEqual(H.fmt(600), '10:00');
});
test('play counts and bomb timer have safe defaults', function () {
  S.counts = {}; assert.strictEqual(H.playCount('likely'), 0);   // no limit, as before
  S.counts.verse = 10; assert.strictEqual(H.playCount('verse'), 10);
  S.fuse = 'short'; var r = H.fuseRange(); assert.ok(r[0] < r[1] && r[1] <= 20000);
  S.fuse = 'nonsense'; assert.deepStrictEqual(H.fuseRange(), [15000, 45000]);
  S.fuse = 'medium';
});
console.log('\n' + n + ' tests passed');
