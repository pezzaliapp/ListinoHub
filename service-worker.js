// service-worker.js
// ListinoHub — Service Worker
// Versione: bumpare SEMPRE quando cambiano asset
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `listinohub-${CACHE_VERSION}`;

// Asset locali (app shell)
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './style.mobile.cards.v3.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-1024.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

// CDN (cache opportunistica: PapaParse per CSV, SheetJS per Excel)
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

/* =========================
   INSTALL
   ========================= */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // addAll è atomico: se una risorsa fallisce, nessuna viene cacheata.
    // Meglio add() singoli con catch per tollerare asset mancanti.
    await Promise.all(APP_SHELL.map(url =>
      cache.add(url).catch(err => console.warn('[SW] skip', url, err))
    ));
  })());
  self.skipWaiting();
});

/* =========================
   ACTIVATE
   ========================= */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(name => name.startsWith('listinohub-') && name !== CACHE_NAME)
        .map(name => caches.delete(name))
    );
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch(e) {}
    }
    await self.clients.claim();
  })());
});

/* =========================
   FETCH
   ========================= */
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // NAVIGAZIONE / HTML: network-first (prende index aggiornato quando online)
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(networkFirst(req, './index.html'));
    return;
  }

  // CDN: network-first con fallback cache
  if (CDN_ASSETS.some(cdn => req.url.startsWith(cdn))) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Same-origin asset: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Fallback
  event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
});

/* =========================
   STRATEGIE
   ========================= */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  try { cache.put(request, response.clone()); } catch(_) {}
  return response;
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    try { cache.put(request, response.clone()); } catch(_) {}
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fb = await caches.match(fallbackUrl);
      if (fb) return fb;
    }
    throw err;
  }
}

// Permette alla pagina di forzare l'attivazione del nuovo SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
