/*
 * HUDDLE — Act It Out (phone on the forehead) and the "Test the tilt" screen.
 *
 * Tilt: from the phone's orientation we work out how much the screen faces
 * up or down:  u = cos(beta) * cos(gamma)   (+1 screen to the ceiling, -1 to the floor)
 * This is the same whichever way round the phone is held.
 *   u < -0.5  tilted down  -> Got it
 *   u >  0.5  tilted up    -> Pass
 *   it must come back near upright (|u| < 0.25) before the next tilt counts.
 * The Got it / Pass buttons always work too.
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$;
  var RAD = Math.PI / 180;

  function screenUp(e) {
    if (e.beta == null || e.gamma == null) return null;
    return Math.cos(e.beta * RAD) * Math.cos(e.gamma * RAD);
  }
  // iOS asks permission for motion; it must be asked from a tap.
  function askTilt() {
    var D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === 'function') {
      return D.requestPermission().then(function (r) { return r === 'granted'; }).catch(function () { return false; });
    }
    return Promise.resolve(!!D);
  }
  // Watches tilt; calls onTilt('got'|'pass'). Returns stop().
  function tiltWatch(onTilt, onValue) {
    var armed = false, seen = false;
    function h(e) {
      var u = screenUp(e); if (u == null) return;
      seen = true;
      if (onValue) onValue(u);
      if (Math.abs(u) < 0.25) { armed = true; return; }
      if (!armed) return;
      if (u < -0.5) { armed = false; onTilt('got'); }
      else if (u > 0.5) { armed = false; onTilt('pass'); }
    }
    window.addEventListener('deviceorientation', h);
    return { stop: function () { window.removeEventListener('deviceorientation', h); }, seen: function () { return seen; } };
  }
  H.screenUp = screenUp; H.tiltWatch = tiltWatch;

  H.game({
    id: 'act', name: 'Act It Out', kind: 'words', tag: 'onePhone', team: true,
    desc: 'Phone on your forehead. Tilt down for got it, up for pass.',
    how: 'The guesser holds the phone on their forehead, screen facing out. Their team acts it out with no talking.',
    start: function (view) {
      var g = H.games.act, deck = H.deck(H.pool());
      var layer = null;
      H.onLeave(function () { if (layer) layer.remove(); layer = null; });
      function next() {
        var tr = H.turn();
        H.handTurn(view, tr, t('guesser'), t('actNote'), function () { begin(tr); }, t('tapWhenReady'), 'act');
        if (tr.team < 0) return;
      }
      function begin(tr) {
        var p = S.tilt ? askTilt() : Promise.resolve(false);
        p.then(function (ok) { play(tr, ok); });
      }
      function play(tr, tiltOk) {
        H.wake(true);
        var items = [], cur = null, busy = false, watcher = null, cd = null, T = H.roundTime('act');
        layer = document.createElement('div');
        layer.className = 'act';
        layer.innerHTML = '<div class="atop"><button class="x" type="button" id="ax" aria-label="' + esc(t('endRound')) + '">' + H.svg('x', 20) + '</button>' +
          '<span id="acount">✓ 0</span><span class="timer" id="atm">' + H.fmt(T) + '</span></div>' +
          '<div class="aw"><div><div class="big" id="aword"></div><p id="anote" style="margin:10px 0 0;font-weight:700;opacity:.85"></p></div></div>' +
          '<div class="abtns"><button type="button" id="apass">' + H.svg('up', 20) + ' ' + esc(t('pass')) + '</button><button type="button" id="agot">' + H.svg('down', 20) + ' ' + esc(t('got')) + '</button></div>';
        $('#app').appendChild(layer);
        var word = $('#aword', layer), note = $('#anote', layer);
        function setCount() { $('#acount', layer).textContent = '✓ ' + items.filter(function (r) { return r.ok; }).length; }
        function deal() { cur = deck.next(cur); word.textContent = cur.w; note.textContent = ''; }
        function mark(ok) {
          if (busy || !cur) return; busy = true;
          items.push({ x: cur, ok: ok, pts: 1 });
          layer.classList.add(ok ? 'good' : 'pass');
          word.textContent = ok ? t('got') + '!' : t('pass');
          H.sfx(ok ? 'good' : 'pass'); H.haptic(ok ? 40 : [15, 30, 15]); setCount();
          H.later(function () { layer.classList.remove('good', 'pass'); busy = false; deal(); }, 650);
        }
        function end() {
          if (cd) cd.stop(); if (watcher) watcher.stop();
          H.wake(false); if (layer) layer.remove(); layer = null;
          H.roundResults(view, { g: g, tr: tr, items: items, again: next });
        }
        $('#agot', layer).onclick = function () { mark(true); };
        $('#apass', layer).onclick = function () { mark(false); };
        $('#ax', layer).onclick = end;
        // 3-2-1 while it goes up onto the forehead
        var n = 3;
        word.textContent = n; note.innerHTML = '<span class="on-phone">' + esc(t('onForehead')) + '</span><span class="on-tab">' + esc(t('faceRoom')) + '</span>';
        busy = true;
        var c = H.every(function () {
          n--;
          if (n > 0) { word.textContent = n; H.sfx('beep'); H.haptic(10); return; }
          clearInterval(c); busy = false; deal(); H.sfx('good');
          if (tiltOk) watcher = tiltWatch(function (k) { mark(k === 'got'); });
          cd = H.countdown(T, function (l) { var e = $('#atm', layer); if (e) e.textContent = H.fmt(l); }, end);
        }, 900);
        H.sfx('beep');
      }
      H.withTeams(view, g, next);
    }
  });

  /* ---------- Test the tilt ---------- */
  H.route('tilt', function (view) {
    view.innerHTML = H.bar(t('tiltTest'), t('tiltTestSub'), { backLabel: t('settings') }) +
      '<div class="tiltmeter"><div class="zone up">' + esc(t('pass')) + '</div><div class="zone dn">' + esc(t('got')) + '</div><div class="dot" id="dot"></div></div>' +
      '<div class="card center"><div class="big" id="tres" style="font-size:34px">–</div><p class="mute" id="tval" style="margin:6px 0 0">' + esc(t('tiltHold')) + '</p></div>' +
      '<button class="btn" type="button" id="ton">' + esc(t('tiltStart')) + '</button>';
    var w = null;
    H.onLeave(function () { if (w) w.stop(); });
    $('#ton', view).onclick = function () {
      askTilt().then(function (ok) {
        if (!ok) { $('#tval', view).textContent = t('tiltNo'); return; }
        $('#ton', view).hidden = true;
        if (w) w.stop();
        w = tiltWatch(function (k) {
          var r = $('#tres', view); r.textContent = k === 'got' ? t('got') + ' ✓' : t('pass') + ' ↷';
          H.sfx(k === 'got' ? 'good' : 'pass'); H.haptic(30);
        }, function (u) {
          $('#dot', view).style.transform = 'translateY(' + (-u * 48) + 'px)';
          $('#tval', view).textContent = (u > 0 ? '+' : '') + u.toFixed(2);
        });
        H.later(function () { if (w && !w.seen()) $('#tval', view).textContent = t('tiltNone'); }, 2500);
      });
    };
  });
})();
