/*
 * HUDDLE — the screens around the games: game picker, players & teams,
 * word packs (and your own shareable packs), settings, scoreboard,
 * Party Night and the import screen for a shared pack link.
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$, $$ = H.$$, svg = H.svg;
  var ORDER = ['act', 'forbid', 'one', 'draw', 'hum', 'potato', 'likely', 'spin', 'verse', 'odd'];
  // [id, name, swatch, light theme-color, dark theme-color (looks that follow the phone's dark mode)]
  var THEMES = [['playful', 'Illustrated & Playful', 'linear-gradient(135deg,#DDF1FF 50%,#FFC93C 50%)', '#DDF1FF', '#1A1838'],
    ['comic', 'Comic Splash', 'linear-gradient(135deg,#ffd400 50%,#ff2e2e 50%)', '#fff7c7'],
    ['arcade', 'Arcade Night', 'linear-gradient(135deg,#2b2ce0,#ff2bd6)', '#0d0b24'],
    ['graffiti', 'Graffiti', 'linear-gradient(135deg,#ff2a6d,#d1f700,#05d9e8)', '#d9d6cf']];
  // Preview only: ?look=<id>&mode=light|dark shows a look without saving it.
  var QS = new URLSearchParams(location.search), LOOK = QS.get('look'), MODE = QS.get('mode');
  var darkMQ = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  var QR_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  var filter = 'all', route = 'hub';
  function games() { return ORDER.map(function (id) { return H.games[id]; }).filter(Boolean); }

  /* ---------- look & language ---------- */
  var lastColor = '';
  function applyLook() {
    var app = $('#app');
    if (!THEMES.some(function (x) { return x[0] === S.theme; })) S.theme = 'playful';
    var look = THEMES.some(function (x) { return x[0] === LOOK; }) ? LOOK : S.theme;
    app.dataset.theme = look;
    // Light / dark: the Appearance setting, or the phone's own setting when it's "Match phone"
    var mode = (MODE === 'light' || MODE === 'dark') ? MODE : (S.appear === 'dark' || S.appear === 'light') ? S.appear : '';
    if (mode) app.dataset.mode = mode; else delete app.dataset.mode;
    var set = H.iconSet();   // swap icons already on screen to this look's set
    $$('use').forEach(function (u) { var h = u.getAttribute('href') || ''; if (/^#[ip]-/.test(h) && h.charAt(1) !== set) u.setAttribute('href', '#' + set + h.slice(2)); });
    document.documentElement.lang = S.lang === 'kn' ? 'kn' : 'en';
    var th = THEMES.filter(function (x) { return x[0] === look; })[0];
    var dark = mode ? mode === 'dark' : !!(darkMQ && darkMQ.matches);
    var c = (dark && th[4]) || th[3];
    if (c !== lastColor) {   // write theme-color only when it actually changes
      lastColor = c;
      var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', c);
      document.body.style.background = c;
    }
  }

  if (darkMQ && darkMQ.addEventListener) darkMQ.addEventListener('change', applyLook);

  /* ---------- the game picker ---------- */
  H.route('hub', function (view) {
    route = 'hub';
    var kinds = [['all', t('all')], ['words', t('words')], ['party', t('party')], ['quick', t('quick')]];
    var list = games().filter(function (g) { return filter === 'all' || g.kind === filter; });
    var lists = H.teamLists(), np = S.players.length;
    var who = np ? np + ' ' + t('playersLc') + ' · ' + (H.solo() ? t('individualLc') : S.teams.count + ' ' + t('teamsLc')) : t('noPlayers');
    view.innerHTML =
      '<div class="top"><h1 class="logo">Hud<span>dle</span></h1><span class="grow"></span>' +
      '<button class="ib lang" type="button" id="lang" aria-label="' + esc(t('language')) + '">' + (S.lang === 'kn' ? 'EN' : 'ಕ') + '</button>' +
      '<button class="ib" type="button" data-go="players" aria-label="' + esc(t('playersTeams')) + '">' + svg('users') + '</button>' +
      '<button class="ib" type="button" data-go="settings" aria-label="' + esc(t('settings')) + '">' + svg('gear') + '</button></div>' +
      '<div class="hello"><span class="mascot" aria-hidden="true"></span><h2 class="h">' + esc(t('pickGame')) + '</h2><p class="sub"><button class="link" type="button" data-go="players" style="padding:2px 0">' + esc(who) + '</button> · <button class="link" type="button" data-go="packs" style="padding:2px 0">' + esc(packSummary()) + '</button>' + (S.kids ? ' · ' + esc(t('kids')) : '') + '</p></div>' +
      '<div class="side" role="group" aria-label="' + esc(t('sideLabel')) + '"><span class="side-lbl">' + esc(t('sideLabel')) + '</span><span class="side-seg">' +
        [['bible', 'cross', t('sideBible')], ['everyday', 'star', t('sideEveryday')]].map(function (x) { return '<button type="button" data-side="' + x[0] + '" aria-pressed="' + (H.mode() === x[0]) + '"><span class="mk mk-' + x[0] + '">' + svg(x[1], 14) + '</span>' + esc(x[2]) + '</button>'; }).join('') + '</span></div>' +
      '<button class="night" type="button" data-go="night"><span class="ic">' + svg('night', 26) + '</span><span class="grow"><b>' + esc(t('partyNight')) + '</b><small>' + esc(S.night ? t('nightOn') : t('partyNightSub')) + '</small></span>' + svg('back', 20).replace('class="i"', 'class="i" style="transform:rotate(180deg)"') + '</button>' +
      '<div class="chips" role="group" aria-label="' + esc(t('games')) + '">' + kinds.map(function (k) { return '<button class="chip" type="button" data-filter="' + k[0] + '" aria-pressed="' + (filter === k[0]) + '">' + esc(k[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="grid">' + list.map(function (g) {
        return '<button class="gc" type="button" data-go="game:' + g.id + '"><span class="tag">' + esc(t(g.tag)) + '</span><span class="ic">' + svg(g.id, 26) + '</span><b>' + esc(H.gname(g)) + '</b><small>' + esc(H.gdesc(g)) + '</small></button>';
      }).join('') + '</div>' +
      '<div class="row"><button class="btn alt" type="button" data-go="score">' + svg('trophy') + esc(t('score')) + '</button><button class="btn alt" type="button" data-go="packs">' + svg('pack') + esc(t('packs')) + '</button></div>' +
      '<div class="foot">' + (window.AppAbout ? AppAbout.linkHTML() : '') + '</div>';
    $$('[data-filter]', view).forEach(function (b) { b.onclick = function () { filter = b.dataset.filter; H.go('hub'); }; });
    $$('[data-side]', view).forEach(function (b) { b.onclick = function () {
      if (H.mode() === b.dataset.side) return;
      H.setMode(b.dataset.side); H.haptic(15); H.sfx('tick', .6);
      H.go('hub'); H.toast(t(H.mode() === 'bible' ? 'sideBibleOn' : 'sideEverydayOn'));
    }; });
    $('#lang', view).onclick = function () { S.lang = S.lang === 'kn' ? 'en' : 'kn'; H.save(); applyLook(); H.go('hub'); };
  });
  function packSummary() {
    var on = H.sidePacks().filter(H.packOn);
    var n = on.reduce(function (s, p) { return s + p.items.length; }, 0);
    return n + ' ' + t('wordsLc') + ' · ' + on.length + ' ' + t('packsLc');
  }

  /* ---------- players & teams ---------- */
  H.route('players', function (view) {
    route = 'players';
    var sel = null;   // in "choose myself" mode, tap a player to move them on
    function draw() {
      var lists = H.teamLists();
      view.innerHTML = H.bar(t('playersTeams'), t('playersSub')) +
        '<div class="card stack"><form class="field" id="add" autocomplete="off"><label class="sr-only" for="pn">' + esc(t('playerName')) + '</label><input class="inp" id="pn" maxlength="16" placeholder="' + esc(t('playerName')) + '" enterkeyhint="done"><button class="btn sm" type="submit">' + svg('plus') + esc(t('add')) + '</button></form>' +
        (S.players.length ? '<div class="pl">' + S.players.map(function (p) { return '<button class="pchip" type="button" data-rm="' + p.id + '" aria-label="' + esc(t('remove') + ' ' + p.name) + '"><i style="background:' + p.color + '">' + esc(p.name[0].toUpperCase()) + '</i><span>' + esc(p.name) + '</span><span class="x">×</span></button>'; }).join('') + '</div>' : '<p class="hint">' + esc(t('addSome')) + '</p>') + '</div>' +
        '<div class="card stack"><div class="set"><span class="lbl"><b>' + esc(t('howToPlay')) + '</b><small>' + esc(H.solo() ? t('soloSub') : t('teamsSub')) + '</small></span><span class="seg">' +
          [['teams', t('teams')], ['solo', t('individual')]].map(function (m) { return '<button type="button" data-play="' + m[0] + '" aria-pressed="' + ((H.solo() ? 'solo' : 'teams') === m[0]) + '">' + esc(m[1]) + '</button>'; }).join('') + '</span></div></div>' +
        (H.solo() ? '' : '<div class="card stack"><div class="set"><span class="lbl"><b>' + esc(t('teamCount')) + '</b></span><span class="seg">' + [2, 3, 4].map(function (n) { return '<button type="button" data-tc="' + n + '" aria-pressed="' + (S.teams.count === n) + '">' + n + '</button>'; }).join('') + '</span></div>' +
        '<div class="set"><span class="lbl"><b>' + esc(t('howTeams')) + '</b></span></div>' +
        '<div class="row"><button class="chip" type="button" data-mode="random" aria-pressed="' + (S.teams.mode === 'random') + '" style="justify-content:center">' + svg('shuffle', 18) + esc(t('random')) + '</button><button class="chip" type="button" data-mode="manual" aria-pressed="' + (S.teams.mode === 'manual') + '" style="justify-content:center">' + svg('users', 18) + esc(t('manual')) + '</button></div>' +
        (S.teams.mode === 'random' ? '<button class="btn b2" type="button" id="shuf">' + svg('shuffle') + esc(t('shuffle')) + '</button>' : '<p class="hint">' + esc(t('tapToMove')) + '</p>') + '</div>') +
        (H.solo() ? '' : lists.map(function (l, i) {
          return '<div class="team" style="--tc:' + H.teamColor(i) + '"><div class="tn"><label class="sr-only" for="tn' + i + '">' + esc(t('teamName')) + '</label><input id="tn' + i + '" data-tn="' + i + '" value="' + esc(H.teamName(i)) + '" maxlength="18"><span class="count">' + l.length + '</span></div>' +
            '<div class="pl" data-empty="' + esc(t('noOneYet')) + '">' + l.map(function (p) { return '<button class="pchip' + (sel === p.id ? ' sel' : '') + '" type="button" data-mv="' + p.id + '"><i style="background:' + p.color + '">' + esc(p.name[0].toUpperCase()) + '</i><span>' + esc(p.name) + '</span></button>'; }).join('') + '</div></div>';
        }).join('')) +
        '<button class="btn big" type="button" data-back>' + esc(t('done')) + '</button>';
      $('#add', view).onsubmit = function (e) {
        e.preventDefault(); var v = $('#pn', view).value;
        if (S.players.some(function (p) { return p.name.toLowerCase() === v.trim().toLowerCase(); })) { H.toast(t('sameName')); return; }
        if (S.players.length >= 24) { H.toast(t('tooMany')); return; }
        if (H.addPlayer(v)) { H.haptic(10); draw(); var i = $('#pn', view); i.focus(); }
      };
      $$('[data-rm]', view).forEach(function (b) { b.onclick = function () { H.removePlayer(b.dataset.rm); draw(); }; });
      $$('[data-play]', view).forEach(function (b) { b.onclick = function () { H.setPlay(b.dataset.play); H.haptic(10); draw(); }; });
      $$('[data-tc]', view).forEach(function (b) { b.onclick = function () { H.setTeamCount(+b.dataset.tc); draw(); }; });
      $$('[data-mode]', view).forEach(function (b) { b.onclick = function () { S.teams.mode = b.dataset.mode; if (S.teams.mode === 'random') H.randomTeams(); H.save(); draw(); }; });
      var sh = $('#shuf', view); if (sh) sh.onclick = function () { H.randomTeams(); H.sfx('tick', .6); H.haptic(15); draw(); };
      $$('[data-tn]', view).forEach(function (inp) { inp.onchange = function () { S.teams.names[+inp.dataset.tn] = inp.value.trim().slice(0, 18) || H.teamName(+inp.dataset.tn); H.save(); }; });
      $$('[data-mv]', view).forEach(function (b) {
        b.onclick = function () {
          // moving a player means you're choosing teams yourself
          if (S.teams.mode !== 'manual') { S.teams.mode = 'manual'; }
          H.moveToNextTeam(b.dataset.mv); H.haptic(8); draw();
        };
      });
    }
    draw();
  });

  /* ---------- word packs ---------- */
  H.route('packs', function (view) {
    route = 'packs';
    function draw() {
      var packs = H.sidePacks();
      view.innerHTML = H.bar(t('packs'), t('packsSub')) +
        packs.map(function (p) {
          var on = H.packOn(p), name = S.lang === 'kn' ? p.kn : (p.en || p.name);
          var show = p.items.filter(function (x) { return !S.kids || x.kid; });
          return '<div class="card pack"><div class="ph"><b>' + esc(name) + '<small>' + show.length + ' ' + t('wordsLc') + (p.songs ? ' · ' + esc(H.gname(H.games.hum)) : '') + (p.custom ? ' · ' + esc(t('yours')) : '') + '</small></b>' +
            '<button class="tog" type="button" data-pk="' + p.id + '" aria-pressed="' + on + '" aria-label="' + esc(name) + '"></button></div>' +
            '<div class="pl">' + show.slice(0, 6).map(function (x) { return '<span class="pchip wchip">' + esc(x.w) + '</span>'; }).join('') + (show.length > 6 ? '<span class="pchip wchip more">+' + (show.length - 6) + '</span>' : '') + '</div>' +
            (p.custom ? '<div class="row"><button class="btn alt sm" type="button" data-edit="' + p.id + '">' + esc(t('edit')) + '</button><button class="btn b2 sm" type="button" data-share="' + p.id + '">' + svg('share', 18) + esc(t('share')) + '</button></div>' : '') + '</div>';
        }).join('') +
        '<button class="btn" type="button" data-go="packedit">' + svg('plus') + esc(t('myPack')) + '</button>' +
        '<p class="hint">' + esc(t(H.mode() === 'bible' ? 'sideNote' : 'sideNoteB')) + '</p>' +
        '<p class="hint">' + esc(t('kidsNote')) + '</p>';
      $$('[data-pk]', view).forEach(function (b) { b.onclick = function () { var p = H.allPacks().filter(function (x) { return x.id === b.dataset.pk; })[0]; S.packsOn[p.id] = !H.packOn(p); H.save(); b.setAttribute('aria-pressed', String(H.packOn(p))); H.haptic(8); }; });
      $$('[data-edit]', view).forEach(function (b) { b.onclick = function () { H.go('packedit', { id: b.dataset.edit }); }; });
      $$('[data-share]', view).forEach(function (b) { b.onclick = function () { shareSheet(S.custom.filter(function (c) { return c.id === b.dataset.share; })[0]); }; });
    }
    draw();
  });

  // custom packs: [{id, name, words:[...]}]
  function parseWords(txt) {
    var seen = {};
    return String(txt || '').split(/[\n,]+/).map(function (w) { return w.trim().slice(0, 40); }).filter(function (w) { var k = w.toLowerCase(); if (!w || seen[k]) return false; seen[k] = 1; return true; }).slice(0, 200);
  }
  H.parseWords = parseWords;
  H.route('packedit', function (view, o) {
    route = 'packedit';
    var c = S.custom.filter(function (x) { return x.id === o.id; })[0] || null;
    view.innerHTML = H.bar(c ? t('edit') : t('myPack'), t('myPackSub'), { backLabel: t('packs') }) +
      '<div class="card stack"><label class="sec" for="pname" style="margin:0">' + esc(t('packName')) + '</label><input class="inp" id="pname" maxlength="30" value="' + esc(c ? c.name : '') + '" placeholder="' + esc(t('packNameEg')) + '">' +
      '<label class="sec" for="pwords" style="margin:0">' + esc(t('wordsOnePerLine')) + '</label><textarea class="inp" id="pwords" placeholder="' + esc(t('wordsEg')) + '">' + esc(c ? c.words.join('\n') : '') + '</textarea><p class="hint" id="pcount"></p></div>' +
      '<button class="btn big" type="button" id="psave">' + esc(t('save')) + '</button>' +
      (c ? '<button class="btn alt" type="button" id="pdel">' + svg('trash') + esc(t('delete')) + '</button>' : '');
    function cnt() { $('#pcount', view).textContent = parseWords($('#pwords', view).value).length + ' ' + t('wordsLc'); }
    $('#pwords', view).oninput = cnt; cnt();
    $('#psave', view).onclick = function () {
      var name = $('#pname', view).value.trim().slice(0, 30), words = parseWords($('#pwords', view).value);
      if (!name) { H.toast(t('needName')); $('#pname', view).focus(); return; }
      if (words.length < 3) { H.toast(t('needWords')); return; }
      if (c) { c.name = name; c.words = words; } else { c = { id: 'c' + H.uid(), name: name, words: words }; S.custom.push(c); S.packsOn[c.id] = true; }
      H.save(); H.sfx('good'); H.go('packs');
      shareSheet(c);
    };
    var del = $('#pdel', view);
    if (del) del.onclick = function () {
      if (del.dataset.sure) { S.custom = S.custom.filter(function (x) { return x !== c; }); delete S.packsOn[c.id]; H.S.custom = S.custom; H.save(); H.go('packs'); return; }
      del.dataset.sure = '1'; del.textContent = t('deleteSure');
    };
  });

  /* ---------- share a pack by link or QR ---------- */
  function b64u(str) { var b = btoa(unescape(encodeURIComponent(str))); return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }
  function packLink(c) { return location.origin + location.pathname.replace(/index\.html$/, '') + '?pack=' + b64u(JSON.stringify({ n: c.name, w: c.words })); }
  function readPack(code) {
    try { var o = JSON.parse(unb64u(code)); if (!o || typeof o.n !== 'string' || !Array.isArray(o.w)) return null; var w = parseWords(o.w.join('\n')); return w.length ? { name: o.n.slice(0, 30), words: w } : null; } catch (e) { return null; }
  }
  H.packLink = packLink; H.readPack = readPack;
  // draw a QR code for text into el (the library loads once, then works offline)
  H.qr = function (el, text) {
    loadQR().then(function (ok) {
      if (!ok) { el.innerHTML = '<span style="color:#555;font-size:13px;max-width:200px;text-align:center">' + esc(t('qrOffline')) + '</span>'; return; }
      el.innerHTML = ''; try { new window.QRCode(el, { text: text, width: 400, height: 400, correctLevel: window.QRCode.CorrectLevel.M }); } catch (e) {}
    });
  };
  function loadQR() {
    if (window.QRCode) return Promise.resolve(true);
    return new Promise(function (ok) { var s = document.createElement('script'); s.src = QR_LIB; s.onload = function () { ok(!!window.QRCode); }; s.onerror = function () { ok(false); }; document.head.appendChild(s); });
  }
  function sheet(html) {
    var ov = document.createElement('div'); ov.className = 'sheetov';
    ov.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '<button class="btn alt" type="button" data-close>' + esc(t('done')) + '</button></div>';
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('[data-close]')) ov.remove(); });
    $('#app').appendChild(ov); H.onLeave(function () { ov.remove(); });
    return ov;
  }
  function shareSheet(c) {
    if (!c) return;
    var url = packLink(c);
    var ov = sheet('<h2>' + esc(t('share')) + ' · ' + esc(c.name) + '</h2><p class="sub" style="margin:0">' + esc(t('shareSub')) + '</p>' +
      '<div class="qr" id="qr"><span class="mute" style="color:#555">…</span></div>' +
      '<div class="row"><button class="btn" type="button" id="sh">' + svg('share') + esc(t('share')) + '</button><button class="btn b2" type="button" id="cp">' + esc(t('copyLink')) + '</button></div>' +
      '<a class="btn b4" id="wa" href="https://wa.me/?text=' + encodeURIComponent(t('waText') + ' ' + c.name + ': ' + url) + '" target="_blank" rel="noopener">WhatsApp</a>');
    if (!navigator.share) $('#sh', ov).hidden = true;
    $('#sh', ov).onclick = function () { navigator.share({ title: 'Huddle: ' + c.name, text: t('waText') + ' ' + c.name, url: url }).catch(function () {}); };
    $('#cp', ov).onclick = function () {
      var done = function () { H.toast(t('linkCopied')); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { prompt('', url); });
      else prompt('', url);
    };
    var q = $('#qr', ov);
    if (url.length > 2300) { q.innerHTML = '<span style="color:#555;font-size:13px;max-width:200px;text-align:center">' + esc(t('qrTooLong')) + '</span>'; return; }
    loadQR().then(function (ok) {
      if (!ok) { q.innerHTML = '<span style="color:#555;font-size:13px;max-width:200px;text-align:center">' + esc(t('qrOffline')) + '</span>'; return; }
      q.innerHTML = '';
      try { new window.QRCode(q, { text: url, width: 400, height: 400, correctLevel: window.QRCode.CorrectLevel.L }); }
      catch (e) { q.innerHTML = '<span style="color:#555;font-size:13px">' + esc(t('qrTooLong')) + '</span>'; }
    });
  }

  /* ---------- opening a shared pack link ---------- */
  H.route('import', function (view, o) {
    route = 'import';
    var p = o.pack;
    view.innerHTML = H.bar(t('importTitle'), t('importSub')) +
      '<div class="card pack"><div class="ph"><b>' + esc(p.name) + '<small>' + p.words.length + ' ' + t('wordsLc') + '</small></b></div><div class="pl">' + p.words.slice(0, 30).map(function (w) { return '<span class="pchip wchip">' + esc(w) + '</span>'; }).join('') + (p.words.length > 30 ? '<span class="pchip wchip more">+' + (p.words.length - 30) + '</span>' : '') + '</div></div>' +
      '<button class="btn big" type="button" id="imp">' + svg('plus') + esc(t('addPack')) + '</button><button class="btn alt" type="button" data-back>' + esc(t('noThanks')) + '</button>';
    $('#imp', view).onclick = function () {
      var same = S.custom.filter(function (c) { return c.name === p.name; })[0];
      if (same) same.words = p.words; else { var c = { id: 'c' + H.uid(), name: p.name, words: p.words }; S.custom.push(c); S.packsOn[c.id] = true; }
      H.save(); H.sfx('win'); H.toast(t('packAdded')); H.go('packs');
    };
  });

  /* ---------- settings ---------- */
  H.route('settings', function (view) {
    route = 'settings';
    function tog(k, label, sub) { return '<div class="set"><span class="lbl"><b>' + esc(label) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span><button class="tog" type="button" data-set="' + k + '" aria-pressed="' + !!S[k] + '" aria-label="' + esc(label) + '"></button></div>'; }
    view.innerHTML = H.bar(t('settings'), '') +
      '<div class="card"><h2>' + esc(t('look')) + '</h2><div class="chips wrap">' + THEMES.map(function (x) { return '<button class="chip" type="button" data-theme-pick="' + x[0] + '" aria-pressed="' + (S.theme === x[0]) + '"><i style="width:18px;height:18px;border-radius:50%;border:1.5px solid currentColor;background:' + x[2] + '"></i>' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="card"><div class="set"><span class="lbl"><b>' + esc(t('appearance')) + '</b><small>' + esc(t('appearanceSub')) + '</small></span><span class="seg">' + [['light', t('light')], ['dark', t('dark')], ['auto', t('matchPhone')]].map(function (m) { return '<button type="button" data-ap="' + m[0] + '" aria-pressed="' + ((S.appear || 'light') === m[0]) + '">' + esc(m[1]) + '</button>'; }).join('') + '</span></div></div>' +
      '<div class="card"><div class="set"><span class="lbl"><b>' + esc(t('language')) + '</b></span><span class="seg"><button type="button" data-lg="en" aria-pressed="' + (S.lang === 'en') + '">English</button><button type="button" data-lg="kn" aria-pressed="' + (S.lang === 'kn') + '">ಕನ್ನಡ</button></span></div>' +
      '<div class="set"><span class="lbl"><b>' + esc(t('roundTime')) + '</b></span><span class="seg">' + [30, 45, 60, 90].map(function (n) { return '<button type="button" data-tm="' + n + '" aria-pressed="' + (S.time === n) + '">' + n + '</button>'; }).join('') + '</span></div>' +
      tog('kids', t('kids'), t('kidsSub')) + tog('learn', t('learnCards'), t('learnCardsSub')) + tog('sound', t('sound')) + tog('haptic', t('haptics'), t('hapticsSub')) + tog('tilt', t('tilt'), t('tiltSub')) + '</div>' +
      '<button class="btn alt" type="button" data-go="tilt">' + svg('phone') + esc(t('tiltTest')) + '</button>' +
      '<button class="btn alt" type="button" id="feel">' + esc(t('testFeel')) + '</button>' +
      '<div class="foot">' + (window.AppAbout ? AppAbout.linkHTML() : '') + '</div>';
    $$('[data-set]', view).forEach(function (b) { b.onclick = function () { var k = b.dataset.set; S[k] = !S[k]; H.save(); b.setAttribute('aria-pressed', String(S[k])); if (k === 'haptic' && S[k]) H.haptic(30); if (k === 'sound' && S[k]) H.sfx('good'); }; });
    $$('[data-theme-pick]', view).forEach(function (b) { b.onclick = function () { S.theme = b.dataset.themePick; H.save(); applyLook(); $$('[data-theme-pick]', view).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
    $$('[data-ap]', view).forEach(function (b) { b.onclick = function () { S.appear = b.dataset.ap; H.save(); applyLook(); $$('[data-ap]', view).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
    $$('[data-lg]', view).forEach(function (b) { b.onclick = function () { S.lang = b.dataset.lg; H.save(); applyLook(); H.go('settings'); }; });
    $$('[data-tm]', view).forEach(function (b) { b.onclick = function () { S.time = +b.dataset.tm; H.save(); $$('[data-tm]', view).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
    $('#feel', view).onclick = function () { H.sfx('tick', .8); H.haptic(30); };
  });

  /* ---------- scoreboard for the night ---------- */
  H.route('score', function (view) {
    route = 'score';
    function draw() {
      view.innerHTML = H.bar(t('score'), t('scoreSub')) + scoreRows(true) +
        '<button class="btn alt" type="button" id="reset">' + esc(t('resetNight')) + '</button>';
      bindScoreRows(view, draw);
      var r = $('#reset', view);
      r.onclick = function () { if (!r.dataset.sure) { r.dataset.sure = 1; r.textContent = t('resetSure'); return; } H.resetScore(); S.night = null; H.save(); draw(); };
    }
    draw();
  });

  // One row per side (team, or player in Individual), with optional − / + buttons
  function scoreRows(edit) {
    var lists = H.teamLists(), n = H.sideCount(), max = 0, i;
    if (!n) return '<p class="hint">' + esc(t('noPlayers')) + '</p>';
    for (i = 0; i < n; i++) max = Math.max(max, H.pointsOf(i));
    return lists.map(function (l, i) {
      var p = H.pointsOf(i), who = H.solo() ? '' : '<br><small class="mute" style="font:600 13px var(--fb)">' + esc(l.map(function (x) { return x.name; }).join(', ') || t('noOneYet')) + '</small>';
      return '<div class="score-row' + (p && p === max ? ' lead' : '') + '" style="--tc:' + H.teamColor(i) + '"><span class="sw"></span><b>' + esc(H.teamName(i)) + who + '</b>' +
        (edit ? '<span class="pm"><button type="button" data-m="' + i + '" aria-label="−1">−</button></span>' : '') + '<span class="pts">' + p + '</span>' +
        (edit ? '<span class="pm"><button type="button" data-p="' + i + '" aria-label="+1">+</button></span>' : '') + '</div>';
    }).join('');
  }
  function bindScoreRows(root, redraw) {
    $$('[data-p]', root).forEach(function (b) { b.onclick = function () { H.addPoints(+b.dataset.p, 1, 'manual'); H.haptic(8); redraw(); }; });
    $$('[data-m]', root).forEach(function (b) { b.onclick = function () { H.addPoints(+b.dataset.m, -1, 'manual'); H.haptic(8); redraw(); }; });
  }
  // During a game the trophy opens the scoreboard as a panel over the game; timers pause until you go back.
  function scoreSheet() {
    if ($('#scoreSheet')) return;
    H.pauseAll();
    var ov = document.createElement('div'); ov.className = 'sheetov'; ov.id = 'scoreSheet';
    function close() { ov.remove(); H.resumeAll(); }
    function draw() {
      ov.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(t('score')) + '"><h2>' + esc(t('score')) + '</h2>' +
        '<p class="sub" style="margin:0">' + esc(t('pausedNote')) + '</p>' + scoreRows(true) +
        '<button class="btn big" type="button" id="resume">' + svg('back', 20) + esc(t('backToGame')) + '</button></div>';
      bindScoreRows(ov, draw);
      $('#resume', ov).onclick = close;
    }
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    draw();
    $('#app').appendChild(ov);
    H.onLeave(function () { ov.remove(); });
  }

  /* After a game ends (not in Party Night) */
  H.route('done', function (view, o) {
    route = 'done';
    var g = o.g;
    if (S.night) { H.go('night'); return; }
    view.innerHTML = H.bar(H.gname(g), t('tonight')) + standings() + H.endButtons(g.id);
  });
  function standings() {
    var rows = [];
    for (var i = 0; i < H.sideCount(); i++) rows.push({ i: i, p: H.pointsOf(i) });
    rows.sort(function (a, b) { return b.p - a.p; });
    return rows.map(function (r, k) { return '<div class="score-row' + (k === 0 && r.p ? ' lead' : '') + '" style="--tc:' + H.teamColor(r.i) + '"><span class="sw"></span><b>' + esc(H.teamName(r.i)) + '</b><span class="pts">' + r.p + '</span></div>'; }).join('');
  }

  /* ---------- Party Night: a running order and one scoreboard ---------- */
  H.route('night', function (view) {
    route = 'night';
    var N = S.night;
    if (!N) return plan(view);
    if (N.i >= N.plan.length) return finale(view);
    var g = H.games[N.plan[N.i]];
    view.innerHTML = H.bar(t('partyNight'), (N.i ? t('standings') : t('readyToStart'))) +
      (N.i ? standings() : '') +
      '<div class="card center stack"><div class="sec" style="margin:0">' + esc(t('upNext')) + ' · ' + (N.i + 1) + '/' + N.plan.length + '</div><div class="ic" style="margin:0 auto;color:var(--a1)">' + svg(g.id, 48) + '</div><div class="big" style="font-size:34px">' + esc(H.gname(g)) + '</div><p class="mute" style="margin:0">' + esc(H.ghow(g) || H.gdesc(g)) + '</p></div>' +
      '<button class="btn big" type="button" id="play">' + esc(t('playNext')) + ' ›</button>' +
      '<ol class="plan">' + N.plan.map(function (id, k) { return '<li class="' + (k < N.i ? 'done' : k === N.i ? 'now' : '') + '"><b>' + esc(H.gname(H.games[id])) + '</b>' + (k > N.i ? '<button type="button" data-skip="' + k + '" aria-label="' + esc(t('remove')) + '">' + svg('x', 16) + '</button>' : '') + '</li>'; }).join('') + '</ol>' +
      '<div class="row"><button class="btn alt" type="button" id="skipg">' + esc(t('skipGame')) + '</button><button class="btn alt" type="button" id="endn">' + esc(t('endNight')) + '</button></div>';
    $('#play', view).onclick = function () { N.i++; H.save(); H.audioOn(); H.go('game:' + g.id); };
    $('#skipg', view).onclick = function () { N.plan.splice(N.i, 1); H.save(); H.go('night'); };
    $('#endn', view).onclick = function () { N.i = N.plan.length; H.save(); H.go('night'); };
    $$('[data-skip]', view).forEach(function (b) { b.onclick = function () { N.plan.splice(+b.dataset.skip, 1); H.save(); H.go('night'); }; });
  });
  function plan(view) {
    var picked = ORDER.filter(function (id) { return ['act', 'forbid', 'potato', 'spin', 'verse', 'draw'].indexOf(id) >= 0; });
    function draw() {
      view.innerHTML = H.bar(t('partyNight'), t('partyNightSub')) +
        (H.teamsReady() ? '<div class="card center"><p style="margin:0 0 10px;font-weight:700">' + esc(H.teamsReady()) + '</p><button class="btn" type="button" data-go="players">' + svg('users') + esc(t('setUp')) + '</button></div>' : '') +
        '<div class="card"><h2>' + esc(t('pickGames')) + '</h2><div class="chips wrap">' + ORDER.map(function (id) { var on = picked.indexOf(id) >= 0; return '<button class="chip" type="button" data-pg="' + id + '" aria-pressed="' + on + '">' + svg(id, 18) + esc(H.gname(H.games[id])) + '</button>'; }).join('') + '</div></div>' +
        '<ol class="plan">' + picked.map(function (id, k) { return '<li><b>' + esc(H.gname(H.games[id])) + '</b>' + (k ? '<button type="button" data-upk="' + k + '" aria-label="' + esc(t('moveUp')) + '">' + svg('up', 16) + '</button>' : '') + '</li>'; }).join('') + '</ol>' +
        '<div class="row"><button class="btn b2" type="button" id="sur">' + svg('shuffle') + esc(t('surprise')) + '</button><button class="btn" type="button" id="go"' + (picked.length && !H.teamsReady() ? '' : ' disabled') + '>' + esc(t('startNight')) + '</button></div>' +
        '<p class="hint">' + esc(t('nightNote')) + '</p>';
      $$('[data-pg]', view).forEach(function (b) { b.onclick = function () { var id = b.dataset.pg, k = picked.indexOf(id); if (k >= 0) picked.splice(k, 1); else picked.push(id); draw(); }; });
      $$('[data-upk]', view).forEach(function (b) { b.onclick = function () { var k = +b.dataset.upk, x = picked[k]; picked[k] = picked[k - 1]; picked[k - 1] = x; draw(); }; });
      $('#sur', view).onclick = function () { picked = H.shuffle(picked.length ? picked : ORDER.slice()).slice(0, Math.max(picked.length, 5)); H.sfx('tick', .7); draw(); };
      $('#go', view).onclick = function () { if (!picked.length || H.teamsReady()) return; H.resetScore(); S.night = { plan: picked.slice(), i: 0 }; H.save(); H.go('night'); };
    }
    draw();
  }
  function finale(view) {
    var rows = [];
    for (var i = 0; i < H.sideCount(); i++) rows.push({ i: i, p: H.pointsOf(i) });
    if (!rows.length) rows.push({ i: 0, p: 0 });
    rows.sort(function (a, b) { return b.p - a.p; });
    var order = [1, 0, 2, 3].filter(function (k) { return k < rows.length; });   // 2nd, 1st, 3rd, 4th on the podium
    view.innerHTML = H.bar(t('finalResults'), t('partyNight')) +
      '<div class="card center"><div class="sec">' + esc(t('winner')) + '</div><div class="big" style="color:' + H.teamColor(rows[0].i) + '">' + esc(H.teamName(rows[0].i)) + '</div></div>' +
      '<div class="podium">' + order.map(function (k) { var r = rows[k]; return '<div class="p' + (k + 1) + '" style="--tc:' + H.teamColor(r.i) + '"><b>' + esc(H.teamName(r.i)) + '</b><div class="blk">' + r.p + '</div></div>'; }).join('') + '</div>' +
      '<button class="btn big" type="button" id="newn">' + esc(t('resetNight')) + '</button><button class="btn alt" type="button" id="home">' + esc(t('backToGames')) + '</button>';
    H.sfx('win'); H.confetti(); H.haptic([60, 40, 60, 40, 160]);
    $('#newn', view).onclick = function () { S.night = null; H.save(); H.go('night'); };
    $('#home', view).onclick = function () { S.night = null; H.save(); H.go('hub'); };
  }

  /* ---------- navigation ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go],[data-back]');
    if (!b || !$('#app').contains(b)) return;
    H.audioOn();
    if (b.hasAttribute('data-back')) { back(); return; }
    var to = b.getAttribute('data-go');
    if (route === 'hub' && to !== 'hub') { try { history.pushState({ inner: 1 }, ''); } catch (err) {} }
    if (to === 'score' && route.indexOf('game:') === 0) { scoreSheet(); return; }
    if (to.indexOf('game:') === 0) route = to;
    H.go(to);
  });
  function back() {
    var dest = (S.night && route.indexOf('game:') === 0) ? 'night' : (route === 'packedit' ? 'packs' : route === 'tilt' ? 'settings' : 'hub');
    if (dest === 'hub' && history.state && history.state.inner) { history.back(); return; }
    H.go(dest);
  }
  window.addEventListener('popstate', function () { if (route !== 'hub') H.go('hub'); });
  // keep route in sync for game screens started by other code
  var go0 = H.go;
  H.go = function (name, p) { route = name; return go0(name, p); };

  /* ---------- start ---------- */
  applyLook();
  var qs = new URLSearchParams(location.search), code = qs.get('pack');
  if (code) {
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    var p = readPack(code);
    if (p) { H.go('hub'); try { history.pushState({ inner: 1 }, ''); } catch (e) {} H.go('import', { pack: p }); }
    else { H.go('hub'); H.toast(t('badLink')); }
  } else H.go('hub');
})();
