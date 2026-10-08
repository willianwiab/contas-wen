/* Guarda o site pra abrir sem internet. Lista de compras é coisa de olhar
   dentro do mercado, onde o sinal some; a página tem que abrir do mesmo
   jeito, com os itens que já estavam no aparelho.
   O que vai pra nuvem (firebaseio.com) passa direto, sem cache: se não
   tiver internet a própria página guarda na fila e manda depois. */
const CACHE = 'compras-v1';
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
  if(new URL(ev.request.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(ev.request)
      .then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(ev.request, c)).catch(() => {}); return r; })
      .catch(async () => {
        const exata = await caches.match(ev.request);
        if(exata) return exata;
        const parecida = await caches.match(ev.request, { ignoreSearch:true });
        if(parecida) return parecida;
        if(ev.request.mode === 'navigate') return (await caches.match('./index.html')) ||
          new Response('offline', { status:503 });
        return new Response('offline', { status:503 });
      })
  );
});
