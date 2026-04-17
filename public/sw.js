// Service Worker — Jessica Dezidério PWA v2
// Estratégia: Cache-first para assets, Network-first para navegação
// Compatível com Chrome, Safari (iOS), Samsung Internet e Firefox

const CACHE_NAME = 'jd-cache-v2';
const SHELL_URLS = ['/', '/index.html', '/manifest.json'];

// ── Install ───────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: limpar versões antigas ─────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorar não-GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca cachear: Supabase, fontes externas, analytics
  const bypassHosts = [
    'supabase.co', 'googleapis.com', 'googleusercontent.com',
    'fonts.gstatic.com', 'lh3.googleusercontent.com'
  ];
  if (bypassHosts.some((h) => url.hostname.includes(h))) return;

  // Assets estáticos (JS, CSS, imagens, fontes locais) → Cache-first
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ico|json)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Navegação HTML → Network-first com fallback para shell
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) =>
          cached || caches.match('/index.html')
        )
      )
  );
});
