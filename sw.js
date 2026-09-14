const CACHE="titan-god-9-2-smart-event-shock";
const STATIC=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).catch(()=>{}))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.mode==="navigate"||r.destination==="document"){e.respondWith(fetch(r,{cache:"no-store"}).catch(()=>caches.match("./index.html")));return}e.respondWith(fetch(r).then(x=>{if(x&&x.ok){const y=x.clone();caches.open(CACHE).then(c=>c.put(r,y)).catch(()=>{})}return x}).catch(()=>caches.match(r)))})
