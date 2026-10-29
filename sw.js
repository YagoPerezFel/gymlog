// Service worker: guarda la app para usarla sin conexión y gestiona los clics en notificaciones
const CACHE = 'gymlog-v2';
const IMG_CACHE = 'gymlog-img';
const FILES = ['./', './index.html', './app.js', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png', './catalog.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primero red (para recibir actualizaciones); si no hay conexión, caché
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Fotos de ejercicios: primero caché (no cambian), así funcionan sin conexión una vez vistas
  if (e.request.url.startsWith('https://cdn.jsdelivr.net/gh/yuhonas/')) {
    e.respondWith(caches.open(IMG_CACHE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok) c.put(e.request, r.clone());
      return r;
    }))));
    return;
  }
  e.respondWith(fetch(e.request)
    .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(cs => cs.length ? cs[0].focus() : clients.openWindow('./')));
});
