/*
 * HUDDLE — quick-fire quiz games read out by a host:
 * Fill the Verse (KJV) — Fill the Phrase on the Everyday side — and Odd One Out. Teams shout; the host awards the point.
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$;

  function quiz(view, g, deck, render, reveal, learnOf) {
    var cur = null, n = 0;
    function award() {
      if (H.isQuick()) return '<div class="row"><button class="btn" type="button" id="nxq">' + esc(t('nextQ')) + ' ›</button></div>';
      var b = '';
      for (var i = 0; i < S.teams.count; i++) b += '<button class="btn" type="button" data-t="' + i + '" style="--tc:' + H.teamColor(i) + '">+1 ' + esc(H.teamName(i)) + '</button>';
      return '<div class="sec center" style="margin:0">' + esc(t('whoWins')) + '</div><div class="award">' + b + '</div><button class="btn alt" type="button" data-t="-1">' + esc(t('nobody')) + '</button>';
    }
    function ask() {
      cur = deck.next(cur); n++;
      view.innerHTML = H.bar(H.gname(g), t('question') + ' ' + n + ' · ' + t('hostReads')) +
        '<div class="card stack">' + render(cur) + '</div>' +
        '<div id="ans"><button class="btn b2" type="button" id="show">' + esc(t('showAnswer')) + '</button></div>' +
        '<button class="link" type="button" id="fin">' + esc(t('finish')) + '</button>';
      $('#show', view).onclick = function () {
        reveal(cur); H.sfx('good'); H.haptic(20);
        var a = $('#ans', view); a.className = 'stack'; a.innerHTML = (learnOf ? H.learnHTML([learnOf(cur)]) : '') + award();
        H.$$('[data-t]', a).forEach(function (b) { b.onclick = function () { var k = +b.dataset.t; if (k >= 0) { H.addPoints(k, 1, g.id); H.toast('+1 ' + H.teamName(k)); H.sfx('win'); } ask(); }; });
        var nq = $('#nxq', a); if (nq) nq.onclick = ask;
      };
      $('#fin', view).onclick = function () { H.go('done', { g: g }); };
    }
    ask();
  }

  H.game({
    id: 'verse', name: 'Fill the Verse', kind: 'quick', tag: 'onePhone', team: true,
    desc: 'Finish the Bible verse. Teams race to answer.',
    everyday: { name: 'Fill the Phrase', desc: 'Finish the famous saying. Teams race to answer.', how: 'The host reads the saying out. First team to shout the missing word gets the point.' },
    how: 'The host reads the verse out. First team to shout the missing word gets the point.',
    start: function (view) {
      var g = H.games.verse, deck = H.deck(H.list('VERSES'));
      H.withTeams(view, g, function () {
        quiz(view, g, deck, function (v) {
          return '<p class="verse">' + esc(v.before) + ' <span class="blank" id="vb">&nbsp;</span>' + esc(v.after) + '</p><div class="center"><span class="ref">' + esc(v.ref) + (v.mode === 'bible' ? ' · KJV' : '') + '</span></div>';
        }, function (v) { $('#vb', view).textContent = v.word; },
        null);
      });
    }
  });

  H.game({
    id: 'odd', name: 'Odd One Out', kind: 'quick', tag: 'onePhone', team: true,
    desc: 'Four words, one doesn’t belong. Spot it fast.',
    how: 'The host reads the four words. First team to name the odd one out, and why, gets the point.',
    start: function (view) {
      var g = H.games.odd, deck = H.deck(H.list('ODDS'));
      H.withTeams(view, g, function () {
        quiz(view, g, deck, function (o) {
          return '<div class="odd">' + H.shuffle(o.words).map(function (w) { return '<div data-w="' + esc(w) + '">' + esc(w) + '</div>'; }).join('') + '</div><p class="center" id="why" style="margin:0;font-weight:700"></p>';
        }, function (o) {
          H.$$('[data-w]', view).forEach(function (d) { d.classList.add(d.dataset.w === o.odd ? 'ok' : 'no'); });
          $('#why', view).textContent = o.odd + ': ' + o.why;
        }, null);
      });
    }
  });
})();
