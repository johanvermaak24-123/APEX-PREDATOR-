const CACHE="apex-scalp-god-6.5-opportunity-duel-fortress";
const STATIC=["./","./index.html","./manifest.webmanifest","./apple-touch-icon.png","./icon-192.png","./icon-512.png"];
self.addEventListener("message",e=>{if(e.data&&e.data.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;
 if(r.mode==="navigate"||r.destination==="document"){
  e.respondWith(fetch(r,{cache:"no-store"}).then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put("./index.html",copy)).catch(()=>{})}return res}).catch(()=>caches.match("./index.html")));
  return;
 }
 const url=new URL(r.url);
 if(url.origin===self.location.origin){
  e.respondWith(fetch(r,{cache:"no-cache"}).then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{})}return res}).catch(()=>caches.match(r)));
 }
});
