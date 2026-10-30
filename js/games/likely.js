/*
 * HUDDLE — Who's Most Likely. Read the prompt, count down from three,
 * everyone points. The host taps each person who was pointed at.
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$;

  H.game({
    id: 'likely', name: 'Who’s Most Likely', kind: 'party', tag: 'onePhone',
    desc: 'Everyone points on three. The app keeps count.',
    how: 'The host reads it out and counts down. Everyone points at once; the host taps who got pointed at.',
    start: function (view) {
      var g = H.games.likely;
      if (S.players.length < 3) { H.needSetup(view, g, t('needThree')); return; }
      var deck = H.deck(H.list('LIKELY')), cur = null, total = {}, rounds = 0;
      S.players.forEach(function (p) { total[p.id] = 0; });
      var limit = H.playCount('likely');
      function ask() {
        if (limit && rounds >= limit) { results(); return; }
        cur = deck.next(cur);
        view.innerHTML = H.bar(H.gname(g), t('round') + ' ' + (rounds + 1) + (limit ? ' / ' + limit : '')) +
          (rounds === 0 ? '<div class="card">' + H.pickerHTML('count', 'likely') + '</div>' : '') +
          '<div class="card center"><div class="sec">' + esc(t('whoLikely')) + '</div><p class="prompt">' + esc(cur.w) + '</p></div>' +
          '<div id="zone" class="center"><button class="btn big" type="button" id="cnt">' + esc(t('countIn')) + '</button></div>';
        if (rounds === 0) H.bindPicker(view, 'likely');
        $('#cnt', view).onclick = function () { limit = H.playCount('likely'); var pk = $('.pick', view); if (pk) pk.parentNode.remove(); count(); };
      }
      function count() {
        var z = $('#zone', view), n = 3;
        z.innerHTML = '<div class="count3">3</div>'; H.sfx('beep'); H.haptic(15);
        var c = H.every(function () {
          n--;
          if (n > 0) { z.innerHTML = '<div class="count3">' + n + '</div>'; H.sfx('beep'); H.haptic(15); return; }
          clearInterval(c); z.innerHTML = '<div class="count3">' + esc(t('point')) + '</div>'; H.sfx('good'); H.haptic([40, 30, 80]);
          H.later(vote, 900);
        }, 800);
      }
      function vote() {
        var now = {};
        var z = $('#zone', view);
        z.innerHTML = '<p class="hint">' + esc(t('tapWho')) + '</p><div class="vote" style="margin-top:8px">' + S.players.map(function (p) {
          return '<button type="button" data-p="' + p.id + '"><i style="background:' + p.color + '">' + esc(p.name[0]) + '</i><span>' + esc(p.name) + '</span><em></em></button>';
        }).join('') + '</div><div class="row" style="margin-top:10px"><button class="btn alt" type="button" id="undo">' + esc(t('undo')) + '</button><button class="btn" type="button" id="nx">' + esc(t('nextQ')) + ' ›</button></div>' +
          '<button class="link" type="button" id="fin" style="margin-top:6px">' + esc(t('finish')) + '</button>';
        var hist = [];
        function paint() { H.$$('[data-p]', z).forEach(function (b) { b.querySelector('em').textContent = now[b.dataset.p] || ''; }); }
        H.$$('[data-p]', z).forEach(function (b) { b.onclick = function () { now[b.dataset.p] = (now[b.dataset.p] || 0) + 1; hist.push(b.dataset.p); H.haptic(10); H.sfx('tick', .4); paint(); }; });
        $('#undo', z).onclick = function () { var id = hist.pop(); if (id) { now[id]--; paint(); } };
        function keep() { Object.keys(now).forEach(function (id) { total[id] += now[id]; }); rounds++; }
        $('#nx', z).onclick = function () { keep(); ask(); };
        $('#fin', z).onclick = function () { keep(); results(); };
      }
      function results() {
        var list = S.players.slice().sort(function (a, b) { return total[b.id] - total[a.id]; });
        var max = Math.max(1, total[list[0].id]);
        view.innerHTML = H.bar(H.gname(g), rounds + ' ' + t('rounds')) +
          '<div class="card"><div class="sec">' + esc(t('tallies')) + '</div><div class="tallies">' + list.map(function (p) {
            return '<div><span style="width:30%;min-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(p.name) + '</span><span class="b" style="width:' + (total[p.id] / max * 55) + '%;background:' + p.color + '"></span><b>' + total[p.id] + '</b></div>';
          }).join('') + '</div></div>' +
          (total[list[0].id] ? '<p class="hint">' + esc(t('mostPicked')) + ': ' + esc(list[0].name) + '</p>' : '') + H.endButtons('likely');
        if (total[list[0].id]) H.confetti();
      }
      ask();
    }
  });
})();
