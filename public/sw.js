// ================================================================
// BizHub Service Worker v2
// Production-grade PWA with offline-first POS support
// ================================================================

const CACHE_VERSION = 'bizhub-v4';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const POS_CACHE = `${CACHE_VERSION}-pos`;

// Static shell — cached on install, served cache-first
const STATIC_ASSETS = [
  '/',
  '/directory',
  '/deals',
  '/dashboard/pos',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// POS-critical routes — always cached aggressively
const POS_ROUTES = [
  '/dashboard/pos',
];

// ----------------------------------------------------------------
// INSTALL — Pre-cache the static shell
// ----------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// ----------------------------------------------------------------
// ACTIVATE — Clean up old caches
// ----------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== POS_CACHE)
            .map((key) => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim()) // Take control of all open tabs
  );
});

// ----------------------------------------------------------------
// FETCH — Multi-strategy routing
// ----------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST for sync, etc.)
  if (request.method !== 'GET') return;

  // Skip chrome-extension, devtools, etc.
  if (!url.protocol.startsWith('http')) return;

  // Skip Supabase API calls — those should always go network-first
  if (url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Skip Next.js HMR / webpack in development
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;

  // --- POS routes: Cache-first with background refresh ---
  if (isPOSRoute(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, POS_CACHE));
    return;
  }

  // --- Static assets (_next/static, images, fonts): Cache-first ---
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // --- API routes: Network-only ---
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkOnly(request));
    return;
  }

  // --- Navigation requests: Stale-while-revalidate ---
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }

  // --- Everything else: Network first with cache fallback ---
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// ----------------------------------------------------------------
// BACKGROUND SYNC — Retry offline POS orders
// ----------------------------------------------------------------
self.addEventListener('sync', (event) => {
  if (event.tag === 'pos-order-sync') {
    console.log('[SW] Background sync: pos-order-sync triggered');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_POS_ORDERS' });
        });
      })
    );
  }
});

// ----------------------------------------------------------------
// PUSH NOTIFICATIONS — Future-ready
// ----------------------------------------------------------------
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'You have a new notification from BizHub',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'BizHub', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus existing tab if open
        for (const client of clients) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        return self.clients.openWindow(targetUrl);
      })
  );
});

// ================================================================
// CACHING STRATEGIES
// ================================================================

/** Cache-first: Return cached version, only network if miss */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(request);
  }
}

/** Network-first: Try network, fall back to cache */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback(request);
  }
}

/** Stale-while-revalidate: Return cache immediately, update in background */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || offlineFallback(request));

  return cached || fetchPromise;
}

/** Network-only: Never cache */
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return offlineFallback(request);
  }
}

/** Offline fallback page */
function offlineFallback(request) {
  if (request.mode === 'navigate') {
    return caches.match('/dashboard/pos') || caches.match('/') || new Response(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BizHub Offline</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:#0D1F16;color:#E0E0E0;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}.card{max-width:420px}.icon{font-size:4rem;margin-bottom:1.5rem}h1{font-size:1.5rem;color:#D4AF37;margin-bottom:.75rem}p{opacity:.7;line-height:1.6;margin-bottom:1.5rem}button{background:#D4AF37;color:#0D1F16;border:none;padding:.75rem 2rem;border-radius:12px;font-weight:700;font-size:1rem;cursor:pointer}</style></head><body><div class="card"><div class="icon">📡</div><h1>You\'re Offline</h1><p>No internet connection detected. Your POS terminal can still process sales — cached orders will sync automatically when you reconnect.</p><button onclick="location.href=\'/dashboard/pos\'">Open POS Terminal</button></div></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  return new Response('Offline', { status: 503 });
}

// ================================================================
// HELPERS
// ================================================================

function isPOSRoute(pathname) {
  return POS_ROUTES.some((route) => pathname.startsWith(route));
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/icon-') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  );
}
