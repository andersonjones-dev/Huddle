/*
 * HUDDLE — phone buzzers through Firstbuzz.
 * ---------------------------------------------------------------
 * Huddle hosts a real Firstbuzz room (same Firebase project, same room
 * format), so players join with the normal Firstbuzz player screen:
 * scan the QR code or open the link, type a name, then buzz.
 * Huddle referees exactly like the Firstbuzz host: every phone writes the
 * moment it was pressed (on the shared server clock), Huddle waits a short
 * moment for slow networks, then the earliest press wins.
 *
 * Needs internet. Everything else in Huddle keeps working offline.
 */
(function () {
  'use strict';
  var FIREBASE = {
    apiKey: 'AIzaSyC7_OJmzBYFDaa4bRkbNDnHB6q4GYY6mmA',
    authDomain: 'firstbuzz-b2f33.firebaseapp.com',
    databaseURL: 'https://firstbuzz-b2f33-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'firstbuzz-b2f33',
    appId: '1:60087933047:web:46d47a367fdf184fe68e72'
  };
  var PLAYER_URL = 'https://andersonjones-dev.github.io/firstbuzz/';   // where players open the buzzer
  var FB_VER = '10.12.2';
  var ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  var WINDOW = 300, COUNT_MS = 1950, ANSWER_SEC = 10;
  var ready = null;

  function loadScript(src) {
    return new Promise(function (ok, bad) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = function () { bad(new Error('load ' + src)); }; document.head.appendChild(s); });
  }
  // Firebase, signed in anonymously (shared with Firstbuzz on this website)
  function connect() {
    if (ready) return ready;
    var base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
    ready = loadScript(base + 'firebase-app-compat.js')
      .then(function () { return Promise.all([loadScript(base + 'firebase-auth-compat.js'), loadScript(base + 'firebase-database-compat.js')]); })
      .then(function () {
        var fb = window.firebase; if (!fb.apps.length) fb.initializeApp(FIREBASE);
        var auth = fb.auth();
        return (auth.currentUser ? Promise.resolve() : auth.signInAnonymously()).then(function () {
          return new Promise(function (r) { var u = auth.onAuthStateChanged(function (x) { if (x) { u(); r(); } }); });
        }).then(function () {
          var db = fb.database(), offset = 0;
          db.ref('.info/serverTimeOffset').on('value', function (s) { offset = s.val() || 0; });
          return { fb: fb, db: db, uid: auth.currentUser.uid, now: function () { return Date.now() + offset; }, setOffset: function (o) { offset = o; } };
        });
      });
    ready.catch(function () { ready = null; });
    return ready;
  }
  function clean(v) { return v === undefined ? null : JSON.parse(JSON.stringify(v)); }

  /* Start a room. o.onChange(roomView) is called whenever players or the buzz state change. */
  function startRoom(o) {
    return connect().then(function (n) {
      var db = n.db, code = null, R, st, players = {}, pending = [], decideTO = 0, armTO = 0, unsubBuzz = null, seen = {}, unsubs = [], closed = false;
      var api = {
        get code() { return code; },
        view: view,
        // show a question on everyone's phone (q = text, a = answer, ref = small print)
        question: function (i, q, a, ref) { clearT(); st.qi = i; st.q = { q: q, a: a, ref: ref || null }; st.qTotal = o.total || 0; st.showAnswer = false; st.out = {}; st.queue = []; st.pos = 0; st.phase = 'idle'; push(); emit(); },
        open: function () {
          clearT(); st.round = (st.round || 0) + 1; st.out = {}; st.queue = []; st.pos = 0; st.showAnswer = false; pending = []; subBuzz(st.round);
          st.phase = 'countdown'; st.goAt = n.now() + COUNT_MS; push(); emit();
          armTO = setTimeout(function () { st.phase = 'live'; st.armAt = st.goAt; push(); emit(); }, COUNT_MS);
        },
        correct: function () {
          var w = st.queue[st.pos]; if (!w) return null;
          st.scores[w.k] = (st.scores[w.k] || 0) + 1; st.ev = { type: 'correct', k: w.k, p: w.p, at: n.now() };
          st.phase = 'idle'; st.showAnswer = true; st.out = {}; clearT(); push(); emit();
          return { id: w.p, name: nameOf(w.p) };
        },
        // returns 'next' (someone else is in line), 'reopened' (buzzers open again) or 'nobody'
        wrong: function () {
          var w = st.queue[st.pos]; if (!w) return 'nobody';
          st.out[w.k] = true; st.ev = { type: 'wrong', k: w.k, at: n.now() }; st.pos++;
          while (st.queue[st.pos] && st.out[st.queue[st.pos].k]) st.pos++;
          var res;
          if (st.queue[st.pos]) { st.winAt = n.now() + 50; st.deadline = st.winAt + ANSWER_SEC * 1000; res = 'next'; }
          else if (Object.keys(st.out).length < Object.keys(players).length) { clearT(); st.round++; st.queue = []; st.pos = 0; pending = []; subBuzz(st.round); st.phase = 'live'; st.armAt = n.now(); res = 'reopened'; }
          else { clearT(); st.phase = 'idle'; st.showAnswer = true; res = 'nobody'; }
          push(); emit(); return res;
        },
        reveal: function () { st.showAnswer = true; st.phase = 'idle'; clearT(); push(); emit(); },
        finish: function () { st.phase = 'podium'; st.ev = { type: 'podium', at: n.now() }; push(); emit(); },
        end: end
      };
      function tryCode(i) {
        if (i > 12) throw new Error('no code');
        var c = ''; for (var k = 0; k < 6; k++) c += ALPHA[Math.floor(Math.random() * ALPHA.length)];
        return db.ref('rooms/' + c + '/meta').transaction(function (cur) { return cur ? undefined : { hostId: n.uid, createdAt: Date.now(), v: 1, by: 'huddle' }; })
          .then(function (r) { return r.committed ? c : tryCode(i + 1); });
      }
      return tryCode(0).then(function (c) {
        code = c; R = function (p) { return db.ref('rooms/' + code + '/' + p); };
        st = { phase: 'lobby', round: 0, qi: -1, qTotal: o.total || 0, scores: {}, out: {}, queue: [], pos: 0 };
        return Promise.all([
          R('settings').set({ skin: 'toybox', sound: 'funny', time: ANSWER_SEC, teams: 0, quips: false, count: true, early: true, neg: false, showQScreen: true, showQPhones: true, points: 1, packId: 'huddle' }),
          R('state').set(clean(st))
        ]);
      }).then(function () {
        syncClock();
        var h = function (s) { players = s.val() || {}; emit(); };
        R('players').on('value', h); unsubs.push(function () { R('players').off('value', h); });
        window.addEventListener('pagehide', end);
        return api;
      });

      // NTP-style: time a round trip to the server, keep the best sample
      function syncClock() {
        var ref = R('sync/' + n.uid), best = null, i = 0;
        (function one() {
          if (i++ >= 6 || closed) { if (best) n.setOffset(best.est); return; }
          var t0 = Date.now();
          ref.set({ ts: n.fb.database.ServerValue.TIMESTAMP }).then(function () { var t1 = Date.now(); return ref.get().then(function (s) { var ts = s.val() && s.val().ts; if (ts) { var rtt = t1 - t0, est = ts - (t0 + rtt / 2); if (!best || rtt < best.rtt) best = { rtt: rtt, est: est }; } one(); }); }).catch(function () {});
        })();
      }
      function push() { if (!closed) R('state').set(clean(st)); }
      function emit() { if (!closed && o.onChange) o.onChange(view()); }
      function nameOf(pid) { return (players[pid] && players[pid].name) || '?'; }
      function view() {
        var q = st.queue || [], cur = st.phase === 'won' ? q[st.pos || 0] : null;
        return {
          code: code, link: PLAYER_URL + '#/join/' + code, phase: st.phase,
          players: Object.keys(players).map(function (id) { return { id: id, name: players[id].name, color: players[id].color, online: players[id].online !== false }; }),
          winner: cur ? { id: cur.p, name: nameOf(cur.p), ms: Math.round(cur.t - (st.armAt || cur.t)) } : null,
          line: q.slice((st.pos || 0) + 1).filter(function (e) { return !st.out[e.k]; }).map(function (e) { return { name: nameOf(e.p), behind: cur ? Math.round(e.t - cur.t) : 0 }; })
        };
      }
      function subBuzz(round) {
        if (unsubBuzz) unsubBuzz();
        seen = {};
        var ref = R('buzzes/' + round), h = function (s) { var pid = s.key, v = s.val(); if (!seen[pid] && v) { seen[pid] = 1; onBuzz(pid, v.t, round); } };
        ref.on('child_added', h); unsubBuzz = function () { ref.off('child_added', h); };
      }
      function onBuzz(pid, t, round) {
        if (round !== st.round || !players[pid]) return;
        if (st.phase !== 'live' && st.phase !== 'won') return;
        if (t < (st.armAt || 0) - 30 || st.out[pid]) return;
        if (st.phase === 'live') {
          var ex = pending.filter(function (e) { return e.k === pid; })[0];
          if (ex) { if (t < ex.t) ex.t = t; return; }
          pending.push({ p: pid, k: pid, t: t });
          if (!decideTO) decideTO = setTimeout(decide, WINDOW);
        } else {
          if (st.queue.some(function (e) { return e.k === pid; })) return;
          var head = st.queue.slice(0, st.pos + 1), rest = st.queue.slice(st.pos + 1).concat({ p: pid, k: pid, t: t }).sort(function (a, b) { return a.t - b.t; });
          st.queue = head.concat(rest); push(); emit();
        }
      }
      function decide() {
        decideTO = 0;
        if (st.phase !== 'live' || !pending.length) return;
        st.queue = pending.sort(function (a, b) { return a.t - b.t; }); pending = [];
        st.pos = 0; st.phase = 'won'; st.winAt = n.now(); st.deadline = st.winAt + ANSWER_SEC * 1000;
        push(); emit(); if (o.onBuzz) o.onBuzz(view());
      }
      function clearT() { clearTimeout(decideTO); decideTO = 0; clearTimeout(armTO); }
      // close the room so phones show "The room has ended"
      function end() {
        if (closed) return; closed = true; clearT();
        if (unsubBuzz) unsubBuzz(); unsubs.forEach(function (f) { f(); });
        window.removeEventListener('pagehide', end);
        try { db.ref('rooms/' + code).remove(); } catch (e) {}
      }
    });
  }

  window.HuddleBuzz = { start: startRoom, PLAYER_URL: PLAYER_URL };
})();
