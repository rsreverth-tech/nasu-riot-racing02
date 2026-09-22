const CACHE_NAME = 'hot-rod-tochigi-v12';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/sponsor/reverth-plate-pixel.png',
  './assets/sponsor/reverth-logo.png',
  './assets/rival/speed-rival-neutral-v2.png',
  './assets/rival/speed-rival-happy-v2.png',
  './assets/rival/speed-rival-hit-v2.png',
  './assets/rival/speed-coupe.png',
  './assets/driver/woman/woman-neutral-v2.png',
  './assets/driver/woman/woman-happy-v2.png',
  './assets/driver/woman/woman-hit-v2.png',
  './assets/select/woman-sedan-three-quarter.png',
  './assets/car-woman/rear-left.png',
  './assets/car-woman/rear-right.png',
  './assets/car-woman/front.png',
  './assets/car-woman/side-left.png',
  './assets/car-woman/side-right.png',
  './assets/car-woman/jump-underside.png',
  './assets/select/speed-coupe-three-quarter.png',
  './assets/ui/start-flag-women.png',
  './assets/ui/start-flag-women-frame2.png',
  './assets/course/nasushiobara-sunset.jpg',
  './assets/course/utsunomiya-sunset.jpg',
  './assets/driver/dog/dog-neutral.png',
  './assets/driver/dog/dog-happy.png',
  './assets/driver/dog/dog-hit.png',
  './assets/select/dog-offroad-three-quarter.png',
  './assets/car-dog/rear.png',
  './assets/car-dog/rear-right.png',
  './assets/car-dog/front.png',
  './assets/car-dog/side-left.png',
  './assets/car-dog/side-right.png',
  './assets/car-dog/jump-underside.png',
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
