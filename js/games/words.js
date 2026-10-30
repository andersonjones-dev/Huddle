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
    turnState.team = (turnState.team + 1) % Math.max(1, H.sideCount());
    var l = lists[turnState.team], k = turnState.pi[turnState.team]++;
    return { team: turnState.team, player: l.length ? l[k % l.length] : null };
  };
  // "Lions · Anderson" in Teams, just "Anderson" in Individual
  H.turnLabel = function (tr) { return H.solo() || !tr.player ? (tr.player ? tr.player.name : H.teamName(tr.team)) : H.teamName(tr.team) + ' · ' + tr.player.name; };
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
  // gid: show the round-length chips for this game on the hand-off screen
  H.handTurn = function (view, tr, role, note, then, button, gid) {
    if (tr.team < 0 || !tr.player) {
      if (!gid) { then(); return; }
      // Just play (no names): a short "ready" screen so the round length can still be chosen
      var g = H.games[gid];
      view.innerHTML = H.bar(H.gname(g), H.gdesc(g)) + '<div class="card stack">' + H.pickerHTML('time', gid) + '</div>' +
        '<button class="btn big" type="button" id="hoGo">' + esc(button || t('start')) + '</button>';
      H.bindPicker(view, gid);
      $('#hoGo', view).onclick = function () { H.audioOn(); then(); };
      return;
    }
    H.handoff(view, { name: tr.player.name, color: H.teamColor(tr.team), team: H.solo() ? '' : H.teamName(tr.team), role: role, note: note, then: then, button: button, pick: gid ? 'time' : '', gid: gid });
  };

  /* ---------- results after a timed round ----------
     ctx: {g, tr, items:[{x:item, ok:bool, pts:n}], again: fn} */
  H.roundResults = function (view, ctx) {
    var g = ctx.g, tr = ctx.tr;
    function total() { return ctx.items.reduce(function (s, r) { return s + (r.ok ? (r.pts || 1) : 0); }, 0); }
    function draw() {
      var n = total();
      view.innerHTML = H.bar(H.gname(g), tr.team >= 0 ? H.turnLabel(tr) : t('results')) +
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
      H.handTurn(view, tr, cfg.role, cfg.note, function () { play(tr); }, null, g.id);
    }
    function play(tr) {
      var items = [], cur = null, clues = 1, T = H.roundTime(g.id), left = T;
      H.wake(true);
      view.innerHTML = H.bar(H.gname(g), tr.team >= 0 ? H.turnLabel(tr) : '') +
        '<div class="meta"><span class="timer" id="tm">' + H.fmt(T) + '</span><span class="counter"><span class="g">✓ <b id="ng">0</b></span><span class="p">↷ <b id="np">0</b></span></span></div>' +
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
      cd = H.countdown(T, function (l) { left = l; $('#tm', view).textContent = H.fmt(l); $('#tb', view).style.width = (l / T * 100) + '%'; }, end);
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

  /* ---------- One Word ----------
     A team game. One clue-giver from each team sees the secret word.
     Teams take turns: that team's clue-giver says ONE word and their team guesses.
     Wrong guess: the turn passes to the next team, with a new one-word clue.
     Only the team that guesses it wins the word: 5 points on the first clue, then 4, 3, 2, 1. */
  function fill(str, o) { return String(str).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  H.game({
    id: 'one', name: 'One Word', kind: 'words', tag: 'onePhone', team: true,
    desc: 'Teams take turns giving one-word clues. Only one team wins each word.',
    how: 'One clue-giver from each team sees the word. Teams take turns: one word as a clue, that team guesses. Wrong, and it passes to the next team.',
    start: function (view) {
      var g = H.games.one, deck = H.deck(H.pool());
      if (H.solo()) {   // needs teams: a clue-giver and guessers on each side
        view.innerHTML = H.bar(H.gname(g), H.gdesc(g)) + '<div class="card stack center"><p style="margin:0;font-weight:700">' + esc(t('oneTeamOnly')) + '</p>' +
          '<button class="btn" type="button" data-go="players">' + H.svg('users') + esc(t('setUp')) + '</button></div>';
        return;
      }
      var why = H.teamsReady();
      if (why) { H.needSetup(view, g, why); return; }
      var lists = H.teamLists(), nT = lists.length, giverIx = lists.map(function () { return 0; });
      var wordNo = 0, starter = -1, cur = null, limit = H.playCount('one');

      function nextWord() {
        if (limit && wordNo >= limit) { H.go('done', { g: g }); return; }
        wordNo++; starter = (starter + 1) % nT; cur = deck.next(cur);
        var givers = lists.map(function (l, i) { return l[giverIx[i] % l.length]; });
        giverIx = giverIx.map(function (v) { return v + 1; });
        // 1. call the clue-givers over
        view.innerHTML = H.bar(H.gname(g), t('wordN') + ' ' + wordNo + (limit ? ' / ' + limit : '')) +
          '<div class="card stack center"><div class="sec" style="margin:0 auto">' + esc(t('clueGivers')) + '</div><div class="pl" style="justify-content:center">' +
          givers.map(function (p, i) { return '<span class="pchip" style="border-color:' + H.teamColor(i) + '"><i style="background:' + H.teamColor(i) + '">' + esc(p.name[0].toUpperCase()) + '</i><span>' + esc(p.name) + ' · ' + esc(H.teamName(i)) + '</span></span>'; }).join('') +
          '</div><p class="ho-warn" style="margin:4px auto 0">' + esc(t('onlyGiversLook')) + '</p></div>' +
          (wordNo === 1 ? '<div class="card">' + H.pickerHTML('count', 'one') + '</div>' : '') +
          '<button class="btn big" type="button" id="show">' + esc(t('showWord')) + '</button>';
        if (wordNo === 1) H.bindPicker(view, 'one');
        $('#show', view).onclick = function () { if (wordNo === 1) limit = H.playCount('one'); H.audioOn(); H.haptic(15); reveal(givers); };
      }
      // 2. the clue-givers see the word, then hide it
      function reveal(givers) {
        view.innerHTML = H.bar(H.gname(g), t('cluesOnly')) +
          '<div class="word"><div><div class="k">' + esc(t('secretWord')) + '</div><div class="big">' + esc(cur.w) + '</div></div></div>' +
          '<button class="btn big" type="button" id="hide">' + esc(t('hideStart')) + '</button>';
        $('#hide', view).onclick = function () { H.haptic(10); turn(givers, starter, 1); };
      }
      // 3. one team's turn: one clue, then they guess
      function turn(givers, team, clue) {
        var pts = Math.max(1, 6 - clue), nextTeam = (team + 1) % nT;
        view.innerHTML = H.bar(H.gname(g), fill(t('clueN'), { n: clue }) + ' · ' + fill(t('worth'), { n: pts })) +
          '<div class="card center stack" style="border-color:' + H.teamColor(team) + ';border-width:4px"><div class="sec" style="margin:0 auto;background:' + H.teamColor(team) + ';color:#fff;border-color:' + H.teamColor(team) + '">' + esc(fill(t('teamTurn'), { team: H.teamName(team) })) + '</div>' +
          '<div class="prompt">' + esc(fill(t('sayOneWord'), { name: givers[team].name })) + '</div><p class="mute" style="margin:0">' + esc(fill(t('teamGuesses'), { team: H.teamName(team) })) + '</p></div>' +
          '<button class="btn b2 sm peek" type="button" id="peek" style="align-self:center">' + esc(t('holdToPeek')) + '</button>' +
          '<button class="btn big" type="button" id="got">' + H.svg('check') + esc(fill(t('teamGotIt'), { team: H.teamName(team) })) + '</button>' +
          '<button class="btn alt" type="button" id="miss">' + esc(fill(t('passTo'), { team: H.teamName(nextTeam) })) + '</button>' +
          '<button class="link" type="button" id="skip">' + esc(t('nobodyWord')) + '</button>';
        var pk = $('#peek', view);
        pk.addEventListener('pointerdown', function (e) { e.preventDefault(); pk.textContent = cur.w; H.haptic(8); });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { pk.addEventListener(n, function () { pk.textContent = t('holdToPeek'); }); });
        pk.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        $('#got', view).onclick = function () { H.addPoints(team, pts, 'one'); H.sfx('win'); H.haptic([30, 30, 60]); result(team, pts, clue); };
        $('#miss', view).onclick = function () { H.sfx('pass'); H.haptic(15); turn(givers, nextTeam, clue + 1); };
        $('#skip', view).onclick = function () { result(-1, 0, clue); };
      }
      // 4. who won the word
      function result(team, pts, clues) {
        view.innerHTML = H.bar(H.gname(g), t('wordN') + ' ' + wordNo + (limit ? ' / ' + limit : '')) +
          '<div class="card center stack"><div class="sec" style="margin:0 auto">' + esc(t('theWordWas')) + '</div><div class="big">' + esc(cur.w) + '</div>' +
          (team >= 0 ? '<p style="margin:0;font-weight:800;color:' + H.teamColor(team) + '">' + esc(fill(t('wonWord'), { team: H.teamName(team), n: pts, c: clues })) + '</p>' : '<p class="mute" style="margin:0">' + esc(t('nobodyGot')) + '</p>') + '</div>' +
          H.learnHTML([cur]) +
          '<button class="btn big" type="button" id="nx">' + esc(limit && wordNo >= limit ? t('finish') : t('nextWord')) + ' ›</button>' +
          (limit && wordNo >= limit ? '' : '<button class="link" type="button" id="fin">' + esc(t('finish')) + '</button>');
        if (team >= 0) H.confetti();
        $('#nx', view).onclick = nextWord;
        var f = $('#fin', view); if (f) f.onclick = function () { H.go('done', { g: g }); };
      }
      nextWord();
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
