const VERSION='bk-v4';
const CORE=['/','/offline/','/assets/css/site.css','/assets/vendor/alpine.min.js','/assets/vendor/htmx.min.js','/assets/js/alpine-app.js','/assets/js/htmx-config.js','/assets/js/site-core.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(cache=>cache.put(req,c));return r}).catch(()=>caches.match(req).then(r=>r||caches.match('/offline/'))));
    return;
  }
  if(url.pathname.startsWith('/assets/')){
    event.respondWith(
      caches.match(req).then(cached=>{
        const network=fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(cache=>cache.put(req,c));return r}).catch(()=>cached);
        return cached||network;
      })
    );
  }
});
