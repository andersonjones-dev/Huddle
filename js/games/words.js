/*
 * HUDDLE — shared turn handling and the timed word games:
 * Forbidden Words, One Word and Hum That Tune.
 * Act It Out (act.js) and Draw It (draw.js) reuse the helpers here.
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$;

  /* ---------- whose turn is it ---------- */
  var turnState = { team: -1, pi: [0, 0, 0, 0], quick: false };
  // Returns {team, player} for the next team in order; player rotates inside each team.
  H.turn = function () {
    if (turnState.quick) return { team: -1, player: null };
    var lists = H.teamLists();
    turnState.team = (turnState.team + 1) % S.teams.count;
    var l = lists[turnState.team], k = turnState.pi[turnState.team]++;
    return { team: turnState.team, player: l.length ? l[k % l.length] : null };
  };
  H.resetTurns = function (quick) { turnState = { team: -1, pi: [0, 0, 0, 0], quick: !!quick }; };
  H.isQuick = function () { return turnState.quick; };

  /* Shown when a game needs players or teams that aren't set up yet */
  H.needSetup = function (view, g, msg, onQuick) {
    view.innerHTML = H.bar(H.gname(g), H.gdesc(g)) +
      '<div class="card stack center"><p style="margin:0;font-weight:700">' + esc(msg) + '</p>' +
      '<button class="btn" type="button" data-go="players">' + H.svg('users') + esc(t('setUp')) + '</button>' +
      (onQuick ? '<button class="btn alt" type="button" id="quick">' + esc(t('justPlay')) + '</button><p class="hint">' + esc(t('justPlaySub')) + '</p>' : '') + '</div>';
    if (onQuick) $('#quick', view).onclick = function () { H.resetTurns(true); onQuick(); };
  };
  // For team games: start right away if teams are ready, otherwise ask.
  H.withTeams = function (view, g, go) {
    var why = H.teamsReady();
    if (!why) { H.resetTurns(false); go(); return; }
    H.needSetup(view, g, why, go);
  };

  /* Hand-off to the next team's player */
  H.handTurn = function (view, tr, role, note, then, button) {
    if (tr.team < 0 || !tr.player) { then(); return; }
    H.handoff(view, { name: tr.player.name, color: H.teamColor(tr.team), team: H.teamName(tr.team), role: role, note: note, then: then, button: button });
  };

  /* ---------- results after a timed round ----------
     ctx: {g, tr, items:[{x:item, ok:bool, pts:n}], again: fn} */
  H.roundResults = function (view, ctx) {
    var g = ctx.g, tr = ctx.tr;
    function total() { return ctx.items.reduce(function (s, r) { return s + (r.ok ? (r.pts || 1) : 0); }, 0); }
    function draw() {
      var n = total();
      view.innerHTML = H.bar(H.gname(g), tr.team >= 0 ? H.teamName(tr.team) + (tr.player ? ' · ' + tr.player.name : '') : t('results')) +
        '<div class="card center"><div class="sec">' + esc(t('timeUp')) + '</div><div class="bigscore">' + n + '</div><div class="mute">' + esc(t('points')) + '</div></div>' +
        (ctx.items.length ? '<p class="hint">' + esc(t('tapToFix')) + '</p><ul class="reslist">' + ctx.items.map(function (r, i) {
          return '<li class="' + (r.ok ? 'ok' : 'no') + '"><span class="m">' + (r.ok ? '✓' : '–') + '</span><span>' + esc(r.x.w) + (r.pts > 1 && r.ok ? ' <small class="mute">+' + r.pts + '</small>' : '') + '</span><button type="button" data-fix="' + i + '">' + esc(r.ok ? t('pass') : t('got')) + '</button></li>';
        }).join('') + '</ul>' : '') +
        H.learnHTML(ctx.items.map(function (r) { return r.x; })) +
        '<div class="stack" style="margin-top:4px"><button class="btn big" type="button" id="nextTeam">' + esc(tr.team >= 0 ? t('nextTeam') : t('playAgain')) + ' ›</button>' +
        '<button class="btn alt" type="button" id="finish">' + esc(t('finish')) + '</button></div>';
      H.$$('[data-fix]', view).forEach(function (b) { b.onclick = function () { var r = ctx.items[+b.dataset.fix]; r.ok = !r.ok; if (r.ok && !r.pts) r.pts = 1; draw(); }; });
      $('#nextTeam', view).onclick = function () { commit(); ctx.again(); };
      $('#finish', view).onclick = function () { commit(); H.go('done', { g: g }); };
    }
    var committed = false;
    function commit() { if (committed) return; committed = true; if (tr.team >= 0 && total()) H.addPoints(tr.team, total(), g.id); }
    H.onLeave(commit);   // leaving the screen any other way still keeps the points
    draw();
  };

  /* ---------- the timed word round used by Forbidden Words, One Word and Hum ----------
     cfg: {g, deck, role, note, card(item) -> inner HTML, oneWord:bool, slip:bool} */
  H.timedGame = function (view, cfg) {
    var g = cfg.g;
    function next() {
      var tr = H.turn();
      H.handTurn(view, tr, cfg.role, cfg.note, function () { play(tr); });
    }
    function play(tr) {
      var items = [], cur = null, clues = 1, left = S.time;
      H.wake(true);
      view.innerHTML = H.bar(H.gname(g), tr.team >= 0 ? H.teamName(tr.team) + (tr.player ? ' · ' + tr.player.name : '') : '') +
        '<div class="meta"><span class="timer" id="tm">' + S.time + '</span><span class="counter"><span class="g">✓ <b id="ng">0</b></span><span class="p">↷ <b id="np">0</b></span></span></div>' +
        '<div class="bar"><i id="tb" style="width:100%"></i></div>' +
        '<div class="word" id="card"></div>' +
        (cfg.oneWord ? '<div class="row"><button class="btn alt" type="button" id="clue">' + esc(t('clue')) + ' <b id="nc">1</b></button></div>' : '') +
        '<div class="row"><button class="btn alt" type="button" id="pass">' + esc(cfg.slip ? t('slip') : t('pass')) + '</button><button class="btn" type="button" id="got">' + H.svg('check') + esc(t('got')) + '</button></div>' +
        '<button class="link" type="button" id="stop">' + esc(t('endRound')) + '</button>';
      function deal() {
        cur = cfg.deck.next(cur); clues = 1;
        var c = $('#card', view); c.innerHTML = cfg.card(cur);
        if ($('#nc', view)) $('#nc', view).textContent = clues;
      }
      function flash(cls) { var c = $('#card', view); c.classList.remove('flash-good', 'flash-pass'); void c.offsetWidth; c.classList.add(cls); }
      function counts() {
        $('#ng', view).textContent = items.filter(function (r) { return r.ok; }).length;
        $('#np', view).textContent = items.filter(function (r) { return !r.ok; }).length;
      }
      $('#got', view).onclick = function () { items.push({ x: cur, ok: true, pts: cfg.oneWord ? Math.max(1, 4 - clues) : 1 }); H.sfx('good'); H.haptic(25); flash('flash-good'); counts(); deal(); };
      $('#pass', view).onclick = function () { items.push({ x: cur, ok: false }); H.sfx(cfg.slip ? 'bad' : 'pass'); H.haptic(cfg.slip ? [40, 40, 40] : 15); flash('flash-pass'); counts(); deal(); };
      if (cfg.oneWord) $('#clue', view).onclick = function () { clues++; $('#nc', view).textContent = clues; H.haptic(8); };
      var cd;
      function end() { cd.stop(); H.wake(false); H.roundResults(view, { g: g, tr: tr, items: items, again: next }); }
      $('#stop', view).onclick = end;
      deal();
      cd = H.countdown(S.time, function (l) { left = l; $('#tm', view).textContent = l; $('#tb', view).style.width = (l / S.time * 100) + '%'; }, end);
    }
    next();
  };

  /* ---------- Forbidden Words ---------- */
  H.game({
    id: 'forbid', name: 'Forbidden Words', kind: 'words', tag: 'onePhone', team: true,
    desc: 'Describe it without saying the banned words.',
    how: 'The clue-giver holds the phone. A player from another team watches for slips.',
    start: function (view) {
      var g = H.games.forbid, deck = H.deck(H.list('FORBID'));
      H.withTeams(view, g, function () {
        H.timedGame(view, { g: g, deck: deck, slip: false, role: t('clueGiver'), note: t('forbidNote'),
          card: function (x) { return '<div style="width:100%"><div class="k">' + esc(t('describe')) + '</div><div class="big">' + esc(x.w) + '</div><div class="banned">' + x.ban.map(function (b) { return '<span>' + esc(b) + '</span>'; }).join('') + '</div></div>'; } });
      });
    }
  });

  /* ---------- One Word ---------- */
  H.game({
    id: 'one', name: 'One Word', kind: 'words', tag: 'onePhone', team: true,
    desc: 'One-word clues only. Fewer clues, more points.',
    how: 'Give one word at a time. Tap Clue for each one. Got it in 1 clue = 3 points, 2 clues = 2, more = 1.',
    start: function (view) {
      var g = H.games.one, deck = H.deck(H.pool());
      H.withTeams(view, g, function () {
        H.timedGame(view, { g: g, deck: deck, oneWord: true, role: t('clueGiver'), note: t('oneNote'),
          card: function (x) { return '<div><div class="k">' + esc(t('oneWordOnly')) + '</div><div class="big">' + esc(x.w) + '</div></div>'; } });
      });
    }
  });

  /* ---------- Hum That Tune ---------- */
  H.game({
    id: 'hum', name: 'Hum That Tune', kind: 'words', tag: 'onePhone', team: true,
    desc: 'Hum a song with no words. Your team names it.',
    how: 'The hummer holds the phone. No words, no lyrics, just hum.',
    start: function (view) {
      var g = H.games.hum, songs = H.pool({ songs: true });
      var deck = H.deck(songs);
      H.withTeams(view, g, function () {
        H.timedGame(view, { g: g, deck: deck, role: t('hummer'), note: t('humNote'),
          card: function (x) { return '<div><div class="k">' + esc(t('humIt')) + '</div><div class="big">' + esc(x.w) + '</div></div>'; } });
      });
    }
  });
})();
