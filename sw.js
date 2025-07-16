const CACHE_NAME = 'indigo-calc-v25';

// Determine if we're running on localhost or production
const isLocalhost = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Set appropriate base path
const basePath = isLocalhost ? '' : '/hp-indigo-calculator';

const urlsToCache = [
  `${basePath}/`,
  `${basePath}/index.html`,
  `${basePath}/css/styles.css`,
  `${basePath}/js/app.js`,
  `${basePath}/js/cart.js`,
  `${basePath}/js/calculator.js`,
  `${basePath}/js/paperStocks.js`,
  `${basePath}/js/pricingConfig.js`,
  `${basePath}/pages/brochures.html`,
  `${basePath}/pages/postcards.html`,
  `${basePath}/pages/flyers.html`,
  `${basePath}/pages/bookmarks.html`,
  `${basePath}/pages/large-format.html`,
  `${basePath}/pages/cart.html`,
  `${basePath}/manifest.json`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});