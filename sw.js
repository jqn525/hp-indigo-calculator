const CACHE_NAME = 'indigo-calc-v107';

// Determine hosting environment and set appropriate base path
const isLocalhost = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
const isVercel = self.location.hostname.includes('vercel.app') || self.location.hostname === 'docsol.ca';

// Set appropriate base path
let basePath = '';
if (!isLocalhost && !isVercel) {
  // GitHub Pages or other hosting
  basePath = '/hp-indigo-calculator';
}

const urlsToCache = [
  `${basePath}/`,
  `${basePath}/index.html`,
  `${basePath}/css/styles.css`,
  `${basePath}/js/app.js`,
  `${basePath}/js/cart.js`,
  `${basePath}/js/calculator.js`,
  `${basePath}/js/paperStocks.js`,
  `${basePath}/js/pricingConfig.js`,
  `${basePath}/js/promoConfig.js`,
  `${basePath}/js/promoCalculator.js`,
  `${basePath}/js/supabase.js`,
  `${basePath}/js/auth.js`,
  `${basePath}/js/auth-guard.js`,
  `${basePath}/js/db.js`,
  `${basePath}/js/migrate-data.js`,
  `${basePath}/js/header.js`,
  `${basePath}/js/small-format-filters.js`,
  `${basePath}/js/configurator.js`,
  `${basePath}/js/admin.js`,
  `${basePath}/pages/brochures.html`,
  `${basePath}/pages/postcards.html`,
  `${basePath}/pages/flyers.html`,
  `${basePath}/pages/bookmarks.html`,
  `${basePath}/pages/booklets.html`,
  `${basePath}/pages/small-format.html`,
  `${basePath}/pages/large-format.html`,
  `${basePath}/pages/cart.html`,
  `${basePath}/pages/promo.html`,
  `${basePath}/pages/magnets.html`,
  `${basePath}/pages/stickers.html`,
  `${basePath}/pages/apparel.html`,
  `${basePath}/pages/tote-bags.html`,
  `${basePath}/pages/quotes.html`,
  `${basePath}/pages/admin.html`,
  `${basePath}/pages/templates.html`,
  `${basePath}/login.html`,
  `${basePath}/manifest.json`,
  `${basePath}/fonts/NovemberCondensedFNI-Heavy.otf`,
  `${basePath}/fonts/LavaFNI-Regular.otf`
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
  // Skip caching for navigation requests to avoid redirect issues
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Use network-first strategy for CSS files to ensure fresh styles
  if (event.request.url.includes('.css')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Use cache-first strategy for other resources
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