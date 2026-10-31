/*
 * HUDDLE — Ark Match (Bible side) / Memory Match (Everyday side).
 * Face-down cards in pairs. Players or teams take turns flipping two.
 * A pair scores a point and you go again; a miss passes the turn.
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$;
  var SIZES = [6, 8, 12];
  var FLIP = 1000;   // ms for one card to turn over (keep in step with .minner in app.css)

  H.game({
    id: 'match', name: 'Ark Match', kind: 'party', tag: 'onePhone',
    desc: 'Flip the cards and pair the animals, two by two.',
    how: 'Take turns flipping two cards. Find a pair and you score and go again. Miss, and it’s the next turn.',
    everyday: { name: 'Memory Match', desc: 'Flip two cards at a time and find the pairs.', how: 'Take turns flipping two cards. Find a pair and you score and go again. Miss, and it’s the next turn.' },
    start: function (view) {
      var g = H.games.match, sides = H.teamsReady() ? 0 : H.sideCount();   // 0 = just play, no turns
      var pairs = SIZES.indexOf(+S.counts.match) >= 0 ? +S.counts.match : 8;
      function setup() {
        view.innerHTML = H.bar(H.gname(g), H.gdesc(g)) +
          '<div class="card stack"><div class="pick"><div class="pick-lbl">' + esc(t('howManyPairs')) + '</div><div class="chips wrap pick-row">' +
          SIZES.map(function (n) { return '<button class="chip" type="button" data-pairs="' + n + '" aria-pressed="' + (n === pairs) + '">' + n + ' ' + esc(t('pairs')) + '</button>'; }).join('') + '</div></div>' +
          (sides ? '' : '<p class="hint" style="margin:0">' + esc(t('matchNoNames')) + '</p>') + '</div>' +
          '<button class="btn big" type="button" id="go">' + esc(t('start')) + '</button>';
        H.$$('[data-pairs]', view).forEach(function (b) { b.onclick = function () { pairs = +b.dataset.pairs; S.counts.match = pairs; H.save(); H.$$('[data-pairs]', view).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); H.haptic(8); }; });
        $('#go', view).onclick = function () { H.audioOn(); play(); };
      }
      function play() {
        var set = H.shuffle(H.list('MATCH')).slice(0, pairs), cards = H.shuffle(set.concat(set)).map(function (c, i) { return { c: c, i: i, up: false, done: false }; });
        var turn = 0, open = [], busy = false, found = {}, moves = 0, left = pairs;
        for (var k = 0; k < sides; k++) found[k] = 0;
        var cols = pairs === 12 ? 6 : 4;   // 12, 16 or 24 cards: 3, 4 or 4 rows
        view.innerHTML = H.bar(H.gname(g), '') +
          '<div class="mturn" id="mturn"></div>' +
          '<div class="mgrid' + (cols === 6 ? ' dense' : '') + '" style="--cols:' + cols + '" id="mgrid">' + cards.map(function (x) {
            // a div, not a <button>: Safari flattens 3D turns inside buttons, so only the picture would swap
            return '<div class="mcard" role="button" tabindex="0" data-i="' + x.i + '" aria-label="' + esc(t('card')) + '"><span class="minner"><span class="mback">' + H.svg('match', 26) + '</span><span class="mface"><span class="pic">' + x.c.pic + '</span><small>' + esc(x.c.w) + '</small></span></span></div>';
          }).join('') + '</div>' +
          '<button class="link" type="button" id="fin">' + esc(t('finish')) + '</button>';
        var grid = $('#mgrid', view);
        function banner() {
          var el = $('#mturn', view);
          if (!sides) { el.innerHTML = '<b>' + esc(t('moves')) + ': ' + moves + '</b><span>' + esc(t('pairsLeft')) + ': ' + left + '</span>'; return; }
          el.style.setProperty('--tc', H.teamColor(turn));
          el.innerHTML = '<b>' + esc(H.fill(t('teamTurn'), { team: H.teamName(turn) })) + '</b><span>' + Object.keys(found).map(function (k) { return '<i style="background:' + H.teamColor(+k) + '"></i>' + found[k]; }).join(' ') + '</span>';
        }
        grid.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.mcard')) { e.preventDefault(); e.target.closest('.mcard').click(); } });
        grid.addEventListener('click', function (e) {
          var b = e.target.closest('.mcard'); if (!b || busy) return;
          var x = cards[+b.dataset.i]; if (x.up || x.done) return;
          x.up = true; b.classList.add('up'); open.push(x); H.sfx('tick', .5); H.haptic(8);
          if (open.length < 2) return;
          moves++; busy = true;
          var a = open[0], c = open[1]; open = [];
          if (a.c === c.c) {
            H.later(function () {   // after the second card has turned over
              a.done = c.done = true; cell(a).classList.add('done'); cell(c).classList.add('done');
              left--; H.sfx('good'); H.haptic([20, 30, 40]);
              if (sides) { found[turn]++; H.addPoints(turn, 1, 'match'); }
              busy = false; banner();
              if (!left) H.later(finish, 700);
            }, FLIP + 80);
          } else {
            // both stay face up for a moment, turn back over (FLIP ms), then the turn passes
            H.later(function () {
              a.up = c.up = false; cell(a).classList.remove('up'); cell(c).classList.remove('up');
              H.sfx('pass');
              H.later(function () { if (sides) turn = (turn + 1) % sides; busy = false; banner(); }, FLIP);
            }, FLIP + 900);
          }
          banner();
        });
        function cell(x) { return grid.querySelector('[data-i="' + x.i + '"]'); }
        $('#fin', view).onclick = finish;
        function finish() {
          var best = -1, who = [];
          Object.keys(found).forEach(function (k) { if (found[k] > best) { best = found[k]; who = [+k]; } else if (found[k] === best) who.push(+k); });
          H.sfx('win'); H.confetti();
          view.innerHTML = H.bar(H.gname(g), t('results')) +
            '<div class="card center stack"><div class="sec" style="margin:0 auto">' + esc(left ? t('stopped') : t('allFound')) + '</div>' +
            (sides ? '<div class="big" style="font-size:34px">' + esc(best > 0 ? who.map(H.teamName).join(' & ') : t('nobody')) + '</div><p class="mute" style="margin:0">' + esc(best + ' ' + t('pairs')) + '</p>'
              : '<div class="bigscore">' + moves + '</div><p class="mute" style="margin:0">' + esc(t('moves')) + '</p>') + '</div>' +
            (sides ? Object.keys(found).map(function (k) { return '<div class="score-row" style="--tc:' + H.teamColor(+k) + '"><span class="sw"></span><b>' + esc(H.teamName(+k)) + '</b><span class="pts">' + found[k] + '</span></div>'; }).join('') : '') +
            (H.mode() === 'bible' ? H.learnHTML([{ w: t('twoByTwo'), ref: 'Genesis 7:9', fact: t('twoByTwoFact') }]) : '') +
            H.endButtons('match');
        }
        banner();
      }
      setup();
    }
  });
})();
