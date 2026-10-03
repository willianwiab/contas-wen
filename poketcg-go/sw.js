/* Guarda o jogo pra abrir sem internet.

   As fotos das cartas NÃO entram aqui: elas são do servidor da
   pokemontcg.io, e copiar a arte deles pro nosso cache seria
   guardar desenho que não é nosso. Sem internet o jogo abre e
   roda; as cartas é que aparecem com o verso. */
const CACHE = 'poketcg-go-v6';
const MEUS = ['./', './index.html', './cartas.js', './mundo.js', './jogo.js',
  './manifest.webmanifest', './icone.svg', './icone-192.png', './icone-512.png',
  './icone-180.png', './icone-maskable-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(MEUS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(ns => Promise.all(ns.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', ev => {
  if(ev.request.method !== 'GET') return;
  const url = new URL(ev.request.url);
  /* só mexo no que é meu: a API e as fotos passam direto */
  if(url.origin !== location.origin) return;
  ev.respondWith(
    fetch(ev.request)
      .then(r => {
        if(r && r.ok) caches.open(CACHE).then(c => c.put(ev.request, r.clone()));
        return r;
      })
      .catch(() => caches.match(ev.request, { ignoreSearch:true })
        .then(r => r || caches.match('./index.html')))
  );
});
