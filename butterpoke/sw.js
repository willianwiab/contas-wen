/* Guarda só a casca do site (página, ícone, manifesto) pra abrir rápido e
   sem internet. Os preços vêm de fora e nunca são guardados: preço velho
   seria pior do que preço nenhum. */
const CACHE = 'butterpoke-v2';   // subiu junto com a cara nova, pra limpar o cache antigo
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone.svg'];

self.addEventListener('install', ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(n => Promise.all(n.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  if(ev.request.method !== 'GET') return;
  if(new URL(ev.request.url).origin !== self.location.origin) return;  // API e imagens passam direto
  ev.respondWith(
    fetch(ev.request)
      .then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(ev.request, c)).catch(() => {}); return r; })
      .catch(async () => {
        const exata = await caches.match(ev.request);
        if(exata) return exata;
        if(ev.request.mode === 'navigate')
          return (await caches.match('./index.html')) || new Response('offline', { status:503 });
        return new Response('offline', { status:503 });
      })
  );
});
