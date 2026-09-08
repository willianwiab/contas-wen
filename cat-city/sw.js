/* ============================================================
   CAT CITY — service worker
   Rede primeiro, cache depois: com internet vem sempre a versão
   nova; sem internet, vem a última que ficou guardada.
   Ao mudar o jogo, suba a VERSAO.
   ============================================================ */
const VERSAO = 'cat-city-v1';
const CACHE = VERSAO;
const ARQUIVOS = [
  './', './index.html', './style.css', './manifest.webmanifest',
  './js/main.js', './js/sprites.js', './js/formas.js', './js/city.js', './js/player.js',
  './js/cats.js', './js/physics.js', './js/camera.js', './js/events.js', './js/ui.js',
  './js/audio.js', './js/input.js',
  './icone.svg', './icone-192.png', './icone-512.png', './icone-180.png', './icone-mascara.png',
];
self.addEventListener('install', ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  if (new URL(ev.request.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(ev.request)
      .then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(ev.request, c)).catch(() => {}); return r; })
      .catch(async () => {
        const exata = await caches.match(ev.request);
        if (exata) return exata;
        const parecida = await caches.match(ev.request, { ignoreSearch: true });
        if (parecida) return parecida;
        if (ev.request.mode === 'navigate') return (await caches.match('./index.html')) || new Response('sem internet', { status: 503 });
        return new Response('sem internet', { status: 503 });
      })
  );
});
