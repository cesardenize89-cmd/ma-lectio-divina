const CACHE='lectio-v20';
const ASSETS=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./logo_mark.svg','./logo_horizontal.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));

self.addEventListener('fetch',e=>{
  if(e.request.url.includes('api.aelf.org')){
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
  caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    const copy=resp.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy));
    return resp;
  }).catch(()=>caches.match('./index.html')))
);
});
