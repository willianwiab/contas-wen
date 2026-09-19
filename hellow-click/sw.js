/* Guarda o jogo pra abrir sem internet — um clicker é coisa de abrir
   no ônibus, na fila, onde o sinal não ajuda. Pedido pra fora do site
   passa direto, e um arquivo que falhou nunca vira a página. */
const CACHE = 'hellow-click-v11';
/* sem o ?v= aqui: essa lista já desencontrou duas vezes do número que o
   index.html pede. O jogo.js real entra no cache no primeiro carregamento
   (o fetch guarda o endereço que foi pedido de verdade), e sem internet o
   ignoreSearch lá embaixo acha ele com qualquer versão. */
const ARQUIVOS = ['./', './index.html', './jogo.js', './manifest.webmanifest', './icone.svg'];

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
