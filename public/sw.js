var cacheName = 'branch-creator';
var filesToCache = [
  '/assets/styles/fonts.css',
  '/assets/styles/scrollbars.css',
  '/assets/fonts/Roboto-Light.ttf',
  '/assets/fonts/Roboto-Light.woff',
  '/assets/fonts/Roboto-Light.woff2',
  '/assets/fonts/Roboto-Regular.ttf',
  '/assets/fonts/Roboto-Regular.woff',
  '/assets/fonts/Roboto-Regular.woff2'
];

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  console.log(event);
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      return response ? response : fetch(event.request);
    })
  );
});
