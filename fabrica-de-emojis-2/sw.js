/* ============================================================
   FÁBRICA DE EMOJIS 2 — service worker

   Deixa o jogo abrir sem internet e virar aplicativo de verdade.
   A estratégia é "rede primeiro, cache depois": quando tem
   internet, o jogo vem sempre na versão mais nova; quando não
   tem, vem a última que ficou guardada. Assim uma atualização
   nunca fica presa no aparelho.

   Ao mudar o jogo, suba a VERSAO: isso apaga o cache velho.
   ============================================================ */
const VERSAO = 'fabrica-emojis-2-v1';
const CACHE = VERSAO;
const ARQUIVOS = [
  './', './index.html', './manifest.webmanifest',
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
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(ev.request, copia)).catch(() => {});
        return r;
      })
      .catch(async () => {
        const exata = await caches.match(ev.request);
        if (exata) return exata;
        const parecida = await caches.match(ev.request, { ignoreSearch: true });
        if (parecida) return parecida;
        if (ev.request.mode === 'navigate') {
          return (await caches.match('./index.html')) || new Response('sem internet', { status: 503 });
        }
        return new Response('sem internet', { status: 503 });
      })
  );
});
