const CACHE_NAME = 'nasu-riot-racing-v9';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/driver/president-neutral-v3.png',
  './assets/driver/president-happy-v4.png',
  './assets/driver/president-angry-v4.png',
  './assets/sponsor/reverth-plate-pixel.png',
  './assets/sponsor/reverth-logo.png',
  './assets/rival/speed-rival-neutral-v2.png',
  './assets/rival/speed-rival-happy-v2.png',
  './assets/rival/speed-rival-hit-v2.png',
  './assets/rival/speed-coupe.png',
  './assets/select/hotrod-three-quarter.png',
  './assets/select/speed-coupe-three-quarter.png',
  './assets/ui/start-flag-women.png',
  './assets/course/nasushiobara-sunset.jpg',
  './assets/car-v2/steer-hard-left.png',
  './assets/car-v2/steer-left.png',
  './assets/car-v2/steer-center.png',
  './assets/car-v2/steer-right.png',
  './assets/car-v2/steer-hard-right.png',
  './assets/car-v2/jump-up.png',
  './assets/car-v2/jump-level.png',
  './assets/car-v2/jump-down.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
