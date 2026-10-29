/*
 * HUDDLE — Hot Potato. A category shows; say one thing in it and pass
 * the phone on. The bomb goes off at a random moment nobody can see.
 * Whoever holds it loses a life. Last one standing wins.
 */
(function () {
  'use strict';
  var H = window.Huddle, S = H.S, t = H.t, esc = H.esc, $ = H.$;
  var LIVES = 3;

  H.game({
    id: 'potato', name: 'Hot Potato', kind: 'party', tag: 'passIt',
    desc: 'Name one, pass it on. Don’t hold it when it blows.',
    how: 'Read the category, say one thing that fits, pass the phone to your left. No repeats.',
    start: function (view) {
      var g = H.games.potato, deck = H.deck(H.list('CATS')), cat = null;
      var named = S.players.length >= 2;
      var lives = {}; S.players.forEach(function (p) { lives[p.id] = LIVES; });
      function alive() { return S.players.filter(function (p) { return lives[p.id] > 0; }); }
      function heart(n) { var s = ''; for (var i = 0; i < LIVES; i++) s += '<span class="' + (i < n ? '' : 'lost') + '">♥</span>'; return s; }

      function ready() {
        view.innerHTML = H.bar(H.gname(g), H.gdesc(g)) +
          '<div class="card center stack"><p style="margin:0">' + esc(t('potatoHow')) + '</p>' +
          (named ? '<div class="pl" style="justify-content:center">' + alive().map(function (p) { return '<span class="pchip"><i style="background:' + p.color + '">' + esc(p.name[0]) + '</i><span>' + esc(p.name) + '</span> <span class="lives">' + heart(lives[p.id]) + '</span></span>'; }).join('') + '</div>' : '<p class="hint">' + esc(t('potatoNoNames')) + '</p>') + '</div>' +
          '<button class="btn big" type="button" id="go">' + esc(t('start')) + '</button>';
        $('#go', view).onclick = round;
      }
      function round() {
        cat = deck.next(cat);
        H.wake(true);
        var fuse = 15000 + Math.random() * 30000, t0 = Date.now(), beat = 0, nextBeat = 0;
        view.innerHTML = H.bar(H.gname(g), '') +
          '<div class="card center"><div class="sec">' + esc(t('category')) + '</div><div class="cat" id="cat">' + esc(cat.w) + '</div></div>' +
          '<div class="potato"><div class="bomb tick" id="bomb"></div></div>' +
          '<p class="hint">' + esc(t('potatoPass')) + '</p>' +
          '<button class="btn alt" type="button" id="newcat">' + esc(t('newCategory')) + '</button>';
        $('#newcat', view).onclick = function () { cat = deck.next(cat); $('#cat', view).textContent = cat.w; H.haptic(10); };
        // the tick speeds up as the fuse burns, without telling anyone when it ends
        H.every(function () {
          var el = Date.now() - t0;
          if (el >= fuse) { boom(); return; }
          if (el >= nextBeat) {
            var k = el / fuse, gap = 900 - 700 * k;
            nextBeat = el + gap; beat++;
            H.sfx('tick', .3 + k * .5); if (k > .6) H.haptic(8);
            var b = $('#bomb', view); if (b) b.classList.toggle('fast', k > .6);
          }
        }, 50);
      }
      function boom() {
        H.stopTimers(); H.wake(false);
        H.sfx('boom'); H.haptic([200, 60, 300]);
        var pot = $('.potato', view); pot.insertAdjacentHTML('beforeend', '<div class="boom">BOOM!</div>');
        $('#bomb', view).classList.remove('tick');
        $('#newcat', view).remove();
        var hint = $('.hint', view);
        if (!named) { hint.textContent = t('potatoHolder'); view.insertAdjacentHTML('beforeend', '<button class="btn big" type="button" id="again">' + esc(t('playAgain')) + '</button>' + H.endButtons('potato')); $('#again', view).onclick = round; return; }
        hint.textContent = t('whoHeld');
        view.insertAdjacentHTML('beforeend', '<div class="vote">' + alive().map(function (p) { return '<button type="button" data-p="' + p.id + '"><i style="background:' + p.color + '">' + esc(p.name[0]) + '</i><span>' + esc(p.name) + '</span></button>'; }).join('') + '</div>');
        H.$$('[data-p]', view).forEach(function (b) { b.onclick = function () { lose(b.dataset.p); }; });
      }
      function lose(pid) {
        lives[pid]--;
        var p = S.players.filter(function (x) { return x.id === pid; })[0];
        var left = alive();
        if (left.length <= 1) return win(left[0]);
        H.toast(p.name + (lives[pid] > 0 ? ' · ' + lives[pid] + ' ♥' : ' · ' + t('out')));
        ready();
      }
      function win(p) {
        H.sfx('win'); H.confetti();
        var team = p ? H.teamOf(p.id) : -1;
        if (p && S.players.length >= 2 && !H.teamsReady()) H.addPoints(team, 3, 'potato');
        view.innerHTML = H.bar(H.gname(g), '') +
          '<div class="card center stack"><div class="sec">' + esc(t('winner')) + '</div><div class="big">' + esc(p ? p.name : '') + '</div>' +
          (p && !H.teamsReady() ? '<p class="mute" style="margin:0">+3 ' + esc(t('points')) + ' · ' + esc(H.teamName(team)) + '</p>' : '') + '</div>' + H.endButtons('potato');
      }
      ready();
    }
  });
})();
