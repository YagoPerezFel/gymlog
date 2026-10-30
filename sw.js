// Service worker de GymLog
// - La app funciona desde su copia en caché (rápida y sin conexión).
// - Las actualizaciones las descarga el botón "Buscar nuevas actualizaciones" (app.js)
//   o este archivo cuando cambia. Los datos del usuario (localStorage) nunca se tocan.
const APP_CACHE = 'gymlog-app';
const IMG_CACHE = 'gymlog-img';
const FILES = ['./', './index.html', './data.js', './medals.js', './app.js', './manifest.json', './favicon.png', './icon-180.png', './icon-192.png', './icon-512.png', './catalog.json'];

// Descarga una copia fresca saltándose cualquier caché intermedia (?t=...)
const fresh = url => fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP_CACHE).then(c => Promise.all(FILES.map(f =>
    fresh(f).then(r => { if (r.ok) return c.put(new URL(f, self.registration.scope).href, r); })
  ))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== APP_CACHE && k !== IMG_CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fotos de ejercicios: caché primero (no cambian)
  if (url.href.startsWith('https://cdn.jsdelivr.net/gh/yuhonas/')) {
    e.respondWith(caches.open(IMG_CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok) c.put(req, r.clone());
      return r;
    }))));
    return;
  }

  // Archivos de la app: caché primero; si no están, red (y se guardan)
  if (url.origin === location.origin) {
    if (url.searchParams.has('t')) return;  // descargas de actualización: directas a la red
    const key = req.mode === 'navigate' ? new URL('./', self.registration.scope).href : url.href;
    e.respondWith(caches.open(APP_CACHE).then(c => c.match(key).then(hit => hit || fetch(req).then(r => {
      if (r.ok && !url.pathname.endsWith('version.json')) c.put(key, r.clone());
      return r;
    }).catch(() => c.match(new URL('./', self.registration.scope).href)))));
    return;
  }

  // Otros (fuente Inter de Google): red primero, caché si no hay conexión
  e.respondWith(fetch(req).then(r => {
    const copy = r.clone();
    caches.open(APP_CACHE).then(c => c.put(req, copy));
    return r;
  }).catch(() => caches.match(req)));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(cs => cs.length ? cs[0].focus() : clients.openWindow('./')));
});
