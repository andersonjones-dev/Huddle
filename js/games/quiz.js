/*
 * HUDDLE — quick-fire quiz games read out by a host:
 * Fill the Verse (KJV) — Fill the Phrase on the Everyday side — and Odd One Out.
 * Either teams shout and the host awards the point, or everyone buzzes on their own
 * phone through Firstbuzz (js/buzz.js) and Huddle shows who was first.
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$;

  // Which Huddle side a Firstbuzz player belongs to, by name (-1 if no match)
  function sideFor(name) {
    var n = String(name || '').trim().toLowerCase(); if (!n) return -1;
    var p = S.players.filter(function (x) { return x.name.trim().toLowerCase() === n; })[0] ||
      (n.length >= 3 ? S.players.filter(function (x) { var m = x.name.trim().toLowerCase(); return m.indexOf(n) === 0 || n.indexOf(m) === 0; })[0] : null);
    return p ? H.teamOf(p.id) : -1;
  }

  /* toPhone(item) -> {q, a, ref}: the text Firstbuzz shows on every player's phone */
  function quiz(view, g, deck, render, reveal, learnOf, toPhone) {
    var cur = null, n = 0, limit = H.playCount(g.id), room = null, rv = null, answered = false;
    H.onLeave(function () { if (room) room.end(); room = null; });

    function award(label) {
      if (H.isQuick()) return '<div class="row"><button class="btn" type="button" id="nxq">' + esc(t('nextQ')) + ' ›</button></div>';
      var b = '';
      for (var i = 0; i < H.sideCount(); i++) b += '<button class="btn" type="button" data-t="' + i + '" style="--tc:' + H.teamColor(i) + '">+1 ' + esc(H.teamName(i)) + '</button>';
      return '<div class="sec center" style="margin:0">' + esc(label || t('whoWins')) + '</div><div class="award">' + b + '</div><button class="btn alt" type="button" data-t="-1">' + esc(t('nobody')) + '</button>';
    }
    function bindAward(a) {
      H.$$('[data-t]', a).forEach(function (b) { b.onclick = function () { var k = +b.dataset.t; if (k >= 0) { H.addPoints(k, 1, g.id); H.toast('+1 ' + H.teamName(k)); H.sfx('win'); } ask(); }; });
      var nq = $('#nxq', a); if (nq) nq.onclick = ask;
    }
    function ask() {
      if (limit && n >= limit) { if (room) room.finish(); H.go('done', { g: g }); return; }
      cur = deck.next(cur); n++; answered = false;
      view.innerHTML = H.bar(H.gname(g), t('question') + ' ' + n + (limit ? ' / ' + limit : '') + ' · ' + t('hostReads')) +
        (n === 1 && !room ? '<div class="card stack">' + H.pickerHTML('count', g.id) +
          '<div class="pick"><div class="pick-lbl">' + esc(t('phoneBuzzers')) + '</div><div class="chips wrap pick-row"><button class="chip" type="button" id="bzOff" aria-pressed="true">' + esc(t('shoutIt')) + '</button><button class="chip" type="button" id="bzOn" aria-pressed="false">' + H.svg('phone', 18) + esc(t('useFirstbuzz')) + '</button></div></div></div>' : '') +
        '<div class="card stack">' + render(cur) + '</div>' +
        '<div id="ans" class="stack"></div>' +
        '<button class="link" type="button" id="fin">' + esc(t('finish')) + '</button>';
      if (n === 1 && !room) { H.bindPicker(view, g.id); $('#bzOn', view).onclick = lobby; }
      $('#fin', view).onclick = function () { if (room) room.finish(); H.go('done', { g: g }); };
      if (room) { var ph = toPhone(cur); room.question(n - 1, ph.q, ph.a, ph.ref); }
      paint();
    }
    function firstPickDone() { if (n === 1) { limit = H.playCount(g.id); var pk = $('.pick', view); if (pk) pk.parentNode.remove(); } }
    function showAnswer() { if (!answered) { answered = true; reveal(cur); H.sfx('good'); H.haptic(20); } }

    // The lower half of the question screen
    function paint() {
      var a = $('#ans', view); if (!a) return;
      if (!room) {   // shout it out: host reveals and taps the winner
        a.innerHTML = '<button class="btn b2" type="button" id="show">' + esc(t('showAnswer')) + '</button>';
        $('#show', view).onclick = function () {
          firstPickDone(); showAnswer();
          a.innerHTML = (learnOf ? H.learnHTML([learnOf(cur)]) : '') + award(); bindAward(a);
        };
        return;
      }
      var v = room.view(), ph = v.phase;
      if (answered) return;
      if (ph === 'idle' || ph === 'lobby') {
        a.innerHTML = '<div class="buzzbar"><span class="mute">' + esc(v.players.length + ' ' + t('onBuzzers')) + '</span><span class="mono">' + esc(v.code) + '</span></div>' +
          '<button class="btn big" type="button" id="open">' + esc(t('openBuzzers')) + '</button>' +
          '<button class="btn alt" type="button" id="skipq">' + esc(t('showAnswer')) + '</button>';
        $('#open', view).onclick = function () { firstPickDone(); H.audioOn(); room.open(); };
        $('#skipq', view).onclick = function () { firstPickDone(); room.reveal(); showAnswer(); a.innerHTML = award(); bindAward(a); };
      } else if (ph === 'countdown') {
        a.innerHTML = '<div class="count3">' + esc(t('getReady')) + '</div>';
      } else if (ph === 'live') {
        a.innerHTML = '<div class="buzzlive">' + esc(t('buzzersOpen')) + '</div><button class="btn alt" type="button" id="nob">' + esc(t('nobodyBuzzed')) + '</button>';
        $('#nob', view).onclick = function () { room.reveal(); showAnswer(); a.innerHTML = award(); bindAward(a); };
      } else if (ph === 'won' && v.winner) {
        var side = sideFor(v.winner.name), col = side >= 0 ? H.teamColor(side) : 'var(--a1)';
        a.innerHTML = '<div class="buzzwin" style="--bc:' + col + '"><small>' + esc(t('buzzedFirst')) + '</small><b>' + esc(v.winner.name) + '</b><span>' +
          (side >= 0 && !H.solo() ? esc(H.teamName(side)) + ' · ' : '') + (v.winner.ms / 1000).toFixed(2) + ' s</span></div>' +
          (v.line.length ? '<p class="hint" style="margin:0">' + esc(t('thenLine')) + ' ' + v.line.slice(0, 4).map(function (x) { return esc(x.name) + ' +' + (x.behind / 1000).toFixed(2) + 's'; }).join(' · ') + '</p>' : '') +
          '<div class="row"><button class="btn alt" type="button" id="wrong">' + esc(t('wrongAns')) + '</button><button class="btn" type="button" id="right">' + H.svg('check') + esc(t('rightAns')) + '</button></div>';
        $('#right', view).onclick = function () {
          var w = room.correct(); showAnswer(); H.sfx('win'); H.confetti();
          var k = w ? sideFor(w.name) : -1;
          if (k >= 0) { H.addPoints(k, 1, g.id); a.innerHTML = '<div class="buzzwin" style="--bc:' + H.teamColor(k) + '"><small>' + esc(t('pointTo')) + '</small><b>+1 ' + esc(H.teamName(k)) + '</b></div>' + (learnOf ? H.learnHTML([learnOf(cur)]) : '') + '<button class="btn big" type="button" id="nxq">' + esc(t('nextQ')) + ' ›</button>'; $('#nxq', a).onclick = ask; }
          else { a.innerHTML = award(fillName(t('whoIs'), w ? w.name : '?')); bindAward(a); }
        };
        $('#wrong', view).onclick = function () {
          var r = room.wrong(); H.sfx('bad'); H.haptic([40, 40, 40]);
          if (r === 'nobody') { showAnswer(); a.innerHTML = '<p class="center mute" style="margin:0">' + esc(t('nobodyGot')) + '</p><button class="btn big" type="button" id="nxq">' + esc(t('nextQ')) + ' ›</button>'; $('#nxq', a).onclick = ask; }
        };
      }
    }
    function fillName(s, name) { return String(s).replace('{name}', name); }

    // Phone buzzers: make the room and let people join
    function lobby() {
      var box = $('.pick', view) && $('.pick', view).parentNode;
      if (box) box.innerHTML = '<p class="center" style="margin:0;font-weight:700">' + esc(t('connecting')) + '</p>';
      if (!navigator.onLine) { H.toast(t('needNet')); if (box) box.innerHTML = '<p class="center mute" style="margin:0">' + esc(t('needNet')) + '</p>'; return; }
      window.HuddleBuzz.start({ total: limit || 0, onChange: function (v) { rv = v; if (room && !$('#lobby', view)) paint(); else drawLobby(); }, onBuzz: function () { H.sfx('beep'); H.haptic([30, 30, 60]); } })
        .then(function (r) { room = r; drawLobby(); })
        .catch(function () { H.toast(t('needNet')); if (box) box.innerHTML = '<p class="center mute" style="margin:0">' + esc(t('needNet')) + '</p>'; });
    }
    function drawLobby() {
      if (!room) return;
      var v = room.view();
      var el = $('#lobby', view);
      if (!el) {
        view.innerHTML = H.bar(H.gname(g), t('phoneBuzzers')) +
          '<div class="card stack center" id="lobby"><div class="sec" style="margin:0 auto">' + esc(t('scanToJoin')) + '</div><div class="qr" id="bqr"></div>' +
          '<div class="mono big" style="font-size:40px;letter-spacing:.12em">' + esc(v.code) + '</div><p class="hint" style="margin:0">' + esc(t('orOpen')) + ' ' + esc(window.HuddleBuzz.PLAYER_URL.replace('https://', '')) + '</p>' +
          '<div class="row"><button class="btn b2 sm" type="button" id="bshare">' + H.svg('share', 18) + esc(t('share')) + '</button><button class="btn alt sm" type="button" id="bcopy">' + esc(t('copyLink')) + '</button></div>' +
          '<p class="hint" style="margin:0">' + esc(t('sameNames')) + '</p><div class="pl" id="bpl" style="justify-content:center"></div></div>' +
          '<button class="btn big" type="button" id="bstart">' + esc(t('startQuiz')) + '</button><button class="link" type="button" id="boff">' + esc(t('noBuzzers')) + '</button>';
        H.qr($('#bqr', view), v.link);
        $('#bcopy', view).onclick = function () { if (navigator.clipboard) navigator.clipboard.writeText(v.link).then(function () { H.toast(t('linkCopied')); }, function () {}); };
        $('#bshare', view).onclick = function () { if (navigator.share) navigator.share({ title: 'Huddle buzzers', text: t('joinMsg') + ' ' + v.code, url: v.link }).catch(function () {}); else $('#bcopy', view).click(); };
        $('#bstart', view).onclick = function () { n = 0; ask(); };
        $('#boff', view).onclick = function () { room.end(); room = null; n = 0; ask(); };
        el = $('#lobby', view);
      }
      $('#bpl', view).innerHTML = v.players.length ? v.players.map(function (p) {
        var k = sideFor(p.name);
        return '<span class="pchip"><i style="background:' + esc(p.color || '#888') + '">' + esc((p.name || '?')[0].toUpperCase()) + '</i><span>' + esc(p.name) + (k >= 0 && !H.solo() ? ' · ' + esc(H.teamName(k)) : k < 0 ? ' ?' : '') + '</span></span>';
      }).join('') : '<span class="mute">' + esc(t('waitingJoin')) + '</span>';
      $('#bstart', view).disabled = !v.players.length;
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
        null, function (v) { return { q: v.before + ' ____ ' + v.after, a: v.word, ref: v.ref + (v.mode === 'bible' ? ' · KJV' : '') }; });
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
        }, null, function (o) { return { q: t('oddQ') + ' ' + o.words.join(' · '), a: o.odd, ref: o.why }; });
      });
    }
  });
})();
