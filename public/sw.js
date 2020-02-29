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
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches
      .match(event.request, { ignoreSearch: true })
      .then(response => (response ? response : fetch(event.request)))
  );
});
