/*
 * HUDDLE — core: saved state, teams, scoring, sound & vibration,
 * the hand-off screen, Learn More cards and screen switching.
 * Games register themselves with Huddle.game({...}) (see js/games/).
 */
(function () {
  'use strict';
  var D = window.HuddleData, I = window.HuddleI18n;
  var KEY = 'huddle.v1';
  var COLORS = ['#ff2e63', '#1f6bff', '#00b894', '#ff9f1c', '#7c4dff', '#e6007e', '#00a8e8', '#f9c80e', '#8bc34a', '#ff7043', '#26c6da', '#ab47bc'];
  var TEAM_COLORS = ['#ff7a1a', '#1f6bff', '#00b894', '#e6007e'];
  var TEAM_NAMES = ['Lions', 'Eagles', 'Dolphins', 'Bears'];

  /* ---------------- saved state ---------------- */
  function fresh() {
    return {
      v: 1, lang: 'en', theme: 'playful', appear: 'light', mode: 'bible', times: {}, counts: {}, fuse: 'medium', play: 'teams', kids: false, sound: true, haptic: true, learn: true, tilt: true, time: 60,
      players: [], teams: { count: 2, mode: 'random', names: TEAM_NAMES.slice(), of: {} },
      packsOn: {}, custom: [],
      night: null,          // { plan: [gameIds], i: 0 }
      score: { pts: [0, 0, 0, 0], solo: {}, log: [] }
    };
  }
  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    var f = fresh();
    if (!s || typeof s !== 'object') return f;
    Object.keys(f).forEach(function (k) { if (s[k] === undefined) s[k] = f[k]; });
    if (s.theme === 'popart') s.theme = 'comic';   // Pop Art Comic was tried and removed
    if (!Array.isArray(s.players)) s.players = [];
    if (!s.teams || typeof s.teams !== 'object') s.teams = f.teams;
    s.teams.count = Math.max(2, Math.min(4, s.teams.count | 0 || 2));
    if (!Array.isArray(s.teams.names) || s.teams.names.length < 4) s.teams.names = TEAM_NAMES.slice();
    if (!s.teams.of || typeof s.teams.of !== 'object') s.teams.of = {};
    if (!s.score || !Array.isArray(s.score.pts)) s.score = f.score;
    while (s.score.pts.length < 4) s.score.pts.push(0);
    if (!s.score.solo || typeof s.score.solo !== 'object') s.score.solo = {};
    if (s.play !== 'solo') s.play = 'teams';
    if (!Array.isArray(s.custom)) s.custom = [];
    if (!s.times || typeof s.times !== 'object') s.times = {};
    if (!s.counts || typeof s.counts !== 'object') s.counts = {};
    return s;
  }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } }

  /* ---------------- small helpers ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function t(k) { return (S.lang === 'kn' && I.kn[k]) || I.en[k] || k; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  // Illustrated & Playful has its own chunky icon set (#p-…); the other looks use #i-…
  function iconSet() { var a = document.getElementById('app'); return a && a.dataset.theme === 'playful' ? 'p' : 'i'; }
  function svg(id, size) { return '<svg class="i" width="' + (size || 22) + '" height="' + (size || 22) + '" aria-hidden="true"><use href="#' + iconSet() + '-' + id + '"/></svg>'; }

  /* A deck draws without repeats until everything has been used once. */
  function deck(items) {
    var pile = [];
    return { next: function (avoid) {
      if (!items.length) return null;
      if (!pile.length) pile = shuffle(items);
      var x = pile.pop();
      if (avoid && x === avoid && items.length > 1) { pile.unshift(x); x = pile.pop(); }
      return x;
    }, size: items.length };
  }

  /* ---------------- players & teams ---------------- */
  function addPlayer(name) {
    name = String(name || '').trim().slice(0, 16);
    if (!name) return null;
    var used = S.players.map(function (p) { return p.color; });
    var color = COLORS.filter(function (c) { return used.indexOf(c) < 0; })[0] || COLORS[S.players.length % COLORS.length];
    var p = { id: uid(), name: name, color: color };
    S.players.push(p);
    if (S.teams.mode === 'manual') S.teams.of[p.id] = smallestTeam();
    else randomTeams();
    save();
    return p;
  }
  function removePlayer(id) {
    S.players = S.players.filter(function (p) { return p.id !== id; });
    delete S.teams.of[id];
    save();
  }
  function smallestTeam() {
    var n = teamLists().map(function (l) { return l.length; });
    var best = 0; n.forEach(function (c, i) { if (c < n[best]) best = i; });
    return best;
  }
  // Even teams in a random order
  function randomTeams() {
    var order = shuffle(S.players.map(function (p) { return p.id; }));
    S.teams.of = {};
    order.forEach(function (id, i) { S.teams.of[id] = i % S.teams.count; });
    save();
  }
  /* Teams or Individual (S.play). Everything else talks about "sides":
     in Teams a side is a team; in Individual every player is their own side. */
  function solo() { return S.play === 'solo'; }
  function sideCount() { return solo() ? S.players.length : S.teams.count; }
  function rawTeamOf(pid) { var v = S.teams.of[pid]; return (v == null || v >= S.teams.count) ? 0 : v; }
  function teamOf(pid) { if (solo()) { for (var i = 0; i < S.players.length; i++) if (S.players[i].id === pid) return i; return 0; } return rawTeamOf(pid); }
  function teamLists() {
    if (solo()) return S.players.map(function (p) { return [p]; });
    var lists = []; for (var i = 0; i < S.teams.count; i++) lists.push([]);
    S.players.forEach(function (p) { lists[rawTeamOf(p.id)].push(p); });
    return lists;
  }
  function moveToNextTeam(pid) { S.teams.of[pid] = (rawTeamOf(pid) + 1) % S.teams.count; save(); }
  function setTeamCount(n) {
    S.teams.count = Math.max(2, Math.min(4, n));
    if (S.teams.mode === 'random') randomTeams();
    else S.players.forEach(function (p) { if (rawTeamOf(p.id) >= S.teams.count) S.teams.of[p.id] = smallestTeam(); });
    save();
  }
  function teamName(i) { if (solo()) return (S.players[i] || {}).name || '?'; return S.teams.names[i] || TEAM_NAMES[i]; }
  function teamColor(i) { if (solo()) return (S.players[i] || {}).color || COLORS[i % COLORS.length]; return TEAM_COLORS[i % TEAM_COLORS.length]; }
  function teamsReady() {
    if (S.players.length < 2) return t('needPlayers');
    if (solo()) return '';
    var l = teamLists();
    if (l.some(function (x) { return x.length < 1; })) return t('needTeams');
    return '';
  }
  function setPlay(m) { S.play = m === 'solo' ? 'solo' : 'teams'; save(); }

  /* ---------------- scoring for the night ----------------
     Team points are kept by team number, individual points by player, so
     switching between Teams and Individual never mixes them up. */
  function addPoints(side, n, game) {
    if (solo()) { var p = S.players[side]; if (!p) return; S.score.solo[p.id] = (S.score.solo[p.id] || 0) + n; }
    else S.score.pts[side] = (S.score.pts[side] || 0) + n;
    S.score.log.push({ g: game, team: side, n: n, solo: solo(), at: Date.now() });
    if (S.score.log.length > 400) S.score.log.shift();
    save();
  }
  function pointsOf(side) { if (solo()) { var p = S.players[side]; return p ? (S.score.solo[p.id] || 0) : 0; } return S.score.pts[side] || 0; }
  function resetScore() { S.score = { pts: [0, 0, 0, 0], solo: {}, log: [] }; save(); }

  /* ---------------- word pools ----------------
     Content side (S.mode): 'bible' = Christian content only, 'everyday' = no Bible or church content.
     Built-in packs and prompts belong to exactly one side. Your own packs show on both. */
  function mode() { return S.mode === 'everyday' ? 'everyday' : 'bible'; }
  function setMode(m) { S.mode = m === 'everyday' ? 'everyday' : 'bible'; save(); }
  function allPacks() { return D.PACKS.concat(S.custom.map(function (c) { return { id: c.id, name: c.name, kn: c.name, en: c.name, lang: c.lang || 'en', custom: true, on: true, items: c.words.map(function (w) { return { w: w, ref: '', fact: '', kid: true, pack: c.id }; }) }; })); }
  function sidePacks() { return allPacks().filter(function (p) { return p.custom || p.mode === mode(); }); }
  // Kannada packs start on only when the app is in Kannada; a pack you switch on or off stays that way.
  // Packs marked lang 'any' (the DJNC Songbook) start on in both languages.
  function packOn(p) { var v = S.packsOn[p.id]; if (v != null) return !!v; if (p.lang === 'kn' && !p.custom) return S.lang === 'kn'; return p.on !== false; }
  function pool(opts) {
    opts = opts || {};
    var out = [];
    sidePacks().forEach(function (p) {
      if (!packOn(p)) return;
      if (opts.songs ? !p.songs : p.songs) return;
      out = out.concat(p.items);
    });
    if (S.kids) out = out.filter(function (x) { return x.kid; });
    if (!out.length) {   // every pack switched off: fall back to this side's first pack
      var first = D.PACKS.filter(function (p) { return p.mode === mode() && !!p.songs === !!opts.songs; })[0];
      out = first.items.filter(function (x) { return !S.kids || x.kid; });
    }
    return out;
  }
  function wordLang() { return S.lang === 'kn' ? 'kn' : 'en'; }
  // Prompts for this side. Fill the Verse becomes Fill the Phrase (sayings) on the Everyday side.
  function list(name) {
    if (name === 'VERSES' && mode() === 'everyday') name = 'SAYINGS';
    return D[name].filter(function (x) { return x.mode === mode() && (!S.kids || x.kid) && (!x.lang || x.lang === 'en' || S.lang === 'kn'); });
  }

  /* ---------------- sound & vibration ----------------
     Android: navigator.vibrate. iPhone: Safari has no vibrate, so a hidden
     switch control is toggled, which gives a short haptic tap (iOS may only
     allow it right after a touch). A matching sound always plays. */
  var AC = null, hapLabel = null;
  function audioOn() { if (!S.sound) return; try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} }
  function tone(f, dur, type, vol, at, slide) {
    if (!S.sound || !AC) return;
    try {
      var t0 = AC.currentTime + (at || 0), o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
      g.gain.setValueAtTime(vol || .12, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + dur + .02);
    } catch (e) {}
  }
  var SFX = {
    tick: function (s) { tone(1800 + (s || 0) * 900, .035, 'square', .05 + (s || 0) * .08, 0, 400); },
    good: function () { tone(660, .12, 'triangle', .14); tone(990, .16, 'triangle', .14, .09); },
    pass: function () { tone(330, .14, 'sine', .1, 0, 220); },
    bad: function () { tone(180, .3, 'sawtooth', .12, 0, 90); },
    beep: function () { tone(880, .08, 'square', .08); },
    end: function () { tone(440, .5, 'sawtooth', .14, 0, 220); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .25, 'triangle', .13, i * .09); }); },
    boom: function () { tone(90, .6, 'sawtooth', .2, 0, 40); }
  };
  function sfx(n, a) { audioOn(); if (SFX[n]) SFX[n](a); }
  function haptic(pattern) {
    if (!S.haptic) return;
    try { if (navigator.vibrate) { navigator.vibrate(pattern); return; } } catch (e) {}
    try {
      if (!hapLabel) {
        hapLabel = document.createElement('label');
        hapLabel.setAttribute('aria-hidden', 'true');
        hapLabel.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden';
        hapLabel.innerHTML = '<input type="checkbox" switch tabindex="-1">';
        document.body.appendChild(hapLabel);
      }
      hapLabel.click();
    } catch (e) {}
  }

  /* ---------------- screen wake lock while playing ---------------- */
  var lock = null, wantLock = false;
  function wake(on) {
    wantLock = on;
    if (on && !lock && 'wakeLock' in navigator && !document.hidden) {
      navigator.wakeLock.request('screen').then(function (l) { lock = l; l.addEventListener('release', function () { lock = null; }); }).catch(function () {});
    } else if (!on && lock) { lock.release().catch(function () {}); lock = null; }
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && wantLock) wake(true); });

  /* ---------------- timers that stop when the screen changes ---------------- */
  var timers = [];
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function every(fn, ms) { var id = setInterval(fn, ms); timers.push(id); return id; }
  function stopTimers() { timers.forEach(function (id) { clearTimeout(id); clearInterval(id); }); timers = []; running = []; pausedNow = false; }
  // countdown(sec, onTick(left), onEnd)
  // Timers pause while the scoreboard panel is open during a game.
  var running = [], pausedNow = false;
  function isPaused() { return pausedNow; }
  function pauseAll() { pausedNow = true; running.forEach(function (c) { c.pause(); }); }
  function resumeAll() { pausedNow = false; running.forEach(function (c) { c.resume(); }); }
  function countdown(sec, onTick, onEnd) {
    var end = Date.now() + sec * 1000, last = -1, paused = false, leftAtPause = 0, self;
    var id = every(function () {
      if (paused) return;
      var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      if (left !== last) { last = left; onTick(left); if (left <= 5 && left > 0) sfx('beep'); }
      if (left === 0) { clearInterval(id); drop(); sfx('end'); haptic([60, 40, 140]); onEnd(); }
    }, 200);
    function drop() { running = running.filter(function (c) { return c !== self; }); }
    onTick(sec);
    self = {
      stop: function () { clearInterval(id); drop(); },
      pause: function () { if (!paused) { paused = true; leftAtPause = end - Date.now(); } },
      resume: function () { if (paused) { paused = false; end = Date.now() + leftAtPause; } },
      add: function (s) { end += s * 1000; }
    };
    running.push(self);
    if (pausedNow) self.pause();
    return self;
  }


  /* ---------------- how long to play ----------------
     time:  round length for timed games (per game, saved).  Custom: 15 s to 10 min in 15 s steps.
     count: questions or spins per game (0 = unlimited).
     fuse:  how long Hot Potato's hidden timer can run. */
  var TIMES = [30, 45, 60, 90, 120, 180], COUNTS = [5, 10, 20, 0], FUSES = ['short', 'medium', 'long', 'random'];
  var FUSE_MS = { short: [8000, 18000], medium: [15000, 45000], long: [35000, 75000], random: [8000, 75000] };
  function fmt(sec) { sec = Math.max(0, Math.round(sec)); return sec < 60 ? String(sec) : Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2); }
  function timeLabel(sec) { if (sec < 60) return sec + ' ' + t('sec'); if (sec % 60 === 0) return (sec / 60) + ' ' + t('min'); if (sec % 60 === 30) return Math.floor(sec / 60) + '½ ' + t('min'); return fmt(sec); }
  function roundTime(gid) { var v = +S.times[gid]; return v >= 15 && v <= 600 ? v : S.time; }
  function playCount(gid) { var v = S.counts[gid]; return v == null ? 0 : +v; }
  function fuseRange() { return FUSE_MS[S.fuse] || FUSE_MS.medium; }
  function pickerHTML(kind, gid) {
    var cur, opts, label;
    if (kind === 'time') { cur = roundTime(gid); label = t('roundTime'); opts = TIMES.map(function (v) { return [v, timeLabel(v)]; }); }
    else if (kind === 'count') { cur = playCount(gid); label = t('howMany'); opts = COUNTS.map(function (v) { return [v, v ? String(v) : t('unlimited')]; }); }
    else { cur = S.fuse; label = t('bombTimer'); opts = FUSES.map(function (v) { return [v, t('fuse_' + v)]; }); }
    var custom = kind === 'time' && TIMES.indexOf(cur) < 0;
    return '<div class="pick" data-pick="' + kind + '"><div class="pick-lbl">' + esc(label) + '</div><div class="chips wrap pick-row">' +
      opts.map(function (o) { return '<button class="chip" type="button" data-pv="' + o[0] + '" aria-pressed="' + (String(cur) === String(o[0])) + '">' + esc(o[1]) + '</button>'; }).join('') +
      (kind === 'time' ? '<button class="chip" type="button" data-pv="custom" aria-pressed="' + custom + '">' + esc(t('custom')) + '</button>' : '') + '</div>' +
      (kind === 'time' ? '<div class="stepper" ' + (custom ? '' : 'hidden') + '><button class="ib" type="button" data-step="-15" aria-label="−15 ' + esc(t('sec')) + '">−</button><b class="sv">' + esc(timeLabel(cur)) + '</b><button class="ib" type="button" data-step="15" aria-label="+15 ' + esc(t('sec')) + '">+</button></div>' : '') + '</div>';
  }
  function bindPicker(root, gid) {
    $$('[data-pick]', root).forEach(function (box) {
      var kind = box.dataset.pick;
      function mark(v) { $$('[data-pv]', box).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.pv === String(v))); }); }
      function showStep(on) { var st = $('.stepper', box); if (st) { st.hidden = !on; $('.sv', st).textContent = timeLabel(roundTime(gid)); } }
      $$('[data-pv]', box).forEach(function (b) {
        b.onclick = function () {
          var v = b.dataset.pv; haptic(8);
          if (kind === 'time') {
            if (v === 'custom') { mark('custom'); showStep(true); return; }
            S.times[gid] = +v; mark(v); showStep(false);
          } else if (kind === 'count') { S.counts[gid] = +v; mark(v); }
          else { S.fuse = v; mark(v); }
          save();
        };
      });
      $$('[data-step]', box).forEach(function (b) {
        b.onclick = function () { S.times[gid] = Math.max(15, Math.min(600, roundTime(gid) + +b.dataset.step)); save(); haptic(6); showStep(true); };
      });
    });
  }

  /* ---------------- toast ---------------- */
  var toastT = 0;
  function toast(msg) {
    var el = $('#toast'); if (!el) return;
    el.textContent = msg; el.hidden = false; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 1900);
  }

  /* ---------------- screens ---------------- */
  var routes = {}, games = {}, ORDER = [], current = null, view = null, leaves = [];
  function onLeave(fn) { leaves.push(fn); }
  function route(name, fn) { routes[name] = fn; }
  function game(def) { games[def.id] = def; ORDER.push(def.id); }
  function go(name, params) {
    stopTimers(); wake(false);
    if (current && current.leave) try { current.leave(); } catch (e) {}
    leaves.forEach(function (fn) { try { fn(); } catch (e) {} }); leaves = [];
    current = null;
    view = $('#view');
    view.className = 'view' + (name === 'hub' ? ' is-hub' : '');
    view.scrollTop = 0;
    if (name.indexOf('game:') === 0) {
      var g = games[name.slice(5)];
      if (!g) return go('hub');
      current = g.start(view, params || {}) || null;
    } else if (routes[name]) {
      current = routes[name](view, params || {}) || null;
    } else return go('hub');
    view.classList.remove('flipin'); void view.offsetWidth; view.classList.add('flipin');
  }

  /* Top bar used on every inner screen */
  function bar(title, sub, opts) {
    opts = opts || {};
    return '<div class="topbar"><button class="back" data-back type="button">' + svg('back', 18) + '<span>' + esc(opts.backLabel || t('games')) + '</span></button>' +
      '<span class="grow"></span>' + (opts.right || '') +
      '<button class="ib" type="button" data-go="score" aria-label="' + esc(t('score')) + '">' + svg('trophy') + '</button></div>' +
      '<header class="ttl"><h1>' + esc(title) + '</h1>' + (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') + '</header>';
  }

  /* "Give the phone to …" screen. Hides what's next until they tap. */
  function handoff(view, o) {
    view.innerHTML = '<div class="handoff" style="--hc:' + (o.color || 'var(--a1)') + '">' +
      '<div class="ho-top">' + esc(o.team || '') + '</div>' +
      '<div class="ho-avatar">' + esc((o.name || '?').slice(0, 1).toUpperCase()) + '</div>' +
      '<p class="ho-lbl">' + esc(t('handTo')) + '</p><h1 class="ho-name">' + esc(o.name || '') + '</h1>' +
      (o.role ? '<p class="ho-role">' + esc(o.role) + '</p>' : '') +
      '<p class="ho-warn">' + esc(o.note || t('dontLook')) + '</p>' +
      (o.pick ? pickerHTML(o.pick, o.gid) : '') +
      '<button class="btn big" type="button" id="hoGo">' + esc(o.button || t('tapWhenReady')) + '</button></div>';
    haptic(20);
    if (o.pick) bindPicker(view, o.gid);
    $('#hoGo', view).onclick = function () { audioOn(); haptic(10); o.then(); };
  }

  /* Learn More card for a word with a Bible reference */
  function learnHTML(items) {
    var withRef = items.filter(function (x) { return x && x.ref; });
    if (!S.learn || !withRef.length) return '';
    return '<section class="learn"><h2>' + svg('book', 18) + esc(t('learnMore')) + '</h2>' +
      withRef.map(function (x) { return '<div class="lc"><b>' + esc(x.w) + '</b><span class="ref">' + esc(x.ref) + '</span>' + (x.fact ? '<p>' + esc(x.fact) + '</p>' : '') + '</div>'; }).join('') + '</section>';
  }

  /* Standard "after the game" buttons, aware of Party Night */
  function endButtons(gameId) {
    if (S.night) return '<button class="btn big" type="button" data-go="night">' + esc(t('next')) + ' ›</button>';
    return '<div class="row"><button class="btn alt" type="button" data-back>' + esc(t('backToGames')) + '</button><button class="btn" type="button" data-go="game:' + gameId + '">' + esc(t('playAgain')) + '</button></div>';
  }

  function confetti() {
    var c = document.createElement('div'); c.className = 'confetti'; c.setAttribute('aria-hidden', 'true');
    var html = ''; for (var i = 0; i < 44; i++) html += '<i style="left:' + (Math.random() * 100) + '%;background:' + COLORS[i % COLORS.length] + ';animation-duration:' + (1.6 + Math.random() * 1.8) + 's;animation-delay:' + (Math.random() * .5) + 's"></i>';
    c.innerHTML = html; $('#app').appendChild(c);
    setTimeout(function () { c.remove(); }, 4200);
  }

  window.Huddle = {
    S: S, save: save, D: D, esc: esc, t: t, shuffle: shuffle, uid: uid, $: $, $$: $$, svg: svg, deck: deck,
    addPlayer: addPlayer, removePlayer: removePlayer, randomTeams: randomTeams, teamOf: teamOf, teamLists: teamLists,
    moveToNextTeam: moveToNextTeam, setTeamCount: setTeamCount, teamName: teamName, teamColor: teamColor, teamsReady: teamsReady,
    addPoints: addPoints, pointsOf: pointsOf, resetScore: resetScore, solo: solo, sideCount: sideCount, setPlay: setPlay,
    isPaused: isPaused, pauseAll: pauseAll, resumeAll: resumeAll,
    allPacks: allPacks, packOn: packOn, pool: pool, wordLang: wordLang, list: list,
    sfx: sfx, audioOn: audioOn, haptic: haptic, wake: wake, later: later, every: every, countdown: countdown, stopTimers: stopTimers,
    toast: toast, onLeave: onLeave, fmt: fmt, roundTime: roundTime, playCount: playCount, fuseRange: fuseRange, pickerHTML: pickerHTML, bindPicker: bindPicker, route: route, game: game, games: games, ORDER: ORDER, go: go, bar: bar, handoff: handoff, learnHTML: learnHTML,
    endButtons: endButtons, confetti: confetti, TEAM_COLORS: TEAM_COLORS,
    // a game can have its own name and description on the Everyday side (g.everyday = {name, desc, how})
    gname: function (g) { var e = mode() === 'everyday' && g.everyday; if (S.lang === 'kn') { var k = e ? I.gamesKn[g.id + 'E'] : I.gamesKn[g.id]; if (k) return k[0]; } return e ? e.name : g.name; },
    gdesc: function (g) { var e = mode() === 'everyday' && g.everyday; if (S.lang === 'kn') { var k = e ? I.gamesKn[g.id + 'E'] : I.gamesKn[g.id]; if (k) return k[1]; } return e ? e.desc : g.desc; },
    ghow: function (g) { var e = mode() === 'everyday' && g.everyday; return e ? e.how : g.how; },
    mode: mode, setMode: setMode, sidePacks: sidePacks,
    iconSet: iconSet, __test: { fresh: fresh, load: load }
  };
})();
