// Service Worker for SFU Inventory Management
// Version: v1.0.0

const CACHE_NAME = 'sfu-inventory-v2';

// Files to cache
const urlsToCache = [
  '/inventory/',
  '/inventory/index.html',
  '/inventory/request.html',
  '/inventory/search.html',
  '/inventory/pending.html',
  '/inventory/admin.html',
  '/inventory/receive.html',
  '/inventory/css/styles.css',
  '/inventory/js/app.js',
  '/inventory/js/auth.js',
  '/inventory/js/auth-guard.js',
  '/inventory/js/supabase.js',
  '/inventory/js/inventoryStructure.js',
  '/inventory/manifest.json',
  // External CDN resources
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[INSTALL] Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[CACHE] Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SUCCESS] Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ERROR] Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ACTIVATE] Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[CLEANUP] Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SUCCESS] Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Skip Supabase API calls - always use network
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('[CACHED] Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        // Otherwise fetch from network
        console.log('[NETWORK] Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Add to cache for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('[ERROR] Service Worker: Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/inventory/index.html');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline requests (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[SYNC] Service Worker: Background sync triggered');
  
  if (event.tag === 'inventory-request-sync') {
    event.waitUntil(syncInventoryRequests());
  }
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('[PUSH] Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New inventory notification',
    icon: '/inventory/icons/icon-192.png',
    badge: '/inventory/icons/icon-192.png',
    tag: 'inventory-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SFU Inventory', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[CLICK] Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/inventory/')
    );
  }
});

// Helper function for syncing offline requests
async function syncInventoryRequests() {
  try {
    // This would handle uploading any requests that were made while offline
    console.log('[SYNC] Service Worker: Syncing offline inventory requests');
    
    // Implementation would go here to:
    // 1. Get offline requests from IndexedDB
    // 2. Upload them to Supabase
    // 3. Clear from local storage
    
  } catch (error) {
    console.error('[ERROR] Service Worker: Sync failed:', error);
  }
}

// Message handling for communication with main app
self.addEventListener('message', (event) => {
  console.log('[MESSAGE] Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CACHE_URLS':
        event.waitUntil(
          caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(event.data.urls);
          })
        );
        break;
    }
  }
});

console.log('[READY] Service Worker: Script loaded successfully');