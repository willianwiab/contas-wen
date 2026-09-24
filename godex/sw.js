/* Guarda só a casca do site (página, ícone, manifesto). Os dados da
   PokéAPI e as figurinhas não passam por aqui: quem guarda elas é o
   próprio navegador, e a lista de Pokémon eu guardo no localStorage. */
const CACHE = 'godex-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone.svg', './icone-limpo.svg'];

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
  if(new URL(ev.request.url).origin !== self.location.origin) return;   // API e figurinhas passam direto
  /* Abrir a página vai direto na fonte, sem passar pelo cache do
     navegador: cinto de segurança contra o "não atualizou o site". */
  const pedido = (ev.request.mode === 'navigate')
    ? fetch(ev.request.url, { cache:'reload', credentials:'same-origin' })
    : fetch(ev.request);
  ev.respondWith(
    pedido
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
