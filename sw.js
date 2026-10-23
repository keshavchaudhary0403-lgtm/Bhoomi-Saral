// Bhoomi Saral service worker: keeps the app and visited map data available offline.
// Map tiles are not cached here (OpenStreetMap tile policy).
const CACHE = 'bhoomi-saral-v2';
const SHELL = ['./', 'index.html', 'assets/styles.css', 'assets/content.js', 'assets/app.js',
  'data/districts.json', 'manifest.webmanifest', 'icons/favicon.svg', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const own = url.origin === self.location.origin;
  const cdn = url.hostname === 'cdnjs.cloudflare.com' || url.hostname.endsWith('gstatic.com') || url.hostname === 'fonts.googleapis.com';
  if (!own && !cdn) return;
  // stale-while-revalidate
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(e.request);
    const net = fetch(e.request).then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
