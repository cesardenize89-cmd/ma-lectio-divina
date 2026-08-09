const CACHE='lectio-v17';
const ASSETS=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./assets/logo_mark.svg','./assets/logo_horizontal.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
  const copy=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return resp;
}).catch(()=>caches.match('./index.html')))));
