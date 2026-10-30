/*
 * HUDDLE — Hot Seat. The player in the hot seat secretly becomes a Bible
 * character (Everyday side: a famous character or a job). Their team fires
 * questions and the hot seat answers in character, without saying the name.
 * Guess it quickly for more points: 3 in the first third of the time, then 2, then 1.
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$;

  function people() {
    if (H.mode() === 'everyday') return H.list('SEAT_E');
    var p = H.D.PACKS.filter(function (x) { return x.id === 'bchar'; })[0];
    return p.items.filter(function (x) { return !S.kids || x.kid; });
  }

  H.game({
    id: 'seat', name: 'Hot Seat', kind: 'words', tag: 'onePhone', team: true,
    desc: 'Answer rapid-fire questions as a secret Bible character.',
    how: 'The hot seat sees a secret Bible character. Their team fires questions; they answer in character without saying the name until the team guesses.',
    everyday: { name: 'Hot Seat', desc: 'Answer rapid-fire as a secret famous character or job.', how: 'The hot seat sees a secret character. Their team fires questions; they answer in character without saying the name until the team guesses.' },
    start: function (view) {
      var g = H.games.seat, deck = H.deck(people()), qdeck = H.deck(H.list('SEAT_Q')), cur = null;
      function next() {
        var tr = H.turn();
        H.handTurn(view, tr, t('inHotSeat'), t('seatNote'), function () { secret(tr); }, null, 'seat');
      }
      // 1. only the hot seat sees who they are
      function secret(tr) {
        cur = deck.next(cur);
        view.innerHTML = H.bar(H.gname(g), t('onlyHotSeat')) +
          '<div class="word"><div><div class="k">' + esc(t('youAre')) + '</div><div class="big">' + esc(cur.w) + '</div>' +
          (cur.ref ? '<p style="margin:10px 0 0;font-weight:700">' + esc(cur.ref) + (cur.fact ? ' · ' + esc(cur.fact) : '') + '</p>' : '') + '</div></div>' +
          '<p class="hint">' + esc(t('seatHint')) + '</p>' +
          '<button class="btn big" type="button" id="hide">' + esc(t('hideGive')) + '</button>';
        $('#hide', view).onclick = function () { H.haptic(10); round(tr); };
      }
      // 2. the team asks questions against the clock
      function round(tr) {
        var T = H.roundTime('seat'), left = T, cd;
        H.wake(true);
        view.innerHTML = H.bar(H.gname(g), tr.team >= 0 ? H.fill(t('seatWho'), { name: tr.player ? tr.player.name : H.teamName(tr.team) }) : '') +
          '<div class="meta"><span class="timer" id="tm">' + H.fmt(T) + '</span><span id="worth"></span></div><div class="bar"><i id="tb" style="width:100%"></i></div>' +
          '<div class="card center stack"><div class="sec" style="margin:0 auto">' + esc(t('askThis')) + '</div><div class="prompt" id="q"></div>' +
          '<button class="btn alt sm" type="button" id="nq" style="align-self:center">' + esc(t('anotherQ')) + '</button></div>' +
          '<p class="hint">' + esc(t('seatRule')) + '</p>' +
          '<button class="btn big" type="button" id="got">' + H.svg('check') + esc(t('guessed')) + '</button>' +
          '<button class="btn alt" type="button" id="give">' + esc(t('giveUp')) + '</button>';
        var q = null;
        function ask() { q = qdeck.next(q); $('#q', view).textContent = q.w; H.haptic(6); }
        function worth() { return left > T * 2 / 3 ? 3 : left > T / 3 ? 2 : 1; }
        function paintWorth() { $('#worth', view).textContent = H.fill(t('worth'), { n: worth() }); }
        ask(); paintWorth();
        $('#nq', view).onclick = ask;
        function end(ok) {
          cd.stop(); H.wake(false);
          var pts = ok ? worth() : 0;
          if (ok && tr.team >= 0) H.addPoints(tr.team, pts, 'seat');
          if (ok) { H.sfx('win'); H.confetti(); } else H.sfx('end');
          view.innerHTML = H.bar(H.gname(g), tr.team >= 0 ? H.turnLabel(tr) : t('results')) +
            '<div class="card center stack"><div class="sec" style="margin:0 auto">' + esc(t('theyWere')) + '</div><div class="big">' + esc(cur.w) + '</div>' +
            '<p style="margin:0;font-weight:800">' + esc(ok ? (tr.team >= 0 ? '+' + pts + ' ' + H.teamName(tr.team) : t('guessed') + '!') : t('notGuessed')) + '</p></div>' +
            H.learnHTML([cur]) +
            '<button class="btn big" type="button" id="nx">' + esc(tr.team >= 0 ? t('nextPlayer') : t('playAgain')) + ' ›</button>' +
            '<button class="btn alt" type="button" id="fin">' + esc(t('finish')) + '</button>';
          $('#nx', view).onclick = next;
          $('#fin', view).onclick = function () { H.go('done', { g: g }); };
        }
        $('#got', view).onclick = function () { end(true); };
        $('#give', view).onclick = function () { end(false); };
        cd = H.countdown(T, function (l) { left = l; $('#tm', view).textContent = H.fmt(l); $('#tb', view).style.width = (l / T * 100) + '%'; paintWorth(); }, function () { end(false); });
      }
      H.withTeams(view, g, next);
    }
  });
})();
