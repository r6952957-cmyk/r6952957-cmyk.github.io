var C='servihouse-p1';
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}));self.clients.claim()});
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET'||r.headers.has('range')||/\.mp4($|\?)/.test(r.url))return;
e.respondWith(fetch(r).then(function(s){if(s.ok&&s.type==='basic'){var cp=s.clone();caches.open(C).then(function(c){c.put(r,cp)})}return s}).catch(function(){return caches.match(r).then(function(m){return m||caches.match('/')})}))});
