const CACHE_NAME = 'siya9a-learner-b-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  'master_catalog_1000.json',
  'https://fonts.googleapis.com/css2?family=Caironwght@400;600;700;900&family=DMSans:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Some assets failed to cache:', err);
        return Promise.allSettled(
          STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  if (url.hostname === 'conduire.ma' || url.hostname === 'morortest.com') {
    event.respondWith(
      fetch(event.request).then((b) => {
        if (c.ok) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, c)); }
        return r;
      }).catch(() => caches.match(event.request).then(c => c || new Response('Offline', { status: 503 })))
    );
    return;
  }

  if (url.pathname.includes('master_catalog')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fp = fetch(event.request).then((r) => {
          if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, c)); }
          return r;
        }).catch(() => cached);
        return cached || fp;
      })
    );
    return;
  }

  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(c => {
        if (c) return c;
        return fetch(event.request).then(r => {
          if (r.ok) { const cl = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, cl)); }
          return r;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(c => {
      if (c) return c;
      return fetch(event.request).then(r => {
        if (r.ok && url.origin === self.location.origin) {
          const cl = r.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cl));
        }
        return r;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('/index.html');
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
