/*
 * HUDDLE — Spin the Challenge. A real prize wheel: flick it (or tap Spin),
 * it slows with friction, the pointer clicks over every peg with a sound
 * and a vibration, and it lands on a player, who gets a challenge.
 *
 * Physics, each frame:  speed -= (40 + speed * 0.55) * dt   (deg/s)
 * It never stops on a peg: within 3 degrees of an edge it eases into the slice.
 * The slice under the pointer is  floor(((-angle) mod 360) / sliceSize).
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$;
  var WCOLS = ['#ff2e63', '#7c4dff', '#00b894', '#ff7a1a', '#1f6bff', '#e6007e', '#c9a400', '#00a8e8'];

  function wheelHTML(labels, a) {
    var n = labels.length, seg = 360 / n;
    var cols = labels.map(function (l, i) { var c = WCOLS[i % WCOLS.length]; if (i === n - 1 && n % WCOLS.length === 1 && n > 1) c = WCOLS[3]; return c; });
    var grad = 'conic-gradient(' + labels.map(function (l, i) { return cols[i] + ' ' + (i * seg) + 'deg ' + ((i + 1) * seg) + 'deg'; }).join(',') + ')';
    var pegs = '', lbls = '';
    for (var i = 0; i < n; i++) {
      var b = i * seg - 90, c = (i + .5) * seg - 90;
      pegs += '<i class="peg" style="transform:rotate(' + b + 'deg) translate(calc(50cqw - 13px)) rotate(' + (-b) + 'deg)"></i>';
      lbls += '<span class="lbl" style="transform:rotate(' + c + 'deg) translate(15cqw,-0.6em)">' + esc(labels[i]) + '</span>';
    }
    return '<div class="wheelbox" id="wbox"><div class="flap" id="flap"><svg viewBox="0 0 30 40" aria-hidden="true"><path d="M15 38 3 8a12 12 0 1 1 24 0z" fill="currentColor" stroke="#141414" stroke-width="1.5"/><circle cx="15" cy="12" r="5" fill="#fff"/></svg></div>' +
      '<div class="wheel" id="wheel" role="img" aria-label="' + esc(t('wheel')) + '" style="background:' + grad + ';transform:rotate(' + a + 'deg)">' + lbls + pegs + '<div class="hi" id="whi" style="position:absolute;inset:0;border-radius:50%;pointer-events:none;opacity:0;transition:opacity .25s"></div></div>' +
      '<div class="hubdot">' + esc(t('spin')) + '</div></div>';
  }
  // exposed for tests
  H.wheelSegAt = function (a, n) { var seg = 360 / n; return Math.floor((((-a) % 360) + 360) % 360 / seg) % n; };

  H.game({
    id: 'spin', name: 'Spin the Challenge', kind: 'party', tag: 'onePhone',
    desc: 'Spin for a player and a clean, silly challenge.',
    how: 'Put the phone in the middle. Flick the wheel; whoever it lands on does the challenge.',
    start: function (view) {
      var g = H.games.spin;
      if (S.players.length < 2) { H.needSetup(view, g, t('needPlayers')); return; }
      var deck = H.deck(H.list('CHALLENGES')), ch = null;
      // at least 6 slices so the wheel feels like a wheel; names repeat round it
      var slices = H.shuffle(S.players.slice());
      while (slices.length < 6) slices = slices.concat(H.shuffle(S.players.slice()));
      slices = slices.slice(0, Math.max(6, Math.min(16, S.players.length)));
      var W = { a: Math.random() * 360, v: 0, raf: 0, last: 0, n: slices.length, seg: 360 / slices.length, lastSeg: null, drag: null };
      var spinning = false;
      H.onLeave(function () { cancelAnimationFrame(W.raf); });

      view.innerHTML = H.bar(H.gname(g), t('flickSub')) +
        wheelHTML(slices.map(function (p) { return p.name; }), W.a) +
        '<p class="hint" id="whint">' + esc(t('flickHint')) + '</p>' +
        '<div class="card spinres" id="sres"><div class="sub" id="swho">' + esc(t('whoWillItBe')) + '</div><div class="who" id="sname"></div><div style="font-weight:800" id="sch"></div></div>' +
        '<div class="row" id="after" hidden><button class="btn alt" type="button" id="skip">' + esc(t('skip')) + '</button><button class="btn b4" type="button" id="did">' + H.svg('check') + esc(t('didIt')) + '</button></div>' +
        '<button class="btn big" type="button" id="spinb">' + esc(t('spin')) + '</button>' +
        (S.night ? H.endButtons('spin') : '<button class="link" type="button" data-back>' + esc(t('finish')) + '</button>');
      var wh = $('#wheel', view), box = $('#wbox', view), btn = $('#spinb', view), flap = $('#flap', view);
      var landed = null;

      function drawWheel() { wh.style.transform = 'rotate(' + W.a + 'deg)'; }
      function segAt(a) { return H.wheelSegAt(a, W.n); }
      function tickCheck(speed) {
        var k = Math.floor((((W.a % 360) + 360) % 360) / W.seg);
        if (W.lastSeg !== null && k !== W.lastSeg) {
          var dir = (W.drag ? W.drag.v : W.v) >= 0 ? -1 : 1;
          flap.style.setProperty('--kick', dir * Math.min(34, 10 + speed / 40) + 'deg');
          flap.classList.remove('kick'); void flap.offsetWidth; flap.classList.add('kick');
          H.sfx('tick', Math.min(1, speed / 900)); H.haptic(speed > 500 ? 6 : 12);
        }
        W.lastSeg = k;
      }
      function settle(onLand) {
        cancelAnimationFrame(W.raf);
        W.last = performance.now();
        function step(now) {
          var dt = Math.min(.05, (now - W.last) / 1000); W.last = now;
          var sp = Math.abs(W.v), dec = (40 + sp * .55) * dt;
          W.v = sp <= dec ? 0 : W.v - Math.sign(W.v) * dec;
          W.a += W.v * dt; drawWheel(); tickCheck(Math.abs(W.v));
          if (W.v !== 0) { W.raf = requestAnimationFrame(step); return; }
          var top = ((-W.a % 360) + 360) % 360, off = top % W.seg;
          if (off < 3 || off > W.seg - 3) {
            var to = W.a + (off < 3 ? -(4 - off) : (off - W.seg + 4)), from = W.a, t0 = performance.now();
            var ease = function (n2) {
              var k = Math.min(1, (n2 - t0) / 220); W.a = from + (to - from) * (1 - Math.pow(1 - k, 3)); drawWheel();
              if (k < 1) W.raf = requestAnimationFrame(ease); else onLand(segAt(W.a));
            };
            W.raf = requestAnimationFrame(ease); return;
          }
          onLand(segAt(W.a));
        }
        W.raf = requestAnimationFrame(step);
      }
      function land(i) {
        spinning = false; btn.disabled = false; btn.textContent = t('spinAgain');
        var hi = $('#whi', view);
        hi.style.background = 'conic-gradient(transparent 0 ' + (i * W.seg) + 'deg, rgba(255,255,255,.55) ' + (i * W.seg) + 'deg ' + ((i + 1) * W.seg) + 'deg, transparent 0)';
        hi.style.opacity = 1; box.classList.add('landed');
        landed = slices[i]; ch = deck.next(ch);
        var r = $('#sres', view); r.classList.remove('pop'); void r.offsetWidth; r.classList.add('pop');
        $('#swho', view).textContent = t('landedOn');
        $('#sname', view).textContent = landed.name; $('#sname', view).style.color = landed.color;
        $('#sch', view).textContent = ch.w;
        $('#after', view).hidden = false;
        H.haptic([40, 60, 120]); H.sfx('win');
        box.dataset.landed = String(i);   // used by the automatic checks
      }
      function start(v) {
        if (spinning) return;
        spinning = true; btn.disabled = true; btn.textContent = t('spinning');
        $('#whi', view).style.opacity = 0; box.classList.remove('landed'); $('#after', view).hidden = true;
        $('#swho', view).textContent = t('spinning'); $('#sname', view).textContent = ''; $('#sch', view).textContent = '';
        $('#whint', view).style.visibility = 'hidden';
        W.v = v; settle(land);
      }
      btn.onclick = function () { H.audioOn(); H.haptic(20); start(1100 + Math.random() * 700); };
      $('#did', view).onclick = function () {
        if (landed && !H.teamsReady()) { H.addPoints(H.teamOf(landed.id), 1, 'spin'); H.toast('+1 ' + H.teamName(H.teamOf(landed.id))); }
        H.sfx('good'); $('#after', view).hidden = true;
      };
      $('#skip', view).onclick = function () { $('#after', view).hidden = true; };
      // flick to spin: follow the finger, then carry on with its speed
      function ang(e) { var r = wh.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; }
      wh.addEventListener('pointerdown', function (e) {
        if (spinning) return;
        H.audioOn(); cancelAnimationFrame(W.raf); wh.setPointerCapture(e.pointerId);
        W.drag = { last: ang(e), t: performance.now(), v: 0 };
      });
      wh.addEventListener('pointermove', function (e) {
        var D = W.drag; if (!D) return;
        var a2 = ang(e), d = a2 - D.last; if (d > 180) d -= 360; if (d < -180) d += 360;
        var now = performance.now(), dt = Math.max(1, now - D.t) / 1000;
        D.v = D.v * .5 + (d / dt) * .5; D.last = a2; D.t = now;
        W.a += d; drawWheel(); tickCheck(Math.abs(D.v));
      });
      function up() {
        var D = W.drag; W.drag = null; if (!D) return;
        if (performance.now() - D.t > 120) D.v = 0;          // finger stopped before letting go
        if (Math.abs(D.v) < 250) { var hn = $('#whint', view); hn.style.visibility = 'visible'; hn.textContent = t('flickHarder'); return; }
        start(Math.max(-2200, Math.min(2200, D.v)));
      }
      wh.addEventListener('pointerup', up); wh.addEventListener('pointercancel', up);
    }
  });
})();
