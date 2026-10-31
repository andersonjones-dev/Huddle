/*
 * HUDDLE — service worker (offline support)
 * ---------------------------------------------------------------
 * IMPORTANT: every time you change any app file and publish it,
 * raise VERSION below (e.g. 1.0.0 -> 1.0.1). That tells phones a
 * new version exists; the app then offers an "Update" button.
 */
var VERSION = '1.2.2';
var CACHE = 'huddle-' + VERSION;
var LIB = 'huddle-lib';     // fonts and the QR code library; kept across versions

var APP_FILES = [
  './',
  './index.html',
  './css/app.css',
  './js/data.js',
  './js/i18n.js',
  './js/core.js',
  './js/buzz.js',
  './js/games/words.js',
  './js/games/act.js',
  './js/games/draw.js',
  './js/games/potato.js',
  './js/games/likely.js',
  './js/games/spin.js',
  './js/games/quiz.js',
  './js/games/match.js',
  './js/games/seat.js',
  './js/app.js',
  './about.js',
  './update.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];
var LIB_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(APP_FILES.map(function (url) { return new Request(url, { cache: 'reload' }); }));
    })
  );
});

// Only Huddle's own old caches are removed (other apps share this website).
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key.indexOf('huddle-') === 0 && key !== CACHE && key !== LIB) return caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Fonts and the QR library: saved the first time, then used offline.
  if (LIB_HOSTS.indexOf(url.hostname) >= 0) {
    event.respondWith(
      caches.open(LIB).then(function (cache) {
        return cache.match(req).then(function (hit) {
          var net = fetch(req).then(function (res) {
            if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
            return res;
          });
          return hit || net;
        });
      })
    );
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Page loads (including shared ?pack= links): the cached app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(function (cached) {
        if (cached) return cached;
        return fetch(req).then(function (res) {
          if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put('./index.html', copy); }); }
          return res;
        });
      }).catch(function () { return caches.match('./index.html'); })
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      });
    })
  );
});
