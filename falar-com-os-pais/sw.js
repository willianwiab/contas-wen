/* Service worker simples: tenta a internet primeiro e, se não tiver,
   usa a cópia guardada. Assim o site abre offline e sempre atualiza. */
const CACHE = 'fala-familia-v25';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone.svg',
  './app.js?v=25', './ajuda.js?v=25', './jogo.js?v=25', './trancar.js?v=25', './mais.js?v=25', './casa.js?v=25', './enfeites.js?v=25', './nuvem.js?v=25', './sinais.js?v=25', './chamada.js?v=25', './publico.js?v=25', './audio.js?v=25', './video.js?v=25', './familia.js?v=25', './extras.js?v=25', './ligacao.js?v=25', './avisos.js?v=25', './ia.js?v=25',
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
