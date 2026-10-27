const CACHE='mkkids-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const same=u.origin===location.origin;
  const sdk=u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/');
  if(!same&&!sdk)return;               // قاعدة البيانات وتسجيل الدخول تمر مباشرة
  if(sdk){                              // مكتبات Firebase: من الذاكرة أولاً
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})));
    return;
  }
  e.respondWith(                        // ملفات التطبيق: من الإنترنت أولاً حتى توصل التحديثات
    fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})
      .catch(()=>caches.match(r).then(m=>m||caches.match('./index.html')))
  );
});
