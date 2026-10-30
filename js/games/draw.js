/*
 * HUDDLE — Draw It. The drawer holds a button to peek at the word,
 * then draws it for their team before the time runs out.
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$;
  var INKS = ['#141414', '#e0185a', '#1f6bff', '#00a86b', '#ff8a00'];

  H.game({
    id: 'draw', name: 'Draw It', kind: 'words', tag: 'onePhone', team: true,
    desc: 'Sketch the word before the timer runs out.',
    how: 'The drawer holds Peek to see the word, then draws. No letters or numbers.',
    start: function (view) {
      var g = H.games.draw, deck = H.deck(H.pool()), cur = null;
      function next() {
        var tr = H.turn();
        H.handTurn(view, tr, t('drawer'), t('drawNote'), function () { play(tr); }, null, 'draw');
      }
      function play(tr) {
        cur = deck.next(cur);
        var drew = false, ink = INKS[0], size = 6, strokes = [], live = null, cd = null, T = H.roundTime('draw');
        H.wake(true);
        view.innerHTML = H.bar(H.gname(g), tr.team >= 0 ? H.teamName(tr.team) + (tr.player ? ' · ' + tr.player.name : '') : '') +
          '<div class="meta"><span class="timer" id="tm">' + H.fmt(T) + '</span><button class="btn b2 sm peek" type="button" id="peek">' + esc(t('holdToPeek')) + '</button></div>' +
          '<div class="bar"><i id="tb" style="width:100%"></i></div>' +
          '<canvas class="pad" id="pad" aria-label="' + esc(t('drawHere')) + '"></canvas>' +
          '<div class="tools">' + INKS.map(function (c, i) { return '<button class="sw" type="button" data-ink="' + c + '" style="background:' + c + '" aria-label="Colour ' + (i + 1) + '" aria-pressed="' + (i === 0) + '"></button>'; }).join('') +
          '<span class="grow"></span><button class="ib" type="button" id="undo" aria-label="' + esc(t('undo')) + '">' + H.svg('undo') + '</button><button class="ib" type="button" id="clr" aria-label="' + esc(t('clear')) + '">' + H.svg('trash') + '</button></div>' +
          '<div class="row"><button class="btn alt" type="button" id="giveup">' + esc(t('giveUp')) + '</button><button class="btn" type="button" id="got">' + H.svg('check') + esc(t('guessed')) + '</button></div>';
        var cv = $('#pad', view), ctx = cv.getContext('2d'), dpr = Math.min(3, window.devicePixelRatio || 1);
        function fit() {
          var r = cv.getBoundingClientRect(); if (!r.width) return;
          cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
          redraw();
        }
        function line(s) {
          ctx.strokeStyle = s.c; ctx.lineWidth = s.w * dpr; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath();
          s.p.forEach(function (pt, i) { var x = pt[0] * cv.width, y = pt[1] * cv.height; if (i) ctx.lineTo(x, y); else { ctx.moveTo(x, y); ctx.lineTo(x + .01, y); } });
          ctx.stroke();
        }
        function redraw() { ctx.clearRect(0, 0, cv.width, cv.height); strokes.forEach(line); }
        function at(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; }
        cv.addEventListener('pointerdown', function (e) { e.preventDefault(); cv.setPointerCapture(e.pointerId); live = { c: ink, w: size, p: [at(e)] }; strokes.push(live); drew = true; line(live); });
        cv.addEventListener('pointermove', function (e) { if (!live) return; var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; evs.forEach(function (ev) { live.p.push(at(ev)); }); redraw(); });
        ['pointerup', 'pointercancel'].forEach(function (n) { cv.addEventListener(n, function () { live = null; }); });
        H.$$('[data-ink]', view).forEach(function (b) { b.onclick = function () { ink = b.dataset.ink; H.$$('[data-ink]', view).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
        $('#undo', view).onclick = function () { strokes.pop(); redraw(); };
        $('#clr', view).onclick = function () { strokes = []; redraw(); };
        // Peek: shows the word only while held
        var pk = $('#peek', view);
        function show(on) { pk.textContent = on ? cur.w : t('holdToPeek'); }
        pk.addEventListener('pointerdown', function (e) { e.preventDefault(); show(true); H.haptic(8); });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { pk.addEventListener(n, function () { show(false); }); });
        pk.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        window.addEventListener('resize', fit); H.onLeave(function () { window.removeEventListener('resize', fit); });
        requestAnimationFrame(fit);
        function end(ok) {
          if (cd) cd.stop(); H.wake(false); window.removeEventListener('resize', fit);
          if (ok) { H.sfx('win'); H.haptic([30, 30, 60]); }
          H.roundResults(view, { g: g, tr: tr, items: [{ x: cur, ok: ok, pts: ok ? 2 : 0 }], again: next });
        }
        $('#got', view).onclick = function () { end(true); };
        $('#giveup', view).onclick = function () { end(false); };
        cd = H.countdown(T, function (l) { $('#tm', view).textContent = H.fmt(l); $('#tb', view).style.width = (l / T * 100) + '%'; }, function () { end(false); });
      }
      H.withTeams(view, g, next);
    }
  });
})();
