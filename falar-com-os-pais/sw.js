/* Service worker simples: tenta a internet primeiro e, se não tiver,
   usa a cópia guardada. Assim o site abre offline e sempre atualiza. */
const CACHE = 'fala-familia-v26';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone.svg',
  './app.js?v=26', './ajuda.js?v=26', './jogo.js?v=26', './trancar.js?v=26', './mais.js?v=26', './casa.js?v=26', './enfeites.js?v=26', './nuvem.js?v=26', './sinais.js?v=26', './chamada.js?v=26', './publico.js?v=26', './audio.js?v=26', './video.js?v=26', './familia.js?v=26', './extras.js?v=26', './ligacao.js?v=26', './avisos.js?v=26', './ia.js?v=26', './recado.js?v=26',
  './icone-192.png', './icone-512.png', './icone-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  if(ev.request.method !== 'GET') return;
  /* Só cuida dos arquivos do próprio site. Pedido pra fora — o banco da
     família, o cérebro do Ajudante — passa direto: se desse errado aqui,
     a resposta guardada (o index.html) voltava no lugar do JSON e o site
     parecia quebrado sem motivo. */
  if(new URL(ev.request.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(ev.request)
      .then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(ev.request, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(ev.request).then(r => r || caches.match('./index.html')))
  );
});
